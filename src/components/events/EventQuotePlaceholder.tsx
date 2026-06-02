import { Sparkles } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { whatsappUrl } from "@/lib/whatsapp";

export function EventQuotePlaceholder({
  whatsapp,
}: {
  whatsapp: string;
}) {
  const href = whatsappUrl(
    whatsapp,
    "Hola CasaCampo, me gustaría una cotización para un evento en Casa Principal.",
  );

  return (
    <section id="cotizar" className="py-24">
      <div className="mx-auto max-w-3xl px-6">
        <FadeIn>
          <div className="rounded-3xl bg-teal-deep text-bg p-10 md:p-14 text-center">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-bg/10 mb-6">
              <Sparkles className="size-6" />
            </span>
            <p className="text-sm uppercase tracking-widest text-bg/60 mb-3">
              Cotización
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Formulario de cotización — próximamente
            </h2>
            <p className="mt-5 text-bg/80 max-w-xl mx-auto leading-relaxed">
              Estamos preparando el formulario de cotización online. Mientras
              tanto, coordinamos tu evento por WhatsApp y agendamos una
              videollamada en menos de 24 horas.
            </p>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center rounded-full bg-bg text-teal-deep px-6 py-3 text-sm font-medium hover:bg-bg/90 transition-colors"
            >
              Solicitar cotización por WhatsApp
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
