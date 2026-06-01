import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { rooms as roomsTable } from "@/db/schema";
import { ROOMS, type Bed, type Room } from "@/db/seed";

export async function getRoomsByProperty(propertyId: string): Promise<Room[]> {
  try {
    const rows = await db
      .select()
      .from(roomsTable)
      .where(eq(roomsTable.propertyId, propertyId))
      .orderBy(asc(roomsTable.order));
    if (rows.length > 0) return rows as Room[];
  } catch (err) {
    console.error("[rooms:queries] DB read failed:", err);
  }
  return ROOMS.filter((r) => r.propertyId === propertyId).sort(
    (a, b) => a.order - b.order,
  );
}

export function groupRoomsByFloor(rooms: Room[]): Array<{
  floor: string;
  rooms: Room[];
}> {
  const map = new Map<string, Room[]>();
  for (const room of rooms) {
    const list = map.get(room.floor) ?? [];
    list.push(room);
    map.set(room.floor, list);
  }
  return Array.from(map.entries()).map(([floor, rooms]) => ({ floor, rooms }));
}

export function formatBeds(beds: unknown): string {
  if (!Array.isArray(beds)) return "";
  const parts = (beds as Bed[]).map((b) =>
    b.count > 1 ? `${b.count} camas ${b.size}` : `1 cama ${b.size}`,
  );
  return parts.join(" · ");
}
