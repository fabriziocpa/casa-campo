"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail, parseAdminEmails } from "@/features/auth/admin";

export type LoginState = {
  ok: boolean;
  message?: string;
  email?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signInWithPassword(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!EMAIL_RE.test(email)) {
    return { ok: false, message: "Correo inválido.", email };
  }
  if (password.length < 1) {
    return { ok: false, message: "Ingresa tu contraseña.", email };
  }

  // Fail closed: require ADMIN_EMAILS configured to avoid login → /admin → /auth/login redirect loop.
  if (parseAdminEmails().length === 0) {
    return { ok: false, message: "Acceso no configurado. Contacta al administrador.", email };
  }
  if (!isAdminEmail(email)) {
    return { ok: false, message: "Credenciales inválidas.", email };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, message: "Credenciales inválidas.", email };
  }

  redirect("/admin");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
