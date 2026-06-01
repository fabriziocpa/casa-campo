"use server";

import { redirect } from "next/navigation";
import {
  eventQuoteSchema,
  type EventQuoteInput,
} from "./schemas";
import {
  ensurePropertyInDb,
  getPropertyById,
} from "@/features/properties/queries";
import { getEventPackagesByProperty } from "@/features/event-packages/queries";
import { getSettings } from "@/features/content/queries";
import { send, adminNotifyEmail } from "@/lib/email";
import { whatsappUrl } from "@/lib/whatsapp";
import { db } from "@/db";
import { eventQuotes } from "@/db/schema";
import EventQuoteReceivedUser from "@/emails/EventQuoteReceivedUser";
import EventQuoteReceivedAdmin from "@/emails/EventQuoteReceivedAdmin";

export type SubmitEventQuoteState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<Record<keyof EventQuoteInput, string>>;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function submitEventQuote(
  _prev: SubmitEventQuoteState,
  formData: FormData,
): Promise<SubmitEventQuoteState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = eventQuoteSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof EventQuoteInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof EventQuoteInput | undefined;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      message: "Revisa los campos marcados.",
      fieldErrors,
    };
  }

  const data = parsed.data;

  if (data.website) {
    return { ok: false, message: "Solicitud rechazada." };
  }

  const property = await getPropertyById(data.propertyId);
  if (!property || !property.active || !property.eventsEnabled) {
    return { ok: false, message: "Propiedad no disponible para eventos." };
  }

  // Validate package belongs to property + fits guests
  let packageName: string | null = null;
  if (data.packageId) {
    const packages = await getEventPackagesByProperty(property.id);
    const pkg = packages.find((p) => p.id === data.packageId);
    if (!pkg) {
      return { ok: false, message: "Paquete no encontrado." };
    }
    if (data.estimatedGuests > pkg.maxGuests) {
      return {
        ok: false,
        message: `El paquete ${pkg.name} admite hasta ${pkg.maxGuests} invitados.`,
      };
    }
    packageName = pkg.name;
  }

  // Lazy-seed the property row (mock UUID → live DB) so the event_quotes FK
  // resolves on the first ever submit. Mirrors the reservation flow; without it
  // the INSERT throws a foreign_key_violation, the quote is lost, and the
  // confirmation emails below never run. Idempotent.
  await ensurePropertyInDb(property.id);

  // Only persist packageId when it's a real DB UUID. The packages can come from
  // the mock seed (ids like "ep-q-01"), which are NOT valid uuids and would make
  // the INSERT throw `invalid input syntax for type uuid`. The package *name*
  // is still captured above for the emails, so the quote detail isn't lost.
  const packageIdForDb =
    data.packageId && UUID_RE.test(data.packageId) ? data.packageId : null;

  // Persist quote. Quotes stay pending → no auto-block of dates until admin confirms.
  let quoteId: string;
  try {
    const [row] = await db
      .insert(eventQuotes)
      .values({
        propertyId: property.id,
        packageId: packageIdForDb,
        eventType: data.eventType,
        tentativeDate: data.tentativeDate || null,
        estimatedGuests: data.estimatedGuests,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        message: data.message || null,
        consent: data.consent,
        status: "pending",
      })
      .returning({ id: eventQuotes.id });
    quoteId = row.id;
  } catch (err) {
    console.error("[event-quote:persist]", err);
    return {
      ok: false,
      message:
        "No pudimos registrar tu solicitud. Intenta nuevamente o contáctanos por WhatsApp.",
    };
  }

  const settings = await getSettings();
  const waHref = whatsappUrl(
    settings.whatsappEvents ?? settings.whatsapp,
    `Hola CasaCampo, soy ${data.firstName}, sobre mi solicitud de evento en ${property.name}.`,
  );
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  await Promise.allSettled([
    send({
      to: data.email,
      subject: `Recibimos tu solicitud de evento en ${property.name}`,
      react: EventQuoteReceivedUser({
        firstName: data.firstName,
        propertyName: property.name,
        eventType: data.eventType,
        tentativeDate: data.tentativeDate || null,
        estimatedGuests: data.estimatedGuests,
        packageName,
        whatsappUrl: waHref,
      }),
    }),
    send({
      to: adminNotifyEmail(settings.adminEmail),
      subject: `[Evento] Nueva cotización: ${property.shortName} · ${data.firstName} ${data.lastName}`,
      react: EventQuoteReceivedAdmin({
        quoteId,
        propertyName: property.name,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        eventType: data.eventType,
        tentativeDate: data.tentativeDate || null,
        estimatedGuests: data.estimatedGuests,
        packageName,
        message: data.message ?? null,
        adminUrl: `${siteUrl}/admin/cotizaciones`,
      }),
    }),
  ]);

  redirect("/cotizacion/exito");
}
