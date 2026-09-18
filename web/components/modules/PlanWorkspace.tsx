"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Map as MapIcon, Route, Undo2 } from "lucide-react";
import { Panel, PanelHeader, Pill, Button, Empty } from "@/components/ui";
import { TripPlanner } from "./TripPlanner";
import { RouteSummary } from "./RouteSummary";
import type { Trip } from "./MapWorkspace";
import type { ModuleId } from "@/components/shell/navigation";

/**
 * Planificar viaje: el formulario arriba y el resultado debajo, en columnas.
 * Cuando el modo es ida y vuelta, ambos tramos se muestran en paralelo para
 * poder compararlos sin desplazarse.
 */
export function PlanWorkspace({
  trip, now, onNavigate,
}: {
  trip: Trip;
  now: Date;
  onNavigate: (id: ModuleId) => void;
}) {
  const traveling = trip.status !== "idle" && trip.status !== "ready";

  return (
    <div className="h-full overflow-y-auto p-4 scroll-fino lg:p-5">
      <div className="mx-auto max-w-[1080px] space-y-4">
        <Panel>
          <PanelHeader
            title="Definir el viaje"
            hint="Elige origen, destino y si necesitas el regreso"
            action={
              <Button size="sm" onClick={() => onNavigate("mapa")}>
                <MapIcon size={13} /> Ver en el mapa
              </Button>
            }
          />
          <div className="p-4">
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
              onCalculate={trip.calculate}
            />
          </div>
        </Panel>

        <AnimatePresence mode="wait">
          {trip.trip ? (
            <motion.div
              key={`${trip.originId}-${trip.destinationId}-${trip.mode}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid gap-4 lg:grid-cols-2 lg:items-start"
            >
              <Panel className="overflow-hidden">
                <PanelHeader
                  title="Tramo de ida"
                  action={
                    trip.activeLeg === "outbound" && traveling
                      ? <Pill tono="verde" punto>En curso</Pill>
                      : null
                  }
                />
                <RouteSummary
                  leg={trip.trip.outbound}
                  now={now}
                  variant="ida"
                  visitedCount={trip.activeLeg === "outbound" ? trip.visitedCount : 0}
                  traveling={traveling && trip.activeLeg === "outbound"}
                  onStart={() => { trip.startJourney(); onNavigate("mapa"); }}
                />
              </Panel>

              {trip.trip.inbound ? (
                <Panel className="overflow-hidden">
                  <PanelHeader
                    title="Tramo de vuelta"
                    action={
                      trip.activeLeg === "inbound" && traveling
                        ? <Pill tono="azul" punto>En curso</Pill>
                        : <Pill tono="azul">Regreso</Pill>
                    }
                  />
                  <RouteSummary
                    leg={trip.trip.inbound}
                    now={now}
                    variant="vuelta"
                    visitedCount={trip.activeLeg === "inbound" ? trip.visitedCount : 0}
                    traveling={traveling && trip.activeLeg === "inbound"}
                    onStart={
                      trip.status === "return-ready"
                        ? () => { trip.startReturn(); onNavigate("mapa"); }
                        : undefined
                    }
                  />
                </Panel>
              ) : (
                <Panel className="overflow-hidden">
                  <PanelHeader title="Tramo de vuelta" />
                  <Empty
                    icon={<Undo2 size={22} />}
                    title="Viaje de solo ida"
                    hint="Cambia el modo a «Ida y vuelta» para calcular también el regreso."
                  />
                </Panel>
              )}
            </motion.div>
          ) : (
            <Panel key="vacio">
              <Empty
                icon={<Route size={22} />}
                title="Elige dos estaciones distintas"
                hint="El origen y el destino no pueden ser la misma estación."
              />
            </Panel>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
