import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aplicación — Línea 1 Metro de Lima",
  description:
    "Mapa interactivo, planificador de ida y vuelta, horarios, afluencia, tarjeta y asistente de la Línea 1 del Metro de Lima.",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
