import { BLOCKED_DATES, type BlockedDate } from "@/db/seed";
import { listUpcomingBlocks } from "./dbQueries";

export async function getBlockedDatesByProperty(
  propertyId: string,
  fromDate?: string,
): Promise<BlockedDate[]> {
  const mock = BLOCKED_DATES.filter(
    (b) =>
      b.propertyId === propertyId &&
      (fromDate === undefined || b.date >= fromDate),
  );

  let live: BlockedDate[] = [];
  try {
    const rows = await listUpcomingBlocks(
      propertyId,
      fromDate ?? "1900-01-01",
    );
    live = rows.map(
      (r): BlockedDate => ({
        id: r.id,
        propertyId: r.propertyId,
        date: r.date,
        reason: r.reason,
        reservationId: r.reservationId,
        eventQuoteId: r.eventQuoteId,
        sourcePropertyId: r.sourcePropertyId,
        notes: r.notes,
        createdAt: r.createdAt,
      }),
    );
  } catch (err) {
    console.error("[blocked-dates] DB read failed, using mock only:", err);
  }

  return [...mock, ...live];
}
