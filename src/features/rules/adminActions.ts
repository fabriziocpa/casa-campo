"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { rules as rulesTable } from "@/db/schema";
import { getPropertyById } from "@/features/properties/queries";

async function revalidateForProperty(propertyId: string) {
  revalidatePath("/admin/propiedades");
  const property = await getPropertyById(propertyId);
  if (property) {
    revalidatePath(`/admin/propiedades/${property.slug}`);
    revalidatePath(`/${property.slug}`);
  }
}

export async function createRule(formData: FormData): Promise<void> {
  const propertyId = String(formData.get("propertyId") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const orderRaw = String(formData.get("order") ?? "0").trim();
  const order = Number.isFinite(Number(orderRaw)) ? Number(orderRaw) : 0;

  if (!propertyId || !category || !body) return;

  try {
    await db.insert(rulesTable).values({
      propertyId,
      category,
      body,
      order,
      active: true,
    });
  } catch (err) {
    console.error("[rules:create]", err);
    return;
  }
  await revalidateForProperty(propertyId);
}

export async function updateRule(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const orderRaw = String(formData.get("order") ?? "0").trim();
  const order = Number.isFinite(Number(orderRaw)) ? Number(orderRaw) : 0;
  if (!id || !category || !body) return;

  try {
    const updated = await db
      .update(rulesTable)
      .set({ category, body, order })
      .where(eq(rulesTable.id, id))
      .returning({ propertyId: rulesTable.propertyId });
    if (updated[0]) await revalidateForProperty(updated[0].propertyId);
  } catch (err) {
    console.error("[rules:update]", err);
  }
}

export async function toggleRuleActive(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  const active = String(formData.get("active") ?? "") === "true";
  if (!id) return;

  try {
    const updated = await db
      .update(rulesTable)
      .set({ active: !active })
      .where(eq(rulesTable.id, id))
      .returning({ propertyId: rulesTable.propertyId });
    if (updated[0]) await revalidateForProperty(updated[0].propertyId);
  } catch (err) {
    console.error("[rules:toggleActive]", err);
  }
}

export async function deleteRule(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  try {
    const deleted = await db
      .delete(rulesTable)
      .where(eq(rulesTable.id, id))
      .returning({ propertyId: rulesTable.propertyId });
    if (deleted[0]) await revalidateForProperty(deleted[0].propertyId);
  } catch (err) {
    console.error("[rules:delete]", err);
  }
}
