import { FadeIn } from "@/components/motion/FadeIn";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/motion/StaggerChildren";

export function EventValueProps({
  props,
}: {
  props: Array<{ title: string; body: string }>;
}) {
  if (props.length === 0) return null;

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <FadeIn>
          <p className="text-sm uppercase tracking-widest text-teal-deep mb-4">
            Por qué Casa Principal
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold text-ink tracking-tight max-w-2xl">
            Un marco natural difícil de igualar
          </h2>
        </FadeIn>

        <StaggerChildren className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {props.map((p, i) => (
            <StaggerItem
              key={i}
              className="rounded-2xl border border-line/60 bg-sand/30 p-6 space-y-2"
            >
              <p className="text-2xl font-semibold text-teal-deep">{p.title}</p>
              <p className="text-sm text-ink/70 leading-relaxed">{p.body}</p>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
