import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre el proyecto — Línea 1 Metro de Lima",
  description:
    "Qué incluye la aplicación de la Línea 1 del Metro de Lima: mapa con seguimiento del tren, planificador de ida y vuelta, horarios, afluencia, tarjeta y asistente.",
};

export default function BienvenidaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
