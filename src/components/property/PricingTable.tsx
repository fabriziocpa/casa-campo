import { FadeIn } from "@/components/motion/FadeIn";
import { labelForMask } from "@/features/pricing/dayMask";
import { formatPEN } from "@/lib/money";
import type { PricingModality } from "@/db/seed";

type Group = {
  key: string;
  title: string;
  subtitle?: string;
  rows: PricingModality[];
};

function groupModalities(modalities: PricingModality[]): Group[] {
  const perNight = modalities.filter((m) => m.kind === "per_night");
  const fullPackage = modalities.filter((m) => m.kind === "full_package");
  const groups: Group[] = [];

  if (perNight.length > 0) {
    const minN = Math.min(...perNight.map((m) => m.minNights));
    groups.push({
      key: "per_night",
      title: "Por noche",
      subtitle:
        minN > 1
          ? `Mínimo ${minN} noches · ingreso 3pm, salida 12pm`
          : "Tarifa nocturna estándar",
      rows: perNight,
    });
  }

  if (fullPackage.length > 0) {
    const byTier = new Map<number | "none", PricingModality[]>();
    for (const m of fullPackage) {
      const k = m.capacityTier ?? "none";
      const list = byTier.get(k) ?? [];
      list.push(m);
      byTier.set(k, list);
    }
    const tierKeys = Array.from(byTier.keys()).sort((a, b) => {
      if (a === "none") return -1;
      if (b === "none") return 1;
      return a - b;
    });
    for (const tier of tierKeys) {
      const rows = byTier.get(tier)!;
      const title =
        tier === "none"
          ? "Paquete 2 días 1 noche"
          : `Paquete 2 días 1 noche · ${tier} personas`;
      groups.push({
        key: `full_${tier}`,
        title,
        subtitle: "Horario full · ingreso 9am, salida 6pm del día siguiente",
        rows,
      });
    }
  }

  return groups;
}

export function PricingTable({
  modalities,
}: {
  modalities: PricingModality[];
}) {
  if (modalities.length === 0) return null;
  const groups = groupModalities(modalities);

  return (
    <section id="tarifas" className="bg-sand/40 py-24">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <p className="text-sm uppercase tracking-widest text-teal-deep mb-4">
            Tarifas
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold text-ink tracking-tight">
            Modalidades disponibles
          </h2>
          <p className="mt-4 text-ink/60">
            Todos los precios incluyen impuestos y limpieza final.
          </p>
        </FadeIn>

        <div className="mt-14 space-y-10">
          {groups.map((group) => (
            <div
              key={group.key}
              className="rounded-2xl bg-bg border border-line/60 overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-line/60 bg-bg">
                <p className="text-base font-semibold text-ink">{group.title}</p>
                {group.subtitle && (
                  <p className="text-sm text-ink/60 mt-1">{group.subtitle}</p>
                )}
              </div>
              <ul className="divide-y divide-line/60">
                {group.rows.map((row) => (
                  <li
                    key={row.id}
                    className="px-6 py-5 flex items-center justify-between gap-6"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {labelForMask(row.dayMask)}
                      </p>
                      <p className="text-xs text-ink/60 mt-1">{row.name}</p>
                    </div>
                    <p className="text-xl font-semibold text-teal-deep tabular-nums">
                      {formatPEN(row.priceCents)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
