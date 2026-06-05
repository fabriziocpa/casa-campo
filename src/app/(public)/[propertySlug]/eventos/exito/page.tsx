import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { getPropertyBySlug } from "@/features/properties/queries";
import { getSettings } from "@/features/content/queries";
import { whatsappUrl } from "@/lib/whatsapp";

export default async function EventQuoteSuccessPage({
  params,
}: {
  params: Promise<{ propertySlug: string }>;
}) {
  const { propertySlug } = await params;
  const property = await getPropertyBySlug(propertySlug);
  if (!property || !property.eventsEnabled) notFound();

  const settings = await getSettings();
  const waHref = whatsappUrl(
    settings.whatsappEvents ?? settings.whatsapp,
    `Hola CasaCampo, acabo de enviar una solicitud de cotización para un evento en ${property.name}.`,
  );

  return (
    <main className="min-h-screen bg-bg flex items-center">
      <section className="mx-auto max-w-2xl px-6 py-24 text-center">
        <FadeIn>
          <span className="inline-flex size-16 items-center justify-center rounded-full bg-teal-soft text-teal-deep mb-8">
            <CheckCircle2 className="size-8" />
          </span>
          <p className="text-sm uppercase tracking-widest text-teal-deep mb-3">
            Cotización en proceso
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold text-ink tracking-tight">
            Gracias por tu interés
          </h1>
          <p className="mt-6 text-ink/70 leading-relaxed">
            Recibimos tu solicitud para <strong>{property.name}</strong>. Te
            contactaremos en menos de 24 horas hábiles para coordinar una
            reunión o videollamada con todos los detalles de tu evento.
          </p>
          <p className="mt-3 text-ink/65 text-sm">
            Horario de atención: {settings.attentionHours}
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-teal-deep text-bg px-6 py-3 text-sm font-medium hover:bg-teal transition-colors"
            >
              <MessageCircle className="size-4" />
              Adelantar algo por WhatsApp
            </a>
            <Link
              href={`/${property.slug}/eventos`}
              className="inline-flex items-center rounded-full border border-teal-deep/30 text-teal-deep px-6 py-3 text-sm font-medium hover:bg-teal-soft/30 transition-colors"
            >
              Volver a eventos
            </Link>
          </div>
        </FadeIn>
      </section>
    </main>
  );
}

export const metadata = {
  title: "Cotización enviada",
};
