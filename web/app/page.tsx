"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Locate, Maximize2, TrainFront, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Sidebar, type SectionId } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TripPlanner } from "@/components/TripPlanner";
import { StationPopup } from "@/components/StationPopup";
import { TripControls } from "@/components/TripControls";
import { TripProgress } from "@/components/TripProgress";
import { RoutePanel } from "@/components/RoutePanel";
import { AvenueToast } from "@/components/AvenueToast";
import { AIChat, CrowdingChart, MetroCard, NextTrains, ServiceAlerts } from "@/components/SidePanels";
import { Card } from "@/components/Card";
import { BottomSheet } from "@/components/BottomSheet";

import { useTrip } from "@/hooks/useTrip";
import { useGeolocation } from "@/hooks/useGeolocation";
import { DIRECTIONS, type Station } from "@/data/stations";
import { hhmm12 } from "@/lib/trip";
import type { MapHandle } from "@/components/MetroMap";

/* Leaflet toca el DOM, así que el mapa solo se carga en el navegador */
const MetroMap = dynamic(() => import("@/components/MetroMap"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-[#eef2f0] text-[13px] text-tinta-suave">
      Cargando el mapa…
    </div>
  ),
});

/**
 * El sitio se exporta como HTML estático, así que el marcado se genera en el
 * build con una hora distinta a la del visitante. Para que el primer render
 * del cliente coincida con ese HTML y no falle la hidratación, el reloj
 * arranca en una hora fija y se pone en hora ya montado.
 */
const CLOCK_FALLBACK = new Date(2026, 0, 1, 9, 30, 0);

export default function Page() {
  const [section, setSection] = useState<SectionId>("inicio");
  const [now, setNow] = useState<Date>(CLOCK_FALLBACK);
  const [fitSignal, setFitSignal] = useState(0);
  const [popup, setPopup] = useState<{ station: Station; point: { x: number; y: number } } | null>(null);
  const [trainInfo, setTrainInfo] = useState(false);
  const mapHandle = useRef<MapHandle | null>(null);

  const trip = useTrip();
  const geo = useGeolocation();

  /* Ya en el navegador, el reloj se pone en hora y avanza cada 30 s:
     los próximos trenes son función de la hora. */
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const travelling =
    trip.status === "traveling" ||
    trip.status === "returning" ||
    trip.status === "paused" ||
    trip.status === "station-stop" ||
    trip.status === "completed" ||
    trip.status === "return-ready" ||
    trip.status === "finished";

  const variant: "ida" | "vuelta" = trip.activeLeg === "outbound" ? "ida" : "vuelta";
  const routeStations = trip.leg?.stations ?? [];

  const remainingMinutes = useMemo(() => {
    if (!trip.leg) return 0;
    const done = trip.train.currentStop / Math.max(1, trip.leg.stops - 1);
    return Math.max(0, Math.round(trip.leg.minutes * (1 - done)));
  }, [trip.leg, trip.train.currentStop]);

  const handleCalculate = useCallback(() => {
    trip.calculate();
    setTimeout(() => setFitSignal((n) => n + 1), 460);
  }, [trip]);

  const handleSelectStation = useCallback((station: Station, point: { x: number; y: number }) => {
    setPopup({ station, point });
  }, []);

  const handleTrainClick = useCallback(() => setTrainInfo(true), []);

  /* Al aceptar la geolocalización, la estación más cercana pasa a ser el origen */
  useEffect(() => {
    if (geo.status === "ready" && geo.result) {
      trip.setOrigin(geo.result.nearest.station.id);
      setFitSignal((n) => n + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.status]);

  return (
    <div className="flex min-h-screen">
      <Sidebar active={section} onNavigate={setSection} />

      <div className="flex min-w-0 flex-1 flex-col pb-[190px] lg:pb-0">
        <Header
          onPickStation={(id) => {
            trip.setOrigin(id);
            setFitSignal((n) => n + 1);
          }}
          onOpenMenu={() => setSection("mapa")}
        />

        <main className="mx-auto w-full max-w-[1400px] space-y-4 p-4 lg:p-6">
          <Hero />

          <TripPlanner
            origin={trip.originId}
            destination={trip.destinationId}
            mode={trip.mode}
            departure={`Hoy, ${hhmm12(now)}`}
            searching={trip.calculating}
            onOrigin={trip.setOrigin}
            onDestination={trip.setDestination}
            onMode={trip.setMode}
            onSwap={trip.swap}
            onSearch={handleCalculate}
          />

          {/* ============================ MAPA ============================ */}
          <Card className="overflow-hidden p-0">
            <div className="flex flex-wrap items-center gap-3 border-b border-borde px-5 py-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-verde-claro text-verde">
                <TrainFront size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-[15px] font-bold tracking-tight">
                  Mapa interactivo de la <span className="text-verde">Línea 1</span>
                </h2>
                <p className="text-[12.5px] text-tinta-suave">
                  Toca cualquier estación para elegirla, y sigue el tren durante el viaje.
                </p>
              </div>

              <button
                type="button"
                onClick={geo.locate}
                disabled={geo.status === "locating"}
                className="inline-flex items-center gap-2 rounded-xl border border-borde bg-white px-3.5 py-2.5 text-[12.5px] font-bold text-tinta-suave transition-colors hover:border-verde hover:text-verde disabled:opacity-60"
              >
                <Locate size={15} />
                {geo.status === "locating" ? "Buscando…" : "Mi ubicación"}
              </button>

              <button
                type="button"
                onClick={() => mapHandle.current?.fitAll()}
                className="inline-flex items-center gap-2 rounded-xl border border-borde bg-white px-3.5 py-2.5 text-[12.5px] font-bold text-tinta-suave transition-colors hover:border-verde hover:text-verde"
              >
                <Maximize2 size={15} /> Ver toda la línea
              </button>
            </div>

            {geo.status === "ready" && geo.result ? (
              <p className="border-b border-borde bg-verde-claro px-5 py-2.5 text-[12.5px] font-semibold text-verde-oscuro">
                Estación más cercana: <strong>{geo.result.nearest.station.name}</strong> ·{" "}
                {geo.result.nearest.meters} m · {geo.result.nearest.walkMinutes} min caminando
              </p>
            ) : null}
            {geo.status === "error" ? (
              <p className="border-b border-borde bg-amber-50 px-5 py-2.5 text-[12.5px] font-semibold text-amber-800">
                {geo.error}
              </p>
            ) : null}

            <div className="relative h-[380px] sm:h-[460px] lg:h-[520px]">
              <MetroMap
                routeStations={routeStations}
                outboundStations={trip.trip?.outbound.stations ?? []}
                inboundStations={trip.trip?.inbound?.stations ?? null}
                position={trip.train.position}
                visitedCount={trip.train.currentStop}
                trainVisible={travelling}
                trainVariant={variant}
                originId={trip.originId}
                destinationId={trip.destinationId}
                userLocation={geo.result}
                fitSignal={fitSignal}
                onSelectStation={handleSelectStation}
                onTrainClick={handleTrainClick}
                onReady={(h) => {
                  mapHandle.current = h;
                }}
              />

              <AvenueToast
                avenue={trip.currentStation?.avenue ?? null}
                active={trip.status === "traveling" || trip.status === "returning" || trip.status === "station-stop"}
              />

              {/* Leyenda */}
              <div className="pointer-events-none absolute right-3 bottom-8 z-[500] rounded-xl border border-borde bg-white/95 px-3.5 py-3 text-[11.5px] shadow-media backdrop-blur">
                <p className="mb-1.5 flex items-center gap-2 font-semibold">
                  <i className="size-2.5 rounded-full bg-verde" /> Recorrido de ida
                  {trip.trip ? (
                    <span className="text-tinta-suave">
                      ({trip.trip.outbound.from.name} → {trip.trip.outbound.to.name})
                    </span>
                  ) : null}
                </p>
                {trip.trip?.inbound ? (
                  <p className="mb-1.5 flex items-center gap-2 font-semibold">
                    <i className="size-2.5 rounded-full bg-azul" /> Recorrido de vuelta
                    <span className="text-tinta-suave">
                      ({trip.trip.inbound.from.name} → {trip.trip.inbound.to.name})
                    </span>
                  </p>
                ) : null}
                <p className="flex items-center gap-2 font-semibold text-tinta-suave">
                  <i className="size-2.5 rounded-full bg-inactivo" /> Resto de la línea
                </p>
              </div>
            </div>
          </Card>

          {/* ======================= VIAJE Y RUTAS ======================== */}
          <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr_1fr]">
            <div className="hidden lg:block">
            <TripProgress
              status={trip.status}
              progress={trip.train.progress}
              currentStation={trip.currentStation}
              nextStation={trip.nextStation}
              directionTo={trip.leg ? DIRECTIONS[trip.leg.direction].to : "—"}
              remainingMinutes={remainingMinutes}
              variant={variant}
            >
              <TripControls
                status={trip.status}
                hasReturn={Boolean(trip.trip?.inbound)}
                onStart={trip.startJourney}
                onPause={trip.pause}
                onResume={trip.resume}
                onFinish={trip.finish}
                onRestart={trip.restart}
                onStartReturn={trip.startReturn}
              />
            </TripProgress>
            </div>

            {trip.trip ? (
              <RoutePanel
                leg={trip.trip.outbound}
                variant="ida"
                visitedCount={trip.activeLeg === "outbound" ? trip.train.currentStop : trip.trip.outbound.stops - 1}
                travelling={travelling}
                walkMinutes={trip.trip.walkMinutes}
              />
            ) : null}

            {trip.trip?.inbound ? (
              <RoutePanel
                leg={trip.trip.inbound}
                variant="vuelta"
                visitedCount={trip.activeLeg === "inbound" ? trip.train.currentStop : 0}
                travelling={trip.activeLeg === "inbound" && travelling}
                walkMinutes={trip.trip.walkMinutes}
              />
            ) : (
              <Card className="grid place-items-center p-6 text-center text-[13px] text-tinta-suave">
                Elige <strong className="mx-1 text-tinta">Ida y vuelta</strong> en el planificador para
                ver también el trayecto de regreso.
              </Card>
            )}
          </div>

          {/* ===================== PANELES DE SERVICIO ==================== */}
          <div className="grid gap-4 lg:grid-cols-[minmax(340px,1fr)_1.35fr]">
            <NextTrains station={trip.origin} now={now} />
            <CrowdingChart now={now} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <MetroCard />
            <ServiceAlerts />
            <AIChat />
          </div>

          <p className="pb-2 text-center text-[11.5px] text-tinta-suave">
            Interfaz conceptual para fines académicos. No representa el sitio oficial de Línea 1.
            Las coordenadas son aproximadas y los tiempos, estimaciones.
          </p>
        </main>
      </div>

      <BottomSheet
        summary={
          <span className="block">
            <span className="block text-[13px] font-extrabold tracking-tight">
              {trip.origin.name} → {trip.destination.name}
            </span>
            <span className="block text-[11.5px] text-tinta-suave">
              {trip.leg ? `${trip.leg.stops} paradas · ${trip.leg.minutes} min` : "Elige tu ruta"}
              {travelling ? ` · ${trip.currentStation.name}` : ""}
            </span>
          </span>
        }
      >
        <TripProgress
          status={trip.status}
          progress={trip.train.progress}
          currentStation={trip.currentStation}
          nextStation={trip.nextStation}
          directionTo={trip.leg ? DIRECTIONS[trip.leg.direction].to : "—"}
          remainingMinutes={remainingMinutes}
          variant={variant}
        >
          <TripControls
            status={trip.status}
            hasReturn={Boolean(trip.trip?.inbound)}
            onStart={trip.startJourney}
            onPause={trip.pause}
            onResume={trip.resume}
            onFinish={trip.finish}
            onRestart={trip.restart}
            onStartReturn={trip.startReturn}
          />
        </TripProgress>
      </BottomSheet>

      <MobileNav active={section} onNavigate={setSection} />

      <StationPopup
        station={popup?.station ?? null}
        point={popup?.point ?? null}
        now={now}
        onClose={() => setPopup(null)}
        onSetOrigin={(id) => {
          trip.setOrigin(id);
          setPopup(null);
          setFitSignal((n) => n + 1);
        }}
        onSetDestination={(id) => {
          trip.setDestination(id);
          setPopup(null);
          setFitSignal((n) => n + 1);
        }}
      />

      {/* Ficha del tren, al pulsarlo en el mapa */}
      <AnimatePresence>
        {trainInfo && trip.leg ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed right-4 bottom-[86px] z-[950] w-[264px] rounded-2xl border border-borde bg-white p-4 shadow-alta lg:bottom-6"
          >
            <button
              type="button"
              onClick={() => setTrainInfo(false)}
              aria-label="Cerrar"
              className="absolute top-3 right-3 grid size-7 place-items-center rounded-full bg-fondo text-tinta-suave hover:bg-borde"
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-tinta-suave">{label}</dt>
      <dd className="text-right font-bold">{value}</dd>
    </div>
  );
}
