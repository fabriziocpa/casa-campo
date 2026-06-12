"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { eachDayOfInterval, format, parseISO, subDays } from "date-fns";
import { db } from "@/db";
import { blockedDates, reservations } from "@/db/schema";
import { RESERVATIONS, type Reservation } from "@/db/seed";
import { getPropertyById } from "@/features/properties/queries";
import { getSettings } from "@/features/content/queries";
import { getReservationById } from "@/features/reservations/queries";
import { send } from "@/lib/email";
import { formatPEN } from "@/lib/money";
import { whatsappUrl } from "@/lib/whatsapp";
import { paymentInstructionsText } from "@/lib/paymentInstructions";
import ReservationConfirmedUser from "@/emails/ReservationConfirmedUser";
import ReservationRejectedUser from "@/emails/ReservationRejectedUser";

type Status = Reservation["status"];

async function updateStatus(
  id: string,
  status: Status,
  notes?: string,
): Promise<{ ok: boolean; mock: boolean }> {
  try {
    const updated = await db
      .update(reservations)
      .set({
        status,
        adminNotes: notes ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(reservations.id, id))
      .returning({ id: reservations.id });
    if (updated.length > 0) return { ok: true, mock: false };
  } catch (err) {
    console.error("[reservations:adminActions] DB update failed:", err);
  }
  // Fallback: mock seed (dev/demo data only)
  const idx = RESERVATIONS.findIndex((r) => r.id === id);
  if (idx === -1) return { ok: false, mock: false };
  RESERVATIONS[idx] = {
    ...RESERVATIONS[idx],
    status,
    adminNotes: notes ?? RESERVATIONS[idx].adminNotes,
    updatedAt: new Date(),
  };
  return { ok: true, mock: true };
}

function revalidate(id: string) {
  revalidatePath("/admin/reservas");
  revalidatePath(`/admin/reservas/${id}`);
  revalidatePath("/admin");
  revalidatePath("/admin/calendario");
}

function nightDatesOf(checkIn: string, checkOut: string): string[] {
  const start = parseISO(checkIn);
  const end = parseISO(checkOut);
  return eachDayOfInterval({ start, end: subDays(end, 1) }).map((d) =>
    format(d, "yyyy-MM-dd"),
  );
}

// Returns dates blocked by something OTHER than this reservation
// (other reservations, events, event_dependency, manual).
async function findConflicts(
  reservationId: string,
  propertyId: string,
  checkIn: string,
  checkOut: string,
): Promise<string[]> {
  const nights = nightDatesOf(checkIn, checkOut);
  if (nights.length === 0) return [];

  try {
    const rows = await db
      .select({
        date: blockedDates.date,
        reservationId: blockedDates.reservationId,
      })
      .from(blockedDates)
      .where(
        and(
          eq(blockedDates.propertyId, propertyId),
          inArray(blockedDates.date, nights),
        ),
      );
    return rows
      .filter((r) => r.reservationId !== reservationId)
      .map((r) => r.date);
  } catch (err) {
    console.error("[reservations:adminActions] conflict query failed:", err);
    return [];
  }
}

// Ensures this reservation's own blockedDates rows exist (idempotent).
// Needed when a reservation lives only in the mock seed and has no live blocks
// — confirming it must reserve those nights against future bookings.
async function ensureOwnBlocks(
  reservationId: string,
  propertyId: string,
  nights: string[],
): Promise<void> {
  if (nights.length === 0) return;
  try {
    await db
      .insert(blockedDates)
      .values(
        nights.map((date) => ({
          propertyId,
          date,
          reason: "reservation" as const,
          reservationId,
        })),
      )
      .onConflictDoNothing({
        target: [blockedDates.propertyId, blockedDates.date],
      });
  } catch (err) {
    console.error("[reservations:adminActions] ensureOwnBlocks failed:", err);
  }
}

type ConfirmOutcome = {
  id: string;
  name: string;
  result: "confirmed" | "conflict" | "notfound" | "error";
  dates?: string[];
};

// Confirm a single reservation without redirecting (shared by the single-row
// form action and the bulk action). Hard conflict check — no override.
async function confirmCore(id: string): Promise<ConfirmOutcome> {
  const reservation = await getReservationById(id);
  if (!reservation) return { id, name: "", result: "notfound" };
  const name = `${reservation.firstName} ${reservation.lastName}`.trim();

  const conflicts = await findConflicts(
    reservation.id,
    reservation.propertyId,
    reservation.checkIn,
    reservation.checkOut,
  );
  if (conflicts.length > 0) {
    return { id, name, result: "conflict", dates: conflicts.sort() };
  }

  // Make sure this reservation's nights are blocked (handles mock-seeded rows).
  await ensureOwnBlocks(
    reservation.id,
    reservation.propertyId,
    nightDatesOf(reservation.checkIn, reservation.checkOut),
  );

  const result = await updateStatus(id, "confirmed");
  if (!result.ok) return { id, name, result: "error" };

  const [property, settings] = await Promise.all([
    getPropertyById(reservation.propertyId),
    getSettings(),
  ]);
  if (property) {
    await send({
      to: reservation.email,
      subject: `Tu reserva en ${property.name} está confirmada`,
      react: ReservationConfirmedUser({
        firstName: reservation.firstName,
        propertyName: property.name,
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        guests: reservation.guests,
        totalPEN: formatPEN(reservation.totalCents),
        paymentInstructions: paymentInstructionsText(settings),
        addressLine: property.addressLine,
        cancellationPolicy: settings.cancellationPolicy,
      }),
    });
  }
  return { id, name, result: "confirmed" };
}

// Reject a single reservation without redirecting. Frees its held nights.
async function rejectCore(id: string, notes?: string): Promise<boolean> {
  const reservation = await getReservationById(id);
  if (!reservation) return false;

  const result = await updateStatus(id, "rejected", notes);
  if (!result.ok) return false;

  try {
    await db
      .delete(blockedDates)
      .where(
        and(
          eq(blockedDates.reservationId, id),
          eq(blockedDates.reason, "reservation"),
        ),
      );
  } catch (err) {
    console.error("[reservations:adminActions] free blocks on reject failed:", err);
  }

  const [property, settings] = await Promise.all([
    getPropertyById(reservation.propertyId),
    getSettings(),
  ]);
  if (property) {
    await send({
      to: reservation.email,
      subject: `Sobre tu solicitud en ${property.name}`,
      react: ReservationRejectedUser({
        firstName: reservation.firstName,
        propertyName: property.name,
        reason: notes || null,
        whatsappUrl: whatsappUrl(
          settings.whatsapp,
          `Hola CasaCampo, sobre mi solicitud en ${property.name}.`,
        ),
      }),
    });
  }
  return true;
}

// Cancel a single confirmed reservation without redirecting. Frees its held
// nights. No email — cancellation is internal admin cleanup; an optional motivo
// is stored as adminNotes.
async function cancelCore(id: string, notes?: string): Promise<boolean> {
  const reservation = await getReservationById(id);
  if (!reservation) return false;
  if (reservation.status !== "confirmed") return false;

  const result = await updateStatus(id, "cancelled", notes);
  if (!result.ok) return false;

  try {
    await db
      .delete(blockedDates)
      .where(
        and(
          eq(blockedDates.reservationId, id),
          eq(blockedDates.reason, "reservation"),
        ),
      );
  } catch (err) {
    console.error("[reservations:adminActions] free blocks on cancel failed:", err);
  }
  return true;
}

// Permanently delete a reservation. Gated: a confirmed reservation can NOT be
// deleted — it must be cancelled first (which frees its nights). Linked
// blocked_dates rows cascade away via the FK; falls back to splicing the mock
// seed for demo rows.
async function deleteCore(id: string): Promise<boolean> {
  const reservation = await getReservationById(id);
  if (reservation && reservation.status === "confirmed") return false;

  try {
    const deleted = await db
      .delete(reservations)
      .where(eq(reservations.id, id))
      .returning({ id: reservations.id });
    if (deleted.length > 0) return true;
  } catch (err) {
    console.error("[reservations:adminActions] delete failed:", err);
  }
  const idx = RESERVATIONS.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  RESERVATIONS.splice(idx, 1);
  return true;
}

export async function confirmReservation(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const outcome = await confirmCore(id);
  revalidate(id);

  if (outcome.result === "conflict") {
    const params = new URLSearchParams({
      error: "conflict",
      dates: (outcome.dates ?? []).join(","),
    });
    redirect(`/admin/reservas/${id}?${params.toString()}`);
  }
  if (outcome.result === "confirmed") {
    redirect(`/admin/reservas/${id}?confirmed=1`);
  }
}

export async function rejectReservation(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  if (!id) return;
  await rejectCore(id, notes);
  revalidate(id);
}

export async function deleteReservation(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await deleteCore(id);
  revalidate(id);
}

// ---- Bulk actions (called as RPC from the client table) ----

export type BulkConfirmResult = {
  confirmed: number;
  conflicts: { id: string; name: string; dates: string[] }[];
  errors: number;
};

export async function bulkConfirmReservations(
  ids: string[],
): Promise<BulkConfirmResult> {
  const unique = [...new Set(ids.filter(Boolean))];
  const res: BulkConfirmResult = { confirmed: 0, conflicts: [], errors: 0 };
  for (const id of unique) {
    const outcome = await confirmCore(id);
    if (outcome.result === "confirmed") res.confirmed++;
    else if (outcome.result === "conflict")
      res.conflicts.push({
        id,
        name: outcome.name,
        dates: outcome.dates ?? [],
      });
    else res.errors++;
  }
  revalidate("");
  return res;
}

export async function bulkRejectReservations(
  ids: string[],
  notes?: string,
): Promise<{ rejected: number }> {
  const unique = [...new Set(ids.filter(Boolean))];
  let rejected = 0;
  for (const id of unique) {
    if (await rejectCore(id, notes)) rejected++;
  }
  revalidate("");
  return { rejected };
}

export async function bulkDeleteReservations(
  ids: string[],
): Promise<{ deleted: number }> {
  const unique = [...new Set(ids.filter(Boolean))];
  let deleted = 0;
  for (const id of unique) {
    if (await deleteCore(id)) deleted++;
  }
  revalidate("");
  return { deleted };
}

export async function bulkCancelReservations(
  ids: string[],
  notes?: string,
): Promise<{ cancelled: number }> {
  const unique = [...new Set(ids.filter(Boolean))];
  let cancelled = 0;
  for (const id of unique) {
    if (await cancelCore(id, notes)) cancelled++;
  }
  revalidate("");
  return { cancelled };
}

export async function cancelReservation(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  if (!id) return;
  await cancelCore(id, notes);
  revalidate(id);
}
