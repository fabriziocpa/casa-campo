import { z } from "zod";

// Shared Zod field fragments used by the public-form schemas (reservations,
// event-quotes). Centralised so the date/phone/consent/honeypot rules can't
// drift between forms.

// Date keys are stored as "YYYY-MM-DD" strings — the format the blocked_dates
// unique index depends on.
export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida");

// Peruvian mobile: 9 digits starting with 9.
export const peruPhone = z
  .string()
  .trim()
  .regex(/^9\d{8}$/, "Teléfono peruano: 9 dígitos comenzando con 9");

// Consent checkbox. The client submits via manually-built FormData, so the
// boolean can arrive as the string "true" (and HTML checkboxes default to "on").
// Coerce common truthy encodings back to a boolean before the literal check —
// otherwise a ticked box failed server-side validation.
export const consentField = z.preprocess(
  (v) => v === true || v === "true" || v === "on" || v === "1",
  z.literal(true, {
    message: "Debes aceptar las políticas para continuar",
  }),
);

// Honeypot — bots fill this, humans don't. Server rejects if present.
export const honeypot = z.string().max(0).optional().or(z.literal(""));
