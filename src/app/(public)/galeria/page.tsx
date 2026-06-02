import { FadeIn } from "@/components/motion/FadeIn";
import { ClickableGallery } from "@/components/media/ClickableGallery";
import { getActiveProperties } from "@/features/properties/queries";
import {
  BRAND_PHOTOS,
  CABANA_PHOTOS,
  PROPERTY_PHOTOS,
} from "@/config/media-manifest";

export default async function GaleriaPage() {
  const properties = await getActiveProperties();

  return (
    <main className="min-h-screen bg-bg pb-24">
      <section className="bg-teal-deep text-bg py-24">
        <div className="mx-auto max-w-3xl px-6">
          <FadeIn>
            <p className="text-sm uppercase tracking-widest text-bg/60 mb-4">
              Imágenes
            </p>
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">
              Galería
            </h1>
            <p className="mt-6 text-bg/75 leading-relaxed">
              Cada rincón del valle, capturado para que sepas exactamente lo
              que encontrarás cuando llegues. Toca cualquier imagen para verla
              en grande.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 space-y-24">
        {properties.map((property) => {
          const photos = PROPERTY_PHOTOS[property.slug] ?? [];
          const isCasaGrande = property.slug === "casa-grande";
          if (photos.length === 0) return null;

          return (
            <div key={property.id}>
              <FadeIn>
                <p className="text-sm uppercase tracking-widest text-teal-deep mb-3">
                  {property.shortName}
                </p>
                <h2 className="text-3xl md:text-4xl font-semibold text-ink tracking-tight">
                  {property.name}
                </h2>
              </FadeIn>

              {isCasaGrande ? (
                <>
                  <FadeIn>
                    <p className="mt-10 text-sm font-medium uppercase tracking-wider text-ink/60">
                      La Casa
                    </p>
                  </FadeIn>
                  <ClickableGallery
                    photos={photos}
                    className="mt-6 grid gap-3 grid-cols-2 md:grid-cols-3"
                  />
                  <FadeIn>
                    <p className="mt-14 text-sm font-medium uppercase tracking-wider text-ink/60">
                      Casa Grande · Cabaña
                    </p>
                  </FadeIn>
                  <ClickableGallery
                    photos={CABANA_PHOTOS}
                    className="mt-6 grid gap-3 grid-cols-2 md:grid-cols-3"
                  />
                </>
              ) : (
                <ClickableGallery photos={photos} />
              )}
            </div>
          );
        })}

        {BRAND_PHOTOS.length > 0 && (
          <div>
            <FadeIn>
              <p className="text-sm uppercase tracking-widest text-teal-deep mb-3">
                Momentos
              </p>
              <h2 className="text-3xl md:text-4xl font-semibold text-ink tracking-tight">
                Eventos y vida en el valle
              </h2>
            </FadeIn>
            <ClickableGallery photos={BRAND_PHOTOS} />
          </div>
        )}
      </section>
    </main>
  );
}

export const metadata = {
  title: "Galería",
  description:
    "Galería de imágenes de las propiedades CasaCampo en el valle del río Moche.",
};
