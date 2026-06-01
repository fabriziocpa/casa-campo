import { z } from "zod";

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

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida");

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
  phone: z
    .string()
    .trim()
    .regex(/^9\d{8}$/, "Teléfono peruano: 9 dígitos comenzando con 9"),
  message: z.string().max(1000).optional().or(z.literal("")),

  consent: z.literal(true, {
    message: "Debes aceptar las políticas para continuar",
  }),

  website: z.string().max(0).optional().or(z.literal("")),
});

export type EventQuoteInput = z.infer<typeof eventQuoteSchema>;
