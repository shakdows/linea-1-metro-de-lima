"use client";

import { AnimatePresence, motion, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import { Crosshair, MapPin, Pause, Play, Square, TrainFront, Undo2 } from "lucide-react";
import { useState } from "react";
import type { Station } from "@/data/stations";
import type { TripStatus } from "@/hooks/useTrip";
import { cn } from "@/lib/cn";

/**
 * Panel flotante de cristal sobre el mapa durante el viaje.
 * Es la interfaz principal del estado «viajando»: el resto de módulos
 * pasa a segundo plano.
 */
export function TripHUD({
  status,
  progress,
  current,
  next,
  directionTo,
  remaining,
  variant,
  follow,
  onToggleFollow,
  onPause,
  onResume,
  onFinish,
  onStartReturn,
  hasReturn,
}: {
  status: TripStatus;
  progress: MotionValue<number>;
  current: Station;
  next: Station | null;
  directionTo: string;
  remaining: number;
  variant: "ida" | "vuelta";
  follow: boolean;
  onToggleFollow: () => void;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
  onStartReturn: () => void;
  hasReturn: boolean;
}) {
  const [percent, setPercent] = useState(0);
  useMotionValueEvent(progress, "change", (v) => setPercent(Math.round(v * 100)));
  const width = useTransform(progress, (v) => `${Math.max(0, Math.min(1, v)) * 100}%`);

  const accent = variant === "ida" ? "bg-verde" : "bg-azul";
  const moving = status === "traveling" || status === "returning" || status === "station-stop";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 14, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="glass pointer-events-auto w-full rounded-2xl p-4 lg:w-[330px]"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className={cn("grid size-8 place-items-center rounded-lg text-white", accent)}>
          <TrainFront size={16} />
        </span>
        <span className="text-[11px] font-bold tracking-[.1em] text-tinta-suave uppercase">
          {status === "paused" ? "Viaje en pausa" : status === "station-stop" ? "En estación" : status === "return-ready" ? "Has llegado" : status === "finished" ? "Viaje completado" : "Viaje en curso"}
        </span>
        <button
          type="button"
          onClick={onToggleFollow}
          aria-pressed={follow}
          title="La cámara sigue al tren"
          className={cn(
            "ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold transition-colors",
            follow ? "bg-verde text-white" : "bg-white/70 text-tinta-suave hover:text-tinta",
          )}
        >
          <Crosshair size={12} /> Seguir
        </button>
      </div>

      <p className="text-[21px] leading-tight font-extrabold tracking-tight">{current.name}</p>
      <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-tinta-suave">
        <MapPin size={12} /> {current.avenue}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/65 px-3 py-2.5">
          <p className="text-[10.5px] font-semibold text-tinta-suave">Siguiente</p>
          <p className="truncate text-[13.5px] font-extrabold tracking-tight">{next?.name ?? "—"}</p>
        </div>
        <div className="rounded-xl bg-white/65 px-3 py-2.5">
          <p className="text-[10.5px] font-semibold text-tinta-suave">Restante</p>
          <p className="text-[13.5px] font-extrabold tracking-tight tabular">{remaining} min</p>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1.5 flex items-baseline justify-between text-[11px]">
          <span className="font-semibold text-tinta-suave">Dirección {directionTo}</span>
          <span className="text-[14px] font-extrabold tracking-tight tabular">{percent}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-tinta/10">
          <motion.div style={{ width }} className={cn("h-full rounded-full", accent)} />
        </div>
      </div>

      <div className="mt-3.5 flex gap-2">
        {moving ? (
          <Btn onClick={onPause} tone="claro" full>
            <Pause size={14} /> Pausar
          </Btn>
        ) : null}
        {status === "paused" ? (
          <Btn onClick={onResume} tone={variant} full>
            <Play size={14} fill="currentColor" /> Continuar
          </Btn>
        ) : null}
        {status === "return-ready" && hasReturn ? (
          <Btn onClick={onStartReturn} tone="vuelta" full>
            <Undo2 size={14} /> Iniciar vuelta
          </Btn>
        ) : null}
        <Btn onClick={onFinish} tone="gris" full={status === "finished"}>
          <Square size={12} fill="currentColor" /> Terminar
        </Btn>
      </div>
    </motion.div>
  );
}

function Btn({
  children, onClick, tone, full,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone: "ida" | "vuelta" | "claro" | "gris";
  full?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2.5 text-[12.5px] font-bold transition-all active:scale-[.97]",
        full && "flex-1",
        tone === "ida" && "bg-verde text-white hover:bg-verde-oscuro",
        tone === "vuelta" && "bg-azul text-white hover:brightness-95",
        tone === "claro" && "bg-verde-claro text-verde-oscuro hover:bg-verde hover:text-white",
        tone === "gris" && "bg-white/70 text-tinta-suave hover:text-tinta",
      )}
    >
      {children}
    </button>
  );
}

/** Aviso de llegada a una estación */
export function ArrivalToast({ station, show }: { station: Station | null; show: boolean }) {
  return (
    <AnimatePresence>
      {show && station ? (
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 340, damping: 30 }}
          className="glass-oscuro pointer-events-none max-w-full rounded-2xl px-4 py-3"
        >
          <p className="text-[10.5px] font-bold tracking-[.12em] text-white/60 uppercase">Llegando a</p>
          <p className="truncate text-[15px] font-extrabold tracking-tight">🚉 {station.name}</p>
          <p className="mt-0.5 text-[11.5px] text-white/70">{station.avenue}</p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
