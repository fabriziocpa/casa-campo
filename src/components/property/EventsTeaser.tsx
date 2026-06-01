import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import type { Property } from "@/db/seed";

export function EventsTeaser({ property }: { property: Property }) {
  if (!property.eventsEnabled) return null;

  return (
    <section className="py-20 bg-bg">
      <div className="mx-auto max-w-7xl px-6">
        <FadeIn>
          <Link
            href={`/${property.slug}/eventos`}
            className="group block rounded-3xl overflow-hidden border border-line/60 bg-teal-deep text-bg hover:border-gold/60 transition-colors"
          >
            <div className="grid md:grid-cols-[1fr_auto] items-center gap-8 p-8 md:p-12">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/90 text-ink px-3 py-1 text-xs font-medium mb-5">
                  <Sparkles className="size-3" />
                  Eventos en {property.shortName}
                </div>
                <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
                  ¿Buscas un evento?
                </h2>
                <p className="mt-4 text-bg/75 leading-relaxed max-w-xl">
                  Bodas, cumpleaños, quinceañeros, corporativos. Paquetes desde
                  20 hasta 150 personas, con catering, decoración y todo el
                  espacio del valle.
                </p>
              </div>
              <div className="inline-flex items-center gap-3 rounded-full bg-bg text-teal-deep px-6 py-4 font-medium group-hover:gap-5 transition-all whitespace-nowrap">
                Ver paquetes
                <ArrowRight className="size-5" />
              </div>
            </div>
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
