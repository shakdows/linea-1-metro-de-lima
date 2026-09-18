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
  flyTo: (station: Station) => void;
}

interface Props {
  routeStations: Station[];
  outboundStations: Station[];
  inboundStations: Station[] | null;
  position: MotionValue<number>;
  visitedCount: number;
  trainVisible: boolean;
  trainVariant: "ida" | "vuelta";
  originId: string;
  destinationId: string;
  userLocation: { latitude: number; longitude: number } | null;
  nearestId?: string;
  /** Cambiar este número reencuadra el mapa sobre la ruta */
  fitSignal: number;
  /** La cámara sigue al tren mientras circula */
  followTrain: boolean;
  /** Dibuja la ruta progresivamente al calcularla */
  drawSignal: number;
  onSelectStation: (station: Station) => void;
  onTrainClick: () => void;
  onReady?: (handle: MapHandle) => void;
}

const VERDE = "#009B3A";
const VERDE_OSCURO = "#00521F";
const VERDE_CLARO = "#6FD694";
const AZUL = "#1687F8";
const AZUL_OSCURO = "#0B5FC0";
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
  nearestId,
  fitSignal,
  followTrain,
  drawSignal,
  onSelectStation,
  onTrainClick,
  onReady,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);

  const baseLineRef = useRef<Polyline | null>(null);
  const pendingRef = useRef<Polyline | null>(null);
  const travelledRef = useRef<Polyline | null>(null);
  const inboundRef = useRef<Polyline | null>(null);
  const walkRef = useRef<Polyline | null>(null);
  const stationsLayerRef = useRef<LayerGroup | null>(null);
  const avenuesLayerRef = useRef<LayerGroup | null>(null);
  const trainRef = useRef<Marker | null>(null);
  const userRef = useRef<Marker | null>(null);

  const routeRef = useRef(routeStations);
  routeRef.current = routeStations;
  const followRef = useRef(followTrain);
  followRef.current = followTrain;

  const [tilesFailed, setTilesFailed] = useState(false);
  const [zoom, setZoom] = useState(11);
  /* El mapa se crea tras un import dinámico, o sea después del primer render:
     sin este estado los efectos de dibujo correrían con `mapRef` aún vacío. */
  const [mapReady, setMapReady] = useState(false);

  /* -------------------------------------------------- crear el mapa (1 vez) */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;
      leafletRef.current = L;

      const map = L.map(containerRef.current, {
        zoomControl: false,
        scrollWheelZoom: false,
        zoomSnap: 0.25,
      });
      mapRef.current = map;

      /* Cartografía clara y sobria: deja respirar el trazado de la línea */
      const tiles = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          subdomains: "abcd",
          attribution: "© OpenStreetMap · © CARTO",
        },
      );
      tiles.on("tileerror", () => setTilesFailed(true));
      tiles.addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      /* Orden de pintado: resto de línea → pendiente → vuelta → recorrido */
      baseLineRef.current = L.polyline(
        STATIONS.map((s) => [s.latitude, s.longitude] as LatLng),
        { color: GRIS, weight: 4, opacity: 0.85, lineCap: "round" },
      ).addTo(map);

      walkRef.current = L.polyline([], {
        color: "#64748B", weight: 3, dashArray: "2 8", lineCap: "round", opacity: 0.9,
      }).addTo(map);

      inboundRef.current = L.polyline([], {
        color: AZUL, weight: 5, opacity: 0.9, lineCap: "round",
      }).addTo(map);

      pendingRef.current = L.polyline([], {
        color: VERDE_CLARO, weight: 6, opacity: 0.95, lineCap: "round",
      }).addTo(map);

      travelledRef.current = L.polyline([], {
        color: VERDE_OSCURO, weight: 7, opacity: 1, lineCap: "round",
      }).addTo(map);

      avenuesLayerRef.current = L.layerGroup().addTo(map);
      stationsLayerRef.current = L.layerGroup().addTo(map);

      map.fitBounds(
        STATIONS.map((s) => [s.latitude, s.longitude] as LatLng),
        { padding: [50, 50] },
      );
      setZoom(map.getZoom());
      map.on("zoomend", () => setZoom(map.getZoom()));
      setMapReady(true);

      onReady?.({
        fitRoute: () => {
          const pts = routeRef.current.map((s) => [s.latitude, s.longitude] as LatLng);
          if (pts.length) map.flyToBounds(pts, { padding: [100, 100], maxZoom: 13.5, duration: 0.8 });
        },
        fitAll: () =>
          map.flyToBounds(
            STATIONS.map((s) => [s.latitude, s.longitude] as LatLng),
            { padding: [50, 50], duration: 0.8 },
          ),
        flyTo: (station) => map.flyTo([station.latitude, station.longitude], 15, { duration: 0.9 }),
      });
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------------------------- etiquetas de avenida */
  useEffect(() => {
    const L = leafletRef.current;
    const layer = avenuesLayerRef.current;
    if (!L || !layer) return;

    layer.clearLayers();
    if (zoom < 11.5) return;

    AVENUES.forEach((avenue) => {
      const icon = L.divIcon({
        className: "",
        html: `<span class="avenue-pill">${avenue.name}</span>`,
        iconSize: [0, 0],
      });
      L.marker(avenueAnchor(avenue), { icon, interactive: false, keyboard: false }).addTo(layer);
    });
  }, [mapReady, zoom]);

  /* ------------------------------------------- polilíneas: los 3 estados */
  useEffect(() => {
    const toPath = (list: Station[]) => list.map((s) => [s.latitude, s.longitude] as LatLng);

    /* Lo ya recorrido en verde oscuro, lo pendiente en verde claro */
    const done = trainVisible ? routeStations.slice(0, Math.max(1, visitedCount + 1)) : [];
    const pending = trainVisible ? routeStations.slice(Math.max(0, visitedCount)) : outboundStations;

    travelledRef.current?.setLatLngs(done.length > 1 ? toPath(done) : []);
    travelledRef.current?.setStyle({
      color: trainVariant === "ida" ? VERDE_OSCURO : AZUL_OSCURO,
    });
    pendingRef.current?.setLatLngs(toPath(pending));
    pendingRef.current?.setStyle({
      color: trainVisible ? (trainVariant === "ida" ? VERDE_CLARO : "#8AC2FB") : VERDE,
    });
    inboundRef.current?.setLatLngs(
      inboundStations && !(trainVisible && trainVariant === "vuelta") ? toPath(inboundStations) : [],
    );
  }, [mapReady, routeStations, outboundStations, inboundStations, visitedCount, trainVisible, trainVariant]);

  /* -------------------------------- dibujo progresivo al calcular la ruta */
  useEffect(() => {
    const line = pendingRef.current;
    if (!mapReady || !line || drawSignal === 0 || outboundStations.length < 2) return;

    const full = outboundStations.map((s) => [s.latitude, s.longitude] as LatLng);
    let step = 0;
    line.setLatLngs([full[0]]);
    const id = setInterval(() => {
      step += 1;
      line.setLatLngs(full.slice(0, step + 1));
      if (step >= full.length - 1) clearInterval(id);
    }, Math.max(28, 420 / full.length));
    return () => clearInterval(id);
  }, [mapReady, drawSignal, outboundStations]);

  /* --------------------------------------------- marcadores de estación */
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const layer = stationsLayerRef.current;
    if (!L || !map || !layer) return;

    layer.clearLayers();
    const routeIds = new Set(routeStations.map((s) => s.id));
    const visitedIds = new Set(
      trainVisible ? routeStations.slice(0, visitedCount).map((s) => s.id) : [],
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
        station.id === nearestId ? "is-nearest" : "",
      ].filter(Boolean).join(" ");

      const key = isOrigin || isDestination || isCurrent || station.terminal;
      const showLabel = key || (inRoute && zoom >= 12.5) || zoom >= 14;
      const label = showLabel
        ? `<span class="station-label ${inRoute ? "is-route" : ""} ${key ? "is-key" : ""}">${station.name}</span>`
        : "";

      /* Tarjeta con fotografía al pasar el puntero */
      const card = `
        <span class="station-card">
          ${station.image ? `<img src="${station.image}" alt="" loading="lazy" />` : ""}
          <span class="station-card__body">
            <b>${station.name}</b>
            <i>${station.avenue}</i>
          </span>
        </span>`;

      const icon = L.divIcon({
        className: "",
        html: `<span class="station-pin">${card}<span class="${classes}">${
          visited && !isCurrent ? "<i class='tick'></i>" : ""
        }</span>${label}</span>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      L.marker([station.latitude, station.longitude], {
        icon, title: station.name, riseOnHover: true,
      })
        .addTo(layer)
        .on("click", () => onSelectStation(station));
    });
  }, [
    mapReady, routeStations, visitedCount, trainVisible, trainVariant,
    originId, destinationId, nearestId, zoom, onSelectStation,
  ]);

  /* ---------------------------------------------------- tren en el mapa */
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
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });
        trainRef.current = L.marker(here, { icon, zIndexOffset: 1200, riseOnHover: true })
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

      /* Cámara acompañando al tren. La primera vez acerca; después solo
         desplaza, para no pelear con el gesto del usuario. */
      if (followRef.current) {
        if (map.getZoom() < 13.6) map.flyTo(here, 14.5, { duration: 0.9 });
        else map.panTo(here, { animate: true, duration: 0.5, easeLinearity: 0.4 });
      }
    };

    render(position.get());
    const unsubscribe = position.on("change", render);
    return () => unsubscribe();
  }, [mapReady, routeStations, trainVisible, trainVariant, position, onTrainClick]);

  /* ------------------------------------------- ubicación y ruta a pie */
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    userRef.current?.remove();
    userRef.current = null;
    walkRef.current?.setLatLngs([]);
    if (!userLocation) return;

    const icon = L.divIcon({ className: "", html: `<span class="user-dot"></span>`, iconSize: [20, 20], iconAnchor: [10, 10] });
    userRef.current = L.marker([userLocation.latitude, userLocation.longitude], { icon, zIndexOffset: 900 })
      .addTo(map)
      .bindTooltip("Estás aquí", { direction: "top", offset: [0, -12] });

    const near = STATIONS.find((s) => s.id === nearestId);
    if (near) {
      walkRef.current?.setLatLngs([
        [userLocation.latitude, userLocation.longitude],
        [near.latitude, near.longitude],
      ]);
    }
  }, [mapReady, userLocation, nearestId]);

  /* ---------------------------------------------- reencuadre de la ruta */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || fitSignal === 0 || routeStations.length === 0) return;
    map.flyToBounds(
      routeStations.map((s) => [s.latitude, s.longitude] as LatLng),
      { padding: [100, 100], maxZoom: 13.5, duration: 0.85 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitSignal]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {tilesFailed ? (
        <p className="pointer-events-none absolute inset-x-0 bottom-4 z-500 mx-auto w-fit rounded-full bg-white/95 px-3.5 py-1.5 text-[11.5px] font-semibold text-tinta-suave shadow-suave">
          Sin conexión al mapa base: el trazado y las estaciones siguen funcionando.
        </p>
      ) : null}
    </div>
  );
}
