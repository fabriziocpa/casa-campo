import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Acceso",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="block text-center font-semibold tracking-tight text-teal-deep text-lg mb-10"
        >
          CasaCampo
        </Link>

        <div className="rounded-2xl border border-line/60 bg-bg p-7 shadow-sm">
          <h1 className="text-2xl font-semibold text-ink tracking-tight">
            Acceso administradores
          </h1>
          <p className="mt-2 text-sm text-ink/60">
            Ingresa con tu correo y contraseña.
          </p>

          <div className="mt-7">
            <LoginForm initialError={error} />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-ink/50">
          ¿No eres administrador?{" "}
          <Link href="/" className="text-teal-deep hover:underline">
            Volver al inicio
          </Link>
        </p>
      </div>
    </main>
  );
}
