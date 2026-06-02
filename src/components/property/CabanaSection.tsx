import { Sparkles, Users } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { PhotoCarousel } from "@/components/media/PhotoCarousel";
import { CABANA_PHOTOS } from "@/config/media-manifest";

export function CabanaSection() {
  if (CABANA_PHOTOS.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-teal-deep via-teal to-teal-deep py-24 text-bg">
      <div
        aria-hidden
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(207,226,221,0.30), transparent 50%), radial-gradient(circle at 85% 80%, rgba(184,151,103,0.25), transparent 55%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
          <FadeIn>
            <span className="inline-flex items-center gap-2 rounded-full bg-bg/15 px-3 py-1 text-xs uppercase tracking-widest text-bg/90">
              <Sparkles className="size-3.5" />
              Espacio aparte
            </span>
            <h2 className="mt-5 text-4xl md:text-5xl font-semibold tracking-tight">
              La Cabaña
            </h2>
            <p className="mt-6 text-bg/85 leading-relaxed text-lg">
              Una cabaña independiente dentro de Casa Grande, con su propia
              cocina, jardín y baño. No viene incluida por defecto: se habilita
              como complemento exclusivo para grupos grandes.
            </p>
            <ul className="mt-8 space-y-3 text-bg/85">
              <li className="flex items-center gap-3">
                <Users className="size-5 text-teal-soft" />
                Solo para grupos de más de 12 personas (tarifa 16)
              </li>
              <li className="flex items-center gap-3">
                <Sparkles className="size-5 text-teal-soft" />
                Cuatro camas individuales, cocina y baño propios
              </li>
            </ul>
          </FadeIn>

          <FadeIn delay={0.1}>
            <PhotoCarousel photos={CABANA_PHOTOS} />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
