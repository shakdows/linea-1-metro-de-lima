"use client";

import { Home, Map, Sparkles, TrainFront } from "lucide-react";
import { cn } from "@/lib/cn";
import type { SectionId } from "./Sidebar";

const TABS = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "mapa", label: "Mapa", icon: Map },
  { id: "planificar", label: "Viaje", icon: TrainFront },
  { id: "ayuda", label: "Asistente", icon: Sparkles },
] as const;

export function MobileNav({
  active,
  onNavigate,
}: {
  active: SectionId;
  onNavigate: (id: SectionId) => void;
}) {
  return (
    <nav
      aria-label="Navegación móvil"
      className="fixed inset-x-0 bottom-0 z-60 grid grid-cols-4 border-t border-borde bg-white/97 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = id === active;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-bold transition-colors active:scale-95",
              isActive ? "text-verde" : "text-tinta-suave",
            )}
          >
            {isActive ? (
              <span className="absolute top-0 h-[3px] w-6 rounded-b-full bg-verde" />
            ) : null}
            <Icon size={20} strokeWidth={2.1} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
