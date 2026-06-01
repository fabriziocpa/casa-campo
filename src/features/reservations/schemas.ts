import { z } from "zod";

export const docTypes = ["DNI", "CE", "PASSPORT"] as const;
export type DocType = (typeof docTypes)[number];

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida");

export const reservationSchema = z
  .object({
    // z.guid() (loose UUID) — seed IDs like "11111111-..." fail Zod 4's strict
    // RFC 4122 variant-bit check used by .uuid(). DB column accepts any 36-char hex.
    propertyId: z.guid(),
    checkIn: isoDate,
    checkOut: isoDate,
    guests: z.coerce
      .number()
      .int()
      .min(1, "Debe ser al menos 1 huésped")
      .max(20, "Capacidad máxima excedida"),

    docType: z.enum(docTypes),
    docNumber: z.string().trim().min(6).max(12),
    firstName: z.string().trim().min(2, "Ingresa tu nombre"),
    lastName: z.string().trim().min(2, "Ingresa tus apellidos"),
    email: z.string().email("Correo inválido"),
    phone: z
      .string()
      .trim()
      .regex(/^9\d{8}$/, "Teléfono peruano: 9 dígitos comenzando con 9"),
    message: z.string().max(800).optional().or(z.literal("")),

    // Accept boolean true (client RHF state) OR string "true" (FormData over the
    // wire — checkboxes serialize as strings when the form action is invoked
    // programmatically through useActionState).
    consent: z
      .union([z.literal(true), z.literal("true")])
      .transform(() => true as const),

    // Honeypot — bots fill this, humans don't. Server rejects if present.
    website: z.string().max(0).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.checkIn >= data.checkOut) {
      ctx.addIssue({
        code: "custom",
        path: ["checkOut"],
        message: "El check-out debe ser posterior al check-in",
      });
    }

    if (data.docType === "DNI" && !/^\d{8}$/.test(data.docNumber)) {
      ctx.addIssue({
        code: "custom",
        path: ["docNumber"],
        message: "DNI debe tener 8 dígitos",
      });
    }
    if (data.docType === "CE" && !/^\d{9}$/.test(data.docNumber)) {
      ctx.addIssue({
        code: "custom",
        path: ["docNumber"],
        message: "Carné de extranjería debe tener 9 dígitos",
      });
    }
    if (
      data.docType === "PASSPORT" &&
      !/^[A-Z0-9]{6,12}$/i.test(data.docNumber)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["docNumber"],
        message: "Pasaporte: 6-12 caracteres alfanuméricos",
      });
    }
  });

export type ReservationInput = z.infer<typeof reservationSchema>;
