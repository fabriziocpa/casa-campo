import { notFound } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { getEventQuoteById } from "@/features/event-quotes/queries";
import { getActiveProperties } from "@/features/properties/queries";
import { getEventPackagesByProperty } from "@/features/event-packages/queries";
import { formatPEN } from "@/lib/money";
import { DetailDangerZone } from "@/components/admin/DetailDangerZone";
import {
  confirmEventQuote,
  bulkRejectEventQuotes,
  bulkCancelEventQuotes,
  bulkDeleteEventQuotes,
} from "@/features/event-quotes/adminActions";

export const metadata = { title: "Cotización" };

export default async function CotizacionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    dates?: string;
    confirmed?: string;
  }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const quote = await getEventQuoteById(id);
  if (!quote) notFound();

  const [properties, packages] = await Promise.all([
    getActiveProperties(),
    getEventPackagesByProperty(quote.propertyId),
  ]);
  const property = properties.find((p) => p.id === quote.propertyId);
  const pkg = quote.packageId
    ? packages.find((p) => p.id === quote.packageId)
    : null;

  const conflictDates =
    sp.error === "conflict" && sp.dates
      ? sp.dates.split(",").filter(Boolean)
      : [];
  const persistError = sp.error === "persist";

  return (
    <div className="space-y-8 max-w-4xl">
      <Link
        href="/admin/cotizaciones"
        className="inline-flex items-center gap-1 text-sm text-ink/60 hover:text-teal-deep"
      >
        <ArrowLeft className="size-3.5" />
        Volver a cotizaciones
      </Link>

      {conflictDates.length > 0 && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-muted/60 bg-rose-muted/10 p-4 text-sm text-ink"
        >
          <AlertTriangle className="size-5 text-rose-muted shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-rose-muted">
              No se confirmó: fechas en conflicto.
            </p>
            <p className="mt-1 text-ink/75">
              Las siguientes fechas ya están bloqueadas por otra reserva,
              evento o bloqueo manual en la casa del evento o en el
              estacionamiento. Resuelve los conflictos antes de reintentar.
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {conflictDates.map((d) => (
                <li
                  key={d}
                  className="rounded-full bg-rose-muted/20 px-2.5 py-0.5 text-xs tabular-nums"
                >
                  {format(parseISO(d), "EEE d MMM", { locale: es })}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {persistError && (
        <div
          role="alert"
          className="rounded-xl border border-rose-muted/60 bg-rose-muted/10 p-4 text-sm text-ink"
        >
          <p className="font-medium text-rose-muted">
            Error al guardar la confirmación. Reintenta o revisa los logs.
          </p>
        </div>
      )}

      {sp.confirmed === "1" && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-teal-deep/40 bg-teal-soft/40 p-4 text-sm text-ink"
        >
          <CheckCircle2 className="size-5 text-teal-deep shrink-0" />
          <p>
            Evento confirmado y bloqueos aplicados
            {pkg?.parkingPropertyId ? " (incluye estacionamiento)" : ""}.
          </p>
        </div>
      )}

      <header className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-ink tracking-tight">
            {quote.firstName} {quote.lastName}
          </h1>
          <p className="mt-1 text-sm text-ink/60 capitalize">
            {quote.eventType} · {property?.name ?? "—"} ·{" "}
            <span className="capitalize">
              {quote.status.replace("_", " ")}
            </span>
          </p>
        </div>
        {quote.quotedTotalCents && (
          <p className="text-2xl font-semibold tabular-nums text-teal-deep">
            {formatPEN(quote.quotedTotalCents)}
          </p>
        )}
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Evento">
          <dl className="space-y-2 text-sm">
            <Row label="Tipo" value={quote.eventType} />
            <Row label="Personas estimadas" value={String(quote.estimatedGuests)} />
            <Row label="Fecha tentativa" value={quote.tentativeDate ?? "—"} />
            {pkg && <Row label="Paquete sugerido" value={pkg.name} />}
            {quote.confirmedStartDate && (
              <Row label="Inicio confirmado" value={quote.confirmedStartDate} />
            )}
            {quote.confirmedEndDate && (
              <Row label="Fin confirmado" value={quote.confirmedEndDate} />
            )}
          </dl>
        </Panel>

        <Panel title="Contacto">
          <dl className="space-y-2 text-sm">
            <Row label="Correo" value={quote.email} />
            <Row label="Teléfono" value={quote.phone} />
            {quote.message && (
              <div className="pt-2 border-t border-line/60">
                <p className="text-xs uppercase tracking-wider text-ink/50">
                  Mensaje
                </p>
                <p className="mt-1 text-ink/85 whitespace-pre-wrap">
                  {quote.message}
                </p>
              </div>
            )}
          </dl>
        </Panel>
      </div>

      {quote.adminNotes && (
        <Panel title="Notas internas">
          <p className="text-sm text-ink/85 whitespace-pre-wrap">
            {quote.adminNotes}
          </p>
        </Panel>
      )}

      {(quote.status === "pending" ||
        quote.status === "in_conversation" ||
        quote.status === "quoted") && (
        <Panel title="Confirmar evento">
          <form
            action={confirmEventQuote}
            className="grid gap-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
          >
            <input type="hidden" name="id" value={quote.id} />
            <div>
              <label className="text-xs uppercase tracking-wider text-ink/55">
                Inicio
              </label>
              <input
                type="date"
                name="startDate"
                required
                defaultValue={quote.tentativeDate ?? undefined}
                className="mt-1 h-9 w-full rounded-md border border-input bg-bg px-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-ink/55">
                Fin
              </label>
              <input
                type="date"
                name="endDate"
                required
                defaultValue={quote.tentativeDate ?? undefined}
                className="mt-1 h-9 w-full rounded-md border border-input bg-bg px-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-ink/55">
                Cotizado (centavos)
              </label>
              <input
                type="number"
                name="quotedTotal"
                min={0}
                defaultValue={quote.quotedTotalCents ?? undefined}
                className="mt-1 h-9 w-full rounded-md border border-input bg-bg px-3 text-sm tabular-nums"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-teal-deep text-bg px-5 py-2 text-sm font-medium hover:bg-teal transition-colors"
            >
              Confirmar
            </button>
          </form>
          <p className="mt-3 text-xs text-ink/55">
            Al confirmar se bloquean las fechas del evento (con vendor +
            dismount) y el estacionamiento en la otra casa si el paquete lo
            requiere. Si alguna fecha está tomada, la confirmación se aborta y
            se listan los conflictos.
          </p>
        </Panel>
      )}

      <Panel title="Otras acciones">
        <DetailDangerZone
          id={quote.id}
          status={quote.status}
          listHref="/admin/cotizaciones"
          recipient="cliente"
          onReject={bulkRejectEventQuotes}
          onCancel={bulkCancelEventQuotes}
          onDelete={bulkDeleteEventQuotes}
        />
      </Panel>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line/60 bg-bg p-6">
      <h2 className="text-sm uppercase tracking-wider text-ink/55 mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink/55">{label}</dt>
      <dd className="text-ink font-medium text-right capitalize">{value}</dd>
    </div>
  );
}
