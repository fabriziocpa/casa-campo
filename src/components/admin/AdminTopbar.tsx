import { LogOut } from "lucide-react";

export function AdminTopbar({ email }: { email: string | null }) {
  return (
    <header className="h-16 border-b border-line/60 bg-bg/80 backdrop-blur sticky top-0 z-30 flex items-center justify-end px-6 gap-4">
      {email && (
        <span className="text-sm text-ink/65 hidden sm:inline">{email}</span>
      )}
      <form action="/auth/logout" method="post">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full border border-line/60 px-4 py-1.5 text-sm text-ink/75 hover:border-teal-deep/40 hover:text-teal-deep transition-colors"
        >
          <LogOut className="size-3.5" />
          Salir
        </button>
      </form>
    </header>
  );
}
