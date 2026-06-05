"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type Mode = "reject" | "cancel" | "delete";

// Detail-page reject / cancel / delete actions, gated to the same state machine
// as the list tables and confirmed via in-app dialogs (never the browser's
// native confirm). Reuses the bulk RPC actions with a single id.
export function DetailDangerZone({
  id,
  status,
  listHref,
  recipient,
  onReject,
  onCancel,
  onDelete,
}: {
  id: string;
  status: string;
  listHref: string;
  recipient: string; // "huésped" | "cliente" — for the rejection-email copy
  onReject: (ids: string[], notes?: string) => Promise<{ rejected: number }>;
  onCancel: (ids: string[], notes?: string) => Promise<{ cancelled: number }>;
  onDelete: (ids: string[]) => Promise<{ deleted: number }>;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  const canReject = !["confirmed", "rejected", "cancelled"].includes(status);
  const canCancel = status === "confirmed";
  const canDelete = status !== "confirmed";

  function close() {
    setMode(null);
    setNotes("");
    setError(false);
  }

  function run() {
    if (!mode) return;
    startTransition(async () => {
      try {
        if (mode === "reject") await onReject([id], notes.trim());
        else if (mode === "cancel") await onCancel([id], notes.trim());
        else await onDelete([id]);

        if (mode === "delete") {
          router.push(listHref);
        } else {
          close();
          router.refresh();
        }
      } catch {
        setError(true);
      }
    });
  }

  const copy: Record<Mode, { title: string; description: string; cta: string }> = {
    reject: {
      title: "Rechazar",
      description: `Se marcará como rechazada y se liberarán sus fechas. Se enviará el correo de rechazo al ${recipient}.`,
      cta: "Rechazar",
    },
    cancel: {
      title: "Cancelar",
      description:
        "Se marcará como cancelada y se liberarán sus fechas bloqueadas. No se envía correo.",
      cta: "Cancelar",
    },
    delete: {
      title: "Eliminar",
      description:
        "Se eliminará permanentemente junto con sus fechas bloqueadas. Esta acción no se puede deshacer.",
      cta: "Eliminar",
    },
  };

  if (!canReject && !canCancel && !canDelete) return null;

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {canReject && (
          <button
            onClick={() => setMode("reject")}
            className="rounded-full border border-line/60 px-5 py-2 text-sm text-ink/75 hover:border-rose-muted hover:text-rose-muted transition-colors"
          >
            Rechazar
          </button>
        )}
        {canCancel && (
          <button
            onClick={() => setMode("cancel")}
            className="rounded-full border border-line/60 px-5 py-2 text-sm text-ink/75 hover:border-rose-muted hover:text-rose-muted transition-colors"
          >
            Cancelar
          </button>
        )}
        {canDelete && (
          <button
            onClick={() => setMode("delete")}
            className="inline-flex items-center gap-1.5 rounded-full border border-rose-muted/60 text-rose-muted px-5 py-2 text-sm hover:bg-rose-muted/10 transition-colors"
          >
            <Trash2 className="size-4" /> Eliminar
          </button>
        )}
      </div>
      <p className="mt-3 text-xs text-ink/55">
        Una confirmada debe cancelarse antes de poder eliminarse. Cancelar o
        rechazar libera las fechas bloqueadas.
      </p>

      <Dialog open={mode !== null} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          {mode && (
            <>
              <DialogHeader>
                <DialogTitle>{copy[mode].title}</DialogTitle>
                <DialogDescription>
                  {error
                    ? "Ocurrió un error. Reintenta."
                    : copy[mode].description}
                </DialogDescription>
              </DialogHeader>

              {(mode === "reject" || mode === "cancel") && (
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
                        ? `Se incluye en el correo al ${recipient}`
                        : "Nota interna (no se envía correo)"
                    }
                  />
                </div>
              )}

              <DialogFooter>
                <button
                  onClick={close}
                  disabled={pending}
                  className="rounded-full border border-line/60 px-4 py-1.5 text-sm text-ink/70 hover:border-ink/40 transition-colors"
                >
                  Volver
                </button>
                <button
                  onClick={run}
                  disabled={pending}
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-1.5 text-sm font-medium text-bg disabled:opacity-50 transition-colors ${
                    mode === "reject"
                      ? "bg-teal-deep hover:bg-teal"
                      : "bg-rose-muted hover:bg-rose-muted/85"
                  }`}
                >
                  {pending && <Loader2 className="size-3.5 animate-spin" />}
                  {copy[mode].cta}
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
