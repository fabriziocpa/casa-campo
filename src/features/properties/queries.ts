/**
 * Property queries.
 *
 * Mock impl reads from `src/db/seed.ts`. Swap to real Drizzle calls when
 * Supabase project is provisioned — keep function signatures identical.
 */

import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { PROPERTIES, type Property } from "@/db/seed";

export async function getActiveProperties(): Promise<Property[]> {
  try {
    const rows = await db
      .select()
      .from(properties)
      .where(eq(properties.active, true))
      .orderBy(asc(properties.order));
    if (rows.length > 0) return rows as Property[];
  } catch (err) {
    console.error("[properties:queries] DB read failed:", err);
  }
  return PROPERTIES.filter((p) => p.active).sort((a, b) => a.order - b.order);
}

export async function getPropertyBySlug(
  slug: string,
): Promise<Property | null> {
  try {
    const [row] = await db
      .select()
      .from(properties)
      .where(and(eq(properties.slug, slug), eq(properties.active, true)))
      .limit(1);
    if (row) return row as Property;
  } catch (err) {
    console.error("[properties:queries] getBySlug DB read failed:", err);
  }
  return PROPERTIES.find((p) => p.slug === slug && p.active) ?? null;
}

export async function getPropertyById(
  id: string,
): Promise<Property | null> {
  try {
    const [row] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, id))
      .limit(1);
    if (row) return row as Property;
  } catch (err) {
    console.error("[properties:queries] getById DB read failed:", err);
  }
  return PROPERTIES.find((p) => p.id === id) ?? null;
}

// Reservations + blocked_dates FK to properties.id. The public site reads
// properties from the mock seed, so if `pnpm db:seed` was never run the
// reservation INSERT fails with foreign_key_violation. This helper upserts
// the mock property row on demand. Cheap (id PK lookup), idempotent.
export async function ensurePropertyInDb(id: string): Promise<boolean> {
  const mock = PROPERTIES.find((p) => p.id === id);
  if (!mock) return false;
  try {
    const existing = await db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.id, id))
      .limit(1);
    if (existing.length > 0) return true;

    await db
      .insert(properties)
      .values({
        id: mock.id,
        slug: mock.slug,
        name: mock.name,
        shortName: mock.shortName,
        tagline: mock.tagline,
        descriptionShort: mock.descriptionShort,
        descriptionLong: mock.descriptionLong,
        addressLine: mock.addressLine,
        latitude: mock.latitude,
        longitude: mock.longitude,
        checkinTime: mock.checkinTime,
        checkoutTime: mock.checkoutTime,
        fullCheckinTime: mock.fullCheckinTime,
        fullCheckoutTime: mock.fullCheckoutTime,
        baseCapacity: mock.baseCapacity,
        maxCapacity: mock.maxCapacity,
        extraPersonCents: mock.extraPersonCents,
        minNightsDefault: mock.minNightsDefault,
        petPolicy: mock.petPolicy,
        petPolicyNote: mock.petPolicyNote,
        eventsEnabled: mock.eventsEnabled,
        active: mock.active,
        order: mock.order,
      })
      .onConflictDoNothing({ target: properties.id });
    return true;
  } catch (err) {
    console.error("[properties] ensurePropertyInDb failed:", err);
    return false;
  }
}

