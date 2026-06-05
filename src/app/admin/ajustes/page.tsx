import { getSettings } from "@/features/content/queries";
import { SettingsForm } from "./SettingsForm";

export const metadata = { title: "Ajustes" };

export default async function AjustesPage() {
  const s = await getSettings();

  const defaults = {
    adminEmail: s.adminEmail,
    contactEmail: s.contactEmail,
    whatsapp: s.whatsapp,
    whatsappEvents: s.whatsappEvents ?? "",
    attentionHours: s.attentionHours,
    instagram: s.instagram ?? "",
    tiktok: s.tiktok ?? "",
    facebook: s.facebook ?? "",
    cancellationPolicy: s.cancellationPolicy,
    eventAddonsNote: s.eventAddonsNote ?? "",
  };

  const formKey = [
    defaults.adminEmail,
    defaults.contactEmail,
    defaults.whatsapp,
    defaults.whatsappEvents,
    defaults.attentionHours,
    defaults.instagram,
    defaults.tiktok,
    defaults.facebook,
    defaults.cancellationPolicy,
    defaults.eventAddonsNote,
  ].join("|");

  return (
    <div className="space-y-8 max-w-3xl">
      <header>
        <h1 className="text-3xl font-semibold text-ink tracking-tight">
          Ajustes
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          Contactos, métodos de pago y políticas a nivel marca. Los cambios
          afectan al sitio público (contacto, políticas) y a los correos
          enviados a huéspedes.
        </p>
      </header>

      <SettingsForm key={formKey} defaults={defaults} />
    </div>
  );
}
