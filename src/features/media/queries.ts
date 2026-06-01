import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { media as mediaTable } from "@/db/schema";
import { MEDIA, type Media } from "@/db/seed";

export async function getMediaByProperty(
  propertyId: string,
  section?: string,
): Promise<Media[]> {
  try {
    const where =
      section === undefined
        ? eq(mediaTable.propertyId, propertyId)
        : and(
            eq(mediaTable.propertyId, propertyId),
            eq(mediaTable.section, section),
          );
    const rows = await db
      .select()
      .from(mediaTable)
      .where(where)
      .orderBy(asc(mediaTable.order));
    if (rows.length > 0) return rows as Media[];
  } catch (err) {
    console.error("[media:queries] DB read failed:", err);
  }
  return MEDIA.filter(
    (m) =>
      m.propertyId === propertyId &&
      (section === undefined || m.section === section),
  ).sort((a, b) => a.order - b.order);
}

export async function getBrandMedia(section?: string): Promise<Media[]> {
  try {
    const where =
      section === undefined
        ? isNull(mediaTable.propertyId)
        : and(isNull(mediaTable.propertyId), eq(mediaTable.section, section));
    const rows = await db
      .select()
      .from(mediaTable)
      .where(where)
      .orderBy(asc(mediaTable.order));
    if (rows.length > 0) return rows as Media[];
  } catch (err) {
    console.error("[media:queries] brand DB read failed:", err);
  }
  return MEDIA.filter(
    (m) =>
      m.propertyId === null &&
      (section === undefined || m.section === section),
  ).sort((a, b) => a.order - b.order);
}
