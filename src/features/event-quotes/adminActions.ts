"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addDays, eachDayOfInterval, format, parseISO, subDays } from "date-fns";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { blockedDates, eventQuotes } from "@/db/schema";
import { EVENT_QUOTES } from "@/db/seed";
import { getEventQuoteById } from "@/features/event-quotes/queries";
import { getEventPackageById } from "@/features/event-packages/queries";
import { getPropertyById } from "@/features/properties/queries";
import { getSettings } from "@/features/content/queries";
import { send } from "@/lib/email";
import { formatPEN } from "@/lib/money";
import { whatsappUrl } from "@/lib/whatsapp";
import { paymentInstructionsText } from "@/lib/paymentInstructions";
import EventQuoteConfirmedUser from "@/emails/EventQuoteConfirmedUser";
import EventQuoteRejectedUser from "@/emails/EventQuoteRejectedUser";

function revalidate(id: string, propertyIds: string[]) {
  revalidatePath("/admin/cotizaciones");
  revalidatePath(`/admin/cotizaciones/${id}`);
  revalidatePath("/admin");
  revalidatePath("/admin/calendario");
  for (const pid of propertyIds) {
    // best-effort: revalidate public property page if slug resolves later
    void getPropertyById(pid).then((p) => {
      if (p) revalidatePath(`/${p.slug}`);
    });
  }
}

function rangeDates(start: string, end: string): string[] {
  return eachDayOfInterval({ start: parseISO(start), end: parseISO(end) }).map(
    (d) => format(d, "yyyy-MM-dd"),
  );
}

// Returns dates blocked by ANYTHING other than this same quote on the given property.
async function findConflictsForQuote(
  quoteId: string,
  propertyId: string,
  dates: string[],
): Promise<string[]> {
  if (dates.length === 0) return [];
  try {
    const rows = await db
      .select({
        date: blockedDates.date,
        eventQuoteId: blockedDates.eventQuoteId,
      })
      .from(blockedDates)
      .where(
        and(
          eq(blockedDates.propertyId, propertyId),
          inArray(blockedDates.date, dates),
        ),
      );
    return rows
      .filter((r) => r.eventQuoteId !== quoteId)
      .map((r) => r.date);
  } catch (err) {
    console.error("[event-quotes] conflict query failed:", err);
    return [];
  }
}

// Idempotent: insert this quote's own blocks, skipping rows it already owns
// (handles re-confirms after a prior partial run).
async function ensureBlocks(
  rows: Array<{
    propertyId: string;
    date: string;
    reason: "event" | "event_dependency";
    eventQuoteId: string;
    sourcePropertyId: string | null;
    notes: string | null;
  }>,
): Promise<void> {
  if (rows.length === 0) return;
  try {
    await db
      .insert(blockedDates)
      .values(rows)
      .onConflictDoNothing({
        target: [blockedDates.propertyId, blockedDates.date],
      });
  } catch (err) {
    console.error("[event-quotes] ensureBlocks failed:", err);
    throw err;
  }
}

async function clearBlocksForQuote(quoteId: string): Promise<void> {
  try {
    await db
      .delete(blockedDates)
      .where(eq(blockedDates.eventQuoteId, quoteId));
  } catch (err) {
    console.error("[event-quotes] clearBlocksForQuote failed:", err);
  }
}

// Confirms event: writes blocked_dates on the event's property AND on
// parking property (for 100/150 pax packages that flag parkingPropertyId).
// vendorDaysBefore + dismountDaysAfter widen the window on the event property.
// Conflict gate mirrors confirmReservation: any non-owned block in the window
// aborts confirmation (no override, no status change) and redirects with
// ?error=conflict&dates=YYYY-MM-DD,...
export async function confirmEventQuote(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "").trim();
  const endDate = String(formData.get("endDate") ?? "").trim();
  const quotedTotal = Number(formData.get("quotedTotal") ?? 0);

  if (!id || !startDate || !endDate) return;

  const quote = await getEventQuoteById(id);
  if (!quote) return;

  const pkg = quote.packageId ? await getEventPackageById(quote.packageId) : null;
  const vendorBefore = pkg?.vendorDaysBefore ?? 1;
  const dismountAfter = pkg?.dismountDaysAfter ?? 1;
  const parkingPropertyId =
    pkg?.parkingPropertyId && pkg.parkingPropertyId !== quote.propertyId
      ? pkg.parkingPropertyId
      : null;

  const propertyWindowStart = format(
    subDays(parseISO(startDate), vendorBefore),
    "yyyy-MM-dd",
  );
  const propertyWindowEnd = format(
    addDays(parseISO(endDate), dismountAfter),
    "yyyy-MM-dd",
  );

  const propertyDates = rangeDates(propertyWindowStart, propertyWindowEnd);
  const parkingDates = parkingPropertyId
    ? rangeDates(startDate, endDate)
    : [];

  // Conflict gate — hard, no override.
  const [propConflicts, parkConflicts] = await Promise.all([
    findConflictsForQuote(quote.id, quote.propertyId, propertyDates),
    parkingPropertyId
      ? findConflictsForQuote(quote.id, parkingPropertyId, parkingDates)
      : Promise.resolve<string[]>([]),
  ]);

  const allConflicts = Array.from(
    new Set([...propConflicts, ...parkConflicts]),
  ).sort();
  if (allConflicts.length > 0) {
    const params = new URLSearchParams({
      error: "conflict",
      dates: allConflicts.join(","),
    });
    redirect(`/admin/cotizaciones/${id}?${params.toString()}`);
  }

  // Atomic: insert blocks + update quote inside a single transaction.
  const property = await getPropertyById(quote.propertyId);
  const propertyName = property?.name ?? "casa";

  try {
    await db.transaction(async (tx) => {
      const propRows = propertyDates.map((date) => ({
        propertyId: quote.propertyId,
        date,
        reason: "event" as const,
        eventQuoteId: quote.id,
        sourcePropertyId: null,
        notes: null,
      }));
      await tx
        .insert(blockedDates)
        .values(propRows)
        .onConflictDoNothing({
          target: [blockedDates.propertyId, blockedDates.date],
        });

      if (parkingPropertyId) {
        const parkRows = parkingDates.map((date) => ({
          propertyId: parkingPropertyId,
          date,
          reason: "event_dependency" as const,
          eventQuoteId: quote.id,
          sourcePropertyId: quote.propertyId,
          notes: `Estacionamiento para evento en ${propertyName}`,
        }));
        await tx
          .insert(blockedDates)
          .values(parkRows)
          .onConflictDoNothing({
            target: [blockedDates.propertyId, blockedDates.date],
          });
      }

      await tx
        .update(eventQuotes)
        .set({
          status: "confirmed",
          quotedTotalCents: quotedTotal > 0 ? quotedTotal : null,
          confirmedStartDate: startDate,
          confirmedEndDate: endDate,
          updatedAt: new Date(),
        })
        .where(eq(eventQuotes.id, quote.id));
    });
  } catch (err) {
    console.error("[event-quotes] confirm transaction failed:", err);
    redirect(`/admin/cotizaciones/${id}?error=persist`);
  }

  const settings = await getSettings();
  if (property) {
    await send({
      to: quote.email,
      subject: `Tu evento en ${property.name} está confirmado`,
      react: EventQuoteConfirmedUser({
        firstName: quote.firstName,
        propertyName: property.name,
        eventType: quote.eventType,
        startDate,
        endDate,
        estimatedGuests: quote.estimatedGuests,
        totalPEN: quotedTotal > 0 ? formatPEN(quotedTotal) : null,
        paymentInstructions: paymentInstructionsText(settings),
        eventAddonsNote: settings.eventAddonsNote ?? null,
      }),
    });
  }

  revalidate(
    id,
    parkingPropertyId ? [quote.propertyId, parkingPropertyId] : [quote.propertyId],
  );
  redirect(`/admin/cotizaciones/${id}?confirmed=1`);
}

// Transition between non-terminal statuses (pending → in_conversation → quoted).
// No date math, no block writes. Used by the inline-affordance forms on the list.
export async function setEventQuoteStatus(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  if (!id) return;
  if (
    status !== "pending" &&
    status !== "in_conversation" &&
    status !== "quoted"
  ) {
    return;
  }
  try {
    await db
      .update(eventQuotes)
      .set({ status, updatedAt: new Date() })
      .where(eq(eventQuotes.id, id));
  } catch (err) {
    console.error("[event-quotes] setStatus failed:", err);
  }
  const quote = await getEventQuoteById(id);
  revalidate(id, quote ? [quote.propertyId] : []);
}

type CoreResult = { ok: boolean; propertyId: string | null };

const SIN_CONFIRMAR: ReadonlyArray<string> = [
  "pending",
  "in_conversation",
  "quoted",
];

// Reject a single quote without redirecting. Only applies to "sin confirmar"
// quotes (pending/in_conversation/quoted) — a confirmed event must be cancelled,
// not rejected. Frees any held dates and emails the customer.
async function rejectCore(id: string, notes?: string): Promise<CoreResult> {
  const quote = await getEventQuoteById(id);
  if (!quote) return { ok: false, propertyId: null };
  if (!SIN_CONFIRMAR.includes(quote.status)) {
    return { ok: false, propertyId: quote.propertyId };
  }

  try {
    await db
      .update(eventQuotes)
      .set({
        status: "rejected",
        adminNotes: notes || null,
        updatedAt: new Date(),
      })
      .where(eq(eventQuotes.id, id));
  } catch (err) {
    console.error("[event-quotes] reject failed:", err);
    return { ok: false, propertyId: quote.propertyId };
  }
  await clearBlocksForQuote(id);

  const [property, settings] = await Promise.all([
    getPropertyById(quote.propertyId),
    getSettings(),
  ]);
  if (property) {
    await send({
      to: quote.email,
      subject: `Sobre tu evento en ${property.name}`,
      react: EventQuoteRejectedUser({
        firstName: quote.firstName,
        propertyName: property.name,
        reason: notes || null,
        whatsappUrl: whatsappUrl(
          settings.whatsappEvents ?? settings.whatsapp,
          `Hola CasaCampo, sobre mi solicitud de evento en ${property.name}.`,
        ),
      }),
    });
  }

  return { ok: true, propertyId: quote.propertyId };
}

// Cancel a single quote without redirecting. Only applies to a confirmed event.
// Frees its blocked dates (event + parking). No email is sent — cancellation is
// internal admin cleanup; an optional motivo is stored as adminNotes.
async function cancelCore(id: string, notes?: string): Promise<CoreResult> {
  const quote = await getEventQuoteById(id);
  if (!quote) return { ok: false, propertyId: null };
  if (quote.status !== "confirmed") {
    return { ok: false, propertyId: quote.propertyId };
  }

  try {
    await db
      .update(eventQuotes)
      .set({
        status: "cancelled",
        adminNotes: notes || null,
        updatedAt: new Date(),
      })
      .where(eq(eventQuotes.id, id));
  } catch (err) {
    console.error("[event-quotes] cancel failed:", err);
    return { ok: false, propertyId: quote.propertyId };
  }
  await clearBlocksForQuote(id);

  return { ok: true, propertyId: quote.propertyId };
}

// Permanently delete a quote. Gated: a confirmed event can NOT be deleted — it
// must be cancelled first. Because blocked_dates.event_quote_id has no FK
// cascade, we explicitly clear any leftover blocks before removing the row.
async function deleteCore(id: string): Promise<CoreResult> {
  const quote = await getEventQuoteById(id);
  if (!quote) {
    // Mock-seed fallback for demo rows.
    const idx = EVENT_QUOTES.findIndex((q) => q.id === id);
    if (idx === -1) return { ok: false, propertyId: null };
    EVENT_QUOTES.splice(idx, 1);
    return { ok: true, propertyId: null };
  }
  if (quote.status === "confirmed") {
    return { ok: false, propertyId: quote.propertyId };
  }

  await clearBlocksForQuote(id);

  try {
    const deleted = await db
      .delete(eventQuotes)
      .where(eq(eventQuotes.id, id))
      .returning({ id: eventQuotes.id });
    if (deleted.length > 0) return { ok: true, propertyId: quote.propertyId };
  } catch (err) {
    console.error("[event-quotes] delete failed:", err);
  }
  const idx = EVENT_QUOTES.findIndex((q) => q.id === id);
  if (idx !== -1) {
    EVENT_QUOTES.splice(idx, 1);
    return { ok: true, propertyId: quote.propertyId };
  }
  return { ok: false, propertyId: quote.propertyId };
}

export async function rejectEventQuote(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  if (!id) return;
  const { propertyId } = await rejectCore(id, notes);
  revalidate(id, propertyId ? [propertyId] : []);
}

export async function cancelEventQuote(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  if (!id) return;
  const { propertyId } = await cancelCore(id, notes);
  revalidate(id, propertyId ? [propertyId] : []);
}

export async function deleteEventQuote(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const { propertyId } = await deleteCore(id);
  revalidate(id, propertyId ? [propertyId] : []);
}

// ---- Bulk actions (called as RPC from the client tables) ----

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids.filter(Boolean))];
}

export async function bulkRejectEventQuotes(
  ids: string[],
  notes?: string,
): Promise<{ rejected: number }> {
  let rejected = 0;
  const propertyIds = new Set<string>();
  for (const id of uniqueIds(ids)) {
    const r = await rejectCore(id, notes);
    if (r.ok) rejected++;
    if (r.propertyId) propertyIds.add(r.propertyId);
  }
  revalidate("", [...propertyIds]);
  return { rejected };
}

export async function bulkCancelEventQuotes(
  ids: string[],
  notes?: string,
): Promise<{ cancelled: number }> {
  let cancelled = 0;
  const propertyIds = new Set<string>();
  for (const id of uniqueIds(ids)) {
    const r = await cancelCore(id, notes);
    if (r.ok) cancelled++;
    if (r.propertyId) propertyIds.add(r.propertyId);
  }
  revalidate("", [...propertyIds]);
  return { cancelled };
}

export async function bulkDeleteEventQuotes(
  ids: string[],
): Promise<{ deleted: number }> {
  let deleted = 0;
  const propertyIds = new Set<string>();
  for (const id of uniqueIds(ids)) {
    const r = await deleteCore(id);
    if (r.ok) deleted++;
    if (r.propertyId) propertyIds.add(r.propertyId);
  }
  revalidate("", [...propertyIds]);
  return { deleted };
}

// Kept for backwards-compat in case other call sites import it.
export { ensureBlocks as ensureEventQuoteBlocks };
