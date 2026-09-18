"use client";

import Image from "next/image";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Accessibility, ArrowRight, Flag, MapPin, TrainFront, Users, X,
} from "lucide-react";
import { DIRECTIONS, SERVICE_STATUS, STATIONS, type Station } from "@/data/stations";
import { crowdingLevel, nextTrains } from "@/lib/trip";
import { Button, Pill } from "./ui";

/**
 * Inspector de estación: cajón derecho contextual, no un modal centrado.
 * Mantiene el mapa visible detrás para no perder el contexto.
 */
export function StationDrawer({
  station, now, onClose, onSetOrigin, onSetDestination,
}: {
  station: Station | null;
  now: Date;
  onClose: () => void;
  onSetOrigin: (id: string) => void;
  onSetDestination: (id: string) => void;
}) {
  /* Escape cierra el inspector: es un panel, no una página */
  useEffect(() => {
    if (!station) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [station, onClose]);

  const crowd = station ? crowdingLevel(now.getHours()) : null;
  const crowdTono = crowd
    ? crowd.key === "bajo" ? "verde" : crowd.key === "medio" ? "ambar" : crowd.key === "cerrado" ? "neutro" : "rojo"
    : "neutro";

  return (
    <AnimatePresence>
      {station && crowd ? (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-[900] bg-tinta/10 lg:hidden"
          />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            role="dialog"
            aria-label={`Estación ${station.name}`}
            className="fixed inset-y-0 right-0 z-[950] flex w-full max-w-[368px] flex-col border-l border-borde bg-superficie shadow-flotante"
          >
            <header className="flex h-[56px] shrink-0 items-center gap-3 border-b border-borde px-4">
              <span className="text-[11px] font-medium tracking-[.08em] text-tinta-suave uppercase">
                Estación
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="ml-auto grid size-8 place-items-center rounded-lg text-tinta-suave transition-colors hover:bg-fondo hover:text-tinta"
              >
                <X size={16} />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto scroll-fino">
              <div className="relative h-[168px] bg-fondo">
                {station.image ? (
                  <Image src={station.image} alt={`Estación ${station.name}`} fill sizes="368px" className="object-cover" />
                ) : (
                  <div className="grid h-full place-items-center">
                    <TrainFront size={30} className="text-inactivo" />
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[17px] leading-tight font-semibold tracking-tight">{station.name}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-[12px] text-tinta-suave">
                      <MapPin size={12} className="shrink-0" />
                      {station.district} · {station.avenue}
                    </p>
                  </div>
                  <Pill tono="verde" punto>{SERVICE_STATUS.title}</Pill>
                </div>

                <Section title="Próximos trenes">
                  <div className="divide-y divide-borde-suave overflow-hidden rounded-lg border border-borde">
                    {(["norte", "sur"] as const)
                      .filter((d) => (d === "norte" ? station.index < STATIONS.length - 1 : station.index > 0))
                      .map((d) => (
                        <div key={d} className="flex items-center gap-3 px-3 py-2.5">
                          <TrainFront size={14} className="shrink-0 text-tinta-suave" />
                          <span className="min-w-0 flex-1 truncate text-[12.5px]">{DIRECTIONS[d].to}</span>
                          <span className="flex gap-2.5 text-[12.5px] font-medium tabular">
                            {nextTrains(station.index, d, 3, now).map((t, i) => (
                              <span key={i} className={i === 0 ? "text-verde" : "text-tinta-suave"}>
                                {t.minutes}′
                              </span>
                            ))}
                          </span>
                        </div>
                      ))}
                  </div>
                </Section>

                <Section title="Afluencia estimada">
                  <div className="flex items-center gap-3 rounded-lg border border-borde px-3 py-2.5">
                    <Users size={15} className="text-tinta-suave" />
                    <span className="text-[12.5px]">{crowd.label}</span>
                    <Pill tono={crowdTono as never} className="ml-auto">{crowd.value}%</Pill>
                  </div>
                </Section>

                {station.exits?.length ? (
                  <Section title="Salidas">
                    <ul className="space-y-1.5">
                      {station.exits.map((exit, i) => (
                        <li key={exit} className="flex items-center gap-2.5 text-[12.5px]">
                          <span className="grid size-5 shrink-0 place-items-center rounded border border-borde text-[10px] font-medium text-tinta-suave">
                            {i + 1}
                          </span>
                          {exit}
                        </li>
                      ))}
                    </ul>
                  </Section>
                ) : null}

                <Section title="Servicios">
                  <div className="flex flex-wrap gap-1.5">
                    {station.accessible ? (
                      <Pill><Accessibility size={12} /> Accesible</Pill>
                    ) : null}
                    {station.connections?.map((c) => <Pill key={c}>{c}</Pill>)}
                    {station.terminal ? <Pill tono="verde">Terminal</Pill> : null}
                    <Pill>Estación {station.index + 1} de {STATIONS.length}</Pill>
                  </div>
                </Section>

                {station.nearby?.length ? (
                  <Section title="Cerca de aquí">
                    <ul className="space-y-1.5 text-[12.5px] text-tinta-suave">
                      {station.nearby.map((n) => (
                        <li key={n} className="flex items-center gap-2">
                          <MapPin size={12} className="shrink-0" /> {n}
                        </li>
                      ))}
                    </ul>
                  </Section>
                ) : null}
              </div>
            </div>

            <footer className="grid shrink-0 grid-cols-2 gap-2 border-t border-borde p-3">
              <Button onClick={() => onSetOrigin(station.id)} className="whitespace-nowrap">
                <MapPin size={14} /> Como origen
              </Button>
              <Button variant="primario" onClick={() => onSetDestination(station.id)} className="whitespace-nowrap">
                <Flag size={14} /> Como destino
              </Button>
            </footer>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-[11px] font-medium tracking-[.06em] text-tinta-suave uppercase">{title}</p>
      {children}
    </div>
  );
}

export { ArrowRight };
