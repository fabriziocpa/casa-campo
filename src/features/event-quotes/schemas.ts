import { z } from "zod";
import { consentField, honeypot, isoDate, peruPhone } from "@/features/_shared/fields";

export const eventTypes = [
  "boda",
  "cumpleanos",
  "quinceanero",
  "corporativo",
  "aniversario",
  "otro",
] as const;
export type EventType = (typeof eventTypes)[number];

export const eventTypeLabels: Record<EventType, string> = {
  boda: "Boda",
  cumpleanos: "Cumpleaños",
  quinceanero: "Quinceañero",
  corporativo: "Corporativo",
  aniversario: "Aniversario",
  otro: "Otro",
};

export const eventQuoteSchema = z.object({
  propertyId: z.guid(),
  packageId: z
    .guid()
    .optional()
    .or(z.string().min(1).optional())
    .or(z.literal("")),
  eventType: z.enum(eventTypes),

  tentativeDate: isoDate.optional().or(z.literal("")),
  estimatedGuests: z.coerce
    .number()
    .int()
    .min(1, "Indica un número de invitados")
    .max(300, "Para más de 300 invitados, contáctanos directamente"),

  firstName: z.string().trim().min(2, "Ingresa tu nombre"),
  lastName: z.string().trim().min(2, "Ingresa tus apellidos"),
  email: z.string().email("Correo inválido"),
  phone: peruPhone,
  message: z.string().max(1000).optional().or(z.literal("")),

  consent: consentField,
  website: honeypot,
});

export type EventQuoteInput = z.infer<typeof eventQuoteSchema>;
