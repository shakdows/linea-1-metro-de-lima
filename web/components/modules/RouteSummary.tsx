"use client";

import { motion } from "framer-motion";
import { Check, Play } from "lucide-react";
import type { Leg } from "@/lib/trip";
import { DIRECTIONS } from "@/data/stations";
import { addMinutes, crowdingLevel, hhmm12 } from "@/lib/trip";
import { Button, Pill, Stat } from "@/components/ui";
import { cn } from "@/lib/cn";

/** Resumen del tramo calculado, con la secuencia de paradas */
export function RouteSummary({
  leg, now, variant, visitedCount, traveling, onStart, compact,
}: {
  leg: Leg;
  now: Date;
  variant: "ida" | "vuelta";
  visitedCount: number;
  traveling: boolean;
  onStart?: () => void;
  compact?: boolean;
}) {
  const crowd = crowdingLevel(now.getHours());
  const arrival = hhmm12(addMinutes(now, leg.minutes));
  const accent = variant === "ida" ? "verde" : "azul";

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[14px] font-semibold tracking-tight">
          {leg.from.name} <span className="text-tinta-suave">→</span> {leg.to.name}
        </p>
        <Pill tono={accent}>{variant === "ida" ? "Ida" : "Vuelta"}</Pill>
        <Pill>Dirección {DIRECTIONS[leg.direction].to}</Pill>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Duración" value={leg.minutes} unit="min" />
        <Stat label="Estaciones" value={leg.stops} />
        <Stat label="Llegada" value={arrival} />
        <Stat label="Afluencia" value={crowd.label} />
      </div>

      {!compact ? (
        <ol className="mt-5 space-y-0">
          {leg.stations.map((s, i) => {
            const done = traveling && i < visitedCount;
            const current = traveling && i === visitedCount;
            const last = i === leg.stations.length - 1;
            return (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.025, 0.3) }}
                className="relative flex gap-3 pb-3 last:pb-0"
              >
                {!last ? (
                  <span
                    className={cn(
                      "absolute top-4 left-[7px] h-full w-0.5",
                      done ? "bg-verde-oscuro" : current ? "bg-verde" : "bg-borde",
                    )}
                  />
                ) : null}
                <span
                  className={cn(
                    "relative z-10 mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border-2 bg-superficie",
                    done ? "border-verde-oscuro bg-verde-oscuro"
                      : current ? cn("border-verde bg-verde", variant === "ida" ? "halo" : "halo-azul")
                        : "border-borde",
                  )}
                >
                  {done ? <Check size={9} strokeWidth={4} className="text-white" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate text-[12.5px]", current ? "font-semibold" : done ? "text-tinta-suave" : "")}>
                    {s.name}
                  </span>
                  <span className="block truncate text-[11px] text-tinta-suave">{s.avenue}</span>
                </span>
                {i === 0 || last ? (
                  <span className="shrink-0 self-start text-[10.5px] text-tinta-suave">
                    {i === 0 ? "Subes" : "Bajas"}
                  </span>
                ) : null}
              </motion.li>
            );
          })}
        </ol>
      ) : null}

      {onStart && !traveling ? (
        <Button variant="primario" onClick={onStart} className="mt-4 w-full">
          <Play size={13} fill="currentColor" /> Iniciar viaje
        </Button>
      ) : null}
    </div>
  );
}
