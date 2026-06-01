"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { settings as settingsTable } from "@/db/schema";

const updateSettingsSchema = z.object({
  adminEmail: z.string().email("Correo administrador inválido"),
  contactEmail: z.string().email("Correo de contacto inválido"),
  whatsapp: z.string().min(1, "WhatsApp requerido"),
  whatsappEvents: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : null)),
  attentionHours: z.string().min(1, "Horarios requeridos"),
  instagram: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : null)),
  tiktok: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : null)),
  facebook: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : null)),
  cancellationPolicy: z.string().min(10, "Política de cancelación requerida"),
  eventAddonsNote: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : null)),
});

export type UpdateSettingsState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export async function updateSettings(
  _prev: UpdateSettingsState,
  formData: FormData,
): Promise<UpdateSettingsState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = updateSettingsSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return {
      ok: false,
      message: "Revisa los campos marcados.",
      fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const [existing] = await db
      .select({ id: settingsTable.id })
      .from(settingsTable)
      .limit(1);

    if (existing) {
      await db
        .update(settingsTable)
        .set({
          adminEmail: data.adminEmail,
          contactEmail: data.contactEmail,
          whatsapp: data.whatsapp,
          whatsappEvents: data.whatsappEvents,
          attentionHours: data.attentionHours,
          instagram: data.instagram,
          tiktok: data.tiktok,
          facebook: data.facebook,
          cancellationPolicy: data.cancellationPolicy,
          eventAddonsNote: data.eventAddonsNote,
          updatedAt: new Date(),
        })
        .where(eq(settingsTable.id, existing.id));
    } else {
      await db.insert(settingsTable).values({
        adminEmail: data.adminEmail,
        contactEmail: data.contactEmail,
        whatsapp: data.whatsapp,
        whatsappEvents: data.whatsappEvents,
        attentionHours: data.attentionHours,
        instagram: data.instagram,
        tiktok: data.tiktok,
        facebook: data.facebook,
        cancellationPolicy: data.cancellationPolicy,
        eventAddonsNote: data.eventAddonsNote,
        paymentMethods: [],
      });
    }
  } catch (err) {
    console.error("[settings:update]", err);
    return {
      ok: false,
      message: "No pudimos guardar los cambios. Reintenta.",
    };
  }

  revalidatePath("/admin/ajustes");
  revalidatePath("/admin");
  revalidatePath("/contacto");
  revalidatePath("/politicas");

  return { ok: true, message: "Ajustes guardados." };
}
