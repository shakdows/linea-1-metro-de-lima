"use client";

import { motion } from "framer-motion";
import {
  ArrowLeftRight, ArrowRight, Clock, Flag, MapPin, Play, Star, TrainFront, Users,
} from "lucide-react";
import { STATIONS, type Station } from "@/data/stations";
import { CROWD_COLORS, crowdingLevel, hhmm12, type Leg, type TripMode } from "@/lib/trip";
import { cn } from "@/lib/cn";

export interface FrequentRoute {
  originId: string;
  destinationId: string;
  label: string;
  minutes: number;
}

/**
 * Panel derecho: es lo que el usuario usa para preparar el viaje y se queda
 * visible mientras explora el mapa.
 */
export function CommandCenter({
  greeting, origin, destination, mode, leg, calculating, now, traveling,
  frequents, onOrigin, onDestination, onMode, onSwap, onCalculate, onStart, onPickFrequent,
}: {
  greeting: string;
  origin: Station;
  destination: Station;
  mode: TripMode;
  leg: Leg | null | undefined;
  calculating: boolean;
  now: Date;
  traveling: boolean;
  frequents: FrequentRoute[];
  onOrigin: (id: string) => void;
  onDestination: (id: string) => void;
  onMode: (m: TripMode) => void;
  onSwap: () => void;
  onCalculate: () => void;
  onStart: () => void;
  onPickFrequent: (r: FrequentRoute) => void;
}) {
  const crowd = crowdingLevel(now.getHours());
  const arrival = leg ? hhmm12(new Date(now.getTime() + leg.minutes * 60000)) : "—";

  return (
    <div className="flex flex-col gap-3 p-4 lg:h-full lg:overflow-y-auto scroll-fino">
      <div>
        <p className="text-[12.5px] font-medium text-tinta-suave">{greeting} 👋</p>
        <h1 className="text-[22px] leading-tight font-extrabold tracking-tight">
          ¿A dónde quieres ir?
        </h1>
      </div>

      {/* Selector de modo */}
      <div className="flex rounded-xl bg-fondo p-1" role="tablist" aria-label="Tipo de viaje">
        {([["ida", "Solo ida"], ["ida-vuelta", "Ida y vuelta"]] as const).map(([v, label]) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={mode === v}
            onClick={() => onMode(v)}
            className={cn(
              "relative flex-1 rounded-lg py-2 text-[12px] font-bold transition-colors",
              mode === v ? "text-white" : "text-tinta-suave hover:text-tinta",
            )}
          >
            {mode === v ? (
              <motion.span
                layoutId="cc-modo"
                className="absolute inset-0 rounded-lg bg-verde"
                transition={{ type: "spring", stiffness: 430, damping: 34 }}
              />
            ) : null}
            <span className="relative z-10">{label}</span>
          </button>
        ))}
      </div>

      {/* Origen y destino */}
      <div className="relative rounded-2xl border border-borde bg-white p-1.5">
        <Field icon={<MapPin size={14} />} label="Origen" id="origen" value={origin.id} onChange={onOrigin} />
        <div className="mx-4 h-px bg-borde" />
        <Field icon={<Flag size={14} />} label="Destino" id="destino" value={destination.id} onChange={onDestination} />
        <button
          type="button"
          onClick={onSwap}
          aria-label="Intercambiar origen y destino"
          className="absolute top-1/2 right-3 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-borde bg-white text-tinta shadow-suave transition-transform duration-300 hover:rotate-180 hover:border-verde hover:text-verde"
        >
          <ArrowLeftRight size={15} />
        </button>
      </div>

      <button
        type="button"
        onClick={onCalculate}
        disabled={calculating}
        className="flex h-[50px] items-center justify-center gap-2 rounded-xl bg-verde text-[14px] font-bold text-white shadow-[0_6px_20px_rgba(0,155,58,.3)] transition-all hover:bg-verde-oscuro active:scale-[.98] disabled:opacity-70"
      >
        {calculating ? "Calculando…" : "Calcular ruta"}
        {!calculating && <ArrowRight size={16} strokeWidth={2.6} />}
      </button>

      {/* Resumen del viaje */}
      {leg ? (
        <motion.div
          key={`${leg.from.id}-${leg.to.id}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.2, 0.8, 0.3, 1] }}
          className="rounded-2xl border border-borde bg-white p-4"
        >
          <p className="text-[11px] font-bold tracking-[.1em] text-tinta-suave uppercase">Tu viaje</p>
          <p className="mt-1 text-[14px] font-extrabold tracking-tight">
            {leg.from.name} <span className="text-tinta-suave">→</span> {leg.to.name}
          </p>

          <p className="mt-3 text-[38px] leading-none font-extrabold tracking-[-.04em] tabular">
            {leg.minutes}
            <span className="ml-1 text-[15px] font-bold text-tinta-suave">min</span>
          </p>

          <dl className="mt-3 space-y-2 text-[12.5px]">
            <Row icon={<TrainFront size={14} />} label="Paradas" value={`${leg.stops}`} />
            <Row
              icon={<Users size={14} />}
              label="Afluencia"
              value={crowd.label}
              dot={CROWD_COLORS[crowd.key]}
            />
            <Row icon={<Clock size={14} />} label="Llegada" value={arrival} />
          </dl>

          {traveling ? (
            <p className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-verde-claro py-3 text-[12.5px] font-bold text-verde-oscuro">
              <span className="size-2 rounded-full bg-verde halo" /> Viaje en curso
            </p>
          ) : (
            <button
              type="button"
              onClick={onStart}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-tinta py-3 text-[13px] font-bold text-white transition-transform hover:scale-[1.015] active:scale-[.98]"
            >
              <Play size={14} fill="currentColor" /> Iniciar viaje
            </button>
          )}
        </motion.div>
      ) : null}

      {/* Rutas frecuentes */}
      {frequents.length ? (
        <div>
          <p className="mt-1 mb-2 text-[11px] font-bold tracking-[.1em] text-tinta-suave uppercase">
            Rutas frecuentes
          </p>
          <div className="space-y-1.5">
            {frequents.map((r) => (
              <button
                key={`${r.originId}-${r.destinationId}`}
                type="button"
                onClick={() => onPickFrequent(r)}
                className="flex w-full items-center gap-2.5 rounded-xl border border-borde bg-white px-3.5 py-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-verde hover:shadow-suave"
              >
                <Star size={14} className="shrink-0 text-amarillo" fill="currentColor" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-bold">{r.label}</span>
                  <span className="block text-[11px] text-tinta-suave">{r.minutes} min</span>
                </span>
                <ArrowRight size={14} className="shrink-0 text-tinta-suave" />
              </button>
            ))}
          </div>
        </div>
      ) : null}
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
    <div className="rounded-xl px-3.5 py-2.5 transition-colors focus-within:bg-fondo">
      <label htmlFor={id} className="mb-0.5 flex items-center gap-1.5 text-[11px] font-semibold text-tinta-suave">
        <span className="text-verde">{icon}</span>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer appearance-none bg-transparent pr-10 text-[15px] font-bold tracking-tight outline-none"
      >
        {STATIONS.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
    </div>
  );
}

function Row({
  icon, label, value, dot,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  dot?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-tinta-suave">{icon}</span>
      <dt className="text-tinta-suave">{label}</dt>
      <dd className="ml-auto flex items-center gap-1.5 font-bold">
        {dot ? <i className="size-2 rounded-full" style={{ background: dot }} /> : null}
        {value}
      </dd>
    </div>
  );
}
