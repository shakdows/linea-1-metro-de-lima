"use client";

import {
  Bell,
  CircleHelp,
  Clock,
  CreditCard,
  Home,
  Map,
  Route,
  TrainFront,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export const SECTIONS = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "mapa", label: "Mapa", icon: Map },
  { id: "estaciones", label: "Estaciones", icon: TrainFront },
  { id: "planificar", label: "Planificar viaje", icon: Route },
  { id: "tarjeta", label: "Tarjeta", icon: CreditCard },
  { id: "horarios", label: "Horarios", icon: Clock },
  { id: "avisos", label: "Avisos", icon: Bell },
  { id: "ayuda", label: "Ayuda", icon: CircleHelp },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

export function Sidebar({
  active,
  onNavigate,
}: {
  active: SectionId;
  onNavigate: (id: SectionId) => void;
}) {
  return (
    <aside className="hidden w-[232px] shrink-0 flex-col border-r border-borde bg-white lg:flex">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="grid size-10 place-items-center rounded-xl bg-verde text-white shadow-[0_6px_16px_rgba(0,155,58,.3)]">
          <TrainFront size={21} strokeWidth={2.2} />
        </span>
        <span className="leading-tight">
          <span className="block text-[15px] font-extrabold tracking-tight">LÍNEA 1</span>
          <span className="block text-[11px] font-medium text-tinta-suave">Metro de Lima</span>
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-2" aria-label="Principal">
        {SECTIONS.map(({ id, label, icon: Icon }) => {
          const isActive = id === active;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-[13.5px] font-semibold transition-colors",
                isActive
                  ? "text-verde-oscuro"
                  : "text-tinta-suave hover:bg-fondo hover:text-tinta",
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId="sidebar-activo"
                  className="absolute inset-0 rounded-xl bg-verde-claro"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ) : null}
              <Icon
                size={18}
                strokeWidth={2.1}
                className={cn("relative z-10", isActive && "text-verde")}
              />
              <span className="relative z-10">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="relative m-3 overflow-hidden rounded-2xl bg-verde-claro p-4">
        <p className="font-[cursive] text-[17px] leading-tight font-semibold text-verde-oscuro">
          Lima avanza
          <br />
          contigo
        </p>
        <p className="mt-2 text-[11.5px] leading-snug text-tinta-suave">
          Una ciudad que se mueve mejor.
        </p>
      </div>
    </aside>
  );
}
