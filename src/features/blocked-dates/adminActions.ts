"use server";

import { revalidatePath } from "next/cache";
import { addDays, format, isAfter, parseISO } from "date-fns";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { blockedDates } from "@/db/schema";
import { getPropertyById } from "@/features/properties/queries";

async function revalidateForProperty(propertyId: string): Promise<void> {
  revalidatePath("/admin/calendario");
  revalidatePath("/admin");
  const property = await getPropertyById(propertyId);
  if (property) revalidatePath(`/${property.slug}`);
}

type ManualBlockRow = {
  propertyId: string;
  date: string;
  reason: "manual";
  notes: string | null;
};

type ToggleResult =
  | { ok: true; action: "blocked" | "unblocked" }
  | { ok: false; reason: "not_manual" | "missing" | "error" };

// Single-click toggle for the interactive calendar grid.
// - If the date has no block → insert a manual block.
// - If the date has a manual block → remove it.
// - If the date has a non-manual block (reservation/event/dependency) → refuse.
export async function toggleManualBlock(
  propertyId: string,
  date: string,
  notes?: string,
): Promise<ToggleResult> {
  if (!propertyId || !date) return { ok: false, reason: "missing" };

  try {
    const existing = await db
      .select({
        id: blockedDates.id,
        reason: blockedDates.reason,
      })
      .from(blockedDates)
      .where(
        and(
          eq(blockedDates.propertyId, propertyId),
          eq(blockedDates.date, date),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(blockedDates).values({
        propertyId,
        date,
        reason: "manual",
        notes: notes?.trim() || null,
      });
      await revalidateForProperty(propertyId);
      return { ok: true, action: "blocked" };
    }

    const row = existing[0];
    if (row.reason !== "manual") {
      return { ok: false, reason: "not_manual" };
    }

    await db.delete(blockedDates).where(eq(blockedDates.id, row.id));
    await revalidateForProperty(propertyId);
    return { ok: true, action: "unblocked" };
  } catch (err) {
    console.error("[blocked-dates] toggleManualBlock failed:", err);
    return { ok: false, reason: "error" };
  }
}

export async function addManualBlock(formData: FormData): Promise<void> {
  const propertyId = String(formData.get("propertyId") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "").trim();
  const endDateRaw = String(formData.get("endDate") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!propertyId || !startDate) return;

  const endDate = endDateRaw || startDate;
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  if (isAfter(start, end)) return;

  const rows: ManualBlockRow[] = [];
  let d = start;
  while (!isAfter(d, end)) {
    rows.push({
      propertyId,
      date: format(d, "yyyy-MM-dd"),
      reason: "manual",
      notes,
    });
    d = addDays(d, 1);
  }
  if (rows.length === 0) return;

  await db
    .insert(blockedDates)
    .values(rows)
    .onConflictDoNothing({
      target: [blockedDates.propertyId, blockedDates.date],
    });

  await revalidateForProperty(propertyId);
}

export async function removeManualBlock(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const [row] = await db
    .select({ propertyId: blockedDates.propertyId })
    .from(blockedDates)
    .where(eq(blockedDates.id, id))
    .limit(1);

  await db
    .delete(blockedDates)
    .where(
      and(eq(blockedDates.id, id), eq(blockedDates.reason, "manual")),
    );

  if (row?.propertyId) {
    await revalidateForProperty(row.propertyId);
  } else {
    revalidatePath("/admin/calendario");
  }
}
