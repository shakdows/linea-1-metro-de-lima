"use client";

import { motion } from "framer-motion";
import {
  ArrowLeftRight, ArrowRight, Briefcase, Clock, Flag, GraduationCap, House, MapPin, Star,
} from "lucide-react";
import { STATIONS, type Station } from "@/data/stations";
import { hhmm12, type TripMode } from "@/lib/trip";
import { cn } from "@/lib/cn";

export interface FrequentRoute {
  originId: string;
  destinationId: string;
  label: string;
  minutes: number;
}

const ICONS = [House, Briefcase, GraduationCap, Star];

/** Planificador: lo único que se ve al abrir la aplicación */
export function Planner({
  greeting, origin, destination, mode, now, calculating, frequents,
  onOrigin, onDestination, onMode, onSwap, onCalculate, onPickFrequent,
}: {
  greeting: string;
  origin: Station;
  destination: Station;
  mode: TripMode;
  now: Date;
  calculating: boolean;
  frequents: FrequentRoute[];
  onOrigin: (id: string) => void;
  onDestination: (id: string) => void;
  onMode: (m: TripMode) => void;
  onSwap: () => void;
  onCalculate: () => void;
  onPickFrequent: (r: FrequentRoute) => void;
}) {
  return (
    <div className="space-y-4 p-4">
      <div className="rounded-2xl border border-borde bg-white p-4 shadow-suave">
        <h1 className="text-[17px] font-extrabold tracking-tight">
          Hola, ¿a dónde quieres ir?
        </h1>

        <div className="mt-3 flex rounded-xl bg-fondo p-1" role="tablist" aria-label="Tipo de viaje">
          {([["ida", "Solo ida"], ["ida-vuelta", "Ida y vuelta"]] as const).map(([v, label]) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={mode === v}
              onClick={() => onMode(v)}
              className={cn(
                "relative flex-1 rounded-lg py-2 text-[12.5px] font-bold transition-colors",
                mode === v ? "text-white" : "text-tinta-suave hover:text-tinta",
              )}
            >
              {mode === v ? (
                <motion.span
                  layoutId="planner-modo"
                  className="absolute inset-0 rounded-lg bg-verde"
                  transition={{ type: "spring", stiffness: 430, damping: 34 }}
                />
              ) : null}
              <span className="relative z-10">{label}</span>
            </button>
          ))}
        </div>

        <div className="relative mt-4 space-y-2.5">
          <Field icon={<MapPin size={14} />} label="Origen" id="origen" value={origin.id} onChange={onOrigin} />
          <Field icon={<Flag size={14} />} label="Destino" id="destino" value={destination.id} onChange={onDestination} />
          <button
            type="button"
            onClick={onSwap}
            aria-label="Intercambiar origen y destino"
            className="absolute top-[42px] -right-1 grid size-9 place-items-center rounded-xl border border-borde bg-white text-tinta shadow-suave transition-transform duration-300 hover:rotate-180 hover:border-verde hover:text-verde"
          >
            <ArrowLeftRight size={15} />
          </button>
        </div>

        <div className="mt-2.5 flex items-center gap-2.5 rounded-xl border border-borde px-3.5 py-2.5">
          <Clock size={16} className="shrink-0 text-tinta-suave" />
          <span className="leading-tight">
            <span className="block text-[11px] text-tinta-suave">Saliendo ahora</span>
            <span className="block text-[13px] font-bold">Hoy, {hhmm12(now)}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={onCalculate}
          disabled={calculating}
          className="mt-3 flex h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-verde text-[14px] font-bold text-white shadow-[0_6px_20px_rgba(0,155,58,.3)] transition-all hover:bg-verde-oscuro active:scale-[.98] disabled:opacity-70"
        >
          {calculating ? "Calculando…" : "Calcular ruta"}
          {!calculating && <ArrowRight size={16} strokeWidth={2.6} />}
        </button>
      </div>

      {frequents.length ? (
        <div className="rounded-2xl border border-borde bg-white p-4 shadow-suave">
          <p className="mb-3 text-[13px] font-extrabold tracking-tight">Rutas frecuentes</p>
          <div className="space-y-1.5">
            {frequents.map((r, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <button
                  key={`${r.originId}-${r.destinationId}`}
                  type="button"
                  onClick={() => onPickFrequent(r)}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-fondo"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-verde-claro text-verde">
                    <Icon size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-bold">{r.label}</span>
                  </span>
                  <span className="shrink-0 text-[12px] font-bold text-tinta-suave tabular">
                    {r.minutes} min
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="px-1 text-[12px] leading-relaxed text-tinta-suave">
          Toca cualquier estación del mapa para elegirla como origen o destino.
        </p>
      )}
    </div>
  );
}

function Field({
  icon, label, id, value, onChange,
}: {
  icon: React.ReactNode;
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-xl border border-borde px-3.5 py-2 transition focus-within:border-verde focus-within:ring-4 focus-within:ring-verde/10">
      <label htmlFor={id} className="mb-0.5 flex items-center gap-1.5 text-[11px] font-semibold text-tinta-suave">
        <span className="text-verde">{icon}</span>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer appearance-none bg-transparent pr-9 text-[14.5px] font-bold tracking-tight outline-none"
      >
        {STATIONS.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
    </div>
  );
}
