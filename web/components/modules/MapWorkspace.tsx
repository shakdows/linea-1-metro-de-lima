"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, Locate, Maximize2, Pause, Play, RotateCcw, Square, TrainFront, Undo2 } from "lucide-react";
import { useMotionValueEvent, useTransform } from "framer-motion";
import { useState } from "react";
import type { Station } from "@/data/stations";
import { DIRECTIONS } from "@/data/stations";
import type { useTrip } from "@/hooks/useTrip";
import type { useGeolocation } from "@/hooks/useGeolocation";
import type { MapHandle } from "@/components/MetroMap";
import { Button, Pill } from "@/components/ui";
import { cn } from "@/lib/cn";

const MetroMap = dynamic(() => import("@/components/MetroMap"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-[#eceff0]">
      <span className="flex items-center gap-2 rounded-lg border border-borde bg-superficie px-3 py-2 text-[12px] text-tinta-suave">
        <TrainFront size={14} className="animate-pulse text-verde" /> Cargando mapa
      </span>
    </div>
  ),
});

export type Trip = ReturnType<typeof useTrip>;
export type Geo = ReturnType<typeof useGeolocation>;

/** El mapa es el área de trabajo, no una tarjeta dentro de una página */
export function MapWorkspace({
  trip, geo, traveling, follow, onToggleFollow, arrival,
  fitSignal, drawSignal, onSelectStation, mapHandle, compact,
}: {
  trip: Trip;
  geo: Geo;
  traveling: boolean;
  follow: boolean;
  onToggleFollow: () => void;
  arrival: Station | null;
  fitSignal: number;
  drawSignal: number;
  onSelectStation: (s: Station) => void;
  mapHandle: React.MutableRefObject<MapHandle | null>;
  compact?: boolean;
}) {
  const variant: "ida" | "vuelta" = trip.activeLeg === "outbound" ? "ida" : "vuelta";

  return (
    <div className="relative h-full w-full overflow-hidden">
      <MetroMap
        routeStations={trip.leg?.stations ?? []}
        outboundStations={trip.trip?.outbound.stations ?? []}
        inboundStations={trip.trip?.inbound?.stations ?? null}
        position={trip.train.position}
        visitedCount={trip.train.currentStop}
        trainVisible={traveling}
        trainVariant={variant}
        originId={trip.originId}
        destinationId={trip.destinationId}
        userLocation={geo.result}
        nearestId={geo.result?.nearest.station.id}
        fitSignal={fitSignal}
        drawSignal={drawSignal}
        followTrain={follow && traveling}
        onSelectStation={onSelectStation}
        onTrainClick={() => onSelectStation(trip.currentStation)}
        onReady={(h) => { mapHandle.current = h; }}
      />

      {/* Controles compactos */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-500 flex items-start justify-between gap-2 p-3">
        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5">
          <MapBtn onClick={geo.locate} disabled={geo.status === "locating"} label="Mi ubicación">
            <Locate size={14} />
          </MapBtn>
          <MapBtn onClick={() => mapHandle.current?.fitAll()} label="Ver toda la línea">
            <Maximize2 size={14} />
          </MapBtn>

          <div className="flotante ml-1 flex rounded-lg p-0.5">
            {([["ida", "Solo ida"], ["ida-vuelta", "Ida y vuelta"]] as const).map(([v, label]) => (
              <button
                key={v}
                type="button"
                onClick={() => trip.setMode(v)}
                className={cn(
                  "rounded-[6px] px-2.5 py-1.5 text-[11.5px] font-medium transition-colors",
                  trip.mode === v ? "bg-verde text-white" : "text-tinta-suave hover:text-tinta",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {traveling ? (
            <button
              type="button"
              onClick={onToggleFollow}
              aria-pressed={follow}
              className={cn(
                "flotante inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-medium transition-colors",
                follow ? "text-verde" : "text-tinta-suave hover:text-tinta",
              )}
            >
              <Crosshair size={13} /> Seguir tren
              <span className={cn("ml-0.5 flex h-3.5 w-6 items-center rounded-full p-0.5 transition-colors", follow ? "bg-verde" : "bg-borde")}>
                <motion.span layout className={cn("size-2.5 rounded-full bg-white", follow && "ml-auto")} />
              </span>
            </button>
          ) : null}
        </div>

        <AnimatePresence>
          {arrival ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flotante-oscuro pointer-events-none rounded-lg px-3 py-2"
            >
              <p className="text-[10px] tracking-[.1em] text-white/50 uppercase">Llegando a</p>
              <p className="truncate text-[13px] font-semibold">{arrival.name}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* HUD del viaje */}
      <AnimatePresence>
        {traveling && trip.leg ? <TripHUD trip={trip} variant={variant} compact={compact} /> : null}
      </AnimatePresence>
    </div>
  );
}

function MapBtn({
  children, onClick, disabled, label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="flotante inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[11.5px] font-medium text-tinta transition-colors hover:bg-fondo disabled:opacity-50"
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

/** Panel inferior durante el viaje */
function TripHUD({ trip, variant, compact }: { trip: Trip; variant: "ida" | "vuelta"; compact?: boolean }) {
  const [percent, setPercent] = useState(0);
  useMotionValueEvent(trip.train.progress, "change", (v) => setPercent(Math.round(v * 100)));
  const width = useTransform(trip.train.progress, (v) => `${Math.max(0, Math.min(1, v)) * 100}%`);

  const leg = trip.leg!;
  const remaining = Math.max(
    0,
    Math.round(leg.minutes * (1 - trip.train.currentStop / Math.max(1, leg.stops - 1))),
  );
  const moving = trip.status === "traveling" || trip.status === "returning" || trip.status === "station-stop";
  const accent = variant === "ida" ? "bg-verde" : "bg-azul";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
      transition={{ type: "spring", stiffness: 340, damping: 34 }}
      className={cn(
        "flotante absolute right-3 bottom-3 left-3 z-500 rounded-lg px-4 py-3",
        compact ? "" : "lg:right-auto lg:left-3 lg:w-[520px]",
      )}
    >
      <div className="flex items-center gap-3">
        <span className={cn("grid size-7 shrink-0 place-items-center rounded-lg text-white", accent)}>
          <TrainFront size={14} />
        </span>
        <p className="min-w-0 flex-1 truncate text-[13px] font-semibold tracking-tight">
          {leg.from.name} <span className="text-tinta-suave">→</span> {leg.to.name}
        </p>
        <Pill tono={variant === "ida" ? "verde" : "azul"} punto>
          {trip.status === "paused" ? "En pausa" : trip.status === "finished" ? "Completado"
            : trip.status === "return-ready" ? "Has llegado" : "En curso"}
        </Pill>
      </div>

      <div className="mt-3 h-1 overflow-hidden rounded-full bg-borde">
        <motion.div style={{ width }} className={cn("h-full rounded-full", accent)} />
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-3">
        <Dato label="Progreso" value={`${percent}%`} />
        <Dato label="Estación actual" value={trip.currentStation.name} strong />
        <Dato label="Próxima" value={trip.nextStation?.name ?? "—"} />
        <Dato label="Restante" value={`${remaining} min`} />
        <Dato label="Dirección" value={DIRECTIONS[leg.direction].to} />

        <div className="ml-auto flex gap-1.5">
          {moving ? (
            <Button size="sm" onClick={trip.pause}><Pause size={13} /> Pausar</Button>
          ) : null}
          {trip.status === "paused" ? (
            <Button size="sm" variant="primario" onClick={trip.resume}><Play size={12} fill="currentColor" /> Continuar</Button>
          ) : null}
          {trip.status === "return-ready" && trip.trip?.inbound ? (
            <Button size="sm" variant="azul" onClick={trip.startReturn}><Undo2 size={13} /> Iniciar vuelta</Button>
          ) : null}
          {trip.status === "finished" || trip.status === "return-ready" ? (
            <Button size="sm" onClick={trip.restart}><RotateCcw size={12} /> Reiniciar</Button>
          ) : null}
          <Button size="sm" variant="peligro" onClick={trip.finish}><Square size={11} fill="currentColor" /> Finalizar</Button>
        </div>
      </div>
    </motion.div>
  );
}

function Dato({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[10.5px] text-tinta-suave">{label}</p>
      <p className={cn("truncate text-[13px] tabular", strong ? "font-semibold" : "font-medium")}>{value}</p>
    </div>
  );
}
