"use client";

import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, Marker, Polyline, LayerGroup } from "leaflet";
import type { MotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { AVENUES, avenueAnchor, interpolate, bearing, type LatLng } from "@/data/route";
import { STATIONS, type Station } from "@/data/stations";

export interface MapHandle {
  fitRoute: () => void;
  fitAll: () => void;
}

interface Props {
  /** Estaciones del tramo activo, en orden de recorrido */
  routeStations: Station[];
  /** Estaciones del tramo de ida (verde) */
  outboundStations: Station[];
  /** Estaciones del tramo de vuelta (azul), o null si es solo ida */
  inboundStations: Station[] | null;
  /** Índice fraccional del tren dentro del tramo activo */
  position: MotionValue<number>;
  /** Índice de la última estación alcanzada, para pintar lo ya recorrido */
  visitedCount: number;
  trainVisible: boolean;
  trainVariant: "ida" | "vuelta";
  originId: string;
  destinationId: string;
  userLocation: { latitude: number; longitude: number } | null;
  /** Cambiar este número reencuadra el mapa sobre la ruta */
  fitSignal: number;
  onSelectStation: (station: Station, point: { x: number; y: number }) => void;
  onTrainClick: () => void;
  onReady?: (handle: MapHandle) => void;
}

const VERDE = "#009B3A";
const VERDE_OSCURO = "#006B2C";
const AZUL = "#1687F8";
const GRIS = "#CBD5E1";

export default function MetroMap({
  routeStations,
  outboundStations,
  inboundStations,
  position,
  visitedCount,
  trainVisible,
  trainVariant,
  originId,
  destinationId,
  userLocation,
  fitSignal,
  onSelectStation,
  onTrainClick,
  onReady,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);

  const baseLineRef = useRef<Polyline | null>(null);
  const outboundRef = useRef<Polyline | null>(null);
  const inboundRef = useRef<Polyline | null>(null);
  const travelledRef = useRef<Polyline | null>(null);
  const stationsLayerRef = useRef<LayerGroup | null>(null);
  const avenuesLayerRef = useRef<LayerGroup | null>(null);
  const trainRef = useRef<Marker | null>(null);
  const userRef = useRef<Marker | null>(null);

  const [tilesFailed, setTilesFailed] = useState(false);
  const [zoom, setZoom] = useState(11);

  /* ------------------------------------------------- crear el mapa una vez */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;
      leafletRef.current = L;

      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: false,
      });
      mapRef.current = map;

      const tiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "© colaboradores de OpenStreetMap",
      });
      tiles.on("tileerror", () => setTilesFailed(true));
      tiles.addTo(map);

      L.control.zoom({ position: "topright" }).addTo(map);
      setZoom(map.getZoom());
      map.on("zoomend", () => setZoom(map.getZoom()));

      /* Línea completa en gris, siempre visible por debajo */
      baseLineRef.current = L.polyline(
        STATIONS.map((s) => [s.latitude, s.longitude] as LatLng),
        { color: GRIS, weight: 5, opacity: 0.9, lineCap: "round" },
      ).addTo(map);

      inboundRef.current = L.polyline([], {
        color: AZUL,
        weight: 5,
        opacity: 0.95,
        lineCap: "round",
        offset: 0,
      } as never).addTo(map);

      outboundRef.current = L.polyline([], {
        color: VERDE,
        weight: 6,
        opacity: 0.95,
        lineCap: "round",
      }).addTo(map);

      /* Tramo ya recorrido, por encima del resto */
      travelledRef.current = L.polyline([], {
        color: VERDE_OSCURO,
        weight: 7,
        opacity: 1,
        lineCap: "round",
      }).addTo(map);

      avenuesLayerRef.current = L.layerGroup().addTo(map);
      stationsLayerRef.current = L.layerGroup().addTo(map);

      map.fitBounds(
        STATIONS.map((s) => [s.latitude, s.longitude] as LatLng),
        { padding: [40, 40] },
      );

      onReady?.({
        fitRoute: () => {
          const pts = routeStations.map((s) => [s.latitude, s.longitude] as LatLng);
          if (pts.length) map.fitBounds(pts, { padding: [90, 90], maxZoom: 13.5 });
        },
        fitAll: () =>
          map.fitBounds(
            STATIONS.map((s) => [s.latitude, s.longitude] as LatLng),
            { padding: [40, 40] },
          ),
      });
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------------------- etiquetas de avenida (1 vez) */
  useEffect(() => {
    const L = leafletRef.current;
    const layer = avenuesLayerRef.current;
    if (!L || !layer) return;

    layer.clearLayers();
    AVENUES.forEach((avenue) => {
      const icon = L.divIcon({
        className: "",
        html: `<span class="avenue-pill">${avenue.name}</span>`,
        iconSize: [0, 0],
      });
      L.marker(avenueAnchor(avenue), { icon, interactive: false, keyboard: false }).addTo(layer);
    });
  }, [tilesFailed]);

  /* ------------------------------------------------ polilíneas de la ruta */
  useEffect(() => {
    const toPath = (list: Station[]) => list.map((s) => [s.latitude, s.longitude] as LatLng);
    outboundRef.current?.setLatLngs(toPath(outboundStations));
    inboundRef.current?.setLatLngs(inboundStations ? toPath(inboundStations) : []);
  }, [outboundStations, inboundStations]);

  /* --------------------------------------------------- tramo ya recorrido */
  useEffect(() => {
    const travelled = travelledRef.current;
    if (!travelled) return;
    if (!trainVisible || visitedCount < 1) {
      travelled.setLatLngs([]);
      return;
    }
    travelled.setLatLngs(
      routeStations
        .slice(0, visitedCount + 1)
        .map((s) => [s.latitude, s.longitude] as LatLng),
    );
    travelled.setStyle({ color: trainVariant === "ida" ? VERDE_OSCURO : "#0b63c5" });
  }, [routeStations, visitedCount, trainVisible, trainVariant]);

  /* ---------------------------------------------- marcadores de estación */
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const layer = stationsLayerRef.current;
    if (!L || !map || !layer) return;

    layer.clearLayers();
    const routeIds = new Set(routeStations.map((s) => s.id));
    const visitedIds = new Set(
      trainVisible ? routeStations.slice(0, visitedCount + 1).map((s) => s.id) : [],
    );
    const currentId = trainVisible ? routeStations[visitedCount]?.id : undefined;

    STATIONS.forEach((station) => {
      const inRoute = routeIds.has(station.id);
      const isOrigin = station.id === originId;
      const isDestination = station.id === destinationId;
      const visited = visitedIds.has(station.id);
      const isCurrent = station.id === currentId;

      const classes = [
        "station-dot",
        inRoute ? "is-route" : "is-idle",
        trainVariant === "vuelta" && inRoute ? "is-return" : "",
        isOrigin ? "is-origin" : "",
        isDestination ? "is-destination" : "",
        visited ? "is-visited" : "",
        isCurrent ? "is-current" : "",
        station.terminal ? "is-terminal" : "",
      ]
        .filter(Boolean)
        .join(" ");

      /* Con muchas estaciones juntas las etiquetas se solapan, así que solo
         se rotulan las relevantes y, al acercar el mapa, todas las de la ruta. */
      const alwaysLabelled = isOrigin || isDestination || isCurrent || station.terminal;
      const showLabel = alwaysLabelled || (inRoute && zoom >= 13.5) || zoom >= 14.5;
      const label = showLabel
        ? `<span class="station-label ${inRoute ? "is-route" : ""} ${alwaysLabelled ? "is-key" : ""}">${station.name}</span>`
        : "";

      const icon = L.divIcon({
        className: "",
        html: `<span class="${classes}">${visited && !isCurrent ? "<i class='tick'></i>" : ""}</span>${label}`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const marker = L.marker([station.latitude, station.longitude], {
        icon,
        title: station.name,
        riseOnHover: true,
      }).addTo(layer);

      marker.on("click", () => {
        const p = map.latLngToContainerPoint([station.latitude, station.longitude]);
        const rect = containerRef.current!.getBoundingClientRect();
        onSelectStation(station, { x: rect.left + p.x, y: rect.top + p.y });
      });
    });
  }, [
    routeStations,
    visitedCount,
    trainVisible,
    trainVariant,
    originId,
    destinationId,
    zoom,
    onSelectStation,
  ]);

  /* ------------------------------------------------------ tren en el mapa */
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    if (!trainVisible || routeStations.length < 2) {
      trainRef.current?.remove();
      trainRef.current = null;
      return;
    }

    const render = (pos: number) => {
      const here = interpolate(routeStations, pos);
      const ahead = interpolate(routeStations, Math.min(routeStations.length - 1, pos + 0.08));
      const angle = bearing(here, ahead);

      if (!trainRef.current) {
        const icon = L.divIcon({
          className: "",
          html: `<span class="train-pin ${trainVariant}" style="--angle:${angle}deg">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
                        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                     <rect x="4" y="3" width="16" height="13" rx="4"/>
                     <path d="M4 11h16M8 20l-2 2M16 20l2 2"/>
                   </svg>
                 </span>`,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        });
        trainRef.current = L.marker(here, { icon, zIndexOffset: 1000, riseOnHover: true })
          .addTo(map)
          .on("click", onTrainClick);
      } else {
        trainRef.current.setLatLng(here);
        const el = trainRef.current.getElement()?.querySelector(".train-pin") as HTMLElement | null;
        if (el) {
          el.style.setProperty("--angle", `${angle}deg`);
          el.className = `train-pin ${trainVariant}`;
        }
      }
    };

    render(position.get());
    /* El tren se mueve suscrito al MotionValue: sin renders de React por frame */
    const unsubscribe = position.on("change", render);
    return () => unsubscribe();
  }, [routeStations, trainVisible, trainVariant, position, onTrainClick]);

  /* -------------------------------------------------- ubicación del usuario */
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    userRef.current?.remove();
    userRef.current = null;
    if (!userLocation) return;

    const icon = L.divIcon({
      className: "",
      html: `<span class="user-dot"></span>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
    userRef.current = L.marker([userLocation.latitude, userLocation.longitude], { icon })
      .addTo(map)
      .bindTooltip("Estás aquí");
  }, [userLocation]);

  /* ------------------------------------------------- reencuadre de la ruta */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || fitSignal === 0 || routeStations.length === 0) return;
    map.fitBounds(
      routeStations.map((s) => [s.latitude, s.longitude] as LatLng),
      { padding: [90, 90], maxZoom: 13.5 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitSignal]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {tilesFailed ? (
        <p className="pointer-events-none absolute inset-x-0 bottom-3 z-[500] mx-auto w-fit rounded-full bg-white/95 px-3.5 py-1.5 text-[11.5px] font-semibold text-tinta-suave shadow-suave">
          Sin conexión al mapa base: el trazado y las estaciones siguen funcionando.
        </p>
      ) : null}
    </div>
  );
}
