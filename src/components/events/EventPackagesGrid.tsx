import { Users, Car } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { formatPEN } from "@/lib/money";
import type { EventPackage } from "@/db/seed";

export function EventPackagesGrid({
  packages,
}: {
  packages: EventPackage[];
}) {
  if (packages.length === 0) return null;

  return (
    <section id="paquetes" className="bg-sand/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <FadeIn>
          <p className="text-sm uppercase tracking-widest text-teal-deep mb-4">
            Paquetes
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold text-ink tracking-tight">
            Encuentra tu escala
          </h2>
          <p className="mt-4 text-ink/60 max-w-2xl">
            Cada paquete reserva la casa completa para tu evento. El número
            indica la cantidad máxima de invitados.
          </p>
        </FadeIn>

        <div className="mt-14 -mx-6 px-6 overflow-x-auto md:overflow-visible">
          <div className="flex md:grid md:grid-cols-4 gap-6 min-w-max md:min-w-0">
            {packages.map((p) => (
              <article
                key={p.id}
                className="w-72 md:w-auto shrink-0 rounded-2xl bg-bg border border-line/60 p-6 flex flex-col"
              >
                <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-teal-soft text-teal-deep px-3 py-1 text-xs font-medium">
                  <Users className="size-3.5" />
                  Hasta {p.maxGuests}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-ink">
                  {p.name}
                </h3>
                <p className="mt-1 text-sm text-ink/60">
                  Hospedaje incluido para {p.includesLodgingCapacity} personas.
                </p>
                <p className="mt-6 text-3xl font-semibold text-teal-deep tabular-nums">
                  {formatPEN(p.priceCents)}
                </p>
                {p.parkingPropertyId && (
                  <p className="mt-3 inline-flex items-start gap-1.5 text-xs text-ink/65">
                    <Car className="size-3.5 mt-0.5 text-teal" />
                    Estacionamiento en Chalet
                    {p.parkingCarsCapacity
                      ? ` (hasta ${p.parkingCarsCapacity} autos)`
                      : ""}
                  </p>
                )}
                {p.notes && (
                  <p className="mt-3 text-xs text-ink/55 leading-relaxed">
                    {p.notes}
                  </p>
                )}
                <div className="mt-auto pt-6">
                  <a
                    href="#cotizar"
                    className="block w-full text-center rounded-full bg-teal-deep text-bg px-4 py-2.5 text-sm font-medium hover:bg-teal transition-colors"
                  >
                    Cotizar
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
