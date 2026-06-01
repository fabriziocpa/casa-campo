"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import {
  updateSettings,
  type UpdateSettingsState,
} from "@/features/content/adminActions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Defaults = {
  adminEmail: string;
  contactEmail: string;
  whatsapp: string;
  whatsappEvents: string;
  attentionHours: string;
  instagram: string;
  tiktok: string;
  facebook: string;
  cancellationPolicy: string;
  eventAddonsNote: string;
};

const INITIAL: UpdateSettingsState = { ok: false };

export function SettingsForm({ defaults }: { defaults: Defaults }) {
  const [state, formAction, pending] = useActionState(updateSettings, INITIAL);

  const err = (key: string) => state.fieldErrors?.[key];

  return (
    <form action={formAction} className="space-y-8">
      <Panel title="Contactos">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Correo administrador"
            name="adminEmail"
            defaultValue={defaults.adminEmail}
            error={err("adminEmail")}
          />
          <Field
            label="Correo de reservas"
            name="contactEmail"
            defaultValue={defaults.contactEmail}
            error={err("contactEmail")}
          />
          <Field
            label="WhatsApp"
            name="whatsapp"
            defaultValue={defaults.whatsapp}
            error={err("whatsapp")}
          />
          <Field
            label="WhatsApp eventos"
            name="whatsappEvents"
            defaultValue={defaults.whatsappEvents}
            error={err("whatsappEvents")}
            placeholder="opcional"
          />
          <Field
            label="Horarios de atención"
            name="attentionHours"
            defaultValue={defaults.attentionHours}
            error={err("attentionHours")}
          />
        </div>
      </Panel>

      <Panel title="Redes">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Instagram"
            name="instagram"
            defaultValue={defaults.instagram}
            error={err("instagram")}
            placeholder="usuario"
          />
          <Field
            label="TikTok"
            name="tiktok"
            defaultValue={defaults.tiktok}
            error={err("tiktok")}
            placeholder="usuario"
          />
          <Field
            label="Facebook"
            name="facebook"
            defaultValue={defaults.facebook}
            error={err("facebook")}
            placeholder="página"
          />
        </div>
      </Panel>

      <Panel title="Política de cancelación">
        <Textarea
          name="cancellationPolicy"
          defaultValue={defaults.cancellationPolicy}
          rows={5}
          className="bg-bg"
        />
        {err("cancellationPolicy") && (
          <p className="mt-1 text-xs text-rose-muted">
            {err("cancellationPolicy")}
          </p>
        )}
      </Panel>

      <Panel title="Nota sobre eventos">
        <Textarea
          name="eventAddonsNote"
          defaultValue={defaults.eventAddonsNote}
          rows={3}
          className="bg-bg"
          placeholder="Aparece en el correo de confirmación de eventos (opcional)"
        />
      </Panel>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-teal-deep text-bg px-6 py-2 text-sm font-medium hover:bg-teal disabled:opacity-50 transition-colors inline-flex items-center gap-2"
        >
          {pending && <Loader2 className="size-3.5 animate-spin" />}
          Guardar cambios
        </button>
        {!pending && state.ok && (
          <p className="inline-flex items-center gap-2 text-sm text-teal-deep">
            <CheckCircle2 className="size-4" /> {state.message ?? "Guardado."}
          </p>
        )}
        {!pending && !state.ok && state.message && (
          <p className="inline-flex items-center gap-2 text-sm text-rose-muted">
            <AlertCircle className="size-4" /> {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line/60 bg-bg p-6">
      <h2 className="text-sm uppercase tracking-wider text-ink/55 mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  error,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue: string;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <Label htmlFor={name} className="text-xs uppercase tracking-wider text-ink/55">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-1 bg-bg"
        aria-invalid={Boolean(error)}
      />
      {error && <p className="mt-1 text-xs text-rose-muted">{error}</p>}
    </div>
  );
}
