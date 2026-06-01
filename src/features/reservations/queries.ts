import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { reservations } from "@/db/schema";
import { RESERVATIONS, type Reservation } from "@/db/seed";

type Filters = {
  propertyId?: string;
  status?: Reservation["status"];
};

async function readDb(filters?: Filters): Promise<Reservation[]> {
  try {
    const conds = [];
    if (filters?.propertyId)
      conds.push(eq(reservations.propertyId, filters.propertyId));
    if (filters?.status) conds.push(eq(reservations.status, filters.status));

    const rows = await db
      .select()
      .from(reservations)
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(reservations.createdAt));
    return rows as Reservation[];
  } catch (err) {
    console.error("[reservations:queries] DB read failed:", err);
    return [];
  }
}

function readMock(filters?: Filters): Reservation[] {
  return RESERVATIONS.filter((r) => {
    if (filters?.propertyId && r.propertyId !== filters.propertyId) return false;
    if (filters?.status && r.status !== filters.status) return false;
    return true;
  });
}

export async function listReservations(filters?: Filters): Promise<Reservation[]> {
  // DB-first: once the DB has reservations, mock rows must not ghost in
  // (they can't be truly deleted). Fall back to mock only when DB is empty.
  const live = await readDb(filters);
  const rows = live.length > 0 ? live : readMock(filters);
  return rows
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getReservationById(
  id: string,
): Promise<Reservation | null> {
  try {
    const rows = await db
      .select()
      .from(reservations)
      .where(eq(reservations.id, id))
      .limit(1);
    if (rows.length > 0) return rows[0] as Reservation;
  } catch (err) {
    console.error("[reservations:queries] getReservationById failed:", err);
  }
  return RESERVATIONS.find((r) => r.id === id) ?? null;
}

export async function countReservationsByStatus(): Promise<
  Record<Reservation["status"], number>
> {
  const all = await listReservations();
  const counts: Record<Reservation["status"], number> = {
    pending: 0,
    confirmed: 0,
    rejected: 0,
    cancelled: 0,
  };
  for (const r of all) counts[r.status]++;
  return counts;
}
