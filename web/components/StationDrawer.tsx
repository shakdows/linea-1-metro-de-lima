"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Accessibility, ArrowRight, LogIn, MapPin, TrainFront, Users, X } from "lucide-react";
import { DIRECTIONS, SERVICE_STATUS, STATIONS, type Station } from "@/data/stations";
import { crowdingLevel, nextTrains } from "@/lib/trip";
import { CROWD_COLORS } from "@/lib/trip";

/**
 * Ficha de estación. En escritorio entra como cajón lateral derecho;
 * en móvil, como hoja inferior. Encabeza con la fotografía real.
 */
export function StationDrawer({
  station,
  now,
  onClose,
  onSetOrigin,
  onSetDestination,
}: {
  station: Station | null;
  now: Date;
  onClose: () => void;
  onSetOrigin: (id: string) => void;
  onSetDestination: (id: string) => void;
}) {
  const crowd = crowdingLevel(now.getHours());

  return (
    <AnimatePresence>
      {station ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[900] bg-tinta/20 backdrop-blur-[2px]"
          />

          <motion.aside
            initial={{ x: "100%", opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.4 }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            role="dialog"
            aria-label={`Estación ${station.name}`}
            className="fixed inset-y-0 right-0 z-[950] flex w-full max-w-[400px] flex-col overflow-hidden bg-white shadow-[-16px_0_50px_rgba(18,24,22,.18)] sm:rounded-l-3xl"
          >
            {/* Fotografía con acercamiento muy suave */}
            <div className="relative h-[236px] shrink-0 overflow-hidden bg-tinta">
              {station.image ? (
                <motion.div
                  initial={{ scale: 1.14 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.6, ease: [0.2, 0.8, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={station.image}
                    alt={`Estación ${station.name}`}
                    fill
                    sizes="400px"
                    className="object-cover"
                  />
                </motion.div>
              ) : (
                <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-verde-oscuro to-verde">
                  <TrainFront size={46} className="text-white/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-tinta via-tinta/55 to-tinta/10" />

              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="absolute top-4 right-4 grid size-9 place-items-center rounded-full bg-tinta/40 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-tinta/60"
              >
                <X size={17} />
              </button>

              <div className="absolute right-5 bottom-4 left-5">
                <p className="text-[24px] leading-tight font-extrabold tracking-tight text-white">
                  {station.name}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-[12px] font-medium text-white/80">
                  <MapPin size={12} className="shrink-0" />
                  <span className="truncate">{station.avenue} · {station.district}</span>
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 scroll-fino">
              <span className="inline-flex items-center gap-2 rounded-full bg-verde-claro px-3 py-1.5 text-[12px] font-bold text-verde-oscuro">
                <i className="size-1.5 rounded-full bg-verde" />
                {SERVICE_STATUS.title}
              </span>

              <h3 className="mt-5 mb-2.5 text-[11px] font-bold tracking-[.1em] text-tinta-suave uppercase">
                Próximos trenes
              </h3>
              <div className="space-y-2">
                {(["norte", "sur"] as const)
                  .filter((d) => (d === "norte" ? station.index < STATIONS.length - 1 : station.index > 0))
                  .map((d) => {
                    const t = nextTrains(station.index, d, 1, now)[0];
                    return (
                      <div key={d} className="flex items-center gap-3 rounded-xl bg-fondo px-4 py-3">
                        <TrainFront size={17} className="text-verde" />
                        <span className="text-[13px] font-semibold">{DIRECTIONS[d].to}</span>
                        <span className="ml-auto text-[17px] font-extrabold tracking-tight tabular">
                          {t.minutes} min
                        </span>
                      </div>
                    );
                  })}
              </div>

              <h3 className="mt-5 mb-2.5 text-[11px] font-bold tracking-[.1em] text-tinta-suave uppercase">
                Afluencia ahora
              </h3>
              <div className="flex items-center gap-3 rounded-xl bg-fondo px-4 py-3">
                <Users size={17} style={{ color: CROWD_COLORS[crowd.key] }} />
                <span className="text-[13px] font-semibold">{crowd.label}</span>
                <span className="ml-auto text-[12px] text-tinta-suave tabular">{crowd.value}%</span>
              </div>

              {station.exits?.length ? (
                <>
                  <h3 className="mt-5 mb-2.5 text-[11px] font-bold tracking-[.1em] text-tinta-suave uppercase">
                    Salidas
                  </h3>
                  <ul className="space-y-1.5">
                    {station.exits.map((exit, i) => (
                      <li key={exit} className="flex items-center gap-3 text-[13px]">
                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-verde text-[11px] font-bold text-white">
                          {i + 1}
                        </span>
                        {exit}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              {station.nearby?.length ? (
                <>
                  <h3 className="mt-5 mb-2.5 text-[11px] font-bold tracking-[.1em] text-tinta-suave uppercase">
                    Cerca de aquí
                  </h3>
                  <ul className="space-y-1.5 text-[13px] text-tinta-suave">
                    {station.nearby.map((n) => (
                      <li key={n} className="flex items-center gap-2">
                        <MapPin size={13} className="text-verde" /> {n}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-2 text-[11.5px]">
                {station.accessible ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-fondo px-3 py-1.5 font-semibold text-tinta-suave">
                    <Accessibility size={13} /> Accesible
                  </span>
                ) : null}
                {station.connections?.map((c) => (
                  <span key={c} className="rounded-full bg-fondo px-3 py-1.5 font-semibold text-tinta-suave">
                    {c}
                  </span>
                ))}
                <span className="rounded-full bg-fondo px-3 py-1.5 font-semibold text-tinta-suave">
                  Estación {station.index + 1} de {STATIONS.length}
                </span>
              </div>
            </div>

            <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-borde bg-white p-4">
              <button
                type="button"
                onClick={() => onSetOrigin(station.id)}
                className="flex items-center justify-center gap-2 rounded-xl bg-verde-claro px-3 py-3 text-[12.5px] font-bold text-verde-oscuro transition-colors hover:bg-verde hover:text-white"
              >
                <LogIn size={15} /> Salir desde aquí
              </button>
              <button
                type="button"
                onClick={() => onSetDestination(station.id)}
                className="flex items-center justify-center gap-2 rounded-xl bg-verde px-3 py-3 text-[12.5px] font-bold text-white shadow-[0_4px_14px_rgba(0,155,58,.26)] transition-colors hover:bg-verde-oscuro"
              >
                Viajar hasta aquí <ArrowRight size={15} />
              </button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
