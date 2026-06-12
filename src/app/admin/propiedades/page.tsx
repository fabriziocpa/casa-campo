import Link from "next/link";
import { ExternalLink, ArrowRight } from "lucide-react";
import { getActiveProperties } from "@/features/properties/queries";
import { getRoomsByProperty } from "@/features/rooms/queries";
import { getActiveModalitiesByProperty } from "@/features/pricing/queries";

export const metadata = { title: "Propiedades" };

export default async function PropertiesListPage() {
  const properties = await getActiveProperties();
  const enriched = await Promise.all(
    properties.map(async (p) => {
      const [rooms, modalities] = await Promise.all([
        getRoomsByProperty(p.id),
        getActiveModalitiesByProperty(p.id),
      ]);
      return { property: p, roomCount: rooms.length, modalityCount: modalities.length };
    }),
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-ink tracking-tight">
          Propiedades
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          {properties.length} casas activas.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {enriched.map(({ property, roomCount, modalityCount }) => (
          <div
            key={property.id}
            className="rounded-xl border border-line/60 bg-bg p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-ink">
                  {property.name}
                </h2>
                <p className="text-sm text-ink/60 mt-1 italic">
                  {property.tagline}
                </p>
              </div>
              <Link
                href={`/${property.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-teal-deep hover:underline"
              >
                Ver pública
                <ExternalLink className="size-3" />
              </Link>
            </div>

            <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wider text-ink/50">
                  Capacidad
                </dt>
                <dd className="mt-1 font-medium tabular-nums">
                  {property.baseCapacity === property.maxCapacity
                    ? property.maxCapacity
                    : `${property.baseCapacity}–${property.maxCapacity}`}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-ink/50">
                  Habitaciones
                </dt>
                <dd className="mt-1 font-medium tabular-nums">{roomCount}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-ink/50">
                  Tarifas
                </dt>
                <dd className="mt-1 font-medium tabular-nums">
                  {modalityCount}
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-wrap gap-2">
              <Tag>
                {property.petPolicy === "pet_friendly"
                  ? "Pet-friendly"
                  : property.petPolicy === "by_request"
                    ? "Mascotas con acuerdo"
                    : "Sin mascotas"}
              </Tag>
              {property.eventsEnabled && <Tag>Eventos habilitados</Tag>}
            </div>

            <Link
              href={`/admin/propiedades/${property.slug}`}
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-teal-deep hover:gap-3 transition-all"
            >
              Editar
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-sand/60 text-ink/75 px-3 py-0.5 text-xs">
      {children}
    </span>
  );
}
