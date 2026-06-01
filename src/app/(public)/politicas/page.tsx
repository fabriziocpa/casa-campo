import { FadeIn } from "@/components/motion/FadeIn";
import { getSettings } from "@/features/content/queries";
import { getActiveProperties } from "@/features/properties/queries";
import { getRulesByProperty } from "@/features/rules/queries";

export default async function PoliticasPage() {
  const [settings, properties] = await Promise.all([
    getSettings(),
    getActiveProperties(),
  ]);

  const propertyRules = await Promise.all(
    properties.map(async (p) => ({
      property: p,
      rules: await getRulesByProperty(p.id),
    })),
  );

  return (
    <main className="min-h-screen bg-bg pb-24">
      <section className="bg-teal-deep text-bg py-24">
        <div className="mx-auto max-w-3xl px-6">
          <FadeIn>
            <p className="text-sm uppercase tracking-widest text-bg/60 mb-4">
              Información legal
            </p>
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">
              Políticas
            </h1>
            <p className="mt-6 text-bg/75 leading-relaxed">
              Reglas de reserva, pago, cancelación y privacidad. Si tienes
              dudas, escríbenos por WhatsApp y resolvemos antes de confirmar
              tu reserva.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 space-y-16">
        <FadeIn>
          <h2 className="text-2xl font-semibold text-ink tracking-tight">
            Reserva y cancelación
          </h2>
          <p className="mt-4 text-ink/75 leading-relaxed whitespace-pre-line">
            {settings.cancellationPolicy}
          </p>
        </FadeIn>

        <FadeIn>
          <h2 className="text-2xl font-semibold text-ink tracking-tight">
            Métodos de pago
          </h2>
          <p className="mt-4 text-ink/75 leading-relaxed">
            Aceptamos transferencia bancaria y Yape. Al confirmar tu solicitud
            te enviamos los datos bancarios actualizados y el número de Yape
            del anfitrión por WhatsApp y correo. No realizamos cobros en
            línea — el pago se coordina directamente.
          </p>
        </FadeIn>

        <FadeIn>
          <h2 className="text-2xl font-semibold text-ink tracking-tight">
            Privacidad y datos personales
          </h2>
          <p className="mt-4 text-ink/75 leading-relaxed">
            CasaCampo solicita tu nombre, documento de identidad, teléfono y
            correo electrónico únicamente para gestionar tu reserva, cumplir
            con la normativa de hospedaje peruana y enviarte información
            relevante sobre tu estadía. No compartimos tus datos con terceros
            comerciales. Bajo la Ley 29733, puedes solicitar acceso,
            rectificación o eliminación de tus datos escribiéndonos a{" "}
            <a
              href={`mailto:${settings.contactEmail}`}
              className="text-teal-deep underline hover:no-underline"
            >
              {settings.contactEmail}
            </a>
            .
          </p>
        </FadeIn>

        <FadeIn>
          <h2 className="text-2xl font-semibold text-ink tracking-tight">
            Reglas por propiedad
          </h2>
          <p className="mt-4 text-ink/70 leading-relaxed">
            Cada propiedad tiene reglas particulares. Al reservar aceptas las
            condiciones específicas de la casa elegida.
          </p>

          <div className="mt-10 space-y-12">
            {propertyRules.map(({ property, rules }) => (
              <div key={property.id}>
                <p className="text-sm font-semibold text-teal-deep uppercase tracking-wider mb-4">
                  {property.name}
                </p>
                <ul className="space-y-2.5 text-sm text-ink/75 leading-relaxed">
                  {rules.map((r) => (
                    <li key={r.id} className="flex gap-2">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-teal" />
                      <span>
                        <span className="font-medium text-ink">
                          {r.category}:
                        </span>{" "}
                        {r.body}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>
    </main>
  );
}

export const metadata = {
  title: "Políticas",
  description:
    "Reserva, cancelación, métodos de pago, privacidad y reglas por propiedad de CasaCampo.",
};
