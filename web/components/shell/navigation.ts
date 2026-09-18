import {
  Bell, Clock, CreditCard, LayoutGrid, Map, Route, Sparkles, TrainFront,
} from "lucide-react";

export const MODULES = [
  { id: "inicio", label: "Inicio", icon: LayoutGrid },
  { id: "mapa", label: "Mapa", icon: Map },
  { id: "planificar", label: "Planificar viaje", icon: Route },
  { id: "estaciones", label: "Estaciones", icon: TrainFront },
  { id: "tarjeta", label: "Tarjeta", icon: CreditCard },
  { id: "horarios", label: "Horarios", icon: Clock },
  { id: "avisos", label: "Avisos", icon: Bell },
  { id: "asistente", label: "Asistente", icon: Sparkles },
] as const;

export type ModuleId = (typeof MODULES)[number]["id"];

export const MODULE_TITLES: Record<ModuleId, string> = {
  inicio: "Inicio",
  mapa: "Mapa de la red",
  planificar: "Planificar viaje",
  estaciones: "Estaciones",
  tarjeta: "Tarjeta",
  horarios: "Horarios",
  avisos: "Avisos del servicio",
  asistente: "Asistente",
};
