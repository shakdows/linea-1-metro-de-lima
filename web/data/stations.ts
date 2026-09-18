/**
 * Las 26 estaciones de la Línea 1 del Metro de Lima.
 *
 * El orden, los nombres, los distritos y las avenidas son los reales.
 * Las coordenadas son APROXIMADAS: reproducen la forma del trazado
 * (Villa El Salvador → San Juan de Miraflores → Surco → San Borja →
 * La Victoria → Cercado → San Juan de Lurigancho) pero no son datos
 * oficiales. Los tiempos y la afluencia son estimaciones simuladas.
 */

export type Direction = "norte" | "sur";

export interface Station {
  id: string;
  name: string;
  /** Posición en la línea, de sur (0) a norte (25) */
  index: number;
  latitude: number;
  longitude: number;
  /** Avenida principal sobre la que se sitúa la estación */
  avenue: string;
  district: string;
  /** Minutos estimados desde la estación anterior */
  estimatedTime: number;
  accessible: boolean;
  terminal?: boolean;
  exits?: string[];
  nearby?: string[];
  connections?: string[];
  /** Fotografía de la estación, en public/estaciones. Ver docs/DATOS.md */
  image?: string;
}

export const LINE = {
  name: "Línea 1",
  system: "Metro de Lima",
  color: "#009B3A",
  openingTime: "05:30",
  closingTime: "22:30",
  fare: 1.5,
  currency: "S/",
  walkMinutes: 2,
} as const;

export const DIRECTIONS: Record<Direction, { id: Direction; to: string }> = {
  norte: { id: "norte", to: "Bayóvar" },
  sur: { id: "sur", to: "Villa El Salvador" },
};

export const STATIONS: Station[] = [
  { id: "villa-el-salvador", name: "Villa El Salvador", index: 0, latitude: -12.2136, longitude: -76.9370, avenue: "Av. Separadora Industrial", district: "Villa El Salvador", estimatedTime: 0, accessible: true, terminal: true, exits: ["Av. Separadora Industrial", "Terminal terrestre"], nearby: ["Terminal terrestre de Villa El Salvador", "Parque Zonal Huáscar"], image: "/estaciones/villa-el-salvador.webp" },
  { id: "parque-industrial", name: "Parque Industrial", index: 1, latitude: -12.2046, longitude: -76.9366, avenue: "Av. Separadora Industrial", district: "Villa El Salvador", estimatedTime: 2, accessible: true, exits: ["Av. Separadora Industrial"], nearby: ["Parque Industrial de Villa El Salvador"] },
  { id: "pumacahua", name: "Pumacahua", index: 2, latitude: -12.1955, longitude: -76.9385, avenue: "Av. Pumacahua", district: "Villa El Salvador", estimatedTime: 2, accessible: true, exits: ["Av. Pumacahua"] },
  { id: "villa-maria", name: "Villa María", index: 3, latitude: -12.1866, longitude: -76.9420, avenue: "Av. Pachacútec", district: "Villa María del Triunfo", estimatedTime: 2, accessible: true, exits: ["Av. Pachacútec"], nearby: ["Municipalidad de Villa María del Triunfo"], image: "/estaciones/villa-maria.webp" },
  { id: "maria-auxiliadora", name: "María Auxiliadora", index: 4, latitude: -12.1760, longitude: -76.9455, avenue: "Av. Pachacútec", district: "San Juan de Miraflores", estimatedTime: 2, accessible: true, exits: ["Hospital María Auxiliadora"], nearby: ["Hospital María Auxiliadora"], image: "/estaciones/maria-auxiliadora.webp" },
  { id: "san-juan", name: "San Juan", index: 5, latitude: -12.1668, longitude: -76.9490, avenue: "Av. Los Héroes", district: "San Juan de Miraflores", estimatedTime: 2, accessible: true, exits: ["Av. Los Héroes"] },
  { id: "atocongo", name: "Atocongo", index: 6, latitude: -12.1580, longitude: -76.9700, avenue: "Av. Los Héroes", district: "San Juan de Miraflores", estimatedTime: 2, accessible: true, exits: ["Av. Los Héroes", "C.C. Atocongo"], nearby: ["Centro comercial Atocongo"] },
  { id: "jorge-chavez", name: "Jorge Chávez", index: 7, latitude: -12.1490, longitude: -76.9860, avenue: "Av. Tomás Marsano", district: "Santiago de Surco", estimatedTime: 2, accessible: true, exits: ["Av. Tomás Marsano"], image: "/estaciones/jorge-chavez.webp" },
  { id: "ayacucho", name: "Ayacucho", index: 8, latitude: -12.1405, longitude: -76.9930, avenue: "Av. Tomás Marsano", district: "Santiago de Surco", estimatedTime: 2, accessible: true, exits: ["Av. Ayacucho"] },
  { id: "cabitos", name: "Cabitos", index: 9, latitude: -12.1320, longitude: -76.9975, avenue: "Av. Aviación", district: "Santiago de Surco", estimatedTime: 2, accessible: true, exits: ["Av. Aviación"], image: "/estaciones/cabitos.webp" },
  { id: "angamos", name: "Angamos", index: 10, latitude: -12.1190, longitude: -77.0005, avenue: "Av. Aviación", district: "Surquillo", estimatedTime: 2, accessible: true, exits: ["Av. Angamos Este"], image: "/estaciones/angamos.webp" },
  { id: "san-borja-sur", name: "San Borja Sur", index: 11, latitude: -12.1065, longitude: -77.0000, avenue: "Av. Aviación", district: "San Borja", estimatedTime: 2, accessible: true, exits: ["Av. San Borja Sur"], image: "/estaciones/san-borja-sur.webp" },
  { id: "la-cultura", name: "La Cultura", index: 12, latitude: -12.0965, longitude: -76.9985, avenue: "Av. Aviación", district: "San Borja", estimatedTime: 2, accessible: true, exits: ["Av. Javier Prado Este", "Museo de la Nación"], nearby: ["Ministerio de Cultura", "Museo de la Nación", "Gran Teatro Nacional"], image: "/estaciones/la-cultura.webp" },
  { id: "nicolas-arriola", name: "Nicolás Arriola", index: 13, latitude: -12.0790, longitude: -77.0005, avenue: "Av. Aviación", district: "La Victoria", estimatedTime: 3, accessible: true, exits: ["Av. Nicolás Arriola"], image: "/estaciones/nicolas-arriola.webp" },
  { id: "gamarra", name: "Gamarra", index: 14, latitude: -12.0680, longitude: -77.0030, avenue: "Av. Aviación", district: "La Victoria", estimatedTime: 2, accessible: true, exits: ["Av. Aviación", "Emporio Gamarra"], nearby: ["Emporio Comercial de Gamarra"], image: "/estaciones/gamarra.webp" },
  { id: "miguel-grau", name: "Miguel Grau", index: 15, latitude: -12.0565, longitude: -77.0155, avenue: "Av. Grau", district: "La Victoria", estimatedTime: 2, accessible: true, exits: ["Av. Grau", "Conexión Metropolitano"], connections: ["Metropolitano (Est. Grau)"], nearby: ["Estación Grau del Metropolitano"], image: "/estaciones/miguel-grau.webp" },
  { id: "el-angel", name: "El Ángel", index: 16, latitude: -12.0470, longitude: -77.0085, avenue: "Av. Locumba", district: "El Agustino", estimatedTime: 3, accessible: true, exits: ["Av. Locumba"], image: "/estaciones/el-angel.webp" },
  { id: "presbitero-maestro", name: "Presbítero Maestro", index: 17, latitude: -12.0425, longitude: -77.0035, avenue: "Av. Ancash", district: "El Agustino", estimatedTime: 2, accessible: true, exits: ["Av. Ancash"], nearby: ["Cementerio Presbítero Maestro"], image: "/estaciones/presbitero-maestro.webp" },
  { id: "caja-de-agua", name: "Caja de Agua", index: 18, latitude: -12.0290, longitude: -77.0010, avenue: "Av. Próceres de la Independencia", district: "San Juan de Lurigancho", estimatedTime: 3, accessible: true, exits: ["Av. Próceres de la Independencia"], image: "/estaciones/caja-de-agua.webp" },
  { id: "piramide-del-sol", name: "Pirámide del Sol", index: 19, latitude: -12.0200, longitude: -76.9985, avenue: "Av. Próceres de la Independencia", district: "San Juan de Lurigancho", estimatedTime: 2, accessible: true, exits: ["Av. Próceres de la Independencia"], image: "/estaciones/piramide-del-sol.webp" },
  { id: "los-jardines", name: "Los Jardines", index: 20, latitude: -12.0105, longitude: -76.9960, avenue: "Av. Próceres de la Independencia", district: "San Juan de Lurigancho", estimatedTime: 2, accessible: true, exits: ["Av. Próceres de la Independencia"], image: "/estaciones/los-jardines.webp" },
  { id: "los-postes", name: "Los Postes", index: 21, latitude: -12.0010, longitude: -76.9930, avenue: "Av. Próceres de la Independencia", district: "San Juan de Lurigancho", estimatedTime: 2, accessible: true, exits: ["Av. Próceres de la Independencia"], image: "/estaciones/los-postes.webp" },
  { id: "san-carlos", name: "San Carlos", index: 22, latitude: -11.9930, longitude: -76.9900, avenue: "Av. Próceres de la Independencia", district: "San Juan de Lurigancho", estimatedTime: 2, accessible: true, exits: ["Av. Próceres de la Independencia"], image: "/estaciones/san-carlos.webp" },
  { id: "san-martin", name: "San Martín", index: 23, latitude: -11.9850, longitude: -76.9870, avenue: "Av. Fernando Wiesse", district: "San Juan de Lurigancho", estimatedTime: 2, accessible: true, exits: ["Av. Fernando Wiesse"], image: "/estaciones/san-martin.webp" },
  { id: "santa-rosa", name: "Santa Rosa", index: 24, latitude: -11.9770, longitude: -76.9840, avenue: "Av. Fernando Wiesse", district: "San Juan de Lurigancho", estimatedTime: 2, accessible: true, exits: ["Av. Fernando Wiesse"], image: "/estaciones/santa-rosa.webp" },
  { id: "bayovar", name: "Bayóvar", index: 25, latitude: -11.9690, longitude: -76.9810, avenue: "Av. Fernando Wiesse", district: "San Juan de Lurigancho", estimatedTime: 2, accessible: true, terminal: true, exits: ["Av. Fernando Wiesse"], image: "/estaciones/bayovar.webp" },
];

/** Headway estimado (minutos entre trenes) por hora del día */
export const HEADWAY: Record<number, number> = {
  5: 8, 6: 5, 7: 3, 8: 3, 9: 4, 10: 6, 11: 7, 12: 6, 13: 6,
  14: 6, 15: 6, 16: 5, 17: 4, 18: 3, 19: 3, 20: 4, 21: 6, 22: 8,
};

/** Perfil de afluencia estimado por hora, de 0 a 100 */
export const CROWDING: Record<number, number> = {
  5: 35, 6: 62, 7: 88, 8: 95, 9: 74, 10: 45, 11: 38, 12: 46, 13: 52,
  14: 48, 15: 50, 16: 61, 17: 74, 18: 92, 19: 96, 20: 78, 21: 55, 22: 33,
};

export type AlertLevel = "info" | "aviso" | "critico";

export interface ServiceAlert {
  id: string;
  level: AlertLevel;
  title: string;
  detail: string;
  date: string;
}

export const ALERTS: ServiceAlert[] = [
  { id: "al-1", level: "aviso", title: "Mantenimiento programado", detail: "El servicio tendrá frecuencias modificadas entre las 10:00 a. m. y 2:00 p. m. por trabajos de mantenimiento.", date: "2026-09-17" },
  { id: "al-2", level: "info", title: "Horario extendido por feriado", detail: "El servicio operará hasta las 23:30 durante el fin de semana largo.", date: "2026-09-16" },
  { id: "al-3", level: "info", title: "Consulta tu saldo desde la web", detail: "Ya puedes asociar tu DNI y revisar el saldo sin ir a la estación.", date: "2026-09-12" },
];

export type ServiceLevel = "normal" | "demoras" | "interrumpido";

export const SERVICE_STATUS: {
  level: ServiceLevel;
  title: string;
  detail: string;
  segment?: string;
  extraMinutes?: number;
} = {
  level: "normal",
  title: "Servicio normal",
  detail: "Toda la línea operativa",
};

export const stationById = (id: string) => STATIONS.find((s) => s.id === id);
export const indexOfStation = (id: string) => STATIONS.findIndex((s) => s.id === id);
