import { MapPin } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import type { Property } from "@/db/seed";

export function LocationBlock({ property }: { property: Property }) {
  if (!property.addressLine) return null;

  const hasCoords = property.latitude && property.longitude;
  const mapSrc = hasCoords
    ? `https://www.google.com/maps?q=${property.latitude},${property.longitude}&z=14&output=embed`
    : `https://www.google.com/maps?q=${encodeURIComponent(property.addressLine)}&output=embed`;

  return (
    <section id="ubicacion" className="bg-sand/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <FadeIn>
          <p className="text-sm uppercase tracking-widest text-teal-deep mb-4">
            Ubicación
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold text-ink tracking-tight">
            Cómo llegar
          </h2>
          <p className="mt-6 inline-flex items-start gap-2 text-ink/75">
            <MapPin className="size-5 text-teal mt-0.5 shrink-0" />
            <span>{property.addressLine}</span>
          </p>
        </FadeIn>

        <div className="mt-10 rounded-2xl overflow-hidden border border-line/60 bg-bg">
          <iframe
            src={mapSrc}
            title={`Mapa de ${property.name}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full aspect-[16/9]"
          />
        </div>
      </div>
    </section>
  );
}
