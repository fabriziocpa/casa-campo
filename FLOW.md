# CasaCampo — Flow reference

End-to-end paths a user or admin can take through the app. Each section lists the entry point, every branch that can happen, side-effects (emails, blocks, redirects), and where to look in code.

---

## 1. Visitor explores the brand

```
/                           Brand landing — picks property
└── /inicio                 Editorial brand intro (values · two houses · brand promises)
    ├── /chalet             Property landing
    └── /casa-grande        Property landing (with Eventos teaser)
```

| Step | Where it lives | Notes |
|---|---|---|
| Brand landing | `src/app/(public)/page.tsx` | Reads `getActiveProperties()` |
| /inicio | `src/app/(public)/inicio/page.tsx` | Reads `getBrandValueProps()` + amenities for vibe chips |
| Property landing | `src/app/(public)/[propertySlug]/page.tsx` | Composed of `PropertyHero` → `PropertyNarrative` → `RoomGrid` → `AmenityGrid` → `PricingTable` → `EventsTeaser` (when applicable) → `ReservationForm` → `RulesGrid` → `LocationBlock` → `FAQ` |
| Header / footer / WA float | `src/app/(public)/layout.tsx` | Sticky header, WhatsApp floating button (bottom-right) |

`PropertyJsonLd` renders inline `<script type="application/ld+json">` with `LodgingBusiness` schema. `opengraph-image.tsx` (root + per-property) generates 1200×630 PNGs at the edge.

---

## 2. Reservation flow (Chalet *or* Casa Grande)

```
Property landing  →  ReservationForm
                     ├── Calendar picks dates
                     ├── Guests + identity + contact
                     ├── Honeypot (silent drop on fill)
                     ├── Consent checkbox
                     │
                     ▼
                     submitReservation Server Action
                     ├── Zod validate
                     ├── Re-run resolveStay() on server (authoritative price)
                     ├── Check date conflicts vs blocked_dates
                     │
                     ├── ✓ ok  →  send 2 emails (user + admin)
                     │             redirect /[slug]/reserva/exito
                     └── ✗ err →  return { fieldErrors, message } via useActionState
```

### Calendar behaviour

| Property | All modalities `full_package`? | Same `packageNights`? | Calendar mode |
|---|---|---|---|
| Chalet | No (`per_night`) | — | Free range, min 1 night |
| Casa Grande | Yes | Yes (1) | **Single-click**: picking a check-in auto-fills check-out to check-in + 1 night. Disabled weekdays are those where no modality has a matching `dayMask` bit. |

Implementation: `src/components/property/AvailabilityCalendar.tsx` (props `fixedNights`, `allowedCheckinDow`). Derived in `ReservationForm.tsx`.

### Pricing

`resolveStay()` (`src/features/pricing/resolveStay.ts`):

1. Filters modalities by `dayMask`, `capacityTier`, `kind`/`packageNights`.
2. Sorts by tightest `capacityTier` then highest `priority`.
3. Applies seasonal overrides (by modality or by date range).
4. Adds extra-person surcharge (when guests exceed `capacityTier ?? baseCapacity`).
5. Returns per-night breakdown OR single package total + errors array.

The client renders the result via `StaySummary`. The Server Action re-runs `resolveStay` before persisting — never trust the client price.

### Emails sent on submit

| Email | Template | Sent to |
|---|---|---|
| Confirmation of receipt | `ReservationReceivedUser` | The customer |
| Internal alert | `ReservationReceivedAdmin` | `settings.adminEmail` |

Both go via `src/lib/email.ts` → Resend. **No `RESEND_API_KEY` → no-op with console log** (so dev/local doesn't crash).

### Failure branches

| Cause | UX |
|---|---|
| Honeypot filled | Silent rejection (`"Solicitud rechazada."`) |
| Property inactive | `"Propiedad no disponible."` |
| No modality matches | `"No hay tarifa configurada para esas fechas y huéspedes"` |
| Below `minNights` | `"La modalidad seleccionada requiere mínimo N noches"` |
| Date already blocked | `"Las fechas YYYY-MM-DD ya no están disponibles."` |
| Guest count > maxCapacity | `"Capacidad máxima excedida"` |
| Zod validation error | `fieldErrors` surfaced inline + `"Revisa los campos marcados."` toast |

---

## 3. Event-quote flow (Casa Grande only)

```
/casa-grande  →  EventsTeaser  →  /casa-grande/eventos
                                 ├── EventHero / value props / packages grid / included list
                                 ├── EventQuoteForm
                                 │   ├── propertyId, eventType, tentativeDate, estimatedGuests
                                 │   ├── packageId (optional)
                                 │   └── honeypot + consent
                                 ▼
                                 submitEventQuote Server Action
                                 ├── Zod validate
                                 ├── If packageId — verify it belongs to property + fits guests
                                 ├── ✓ ok  →  send 2 emails (user + admin)
                                 │             redirect /cotizacion/exito
                                 └── ✗ err →  return { fieldErrors, message }
```

`/[slug]/eventos` returns 404 unless `property.eventsEnabled = true`.

---

## 4. Admin auth

```
/auth/login
└── LoginForm  →  sendMagicLink(formData)
                  ├── Validate email shape (Zod)
                  ├── If email not in ADMIN_EMAILS → return generic success (avoid leaking allowlist)
                  ├── supabase.auth.signInWithOtp({
                  │     email,
                  │     emailRedirectTo: `${origin}/auth/callback`,
                  │     shouldCreateUser: false
                  │   })
                  └── return { ok: true, message: "Revisa tu correo." }

(email arrives) → click link →
/auth/callback?code=…
└── supabase.auth.exchangeCodeForSession(code)
    └── redirect(next ?? "/admin")

/auth/logout (POST)
└── supabase.auth.signOut() → redirect 303 /auth/login
```

`/admin/*` is gated by `src/proxy.ts` (the Next 16 replacement for `middleware.ts`). Unauthenticated requests are redirected to `/auth/login?next=…`.

---

## 5. Admin — reservation lifecycle

The list page (`src/app/admin/reservas/page.tsx`) is a Server Component that fetches rows (DB-first, mock fallback) and hands them to the **client table** `ReservasTable.tsx`. The list reads via `listReservations()` which returns live DB rows when present and only falls back to the seed when the DB is empty — so deleted rows stay gone (no mock "ghosting").

```
/admin/reservas  (ReservasTable — client)
├── Status pills: todas · pendientes · confirmadas · rechazadas · canceladas
├── Per-row checkbox + "seleccionar todas" (indeterminate)
│   └── Selection → sticky bar: Confirmar(n) · Rechazar(n) · Eliminar(n)
│         → in-app Dialog modal (base-ui, NOT window.confirm)
│         → bulkConfirm/Reject/DeleteReservations(ids) RPC
│         → inline result banner + router.refresh()
├── Per-row quick actions (single form actions): Confirmar / Rechazar / Cancelar
└── Row click → /admin/reservas/[id]
                ├── confirmReservation(formData)
                │   ├── Fetch reservation (DB → mock fallback)
                │   ├── findConflicts(): SELECT blocked_dates
                │   │     WHERE propertyId = X AND date IN (nightDates)
                │   │     filter rows where reservationId ≠ this.id
                │   │   ├── conflicts > 0 → redirect /admin/reservas/[id]?error=conflict&dates=…
                │   │   │                  (NO override, NO status change)
                │   │   └── conflicts = 0 → continue
                │   ├── ensureOwnBlocks(): INSERT blocked_dates ON CONFLICT DO NOTHING
                │   │   (idempotent — covers mock-seeded rows that lack blocks)
                │   ├── UPDATE reservations SET status='confirmed', updatedAt
                │   ├── send ReservationConfirmedUser email
                │   └── revalidatePath /admin/reservas /admin /admin/calendario
                │       redirect /admin/reservas/[id]?confirmed=1
                │
                ├── rejectReservation(formData)
                │   ├── UPDATE reservations SET status='rejected', adminNotes
                │   ├── DELETE blocked_dates WHERE reservationId = id AND reason='reservation'
                │   └── send ReservationRejectedUser email
                │
                └── cancelReservation(formData)
                    ├── UPDATE reservations SET status='cancelled', adminNotes
                    └── DELETE blocked_dates WHERE reservationId = id AND reason='reservation'
```

| Action | Email to customer | Persistence |
|---|---|---|
| Confirm | `ReservationConfirmedUser` | DB UPDATE (mock-array fallback when DB row missing) |
| Reject | `ReservationRejectedUser` | DB UPDATE + DELETE owned blocks |
| Cancel | — | DB UPDATE + DELETE owned blocks |

### Conflict gate

Confirming **never** flips status when other blocks cover any night of the stay. `findConflicts()` (`src/features/reservations/adminActions.ts`) returns the offending dates; the action issues `redirect(?error=conflict&dates=YYYY-MM-DD,…)`. The detail page (`src/app/admin/reservas/[id]/page.tsx`) reads `searchParams.error` and renders a rose-muted banner listing the dates. There is no force/override path — admin must clear the conflicting reservation, event, or manual block first, then retry.

`confirmed=1` query param on success renders a teal banner.

Single-row server actions are typed `Promise<void>` and bound directly to `<form action={fn}>` (Next 16 requirement — no `useActionState` wrapper needed in admin).

### Bulk actions (select-then-act)

`ReservasTable.tsx` tracks a `Set<string>` of selected ids. The action-bar counts are scoped to what each verb can legally touch: **Confirmar** → `pending` only, **Rechazar** → not already `rejected`/`cancelled`, **Eliminar** → any selected. Each opens an in-app `Dialog` (`src/components/ui/dialog.tsx`, base-ui — not a Chrome popup); reject offers an optional reason that flows into the guest email.

| Bulk action (`src/features/reservations/adminActions.ts`) | Returns | Notes |
|---|---|---|
| `bulkConfirmReservations(ids)` | `{ confirmed, conflicts:[{id,name,dates}], errors }` | Same hard conflict check per row; conflicting rows are **skipped**, not forced |
| `bulkRejectReservations(ids, notes?)` | `{ rejected }` | Frees each row's `reason='reservation'` blocks + emails the guest |
| `bulkDeleteReservations(ids)` | `{ deleted }` | Permanent `DELETE`; `blocked_dates` cascade via FK (mock rows spliced) |

These are **RPC-style** server actions: they take `string[]`, return a serializable summary (not `void`), and do **not** redirect — the client renders an inline result banner and calls `router.refresh()`. There is no `Toaster` in the admin layout (sonner is mounted only in `(public)/layout.tsx`), so all admin feedback is inline banner state. Single-row and bulk paths share extracted cores (`confirmCore` / `rejectCore` / `deleteCore`). **Permanent delete is reachable only through bulk selection** (select one or many → Eliminar → modal), so there is no one-click delete button per row.

---

## 6. Admin — event-quote lifecycle (with the cross-property block)

This is the most delicate flow: a confirmed event at Casa Grande may also reserve the **Chalet's parking** for the same dates.

The whole event-quote admin layer is **DB-backed** (`src/features/event-quotes/adminActions.ts`): blocks and status writes go through Drizzle, and `confirmEventQuote` runs a conflict gate that mirrors `confirmReservation`.

```
/admin/cotizaciones
├── Inline list affordances: setEventQuoteStatus(id, status)
│     pending → in_conversation → quoted   (no date math, no blocks)
└── Row click → /admin/cotizaciones/[id]
                ├── confirmEventQuote(formData: { startDate, endDate, quotedTotal })
                │   ├── Look up packageId; vendorBefore = pkg.vendorDaysBefore ?? 1
                │   │   dismountAfter = pkg.dismountDaysAfter ?? 1
                │   │   parkingPropertyId = pkg.parkingPropertyId (if ≠ event property)
                │   │
                │   ├── propertyDates  = [startDate − vendorBefore … endDate + dismountAfter]
                │   │   parkingDates   = [startDate … endDate]   (only if parkingPropertyId)
                │   │
                │   ├── CONFLICT GATE — findConflictsForQuote() on BOTH ranges:
                │   │     SELECT blocked_dates WHERE propertyId IN (event, parking)
                │   │       AND date IN (window), filter rows where eventQuoteId ≠ this
                │   │   ├── conflicts > 0 → redirect ?error=conflict&dates=… (NO write)
                │   │   └── conflicts = 0 → continue
                │   │
                │   ├── db.transaction():
                │   │     INSERT blocked_dates (event window)  reason='event'
                │   │     INSERT blocked_dates (parking range) reason='event_dependency',
                │   │            sourcePropertyId=event property   [if parkingPropertyId]
                │   │            (both ON CONFLICT DO NOTHING — idempotent re-confirm)
                │   │     UPDATE quote → status='confirmed', confirmedStartDate/EndDate,
                │   │            quotedTotalCents
                │   │   └── tx throws → redirect ?error=persist (nothing committed)
                │   │
                │   ├── send EventQuoteConfirmedUser email
                │   └── revalidate /admin/cotizaciones /admin /admin/calendario + public slugs
                │
                ├── rejectEventQuote(formData: { notes })
                │   ├── UPDATE quote → status='rejected', adminNotes
                │   ├── clearBlocksForQuote(id): DELETE blocked_dates WHERE eventQuoteId=id
                │   └── send EventQuoteRejectedUser (WhatsApp = whatsappEvents ?? whatsapp)
                │
                └── cancelEventQuote(formData: { notes })
                    ├── UPDATE quote → status='cancelled', adminNotes
                    └── clearBlocksForQuote(id)
```

The conflict gate is **hard, no override** — exactly like reservations. A non-owned block anywhere in the vendor+event+dismount window (or the parking range) aborts the confirm and redirects to `?error=conflict&dates=YYYY-MM-DD,…`; the detail page renders the offending dates. The insert+update run inside one `db.transaction()` so a failed write commits nothing (`?error=persist`).

| Status enum | Meaning |
|---|---|
| `pending` | New, awaiting admin |
| `in_conversation` | Customer is replying / negotiating |
| `quoted` | Admin sent a quote, awaiting decision |
| `confirmed` | Final, blocks written |
| `rejected` | Admin declined |
| `cancelled` | Customer cancelled, blocks cleared |

Why blocking the Chalet matters: a customer booking the Chalet on a date where Casa Grande has a 100-pax event would arrive to a parking lot full of event guests. The dependency block prevents that overlap automatically.

---

## 7. Admin — calendar (interactive block grid)

```
/admin/calendario?propertyId=…
├── Property pills — switch which calendar is shown
├── Big 2-month react-day-picker grid (CalendarBlockGrid client component)
│   ├── Click a free day → toggleManualBlock(propertyId, isoDate)
│   │     INSERT blocked_dates VALUES (propertyId, date, 'manual', notes=null)
│   │     toast "YYYY-MM-DD bloqueado."
│   ├── Click a day already manually blocked → toggleManualBlock(...)
│   │     DELETE blocked_dates WHERE id = row.id
│   │     toast "YYYY-MM-DD liberado."
│   ├── Click a reservation/event/event_dependency day
│   │     → action returns { ok:false, reason:'not_manual' }
│   │     toast "bloqueo automático … no se puede modificar"
│   └── Legend: rose=manual · teal=reserva · gold=evento/dependencia
└── List of upcoming blocks (manual = removable via Quitar form;
    auto-generated = shown but locked)
```

`toggleManualBlock` lives in `src/features/blocked-dates/adminActions.ts`. The client wrapper is `src/components/admin/CalendarBlockGrid.tsx` and dispatches via `useTransition`. Every mutation runs `revalidateForProperty(propertyId)` → revalidates `/admin/calendario`, `/admin`, and `/${property.slug}` so the public availability calendar updates immediately.

The original "Desde / Hasta / Motivo" range form (`addManualBlock`) is kept as a server action for batch inserts — currently no UI surfaces it, but the action remains valid for scripts / future bulk forms.

---

## 8. Admin — read-only views

| Path | Shows |
|---|---|
| `/admin` | "Panel" — 4 stat tiles (pending res, confirmed res, pending quotes, confirmed quotes) + recent reservations + recent quotes |
| `/admin/propiedades` | Card grid with stats per property |
| `/admin/propiedades/[slug]` | Modalities (with `labelForMask(dayMask)` + `formatPEN`), packages, rooms, amenities, rules |
| `/admin/ajustes` | **Editable** brand settings form |

### Settings (`/admin/ajustes`) — editable

`SettingsForm.tsx` (`useActionState` → `updateSettings`, `src/features/content/adminActions.ts`) writes: admin email, contact email, whatsapp, whatsapp-events, attention hours, instagram/tiktok/facebook, cancellation policy, event add-ons note. All Zod-validated; on save it revalidates `/admin/ajustes`, `/admin`, `/contacto`, `/politicas`. **Payment-methods JSON editing was removed** from the UI and from the action schema — `paymentMethods` is left untouched on UPDATE and defaulted to `[]` on the first INSERT (the column is `NOT NULL`). Property/room/amenity/rule editing and media upload are still deferred to the Phase 1 follow-up.

---

## 9. SEO + metadata

| Asset | File | Notes |
|---|---|---|
| `sitemap.xml` | `src/app/sitemap.ts` | Static pages + per-property + per-eventos when enabled |
| `robots.txt` | `src/app/robots.ts` | Allow `/`, disallow `/admin /auth /api` |
| Root OG | `src/app/opengraph-image.tsx` | Edge runtime, 1200×630 gradient PNG |
| Per-property OG | `src/app/(public)/[propertySlug]/opengraph-image.tsx` | Edge runtime, name + tagline |
| JSON-LD | `src/components/property/PropertyJsonLd.tsx` | `LodgingBusiness` with address, geo, petsAllowed, maxAttendeeCapacity, priceRange |
| Per-page metadata | Each `page.tsx` exports `generateMetadata` or static `metadata` | Spanish titles + descriptions |

Admin and auth pages export `robots: { index: false, follow: false }`.

---

## 10. What still has to happen for production

1. **Phase 1 db swap (partial)** — reservations, blocked_dates, event-quotes, and settings already write to DB (with mock fallback on read). Still pending: properties/rooms/amenities/rules CRUD and the read queries for those tables (still seed-backed).
2. **Admin write UI** — `/admin/propiedades/[slug]/edit`, media upload to Supabase Storage. (Settings editing is done.)
3. **Connection pooling in prod** — point `DATABASE_URL` at the Supabase **transaction pooler** (port 6543; `prepare:false` is already set). The session pooler caps at 15 clients. The dev client is a `globalThis` singleton — restart `pnpm dev` after editing `src/db/index.ts`.
4. **Email sender** — verify the `casacampo.pe` domain in Resend (or set `RESEND_FROM_EMAIL` to a verified sender); otherwise sends fail with `403 … not authorized to send`. `send()` swallows the error, so flows don't break — but no mail goes out.
5. **Deploy (Phase 8)** — Vercel + Supabase + Resend domain DNS + production domain.
