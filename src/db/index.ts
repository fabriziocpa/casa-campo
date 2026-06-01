import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Reuse a single postgres client across hot reloads. Without this, Turbopack
// re-evaluates this module on every change and each new `postgres()` opens its
// own pool — they accumulate and exhaust the Supabase pooler
// (EMAXCONNSESSION: max clients reached in session mode, pool_size 15).
const globalForDb = globalThis as unknown as {
  __pgClient?: ReturnType<typeof postgres>;
};

const client =
  globalForDb.__pgClient ??
  postgres(process.env.DATABASE_URL!, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") globalForDb.__pgClient = client;

export const db = drizzle(client, { schema });
