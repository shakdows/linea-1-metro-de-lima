"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AppShell } from "@/components/shell/AppShell";
import type { ModuleId } from "@/components/shell/navigation";
import { StationDrawer } from "@/components/StationDrawer";

import { HomeWorkspace } from "@/components/modules/HomeWorkspace";
import { MapWorkspace } from "@/components/modules/MapWorkspace";
import { PlanWorkspace } from "@/components/modules/PlanWorkspace";
import { StationsWorkspace } from "@/components/modules/StationsWorkspace";
import { CardWorkspace } from "@/components/modules/CardWorkspace";
import { ScheduleWorkspace } from "@/components/modules/ScheduleWorkspace";
import { AlertsWorkspace } from "@/components/modules/AlertsWorkspace";
import { AssistantWorkspace } from "@/components/modules/AssistantWorkspace";

import { useTrip } from "@/hooks/useTrip";
import { useGeolocation } from "@/hooks/useGeolocation";
import { stationById, type Station } from "@/data/stations";
import type { MapHandle } from "@/components/MetroMap";

/**
 * El HTML se genera en el build con la hora de esa máquina. El reloj arranca
 * en una hora fija para que el primer render del cliente coincida, y se pone
 * en hora ya montado.
 */
const CLOCK_FALLBACK = new Date(2026, 0, 1, 9, 30, 0);

export default function Page() {
  const [module, setModule] = useState<ModuleId>("inicio");
  const [now, setNow] = useState<Date>(CLOCK_FALLBACK);
  const [inspected, setInspected] = useState<Station | null>(null);
  const [follow, setFollow] = useState(true);
  const [arrival, setArrival] = useState<Station | null>(null);
  const [fitSignal, setFitSignal] = useState(0);
  const [drawSignal, setDrawSignal] = useState(0);
  const mapHandle = useRef<MapHandle | null>(null);

  const trip = useTrip();
  const geo = useGeolocation();

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const traveling =
    trip.status !== "idle" && trip.status !== "ready" && trip.status !== "completed";

  /* Aviso breve al pasar por cada estación */
  useEffect(() => {
    if (!traveling || trip.train.currentStop === 0) return;
    setArrival(trip.currentStation);
    const id = setTimeout(() => setArrival(null), 2600);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip.train.currentStop]);

  /* Cada cambio de ruta reencuadra y redibuja el mapa, esté montado o no */
  useEffect(() => {
    setFitSignal((n) => n + 1);
    setDrawSignal((n) => n + 1);
  }, [trip.originId, trip.destinationId, trip.mode, trip.activeLeg]);

  /* Al abrir el módulo de mapa hay que redibujar: Leaflet se monta de nuevo */
  useEffect(() => {
    if (module !== "mapa") return;
    const id = setTimeout(() => {
      setDrawSignal((n) => n + 1);
      setFitSignal((n) => n + 1);
    }, 60);
    return () => clearTimeout(id);
  }, [module]);

  const openStation = useCallback((s: Station) => setInspected(s), []);

  const pickStationById = useCallback((id: string) => {
    const s = stationById(id);
    if (s) setInspected(s);
  }, []);

  const showRouteOnMap = useCallback(
    (originId: string, destinationId: string) => {
      trip.setOrigin(originId);
      trip.setDestination(destinationId);
      setModule("mapa");
    },
    [trip],
  );

  return (
    <>
      <AppShell module={module} onNavigate={setModule} onPickStation={pickStationById}>
        {module === "inicio" ? (
          <HomeWorkspace trip={trip} geo={geo} now={now} onNavigate={setModule} onSelectStation={openStation} />
        ) : null}

        {module === "mapa" ? (
          <MapWorkspace
            trip={trip}
            geo={geo}
            traveling={traveling}
            follow={follow}
            onToggleFollow={() => setFollow((v) => !v)}
            arrival={arrival}
            fitSignal={fitSignal}
            drawSignal={drawSignal}
            onSelectStation={openStation}
            mapHandle={mapHandle}
          />
        ) : null}

        {module === "planificar" ? (
          <PlanWorkspace trip={trip} now={now} onNavigate={setModule} />
        ) : null}

        {module === "estaciones" ? (
          <StationsWorkspace now={now} onSelect={openStation} />
        ) : null}

        {module === "tarjeta" ? <CardWorkspace /> : null}

        {module === "horarios" ? <ScheduleWorkspace /> : null}

        {module === "avisos" ? <AlertsWorkspace /> : null}

        {module === "asistente" ? (
          <AssistantWorkspace now={now} onShowRoute={showRouteOnMap} />
        ) : null}
      </AppShell>

      <StationDrawer
        station={inspected}
        now={now}
        onClose={() => setInspected(null)}
        onSetOrigin={(id) => { trip.setOrigin(id); setInspected(null); }}
        onSetDestination={(id) => { trip.setDestination(id); setInspected(null); }}
      />
    </>
  );
}
