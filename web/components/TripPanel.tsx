"use client";

import { motion, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import { Crosshair, MapPin, Pause, Play, RotateCcw, Square, TrainFront, Undo2 } from "lucide-react";
import { useState } from "react";
import type { Station } from "@/data/stations";
import type { TripStatus } from "@/hooks/useTrip";
import { cn } from "@/lib/cn";

/** Panel del viaje: sustituye al planificador mientras el tren circula */
export function TripPanel({
  status, progress, from, to, current, next, directionTo, totalMinutes, stops, remaining,
  variant, follow, onToggleFollow, onStart, onPause, onResume, onFinish, onRestart, onStartReturn, hasReturn,
}: {
  status: TripStatus;
  progress: MotionValue<number>;
  from: Station;
  to: Station;
  current: Station;
  next: Station | null;
  directionTo: string;
  totalMinutes: number;
  stops: number;
  remaining: number;
  variant: "ida" | "vuelta";
  follow: boolean;
  onToggleFollow: () => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
  onRestart: () => void;
  onStartReturn: () => void;
  hasReturn: boolean;
}) {
  const [percent, setPercent] = useState(0);
  useMotionValueEvent(progress, "change", (v) => setPercent(Math.round(v * 100)));
  const width = useTransform(progress, (v) => `${Math.max(0, Math.min(1, v)) * 100}%`);

  const accent = variant === "ida" ? "bg-verde" : "bg-azul";
  const moving = status === "traveling" || status === "returning" || status === "station-stop";
  const started = moving || status === "paused" || status === "return-ready" || status === "finished";

  return (
    <div className="space-y-4 p-4">
      <div className="rounded-2xl border border-borde bg-white p-4 shadow-suave">
        <div className="mb-3 flex items-center gap-2">
          <span className={cn("grid size-8 place-items-center rounded-lg text-white", accent)}>
            <TrainFront size={16} />
          </span>
          <p className="text-[13px] font-extrabold tracking-tight">Tu viaje</p>
          {started ? (
            <span className="ml-auto rounded-full bg-verde-claro px-2.5 py-1 text-[10.5px] font-bold text-verde-oscuro">
              {status === "paused" ? "En pausa" : status === "finished" ? "Completado" : status === "return-ready" ? "Has llegado" : "En curso"}
            </span>
          ) : null}
        </div>

        <p className="text-[15px] font-extrabold tracking-tight">
          {from.name} <span className="text-tinta-suave">→</span> {to.name}
        </p>

        {/* Progreso con las paradas */}
        <div className="relative mt-4 mb-1 h-2 rounded-full bg-borde">
          <motion.div style={{ width }} className={cn("h-full rounded-full", accent)} />
        </div>
        <div className="flex justify-between text-[10.5px] font-semibold text-tinta-suave">
          <span>{from.name}</span>
          <span className="tabular">{percent}%</span>
          <span>{to.name}</span>
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Metric value={`${totalMinutes}`} unit="min" label="Tiempo total" />
          <Metric value={`${stops}`} label="Estaciones" />
          <Metric value={`${remaining}`} unit="min" label="Restantes" />
        </dl>

        <div className="mt-4 flex gap-2">
          {!started ? (
            <Btn onClick={onStart} tone={variant} full>
              <Play size={14} fill="currentColor" /> Iniciar viaje
            </Btn>
          ) : null}
          {moving ? (
            <>
              <Btn onClick={onPause} tone="claro" full>
                <Pause size={14} /> Pausar
              </Btn>
              <Btn onClick={onFinish} tone="rojo">
                <Square size={12} fill="currentColor" /> Finalizar
              </Btn>
            </>
          ) : null}
          {status === "paused" ? (
            <>
              <Btn onClick={onResume} tone={variant} full>
                <Play size={14} fill="currentColor" /> Continuar
              </Btn>
              <Btn onClick={onFinish} tone="rojo">
                <Square size={12} fill="currentColor" /> Finalizar
              </Btn>
            </>
          ) : null}
          {status === "return-ready" && hasReturn ? (
            <Btn onClick={onStartReturn} tone="vuelta" full>
              <Undo2 size={14} /> Iniciar vuelta
            </Btn>
          ) : null}
          {status === "finished" || status === "return-ready" ? (
            <Btn onClick={onRestart} tone="gris">
              <RotateCcw size={13} /> Reiniciar
            </Btn>
          ) : null}
        </div>
      </div>

      {/* Estación actual */}
      {started ? (
        <div className="rounded-2xl border border-borde bg-white p-4 shadow-suave">
          <p className="mb-3 text-[13px] font-extrabold tracking-tight">Estación actual</p>
          <p className="flex items-center gap-2 text-[16px] font-extrabold tracking-tight">
            <span className={cn("size-2.5 rounded-full", accent, moving && (variant === "ida" ? "halo" : "halo-azul"))} />
            {current.name}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-tinta-suave">
            <MapPin size={12} /> Continúa por {current.avenue}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-fondo px-3 py-2.5">
              <p className="text-[10.5px] text-tinta-suave">Próxima estación</p>
              <p className="truncate text-[13px] font-extrabold tracking-tight">{next?.name ?? "—"}</p>
            </div>
            <div className="rounded-xl bg-fondo px-3 py-2.5">
              <p className="text-[10.5px] text-tinta-suave">Dirección</p>
              <p className="truncate text-[13px] font-extrabold tracking-tight">{directionTo}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleFollow}
            aria-pressed={follow}
            className="mt-3 flex w-full items-center gap-2.5 rounded-xl border border-borde px-3.5 py-2.5 text-[12.5px] font-bold transition-colors hover:border-verde"
          >
            <Crosshair size={15} className={follow ? "text-verde" : "text-tinta-suave"} />
            Seguir tren
            <span
              className={cn(
                "ml-auto flex h-5 w-9 items-center rounded-full p-0.5 transition-colors",
                follow ? "bg-verde" : "bg-borde",
              )}
            >
              <motion.span layout className={cn("size-4 rounded-full bg-white shadow", follow && "ml-auto")} />
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Metric({ value, unit, label }: { value: string; unit?: string; label: string }) {
  return (
    <div className="rounded-xl bg-fondo py-2.5">
      <dd className="text-[16px] font-extrabold tracking-tight tabular">
        {value}
        {unit ? <span className="ml-0.5 text-[11px] font-bold text-tinta-suave">{unit}</span> : null}
      </dd>
      <dt className="text-[10.5px] text-tinta-suave">{label}</dt>
    </div>
  );
}

function Btn({
  children, onClick, tone, full,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone: "ida" | "vuelta" | "claro" | "rojo" | "gris";
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
        tone === "rojo" && "bg-red-50 text-rojo hover:bg-rojo hover:text-white",
        tone === "gris" && "border border-borde bg-white text-tinta-suave hover:text-tinta",
      )}
    >
      {children}
    </button>
  );
}
