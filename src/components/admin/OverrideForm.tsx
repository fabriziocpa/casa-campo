"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { createOverride } from "@/features/pricing/adminActions";

export type ModalityOption = {
  id: string;
  name: string;
};

// Date-range price override creator. Two modes:
//  - "absolute": fixed S/ price (target one tier for precise per-tier control).
//  - "percent":  % applied to the base price of the target tier(s), rounded to
//                whole sol by the pricing engine.
export function OverrideForm({
  propertyId,
  modalities,
}: {
  propertyId: string;
  modalities: ModalityOption[];
}) {
  const [adjustType, setAdjustType] = useState<"absolute" | "percent">(
    "absolute",
  );

  return (
    <form
      action={createOverride}
      className="grid gap-3 sm:grid-cols-2"
      // Reset the toggle after a submit so the next entry starts clean.
      onSubmit={() => setTimeout(() => setAdjustType("absolute"), 0)}
    >
      <input type="hidden" name="propertyId" value={propertyId} />
      <input type="hidden" name="adjustType" value={adjustType} />

      <label className="flex flex-col gap-1 text-xs text-ink/60 sm:col-span-2">
        Nombre (ej. Fiestas Patrias)
        <Input name="name" required className="bg-bg text-sm" />
      </label>

      <label className="flex flex-col gap-1 text-xs text-ink/60">
        Desde
        <Input name="startDate" type="date" required className="bg-bg text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs text-ink/60">
        Hasta
        <Input name="endDate" type="date" className="bg-bg text-sm" />
      </label>

      <label className="flex flex-col gap-1 text-xs text-ink/60">
        Tarifa afectada
        <select
          name="modalityId"
          className="rounded-md border border-line/60 bg-bg px-3 py-2 text-sm text-ink"
        >
          <option value="">Todas las tarifas</option>
          {modalities.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-ink/60">
        Tipo de ajuste
        <select
          value={adjustType}
          onChange={(e) =>
            setAdjustType(e.target.value === "percent" ? "percent" : "absolute")
          }
          className="rounded-md border border-line/60 bg-bg px-3 py-2 text-sm text-ink"
        >
          <option value="absolute">Precio fijo (S/)</option>
          <option value="percent">Porcentaje (%)</option>
        </select>
      </label>

      {adjustType === "absolute" ? (
        <label className="flex flex-col gap-1 text-xs text-ink/60">
          Precio S/
          <Input
            name="price"
            type="number"
            step="1"
            min="0"
            required
            className="bg-bg text-sm tabular-nums"
          />
        </label>
      ) : (
        <label className="flex flex-col gap-1 text-xs text-ink/60">
          Ajuste % (ej. 20 = +20%, -10 = −10%)
          <Input
            name="percent"
            type="number"
            step="1"
            required
            className="bg-bg text-sm tabular-nums"
          />
        </label>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          className="rounded-full bg-teal-deep text-bg px-4 py-1.5 text-xs font-medium hover:bg-teal transition-colors"
        >
          Agregar precio especial
        </button>
      </div>
    </form>
  );
}
