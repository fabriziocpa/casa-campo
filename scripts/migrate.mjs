// Applies pending SQL migrations from src/db/migrations using the drizzle-orm
// runtime migrator (drizzle-kit 0.18.1 CLI commands are broken in this repo).
//
// Reads meta/_journal.json, runs each unapplied migration in order, and records
// them in the drizzle migrations table. Idempotent: already-applied migrations
// are skipped.
//
// Run: node --env-file=.env scripts/migrate.mjs

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });

try {
  await migrate(drizzle(sql), { migrationsFolder: "src/db/migrations" });
  console.log("Migrations applied.");
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
