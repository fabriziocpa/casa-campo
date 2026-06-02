import { FadeIn } from "@/components/motion/FadeIn";
import { ClickableGallery } from "@/components/media/ClickableGallery";
import { EVENT_PHOTOS } from "@/config/media-manifest";

export function EventGallery() {
  if (EVENT_PHOTOS.length === 0) return null;

  return (
    <section className="bg-sand/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <FadeIn>
          <p className="text-sm uppercase tracking-widest text-teal-deep mb-4">
            Cómo se ve
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold text-ink tracking-tight">
            Galería de eventos
          </h2>
          <p className="mt-4 text-ink/70 max-w-2xl">
            Montajes reales en el valle. Toca cualquier imagen para verla en
            grande.
          </p>
        </FadeIn>
        <ClickableGallery photos={EVENT_PHOTOS} />
      </div>
    </section>
  );
}
