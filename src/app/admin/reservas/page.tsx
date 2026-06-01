import Link from "next/link";
import { listReservations } from "@/features/reservations/queries";
import { getActiveProperties } from "@/features/properties/queries";
import type { Reservation } from "@/db/seed";
import { ReservasTable, type ReservaRow } from "./ReservasTable";

export const metadata = { title: "Reservas" };

type Status = Reservation["status"];

const STATUSES: { value: Status | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendientes" },
  { value: "confirmed", label: "Confirmadas" },
  { value: "rejected", label: "Rechazadas" },
  { value: "cancelled", label: "Canceladas" },
];

export default async function ReservasListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; propertyId?: string }>;
}) {
  const sp = await searchParams;
  const status = (sp.status as Status | undefined) ?? undefined;
  const propertyId = sp.propertyId;

  const [reservations, properties] = await Promise.all([
    listReservations({
      status: status && status !== ("all" as Status) ? status : undefined,
      propertyId,
    }),
    getActiveProperties(),
  ]);

  const propertyName = (id: string) =>
    properties.find((p) => p.id === id)?.shortName ?? id.slice(0, 6);

  const rows: ReservaRow[] = reservations.map((r) => ({
    id: r.id,
    firstName: r.firstName,
    lastName: r.lastName,
    email: r.email,
    propertyName: propertyName(r.propertyId),
    checkIn: r.checkIn,
    checkOut: r.checkOut,
    guests: r.guests,
    totalCents: r.totalCents,
    status: r.status,
  }));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-ink tracking-tight">
            Reservas
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            {reservations.length}{" "}
            {reservations.length === 1 ? "reserva" : "reservas"}
          </p>
        </div>
      </header>

      <nav className="flex flex-wrap gap-2">
        {STATUSES.map((s) => {
          const href =
            s.value === "all"
              ? "/admin/reservas"
              : `/admin/reservas?status=${s.value}`;
          const active = (s.value === "all" && !status) || s.value === status;
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
            No hay reservas con este filtro.
          </p>
        </div>
      ) : (
        <ReservasTable rows={rows} />
      )}
    </div>
  );
}
