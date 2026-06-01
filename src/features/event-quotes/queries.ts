import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { eventQuotes } from "@/db/schema";
import { EVENT_QUOTES, type EventQuote } from "@/db/seed";

type Filters = {
  propertyId?: string;
  status?: EventQuote["status"];
};

async function readDb(filters?: Filters): Promise<EventQuote[]> {
  try {
    const conds = [];
    if (filters?.propertyId)
      conds.push(eq(eventQuotes.propertyId, filters.propertyId));
    if (filters?.status) conds.push(eq(eventQuotes.status, filters.status));

    const rows = await db
      .select()
      .from(eventQuotes)
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(eventQuotes.createdAt));
    return rows as EventQuote[];
  } catch (err) {
    console.error("[event-quotes:queries] DB read failed:", err);
    return [];
  }
}

function readMock(filters?: Filters): EventQuote[] {
  return EVENT_QUOTES.filter((q) => {
    if (filters?.propertyId && q.propertyId !== filters.propertyId) return false;
    if (filters?.status && q.status !== filters.status) return false;
    return true;
  });
}

export async function listEventQuotes(filters?: Filters): Promise<EventQuote[]> {
  // DB-first: avoid mock rows ghosting once the DB has quotes.
  const live = await readDb(filters);
  const rows = live.length > 0 ? live : readMock(filters);
  return rows
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getEventQuoteById(
  id: string,
): Promise<EventQuote | null> {
  try {
    const [row] = await db
      .select()
      .from(eventQuotes)
      .where(eq(eventQuotes.id, id))
      .limit(1);
    if (row) return row as EventQuote;
  } catch (err) {
    console.error("[event-quotes:queries] getById DB read failed:", err);
  }
  return EVENT_QUOTES.find((q) => q.id === id) ?? null;
}

export async function countEventQuotesByStatus(): Promise<
  Record<EventQuote["status"], number>
> {
  const all = await listEventQuotes();
  const counts: Record<EventQuote["status"], number> = {
    pending: 0,
    in_conversation: 0,
    quoted: 0,
    confirmed: 0,
    rejected: 0,
    cancelled: 0,
  };
  for (const q of all) counts[q.status]++;
  return counts;
}
