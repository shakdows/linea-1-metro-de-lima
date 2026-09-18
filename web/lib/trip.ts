import {
  CROWDING,
  DIRECTIONS,
  HEADWAY,
  LINE,
  STATIONS,
  type Direction,
  type Station,
  indexOfStation,
} from "@/data/stations";

export type TripMode = "ida" | "ida-vuelta";

export interface Leg {
  /** Estaciones del tramo, en el orden en que las recorre el tren */
  stations: Station[];
  /** Índices dentro de STATIONS, en el orden del recorrido */
  indexes: number[];
  from: Station;
  to: Station;
  direction: Direction;
  /** Minutos a bordo */
  minutes: number;
  /** Número de estaciones del recorrido, incluyendo origen y destino */
  stops: number;
}

export interface Trip {
  origin: Station;
  destination: Station;
  mode: TripMode;
  outbound: Leg;
  inbound: Leg | null;
  walkMinutes: number;
  fare: number;
}

/**
 * Construye un tramo entre dos índices. La dirección se deduce del orden:
 * si el destino está más al norte, el tren va hacia Bayóvar; si no, hacia
 * Villa El Salvador, y el recorrido se recorre en sentido inverso.
 */
export function buildLeg(originIndex: number, destinationIndex: number): Leg {
  const direction: Direction = destinationIndex > originIndex ? "norte" : "sur";
  const low = Math.min(originIndex, destinationIndex);
  const high = Math.max(originIndex, destinationIndex);

  const slice = STATIONS.slice(low, high + 1);
  const stations = direction === "norte" ? slice : [...slice].reverse();
  const indexes = stations.map((s) => s.index);

  /* El tiempo de cada tramo está guardado en la estación de llegada, por eso
     se suma siempre sobre el rango, sea cual sea el sentido de la marcha. */
  let minutes = 0;
  for (let i = low + 1; i <= high; i++) minutes += STATIONS[i].estimatedTime;

  return {
    stations,
    indexes,
    from: stations[0],
    to: stations[stations.length - 1],
    direction,
    minutes: Math.max(1, Math.round(minutes)),
    stops: stations.length,
  };
}

export function buildTrip(
  originId: string,
  destinationId: string,
  mode: TripMode,
): Trip | null {
  const originIndex = indexOfStation(originId);
  const destinationIndex = indexOfStation(destinationId);
  if (originIndex < 0 || destinationIndex < 0 || originIndex === destinationIndex) {
    return null;
  }

  const outbound = buildLeg(originIndex, destinationIndex);
  const inbound = mode === "ida-vuelta" ? buildLeg(destinationIndex, originIndex) : null;

  return {
    origin: STATIONS[originIndex],
    destination: STATIONS[destinationIndex],
    mode,
    outbound,
    inbound,
    walkMinutes: LINE.walkMinutes,
    fare: LINE.fare,
  };
}

export const directionLabel = (d: Direction) => DIRECTIONS[d].to;

/* ------------------------------------------------------------- frecuencia */

export function headwayAt(now: Date) {
  return HEADWAY[now.getHours()] ?? 10;
}

/**
 * Próximos trenes SIMULADOS. Determinístico: la misma estación, sentido y
 * minuto del día producen siempre el mismo resultado, de modo que la interfaz
 * no «salta» entre renders.
 */
export function nextTrains(
  stationIndex: number,
  direction: Direction,
  count = 3,
  now = new Date(),
) {
  const headway = headwayAt(now);
  const offset = (stationIndex * 37 + (direction === "norte" ? 11 : 23)) % headway;
  const minuteOfDay = now.getHours() * 60 + now.getMinutes();
  const base = headway - ((minuteOfDay + offset) % headway);

  return Array.from({ length: count }, (_, i) => {
    const minutes = base + i * headway;
    return {
      minutes,
      at: new Date(now.getTime() + minutes * 60_000),
      status: minutes <= 1 ? "En plataforma" : i === 0 ? "Llegando" : "En camino",
    };
  });
}

/* -------------------------------------------------------------- afluencia */

export type CrowdKey = "bajo" | "medio" | "alto" | "muy-alto" | "cerrado";

export const CROWD_COLORS: Record<CrowdKey, string> = {
  bajo: "#22c55e",
  medio: "#f5b82e",
  alto: "#f07c1f",
  "muy-alto": "#e5484d",
  cerrado: "#cbd5e1",
};

export function crowdingLevel(hour: number): {
  key: CrowdKey;
  label: string;
  value: number;
} {
  const value = CROWDING[hour];
  if (value == null) return { key: "cerrado", label: "Sin servicio", value: 0 };
  if (value >= 85) return { key: "muy-alto", label: "Muy alta", value };
  if (value >= 70) return { key: "alto", label: "Alta", value };
  if (value >= 45) return { key: "medio", label: "Media", value };
  return { key: "bajo", label: "Baja", value };
}

/**
 * Mejor franja del día. Se excluyen la primera y la última hora de servicio:
 * tienen poca gente, pero son malas recomendaciones porque el servicio está
 * por abrir o por cerrar.
 */
export function bestSlot() {
  const hours = Object.keys(CROWDING).map(Number).sort((a, b) => a - b);
  const candidates = hours.slice(1, -1);
  const hour = candidates.reduce((best, h) => (CROWDING[h] < CROWDING[best] ? h : best), candidates[0]);
  const pad = (n: number) => String(n).padStart(2, "0");
  return { hour, label: `${pad(hour)}:15 – ${pad(hour + 1)}:30` };
}

/* ----------------------------------------------------------------- tiempo */

/**
 * El formato de hora se construye a mano en lugar de con toLocaleTimeString:
 * Node y el navegador usan separadores distintos antes de «a. m.» (espacio
 * normal frente a espacio fino), y esa diferencia rompía la hidratación del
 * HTML exportado estáticamente.
 */
const pad = (n: number) => String(n).padStart(2, "0");

export const hhmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export const hhmm12 = (d: Date) => {
  const h = d.getHours();
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad(d.getMinutes())} ${h < 12 ? "a. m." : "p. m."}`;
};

export const addMinutes = (d: Date, m: number) => new Date(d.getTime() + m * 60_000);
