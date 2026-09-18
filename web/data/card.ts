/** Movimientos de la tarjeta. Datos de demostración. */
export interface Movement {
  id: string;
  date: string;
  time: string;
  type: "viaje" | "recarga";
  detail: string;
  amount: number;
}

export const CARD = {
  number: "•••• 4821",
  holder: "María Quispe",
  balance: 18.5,
  updated: "hoy",
};

export const MOVEMENTS: Movement[] = [
  { id: "m1", date: "2026-09-18", time: "08:12", type: "viaje", detail: "La Cultura → Gamarra", amount: -1.5 },
  { id: "m2", date: "2026-09-17", time: "19:40", type: "viaje", detail: "Gamarra → La Cultura", amount: -1.5 },
  { id: "m3", date: "2026-09-17", time: "08:05", type: "viaje", detail: "La Cultura → Gamarra", amount: -1.5 },
  { id: "m4", date: "2026-09-16", time: "18:22", type: "recarga", detail: "Recarga en Estación Gamarra", amount: 20 },
  { id: "m5", date: "2026-09-16", time: "07:58", type: "viaje", detail: "San Borja Sur → Miguel Grau", amount: -1.5 },
  { id: "m6", date: "2026-09-15", time: "20:10", type: "viaje", detail: "Miguel Grau → San Borja Sur", amount: -1.5 },
  { id: "m7", date: "2026-09-15", time: "07:49", type: "viaje", detail: "San Borja Sur → Miguel Grau", amount: -1.5 },
];
