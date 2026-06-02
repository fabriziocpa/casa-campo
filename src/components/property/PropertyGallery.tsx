import { FadeIn } from "@/components/motion/FadeIn";
import { PhotoCarousel } from "@/components/media/PhotoCarousel";
import { PROPERTY_PHOTOS } from "@/config/media-manifest";

export function PropertyGallery({ slug }: { slug: string }) {
  const photos = PROPERTY_PHOTOS[slug] ?? [];
  if (photos.length === 0) return null;

  return (
    <section className="bg-bg py-24">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <p className="text-sm uppercase tracking-widest text-teal-deep mb-4">
            Recorre los espacios
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold text-ink tracking-tight mb-12">
            La propiedad en imágenes
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <PhotoCarousel photos={photos} />
        </FadeIn>
      </div>
    </section>
  );
}
