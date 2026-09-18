"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Flag, MapPin, TrainFront, Users, X } from "lucide-react";
import { DIRECTIONS, SERVICE_STATUS, STATIONS, type Station } from "@/data/stations";
import { CROWD_COLORS, crowdingLevel, nextTrains } from "@/lib/trip";

/**
 * Ficha de estación: panel flotante sobre el mapa, encabezado por la
 * fotografía real de la estación.
 */
export function StationPanel({
  station, now, onClose, onSetOrigin, onSetDestination, onDetails,
}: {
  station: Station | null;
  now: Date;
  onClose: () => void;
  onSetOrigin: (id: string) => void;
  onSetDestination: (id: string) => void;
  onDetails: (s: Station) => void;
}) {
  const crowd = station ? crowdingLevel(now.getHours()) : null;

  return (
    <AnimatePresence>
      {station && crowd ? (
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          role="dialog"
          aria-label={`Estación ${station.name}`}
          className="pointer-events-auto w-[292px] overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_16px_50px_rgba(18,24,22,.2)]"
        >
          <div className="relative h-[136px] bg-tinta">
            {station.image ? (
              <Image src={station.image} alt={`Estación ${station.name}`} fill sizes="300px" className="object-cover" />
            ) : (
              <div className="grid h-full place-items-center bg-gradient-to-br from-verde-oscuro to-verde">
                <TrainFront size={34} className="text-white/40" />
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-white/90 text-tinta shadow-md transition-colors hover:bg-white"
            >
              <X size={15} />
            </button>
          </div>

          <div className="p-4">
            <div className="flex items-start gap-2">
              <span className="mt-1 size-2.5 shrink-0 rounded-full bg-verde" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[16px] font-extrabold tracking-tight">{station.name}</p>
              </div>
              <span className="shrink-0 rounded-full bg-verde-claro px-2.5 py-1 text-[10.5px] font-bold text-verde-oscuro">
                {SERVICE_STATUS.title}
              </span>
            </div>

            <p className="mt-1.5 flex items-start gap-1.5 text-[12px] leading-snug text-tinta-suave">
              <MapPin size={13} className="mt-px shrink-0" />
              <span>
                {station.avenue}
                <br />
                {station.district}
              </span>
            </p>

            <p className="mt-4 mb-2 text-[12.5px] font-bold">Próximos trenes</p>
            <div className="grid grid-cols-2 gap-2">
              {(["norte", "sur"] as const)
                .filter((d) => (d === "norte" ? station.index < STATIONS.length - 1 : station.index > 0))
                .map((d) => (
                  <div key={d} className="rounded-xl bg-fondo p-2.5">
                    <p className="mb-1.5 truncate text-[10.5px] font-semibold text-tinta-suave">
                      Hacia {DIRECTIONS[d].to}
                    </p>
                    {nextTrains(station.index, d, 3, now).map((t, i) => (
                      <p key={i} className="flex items-center gap-1.5 py-0.5 text-[12px] font-semibold tabular">
                        <TrainFront size={11} className="shrink-0 text-tinta-suave" />
                        {t.minutes} min
                      </p>
                    ))}
                  </div>
                ))}
            </div>

            <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-fondo px-3 py-2.5">
              <Users size={16} style={{ color: CROWD_COLORS[crowd.key] }} />
              <span className="text-[11px] text-tinta-suave">
                Afluencia estimada
                <b className="block text-[13.5px] font-extrabold text-tinta">{crowd.label}</b>
              </span>
            </div>

            <div className="mt-3 space-y-2">
              <button
                type="button"
                onClick={() => onSetOrigin(station.id)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-borde bg-white py-2.5 text-[12.5px] font-bold transition-colors hover:border-verde hover:text-verde"
              >
                <MapPin size={14} className="text-verde" /> Seleccionar como origen
              </button>
              <button
                type="button"
                onClick={() => onSetDestination(station.id)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-borde bg-white py-2.5 text-[12.5px] font-bold transition-colors hover:border-verde hover:text-verde"
              >
                <Flag size={14} className="text-verde" /> Seleccionar como destino
              </button>
              <button
                type="button"
                onClick={() => onDetails(station)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-verde-claro py-2.5 text-[12.5px] font-bold text-verde-oscuro transition-colors hover:bg-verde hover:text-white"
              >
                Ver más detalles <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
