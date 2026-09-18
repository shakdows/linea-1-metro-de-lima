"use client";

import { motion, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import { Clock, MapPin, Navigation, TrainFront } from "lucide-react";
import { useState } from "react";
import type { Station } from "@/data/stations";
import type { TripStatus } from "@/hooks/useTrip";
import { Card, CardHeader } from "./Card";

const STATUS_TEXT: Record<TripStatus, string> = {
  idle: "Sin viaje iniciado",
  ready: "Ruta lista para iniciar",
  traveling: "Viaje en curso",
  paused: "Viaje en pausa",
  "station-stop": "Detenido en estación",
  completed: "Has llegado",
  "return-ready": "Listo para la vuelta",
  returning: "Regresando",
  finished: "Viaje completado",
};

export function TripProgress({
  status,
  progress,
  currentStation,
  nextStation,
  directionTo,
  remainingMinutes,
  variant,
  children,
}: {
  status: TripStatus;
  progress: MotionValue<number>;
  currentStation: Station;
  nextStation: Station | null;
  directionTo: string;
  remainingMinutes: number;
  variant: "ida" | "vuelta";
  children?: React.ReactNode;
}) {
  const [percent, setPercent] = useState(0);
  useMotionValueEvent(progress, "change", (v) => setPercent(Math.round(v * 100)));
  const width = useTransform(progress, (v) => `${Math.max(0, Math.min(1, v)) * 100}%`);

  const accent = variant === "ida" ? "bg-verde" : "bg-azul";

  return (
    <Card className="p-5">
      <CardHeader
        icon={<TrainFront size={18} />}
        title="Tu viaje"
        subtitle={STATUS_TEXT[status]}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-fondo p-3.5">
          <p className="text-[11.5px] font-semibold text-tinta-suave">Estación actual</p>
          <p className="mt-0.5 flex items-center gap-2 text-[15px] font-extrabold tracking-tight">
            <span
              className={`size-2.5 rounded-full ${accent} ${
                status === "traveling" || status === "returning" || status === "station-stop"
                  ? variant === "ida"
                    ? "halo"
                    : "halo-azul"
                  : ""
              }`}
            />
            {currentStation.name}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-tinta-suave">
            <MapPin size={12} /> {currentStation.avenue}
          </p>
        </div>

        <div className="rounded-xl bg-fondo p-3.5">
          <p className="text-[11.5px] font-semibold text-tinta-suave">Siguiente estación</p>
          <p className="mt-0.5 text-[15px] font-extrabold tracking-tight">
            {nextStation ? nextStation.name : "—"}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-tinta-suave">
            <Navigation size={12} /> Dirección {directionTo}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-baseline justify-between text-[12px]">
          <span className="font-semibold text-tinta-suave">Progreso del viaje</span>
          <span className="text-[15px] font-extrabold tracking-tight">{percent}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-borde">
          <motion.div style={{ width }} className={`h-full rounded-full ${accent}`} />
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[12px] text-tinta-suave">
          <Clock size={13} />
          Tiempo simulado restante: <strong className="text-tinta">{remainingMinutes} min</strong>
        </p>
      </div>

      {children ? <div className="mt-4">{children}</div> : null}
    </Card>
  );
}
