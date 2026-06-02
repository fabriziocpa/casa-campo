"use server";

import { revalidatePath } from "next/cache";
import { and, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { pricingModalities, seasonalOverrides } from "@/db/schema";
import { getPropertyById } from "@/features/properties/queries";
import { centsFromPEN } from "@/lib/money";

async function revalidateForProperty(propertyId: string) {
  revalidatePath("/admin/propiedades");
  revalidatePath("/admin/calendario");
  const property = await getPropertyById(propertyId);
  if (property) {
    revalidatePath(`/admin/propiedades/${property.slug}`);
    revalidatePath(`/${property.slug}`);
  }
}

// Soles string ("1400" or "1400.50") -> integer cents, or null if unparseable.
function solesToCents(raw: string): number | null {
  const sol = Number(String(raw).replace(",", ".").trim());
  if (!Number.isFinite(sol) || sol < 0) return null;
  return centsFromPEN(sol);
}

// ---- Base price grid (pricing_modalities) ----

export async function updateModality(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  const priceCents = solesToCents(String(formData.get("price") ?? ""));
  const minNightsRaw = String(formData.get("minNights") ?? "1").trim();
  const minNights = Math.max(1, Number(minNightsRaw) || 1);
  if (!id || priceCents === null) return;

  try {
    const updated = await db
      .update(pricingModalities)
      .set({ priceCents, minNights })
      .where(eq(pricingModalities.id, id))
      .returning({ propertyId: pricingModalities.propertyId });
    if (updated[0]) await revalidateForProperty(updated[0].propertyId);
  } catch (err) {
    console.error("[pricing:updateModality]", err);
  }
}

export async function toggleModalityActive(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  const active = String(formData.get("active") ?? "") === "true";
  if (!id) return;

  try {
    const updated = await db
      .update(pricingModalities)
      .set({ active: !active })
      .where(eq(pricingModalities.id, id))
      .returning({ propertyId: pricingModalities.propertyId });
    if (updated[0]) await revalidateForProperty(updated[0].propertyId);
  } catch (err) {
    console.error("[pricing:toggleModalityActive]", err);
  }
}

// ---- Seasonal / date-range overrides (seasonal_overrides) ----

export async function createOverride(formData: FormData): Promise<void> {
  const propertyId = String(formData.get("propertyId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "").trim();
  const endDate = String(formData.get("endDate") ?? "").trim() || startDate;
  const adjustType =
    String(formData.get("adjustType") ?? "absolute") === "percent"
      ? "percent"
      : "absolute";
  const modalityRaw = String(formData.get("modalityId") ?? "").trim();
  const modalityId = modalityRaw || null;

  if (!propertyId || !name || !startDate) return;
  if (endDate < startDate) return;

  let priceCents = 0;
  let percent: number | null = null;

  if (adjustType === "percent") {
    const pct = Number(String(formData.get("percent") ?? "").trim());
    if (!Number.isFinite(pct)) return;
    percent = Math.trunc(pct);
  } else {
    const cents = solesToCents(String(formData.get("price") ?? ""));
    if (cents === null) return;
    priceCents = cents;
  }

  try {
    await db.insert(seasonalOverrides).values({
      propertyId,
      modalityId,
      name,
      startDate,
      endDate,
      adjustType,
      priceCents,
      percent,
      active: true,
    });
    await revalidateForProperty(propertyId);
  } catch (err) {
    console.error("[pricing:createOverride]", err);
  }
}

export async function deleteOverride(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  try {
    const deleted = await db
      .delete(seasonalOverrides)
      .where(eq(seasonalOverrides.id, id))
      .returning({ propertyId: seasonalOverrides.propertyId });
    if (deleted[0]) await revalidateForProperty(deleted[0].propertyId);
  } catch (err) {
    console.error("[pricing:deleteOverride]", err);
  }
}

// Overrides whose window has not fully passed yet (for admin listing).
export async function listUpcomingOverrides(propertyId: string, today: string) {
  try {
    const rows = await db
      .select()
      .from(seasonalOverrides)
      .where(
        and(
          eq(seasonalOverrides.propertyId, propertyId),
          gte(seasonalOverrides.endDate, today),
        ),
      )
      .orderBy(seasonalOverrides.startDate);
    return rows;
  } catch (err) {
    console.error("[pricing:listUpcomingOverrides]", err);
    return [];
  }
}
