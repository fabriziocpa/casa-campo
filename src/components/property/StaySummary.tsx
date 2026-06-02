"use client";

import { AlertCircle, Home, ReceiptText } from "lucide-react";
import { resolveStay, type ResolveResult } from "@/features/pricing/resolveStay";
import { formatPEN } from "@/lib/money";
import type { PricingModality, Property, SeasonalOverride } from "@/db/seed";

export type StaySummaryProps = {
  property: Pick<Property, "baseCapacity" | "maxCapacity" | "extraPersonCents">;
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  guests: number;
  modalities: PricingModality[];
  overrides: SeasonalOverride[];
};

export function StaySummary({
  property,
  checkIn,
  checkOut,
  guests,
  modalities,
  overrides,
}: StaySummaryProps) {
  if (!checkIn || !checkOut) {
    return (
      <div className="rounded-2xl border border-line/60 bg-sand/40 p-6 text-sm text-ink/60">
        <p className="font-medium text-ink/80">Resumen</p>
        <p className="mt-2">
          Selecciona fechas en el calendario para ver el detalle del precio.
        </p>
      </div>
    );
  }

  const result: ResolveResult = resolveStay({
    property,
    checkIn,
    checkOut,
    guests,
    modalities: modalities.map((m) => ({
      id: m.id,
      name: m.name,
      kind: m.kind,
      dayMask: m.dayMask,
      capacityTier: m.capacityTier,
      priceCents: m.priceCents,
      minNights: m.minNights,
      packageNights: m.packageNights,
      priority: m.priority,
      active: m.active,
    })),
    overrides: overrides.map((o) => ({
      modalityId: o.modalityId,
      startDate: o.startDate,
      endDate: o.endDate,
      adjustType: o.adjustType,
      priceCents: o.priceCents,
      percent: o.percent,
      minNights: o.minNights,
    })),
  });

  if (result.errors.length > 0) {
    return (
      <div className="rounded-2xl border border-rose-muted/60 bg-rose-muted/10 p-6">
        <p className="flex items-center gap-2 text-sm font-medium text-ink">
          <AlertCircle className="size-4 text-rose-muted" />
          No podemos cotizar esas fechas
        </p>
        <ul className="mt-3 space-y-1 text-sm text-ink/75">
          {result.errors.map((e, i) => (
            <li key={i}>· {e}</li>
          ))}
        </ul>
      </div>
    );
  }

  // The Cabaña is an exclusive amenity that only unlocks for groups over 12
  // (the 16-person tier). At the base 12-person tier it stays closed.
  const includesCabana = (result.modality.capacityTier ?? 0) > 12;

  return (
    <div className="rounded-2xl border border-teal-deep/20 bg-teal-soft/30 p-6 space-y-4">
      <p className="flex items-center gap-2 text-sm font-medium text-teal-deep">
        <ReceiptText className="size-4" />
        Resumen de tu reserva
      </p>

      <div className="space-y-2 text-sm text-ink/80">
        <p className="font-medium text-ink">{result.modality.name}</p>
        <p className="text-xs text-ink/60">
          {result.nights} {result.nights === 1 ? "noche" : "noches"} ·{" "}
          {guests} {guests === 1 ? "huésped" : "huéspedes"}
        </p>
      </div>

      {includesCabana && (
        <div className="flex items-start gap-2 rounded-xl bg-teal-deep/5 px-3 py-2.5 text-sm text-teal-deep">
          <Home className="size-4 mt-0.5 shrink-0" />
          <span>
            <span className="font-medium">Incluye la Cabaña</span> — espacio
            exclusivo para grupos de más de 12 personas.
          </span>
        </div>
      )}

      <div className="border-t border-teal-deep/15 pt-4 space-y-2 text-sm">
        {Array.isArray(result.breakdown) ? (
          <>
            {result.breakdown.map((row) => (
              <div
                key={row.date}
                className="flex justify-between text-ink/70"
              >
                <span>Noche {row.date}</span>
                <span className="tabular-nums">{formatPEN(row.cents)}</span>
              </div>
            ))}
          </>
        ) : (
          <div className="flex justify-between text-ink/70">
            <span>Paquete 2 días / 1 noche</span>
            <span className="tabular-nums">
              {formatPEN(result.breakdown.cents)}
            </span>
          </div>
        )}

        {result.extraPersonsCents > 0 && (
          <div className="flex justify-between text-ink/70">
            <span>
              Huéspedes adicionales (
              {guests - (result.modality.capacityTier ?? property.baseCapacity)})
            </span>
            <span className="tabular-nums">
              {formatPEN(result.extraPersonsCents)}
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-teal-deep/15 pt-4 flex items-baseline justify-between">
        <span className="text-sm font-medium text-ink">Total</span>
        <span className="text-2xl font-semibold text-teal-deep tabular-nums">
          {formatPEN(result.totalCents)}
        </span>
      </div>

      <p className="text-xs text-ink/55 leading-relaxed">
        El total incluye limpieza final e impuestos. El pago se coordina por
        WhatsApp tras la confirmación de la reserva.
      </p>
    </div>
  );
}
