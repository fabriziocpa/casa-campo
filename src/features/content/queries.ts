import { and, eq, isNull, like } from "drizzle-orm";
import { db } from "@/db";
import { content as contentTable, settings as settingsTable } from "@/db/schema";
import { CONTENT, SETTINGS, type Content, type Settings } from "@/db/seed";

export async function getContentByPrefix(
  propertyId: string | null,
  prefix: string,
): Promise<Content[]> {
  try {
    const rows = await db
      .select()
      .from(contentTable)
      .where(
        and(
          propertyId === null
            ? isNull(contentTable.propertyId)
            : eq(contentTable.propertyId, propertyId),
          like(contentTable.key, `${prefix}%`),
        ),
      );
    if (rows.length > 0) return rows as Content[];
  } catch (err) {
    console.error("[content:queries] DB read failed:", err);
  }
  return CONTENT.filter(
    (c) => c.propertyId === propertyId && c.key.startsWith(prefix),
  );
}

export async function getContentMap(
  propertyId: string | null,
  prefix: string,
): Promise<Record<string, string>> {
  const rows = await getContentByPrefix(propertyId, prefix);
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function getFaqs(
  propertyId: string,
): Promise<Array<{ q: string; a: string }>> {
  const map = await getContentMap(propertyId, "faq.");
  const out: Array<{ q: string; a: string }> = [];
  for (let i = 1; ; i++) {
    const q = map[`faq.q.${i}`];
    const a = map[`faq.a.${i}`];
    if (!q || !a) break;
    out.push({ q, a });
  }
  return out;
}

export async function getBrandValueProps(): Promise<
  Array<{ title: string; body: string }>
> {
  const map = await getContentMap(null, "brand.value.");
  const out: Array<{ title: string; body: string }> = [];
  for (let i = 1; ; i++) {
    const t = map[`brand.value.${i}.title`];
    const b = map[`brand.value.${i}.body`];
    if (!t || !b) break;
    out.push({ title: t, body: b });
  }
  return out;
}

export async function getEventValueProps(
  propertyId: string,
): Promise<Array<{ title: string; body: string }>> {
  const map = await getContentMap(propertyId, "events.value.");
  const out: Array<{ title: string; body: string }> = [];
  for (let i = 1; ; i++) {
    const t = map[`events.value.${i}.title`];
    const b = map[`events.value.${i}.body`];
    if (!t || !b) break;
    out.push({ title: t, body: b });
  }
  return out;
}

export async function getEventIncludedExcluded(propertyId: string): Promise<{
  included: string[];
  excluded: string[];
}> {
  const inc = await getContentMap(propertyId, "events.included.");
  const exc = await getContentMap(propertyId, "events.excluded.");
  const sortKey = (k: string) => Number(k.split(".").pop() ?? 0);
  return {
    included: Object.entries(inc)
      .sort(([a], [b]) => sortKey(a) - sortKey(b))
      .map(([, v]) => v),
    excluded: Object.entries(exc)
      .sort(([a], [b]) => sortKey(a) - sortKey(b))
      .map(([, v]) => v),
  };
}

export async function getSettings(): Promise<Settings> {
  try {
    const [row] = await db.select().from(settingsTable).limit(1);
    if (row) return row as Settings;
  } catch (err) {
    console.error("[settings:queries] DB read failed:", err);
  }
  return SETTINGS;
}
