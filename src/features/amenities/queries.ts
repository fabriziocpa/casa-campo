import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { amenities as amenitiesTable } from "@/db/schema";
import { AMENITIES, type Amenity } from "@/db/seed";

export async function getAmenitiesByProperty(
  propertyId: string,
): Promise<Amenity[]> {
  try {
    const rows = await db
      .select()
      .from(amenitiesTable)
      .where(
        and(
          eq(amenitiesTable.propertyId, propertyId),
          eq(amenitiesTable.active, true),
        ),
      )
      .orderBy(asc(amenitiesTable.order));
    if (rows.length > 0) return rows as Amenity[];
  } catch (err) {
    console.error("[amenities:queries] DB read failed:", err);
  }
  return AMENITIES.filter((a) => a.propertyId === propertyId && a.active).sort(
    (a, b) => a.order - b.order,
  );
}

export function groupAmenitiesByCategory(amenities: Amenity[]): Array<{
  category: string;
  amenities: Amenity[];
}> {
  const map = new Map<string, Amenity[]>();
  for (const amenity of amenities) {
    const cat = amenity.category ?? "otros";
    const list = map.get(cat) ?? [];
    list.push(amenity);
    map.set(cat, list);
  }
  return Array.from(map.entries()).map(([category, amenities]) => ({
    category,
    amenities,
  }));
}

const CATEGORY_LABELS: Record<string, string> = {
  interior: "Interior",
  exterior: "Exterior",
  extras: "Extras",
  otros: "Otros",
};

export function labelForCategory(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}
