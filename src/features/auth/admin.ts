// Single source of truth for the admin allowlist. Used by the proxy
// (middleware layer), the admin layout (server-render layer) and the login
// action — keeping all three in sync so the gate can never drift between them.
//
// Pure string logic, no I/O: cheap enough to call on every admin request and
// never touched by public-page code paths.

export function parseAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

// Fail closed: an empty/undefined ADMIN_EMAILS or missing email is NOT admin.
export function isAdminEmail(email: string | null | undefined): boolean {
  const allow = parseAdminEmails();
  if (allow.length === 0) return false;
  const e = email?.trim().toLowerCase();
  return !!e && allow.includes(e);
}
