import { FadeIn } from "@/components/motion/FadeIn";
import { groupRulesByCategory } from "@/features/rules/queries";
import type { Rule } from "@/db/seed";

export function RulesGrid({ rules }: { rules: Rule[] }) {
  if (rules.length === 0) return null;
  const groups = groupRulesByCategory(rules);

  return (
    <section id="info" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <FadeIn>
          <p className="text-sm uppercase tracking-widest text-teal-deep mb-4">
            Información importante
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold text-ink tracking-tight">
            Antes de tu llegada
          </h2>
        </FadeIn>

        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {groups.map((group) => (
            <div key={group.category}>
              <p className="text-sm font-semibold text-teal-deep uppercase tracking-wider mb-4">
                {group.category}
              </p>
              <ul className="space-y-3 text-sm text-ink/75 leading-relaxed">
                {group.rules.map((r) => (
                  <li key={r.id} className="flex gap-2">
                    <span
                      aria-hidden
                      className="mt-2 size-1 shrink-0 rounded-full bg-teal"
                    />
                    <span>{r.body}</span>
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
