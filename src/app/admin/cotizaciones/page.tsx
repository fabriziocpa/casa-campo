import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { listEventQuotes } from "@/features/event-quotes/queries";
import { getActiveProperties } from "@/features/properties/queries";
import {
  setEventQuoteStatus,
  rejectEventQuote,
} from "@/features/event-quotes/adminActions";
import type { EventQuote } from "@/db/seed";

export const metadata = { title: "Cotizaciones" };

type Status = EventQuote["status"];

const STATUSES: { value: Status | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendientes" },
  { value: "in_conversation", label: "En conversación" },
  { value: "quoted", label: "Cotizadas" },
  { value: "confirmed", label: "Confirmadas" },
  { value: "rejected", label: "Rechazadas" },
  { value: "cancelled", label: "Canceladas" },
];

const STATUS_LABEL: Record<Status, string> = {
  pending: "Pendiente",
  in_conversation: "En conversación",
  quoted: "Cotizada",
  confirmed: "Confirmada",
  rejected: "Rechazada",
  cancelled: "Cancelada",
};

export default async function CotizacionesListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status = (sp.status as Status | undefined) ?? undefined;

  const [quotes, properties] = await Promise.all([
    listEventQuotes({
      status: status && status !== ("all" as Status) ? status : undefined,
    }),
    getActiveProperties(),
  ]);

  const propertyName = (id: string) =>
    properties.find((p) => p.id === id)?.shortName ?? id.slice(0, 6);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-ink tracking-tight">
          Cotizaciones de eventos
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          {quotes.length}{" "}
          {quotes.length === 1 ? "cotización" : "cotizaciones"}
        </p>
      </header>

      <nav className="flex flex-wrap gap-2">
        {STATUSES.map((s) => {
          const href =
            s.value === "all"
              ? "/admin/cotizaciones"
              : `/admin/cotizaciones?status=${s.value}`;
          const active =
            (s.value === "all" && !status) || s.value === status;
          return (
            <Link
              key={s.value}
              href={href}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? "bg-teal-deep text-bg"
                  : "border border-line/60 text-ink/70 hover:border-teal-deep/40"
              }`}
            >
              {s.label}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-xl border border-line/60 bg-bg overflow-hidden">
        {quotes.length === 0 ? (
          <p className="p-8 text-sm text-ink/50 text-center">
            No hay cotizaciones con este filtro.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-teal-soft/50 text-teal-deep text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Cliente</th>
                <th className="text-left px-4 py-3">Tipo</th>
                <th className="text-left px-4 py-3">Casa</th>
                <th className="text-left px-4 py-3">Fecha tentativa</th>
                <th className="text-right px-4 py-3">Pers.</th>
                <th className="text-left px-4 py-3">Estado</th>
                <th className="text-right px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/50">
              {quotes.map((q) => (
                <tr key={q.id} className="hover:bg-teal-soft/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/cotizaciones/${q.id}`}
                      className="font-medium text-ink hover:text-teal-deep"
                    >
                      {q.firstName} {q.lastName}
                    </Link>
                    <p className="text-xs text-ink/50">{q.email}</p>
                  </td>
                  <td className="px-4 py-3 text-ink/75 capitalize">
                    {q.eventType}
                  </td>
                  <td className="px-4 py-3 text-ink/75">
                    {propertyName(q.propertyId)}
                  </td>
                  <td className="px-4 py-3 text-ink/75">
                    {q.tentativeDate ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {q.estimatedGuests}
                  </td>
                  <td className="px-4 py-3">
                    <QuoteStatusBadge status={q.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <InlineTransitions quote={q} />
                      <Link
                        href={`/admin/cotizaciones/${q.id}`}
                        className="inline-flex items-center rounded-full text-teal-deep hover:bg-teal-soft/50 p-1.5 transition-colors"
                        aria-label="Abrir cotización"
                      >
                        <ChevronRight className="size-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function InlineTransitions({ quote }: { quote: EventQuote }) {
  // Same affordance pattern as /admin/reservas — quick transitions inline,
  // full confirm/cancel forms live on the detail page (need dates).
  if (quote.status === "rejected" || quote.status === "cancelled") return null;
  if (quote.status === "confirmed") return null;

  const next: { label: string; status: Exclude<Status, "rejected" | "cancelled" | "confirmed"> } | null =
    quote.status === "pending"
      ? { label: "En conversación", status: "in_conversation" }
      : quote.status === "in_conversation"
        ? { label: "Marcar cotizada", status: "quoted" }
        : null;

  return (
    <>
      {next && (
        <form action={setEventQuoteStatus}>
          <input type="hidden" name="id" value={quote.id} />
          <input type="hidden" name="status" value={next.status} />
          <button
            type="submit"
            className="rounded-full bg-teal-soft text-teal-deep px-3 py-1 text-xs font-medium hover:bg-teal-soft/70 transition-colors"
            title={`Mover a ${next.label.toLowerCase()}`}
          >
            {next.label}
          </button>
        </form>
      )}
      <form action={rejectEventQuote}>
        <input type="hidden" name="id" value={quote.id} />
        <button
          type="submit"
          className="rounded-full border border-line/60 px-3 py-1 text-xs text-ink/70 hover:border-rose-muted hover:text-rose-muted transition-colors"
          title="Rechazar"
        >
          Rechazar
        </button>
      </form>
    </>
  );
}

function QuoteStatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    pending: "bg-gold/20 text-ink ring-gold/40",
    in_conversation: "bg-teal-soft/70 text-teal-deep ring-teal-deep/30",
    quoted: "bg-teal-soft text-teal-deep ring-teal-deep/40",
    confirmed: "bg-teal-deep text-bg ring-teal-deep",
    rejected: "bg-rose-muted/30 text-ink ring-rose-muted/50",
    cancelled: "bg-line/40 text-ink/60 ring-line",
  };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider ring-1 ${styles[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
