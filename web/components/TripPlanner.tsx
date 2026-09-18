"use client";

import { ArrowLeftRight, ArrowRight, Clock, Flag, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { STATIONS } from "@/data/stations";
import type { TripMode } from "@/lib/trip";
import { cn } from "@/lib/cn";
import { Card } from "./Card";

export function TripPlanner({
  origin,
  destination,
  mode,
  departure,
  searching,
  onOrigin,
  onDestination,
  onMode,
  onSwap,
  onSearch,
}: {
  origin: string;
  destination: string;
  mode: TripMode;
  departure: string;
  searching: boolean;
  onOrigin: (id: string) => void;
  onDestination: (id: string) => void;
  onMode: (m: TripMode) => void;
  onSwap: () => void;
  onSearch: () => void;
}) {
  return (
    <Card className="p-5 md:p-6">
      {/* Pestañas de modo */}
      <div className="mb-5 flex items-center gap-3">
        <h2 className="mr-auto text-[15px] font-bold tracking-tight">Planifica tu viaje</h2>
        <div className="flex rounded-xl bg-fondo p-1" role="tablist" aria-label="Tipo de viaje">
          {(
            [
              ["ida", "Solo ida"],
              ["ida-vuelta", "Ida y vuelta"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={mode === value}
              onClick={() => onMode(value)}
              className={cn(
                "relative rounded-lg px-3.5 py-2 text-[12.5px] font-bold transition-colors",
                mode === value ? "text-white" : "text-tinta-suave hover:text-tinta",
              )}
            >
              {mode === value ? (
                <motion.span
                  layoutId="tab-modo"
                  className="absolute inset-0 rounded-lg bg-verde"
                  transition={{ type: "spring", stiffness: 430, damping: 34 }}
                />
              ) : null}
              <span className="relative z-10">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_auto] lg:items-center">
        <Field icon={<MapPin size={15} />} label="¿Desde dónde viajas?" htmlFor="origen">
          <select
            id="origen"
            value={origin}
            onChange={(e) => onOrigin(e.target.value)}
            className="w-full cursor-pointer appearance-none bg-transparent pr-5 text-[15px] font-bold tracking-tight outline-none"
          >
            {STATIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>

        <button
          type="button"
          onClick={onSwap}
          aria-label="Intercambiar origen y destino"
          title="Intercambiar origen y destino"
          className="mx-auto grid size-11 shrink-0 place-items-center rounded-full border border-borde bg-white text-tinta transition-transform duration-300 hover:rotate-180 hover:border-verde hover:text-verde"
        >
          <ArrowLeftRight size={17} />
        </button>

        <Field icon={<Flag size={15} />} label="¿A dónde vas?" htmlFor="destino">
          <select
            id="destino"
            value={destination}
            onChange={(e) => onDestination(e.target.value)}
            className="w-full cursor-pointer appearance-none bg-transparent pr-5 text-[15px] font-bold tracking-tight outline-none"
          >
            {STATIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="flex items-center gap-3 rounded-xl border border-transparent bg-fondo px-4 py-3">
          <Clock size={16} className="shrink-0 text-tinta-suave" />
          <span className="leading-tight">
            <span className="block text-[12px] text-tinta-suave">Saliendo ahora</span>
            <span className="block text-[13.5px] font-bold">{departure}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={onSearch}
          disabled={searching}
          className="flex h-[52px] items-center justify-center gap-2 rounded-xl bg-verde px-6 text-[14px] font-bold text-white shadow-[0_6px_18px_rgba(0,155,58,.28)] transition-all hover:bg-verde-oscuro active:scale-[.98] disabled:opacity-70"
        >
          {searching ? "Calculando…" : "Calcular ruta"}
          {!searching && <ArrowRight size={16} strokeWidth={2.6} />}
        </button>
      </div>
    </Card>
  );
}

function Field({
  icon,
  label,
  htmlFor,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-transparent bg-fondo px-4 py-2.5 transition focus-within:border-verde focus-within:bg-white focus-within:ring-4 focus-within:ring-verde/10">
      <label
        htmlFor={htmlFor}
        className="mb-0.5 flex items-center gap-1.5 text-[12px] font-medium text-tinta-suave"
      >
        <span className="text-verde">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}
