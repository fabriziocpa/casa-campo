import Link from "next/link";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ExternalLink, Trash2 } from "lucide-react";
import { getActiveProperties } from "@/features/properties/queries";
import { listUpcomingBlocks } from "@/features/blocked-dates/dbQueries";
import { removeManualBlock } from "@/features/blocked-dates/adminActions";
import {
  CalendarBlockGrid,
  type BlockEntry,
} from "@/components/admin/CalendarBlockGrid";

export const metadata = { title: "Calendario" };

const REASON_LABEL: Record<string, string> = {
  manual: "Manual",
  reservation: "Reserva",
  event: "Evento",
  event_dependency: "Evento (cochera)",
};

export default async function CalendarioAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ propertyId?: string }>;
}) {
  const sp = await searchParams;
  const properties = await getActiveProperties();
  if (properties.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold text-ink">Calendario</h1>
        <p className="text-sm text-ink/60">No hay propiedades activas.</p>
      </div>
    );
  }

  const selected =
    properties.find((p) => p.id === sp.propertyId) ?? properties[0];
  const today = format(new Date(), "yyyy-MM-dd");
  const blocks = await listUpcomingBlocks(selected.id, today);

  const blockEntries: BlockEntry[] = blocks.map((b) => ({
    date: b.date,
    reason: b.reason,
    notes: b.notes,
    reservationId: b.reservationId,
    eventQuoteId: b.eventQuoteId,
  }));

  return (
    <div className="space-y-8 max-w-5xl">
      <header>
        <h1 className="text-3xl font-semibold text-ink">Calendario</h1>
        <p className="mt-2 text-sm text-ink/60">
          Haz click en un día disponible para bloquearlo. Click en una reserva
          o evento para abrir su detalle. Click de nuevo en un bloqueo manual
          para liberar.
        </p>
      </header>

      <nav className="flex flex-wrap gap-2">
        {properties.map((p) => {
          const active = p.id === selected.id;
          return (
            <a
              key={p.id}
              href={`/admin/calendario?propertyId=${p.id}`}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                active
                  ? "bg-teal-deep text-bg"
                  : "border border-line/60 text-ink/75 hover:bg-teal-soft/60"
              }`}
            >
              {p.shortName}
            </a>
          );
        })}
      </nav>

      <section className="rounded-xl border border-line/60 bg-bg p-6">
        <h2 className="text-lg font-semibold text-ink mb-4">
          {selected.shortName} — bloqueos
        </h2>
        <CalendarBlockGrid
          propertyId={selected.id}
          propertyName={selected.shortName}
          blocks={blockEntries}
        />
      </section>

      <section className="rounded-xl border border-line/60 bg-bg p-6">
        <h2 className="text-lg font-semibold text-ink">
          Bloqueos vigentes{" "}
          <span className="text-ink/40 font-normal">({blocks.length})</span>
        </h2>
        {blocks.length === 0 ? (
          <p className="mt-4 text-sm text-ink/60">
            No hay bloqueos para esta propiedad.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line/60">
            {blocks.map((b) => {
              const reasonLabel = REASON_LABEL[b.reason] ?? b.reason;
              const removable = b.reason === "manual";
              const link =
                b.reason === "reservation" && b.reservationId
                  ? `/admin/reservas/${b.reservationId}`
                  : (b.reason === "event" || b.reason === "event_dependency") &&
                      b.eventQuoteId
                    ? `/admin/cotizaciones/${b.eventQuoteId}`
                    : null;
              return (
                <li
                  key={b.id}
                  className="flex items-center justify-between py-3 text-sm gap-4"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-medium text-ink tabular-nums">
                      {format(parseISO(b.date), "EEE d MMM yyyy", {
                        locale: es,
                      })}
                    </span>
                    <span className="text-xs text-ink/60 truncate">
                      {reasonLabel}
                      {b.notes ? ` · ${b.notes}` : ""}
                    </span>
                  </div>
                  {removable ? (
                    <form action={removeManualBlock}>
                      <input type="hidden" name="id" value={b.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-md border border-line/60 px-3 py-1.5 text-xs text-ink/75 hover:bg-rose-muted/10 hover:text-rose-muted"
                      >
                        <Trash2 className="size-3.5" />
                        Quitar
                      </button>
                    </form>
                  ) : link ? (
                    <Link
                      href={link}
                      className="inline-flex items-center gap-1.5 rounded-md border border-line/60 px-3 py-1.5 text-xs text-teal-deep hover:bg-teal-soft/40"
                    >
                      <ExternalLink className="size-3.5" />
                      Abrir{" "}
                      {b.reason === "reservation" ? "reserva" : "cotización"}
                    </Link>
                  ) : (
                    <span className="text-xs text-ink/40">Auto-generado</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
