"use client";

import { ArrowLeftRight, ArrowRight, Clock, Flag, MapPin } from "lucide-react";
import { STATIONS, type Station } from "@/data/stations";
import { hhmm12, type TripMode } from "@/lib/trip";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";

/** Planificador compacto. Se reutiliza en Inicio y en Planificar viaje. */
export function TripPlanner({
  origin, destination, mode, now, calculating,
  onOrigin, onDestination, onMode, onSwap, onCalculate, dense,
}: {
  origin: Station;
  destination: Station;
  mode: TripMode;
  now: Date;
  calculating: boolean;
  onOrigin: (id: string) => void;
  onDestination: (id: string) => void;
  onMode: (m: TripMode) => void;
  onSwap: () => void;
  onCalculate: () => void;
  dense?: boolean;
}) {
  return (
    <div className={cn("grid gap-2.5", dense ? "" : "sm:grid-cols-[minmax(140px,1fr)_auto_minmax(140px,1fr)_auto] sm:items-end")}>
      <Campo icon={<MapPin size={13} />} label="Origen" id="origen" value={origin.id} onChange={onOrigin} />

      <button
        type="button"
        onClick={onSwap}
        aria-label="Intercambiar origen y destino"
        className={cn(
          "flex h-9 items-center justify-center gap-2 rounded-lg border border-borde bg-superficie text-[11.5px] font-medium text-tinta-suave transition-all hover:border-verde hover:text-verde sm:h-10 sm:w-10 sm:gap-0",
          dense ? "justify-self-end px-3" : "",
        )}
      >
        <ArrowLeftRight size={15} />
        <span className="sm:hidden">Intercambiar</span>
      </button>

      <Campo icon={<Flag size={13} />} label="Destino" id="destino" value={destination.id} onChange={onDestination} />

      <div>
        <p className="mb-1 text-[11px] text-tinta-suave">Salida</p>
        <div className="flex h-10 items-center gap-2 rounded-lg border border-borde px-3 text-[12.5px] whitespace-nowrap">
          <Clock size={13} className="text-tinta-suave" />
          Hoy, {hhmm12(now)}
        </div>
      </div>

      <div className={cn(dense ? "grid gap-2.5" : "flex items-end gap-2.5 sm:col-span-4 sm:justify-end")}>
        <div className={cn("flex rounded-lg border border-borde p-0.5", dense ? "" : "h-10")}>
          {([["ida", "Solo ida"], ["ida-vuelta", "Ida y vuelta"]] as const).map(([v, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => onMode(v)}
              aria-pressed={mode === v}
              className={cn(
                "flex-1 rounded-[7px] px-3 text-[11.5px] font-medium whitespace-nowrap transition-colors",
                dense ? "py-2" : "",
                mode === v ? "bg-verde text-white" : "text-tinta-suave hover:text-tinta",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <Button variant="primario" onClick={onCalculate} disabled={calculating} className={dense ? "w-full" : ""}>
          {calculating ? "Calculando" : "Calcular ruta"}
          {!calculating && <ArrowRight size={15} />}
        </Button>
      </div>
    </div>
  );
}

function Campo({
  icon, label, id, value, onChange,
}: {
  icon: React.ReactNode;
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1 flex items-center gap-1.5 text-[11px] text-tinta-suave">
        <span className="text-verde">{icon}</span>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-borde bg-superficie px-3 pr-8 text-[13px] font-medium outline-none transition focus:border-verde focus:ring-2 focus:ring-verde/15"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23667085' stroke-width='3' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
        }}
      >
        {STATIONS.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
    </div>
  );
}
