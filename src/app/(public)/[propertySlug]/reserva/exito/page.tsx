import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { getPropertyBySlug } from "@/features/properties/queries";
import { getSettings } from "@/features/content/queries";
import { whatsappUrl } from "@/lib/whatsapp";

export default async function ReservationSuccessPage({
  params,
}: {
  params: Promise<{ propertySlug: string }>;
}) {
  const { propertySlug } = await params;
  const property = await getPropertyBySlug(propertySlug);
  if (!property) notFound();

  const settings = await getSettings();
  const waHref = whatsappUrl(
    settings.whatsapp,
    `Hola CasaCampo, acabo de enviar una solicitud de reserva para ${property.name}.`,
  );

  return (
    <main className="min-h-screen bg-bg flex items-center">
      <section className="mx-auto max-w-2xl px-6 py-24 text-center">
        <FadeIn>
          <span className="inline-flex size-16 items-center justify-center rounded-full bg-teal-soft text-teal-deep mb-8">
            <CheckCircle2 className="size-8" />
          </span>
          <p className="text-sm uppercase tracking-widest text-teal-deep mb-3">
            Solicitud recibida
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold text-ink tracking-tight">
            ¡Gracias por elegir CasaCampo!
          </h1>
          <p className="mt-6 text-ink/70 leading-relaxed">
            Tu solicitud para <strong>{property.name}</strong> llegó
            correctamente. Te enviaremos un correo de confirmación con los
            datos bancarios y de Yape en las próximas horas hábiles.
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
              Escríbenos por WhatsApp
            </a>
            <Link
              href={`/${property.slug}`}
              className="inline-flex items-center rounded-full border border-teal-deep/30 text-teal-deep px-6 py-3 text-sm font-medium hover:bg-teal-soft/30 transition-colors"
            >
              Volver a la propiedad
            </Link>
          </div>
        </FadeIn>
      </section>
    </main>
  );
}

export const metadata = {
  title: "Solicitud enviada",
};
