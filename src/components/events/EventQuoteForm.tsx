"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, Loader2, Users, Car, Check } from "lucide-react";
import { toast } from "sonner";

import {
  eventQuoteSchema,
  eventTypeLabels,
  eventTypes,
} from "@/features/event-quotes/schemas";
import {
  submitEventQuote,
  type SubmitEventQuoteState,
} from "@/features/event-quotes/actions";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/FadeIn";
import { formatPEN } from "@/lib/money";
import { whatsappUrl } from "@/lib/whatsapp";
import type { EventPackage, Property } from "@/db/seed";

type FormInput = z.input<typeof eventQuoteSchema>;
type FormOutput = z.output<typeof eventQuoteSchema>;

export type EventQuoteFormProps = {
  property: Property;
  packages: EventPackage[];
  whatsapp: string;
};

const initialState: SubmitEventQuoteState = { ok: false };

export function EventQuoteForm({
  property,
  packages,
  whatsapp,
}: EventQuoteFormProps) {
  const [estimatedGuests, setEstimatedGuests] = useState<number>(50);
  const [tentativeDate, setTentativeDate] = useState<Date | undefined>();
  const [selectedPackageId, setSelectedPackageId] = useState<string | "">("");

  // Suggest tightest fit when guests change
  const suggestedPackageId = useMemo(() => {
    const fit = packages
      .filter((p) => p.maxGuests >= estimatedGuests)
      .sort((a, b) => a.maxGuests - b.maxGuests)[0];
    return fit?.id ?? "";
  }, [packages, estimatedGuests]);

  useEffect(() => {
    setSelectedPackageId(suggestedPackageId);
  }, [suggestedPackageId]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(eventQuoteSchema),
    defaultValues: {
      propertyId: property.id,
      eventType: "boda",
      estimatedGuests: 50,
      consent: false as unknown as true,
      website: "",
      packageId: "",
      message: "",
      tentativeDate: "",
    },
  });

  useEffect(() => {
    setValue("estimatedGuests", estimatedGuests);
  }, [estimatedGuests, setValue]);

  useEffect(() => {
    setValue(
      "tentativeDate",
      tentativeDate ? format(tentativeDate, "yyyy-MM-dd") : "",
    );
  }, [tentativeDate, setValue]);

  useEffect(() => {
    setValue("packageId", selectedPackageId);
  }, [selectedPackageId, setValue]);

  const [serverState, formAction, pending] = useActionState(
    submitEventQuote,
    initialState,
  );

  useEffect(() => {
    if (serverState.message && !serverState.ok) {
      toast.error(serverState.message);
    }
  }, [serverState]);

  function onValid(data: FormOutput) {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      fd.set(k, String(v));
    });

    startTransition(() => {
      formAction(fd);
    });
  }

  const eventType = watch("eventType");
  const waHref = whatsappUrl(
    whatsapp,
    `Hola CasaCampo, me gustaría una cotización para un evento en ${property.name}.`,
  );

  return (
    <section id="cotizar" className="py-24 bg-bg">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <p className="text-sm uppercase tracking-widest text-teal-deep mb-4">
            Cotización
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold text-ink tracking-tight">
            Diseñemos tu evento juntos
          </h2>
          <p className="mt-4 text-ink/65 max-w-2xl">
            Te contactamos en menos de 24 horas para coordinar una reunión o
            videollamada y afinar cada detalle a tu medida. Sin compromiso.
          </p>
        </FadeIn>

        <form onSubmit={handleSubmit(onValid)} className="mt-12 space-y-10">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="eventType">Tipo de evento</Label>
              <Select
                value={eventType}
                onValueChange={(v) =>
                  setValue("eventType", v as FormInput["eventType"])
                }
              >
                <SelectTrigger id="eventType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {eventTypeLabels[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="estimatedGuests">Invitados estimados</Label>
              <Input
                id="estimatedGuests"
                type="number"
                inputMode="numeric"
                min={1}
                max={300}
                value={estimatedGuests}
                onChange={(e) =>
                  setEstimatedGuests(Number(e.target.value) || 1)
                }
              />
              {errors.estimatedGuests && (
                <p className="text-xs text-rose-muted">
                  {errors.estimatedGuests.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tentativeDate">Fecha tentativa</Label>
              <Popover>
                <PopoverTrigger
                  id="tentativeDate"
                  className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs hover:border-teal-deep/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-left"
                >
                  <CalendarDays className="mr-2 size-4 text-teal" />
                  {tentativeDate
                    ? format(tentativeDate, "d 'de' MMM yyyy", { locale: es })
                    : "Aún no la tengo"}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    locale={es}
                    selected={tentativeDate}
                    onSelect={setTentativeDate}
                    disabled={{ before: new Date() }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-ink mb-3">
              Elige un paquete (sugerimos el más ajustado a tu aforo)
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {packages.map((p) => {
                const disabled = p.maxGuests < estimatedGuests;
                const selected = selectedPackageId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => !disabled && setSelectedPackageId(p.id)}
                    disabled={disabled}
                    className={`group text-left rounded-2xl border p-5 transition-colors ${
                      selected
                        ? "border-teal-deep bg-teal-soft/30"
                        : disabled
                          ? "border-line/40 bg-bg opacity-50 cursor-not-allowed"
                          : "border-line/60 bg-bg hover:border-teal-deep/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-soft text-teal-deep px-2.5 py-1 text-xs font-medium">
                        <Users className="size-3" />
                        Hasta {p.maxGuests}
                      </span>
                      {selected && <Check className="size-4 text-teal-deep" />}
                    </div>
                    <p className="mt-3 text-base font-semibold text-ink">
                      {p.name}
                    </p>
                    <p className="mt-1 text-xs text-ink/60">
                      Hospedaje incluido para {p.includesLodgingCapacity}
                    </p>
                    <p className="mt-3 text-xl font-semibold text-teal-deep tabular-nums">
                      {formatPEN(p.priceCents)}
                    </p>
                    {p.parkingPropertyId && (
                      <p className="mt-2 inline-flex items-start gap-1 text-xs text-ink/60">
                        <Car className="size-3 mt-0.5 text-teal" />
                        Estac. en Chalet
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-ink/55">
              Los paquetes que no alcanzan tu aforo aparecen deshabilitados.
              Puedes enviar tu cotización sin seleccionar paquete y lo afinamos
              en la conversación.
            </p>
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
            <Label htmlFor="message">Cuéntanos más (opcional)</Label>
            <Textarea
              id="message"
              placeholder="Estilo del evento, número aproximado de niños, requisitos especiales, presupuesto orientativo…"
              rows={4}
              {...register("message")}
            />
          </div>

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
                políticas de privacidad
              </a>{" "}
              y autorizo el contacto comercial.
            </span>
          </label>
          {errors.consent && (
            <p className="text-xs text-rose-muted">{errors.consent.message}</p>
          )}

          <input type="hidden" {...register("propertyId")} />
          <input type="hidden" {...register("packageId")} />
          <input type="hidden" {...register("tentativeDate")} />
          <input type="hidden" {...register("estimatedGuests")} />

          <div className="flex flex-wrap items-center gap-4">
            <Button
              type="submit"
              disabled={isSubmitting || pending}
              className="bg-teal-deep hover:bg-teal text-bg rounded-full px-7 py-6 text-base"
            >
              {isSubmitting || pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Enviando…
                </>
              ) : (
                "Solicitar cotización"
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
        </form>
      </div>
    </section>
  );
}
