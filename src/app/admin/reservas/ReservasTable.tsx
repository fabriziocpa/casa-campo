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
import { formatPEN } from "@/lib/money";
import {
  confirmReservation,
  bulkConfirmReservations,
  bulkRejectReservations,
  bulkCancelReservations,
  bulkDeleteReservations,
} from "@/features/reservations/adminActions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type Status = "pending" | "confirmed" | "rejected" | "cancelled";

export type ReservaRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalCents: number;
  status: Status;
};

const STATUS_LABEL: Record<Status, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  rejected: "Rechazada",
  cancelled: "Cancelada",
};

type BulkMode = "confirm" | "reject" | "cancel" | "delete";

type ResultBanner = { ok: boolean; message: string } | null;

// Eligibility of a set of rows for each action. Mirrors the server-side gates:
// reject only on "sin confirmar" (pending), cancel only on confirmed, delete
// on anything that isn't confirmed (confirmed must be cancelled first).
function eligibility(rs: ReservaRow[]) {
  return {
    confirmable: rs.filter((r) => r.status === "pending").map((r) => r.id),
    rejectable: rs.filter((r) => r.status === "pending").map((r) => r.id),
    cancellable: rs.filter((r) => r.status === "confirmed").map((r) => r.id),
    deletable: rs.filter((r) => r.status !== "confirmed").map((r) => r.id),
  };
}

export function ReservasTable({ rows }: { rows: ReservaRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<BulkMode | null>(null);
  // When set, the open dialog targets just this row (single-row action) instead
  // of the multi-selection — so single-row actions don't clobber a selection.
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

  // Counts shown on the bulk bar come from the multi-selection.
  const barEligible = eligibility(selectedRows);

  // The dialog and the action run against the target rows: a single row when a
  // single-row action opened it, otherwise the whole selection.
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
        if (mode === "confirm") {
          const r = await bulkConfirmReservations(target.confirmable);
          const parts: string[] = [];
          if (r.confirmed) parts.push(`${r.confirmed} confirmada(s)`);
          if (r.conflicts.length) {
            const detail = r.conflicts
              .map((c) => `${c.name} (${c.dates.join(", ")})`)
              .join("; ");
            parts.push(`${r.conflicts.length} con conflicto: ${detail}`);
          }
          if (r.errors) parts.push(`${r.errors} con error`);
          setBanner({
            ok: r.conflicts.length === 0 && r.errors === 0,
            message: parts.join(". ") || "Nada que confirmar.",
          });
        } else if (mode === "reject") {
          const r = await bulkRejectReservations(target.rejectable, notes.trim());
          setBanner({ ok: true, message: `${r.rejected} reserva(s) rechazada(s).` });
        } else if (mode === "cancel") {
          const r = await bulkCancelReservations(target.cancellable, notes.trim());
          setBanner({ ok: true, message: `${r.cancelled} reserva(s) cancelada(s).` });
        } else {
          const r = await bulkDeleteReservations(target.deletable);
          setBanner({ ok: true, message: `${r.deleted} reserva(s) eliminada(s).` });
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
    confirm: {
      title: "Confirmar en conjunto",
      description:
        "Se confirmarán las reservas pendientes seleccionadas y se enviará el correo de confirmación. Las que tengan conflicto de fechas se omiten.",
      cta: "Confirmar",
      count: target.confirmable.length,
    },
    reject: {
      title: "Rechazar en conjunto",
      description:
        "Se marcarán como rechazadas y se liberarán sus fechas. Se enviará el correo de rechazo a cada huésped.",
      cta: "Rechazar",
      count: target.rejectable.length,
    },
    cancel: {
      title: "Cancelar reservas confirmadas",
      description:
        "Se marcarán como canceladas y se liberarán sus fechas bloqueadas. No se envía correo al huésped.",
      cta: "Cancelar reservas",
      danger: true,
      count: target.cancellable.length,
    },
    delete: {
      title: "Eliminar en conjunto",
      description:
        "Se eliminarán permanentemente las reservas seleccionadas y sus fechas bloqueadas. Las confirmadas deben cancelarse primero. Esta acción no se puede deshacer.",
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
              onClick={() => openBulk("confirm")}
              disabled={barEligible.confirmable.length === 0 || pending}
              className="rounded-full bg-teal-deep text-bg px-3 py-1 text-xs font-medium hover:bg-teal disabled:opacity-40 transition-colors"
            >
              Confirmar ({barEligible.confirmable.length})
            </button>
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
              <th className="text-left px-4 py-3">Huésped</th>
              <th className="text-left px-4 py-3">Casa</th>
              <th className="text-left px-4 py-3">Fechas</th>
              <th className="text-right px-4 py-3">Pers.</th>
              <th className="text-right px-4 py-3">Total</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-right px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/50">
            {rows.map((r) => (
              <tr
                key={r.id}
                className={`transition-colors ${
                  selected.has(r.id) ? "bg-teal-soft/40" : "hover:bg-teal-soft/30"
                }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    onChange={() => toggle(r.id)}
                    className="size-4 accent-teal-deep cursor-pointer align-middle"
                    aria-label={`Seleccionar reserva de ${r.firstName} ${r.lastName}`}
                  />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/reservas/${r.id}`}
                    className="font-medium text-ink hover:text-teal-deep"
                  >
                    {r.firstName} {r.lastName}
                  </Link>
                  <p className="text-xs text-ink/50">{r.email}</p>
                </td>
                <td className="px-4 py-3 text-ink/75">{r.propertyName}</td>
                <td className="px-4 py-3 text-ink/75">
                  {r.checkIn} → {r.checkOut}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{r.guests}</td>
                <td className="px-4 py-3 text-right tabular-nums font-medium text-teal-deep">
                  {formatPEN(r.totalCents)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    {r.status === "pending" && (
                      <>
                        <form action={confirmReservation}>
                          <input type="hidden" name="id" value={r.id} />
                          <button
                            type="submit"
                            className="rounded-full bg-teal-deep text-bg px-3 py-1 text-xs font-medium hover:bg-teal transition-colors"
                            title="Confirmar reserva (verifica conflictos)"
                          >
                            Confirmar
                          </button>
                        </form>
                        <button
                          onClick={() => openSingle(r.id, "reject")}
                          className="rounded-full border border-line/60 px-3 py-1 text-xs text-ink/70 hover:border-rose-muted hover:text-rose-muted transition-colors"
                          title="Rechazar"
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                    {r.status === "confirmed" && (
                      <button
                        onClick={() => openSingle(r.id, "cancel")}
                        className="rounded-full border border-line/60 px-3 py-1 text-xs text-ink/70 hover:border-rose-muted hover:text-rose-muted transition-colors"
                        title="Cancelar (libera fechas)"
                      >
                        Cancelar
                      </button>
                    )}
                    {r.status !== "confirmed" && (
                      <button
                        onClick={() => openSingle(r.id, "delete")}
                        className="inline-flex items-center rounded-full border border-rose-muted/60 text-rose-muted p-1.5 hover:bg-rose-muted/10 transition-colors"
                        title="Eliminar"
                        aria-label="Eliminar reserva"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                    <Link
                      href={`/admin/reservas/${r.id}`}
                      className="inline-flex items-center rounded-full text-teal-deep hover:bg-teal-soft/50 p-1.5 transition-colors"
                      aria-label="Abrir reserva"
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
                    ? "Ninguna de las reservas seleccionadas aplica para esta acción."
                    : `${modalCopy[mode].count} reserva(s) afectada(s). ${modalCopy[mode].description}`}
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
                          ? "Se incluye en el correo al huésped"
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

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    pending: "bg-gold/20 text-ink ring-gold/40",
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
