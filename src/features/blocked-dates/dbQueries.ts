import { and, asc, eq, gte, lt } from "drizzle-orm";
import { format } from "date-fns";
import { db } from "@/db";
import { blockedDates } from "@/db/schema";

export type DbBlockedDate = typeof blockedDates.$inferSelect;

// Lazy purge: any blocked_date row whose date is strictly before TODAY is
// dropped. Idempotent, cheap (covered by index on date). Boundary is always
// today (not the read's fromDate) so a future-dated read doesn't nuke
// upcoming blocks. Runs at most once per request via the module flag below.
let lastPurgedAt = 0;
const PURGE_THROTTLE_MS = 60_000;

async function purgeExpiredBlocks(): Promise<void> {
  const now = Date.now();
  if (now - lastPurgedAt < PURGE_THROTTLE_MS) return;
  lastPurgedAt = now;
  const today = format(new Date(), "yyyy-MM-dd");
  try {
    await db.delete(blockedDates).where(lt(blockedDates.date, today));
  } catch (err) {
    console.error("[blocked-dates] purge failed:", err);
  }
}

export async function listUpcomingBlocks(
  propertyId: string,
  fromDate: string,
): Promise<DbBlockedDate[]> {
  await purgeExpiredBlocks();
  return db
    .select()
    .from(blockedDates)
    .where(
      and(
        eq(blockedDates.propertyId, propertyId),
        gte(blockedDates.date, fromDate),
      ),
    )
    .orderBy(asc(blockedDates.date));
}
