"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { parseISO, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { toggleManualBlock } from "@/features/blocked-dates/adminActions";

export type BlockEntry = {
  date: string; // YYYY-MM-DD
  reason: "manual" | "reservation" | "event" | "event_dependency";
  notes: string | null;
  reservationId: string | null;
  eventQuoteId: string | null;
};

type Toast =
  | { kind: "ok"; text: string }
  | { kind: "err"; text: string }
  | { kind: "nav"; text: string }
  | null;

export function CalendarBlockGrid({
  propertyId,
  propertyName,
  blocks,
}: {
  propertyId: string;
  propertyName: string;
  blocks: BlockEntry[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<Toast>(null);

  const byDate = new Map(blocks.map((b) => [b.date, b]));

  const manualDates = blocks
    .filter((b) => b.reason === "manual")
    .map((b) => parseISO(b.date));
  const reservationDates = blocks
    .filter((b) => b.reason === "reservation")
    .map((b) => parseISO(b.date));
  const eventDates = blocks
    .filter((b) => b.reason === "event" || b.reason === "event_dependency")
    .map((b) => parseISO(b.date));

  const today = startOfDay(new Date());

  const handleSelect = (date: Date | undefined) => {
    if (!date || pending) return;
    const iso = toISODate(date);
    const existing = byDate.get(iso);

    if (existing && existing.reason !== "manual") {
      // Click-through: navigate to the originating reservation / quote.
      const target = linkFor(existing);
      if (target) {
        setToast({ kind: "nav", text: `Abriendo ${labelFor(existing.reason)} de ${iso}…` });
        router.push(target);
        return;
      }
      setToast({
        kind: "err",
        text: `${iso}: bloqueo automático (${labelFor(existing.reason)}). No tiene origen vinculado.`,
      });
      return;
    }

    startTransition(async () => {
      const res = await toggleManualBlock(propertyId, iso);
      if (res.ok) {
        setToast({
          kind: "ok",
          text:
            res.action === "blocked"
              ? `${iso} bloqueado.`
              : `${iso} liberado.`,
        });
      } else if (res.reason === "not_manual") {
        setToast({
          kind: "err",
          text: `${iso}: bloqueo automático. No se puede modificar.`,
        });
      } else {
        setToast({
          kind: "err",
          text: `No se pudo actualizar ${iso}. Reintenta.`,
        });
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line/60 bg-bg p-4">
        <Calendar
          mode="single"
          locale={es}
          selected={undefined}
          onSelect={handleSelect}
          numberOfMonths={2}
          defaultMonth={today}
          disabled={{ before: today }}
          modifiers={{
            manual: manualDates,
            reservation: reservationDates,
            event: eventDates,
          }}
          modifiersClassNames={{
            manual:
              "!bg-rose-muted/30 !text-ink hover:!bg-rose-muted/50 ring-1 ring-rose-muted/60 rounded-md",
            reservation:
              "!bg-teal-soft !text-teal-deep ring-1 ring-teal-deep/50 rounded-md cursor-pointer hover:!bg-teal-soft/80",
            event:
              "!bg-gold/30 !text-ink ring-1 ring-gold/60 rounded-md cursor-pointer hover:!bg-gold/50",
          }}
          className="bg-bg"
        />
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-ink/70">
          <Legend swatch="bg-rose-muted/40 ring-rose-muted/60" label="Manual (click para liberar)" />
          <Legend swatch="bg-teal-soft ring-teal-deep/50" label="Reserva (click para abrir)" />
          <Legend swatch="bg-gold/30 ring-gold/60" label="Evento / dependencia (click para abrir)" />
          <Legend swatch="bg-bg ring-line" label="Disponible (click para bloquear)" />
        </div>
      </div>

      <div aria-live="polite" className="min-h-6">
        {pending && (
          <p className="inline-flex items-center gap-2 text-sm text-ink/60">
            <Loader2 className="size-3.5 animate-spin" />
            Actualizando — {propertyName}…
          </p>
        )}
        {!pending && toast?.kind === "ok" && (
          <p className="inline-flex items-center gap-2 text-sm text-teal-deep">
            <CheckCircle2 className="size-4" />
            {toast.text}
          </p>
        )}
        {!pending && toast?.kind === "nav" && (
          <p className="inline-flex items-center gap-2 text-sm text-teal-deep">
            <Loader2 className="size-3.5 animate-spin" />
            {toast.text}
          </p>
        )}
        {!pending && toast?.kind === "err" && (
          <p className="inline-flex items-center gap-2 text-sm text-rose-muted">
            <AlertCircle className="size-4" />
            {toast.text}
          </p>
        )}
      </div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`inline-block size-3 rounded-sm ring-1 ${swatch}`} />
      {label}
    </span>
  );
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function labelFor(reason: BlockEntry["reason"]): string {
  switch (reason) {
    case "reservation":
      return "reserva";
    case "event":
      return "evento";
    case "event_dependency":
      return "evento (cochera)";
    default:
      return "manual";
  }
}

function linkFor(entry: BlockEntry): string | null {
  if (entry.reason === "reservation" && entry.reservationId) {
    return `/admin/reservas/${entry.reservationId}`;
  }
  if (
    (entry.reason === "event" || entry.reason === "event_dependency") &&
    entry.eventQuoteId
  ) {
    return `/admin/cotizaciones/${entry.eventQuoteId}`;
  }
  return null;
}
