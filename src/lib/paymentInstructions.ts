import type { Settings } from "@/db/seed";

type PaymentMethod = Record<string, string | undefined>;

export function paymentInstructionsText(settings: Settings): string {
  const methods = settings.paymentMethods as unknown as PaymentMethod[];
  if (!methods?.length) {
    return "Te coordinaremos las formas de pago por WhatsApp.";
  }

  const lines: string[] = [];
  for (const m of methods) {
    if (m.kind === "transfer") {
      lines.push(
        `Transferencia bancaria — ${m.bank ?? ""} cuenta ${m.accountNumber ?? ""} (CCI ${m.cci ?? ""}), titular ${m.holder ?? ""}.`,
      );
    } else if (m.kind === "yape") {
      lines.push(`Yape — ${m.phone ?? ""}, titular ${m.holder ?? ""}.`);
    }
  }
  lines.push(
    "El 50% confirma la reserva; el 50% restante se cancela hasta 2 días antes del check-in.",
  );
  return lines.join(" ");
}
