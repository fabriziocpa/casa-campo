import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/motion/StaggerChildren";
import {
  groupAmenitiesByCategory,
  labelForCategory,
} from "@/features/amenities/queries";
import type { Amenity } from "@/db/seed";

function getIcon(name: string | null): LucideIcon {
  if (!name) return Icons.Check;
  const lib = Icons as unknown as Record<string, LucideIcon>;
  return lib[name] ?? Icons.Check;
}

export function AmenityGrid({ amenities }: { amenities: Amenity[] }) {
  if (amenities.length === 0) return null;
  const groups = groupAmenitiesByCategory(amenities);

  return (
    <section id="amenidades" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <FadeIn>
          <p className="text-sm uppercase tracking-widest text-teal-deep mb-4">
            Qué encontrarás
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold text-ink tracking-tight">
            Lo que ofrece la propiedad
          </h2>
        </FadeIn>

        <div className="mt-14 space-y-12">
          {groups.map((group) => (
            <div key={group.category}>
              <p className="text-sm font-medium text-ink/60 uppercase tracking-wider mb-6">
                {labelForCategory(group.category)}
              </p>
              <StaggerChildren className="grid gap-6 grid-cols-2 md:grid-cols-4">
                {group.amenities.map((a) => {
                  const Icon = getIcon(a.icon);
                  return (
                    <StaggerItem
                      key={a.id}
                      className="flex flex-col items-start gap-3"
                    >
                      <span className="size-10 rounded-xl bg-teal-soft text-teal-deep flex items-center justify-center">
                        <Icon className="size-5" />
                      </span>
                      <p className="text-sm text-ink/85 leading-snug">
                        {a.name}
                      </p>
                    </StaggerItem>
                  );
                })}
              </StaggerChildren>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
