"use client";

import { useMemo, useRef, useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  X,
} from "lucide-react";
import {
  setEventQuoteStatus,
  bulkRejectEventQuotes,
  bulkCancelEventQuotes,
  bulkDeleteEventQuotes,
} from "@/features/event-quotes/adminActions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type Status =
  | "pending"
  | "in_conversation"
  | "quoted"
  | "confirmed"
  | "rejected"
  | "cancelled";

export type CotizacionRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  propertyName: string;
  eventType: string;
  tentativeDate: string | null;
  estimatedGuests: number;
  status: Status;
};

const STATUS_LABEL: Record<Status, string> = {
  pending: "Pendiente",
  in_conversation: "En conversación",
  quoted: "Cotizada",
  confirmed: "Confirmada",
  rejected: "Rechazada",
  cancelled: "Cancelada",
};

const SIN_CONFIRMAR: Status[] = ["pending", "in_conversation", "quoted"];

type BulkMode = "reject" | "cancel" | "delete";

type ResultBanner = { ok: boolean; message: string } | null;

// Eligibility mirrors the server-side gates: reject only on "sin confirmar"
// quotes, cancel only on confirmed, delete on anything that isn't confirmed
// (a confirmed quote must be cancelled first).
function eligibility(rs: CotizacionRow[]) {
  return {
    rejectable: rs
      .filter((r) => SIN_CONFIRMAR.includes(r.status))
      .map((r) => r.id),
    cancellable: rs.filter((r) => r.status === "confirmed").map((r) => r.id),
    deletable: rs.filter((r) => r.status !== "confirmed").map((r) => r.id),
  };
}

export function CotizacionesTable({ rows }: { rows: CotizacionRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<BulkMode | null>(null);
  // When set, the open dialog targets just this row (single-row action).
  const [single, setSingle] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [banner, setBanner] = useState<ResultBanner>(null);
  const [pending, startTransition] = useTransition();
  const selectAllRef = useRef<HTMLInputElement>(null);

  // Selection is derived from the current rows at render time: any id that no
  // longer matches a row (e.g. removed after a refresh) is simply ignored, so
  // there's no need to prune the underlying set in an effect.
  const selectedRows = useMemo(
    () => rows.filter((r) => selected.has(r.id)),
    [rows, selected],
  );
  const selectedCount = selectedRows.length;

  const barEligible = eligibility(selectedRows);

  const targetRows = single ? rows.filter((r) => r.id === single) : selectedRows;
  const target = eligibility(targetRows);

  const allChecked = rows.length > 0 && selectedCount === rows.length;
  const someChecked = selectedCount > 0 && !allChecked;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someChecked;
  }, [someChecked]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(
      selectedCount === rows.length ? new Set() : new Set(rows.map((r) => r.id)),
    );
  }

  function openBulk(m: BulkMode) {
    setSingle(null);
    setMode(m);
  }

  function openSingle(id: string, m: BulkMode) {
    setSingle(id);
    setMode(m);
  }

  function closeDialog() {
    setMode(null);
    setSingle(null);
  }

  function runBulk() {
    if (!mode) return;
    startTransition(async () => {
      try {
        if (mode === "reject") {
          const r = await bulkRejectEventQuotes(target.rejectable, notes.trim());
          setBanner({
            ok: true,
            message: `${r.rejected} cotización(es) rechazada(s).`,
          });
        } else if (mode === "cancel") {
          const r = await bulkCancelEventQuotes(target.cancellable, notes.trim());
          setBanner({
            ok: true,
            message: `${r.cancelled} cotización(es) cancelada(s).`,
          });
        } else {
          const r = await bulkDeleteEventQuotes(target.deletable);
          setBanner({
            ok: true,
            message: `${r.deleted} cotización(es) eliminada(s).`,
          });
        }
        if (!single) setSelected(new Set());
        setNotes("");
        closeDialog();
        router.refresh();
      } catch {
        setBanner({ ok: false, message: "Ocurrió un error. Reintenta." });
        closeDialog();
      }
    });
  }

  const modalCopy: Record<
    BulkMode,
    { title: string; description: string; cta: string; danger?: boolean; count: number }
  > = {
    reject: {
      title: "Rechazar en conjunto",
      description:
        "Se marcarán como rechazadas y se liberarán sus fechas. Se enviará el correo de rechazo a cada cliente.",
      cta: "Rechazar",
      count: target.rejectable.length,
    },
    cancel: {
      title: "Cancelar eventos confirmados",
      description:
        "Se marcarán como cancelados y se liberarán sus fechas bloqueadas (evento y estacionamiento). No se envía correo al cliente.",
      cta: "Cancelar eventos",
      danger: true,
      count: target.cancellable.length,
    },
    delete: {
      title: "Eliminar en conjunto",
      description:
        "Se eliminarán permanentemente las cotizaciones seleccionadas y sus fechas bloqueadas. Las confirmadas deben cancelarse primero. Esta acción no se puede deshacer.",
      cta: "Eliminar",
      danger: true,
      count: target.deletable.length,
    },
  };

  return (
    <div className="space-y-4">
      {banner && (
        <div
          className={`flex items-start gap-2 rounded-lg px-4 py-3 text-sm ${
            banner.ok
              ? "bg-teal-soft/60 text-teal-deep"
              : "bg-rose-muted/20 text-ink ring-1 ring-rose-muted/40"
          }`}
        >
          {banner.ok ? (
            <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="size-4 mt-0.5 shrink-0" />
          )}
          <p className="flex-1">{banner.message}</p>
          <button
            onClick={() => setBanner(null)}
            className="text-ink/40 hover:text-ink"
            aria-label="Cerrar aviso"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {selectedCount > 0 && (
        <div className="sticky top-2 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-teal-deep/30 bg-bg px-4 py-3 shadow-sm">
          <span className="text-sm font-medium text-ink">
            {selectedCount} seleccionada{selectedCount === 1 ? "" : "s"}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => openBulk("reject")}
              disabled={barEligible.rejectable.length === 0 || pending}
              className="rounded-full border border-line/60 px-3 py-1 text-xs text-ink/70 hover:border-rose-muted hover:text-rose-muted disabled:opacity-40 transition-colors"
            >
              Rechazar ({barEligible.rejectable.length})
            </button>
            <button
              onClick={() => openBulk("cancel")}
              disabled={barEligible.cancellable.length === 0 || pending}
              className="rounded-full border border-line/60 px-3 py-1 text-xs text-ink/70 hover:border-rose-muted hover:text-rose-muted disabled:opacity-40 transition-colors"
            >
              Cancelar ({barEligible.cancellable.length})
            </button>
            <button
              onClick={() => openBulk("delete")}
              disabled={barEligible.deletable.length === 0 || pending}
              className="inline-flex items-center gap-1 rounded-full border border-rose-muted/60 text-rose-muted px-3 py-1 text-xs hover:bg-rose-muted/10 disabled:opacity-40 transition-colors"
            >
              <Trash2 className="size-3" /> Eliminar ({barEligible.deletable.length})
            </button>
          </div>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-ink/50 hover:text-ink"
          >
            Limpiar selección
          </button>
        </div>
      )}

      <div className="rounded-xl border border-line/60 bg-bg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-teal-soft/50 text-teal-deep text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  className="size-4 accent-teal-deep cursor-pointer align-middle"
                  aria-label="Seleccionar todas"
                />
              </th>
              <th className="text-left px-4 py-3">Cliente</th>
              <th className="text-left px-4 py-3">Tipo</th>
              <th className="text-left px-4 py-3">Casa</th>
              <th className="text-left px-4 py-3">Fecha tentativa</th>
              <th className="text-right px-4 py-3">Pers.</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-right px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/50">
            {rows.map((q) => (
              <tr
                key={q.id}
                className={`transition-colors ${
                  selected.has(q.id) ? "bg-teal-soft/40" : "hover:bg-teal-soft/30"
                }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(q.id)}
                    onChange={() => toggle(q.id)}
                    className="size-4 accent-teal-deep cursor-pointer align-middle"
                    aria-label={`Seleccionar cotización de ${q.firstName} ${q.lastName}`}
                  />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/cotizaciones/${q.id}`}
                    className="font-medium text-ink hover:text-teal-deep"
                  >
                    {q.firstName} {q.lastName}
                  </Link>
                  <p className="text-xs text-ink/50">{q.email}</p>
                </td>
                <td className="px-4 py-3 text-ink/75 capitalize">{q.eventType}</td>
                <td className="px-4 py-3 text-ink/75">{q.propertyName}</td>
                <td className="px-4 py-3 text-ink/75">{q.tentativeDate ?? "—"}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {q.estimatedGuests}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={q.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <InlineTransition status={q.status} id={q.id} />
                    {SIN_CONFIRMAR.includes(q.status) && (
                      <button
                        onClick={() => openSingle(q.id, "reject")}
                        className="rounded-full border border-line/60 px-3 py-1 text-xs text-ink/70 hover:border-rose-muted hover:text-rose-muted transition-colors"
                        title="Rechazar"
                      >
                        Rechazar
                      </button>
                    )}
                    {q.status === "confirmed" && (
                      <button
                        onClick={() => openSingle(q.id, "cancel")}
                        className="rounded-full border border-line/60 px-3 py-1 text-xs text-ink/70 hover:border-rose-muted hover:text-rose-muted transition-colors"
                        title="Cancelar (libera fechas)"
                      >
                        Cancelar
                      </button>
                    )}
                    {q.status !== "confirmed" && (
                      <button
                        onClick={() => openSingle(q.id, "delete")}
                        className="inline-flex items-center rounded-full border border-rose-muted/60 text-rose-muted p-1.5 hover:bg-rose-muted/10 transition-colors"
                        title="Eliminar"
                        aria-label="Eliminar cotización"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                    <Link
                      href={`/admin/cotizaciones/${q.id}`}
                      className="inline-flex items-center rounded-full text-teal-deep hover:bg-teal-soft/50 p-1.5 transition-colors"
                      aria-label="Abrir cotización"
                    >
                      <ChevronRight className="size-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={mode !== null} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          {mode && (
            <>
              <DialogHeader>
                <DialogTitle>{modalCopy[mode].title}</DialogTitle>
                <DialogDescription>
                  {modalCopy[mode].count === 0
                    ? "Ninguna de las cotizaciones seleccionadas aplica para esta acción."
                    : `${modalCopy[mode].count} cotización(es) afectada(s). ${modalCopy[mode].description}`}
                </DialogDescription>
              </DialogHeader>

              {(mode === "reject" || mode === "cancel") &&
                modalCopy[mode].count > 0 && (
                  <div>
                    <label className="text-xs uppercase tracking-wider text-ink/55">
                      Motivo (opcional)
                    </label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="mt-1 bg-bg"
                      placeholder={
                        mode === "reject"
                          ? "Se incluye en el correo al cliente"
                          : "Nota interna (no se envía correo)"
                      }
                    />
                  </div>
                )}

              <DialogFooter>
                <button
                  onClick={closeDialog}
                  disabled={pending}
                  className="rounded-full border border-line/60 px-4 py-1.5 text-sm text-ink/70 hover:border-ink/40 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={runBulk}
                  disabled={pending || modalCopy[mode].count === 0}
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-1.5 text-sm font-medium text-bg disabled:opacity-50 transition-colors ${
                    modalCopy[mode].danger
                      ? "bg-rose-muted hover:bg-rose-muted/85"
                      : "bg-teal-deep hover:bg-teal"
                  }`}
                >
                  {pending && <Loader2 className="size-3.5 animate-spin" />}
                  {modalCopy[mode].cta}
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Quick non-destructive status transitions (pending → en conversación → cotizada)
// as plain form actions — no confirmation needed. Confirming an event needs
// dates and lives on the detail page.
function InlineTransition({ status, id }: { status: Status; id: string }) {
  const next: { label: string; status: "in_conversation" | "quoted" } | null =
    status === "pending"
      ? { label: "En conversación", status: "in_conversation" }
      : status === "in_conversation"
        ? { label: "Marcar cotizada", status: "quoted" }
        : null;

  if (!next) return null;

  return (
    <form action={setEventQuoteStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={next.status} />
      <button
        type="submit"
        className="rounded-full bg-teal-soft text-teal-deep px-3 py-1 text-xs font-medium hover:bg-teal-soft/70 transition-colors"
        title={`Mover a ${next.label.toLowerCase()}`}
      >
        {next.label}
      </button>
    </form>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    pending: "bg-gold/20 text-ink ring-gold/40",
    in_conversation: "bg-teal-soft/70 text-teal-deep ring-teal-deep/30",
    quoted: "bg-teal-soft text-teal-deep ring-teal-deep/40",
    confirmed: "bg-teal-deep text-bg ring-teal-deep",
    rejected: "bg-rose-muted/30 text-ink ring-rose-muted/50",
    cancelled: "bg-line/40 text-ink/60 ring-line",
  };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider ring-1 ${styles[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
