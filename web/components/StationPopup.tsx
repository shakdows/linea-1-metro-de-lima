"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, MapPin, TrainFront, Users, X } from "lucide-react";
import { DIRECTIONS, SERVICE_STATUS, STATIONS, type Station } from "@/data/stations";
import { crowdingLevel, nextTrains } from "@/lib/trip";

/** Ficha flotante que se abre al tocar una estación del mapa */
export function StationPopup({
  station,
  point,
  now,
  onClose,
  onSetOrigin,
  onSetDestination,
}: {
  station: Station | null;
  point: { x: number; y: number } | null;
  now: Date;
  onClose: () => void;
  onSetOrigin: (id: string) => void;
  onSetDestination: (id: string) => void;
}) {
  let style: React.CSSProperties = {};
  if (point && typeof window !== "undefined") {
    const W = 268;
    const H = 330;
    const top = point.y + 18 + H > window.innerHeight ? Math.max(12, point.y - H - 18) : point.y + 18;
    const left = Math.min(Math.max(12, point.x - W / 2), window.innerWidth - W - 12);
    style = { top, left, width: W };
  }

  return (
    <AnimatePresence>
      {station && point ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[900]"
          />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            role="dialog"
            aria-label={`Estación ${station.name}`}
            style={style}
            className="fixed z-[950] rounded-2xl border border-borde bg-white p-4 shadow-alta"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-3 right-3 grid size-7 place-items-center rounded-full bg-fondo text-tinta-suave transition-colors hover:bg-borde"
            >
              <X size={14} />
            </button>

            <p className="flex items-center gap-2 pr-8 text-[15px] font-extrabold tracking-tight">
              <TrainFront size={17} className="text-verde" />
              {station.name}
            </p>
            <p className="mt-0.5 text-[12px] text-tinta-suave">{station.district}</p>

            <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-verde-claro px-3 py-1 text-[12px] font-bold text-verde-oscuro">
              <i className="size-1.5 rounded-full bg-verde" />
              {SERVICE_STATUS.title}
            </span>

            <dl className="mt-3 space-y-2 text-[13px]">
              {station.index < STATIONS.length - 1 ? (
                <Row
                  label={`Próximo tren → ${DIRECTIONS.norte.to}`}
                  value={`${nextTrains(station.index, "norte", 1, now)[0].minutes} min`}
                />
              ) : null}
              {station.index > 0 ? (
                <Row
                  label={`Próximo tren → ${DIRECTIONS.sur.to}`}
                  value={`${nextTrains(station.index, "sur", 1, now)[0].minutes} min`}
                />
              ) : null}
              <Row
                label={
                  <span className="inline-flex items-center gap-1.5">
                    <Users size={13} /> Afluencia
                  </span>
                }
                value={crowdingLevel(now.getHours()).label}
              />
              <Row
                label={
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={13} /> Avenida
                  </span>
                }
                value={station.avenue}
              />
            </dl>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSetOrigin(station.id)}
                className="rounded-lg bg-verde-claro px-3 py-2 text-[12px] font-bold text-verde-oscuro transition-colors hover:bg-verde hover:text-white"
              >
                Usar como origen
              </button>
              <button
                type="button"
                onClick={() => onSetDestination(station.id)}
                className="rounded-lg bg-azul-claro px-3 py-2 text-[12px] font-bold text-[#1256a8] transition-colors hover:bg-azul hover:text-white"
              >
                Usar como destino
              </button>
            </div>

            {station.exits?.length ? (
              <p className="mt-3 text-[11.5px] leading-snug text-tinta-suave">
                <span className="font-bold text-tinta">Salidas:</span> {station.exits.join(" · ")}
              </p>
            ) : null}

            <a
              href={`https://www.openstreetmap.org/?mlat=${station.latitude}&mlon=${station.longitude}#map=17/${station.latitude}/${station.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-verde px-3 py-2.5 text-[12.5px] font-bold text-white transition-colors hover:bg-verde-oscuro"
            >
              Ver estación <ArrowRight size={14} />
            </a>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-tinta-suave">{label}</dt>
      <dd className="text-right font-bold">{value}</dd>
    </div>
  );
}
