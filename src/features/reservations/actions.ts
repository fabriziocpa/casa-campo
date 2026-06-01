"use server";

import { redirect } from "next/navigation";
import { eachDayOfInterval, format, parseISO, subDays } from "date-fns";
import { reservationSchema, type ReservationInput } from "./schemas";
import {
  ensurePropertyInDb,
  getPropertyById,
} from "@/features/properties/queries";
import {
  getActiveModalitiesByProperty,
  getSeasonalOverridesByProperty,
} from "@/features/pricing/queries";
import { getBlockedDatesByProperty } from "@/features/blocked-dates/queries";
import { getSettings } from "@/features/content/queries";
import { resolveStay } from "@/features/pricing/resolveStay";
import { send, adminNotifyEmail } from "@/lib/email";
import { whatsappUrl } from "@/lib/whatsapp";
import { formatPEN } from "@/lib/money";
import { db } from "@/db";
import { reservations, blockedDates } from "@/db/schema";
import ReservationReceivedUser from "@/emails/ReservationReceivedUser";
import ReservationReceivedAdmin from "@/emails/ReservationReceivedAdmin";

export type SubmitReservationState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<Record<keyof ReservationInput, string>>;
};

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: unknown }).code === "23505"
  );
}

function isFkViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: unknown }).code === "23503"
  );
}

export async function submitReservation(
  _prev: SubmitReservationState,
  formData: FormData,
): Promise<SubmitReservationState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = reservationSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof ReservationInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof ReservationInput | undefined;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    console.error("[reservation:parse] payload rejected:", {
      raw,
      issues: parsed.error.issues,
    });
    const firstField = Object.keys(fieldErrors)[0];
    const firstMsg = firstField ? fieldErrors[firstField as keyof typeof fieldErrors] : undefined;
    return {
      ok: false,
      message: firstField
        ? `${firstField}: ${firstMsg}`
        : "Revisa los campos marcados.",
      fieldErrors,
    };
  }

  const data = parsed.data;

  // Honeypot — silently drop if filled (bot signature)
  if (data.website) {
    return { ok: false, message: "Solicitud rechazada." };
  }

  const property = await getPropertyById(data.propertyId);
  if (!property || !property.active) {
    return { ok: false, message: "Propiedad no disponible." };
  }

  const [modalities, overrides, blockedRows] = await Promise.all([
    getActiveModalitiesByProperty(property.id),
    getSeasonalOverridesByProperty(property.id),
    getBlockedDatesByProperty(property.id, data.checkIn),
  ]);

  // Re-run pricing on server (authoritative)
  const stay = resolveStay({
    property,
    checkIn: parseISO(data.checkIn),
    checkOut: parseISO(data.checkOut),
    guests: data.guests,
    modalities,
    overrides,
  });

  if (stay.errors.length > 0) {
    return {
      ok: false,
      message: stay.errors.join(" "),
    };
  }

  // Build occupied-nights list (check_in inclusive, check_out exclusive)
  const checkInDate = parseISO(data.checkIn);
  const checkOutDate = parseISO(data.checkOut);
  const nightDates = eachDayOfInterval({
    start: checkInDate,
    end: subDays(checkOutDate, 1),
  }).map((d) => format(d, "yyyy-MM-dd"));

  // Pre-flight conflict check against existing blocks (best-effort UX hint;
  // DB unique index is the actual source of truth via the transaction below).
  const blockedSet = new Set(blockedRows.map((b) => b.date));
  const conflicts = nightDates.filter((d) => blockedSet.has(d));
  if (conflicts.length > 0) {
    return {
      ok: false,
      message: `Las fechas ${conflicts.join(", ")} ya no están disponibles.`,
    };
  }

  // Lazy-seed property row (mock UUID -> live DB) so the FK from reservations
  // and blocked_dates resolves on the first ever submit. Idempotent.
  await ensurePropertyInDb(property.id);

  // Persist reservation + blocked_dates atomically.
  // - blocked_dates inserts WITHOUT onConflict: a race (concurrent booking) causes
  //   a unique-index violation that rolls back the transaction.
  let reservationId: string;
  try {
    reservationId = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(reservations)
        .values({
          propertyId: property.id,
          modalityId: stay.modality.id,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          nights: stay.nights,
          guests: data.guests,
          capacityTier: stay.modality.capacityTier ?? null,
          docType: data.docType,
          docNumber: data.docNumber,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          message: data.message || null,
          consent: data.consent,
          priceBreakdown: {
            modalityId: stay.modality.id,
            modalityName: stay.modality.name,
            modalityKind: stay.modality.kind,
            breakdown: stay.breakdown,
            subtotalCents: stay.subtotalCents,
            extraPersonsCents: stay.extraPersonsCents,
          },
          totalCents: stay.totalCents,
          currency: "PEN",
          status: "pending",
        })
        .returning({ id: reservations.id });

      await tx.insert(blockedDates).values(
        nightDates.map((date) => ({
          propertyId: property.id,
          date,
          reason: "reservation" as const,
          reservationId: row.id,
        })),
      );

      return row.id;
    });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return {
        ok: false,
        message:
          "Alguien reservó esas fechas mientras completabas el formulario. Elige otras fechas.",
      };
    }
    if (isFkViolation(err)) {
      console.error("[reservation:persist] FK violation:", err);
      return {
        ok: false,
        message:
          "La propiedad no está disponible en este momento. Contáctanos por WhatsApp.",
      };
    }
    console.error("[reservation:persist]", err);
    return {
      ok: false,
      message:
        "No pudimos registrar tu reserva. Intenta nuevamente o contáctanos por WhatsApp.",
    };
  }

  const settings = await getSettings();
  const totalPEN = formatPEN(stay.totalCents);
  const waHref = whatsappUrl(
    settings.whatsapp,
    `Hola CasaCampo, soy ${data.firstName}, sobre mi solicitud en ${property.name}.`,
  );
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // Email sends are non-blocking-of-success: reservation is already persisted.
  await Promise.allSettled([
    send({
      to: data.email,
      subject: `Recibimos tu solicitud en ${property.name}`,
      react: ReservationReceivedUser({
        firstName: data.firstName,
        propertyName: property.name,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        guests: data.guests,
        totalPEN,
        whatsappUrl: waHref,
        // Cabaña unlocks only for groups over 12 (the 16-person tier).
        includesCabana: (stay.modality.capacityTier ?? 0) > 12,
      }),
    }),
    send({
      to: adminNotifyEmail(settings.adminEmail),
      subject: `Nueva reserva: ${property.shortName} · ${data.firstName} ${data.lastName}`,
      react: ReservationReceivedAdmin({
        reservationId,
        propertyName: property.name,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        docType: data.docType,
        docNumber: data.docNumber,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        guests: data.guests,
        totalPEN,
        message: data.message ?? null,
        adminUrl: `${siteUrl}/admin/reservas`,
      }),
    }),
  ]);

  redirect(`/${property.slug}/reserva/exito`);
}
