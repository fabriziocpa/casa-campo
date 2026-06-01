import Image from "next/image";
import { FadeIn } from "@/components/motion/FadeIn";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/motion/StaggerChildren";
import { getActiveProperties } from "@/features/properties/queries";
import { BRAND_PHOTOS, PROPERTY_PHOTOS } from "@/config/media-manifest";

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
              que encontrarás cuando llegues.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 space-y-24">
        {properties.map((property) => {
          const photos = PROPERTY_PHOTOS[property.slug] ?? [];
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
              <StaggerChildren className="mt-10 grid gap-3 grid-cols-2 md:grid-cols-3">
                {photos.map((photo) => (
                  <StaggerItem
                    key={photo.src}
                    className={`relative overflow-hidden rounded-xl bg-sand/30 ${
                      photo.aspect === "portrait"
                        ? "aspect-[3/4]"
                        : "aspect-[4/3]"
                    }`}
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(min-width: 768px) 33vw, 50vw"
                      className="object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </StaggerItem>
                ))}
              </StaggerChildren>
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
            <StaggerChildren className="mt-10 grid gap-3 grid-cols-2 md:grid-cols-3">
              {BRAND_PHOTOS.map((photo) => (
                <StaggerItem
                  key={photo.src}
                  className="relative aspect-[4/3] overflow-hidden rounded-xl bg-sand/30"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(min-width: 768px) 33vw, 50vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                </StaggerItem>
              ))}
            </StaggerChildren>
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
