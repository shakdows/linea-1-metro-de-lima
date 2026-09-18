"use client";

import { useMemo } from "react";
import { STATIONS } from "@/data/stations";

const ANCHO = 360;
const ALTO = 640;
const MARGEN = 46;

/**
 * La línea real proyectada a un SVG: no es un adorno inventado, son las 26
 * estaciones con sus coordenadas. El tren recorre el mismo trazado.
 */
export function LineaDiagrama({ className }: { className?: string }) {
  const { puntos, d, destacadas } = useMemo(() => {
    const lats = STATIONS.map((s) => s.latitude);
    const lngs = STATIONS.map((s) => s.longitude);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);

    /* El sur queda abajo, así que la latitud se invierte respecto al eje Y */
    const puntos = STATIONS.map((s) => ({
      id: s.id,
      name: s.name,
      terminal: !!s.terminal,
      x: MARGEN + ((s.longitude - minLng) / (maxLng - minLng)) * (ANCHO - MARGEN * 2),
      y: ALTO - MARGEN - ((s.latitude - minLat) / (maxLat - minLat)) * (ALTO - MARGEN * 2),
    }));

    return {
      puntos,
      d: puntos.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "),
      destacadas: puntos.filter((p) => p.terminal || ["gamarra", "la-cultura"].includes(p.id)),
    };
  }, []);

  return (
    <svg
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      className={className}
      role="img"
      aria-label="Trazado de la Línea 1 con sus 26 estaciones"
    >
      <defs>
        <linearGradient id="linea-grad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#009B3A" stopOpacity="0.35" />
          <stop offset="55%" stopColor="#009B3A" />
          <stop offset="100%" stopColor="#3ddc84" />
        </linearGradient>
        <path id="linea-trazo" d={d} />
      </defs>

      <path d={d} fill="none" stroke="#009B3A" strokeOpacity="0.16" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke="url(#linea-grad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      {puntos.map((p) => (
        <circle
          key={p.id}
          cx={p.x}
          cy={p.y}
          r={p.terminal ? 5.5 : 3.2}
          fill={p.terminal ? "#ffffff" : "#081812"}
          stroke={p.terminal ? "#009B3A" : "#ffffff"}
          strokeWidth={p.terminal ? 3 : 1.6}
          strokeOpacity={p.terminal ? 1 : 0.55}
        />
      ))}

      {/* Las etiquetas se giran hacia dentro cuando la estación cae al borde */}
      {destacadas.map((p) => {
        const derecha = p.x > ANCHO * 0.55;
        return (
          <text
            key={`t-${p.id}`}
            x={derecha ? p.x - 12 : p.x + 12}
            y={p.y + 4}
            textAnchor={derecha ? "end" : "start"}
            fill="#ffffff"
            fillOpacity="0.5"
            fontSize="11"
            fontWeight="500"
          >
            {p.name}
          </text>
        );
      })}

      {/* El tren recorre el trazado de extremo a extremo, ida y vuelta */}
      <g>
        <circle r="7" fill="#3ddc84" fillOpacity="0.28" />
        <circle r="3.6" fill="#ffffff" />
        <animateMotion
          dur="16s"
          repeatCount="indefinite"
          keyPoints="0;1;1;0;0"
          keyTimes="0;0.45;0.5;0.95;1"
          calcMode="linear"
        >
          <mpath href="#linea-trazo" />
        </animateMotion>
      </g>
    </svg>
  );
}
