"use client";

import { useEffect, useState } from "react";
import { addDays, parseISO, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";

export type AvailabilityCalendarProps = {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  blockedDates: string[];
  minNights?: number;
  /**
   * When set, picking a check-in auto-fills check-out to (check-in + fixedNights).
   * Used for package-only properties (e.g. Casa Grande) where all modalities are
   * full_package with the same packageNights.
   */
  fixedNights?: number;
  /**
   * Optional weekday whitelist (0=Sun…6=Sat). When set, days NOT in the set are
   * disabled — e.g. for Casa Grande, only Mon/Tue/Wed/Thu/Fri/Sat/Sun where a
   * candidate modality exists.
   */
  allowedCheckinDow?: number[];
};

export function AvailabilityCalendar({
  value,
  onChange,
  blockedDates,
  fixedNights,
  allowedCheckinDow,
}: AvailabilityCalendarProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        aria-hidden
        className="h-[320px] w-full rounded-xl bg-sand/40 animate-pulse"
      />
    );
  }

  const today = startOfDay(new Date());
  const blockedAsDates = blockedDates.map((d) => parseISO(d));

  const disabled: Array<
    Date | { before: Date } | { dayOfWeek: number[] }
  > = [{ before: today }, ...blockedAsDates];

  if (allowedCheckinDow && allowedCheckinDow.length > 0 && !value?.from) {
    const blockedDow = [0, 1, 2, 3, 4, 5, 6].filter(
      (d) => !allowedCheckinDow.includes(d),
    );
    if (blockedDow.length > 0) {
      disabled.push({ dayOfWeek: blockedDow });
    }
  }

  const handleSelect = (next: DateRange | undefined) => {
    if (fixedNights && next?.from && (!next.to || next.from !== value?.from)) {
      onChange({
        from: next.from,
        to: addDays(next.from, fixedNights),
      });
      return;
    }
    onChange(next);
  };

  return (
    <Calendar
      mode="range"
      locale={es}
      selected={value}
      onSelect={handleSelect}
      numberOfMonths={2}
      disabled={disabled}
      excludeDisabled
      defaultMonth={today}
      className="bg-bg"
    />
  );
}
