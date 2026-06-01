import { Calendar } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { whatsappUrl } from "@/lib/whatsapp";

export function ReservationPlaceholder({
  whatsapp,
  propertyName,
}: {
  whatsapp: string;
  propertyName: string;
}) {
  const href = whatsappUrl(
    whatsapp,
    `Hola CasaCampo, me gustaría reservar en ${propertyName}.`,
  );

  return (
    <section id="reservar" className="py-24">
      <div className="mx-auto max-w-3xl px-6">
        <FadeIn>
          <div className="rounded-3xl bg-teal-deep text-bg p-10 md:p-14 text-center">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-bg/10 mb-6">
              <Calendar className="size-6" />
            </span>
            <p className="text-sm uppercase tracking-widest text-bg/60 mb-3">
              Reservas
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Reserva en línea — próximamente
            </h2>
            <p className="mt-5 text-bg/80 max-w-xl mx-auto leading-relaxed">
              Estamos finalizando el calendario y el formulario de reservas.
              Mientras tanto, coordinamos tu fecha por WhatsApp en minutos.
            </p>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center rounded-full bg-bg text-teal-deep px-6 py-3 text-sm font-medium hover:bg-bg/90 transition-colors"
            >
              Reservar por WhatsApp
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
