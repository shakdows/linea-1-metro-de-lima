"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle, ArrowRight, Bell, CreditCard, Locate, Map as MapIcon, Star, TrainFront,
} from "lucide-react";
import { ALERTS, DIRECTIONS, LINE, SERVICE_STATUS, STATIONS, type Station } from "@/data/stations";
import { CARD } from "@/data/card";
import { bestSlot, crowdingLevel, hhmm, hhmm12, nextTrains } from "@/lib/trip";
import { Panel, PanelHeader, Pill, Button, Stat } from "@/components/ui";
import { TripPlanner } from "./TripPlanner";
import type { ModuleId } from "@/components/shell/navigation";
import type { Trip, Geo } from "./MapWorkspace";
import { cn } from "@/lib/cn";

/**
 * Centro de operaciones personal. Tres bloques y nada más: a dónde vas,
 * cómo está el servicio ahora y qué tienes pendiente. Todo lo demás vive
 * en su propio módulo.
 */
export function HomeWorkspace({
  trip, geo, now, onNavigate, onSelectStation,
}: {
  trip: Trip;
  geo: Geo;
  now: Date;
  onNavigate: (id: ModuleId) => void;
  onSelectStation: (s: Station) => void;
}) {
  const reference = geo.result?.nearest.station ?? trip.origin;
  const crowd = crowdingLevel(now.getHours());
  const slot = bestSlot();
  const norte = nextTrains(reference.index, "norte", 2, now);
  const sur = nextTrains(reference.index, "sur", 2, now);
  const abierto = crowd.key !== "cerrado";

  const crowdTono = crowd.key === "bajo" ? "verde" : crowd.key === "medio" ? "ambar"
    : crowd.key === "cerrado" ? "neutro" : "rojo";

  return (
    <div className="h-full overflow-y-auto p-4 scroll-fino lg:overflow-hidden lg:p-5">
      <div className="mx-auto grid max-w-[1180px] gap-4 lg:h-full lg:grid-cols-[minmax(0,1fr)_330px] lg:grid-rows-[auto_minmax(0,1fr)]">

        {/* Bloque 1 — a dónde vas */}
        <Panel className="overflow-hidden">
          <div className="flex flex-wrap items-end justify-between gap-3 px-4 pt-4 pb-3">
            <div>
              <h2 className="text-[19px] leading-tight font-semibold tracking-tight">
                {saludo(now.getHours())}
              </h2>
              <p className="mt-0.5 text-[12.5px] text-tinta-suave">
                {hhmm12(now)} · {abierto ? "servicio en operación" : "servicio cerrado"} · referencia {reference.name}
              </p>
            </div>
            <Button size="sm" onClick={geo.locate} disabled={geo.status === "locating"}>
              <Locate size={13} />
              {geo.status === "locating" ? "Ubicando" : geo.result ? "Actualizar ubicación" : "Usar mi ubicación"}
            </Button>
          </div>

          <div className="border-t border-borde-suave px-4 py-4">
            <TripPlanner
              origin={trip.origin}
              destination={trip.destination}
              mode={trip.mode}
              now={now}
              calculating={trip.calculating}
              onOrigin={trip.setOrigin}
              onDestination={trip.setDestination}
              onMode={trip.setMode}
              onSwap={trip.swap}
              onCalculate={() => { trip.calculate(); onNavigate("planificar"); }}
            />
          </div>

          {trip.trip ? (
            <motion.div
              key={`${trip.originId}-${trip.destinationId}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
              className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-borde-suave bg-fondo px-4 py-3"
            >
              <Stat label="Duración estimada" value={trip.trip.outbound.minutes} unit="min" />
              <Stat label="Estaciones" value={trip.trip.outbound.stops} />
              <Stat label="Pasaje" value={`S/ ${trip.trip.fare.toFixed(2)}`} />
              <Stat label="Dirección" value={DIRECTIONS[trip.trip.outbound.direction].to} />
              <div className="ml-auto flex gap-2">
                <Button size="sm" onClick={() => onNavigate("mapa")}>
                  <MapIcon size={13} /> Ver en el mapa
                </Button>
                <Button size="sm" variant="primario" onClick={() => onNavigate("planificar")}>
                  Abrir viaje <ArrowRight size={13} />
                </Button>
              </div>
            </motion.div>
          ) : null}
        </Panel>

        {/* Bloque 2 — estado del servicio y accesos, columna derecha completa */}
        <div className="space-y-4 lg:col-start-2 lg:row-span-2 lg:min-h-0 lg:overflow-y-auto lg:scroll-fino">
        <Panel className="overflow-hidden">
          <PanelHeader
            title="Ahora en la línea"
            hint={`Desde ${reference.name}`}
            action={
              <Pill tono={SERVICE_STATUS.level === "normal" ? "verde" : "ambar"} punto>
                {SERVICE_STATUS.title}
              </Pill>
            }
          />

          <div className="divide-y divide-borde-suave">
            {([["norte", norte], ["sur", sur]] as const)
              .filter(([d]) => (d === "norte" ? reference.index < 25 : reference.index > 0))
              .map(([direction, trenes]) => (
                <div key={direction} className="px-4 py-3">
                  <p className="text-[11px] text-tinta-suave">Hacia {DIRECTIONS[direction].to}</p>
                  <div className="mt-1.5 flex items-baseline gap-3">
                    <span className="text-[22px] leading-none font-semibold tracking-tight tabular text-verde">
                      {trenes[0].minutes}
                      <span className="ml-1 text-[12px] font-medium text-tinta-suave">min</span>
                    </span>
                    <span className="text-[12px] text-tinta-suave">{trenes[0].status}</span>
                    <span className="ml-auto text-[12px] text-tinta-suave tabular">
                      luego {hhmm(trenes[1].at)}
                    </span>
                  </div>
                </div>
              ))}

            <div className="px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] text-tinta-suave">Afluencia estimada</p>
                <Pill tono={crowdTono}>{crowd.label}</Pill>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-borde">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${crowd.value}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full",
                    crowd.key === "bajo" ? "bg-verde" : crowd.key === "medio" ? "bg-ambar" : "bg-rojo",
                  )}
                />
              </div>
              <p className="mt-2 text-[11.5px] text-tinta-suave">
                Franja más tranquila: {slot.label}
              </p>
            </div>
          </div>
        </Panel>

        {/* Accesos: frecuentes, tarjeta y avisos */}
        <Panel className="overflow-hidden">
          <PanelHeader title="Tus accesos" hint="Rutas guardadas y saldo" />

          <div className="divide-y divide-borde-suave">
            {trip.frequents.length ? (
              trip.frequents.slice(0, 3).map((r) => (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => {
                    trip.setOrigin(r.originId);
                    trip.setDestination(r.destinationId);
                    onNavigate("planificar");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-fondo"
                >
                  <Star size={13} className="shrink-0 text-tinta-suave" />
                  <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium">{r.label}</span>
                  <span className="shrink-0 text-[11.5px] text-tinta-suave tabular">{r.minutes} min</span>
                </button>
              ))
            ) : (
              <p className="px-4 py-3 text-[12px] text-tinta-suave">
                Las rutas que calcules se guardarán aquí para repetirlas en un toque.
              </p>
            )}

            <button
              type="button"
              onClick={() => onNavigate("tarjeta")}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-fondo"
            >
              <CreditCard size={14} className="shrink-0 text-tinta-suave" />
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] font-medium">Tarjeta {CARD.number}</span>
                <span className="block text-[11px] text-tinta-suave">
                  {Math.floor(CARD.balance / LINE.fare)} viajes disponibles
                </span>
              </span>
              <span className="shrink-0 text-[14px] font-semibold tabular">
                S/ {CARD.balance.toFixed(2)}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate("avisos")}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-fondo"
            >
              {ALERTS.some((a) => a.level !== "info")
                ? <AlertTriangle size={14} className="shrink-0 text-ambar" />
                : <Bell size={14} className="shrink-0 text-tinta-suave" />}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-medium">{ALERTS[0]?.title}</span>
                <span className="block text-[11px] text-tinta-suave">
                  {ALERTS.length} avisos del servicio
                </span>
              </span>
              <ArrowRight size={14} className="shrink-0 text-tinta-suave" />
            </button>
          </div>
        </Panel>

        <p className="px-1 text-[11px] leading-relaxed text-tinta-suave">
          <TrainFront size={11} className="mr-1 inline align-[-1px]" />
          Interfaz conceptual para fines académicos. No representa el sitio oficial de Línea 1.
          Horarios, afluencia y saldos son simulaciones.
        </p>
        </div>

        {/* Bloque 3 — la línea completa, ocupa la altura restante */}
        <Panel className="flex min-h-0 flex-col overflow-hidden lg:col-start-1 lg:row-start-2">
          <PanelHeader
            title="La línea de extremo a extremo"
            hint={`${STATIONS.length} estaciones · el tramo de tu viaje aparece resaltado`}
            action={
              <Button size="sm" variant="fantasma" onClick={() => onNavigate("estaciones")}>
                Ver catálogo <ArrowRight size={13} />
              </Button>
            }
          />
          <LineaCompleta trip={trip} reference={reference} onSelect={onSelectStation} />
        </Panel>
      </div>
    </div>
  );
}

/** Recorrido completo como diagrama vertical denso: sitúa el viaje en la red */
function LineaCompleta({
  trip, reference, onSelect,
}: {
  trip: Trip;
  reference: { id: string };
  onSelect: (s: Station) => void;
}) {
  const a = Math.min(trip.origin.index, trip.destination.index);
  const b = Math.max(trip.origin.index, trip.destination.index);

  return (
    <ul className="min-h-0 flex-1 overflow-y-auto px-4 py-3 scroll-fino">
      {STATIONS.map((s, i) => {
        const inRoute = s.index >= a && s.index <= b;
        const isEnd = s.id === trip.originId || s.id === trip.destinationId;
        const isRef = s.id === reference.id;
        const last = i === STATIONS.length - 1;

        return (
          <li key={s.id} className="relative">
            <button
              type="button"
              onClick={() => onSelect(s)}
              className="flex w-full items-center gap-3 rounded-md px-1.5 py-[5px] text-left transition-colors hover:bg-fondo"
            >
              <span className="relative grid w-4 shrink-0 place-items-center self-stretch">
                {!last ? (
                  <span
                    className={cn(
                      "absolute top-1/2 left-1/2 h-full w-[3px] -translate-x-1/2 rounded-full",
                      inRoute && s.index < b ? "bg-verde" : "bg-borde",
                    )}
                  />
                ) : null}
                <span
                  className={cn(
                    "relative z-10 rounded-full border-2 bg-superficie transition-all",
                    isEnd ? "size-3.5 border-verde bg-verde"
                      : inRoute ? "size-2.5 border-verde"
                        : "size-2 border-inactivo",
                  )}
                />
              </span>

              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-[12.5px]",
                  isEnd ? "font-semibold" : inRoute ? "" : "text-tinta-suave",
                )}
              >
                {s.name}
              </span>

              <span className="hidden shrink-0 truncate text-[11px] text-tinta-suave sm:block sm:max-w-[180px]">
                {s.district}
              </span>

              {s.id === trip.originId ? <Pill tono="verde">Origen</Pill> : null}
              {s.id === trip.destinationId ? <Pill tono="verde">Destino</Pill> : null}
              {isRef && !isEnd ? <Pill tono="azul">Más cercana</Pill> : null}
              {s.terminal && !isEnd ? <Pill>Terminal</Pill> : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function saludo(hour: number) {
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}
