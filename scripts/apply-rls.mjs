import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });

const STATEMENTS = [
  // Enable RLS on every table
  `alter table properties            enable row level security`,
  `alter table rooms                 enable row level security`,
  `alter table amenities             enable row level security`,
  `alter table rules                 enable row level security`,
  `alter table pricing_modalities    enable row level security`,
  `alter table seasonal_overrides    enable row level security`,
  `alter table reservations          enable row level security`,
  `alter table blocked_dates         enable row level security`,
  `alter table event_packages        enable row level security`,
  `alter table event_quotes          enable row level security`,
  `alter table media                 enable row level security`,
  `alter table content               enable row level security`,
  `alter table settings              enable row level security`,

  // Public reads (drop first to make idempotent)
  `drop policy if exists "public reads properties"         on properties`,
  `create policy "public reads properties"         on properties         for select using (active = true)`,

  `drop policy if exists "public reads rooms"              on rooms`,
  `create policy "public reads rooms"              on rooms              for select using (true)`,

  `drop policy if exists "public reads amenities"          on amenities`,
  `create policy "public reads amenities"          on amenities          for select using (active = true)`,

  `drop policy if exists "public reads rules"              on rules`,
  `create policy "public reads rules"              on rules              for select using (active = true)`,

  `drop policy if exists "public reads pricing_modalities" on pricing_modalities`,
  `create policy "public reads pricing_modalities" on pricing_modalities for select using (active = true)`,

  `drop policy if exists "public reads seasonal_overrides" on seasonal_overrides`,
  `create policy "public reads seasonal_overrides" on seasonal_overrides for select using (active = true)`,

  `drop policy if exists "public reads blocked_dates"      on blocked_dates`,
  `create policy "public reads blocked_dates"      on blocked_dates      for select using (true)`,

  `drop policy if exists "public reads event_packages"     on event_packages`,
  `create policy "public reads event_packages"     on event_packages     for select using (active = true)`,

  `drop policy if exists "public reads media"              on media`,
  `create policy "public reads media"              on media              for select using (true)`,

  `drop policy if exists "public reads content"            on content`,
  `create policy "public reads content"            on content            for select using (true)`,

  // Anonymous submissions: only pending status
  `drop policy if exists "anyone can insert pending reservation" on reservations`,
  `create policy "anyone can insert pending reservation"
     on reservations for insert with check (status = 'pending')`,

  `drop policy if exists "anyone can insert pending event quote" on event_quotes`,
  `create policy "anyone can insert pending event quote"
     on event_quotes for insert with check (status = 'pending')`,

  // public_settings view (omits payment_methods + admin_email)
  `drop view if exists public_settings`,
  `create view public_settings as
     select whatsapp, whatsapp_events, contact_email, attention_hours,
            instagram, tiktok, facebook, cancellation_policy, event_addons_note
     from settings`,
];

try {
  for (const stmt of STATEMENTS) {
    const preview = stmt.replace(/\s+/g, " ").slice(0, 80);
    process.stdout.write(`> ${preview}${stmt.length > 80 ? "…" : ""}\n`);
    await sql.unsafe(stmt);
  }
  console.log("\nRLS applied.");
} catch (err) {
  console.error("Failed:", err.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
