"use client";

import { useActionState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { signInWithPassword, type LoginState } from "@/features/auth/actions";

const initialState: LoginState = { ok: false };

export function LoginForm({ initialError }: { initialError?: string }) {
  const [state, formAction, pending] = useActionState(
    signInWithPassword,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-ink">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          inputMode="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          defaultValue={state.email}
          className="flex h-10 w-full rounded-md border border-input bg-bg px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-ink">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="flex h-10 w-full rounded-md border border-input bg-bg px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-teal-deep text-bg px-5 py-3 text-sm font-medium hover:bg-teal transition-colors disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <LogIn className="size-4" />
        )}
        Ingresar
      </button>

      {state.message && (
        <p
          className={`text-sm ${state.ok ? "text-teal-deep" : "text-rose-muted"}`}
        >
          {state.message}
        </p>
      )}

      {initialError && !state.message && (
        <p className="text-sm text-rose-muted">
          {initialError === "exchange_failed"
            ? "La sesión expiró. Ingresa nuevamente."
            : initialError === "not_admin"
              ? "Esta cuenta no tiene acceso administrativo."
              : "Faltan parámetros. Ingresa nuevamente."}
        </p>
      )}
    </form>
  );
}
