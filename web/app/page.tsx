"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Layers, Locate, TrainFront, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Sidebar, type SectionId } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Header } from "@/components/Header";
import { CommandCenter } from "@/components/CommandCenter";
import { StationDrawer } from "@/components/StationDrawer";
import { StationList } from "@/components/StationList";
import { TripHUD, ArrivalToast } from "@/components/TripHUD";
import { MobileSheet } from "@/components/MobileSheet";
import { AvenueToast } from "@/components/AvenueToast";
import { AIChat, CrowdingChart, MetroCard, NextTrains, ServiceAlerts } from "@/components/SidePanels";

import { useTrip } from "@/hooks/useTrip";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { DIRECTIONS, type Station } from "@/data/stations";
import type { MapHandle } from "@/components/MetroMap";

/* Leaflet toca el DOM, así que el mapa solo se carga en el navegador */
const MetroMap = dynamic(() => import("@/components/MetroMap"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-[#eaeef0]">
      <span className="flex items-center gap-2.5 rounded-full bg-white/90 px-4 py-2.5 text-[12.5px] font-semibold text-tinta-suave shadow-suave">
        <TrainFront size={15} className="animate-pulse text-verde" /> Cargando el mapa de Lima…
      </span>
    </div>
  ),
});

/**
 * El HTML se genera en el build, con la hora de esa máquina. Para que el
 * primer render del cliente coincida y no falle la hidratación, el reloj
 * arranca en una hora fija y se pone en hora ya montado.
 */
const CLOCK_FALLBACK = new Date(2026, 0, 1, 9, 30, 0);

function saludo(h: number) {
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

export default function Page() {
  const [section, setSection] = useState<SectionId>("inicio");
  const [now, setNow] = useState<Date>(CLOCK_FALLBACK);
  const [fitSignal, setFitSignal] = useState(0);
  const [drawSignal, setDrawSignal] = useState(0);
  const [sheetBump, setSheetBump] = useState(0);
  const [drawer, setDrawer] = useState<Station | null>(null);
  const [trainInfo, setTrainInfo] = useState(false);
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

  /* Aviso al llegar a cada estación */
  useEffect(() => {
    if (!traveling || trip.train.currentStop === 0) return;
    setArrival(trip.currentStation);
    const id = setTimeout(() => setArrival(null), 2600);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip.train.currentStop]);

  const calcular = useCallback(() => {
    trip.calculate();
    setTimeout(() => {
      setFitSignal((n) => n + 1);
      setDrawSignal((n) => n + 1);
      setSheetBump((n) => n + 1);
    }, 420);
  }, [trip]);

  const iniciar = useCallback(() => {
    trip.startJourney();
    setSection("inicio");
    setSheetBump((n) => n + 1);
  }, [trip]);

  useEffect(() => {
    if (geo.status === "ready" && geo.result) {
      trip.setOrigin(geo.result.nearest.station.id);
      setFitSignal((n) => n + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.status]);

  /* El panel lateral cambia según la sección: la app tiene estados, no páginas */
  const panel = (
    <AnimatePresence mode="wait">
      <motion.div
        key={section}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -8 }}
        transition={{ duration: 0.22, ease: [0.2, 0.8, 0.3, 1] }}
        className="h-full"
      >
        {section === "estaciones" ? (
          <StationList onSelect={(s) => { setDrawer(s); mapHandle.current?.flyTo(s); }} />
        ) : section === "tarjeta" ? (
          <div className="space-y-3 p-4"><MetroCard /></div>
        ) : section === "avisos" ? (
          <div className="space-y-3 p-4"><ServiceAlerts /></div>
        ) : section === "ayuda" ? (
          <div className="space-y-3 p-4">
            <AIChat onShowRoute={(o, d) => {
              trip.setOrigin(o); trip.setDestination(d);
              setSection("inicio"); calcular();
            }} />
          </div>
        ) : section === "horarios" ? (
          <div className="space-y-3 p-4">
            <NextTrains station={trip.origin} now={now} />
            <CrowdingChart now={now} />
          </div>
        ) : (
          <CommandCenter
            greeting={saludo(now.getHours())}
            origin={trip.origin}
            destination={trip.destination}
            mode={trip.mode}
            leg={trip.leg}
            calculating={trip.calculating}
            now={now}
            traveling={traveling}
            frequents={trip.frequents}
            onOrigin={trip.setOrigin}
            onDestination={trip.setDestination}
            onMode={trip.setMode}
            onSwap={trip.swap}
            onCalculate={calcular}
            onStart={iniciar}
            onPickFrequent={(r) => {
              trip.setOrigin(r.originId);
              trip.setDestination(r.destinationId);
              setTimeout(calcular, 40);
            }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar active={section} onNavigate={setSection} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          onPickStation={(id) => {
            const s = trip.origin.id === id ? trip.origin : null;
            trip.setOrigin(id);
            setFitSignal((n) => n + 1);
            void s;
          }}
          onOpenMenu={() => setSection("estaciones")}
        />

        <div className="flex min-h-0 flex-1">
          {/* ============================ MAPA ============================ */}
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
              onSelectStation={setDrawer}
              onTrainClick={() => setTrainInfo(true)}
              onReady={(h) => { mapHandle.current = h; }}
            />

            {/* Controles flotantes */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-500 flex items-start justify-between gap-3 p-4">
              <div className="pointer-events-auto flex gap-2">
                <FloatBtn
                  onClick={geo.locate}
                  disabled={geo.status === "locating"}
                  label={geo.status === "locating" ? "Buscando…" : "Mi ubicación"}
                >
                  <Locate size={15} />
                </FloatBtn>
                <FloatBtn onClick={() => mapHandle.current?.fitAll()} label="Ver toda la línea">
                  <Layers size={15} />
                </FloatBtn>
              </div>

              <div className="pointer-events-none flex min-w-0 max-w-[62vw] flex-col items-end gap-2 sm:max-w-none">
                <ArrivalToast station={arrival} show={Boolean(arrival)} />
                <AvenueToast
                  avenue={trip.currentStation?.avenue ?? null}
                  active={trip.status === "traveling" || trip.status === "returning"}
                />
              </div>
            </div>

            {/* Estación más cercana */}
            {geo.status === "ready" && geo.result && !traveling ? (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass absolute bottom-4 left-4 z-500 hidden rounded-xl px-4 py-2.5 text-[12px] font-semibold data-[hud]:hidden lg:block"
              >
                🚶 Tu estación más cercana:{" "}
                <strong>{geo.result.nearest.station.name}</strong> · {geo.result.nearest.meters} m ·{" "}
                {geo.result.nearest.walkMinutes} min
              </motion.p>
            ) : null}

            {/* HUD del viaje */}
            <div className="pointer-events-none absolute bottom-4 left-4 z-500 hidden lg:block">
              <AnimatePresence>
                {traveling && trip.leg ? (
                  <TripHUD
                    status={trip.status}
                    progress={trip.train.progress}
                    current={trip.currentStation}
                    next={trip.nextStation}
                    directionTo={DIRECTIONS[trip.leg.direction].to}
                    remaining={remaining}
                    variant={variant}
                    follow={follow}
                    onToggleFollow={() => setFollow((v) => !v)}
                    onPause={trip.pause}
                    onResume={trip.resume}
                    onFinish={trip.finish}
                    onStartReturn={trip.startReturn}
                    hasReturn={Boolean(trip.trip?.inbound)}
                  />
                ) : null}
              </AnimatePresence>
            </div>

            {/* Leyenda */}
            <div className="glass pointer-events-none absolute right-4 bottom-24 z-500 hidden rounded-xl px-3.5 py-3 text-[11px] xl:block">
              <Legend color="#00521F" label="Recorrido realizado" />
              <Legend color="#6FD694" label="Recorrido pendiente" />
              {trip.trip?.inbound ? <Legend color="#1687F8" label="Vuelta" /> : null}
              <Legend color="#CBD5E1" label="Resto de la línea" last />
            </div>
          </div>

          {/* ======================= PANEL DERECHO ======================== */}
          {isDesktop ? (
            <aside className="w-[358px] shrink-0 border-l border-borde bg-white">{panel}</aside>
          ) : null}
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
        {traveling && trip.leg ? (
          <div className="pt-1">
            <TripHUD
              status={trip.status}
              progress={trip.train.progress}
              current={trip.currentStation}
              next={trip.nextStation}
              directionTo={DIRECTIONS[trip.leg.direction].to}
              remaining={remaining}
              variant={variant}
              follow={follow}
              onToggleFollow={() => setFollow((v) => !v)}
              onPause={trip.pause}
              onResume={trip.resume}
              onFinish={trip.finish}
              onStartReturn={trip.startReturn}
              hasReturn={Boolean(trip.trip?.inbound)}
            />
          </div>
        ) : (
          <div className="-mx-4 pb-2">{panel}</div>
        )}
      </MobileSheet>
      ) : null}

      <MobileNav active={section} onNavigate={setSection} />

      <StationDrawer
        station={drawer}
        now={now}
        onClose={() => setDrawer(null)}
        onSetOrigin={(id) => { trip.setOrigin(id); setDrawer(null); setTimeout(calcular, 40); }}
        onSetDestination={(id) => { trip.setDestination(id); setDrawer(null); setTimeout(calcular, 40); }}
      />

      {/* Ficha del tren */}
      <AnimatePresence>
        {trainInfo && trip.leg ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="glass fixed top-24 left-1/2 z-[950] w-[270px] -translate-x-1/2 rounded-2xl p-4"
          >
            <button
              type="button"
              onClick={() => setTrainInfo(false)}
              aria-label="Cerrar"
              className="absolute top-3 right-3 grid size-7 place-items-center rounded-full bg-white/70 text-tinta-suave hover:bg-white"
            >
              <X size={14} />
            </button>
            <p className="flex items-center gap-2 pr-8 text-[14px] font-extrabold tracking-tight">
              <TrainFront size={17} className={variant === "ida" ? "text-verde" : "text-azul"} />
              Tren Línea 1
            </p>
            <dl className="mt-3 space-y-1.5 text-[12.5px]">
              <Row label="Ruta" value={`${trip.leg.from.name} → ${trip.leg.to.name}`} />
              <Row label="Estación actual" value={trip.currentStation.name} />
              <Row label="Avenida" value={trip.currentStation.avenue} />
              <Row label="Dirección" value={DIRECTIONS[trip.leg.direction].to} />
            </dl>
          </motion.div>
        ) : null}
      </AnimatePresence>
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
    <p className={`flex items-center gap-2 font-semibold ${last ? "" : "mb-1.5"}`}>
      <i className="h-1 w-5 rounded-full" style={{ background: color }} />
      {label}
    </p>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-tinta-suave">{label}</dt>
      <dd className="text-right font-bold">{value}</dd>
    </div>
  );
}
