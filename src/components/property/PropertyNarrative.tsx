import Image from "next/image";
import { FadeIn } from "@/components/motion/FadeIn";
import type { Property } from "@/db/seed";

const NARRATIVE_IMAGE_BY_SLUG: Record<string, { src: string; alt: string }> = {
  chalet: { src: "/chalet/terraza.avif", alt: "Chalet en el valle" },
  "casa-grande": { src: "/fotos/casa_grande.avif", alt: "Casa Grande al atardecer" },
};

export function PropertyNarrative({ property }: { property: Property }) {
  const photo = NARRATIVE_IMAGE_BY_SLUG[property.slug];

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="grid gap-10 md:grid-cols-2 md:gap-16 items-center">
        <FadeIn>
          <p className="text-sm uppercase tracking-widest text-teal-deep mb-4">
            La propiedad
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold text-ink tracking-tight">
            {property.name}
          </h2>
          {property.descriptionLong && (
            <p className="mt-8 text-lg leading-relaxed text-ink/75">
              {property.descriptionLong}
            </p>
          )}
        </FadeIn>

        {photo && (
          <FadeIn>
            <div className="relative aspect-[4/5] md:aspect-[4/5] rounded-3xl overflow-hidden shadow-xl ring-1 ring-teal-deep/10">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
