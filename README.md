# CasaCampo

Booking + events web app for **CasaCampo** — two rural getaway properties in the Trujillo valley (La Libertad, Peru):

- **Chalet** — small valley retreat (lodging only)
- **Casa Principal** — large riverside house (lodging + events)

New properties can be added from `/admin` without code changes — every property-owned entity carries `property_id`, and public routes are parameterised by `propertySlug`.

## Stack

Next.js 16 (App Router, RSC, Server Actions) · TypeScript · Tailwind v4 + shadcn/ui · Supabase Postgres + Drizzle · Supabase Auth (magic link) · Resend + React Email · react-hook-form + Zod · Vercel.

Package manager **pnpm**. Node **22 LTS**. UI copy in Spanish; code in English.

> ⚠️ Next 16: `middleware.ts` → `proxy.ts`; `params`/`searchParams` are async; Server Actions in `<form action>` must return `void`. Check `node_modules/next/dist/docs/` before assuming older patterns.

## Setup

```bash
pnpm install
cp .env.example .env          # fill in real values
pnpm dev                      # http://localhost:3000
```

### Environment variables

See `.env.example`. Required: `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAILS`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NEXT_PUBLIC_SITE_URL`.

- `DATABASE_URL` — use the Supabase **transaction pooler** (port `6543`) in production.
- `RESEND_API_KEY` missing → email `send()` no-ops (dev won't crash).
- `RESEND_FROM_EMAIL` must be on a Resend-verified domain or sends fail.

## Database

Fresh DB setup (PowerShell — `db:push`/`db:migrate` don't load `.env`, so export the URL first):

```powershell
$env:DATABASE_URL = (Get-Content .env | Where-Object { $_ -match '^DATABASE_URL=' }) -replace '^DATABASE_URL=', '' -replace '^"|"$', ''
pnpm db:push      # apply schema
pnpm db:rls       # apply RLS policies
pnpm db:seed      # seed properties / pricing / content
```

Read queries are **DB-first with seed fallback**: live Drizzle rows when present, otherwise `src/db/seed.ts`.

## Scripts

| Command | Does |
|---|---|
| `pnpm dev` / `build` / `start` | Dev server / production build / serve build |
| `pnpm lint` | ESLint |
| `pnpm db:push` | Push schema to DB |
| `pnpm db:generate` / `db:migrate` | Generate / apply SQL migrations |
| `pnpm db:studio` | Browse DB |
| `pnpm db:seed` | Seed data (`scripts/seed-properties.mjs`) |
| `pnpm db:rls` | Apply RLS policies (`scripts/apply-rls.mjs`) |

## Structure

```
src/
├── app/
│   ├── (public)/      # landing, /[propertySlug], eventos, galeria, contacto, politicas
│   ├── admin/         # panel, reservas, cotizaciones, calendario, propiedades, ajustes (guarded by proxy.ts)
│   └── auth/          # magic-link login / callback / logout
├── components/        # ui, layout, motion, property, events, admin
├── features/          # query + Server Action layer per domain
├── emails/            # React Email templates
├── db/                # schema.ts, seed.ts, index.ts (pooled client), migrations/
└── lib/               # supabase clients, email, money, dates, whatsapp
public/                # logo, property media
scripts/               # seed-properties · apply-rls · verify-db (run via node --env-file=.env)
```

## Conventions

- Server Components by default; `"use client"` only for state/effects/events.
- All mutations in Server Actions, Zod-validated. No client-side DB writes.
- Dates as ISO `YYYY-MM-DD`. Prices as integer PEN cents (`formatPEN` at display).
- RLS on every table, default deny.
- No hardcoded property data — all editable from `/admin`.

## License

Private — © CasaCampo. All rights reserved.
