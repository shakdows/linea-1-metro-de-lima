"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Layers, Locate, TrainFront } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Sidebar, type SectionId } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Header } from "@/components/Header";
import { Planner } from "@/components/Planner";
import { TripPanel } from "@/components/TripPanel";
import { StationPanel } from "@/components/StationPanel";
import { StationDrawer } from "@/components/StationDrawer";
import { StationList } from "@/components/StationList";
import { ArrivalToast } from "@/components/ArrivalToast";
import { MobileSheet } from "@/components/MobileSheet";
import { AIChat, CrowdingChart, MetroCard, NextTrains, ServiceAlerts } from "@/components/SidePanels";

import { useTrip } from "@/hooks/useTrip";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { DIRECTIONS, type Station } from "@/data/stations";
import type { MapHandle } from "@/components/MetroMap";

const MetroMap = dynamic(() => import("@/components/MetroMap"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-[#eaeef0]">
      <span className="flex items-center gap-2.5 rounded-full bg-white/90 px-4 py-2.5 text-[12.5px] font-semibold text-tinta-suave shadow-suave">
        <TrainFront size={15} className="animate-pulse text-verde" /> Cargando el mapa…
      </span>
    </div>
  ),
});

/**
 * El HTML se genera en el build con la hora de esa máquina. El reloj arranca
 * en una hora fija para que el primer render del cliente coincida, y se pone
 * en hora ya montado.
 */
const CLOCK_FALLBACK = new Date(2026, 0, 1, 9, 30, 0);

const saludo = (h: number) => (h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches");

export default function Page() {
  const [section, setSection] = useState<SectionId>("inicio");
  const [now, setNow] = useState<Date>(CLOCK_FALLBACK);
  const [fitSignal, setFitSignal] = useState(0);
  const [drawSignal, setDrawSignal] = useState(0);
  const [sheetBump, setSheetBump] = useState(0);
  const [picked, setPicked] = useState<Station | null>(null);
  const [details, setDetails] = useState<Station | null>(null);
  const [follow, setFollow] = useState(true);
  const [arrival, setArrival] = useState<Station | null>(null);
  const mapHandle = useRef<MapHandle | null>(null);

  const trip = useTrip();
  const geo = useGeolocation();
  const isDesktop = useIsDesktop();

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const traveling =
    trip.status === "traveling" || trip.status === "returning" ||
    trip.status === "paused" || trip.status === "station-stop" ||
    trip.status === "completed" || trip.status === "return-ready" ||
    trip.status === "finished";

  const variant: "ida" | "vuelta" = trip.activeLeg === "outbound" ? "ida" : "vuelta";
  const routeStations = trip.leg?.stations ?? [];

  const remaining = useMemo(() => {
    if (!trip.leg) return 0;
    const done = trip.train.currentStop / Math.max(1, trip.leg.stops - 1);
    return Math.max(0, Math.round(trip.leg.minutes * (1 - done)));
  }, [trip.leg, trip.train.currentStop]);

  useEffect(() => {
    if (!traveling || trip.train.currentStop === 0) return;
    setArrival(trip.currentStation);
    const id = setTimeout(() => setArrival(null), 2600);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip.train.currentStop]);

  const calcular = useCallback(() => {
    trip.calculate();
    setPicked(null);
    setTimeout(() => {
      setFitSignal((n) => n + 1);
      setDrawSignal((n) => n + 1);
      setSheetBump((n) => n + 1);
    }, 420);
  }, [trip]);

  useEffect(() => {
    if (geo.status === "ready" && geo.result) {
      trip.setOrigin(geo.result.nearest.station.id);
      setFitSignal((n) => n + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.status]);

  /* Un solo panel a la vez: la barra lateral decide qué se ve */
  const panel = (() => {
    if (section === "estaciones") {
      return <StationList onSelect={(s) => { setDetails(s); mapHandle.current?.flyTo(s); }} />;
    }
    if (section === "tarjeta") return <div className="p-4"><MetroCard /></div>;
    if (section === "avisos") return <div className="p-4"><ServiceAlerts /></div>;
    if (section === "asistente" || section === "ayuda") {
      return (
        <div className="p-4">
          <AIChat onShowRoute={(o, d) => {
            trip.setOrigin(o);
            trip.setDestination(d);
            setSection("inicio");
            setTimeout(calcular, 40);
          }} />
        </div>
      );
    }
    if (section === "horarios") {
      return (
        <div className="space-y-4 p-4">
          <NextTrains station={trip.origin} now={now} />
          <CrowdingChart now={now} />
        </div>
      );
    }
    if (section === "mapa") {
      return (
        <div className="space-y-4 p-4">
          <div className="rounded-2xl border border-borde bg-white p-4 shadow-suave">
            <p className="mb-3 text-[13px] font-extrabold tracking-tight">Leyenda</p>
            <Legend color="#00521F" label="Recorrido realizado" />
            <Legend color="#6FD694" label="Recorrido pendiente" />
            <Legend color="#1687F8" label="Trayecto de vuelta" />
            <Legend color="#CBD5E1" label="Resto de la línea" last />
          </div>
          <div className="rounded-2xl border border-borde bg-white p-4 shadow-suave">
            <p className="mb-2 text-[13px] font-extrabold tracking-tight">Tu ubicación</p>
            {geo.status === "ready" && geo.result ? (
              <p className="text-[12.5px] leading-relaxed text-tinta-suave">
                Estación más cercana:{" "}
                <strong className="text-tinta">{geo.result.nearest.station.name}</strong>
                <br />
                {geo.result.nearest.meters} m · {geo.result.nearest.walkMinutes} min caminando
              </p>
            ) : (
              <>
                <p className="mb-3 text-[12.5px] text-tinta-suave">
                  Te decimos cuál es tu estación más cercana y cuánto tardas a pie.
                </p>
                <button
                  type="button"
                  onClick={geo.locate}
                  disabled={geo.status === "locating"}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-verde-claro py-2.5 text-[12.5px] font-bold text-verde-oscuro transition-colors hover:bg-verde hover:text-white disabled:opacity-60"
                >
                  <Locate size={15} />
                  {geo.status === "locating" ? "Buscando…" : "Usar mi ubicación"}
                </button>
              </>
            )}
            {geo.status === "error" ? (
              <p className="mt-2 text-[11.5px] text-amber-700">{geo.error}</p>
            ) : null}
          </div>
        </div>
      );
    }

    /* Inicio y «Planificar viaje»: planificador, o el viaje si ya empezó */
    return traveling || trip.status === "ready" ? (
      <TripPanel
        status={trip.status}
        progress={trip.train.progress}
        from={trip.leg?.from ?? trip.origin}
        to={trip.leg?.to ?? trip.destination}
        current={trip.currentStation}
        next={trip.nextStation}
        directionTo={trip.leg ? DIRECTIONS[trip.leg.direction].to : "—"}
        totalMinutes={trip.leg?.minutes ?? 0}
        stops={trip.leg?.stops ?? 0}
        remaining={remaining}
        variant={variant}
        follow={follow}
        onToggleFollow={() => setFollow((v) => !v)}
        onStart={trip.startJourney}
        onPause={trip.pause}
        onResume={trip.resume}
        onFinish={trip.finish}
        onRestart={trip.restart}
        onStartReturn={trip.startReturn}
        hasReturn={Boolean(trip.trip?.inbound)}
      />
    ) : (
      <Planner
        greeting={saludo(now.getHours())}
        origin={trip.origin}
        destination={trip.destination}
        mode={trip.mode}
        now={now}
        calculating={trip.calculating}
        frequents={trip.frequents}
        onOrigin={trip.setOrigin}
        onDestination={trip.setDestination}
        onMode={trip.setMode}
        onSwap={trip.swap}
        onCalculate={calcular}
        onPickFrequent={(r) => {
          trip.setOrigin(r.originId);
          trip.setDestination(r.destinationId);
          setTimeout(calcular, 40);
        }}
      />
    );
  })();

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar active={section} onNavigate={setSection} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          onPickStation={(id) => { trip.setOrigin(id); setFitSignal((n) => n + 1); }}
          onOpenMenu={() => setSection("estaciones")}
        />

        <div className="flex min-h-0 flex-1">
          {/* Panel contextual: siempre uno solo */}
          {isDesktop ? (
            <aside className="w-[330px] shrink-0 overflow-y-auto border-r border-borde bg-fondo scroll-fino">
              <AnimatePresence mode="wait">
                <motion.div
                  key={section + String(traveling || trip.status === "ready")}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: [0.2, 0.8, 0.3, 1] }}
                >
                  {panel}
                </motion.div>
              </AnimatePresence>
            </aside>
          ) : null}

          {/* Mapa */}
          <div className="relative min-w-0 flex-1">
            <MetroMap
              routeStations={routeStations}
              outboundStations={trip.trip?.outbound.stations ?? []}
              inboundStations={trip.trip?.inbound?.stations ?? null}
              position={trip.train.position}
              visitedCount={trip.train.currentStop}
              trainVisible={traveling}
              trainVariant={variant}
              originId={trip.originId}
              destinationId={trip.destinationId}
              userLocation={geo.result}
              nearestId={geo.result?.nearest.station.id}
              fitSignal={fitSignal}
              drawSignal={drawSignal}
              followTrain={follow && traveling}
              onSelectStation={setPicked}
              onTrainClick={() => setPicked(trip.currentStation)}
              onReady={(h) => { mapHandle.current = h; }}
            />

            {/* Dos controles, no más */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-500 flex items-start justify-between gap-3 p-4">
              <div className="pointer-events-auto flex gap-2">
                <FloatBtn onClick={geo.locate} disabled={geo.status === "locating"} label="Mi ubicación">
                  <Locate size={15} />
                </FloatBtn>
                <FloatBtn onClick={() => mapHandle.current?.fitAll()} label="Ver toda la línea">
                  <Layers size={15} />
                </FloatBtn>
              </div>

              <div className="pointer-events-none flex max-w-[62vw] min-w-0 flex-col items-end gap-2 sm:max-w-none">
                <ArrivalToast station={arrival} show={Boolean(arrival)} />
              </div>
            </div>

            {/* Ficha de estación, solo al tocar una */}
            <div className="pointer-events-none absolute top-4 right-4 bottom-4 z-500 hidden items-start justify-end lg:flex">
              <StationPanel
                station={picked}
                now={now}
                onClose={() => setPicked(null)}
                onSetOrigin={(id) => { trip.setOrigin(id); setPicked(null); setSection("inicio"); }}
                onSetDestination={(id) => { trip.setDestination(id); setPicked(null); setSection("inicio"); }}
                onDetails={(s) => { setPicked(null); setDetails(s); }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================= MÓVIL ========================= */}
      {!isDesktop ? (
        <MobileSheet
          bump={sheetBump}
          summary={
            <span className="block">
              <span className="block text-[13.5px] font-extrabold tracking-tight">
                {trip.origin.name} <span className="text-tinta-suave">→</span> {trip.destination.name}
              </span>
              <span className="block text-[11.5px] text-tinta-suave">
                {trip.leg ? `${trip.leg.minutes} min · ${trip.leg.stops} estaciones` : "Elige tu ruta"}
                {traveling ? ` · ${trip.currentStation.name}` : ""}
              </span>
            </span>
          }
        >
          <div className="-mx-4">{panel}</div>
        </MobileSheet>
      ) : null}

      <MobileNav active={section} onNavigate={setSection} />

      {/* Ficha completa, en cajón lateral */}
      <StationDrawer
        station={details ?? (!isDesktop ? picked : null)}
        now={now}
        onClose={() => { setDetails(null); setPicked(null); }}
        onSetOrigin={(id) => {
          trip.setOrigin(id); setDetails(null); setPicked(null);
          setSection("inicio"); setTimeout(calcular, 40);
        }}
        onSetDestination={(id) => {
          trip.setDestination(id); setDetails(null); setPicked(null);
          setSection("inicio"); setTimeout(calcular, 40);
        }}
      />
    </div>
  );
}

function FloatBtn({
  children, onClick, disabled, label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="glass inline-flex items-center gap-2 rounded-xl p-2.5 text-[12.5px] font-bold whitespace-nowrap text-tinta transition-all hover:scale-[1.02] active:scale-[.98] disabled:opacity-60 sm:px-3.5"
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function Legend({ color, label, last }: { color: string; label: string; last?: boolean }) {
  return (
    <p className={`flex items-center gap-2.5 text-[12px] font-semibold ${last ? "" : "mb-2"}`}>
      <i className="h-1.5 w-6 rounded-full" style={{ background: color }} />
      {label}
    </p>
  );
}
