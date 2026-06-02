import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/motion/StaggerChildren";
import { getActiveProperties } from "@/features/properties/queries";
import {
  getBrandValueProps,
  getSettings,
} from "@/features/content/queries";
import { getMinPriceCents } from "@/features/pricing/queries";
import { formatPEN } from "@/lib/money";
import { whatsappUrl } from "@/lib/whatsapp";
import { PROPERTY_PHOTOS } from "@/config/media-manifest";

export default async function BrandLandingPage() {
  const [properties, valueProps, settings] = await Promise.all([
    getActiveProperties(),
    getBrandValueProps(),
    getSettings(),
  ]);

  const propertiesWithPricing = await Promise.all(
    properties.map(async (p) => ({
      property: p,
      minPriceCents: await getMinPriceCents(p.id),
    })),
  );

  return (
    <main className="min-h-screen bg-bg">
      {/* Hero */}
      <section className="relative h-screen min-h-[640px] w-full overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/fotos/casa_grande.avif"
        >
          <source src="/videos/casacampo.mp4" type="video/mp4" />
        </video>
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-teal-deep/85 via-teal-deep/40 to-teal/25 mix-blend-multiply"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-6 h-full flex flex-col justify-center">
          <FadeIn>
            <p className="text-sm uppercase tracking-widest text-bg/70 mb-6">
              Refugios en el valle
            </p>
            <h1 className="text-6xl md:text-8xl font-semibold text-bg tracking-tight max-w-4xl leading-[0.95]">
              Desconecta lento. Vuelve renovado.
            </h1>
            <p className="mt-8 text-lg md:text-xl text-bg/80 max-w-2xl">
              Casas de campo en el valle del río Moche, a 40 minutos de
              Trujillo. Naturaleza, silencio y el aire limpio que extrañaste.
            </p>
            <div className="mt-12">
              <Link
                href="#propiedades"
                className="inline-flex items-center gap-2 rounded-full bg-bg text-teal-deep px-6 py-3 text-sm font-medium hover:bg-bg/90 transition-colors"
              >
                Conoce las propiedades
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Lo que nos une */}
      {valueProps.length > 0 && (
        <section className="relative py-24 bg-gradient-to-b from-teal-soft/50 via-teal-soft/20 to-bg">
          <div
            aria-hidden
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 15% 20%, rgba(31,111,99,0.25), transparent 45%), radial-gradient(circle at 85% 80%, rgba(15,58,54,0.20), transparent 50%)",
            }}
          />
          <div className="relative mx-auto max-w-7xl px-6">
            <FadeIn>
              <p className="text-sm uppercase tracking-widest text-teal-deep mb-4">
                Lo que nos une
              </p>
              <h2 className="text-4xl md:text-5xl font-semibold text-ink tracking-tight max-w-2xl">
                Un mismo cuidado en cada propiedad
              </h2>
            </FadeIn>

            <StaggerChildren className="mt-14 grid gap-8 md:grid-cols-3">
              {valueProps.map((v, i) => (
                <StaggerItem
                  key={i}
                  className="space-y-3 rounded-2xl bg-bg/70 backdrop-blur-sm border border-teal-deep/15 p-6 shadow-sm"
                >
                  <p className="text-2xl font-semibold text-teal-deep">
                    {v.title}
                  </p>
                  <p className="text-ink/75 leading-relaxed">{v.body}</p>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>
      )}

      {/* Property sections — editorial stacked */}
      <section
        id="propiedades"
        className="relative py-20 bg-gradient-to-b from-bg via-teal-soft/30 to-bg"
      >
        <div className="mx-auto max-w-7xl px-6 space-y-32">
          {propertiesWithPricing.map(({ property, minPriceCents }, idx) => {
            const reversed = idx % 2 === 1;
            const cover = PROPERTY_PHOTOS[property.slug]?.[0];
            const hasCabana = property.slug === "casa-grande";
            return (
              <FadeIn key={property.id}>
                <article
                  className={`grid gap-10 md:grid-cols-2 md:gap-16 items-center ${
                    reversed ? "md:[&>*:first-child]:order-last" : ""
                  }`}
                >
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br from-teal-deep via-teal to-gold/50">
                    {cover ? (
                      <Image
                        src={cover.src}
                        alt={cover.alt}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <div
                        aria-hidden
                        className="absolute inset-0 opacity-25 mix-blend-overlay"
                        style={{
                          backgroundImage:
                            "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.5), transparent 50%)",
                        }}
                      />
                    )}
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                    />
                    <div className="absolute bottom-6 left-6 text-bg/95 text-sm uppercase tracking-widest drop-shadow">
                      {property.shortName}
                    </div>

                    {hasCabana && (
                      <div className="absolute top-5 right-5 w-32 md:w-40">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-xl ring-2 ring-bg/80 shadow-lg">
                          <Image
                            src="/fotos/cabana_frontal.avif"
                            alt="La Cabaña, espacio adicional de Casa Grande"
                            fill
                            sizes="160px"
                            className="object-cover"
                          />
                          <span className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1 text-center text-[10px] uppercase tracking-wider text-bg">
                            + La Cabaña
                          </span>
                        </div>
                        <p className="mt-2 text-center text-xs text-bg/90 drop-shadow">
                          Incluye Cabaña · grupos 12+
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Text side */}
                  <div>
                    <p className="text-sm uppercase tracking-widest text-teal-deep mb-3">
                      Propiedad · {property.shortName}
                    </p>
                    <h3 className="text-4xl md:text-5xl font-semibold text-ink tracking-tight">
                      {property.name}
                    </h3>
                    {property.tagline && (
                      <p className="mt-3 text-xl text-ink/70 italic">
                        {property.tagline}
                      </p>
                    )}
                    {property.descriptionLong && (
                      <p className="mt-6 text-ink/75 leading-relaxed">
                        {property.descriptionLong}
                      </p>
                    )}

                    <dl className="mt-8 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <dt className="text-ink/50">Capacidad</dt>
                        <dd className="text-ink font-medium mt-1">
                          {property.baseCapacity === property.maxCapacity
                            ? property.maxCapacity
                            : `${property.baseCapacity}-${property.maxCapacity}`}{" "}
                          personas
                        </dd>
                      </div>
                      {minPriceCents !== null && (
                        <div>
                          <dt className="text-ink/50">Desde</dt>
                          <dd className="text-ink font-medium mt-1 tabular-nums">
                            {formatPEN(minPriceCents)}
                          </dd>
                        </div>
                      )}
                    </dl>

                    <div className="mt-10 flex flex-wrap gap-3">
                      <Link
                        href={`/${property.slug}`}
                        className="inline-flex items-center gap-2 rounded-full bg-teal-deep text-bg px-6 py-3 text-sm font-medium hover:bg-teal transition-colors"
                      >
                        Ver propiedad
                        <ArrowRight className="size-4" />
                      </Link>
                      {property.eventsEnabled && (
                        <Link
                          href={`/${property.slug}/eventos`}
                          className="inline-flex items-center rounded-full border border-teal-deep/30 text-teal-deep px-6 py-3 text-sm font-medium hover:bg-teal-soft/40 transition-colors"
                        >
                          También para eventos
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              </FadeIn>
            );
          })}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative py-28 overflow-hidden bg-gradient-to-br from-teal-deep via-teal to-teal-deep text-bg">
        <div
          aria-hidden
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(207,226,221,0.35), transparent 55%), radial-gradient(circle at 80% 70%, rgba(184,151,103,0.20), transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <FadeIn>
            <p className="text-sm uppercase tracking-widest text-teal-soft mb-4">
              ¿Listo para venir?
            </p>
            <h2 className="text-4xl md:text-5xl font-semibold text-bg tracking-tight">
              Coordinemos tu llegada
            </h2>
            <p className="mt-6 text-bg/80 leading-relaxed">
              Respondemos por WhatsApp en minutos durante el horario de
              atención ({settings.attentionHours}).
            </p>
            <a
              href={whatsappUrl(
                settings.whatsapp,
                "Hola CasaCampo, me gustaría reservar.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center rounded-full bg-bg text-teal-deep px-8 py-3.5 text-sm font-medium hover:bg-bg/90 transition-colors shadow-lg"
            >
              Escríbenos por WhatsApp
            </a>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
