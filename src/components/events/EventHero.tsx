import Image from "next/image";
import { FadeIn } from "@/components/motion/FadeIn";
import { EVENT_HERO } from "@/config/media-manifest";
import type { Property } from "@/db/seed";

export function EventHero({ property }: { property: Property }) {
  const hero = EVENT_HERO;

  return (
    <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden">
      <Image
        src={hero.src}
        alt={hero.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-teal-deep/80 via-teal-deep/55 to-teal/40 mix-blend-multiply"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.35), transparent 45%), radial-gradient(circle at 20% 80%, rgba(184,151,103,0.45), transparent 55%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 h-full flex flex-col justify-end pb-20">
        <FadeIn>
          <p className="text-sm uppercase tracking-widest text-bg/80 mb-4">
            Eventos · {property.shortName}
          </p>
          <h1 className="text-5xl md:text-7xl font-semibold text-bg tracking-tight max-w-3xl drop-shadow-sm">
            Celebraciones con vista al río
          </h1>
          <p className="mt-6 text-lg md:text-xl text-bg/85 max-w-2xl">
            Bodas, cumpleaños, quinceañeros y eventos corporativos — la casa
            entera reservada para tu momento.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
