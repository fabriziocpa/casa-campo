import { Check, X } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";

export function EventIncludedList({
  included,
  excluded,
}: {
  included: string[];
  excluded: string[];
}) {
  if (included.length === 0 && excluded.length === 0) return null;

  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <p className="text-sm uppercase tracking-widest text-teal-deep mb-4">
            Detalles
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold text-ink tracking-tight">
            Qué incluye, qué no
          </h2>
        </FadeIn>

        <div className="mt-14 grid gap-10 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-teal-deep uppercase tracking-wider mb-5">
              Incluye
            </p>
            <ul className="space-y-3 text-sm text-ink/80">
              {included.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <Check className="size-5 shrink-0 text-teal" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink/60 uppercase tracking-wider mb-5">
              No incluye
            </p>
            <ul className="space-y-3 text-sm text-ink/70">
              {excluded.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <X className="size-5 shrink-0 text-ink/40" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
