import { STATIONS, type Station } from "./stations";

export type LatLng = [number, number];

/** Trazado completo de la Línea 1, de Villa El Salvador a Bayóvar */
export const LINE_PATH: LatLng[] = STATIONS.map((s) => [s.latitude, s.longitude]);

/**
 * Avenidas principales del recorrido. Cada una se ancla al punto medio de
 * las estaciones que la recorren, que es donde se dibuja su etiqueta.
 */
export interface Avenue {
  id: string;
  name: string;
  stationIds: string[];
}

export const AVENUES: Avenue[] = [
  { id: "separadora", name: "Av. Separadora Industrial", stationIds: ["villa-el-salvador", "parque-industrial"] },
  { id: "pumacahua", name: "Av. Pumacahua", stationIds: ["pumacahua"] },
  { id: "pachacutec", name: "Av. Pachacútec", stationIds: ["villa-maria", "maria-auxiliadora"] },
  { id: "heroes", name: "Av. Los Héroes", stationIds: ["san-juan", "atocongo"] },
  { id: "marsano", name: "Av. Tomás Marsano", stationIds: ["jorge-chavez", "ayacucho"] },
  { id: "aviacion", name: "Av. Aviación", stationIds: ["cabitos", "angamos", "san-borja-sur", "la-cultura", "nicolas-arriola", "gamarra"] },
  { id: "grau", name: "Av. Grau", stationIds: ["miguel-grau"] },
  { id: "ancash", name: "Av. Ancash", stationIds: ["el-angel", "presbitero-maestro"] },
  { id: "proceres", name: "Av. Próceres de la Independencia", stationIds: ["caja-de-agua", "piramide-del-sol", "los-jardines", "los-postes", "san-carlos"] },
  { id: "wiesse", name: "Av. Fernando Wiesse", stationIds: ["san-martin", "santa-rosa", "bayovar"] },
];

/** Punto donde se ancla la etiqueta de una avenida */
export function avenueAnchor(avenue: Avenue): LatLng {
  const points = avenue.stationIds
    .map((id) => STATIONS.find((s) => s.id === id))
    .filter((s): s is Station => Boolean(s));
  const lat = points.reduce((a, s) => a + s.latitude, 0) / points.length;
  const lng = points.reduce((a, s) => a + s.longitude, 0) / points.length;
  return [lat, lng];
}

/** Interpola una posición geográfica a lo largo de una lista de estaciones */
export function interpolate(stations: Station[], position: number): LatLng {
  if (stations.length === 0) return [0, 0];
  const clamped = Math.max(0, Math.min(stations.length - 1, position));
  const i = Math.floor(clamped);
  const frac = clamped - i;
  const a = stations[i];
  const b = stations[Math.min(i + 1, stations.length - 1)];
  return [
    a.latitude + (b.latitude - a.latitude) * frac,
    a.longitude + (b.longitude - a.longitude) * frac,
  ];
}

/** Rumbo en grados entre dos puntos, para orientar el tren */
export function bearing([lat1, lng1]: LatLng, [lat2, lng2]: LatLng): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const y = Math.sin(toRad(lng2 - lng1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lng2 - lng1));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Distancia en kilómetros entre dos coordenadas (haversine) */
export function distanceKm([lat1, lng1]: LatLng, [lat2, lng2]: LatLng): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Estación más cercana a unas coordenadas, con la caminata estimada */
export function nearestStation(lat: number, lng: number) {
  const ranked = STATIONS.map((station) => {
    const km = distanceKm([lat, lng], [station.latitude, station.longitude]);
    const meters = Math.round(km * 1300); // el trazado de calles alarga ~30 %
    return {
      station,
      km,
      meters,
      walkMinutes: Math.max(1, Math.round((meters / 1000 / 4.5) * 60)),
    };
  }).sort((a, b) => a.km - b.km);
  return ranked[0];
}
