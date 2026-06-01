import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

try {
  const tables = await sql`
    select tablename from pg_tables where schemaname = 'public' order by tablename
  `;
  console.log("Tables:", tables.map((t) => t.tablename).join(", "));

  const rls = await sql`
    select tablename, rowsecurity from pg_tables
    where schemaname = 'public' order by tablename
  `;
  console.log("\nRLS status:");
  for (const r of rls) console.log(`  ${r.tablename}: ${r.rowsecurity ? "ON" : "OFF"}`);

  const policies = await sql`
    select tablename, policyname from pg_policies
    where schemaname = 'public' order by tablename, policyname
  `;
  console.log(`\nPolicies (${policies.length}):`);
  for (const p of policies) console.log(`  ${p.tablename}: ${p.policyname}`);

  const views = await sql`
    select viewname from pg_views where schemaname = 'public'
  `;
  console.log(`\nViews: ${views.map((v) => v.viewname).join(", ") || "(none)"}`);
} finally {
  await sql.end();
}
