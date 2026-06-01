import Link from "next/link";
import { ArrowRight, CalendarDays, Sparkles } from "lucide-react";
import { countReservationsByStatus, listReservations } from "@/features/reservations/queries";
import { countEventQuotesByStatus, listEventQuotes } from "@/features/event-quotes/queries";
import { getActiveProperties } from "@/features/properties/queries";
import { formatPEN } from "@/lib/money";

export const metadata = { title: "Panel" };

export default async function AdminDashboardPage() {
  const [resCounts, qCounts, recentRes, recentQuotes, properties] =
    await Promise.all([
      countReservationsByStatus(),
      countEventQuotesByStatus(),
      listReservations(),
      listEventQuotes(),
      getActiveProperties(),
    ]);

  const propertyName = (id: string) =>
    properties.find((p) => p.id === id)?.shortName ?? id.slice(0, 6);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-semibold text-ink tracking-tight">
          Panel
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          Resumen de reservas y cotizaciones de eventos.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Reservas pendientes"
          value={resCounts.pending}
          href="/admin/reservas?status=pending"
          icon={<CalendarDays className="size-4 text-teal" />}
        />
        <StatCard
          label="Reservas confirmadas"
          value={resCounts.confirmed}
          href="/admin/reservas?status=confirmed"
          icon={<CalendarDays className="size-4 text-teal-deep" />}
        />
        <StatCard
          label="Cotizaciones pendientes"
          value={qCounts.pending}
          href="/admin/cotizaciones?status=pending"
          icon={<Sparkles className="size-4 text-gold" />}
        />
        <StatCard
          label="Eventos confirmados"
          value={qCounts.confirmed}
          href="/admin/cotizaciones?status=confirmed"
          icon={<Sparkles className="size-4 text-teal-deep" />}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Últimas reservas"
          link={{ href: "/admin/reservas", label: "Ver todas" }}
        >
          {recentRes.length === 0 ? (
            <p className="text-sm text-ink/50">Sin reservas todavía.</p>
          ) : (
            <ul className="divide-y divide-line/60">
              {recentRes.slice(0, 5).map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/admin/reservas/${r.id}`}
                    className="flex items-center justify-between py-3 hover:bg-teal-soft/40 -mx-2 px-2 rounded"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {r.firstName} {r.lastName}
                      </p>
                      <p className="text-xs text-ink/60 mt-0.5">
                        {propertyName(r.propertyId)} · {r.checkIn} → {r.checkOut} · {r.guests} pers.
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium tabular-nums text-teal-deep">
                        {formatPEN(r.totalCents)}
                      </p>
                      <StatusBadge status={r.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Cotizaciones recientes"
          link={{ href: "/admin/cotizaciones", label: "Ver todas" }}
        >
          {recentQuotes.length === 0 ? (
            <p className="text-sm text-ink/50">Sin cotizaciones todavía.</p>
          ) : (
            <ul className="divide-y divide-line/60">
              {recentQuotes.slice(0, 5).map((q) => (
                <li key={q.id}>
                  <Link
                    href={`/admin/cotizaciones/${q.id}`}
                    className="flex items-center justify-between py-3 hover:bg-teal-soft/40 -mx-2 px-2 rounded"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {q.firstName} {q.lastName}
                      </p>
                      <p className="text-xs text-ink/60 mt-0.5">
                        {propertyName(q.propertyId)} · {q.eventType} ·{" "}
                        {q.estimatedGuests} pers.
                        {q.tentativeDate && ` · ${q.tentativeDate}`}
                      </p>
                    </div>
                    <StatusBadge status={q.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  icon,
}: {
  label: string;
  value: number;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-line/60 bg-bg p-5 hover:border-teal-deep/40 transition-colors block"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-ink/55">
          {label}
        </span>
        {icon}
      </div>
      <p className="mt-3 text-3xl font-semibold text-ink tabular-nums">
        {value}
      </p>
    </Link>
  );
}

function Panel({
  title,
  link,
  children,
}: {
  title: string;
  link: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line/60 bg-bg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-medium text-ink">{title}</h2>
        <Link
          href={link.href}
          className="inline-flex items-center gap-1 text-xs text-teal-deep hover:underline"
        >
          {link.label}
          <ArrowRight className="size-3" />
        </Link>
      </div>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-gold/20 text-ink",
    confirmed: "bg-teal-soft text-teal-deep",
    rejected: "bg-rose-muted/30 text-ink",
    cancelled: "bg-line/40 text-ink/60",
    in_conversation: "bg-teal-soft/70 text-teal-deep",
    quoted: "bg-teal-soft/60 text-teal-deep",
  };
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider mt-1 ${
        styles[status] ?? "bg-teal-soft/50 text-ink"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
