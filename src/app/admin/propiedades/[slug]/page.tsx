import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { getPropertyBySlug } from "@/features/properties/queries";
import { getRoomsByProperty } from "@/features/rooms/queries";
import { getAmenitiesByProperty } from "@/features/amenities/queries";
import { getRulesByProperty } from "@/features/rules/queries";
import { getAllModalitiesByProperty } from "@/features/pricing/queries";
import { getEventPackagesByProperty } from "@/features/event-packages/queries";
import {
  createRule,
  deleteRule,
  toggleRuleActive,
  updateRule,
} from "@/features/rules/adminActions";
import {
  toggleModalityActive,
  updateModality,
} from "@/features/pricing/adminActions";
import { formatPEN } from "@/lib/money";
import { labelForMask } from "@/features/pricing/dayMask";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export const metadata = { title: "Propiedad" };

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const [rooms, amenities, rules, modalities, packages] = await Promise.all([
    getRoomsByProperty(property.id),
    getAmenitiesByProperty(property.id),
    getRulesByProperty(property.id),
    getAllModalitiesByProperty(property.id),
    getEventPackagesByProperty(property.id),
  ]);

  return (
    <div className="space-y-8 max-w-5xl">
      <Link
        href="/admin/propiedades"
        className="inline-flex items-center gap-1 text-sm text-ink/60 hover:text-teal-deep"
      >
        <ArrowLeft className="size-3.5" />
        Volver a propiedades
      </Link>

      <header className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-ink tracking-tight">
            {property.name}
          </h1>
          <p className="mt-1 text-sm text-ink/60 italic">{property.tagline}</p>
        </div>
        <Link
          href={`/${property.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1 text-sm text-teal-deep hover:underline"
        >
          Ver pública
          <ExternalLink className="size-3.5" />
        </Link>
      </header>

      <Panel
        title={`Tarifas (${modalities.length})`}
        action={
          <Link
            href={`/${property.slug}#pricing`}
            target="_blank"
            className="text-xs text-teal-deep hover:underline"
          >
            Ver tabla pública
          </Link>
        }
      >
        <ul className="divide-y divide-line/50">
          {modalities.map((m) => (
            <li key={m.id} className="py-3">
              <form
                action={updateModality}
                className="grid gap-2 sm:grid-cols-[1fr_120px_90px_auto] sm:items-center"
              >
                <input type="hidden" name="id" value={m.id} />
                <div className={m.active ? "" : "opacity-50"}>
                  <p className="text-sm font-medium text-ink">{m.name}</p>
                  <p className="text-xs text-ink/60 mt-0.5">
                    {labelForMask(m.dayMask)} ·{" "}
                    {m.kind === "per_night" ? "por noche" : "paquete"}
                    {m.capacityTier && ` · hasta ${m.capacityTier} personas`}
                  </p>
                </div>
                <label className="flex items-center gap-1 text-xs text-ink/60">
                  <span className="text-ink/40">S/</span>
                  <Input
                    name="price"
                    type="number"
                    step="1"
                    min="0"
                    defaultValue={(m.priceCents / 100).toString()}
                    className="bg-bg text-sm tabular-nums"
                  />
                </label>
                <label
                  className="flex items-center gap-1 text-xs text-ink/50"
                  title="Noches mínimas"
                >
                  min
                  <Input
                    name="minNights"
                    type="number"
                    min="1"
                    defaultValue={m.minNights}
                    className="bg-bg text-xs tabular-nums"
                  />
                </label>
                <button
                  type="submit"
                  className="rounded-full bg-teal-soft text-teal-deep px-3 py-1.5 text-xs font-medium hover:bg-teal-soft/70 transition-colors"
                >
                  Guardar
                </button>
              </form>
              <form action={toggleModalityActive} className="mt-2">
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="active" value={String(m.active)} />
                <button
                  type="submit"
                  className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-wider transition-colors ${
                    m.active
                      ? "bg-teal-deep/10 text-teal-deep hover:bg-teal-deep/20"
                      : "bg-line/30 text-ink/60 hover:bg-line/50"
                  }`}
                >
                  {m.active ? "Activa" : "Inactiva"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      </Panel>

      {packages.length > 0 && (
        <Panel title={`Paquetes de eventos (${packages.length})`}>
          <ul className="divide-y divide-line/50">
            {packages.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-baseline justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{p.name}</p>
                  <p className="text-xs text-ink/60 mt-0.5">
                    Hasta {p.maxGuests} personas · hospedaje incluye{" "}
                    {p.includesLodgingCapacity}
                  </p>
                </div>
                <p className="tabular-nums font-medium text-teal-deep">
                  {formatPEN(p.priceCents)}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Panel title={`Habitaciones (${rooms.length})`}>
          <ul className="space-y-2 text-sm">
            {rooms.map((r) => (
              <li key={r.id} className="flex justify-between">
                <span className="text-ink/85">{r.name}</span>
                <span className="text-ink/55 text-xs">{r.floor}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title={`Amenidades (${amenities.length})`}>
          <ul className="flex flex-wrap gap-2">
            {amenities.map((a) => (
              <li
                key={a.id}
                className="rounded-full bg-sand/60 text-ink/75 px-3 py-0.5 text-xs"
              >
                {a.name}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title={`Reglas (${rules.length})`}>
        <ul className="divide-y divide-line/60">
          {rules.map((r) => (
            <li key={r.id} className="py-3">
              <form
                action={updateRule}
                className="grid gap-2 sm:grid-cols-[140px_1fr_60px_auto] sm:items-start"
              >
                <input type="hidden" name="id" value={r.id} />
                <Input
                  name="category"
                  defaultValue={r.category}
                  className="bg-bg text-xs"
                />
                <Textarea
                  name="body"
                  defaultValue={r.body}
                  rows={2}
                  className="bg-bg text-sm"
                />
                <Input
                  name="order"
                  type="number"
                  defaultValue={r.order}
                  className="bg-bg text-xs tabular-nums"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="rounded-full bg-teal-soft text-teal-deep px-3 py-1.5 text-xs font-medium hover:bg-teal-soft/70 transition-colors"
                  >
                    Guardar
                  </button>
                </div>
              </form>
              <div className="mt-2 flex items-center gap-2">
                <form action={toggleRuleActive}>
                  <input type="hidden" name="id" value={r.id} />
                  <input
                    type="hidden"
                    name="active"
                    value={String(r.active)}
                  />
                  <button
                    type="submit"
                    className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-wider transition-colors ${
                      r.active
                        ? "bg-teal-deep/10 text-teal-deep hover:bg-teal-deep/20"
                        : "bg-line/30 text-ink/60 hover:bg-line/50"
                    }`}
                  >
                    {r.active ? "Activa" : "Inactiva"}
                  </button>
                </form>
                <form action={deleteRule}>
                  <input type="hidden" name="id" value={r.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 rounded-full border border-line/60 px-2.5 py-1 text-[10px] uppercase tracking-wider text-ink/60 hover:border-rose-muted hover:text-rose-muted"
                  >
                    <Trash2 className="size-3" /> Eliminar
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>

        <form
          action={createRule}
          className="mt-6 pt-6 border-t border-line/60 grid gap-2 sm:grid-cols-[140px_1fr_60px_auto] sm:items-start"
        >
          <input type="hidden" name="propertyId" value={property.id} />
          <Input
            name="category"
            placeholder="Categoría"
            className="bg-bg text-xs"
            required
          />
          <Textarea
            name="body"
            placeholder="Texto de la regla"
            rows={2}
            className="bg-bg text-sm"
            required
          />
          <Input
            name="order"
            type="number"
            defaultValue={rules.length}
            className="bg-bg text-xs tabular-nums"
          />
          <button
            type="submit"
            className="rounded-full bg-teal-deep text-bg px-4 py-1.5 text-xs font-medium hover:bg-teal transition-colors"
          >
            Agregar regla
          </button>
        </form>
      </Panel>
    </div>
  );
}

function Panel({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line/60 bg-bg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm uppercase tracking-wider text-ink/55">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  );
}
