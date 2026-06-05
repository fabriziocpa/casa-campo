import Link from "next/link";
import { listEventQuotes } from "@/features/event-quotes/queries";
import { getActiveProperties } from "@/features/properties/queries";
import type { EventQuote } from "@/db/seed";
import { CotizacionesTable, type CotizacionRow } from "./CotizacionesTable";

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

  const rows: CotizacionRow[] = quotes.map((q) => ({
    id: q.id,
    firstName: q.firstName,
    lastName: q.lastName,
    email: q.email,
    propertyName: propertyName(q.propertyId),
    eventType: q.eventType,
    tentativeDate: q.tentativeDate ?? null,
    estimatedGuests: q.estimatedGuests,
    status: q.status,
  }));

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

      {rows.length === 0 ? (
        <div className="rounded-xl border border-line/60 bg-bg overflow-hidden">
          <p className="p-8 text-sm text-ink/50 text-center">
            No hay cotizaciones con este filtro.
          </p>
        </div>
      ) : (
        <CotizacionesTable rows={rows} />
      )}
    </div>
  );
}
