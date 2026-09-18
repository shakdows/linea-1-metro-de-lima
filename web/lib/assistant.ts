import { DIRECTIONS, LINE, STATIONS } from "@/data/stations";
import { bestSlot, buildTrip, crowdingLevel, hhmm, nextTrains } from "./trip";

const normalize = (t: string) =>
  t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();

function findStations(text: string) {
  const t = normalize(text);
  const hits = STATIONS.map((station) => ({ station, pos: t.indexOf(normalize(station.name)) }))
    .filter((h) => h.pos >= 0)
    .sort((a, b) => a.pos - b.pos);
  return hits.map((h) => h.station);
}

/**
 * Asistente por reglas sobre los datos de la propia aplicación.
 * No envía nada a ningún servidor ni necesita clave de API. Para conectar un
 * modelo real, sustituye esta función por una llamada a tu endpoint.
 */
export function answer(question: string, now = new Date()): string {
  const t = normalize(question);
  const found = findStations(question);

  if (found.length >= 2) {
    const trip = buildTrip(found[0].id, found[1].id, "ida");
    if (!trip) return "El origen y el destino son la misma estación.";
    const wait = nextTrains(found[0].index, trip.outbound.direction, 1, now)[0];
    return `El viaje entre ${found[0].name} y ${found[1].name} dura aproximadamente ${trip.outbound.minutes} minutos (${trip.outbound.stops} estaciones, dirección ${DIRECTIONS[trip.outbound.direction].to}). El próximo tren llega en unos ${wait.minutes} minutos.`;
  }

  if (/tarifa|cuesta|precio|pasaje|costo/.test(t)) {
    return `El pasaje es de ${LINE.currency} ${LINE.fare.toFixed(2)} por viaje, sin importar cuántas estaciones recorras.`;
  }

  if (/proximo tren|siguiente tren|cuando sale|cuando pasa/.test(t)) {
    const station = found[0] ?? STATIONS[12];
    const north = nextTrains(station.index, "norte", 1, now)[0];
    const south = nextTrains(station.index, "sur", 1, now)[0];
    return `En ${station.name}: hacia ${DIRECTIONS.norte.to} en ${north.minutes} min, hacia ${DIRECTIONS.sur.to} en ${south.minutes} min.`;
  }

  if (/ultimo tren|hasta que hora|cierra/.test(t)) {
    return `El servicio cierra alrededor de las ${LINE.closingTime}. Conviene llegar con unos 15 minutos de holgura.`;
  }

  if (/horario|abre|primer tren/.test(t)) {
    return `El servicio opera de ${LINE.openingTime} a ${LINE.closingTime}. En hora punta pasa un tren cada 3 minutos aproximadamente.`;
  }

  if (/afluencia|lleno|gente|hora conviene|mejor hora/.test(t)) {
    const slot = bestSlot();
    const level = crowdingLevel(now.getHours());
    return `Ahora (${hhmm(now)}) la afluencia estimada es ${level.label.toLowerCase()}. La franja más tranquila es ${slot.label}. Es una estimación, no un dato en vivo.`;
  }

  if (found.length === 1) {
    const s = found[0];
    return `🚉 ${s.name} está en ${s.avenue}, distrito de ${s.district}. Afluencia estimada ahora: ${crowdingLevel(now.getHours()).label.toLowerCase()}. Dime a dónde quieres ir y te calculo la ruta.`;
  }

  if (/^(hola|buenas|hey)/.test(t)) {
    return "¡Hola! Puedo calcularte una ruta, decirte cuándo pasa el próximo tren o a qué hora conviene viajar.";
  }

  return "Puedo ayudarte con rutas («de La Cultura a Gamarra»), horarios, tarifas y afluencia. ¿Qué necesitas?";
}

/** Si la pregunta menciona dos estaciones, devuelve la ruta para el mapa */
export function routeFromQuestion(question: string) {
  const found = findStations(question);
  if (found.length < 2 || found[0].id === found[1].id) return null;
  return { originId: found[0].id, destinationId: found[1].id };
}

export const SUGGESTIONS = [
  "¿Cuánto demoro de La Cultura a Gamarra?",
  "¿Cuándo sale el próximo tren?",
  "¿Cuánto cuesta la tarifa?",
];
