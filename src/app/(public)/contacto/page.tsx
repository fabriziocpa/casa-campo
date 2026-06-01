import Link from "next/link";
import { Mail, MessageCircle, Clock, MapPin } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { getSettings } from "@/features/content/queries";
import { getActiveProperties } from "@/features/properties/queries";
import { whatsappUrl } from "@/lib/whatsapp";

export default async function ContactoPage() {
  const [settings, properties] = await Promise.all([
    getSettings(),
    getActiveProperties(),
  ]);

  return (
    <main className="min-h-screen bg-bg pb-24">
      <section className="bg-teal-deep text-bg py-24">
        <div className="mx-auto max-w-3xl px-6">
          <FadeIn>
            <p className="text-sm uppercase tracking-widest text-bg/60 mb-4">
              Hablemos
            </p>
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">
              Contacto
            </h1>
            <p className="mt-6 text-bg/75 leading-relaxed">
              Te respondemos por WhatsApp en minutos durante nuestro horario
              de atención. Coordinamos fechas, dudas y eventos directamente
              contigo.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <FadeIn>
            <a
              href={whatsappUrl(
                settings.whatsapp,
                "Hola CasaCampo, me gustaría más información.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full rounded-2xl border border-line/60 bg-bg p-6 hover:border-teal-deep/40 transition-colors"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-teal-soft text-teal-deep">
                <MessageCircle className="size-5" />
              </span>
              <p className="mt-4 text-sm font-semibold text-ink">WhatsApp</p>
              <p className="mt-1 text-sm text-ink/65">{settings.whatsapp}</p>
              <p className="mt-3 text-xs text-ink/55">
                Reservas, eventos y dudas — respuesta inmediata en horario de
                atención.
              </p>
            </a>
          </FadeIn>

          <FadeIn>
            <a
              href={`mailto:${settings.contactEmail}`}
              className="block h-full rounded-2xl border border-line/60 bg-bg p-6 hover:border-teal-deep/40 transition-colors"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-teal-soft text-teal-deep">
                <Mail className="size-5" />
              </span>
              <p className="mt-4 text-sm font-semibold text-ink">Correo</p>
              <p className="mt-1 text-sm text-ink/65 break-all">
                {settings.contactEmail}
              </p>
              <p className="mt-3 text-xs text-ink/55">
                Para cotizaciones extensas, facturación y derechos sobre datos
                personales.
              </p>
            </a>
          </FadeIn>

          <FadeIn>
            <div className="h-full rounded-2xl border border-line/60 bg-bg p-6">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-teal-soft text-teal-deep">
                <Clock className="size-5" />
              </span>
              <p className="mt-4 text-sm font-semibold text-ink">
                Horario de atención
              </p>
              <p className="mt-1 text-sm text-ink/65">
                {settings.attentionHours}
              </p>
              <p className="mt-3 text-xs text-ink/55">
                Fuera de este horario, escríbenos igual — respondemos al
                inicio del día siguiente.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <FadeIn>
          <p className="text-sm uppercase tracking-widest text-teal-deep mb-4">
            Ubicaciones
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-ink tracking-tight">
            Visítanos en el valle
          </h2>
        </FadeIn>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {properties.map((p) => (
            <FadeIn key={p.id}>
              <Link
                href={`/${p.slug}`}
                className="block rounded-2xl border border-line/60 bg-sand/30 p-6 hover:border-teal-deep/40 transition-colors"
              >
                <p className="text-sm uppercase tracking-widest text-teal-deep">
                  {p.shortName}
                </p>
                <p className="mt-2 text-xl font-semibold text-ink">{p.name}</p>
                {p.addressLine && (
                  <p className="mt-3 inline-flex items-start gap-2 text-sm text-ink/70">
                    <MapPin className="size-4 mt-0.5 shrink-0 text-teal" />
                    <span>{p.addressLine}</span>
                  </p>
                )}
                <p className="mt-6 text-sm text-teal-deep font-medium">
                  Ver propiedad →
                </p>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>
    </main>
  );
}

export const metadata = {
  title: "Contacto",
  description:
    "Contacta CasaCampo por WhatsApp, correo o visita nuestras propiedades en el valle del río Moche.",
};
