"use client";

import { Pause, Play, RotateCcw, Square, Undo2 } from "lucide-react";
import type { TripStatus } from "@/hooks/useTrip";
import { cn } from "@/lib/cn";

/**
 * Controles del viaje. Cada botón está ligado a un estado concreto:
 * no hay botones decorativos.
 */
export function TripControls({
  status,
  hasReturn,
  onStart,
  onPause,
  onResume,
  onFinish,
  onRestart,
  onStartReturn,
}: {
  status: TripStatus;
  hasReturn: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
  onRestart: () => void;
  onStartReturn: () => void;
}) {
  const moving = status === "traveling" || status === "returning" || status === "station-stop";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {(status === "idle" || status === "ready") && (
        <Button onClick={onStart} tone="verde">
          <Play size={15} fill="currentColor" /> Iniciar viaje
        </Button>
      )}

      {moving && (
        <>
          <Button onClick={onPause} tone="claro">
            <Pause size={15} /> Pausar
          </Button>
          <Button onClick={onFinish} tone="borde">
            <Square size={13} fill="currentColor" /> Finalizar
          </Button>
        </>
      )}

      {status === "paused" && (
        <>
          <Button onClick={onResume} tone="verde">
            <Play size={15} fill="currentColor" /> Continuar
          </Button>
          <Button onClick={onFinish} tone="borde">
            <Square size={13} fill="currentColor" /> Finalizar
          </Button>
        </>
      )}

      {status === "return-ready" && hasReturn && (
        <Button onClick={onStartReturn} tone="azul">
          <Undo2 size={15} /> Iniciar vuelta
        </Button>
      )}

      {(status === "completed" || status === "finished" || status === "return-ready" || status === "paused") && (
        <Button onClick={onRestart} tone="borde">
          <RotateCcw size={14} /> Reiniciar
        </Button>
      )}
    </div>
  );
}

function Button({
  children,
  onClick,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone: "verde" | "azul" | "claro" | "borde";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold transition-all active:scale-[.97]",
        tone === "verde" &&
          "bg-verde text-white shadow-[0_4px_14px_rgba(0,155,58,.26)] hover:bg-verde-oscuro",
        tone === "azul" &&
          "bg-azul text-white shadow-[0_4px_14px_rgba(22,135,248,.26)] hover:brightness-95",
        tone === "claro" && "bg-verde-claro text-verde-oscuro hover:bg-verde hover:text-white",
        tone === "borde" && "border border-borde bg-white text-tinta-suave hover:text-tinta",
      )}
    >
      {children}
    </button>
  );
}
