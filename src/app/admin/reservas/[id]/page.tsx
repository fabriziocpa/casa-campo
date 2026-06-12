import { notFound } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { getReservationById } from "@/features/reservations/queries";
import { getPropertyBySlug } from "@/features/properties/queries";
import { getActiveProperties } from "@/features/properties/queries";
import { formatPEN } from "@/lib/money";
import { DetailDangerZone } from "@/components/admin/DetailDangerZone";
import {
  confirmReservation,
  bulkRejectReservations,
  bulkCancelReservations,
  bulkDeleteReservations,
} from "@/features/reservations/adminActions";

export const metadata = { title: "Reserva" };

export default async function ReservaDetailPage({
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
  const reservation = await getReservationById(id);
  if (!reservation) notFound();

  const properties = await getActiveProperties();
  const property = properties.find((p) => p.id === reservation.propertyId);
  const propertyPage = property
    ? await getPropertyBySlug(property.slug)
    : null;

  const conflictDates =
    sp.error === "conflict" && sp.dates
      ? sp.dates.split(",").filter(Boolean)
      : [];

  return (
    <div className="space-y-8 max-w-4xl">
      <Link
        href="/admin/reservas"
        className="inline-flex items-center gap-1 text-sm text-ink/60 hover:text-teal-deep"
      >
        <ArrowLeft className="size-3.5" />
        Volver a reservas
      </Link>

      {conflictDates.length > 0 && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-muted/60 bg-rose-muted/10 p-4 text-sm text-ink"
        >
          <AlertTriangle className="size-5 text-rose-muted shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-rose-muted">
              No se confirmó: hay fechas en conflicto.
            </p>
            <p className="mt-1 text-ink/75">
              Las siguientes noches ya están bloqueadas por otra reserva,
              evento o bloqueo manual. Resuelve los conflictos antes de
              reintentar.
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

      {sp.confirmed === "1" && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-teal-deep/40 bg-teal-soft/40 p-4 text-sm text-ink"
        >
          <CheckCircle2 className="size-5 text-teal-deep shrink-0" />
          <p>Reserva confirmada y notificación enviada al huésped.</p>
        </div>
      )}

      <header className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-ink tracking-tight">
            {reservation.firstName} {reservation.lastName}
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            {property?.name ?? "—"} ·{" "}
            <span className="capitalize">{reservation.status}</span>
          </p>
        </div>
        <p className="text-2xl font-semibold tabular-nums text-teal-deep">
          {formatPEN(reservation.totalCents)}
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Estadía">
          <dl className="space-y-2 text-sm">
            <Row label="Check-in" value={reservation.checkIn} />
            <Row label="Check-out" value={reservation.checkOut} />
            <Row label="Noches" value={String(reservation.nights)} />
            <Row label="Huéspedes" value={String(reservation.guests)} />
            {reservation.capacityTier && (
              <Row label="Tier de capacidad" value={String(reservation.capacityTier)} />
            )}
          </dl>
        </Panel>

        <Panel title="Contacto">
          <dl className="space-y-2 text-sm">
            <Row
              label="Documento"
              value={`${reservation.docType} ${reservation.docNumber}`}
            />
            <Row label="Correo" value={reservation.email} />
            <Row label="Teléfono" value={reservation.phone} />
            {reservation.message && (
              <div className="pt-2 border-t border-line/60">
                <p className="text-xs uppercase tracking-wider text-ink/50">
                  Mensaje
                </p>
                <p className="mt-1 text-ink/85">{reservation.message}</p>
              </div>
            )}
          </dl>
        </Panel>
      </div>

      {reservation.adminNotes && (
        <Panel title="Notas internas">
          <p className="text-sm text-ink/85 whitespace-pre-wrap">
            {reservation.adminNotes}
          </p>
        </Panel>
      )}

      {reservation.status === "pending" && (
        <Panel title="Confirmar">
          <form action={confirmReservation}>
            <input type="hidden" name="id" value={reservation.id} />
            <button
              type="submit"
              className="rounded-full bg-teal-deep text-bg px-5 py-2 text-sm font-medium hover:bg-teal transition-colors"
            >
              Confirmar
            </button>
          </form>
          <p className="mt-3 text-xs text-ink/55">
            Al confirmar se verifica que no haya conflictos de fechas y se
            notifica al huésped.
          </p>
        </Panel>
      )}

      <Panel title="Otras acciones">
        <DetailDangerZone
          id={reservation.id}
          status={reservation.status}
          listHref="/admin/reservas"
          recipient="huésped"
          onReject={bulkRejectReservations}
          onCancel={bulkCancelReservations}
          onDelete={bulkDeleteReservations}
        />
      </Panel>

      {propertyPage && (
        <p className="text-xs text-ink/50">
          Ver casa pública:{" "}
          <Link
            href={`/${propertyPage.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-deep hover:underline"
          >
            /{propertyPage.slug}
          </Link>
        </p>
      )}
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
      <dd className="text-ink font-medium text-right">{value}</dd>
    </div>
  );
}
