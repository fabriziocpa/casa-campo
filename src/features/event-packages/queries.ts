import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { eventPackages } from "@/db/schema";
import { EVENT_PACKAGES, type EventPackage } from "@/db/seed";

export async function getEventPackagesByProperty(
  propertyId: string,
): Promise<EventPackage[]> {
  try {
    const rows = await db
      .select()
      .from(eventPackages)
      .where(
        and(
          eq(eventPackages.propertyId, propertyId),
          eq(eventPackages.active, true),
        ),
      )
      .orderBy(asc(eventPackages.order));
    if (rows.length > 0) return rows as EventPackage[];
  } catch (err) {
    console.error("[event-packages:queries] DB read failed:", err);
  }
  return EVENT_PACKAGES.filter(
    (p) => p.propertyId === propertyId && p.active,
  ).sort((a, b) => a.order - b.order);
}

export async function getEventPackageById(
  id: string,
): Promise<EventPackage | null> {
  try {
    const [row] = await db
      .select()
      .from(eventPackages)
      .where(eq(eventPackages.id, id))
      .limit(1);
    if (row) return row as EventPackage;
  } catch (err) {
    console.error("[event-packages:queries] getById DB read failed:", err);
  }
  return EVENT_PACKAGES.find((p) => p.id === id) ?? null;
}
