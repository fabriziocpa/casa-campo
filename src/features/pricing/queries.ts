import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { pricingModalities, seasonalOverrides } from "@/db/schema";
import {
  PRICING_MODALITIES,
  SEASONAL_OVERRIDES,
  type PricingModality,
  type SeasonalOverride,
} from "@/db/seed";

export async function getActiveModalitiesByProperty(
  propertyId: string,
): Promise<PricingModality[]> {
  try {
    const rows = await db
      .select()
      .from(pricingModalities)
      .where(
        and(
          eq(pricingModalities.propertyId, propertyId),
          eq(pricingModalities.active, true),
        ),
      )
      .orderBy(asc(pricingModalities.priority));
    if (rows.length > 0) return rows as PricingModality[];
  } catch (err) {
    console.error("[pricing:queries] DB read failed:", err);
  }
  return PRICING_MODALITIES.filter(
    (m) => m.propertyId === propertyId && m.active,
  ).sort((a, b) => a.priority - b.priority);
}

export async function getSeasonalOverridesByProperty(
  propertyId: string,
): Promise<SeasonalOverride[]> {
  try {
    const rows = await db
      .select()
      .from(seasonalOverrides)
      .where(
        and(
          eq(seasonalOverrides.propertyId, propertyId),
          eq(seasonalOverrides.active, true),
        ),
      );
    if (rows.length > 0) return rows as SeasonalOverride[];
  } catch (err) {
    console.error("[pricing:queries] overrides DB read failed:", err);
  }
  return SEASONAL_OVERRIDES.filter(
    (s) => s.propertyId === propertyId && s.active,
  );
}

export async function getMinPriceCents(
  propertyId: string,
): Promise<number | null> {
  const modalities = await getActiveModalitiesByProperty(propertyId);
  if (modalities.length === 0) return null;
  return Math.min(...modalities.map((m) => m.priceCents));
}
