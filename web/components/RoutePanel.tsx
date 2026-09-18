"use client";

import { motion } from "framer-motion";
import { Check, Clock, MapPin, Navigation, Route } from "lucide-react";
import type { Leg } from "@/lib/trip";
import { cn } from "@/lib/cn";
import { Card, CardHeader, DataTag } from "./Card";

/** Detalle del tramo: paradas, tiempo y lista de estaciones con su estado */
export function RoutePanel({
  leg,
  variant,
  visitedCount,
  travelling,
  walkMinutes,
}: {
  leg: Leg;
  variant: "ida" | "vuelta";
  visitedCount: number;
  travelling: boolean;
  walkMinutes: number;
}) {
  const accent = variant === "ida" ? "verde" : "azul";

  return (
    <Card
      className={cn(
        "overflow-hidden p-5",
        variant === "ida" ? "border-verde/25 bg-verde-claro/35" : "border-azul/25 bg-azul-claro/40",
      )}
    >
      <CardHeader
        icon={<Route size={18} />}
        title={variant === "ida" ? "Ruta de ida" : "Ruta de vuelta"}
        subtitle={`${leg.from.name} → ${leg.to.name}`}
        action={<DataTag kind="estimado" />}
      />

      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <Metric value={`${leg.stops}`} label="paradas" />
        <Metric value={`${leg.minutes} min`} label="a bordo" />
        <Metric value={`${walkMinutes} min`} label="caminando" />
      </div>

      <p className="mb-3 flex items-center gap-1.5 text-[12px] font-semibold text-tinta-suave">
        <Navigation size={13} /> Dirección {leg.direction === "norte" ? "Bayóvar" : "Villa El Salvador"}
      </p>

      <ol className="relative max-h-[230px] space-y-0.5 overflow-y-auto pr-1 scroll-fino">
        {leg.stations.map((station, i) => {
          const visited = travelling && i < visitedCount;
          const current = travelling && i === visitedCount;
          return (
            <motion.li
              key={station.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.22, delay: Math.min(i * 0.03, 0.4), ease: "easeOut" }}
              className="flex items-center gap-3 rounded-lg px-1 py-1.5"
            >
              <span
                className={cn(
                  "grid size-[18px] shrink-0 place-items-center rounded-full border-[3px] bg-white transition-colors",
                  visited
                    ? `border-${accent} bg-${accent}`
                    : current
                      ? `border-${accent} bg-${accent} ${variant === "ida" ? "halo" : "halo-azul"}`
                      : "border-inactivo",
                )}
                style={
                  visited || current
                    ? { backgroundColor: variant === "ida" ? "#009B3A" : "#1687F8", borderColor: variant === "ida" ? "#009B3A" : "#1687F8" }
                    : undefined
                }
              >
                {visited ? <Check size={10} strokeWidth={4} className="text-white" /> : null}
              </span>

              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block truncate text-[13px]",
                    current ? "font-extrabold" : visited ? "font-semibold" : "font-medium",
                  )}
                >
                  {station.name}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-tinta-suave">
                  <MapPin size={10} /> {station.avenue}
                </span>
              </span>

              {i === 0 || i === leg.stations.length - 1 ? (
                <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-tinta-suave">
                  {i === 0 ? "Subes" : "Bajas"}
                </span>
              ) : null}
            </motion.li>
          );
        })}
      </ol>
    </Card>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-white/80 py-2.5">
      <span className="block text-[15px] font-extrabold tracking-tight">{value}</span>
      <span className="text-[11px] text-tinta-suave">{label}</span>
    </div>
  );
}

export { Clock };
