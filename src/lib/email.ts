import { readFileSync } from "node:fs";
import path from "node:path";
import { Resend } from "resend";
import type { ReactElement } from "react";

let cached: Resend | null = null;
function client(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!cached) cached = new Resend(process.env.RESEND_API_KEY);
  return cached;
}

// Inline brand logo, embedded as a CID attachment so it renders in the email
// body regardless of whether the public domain is live yet (an absolute <img>
// URL would break before casacampo.pe is deployed). BrandShell references it
// via `src="cid:brand-logo"`. Read once and cached.
export const LOGO_CID = "brand-logo";
let logoBase64: string | null = null;
function logoAttachment() {
  try {
    if (logoBase64 === null) {
      const p = path.join(process.cwd(), "public", "logo", "logo2.png");
      logoBase64 = readFileSync(p).toString("base64");
    }
    return [
      { filename: "logo2.png", content: logoBase64, contentId: LOGO_CID },
    ];
  } catch (err) {
    console.error("[email] logo attachment failed:", err);
    return undefined;
  }
}

export type SendArgs = {
  to: string | string[];
  subject: string;
  react: ReactElement;
};

// Recipient for internal admin notifications (new reservations / event quotes).
// Set NOTIFY_EMAIL in .env to override the address stored in settings.
export function adminNotifyEmail(fallback: string): string {
  return process.env.NOTIFY_EMAIL?.trim() || fallback;
}

// Sends via Resend if configured; otherwise no-ops with a console log
// so dev/local environments without a key don't crash on submit.
export async function send({ to, subject, react }: SendArgs): Promise<void> {
  // TEMP: casacampo.pe is a placeholder domain for practice — not yet verified
  // in Resend. Replace with the real verified sending domain before launch.
  const from =
    process.env.RESEND_FROM_EMAIL ?? "CasaCampo <reservas@casacampo.pe>";

  const resend = client();
  if (!resend) {
    console.log("[email] (no RESEND_API_KEY) skipping send:", { to, subject });
    return;
  }

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    react,
    attachments: logoAttachment(),
  });
  if (error) {
    console.error("[email] send error:", error);
  }
}
