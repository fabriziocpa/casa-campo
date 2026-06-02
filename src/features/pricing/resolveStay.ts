import { differenceInDays, eachDayOfInterval, format } from "date-fns";
import { maskHas } from "./dayMask";

type Modality = {
  id: string;
  name: string;
  kind: "per_night" | "full_package";
  dayMask: number;
  capacityTier: number | null;
  priceCents: number;
  minNights: number;
  packageNights: number | null;
  priority: number;
  active: boolean;
};

type Override = {
  modalityId: string | null;
  startDate: string;
  endDate: string;
  adjustType: "absolute" | "percent";
  priceCents: number;
  percent: number | null;
  minNights: number | null;
};

// Effective override price for a given base modality price.
// "percent" rounds to the nearest whole sol so displayed prices stay .00.
function overridePrice(override: Override, baseCents: number): number {
  if (override.adjustType === "percent") {
    const pct = override.percent ?? 0;
    return Math.round((baseCents * (1 + pct / 100)) / 100) * 100;
  }
  return override.priceCents;
}

type Property = {
  baseCapacity: number;
  maxCapacity: number;
  extraPersonCents: number;
};

type PerNightBreakdown = Array<{ date: string; cents: number }>;
type PackageBreakdown = { kind: "full_package"; cents: number };

export type ResolveResult = {
  modality: Modality;
  nights: number;
  breakdown: PerNightBreakdown | PackageBreakdown;
  subtotalCents: number;
  extraPersonsCents: number;
  totalCents: number;
  minNightsRequired: number;
  errors: string[];
};

function dateToStr(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function inRange(dateStr: string, startStr: string, endStr: string) {
  return dateStr >= startStr && dateStr <= endStr;
}

export function resolveStay(args: {
  property: Property;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  modalities: Modality[];
  overrides: Override[];
}): ResolveResult {
  const { property, checkIn, checkOut, guests, modalities, overrides } = args;
  const errors: string[] = [];

  if (guests > property.maxCapacity) {
    errors.push("Capacidad máxima excedida");
    return stub(errors);
  }

  if (checkIn >= checkOut) {
    errors.push("Las fechas son inválidas");
    return stub(errors);
  }

  const nights = differenceInDays(checkOut, checkIn);
  const checkInDow = checkIn.getDay();

  // Filter candidates
  const candidates = modalities.filter((m) => {
    if (!m.active) return false;
    if (!maskHas(m.dayMask, checkInDow)) return false;
    if (m.capacityTier !== null && m.capacityTier < guests) return false;
    if (m.kind === "full_package") return nights === m.packageNights;
    // per_night: only a candidate once the stay meets its minimum. This is what
    // lets per_night and full_package coexist without colliding — a 1-night stay
    // falls through to the package, a 2+ night stay uses the per_night rate.
    return nights >= m.minNights;
  });

  if (candidates.length === 0) {
    errors.push("No hay tarifa configurada para esas fechas y huéspedes");
    return stub(errors);
  }

  // Pick tightest tier ≥ guests, break ties by highest priority
  const sorted = [...candidates].sort((a, b) => {
    const tierA = a.capacityTier ?? 0;
    const tierB = b.capacityTier ?? 0;
    if (tierA !== tierB) return tierA - tierB;
    return b.priority - a.priority;
  });

  const modality = sorted[0];
  let subtotalCents = 0;
  let minNightsRequired = modality.minNights;
  let breakdown: PerNightBreakdown | PackageBreakdown;

  if (modality.kind === "full_package") {
    const checkInStr = dateToStr(checkIn);
    const override = overrides.find(
      (o) =>
        (o.modalityId === null || o.modalityId === modality.id) &&
        inRange(checkInStr, o.startDate, o.endDate)
    );
    subtotalCents = override ? overridePrice(override, modality.priceCents) : modality.priceCents;
    if (override?.minNights) minNightsRequired = Math.max(minNightsRequired, override.minNights);
    breakdown = { kind: "full_package", cents: subtotalCents };
  } else {
    const days = eachDayOfInterval({ start: checkIn, end: new Date(checkOut.getTime() - 86400000) });
    const perNight: PerNightBreakdown = [];

    for (const day of days) {
      const dayStr = dateToStr(day);
      const override = overrides.find(
        (o) =>
          (o.modalityId === null || o.modalityId === modality.id) &&
          inRange(dayStr, o.startDate, o.endDate)
      );
      const cents = override ? overridePrice(override, modality.priceCents) : modality.priceCents;
      if (override?.minNights) minNightsRequired = Math.max(minNightsRequired, override.minNights);
      perNight.push({ date: dayStr, cents });
      subtotalCents += cents;
    }

    breakdown = perNight;
  }

  const extraPersonsCents = Math.max(
    0,
    guests - (modality.capacityTier ?? property.baseCapacity)
  ) * property.extraPersonCents;

  const totalCents = subtotalCents + extraPersonsCents;

  if (nights < minNightsRequired) {
    errors.push(`La modalidad seleccionada requiere mínimo ${minNightsRequired} ${minNightsRequired === 1 ? "noche" : "noches"}`);
  }

  return { modality, nights, breakdown, subtotalCents, extraPersonsCents, totalCents, minNightsRequired, errors };
}

function stub(errors: string[]): ResolveResult {
  return {
    modality: null as unknown as Modality,
    nights: 0,
    breakdown: [],
    subtotalCents: 0,
    extraPersonsCents: 0,
    totalCents: 0,
    minNightsRequired: 1,
    errors,
  };
}
