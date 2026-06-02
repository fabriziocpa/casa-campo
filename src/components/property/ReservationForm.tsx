"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { z } from "zod";
import { reservationSchema } from "@/features/reservations/schemas";

type FormInput = z.input<typeof reservationSchema>;
type FormOutput = z.output<typeof reservationSchema>;
import {
  submitReservation,
  type SubmitReservationState,
} from "@/features/reservations/actions";
import { AvailabilityCalendar } from "@/components/property/AvailabilityCalendar";
import { StaySummary } from "@/components/property/StaySummary";
import { maskHas } from "@/features/pricing/dayMask";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FadeIn } from "@/components/motion/FadeIn";
import { whatsappUrl } from "@/lib/whatsapp";
import type {
  PricingModality,
  Property,
  SeasonalOverride,
} from "@/db/seed";

export type ReservationFormProps = {
  property: Property;
  modalities: PricingModality[];
  overrides: SeasonalOverride[];
  blockedDates: string[];
  whatsapp: string;
};

const initialState: SubmitReservationState = { ok: false };

function fmt(date: Date | undefined) {
  return date ? format(date, "yyyy-MM-dd") : "";
}

export function ReservationForm({
  property,
  modalities,
  overrides,
  blockedDates,
  whatsapp,
}: ReservationFormProps) {
  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState<number>(
    Math.min(2, property.maxCapacity),
  );

  // If all active modalities are full_package with the same packageNights,
  // treat the property as fixed-nights and pre-fill checkout on first click.
  const activeModalities = modalities.filter((m) => m.active);
  const allPackage =
    activeModalities.length > 0 &&
    activeModalities.every((m) => m.kind === "full_package");
  const packageNightsSet = new Set(
    activeModalities
      .map((m) => m.packageNights)
      .filter((n): n is number => n !== null),
  );
  const fixedNights =
    allPackage && packageNightsSet.size === 1
      ? [...packageNightsSet][0]
      : undefined;

  // Mixed model (Casa Principal): per_night + full_package both active. The night
  // count alone decides the rate, so we just explain it instead of forcing a mode.
  const hasPerNight = activeModalities.some((m) => m.kind === "per_night");
  const hasPackage = activeModalities.some((m) => m.kind === "full_package");
  const mixedMode = hasPerNight && hasPackage;

  // Compute union of allowed check-in weekdays across modalities.
  const allowedCheckinDow: number[] = [];
  for (let d = 0; d < 7; d++) {
    if (activeModalities.some((m) => maskHas(m.dayMask, d))) {
      allowedCheckinDow.push(d);
    }
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      propertyId: property.id,
      docType: "DNI",
      guests: Math.min(2, property.maxCapacity),
      consent: false as unknown as true,
      website: "",
    },
  });

  useEffect(() => {
    setValue("checkIn", fmt(range?.from));
    setValue("checkOut", fmt(range?.to));
  }, [range, setValue]);

  useEffect(() => {
    setValue("guests", guests);
  }, [guests, setValue]);

  const [serverState, formAction, pending] = useActionState(
    submitReservation,
    initialState,
  );
  const [isTransitioning, startTransition] = useTransition();

  useEffect(() => {
    if (serverState.message && !serverState.ok) {
      toast.error(serverState.message);
    }
  }, [serverState]);

  async function onValid(data: FormOutput) {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      fd.set(k, String(v));
    });
    startTransition(() => {
      formAction(fd);
    });
  }

  function onInvalid(errs: Record<string, { message?: string } | undefined>) {
    // Surface silent validation failures (hidden fields like propertyId, guests,
    // dates without a calendar selection) so the submit button doesn't appear inert.
    const first = Object.values(errs).find((e) => e?.message)?.message;
    if (typeof window !== "undefined") {
      console.warn("[reservation] validation failed:", errs);
    }
    toast.error(first ?? "Completa los campos requeridos antes de enviar.");
  }

  const docType = watch("docType");
  const docPlaceholder =
    docType === "DNI"
      ? "12345678"
      : docType === "CE"
        ? "123456789"
        : "AB123456";

  const waHref = whatsappUrl(
    whatsapp,
    `Hola CasaCampo, me gustaría reservar en ${property.name}.`,
  );

  return (
    <section id="reservar" className="py-24 bg-bg">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <p className="text-sm uppercase tracking-widest text-teal-deep mb-4">
            Reservas
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold text-ink tracking-tight">
            Solicita tu fecha
          </h2>
          <p className="mt-4 text-ink/65 max-w-2xl">
            Completa el formulario y te contactamos por WhatsApp para
            confirmar disponibilidad y coordinar el pago. Sin cargos hasta la
            confirmación.
          </p>
        </FadeIn>

        <form
          onSubmit={handleSubmit(onValid, onInvalid)}
          className="mt-12 grid gap-8 md:grid-cols-[1fr_360px]"
        >
          <div className="space-y-6">
            <div className="rounded-2xl border border-line/60 bg-bg p-4 md:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
                <div>
                  <p className="text-sm font-medium text-ink">
                    Selecciona tus fechas
                  </p>
                  <p className="text-xs text-ink/60 mt-0.5">
                    {range?.from && range?.to
                      ? `${format(range.from, "d MMM")} → ${format(range.to, "d MMM yyyy")}`
                      : range?.from
                        ? `Entrada: ${format(range.from, "d MMM yyyy")} — elige salida`
                        : "Elige entrada y salida"}
                  </p>
                </div>
                {(range?.from || range?.to) && (
                  <button
                    type="button"
                    onClick={() => setRange(undefined)}
                    className="text-xs text-teal-deep hover:underline"
                  >
                    Limpiar
                  </button>
                )}
              </div>
              <AvailabilityCalendar
                value={range}
                onChange={setRange}
                blockedDates={blockedDates}
                fixedNights={fixedNights}
                allowedCheckinDow={allowedCheckinDow}
              />
              {fixedNights !== undefined && (
                <p className="text-xs text-ink/60 mt-3">
                  Esta casa se reserva por paquete de{" "}
                  <span className="font-medium text-ink">
                    {fixedNights + 1} días / {fixedNights}{" "}
                    {fixedNights === 1 ? "noche" : "noches"}
                  </span>
                  . Elige el día de entrada y la salida se ajusta sola.
                </p>
              )}
              {mixedMode && (
                <p className="text-xs text-ink/60 mt-3">
                  <span className="font-medium text-ink">1 noche</span> = horario
                  full (ingreso 9am, salida 6pm del día siguiente).{" "}
                  <span className="font-medium text-ink">2+ noches</span> = tarifa
                  por noche (ingreso 3pm, salida 12pm). El precio se ajusta solo
                  según las noches que elijas.
                </p>
              )}
              {(errors.checkIn || errors.checkOut) && (
                <p className="text-xs text-rose-muted mt-3">
                  {errors.checkIn?.message ?? errors.checkOut?.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="guests">Huéspedes</Label>
              <Select
                value={String(guests)}
                onValueChange={(v) => setGuests(Number(v))}
              >
                <SelectTrigger id="guests" className="w-full sm:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    { length: property.maxCapacity },
                    (_, i) => i + 1,
                  ).map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} {n === 1 ? "persona" : "personas"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">Nombre</Label>
                <Input id="firstName" {...register("firstName")} />
                {errors.firstName && (
                  <p className="text-xs text-rose-muted">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Apellidos</Label>
                <Input id="lastName" {...register("lastName")} />
                {errors.lastName && (
                  <p className="text-xs text-rose-muted">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
              <div className="space-y-1.5">
                <Label htmlFor="docType">Documento</Label>
                <Select
                  value={docType}
                  onValueChange={(v) =>
                    setValue("docType", v as FormInput["docType"])
                  }
                >
                  <SelectTrigger id="docType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DNI">DNI</SelectItem>
                    <SelectItem value="CE">Carné ext.</SelectItem>
                    <SelectItem value="PASSPORT">Pasaporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="docNumber">Número</Label>
                <Input
                  id="docNumber"
                  placeholder={docPlaceholder}
                  {...register("docNumber")}
                />
                {errors.docNumber && (
                  <p className="text-xs text-rose-muted">
                    {errors.docNumber.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="email">Correo</Label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-rose-muted">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  inputMode="numeric"
                  placeholder="9XXXXXXXX"
                  autoComplete="tel"
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-xs text-rose-muted">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message">Mensaje (opcional)</Label>
              <Textarea
                id="message"
                placeholder="Cuéntanos algo sobre tu visita, mascotas, hora estimada de llegada…"
                rows={4}
                {...register("message")}
              />
            </div>

            {/* Honeypot — visually hidden, screen-reader-hidden */}
            <div
              aria-hidden
              className="absolute -left-[10000px] top-auto h-0 w-0 overflow-hidden"
            >
              <label>
                No completes este campo
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  {...register("website")}
                />
              </label>
            </div>

            <label className="flex items-start gap-3 text-sm text-ink/75">
              <input
                type="checkbox"
                className="mt-0.5 size-4 accent-teal-deep"
                {...register("consent")}
              />
              <span>
                Acepto las{" "}
                <a
                  href="/politicas"
                  target="_blank"
                  className="text-teal-deep underline hover:no-underline"
                >
                  políticas de reserva y privacidad
                </a>
                .
              </span>
            </label>
            {errors.consent && (
              <p className="text-xs text-rose-muted">
                {errors.consent.message}
              </p>
            )}

            <input type="hidden" {...register("propertyId")} />
            <input type="hidden" {...register("checkIn")} />
            <input type="hidden" {...register("checkOut")} />
            <input type="hidden" {...register("guests")} />

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting || pending || isTransitioning}
                className="bg-teal-deep hover:bg-teal text-bg rounded-full px-7 py-6 text-base"
              >
                {isSubmitting || pending || isTransitioning ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Enviando…
                  </>
                ) : (
                  "Solicitar reserva"
                )}
              </Button>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-teal-deep hover:underline"
              >
                Prefiero coordinar por WhatsApp
              </a>
            </div>
          </div>

          <aside className="md:sticky md:top-24 md:self-start">
            <StaySummary
              property={property}
              checkIn={range?.from}
              checkOut={range?.to}
              guests={guests}
              modalities={modalities}
              overrides={overrides}
            />
          </aside>
        </form>
      </div>
    </section>
  );
}
