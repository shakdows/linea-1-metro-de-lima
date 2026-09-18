"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, LayoutGrid, Map, MoreHorizontal, Route, TrainFront } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { MODULES, type ModuleId } from "./navigation";

const TABS = [
  { id: "inicio", label: "Inicio", icon: LayoutGrid },
  { id: "mapa", label: "Mapa", icon: Map },
  { id: "planificar", label: "Viaje", icon: Route },
  { id: "estaciones", label: "Estaciones", icon: TrainFront },
] as const;

const EN_TABS = TABS.map((t) => t.id) as readonly string[];
const RESTO = MODULES.filter((m) => !EN_TABS.includes(m.id));

/**
 * Barra inferior en móvil. Los cuatro módulos de uso diario son pestañas;
 * el resto vive en «Más», para que ningún módulo quede inalcanzable sin
 * llenar la barra de iconos.
 */
export function MobileTabs({
  active,
  onNavigate,
}: {
  active: ModuleId;
  onNavigate: (id: ModuleId) => void;
}) {
  const [open, setOpen] = useState(false);
  const enResto = RESTO.some((m) => m.id === active);

  return (
    <>
      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-70 bg-tinta/25 lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="fixed inset-x-0 bottom-0 z-80 rounded-t-[16px] border-t border-borde bg-superficie pb-[calc(52px+env(safe-area-inset-bottom))] lg:hidden"
            >
              <div className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-borde" />
              <p className="px-4 pt-3 pb-1 text-[11px] tracking-[.09em] text-tinta-suave uppercase">
                Más módulos
              </p>
              <ul className="divide-y divide-borde-suave">
                {RESTO.map(({ id, label, icon: Icon }) => (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => { onNavigate(id); setOpen(false); }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-fondo"
                    >
                      <Icon size={16} className="shrink-0 text-tinta-suave" />
                      <span className="flex-1 text-[13.5px] font-medium">{label}</span>
                      {id === active ? <Check size={15} className="text-verde" /> : null}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <nav
        aria-label="Navegación"
        className="fixed inset-x-0 bottom-0 z-90 grid h-[52px] grid-cols-5 border-t border-borde bg-superficie pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = id === active;
          return (
            <button
              key={id}
              type="button"
              onClick={() => { onNavigate(id); setOpen(false); }}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 text-[9.5px] font-medium transition-colors",
                isActive ? "text-verde" : "text-tinta-suave",
              )}
            >
              {isActive ? <span className="absolute top-0 h-0.5 w-8 rounded-b bg-verde" /> : null}
              <Icon size={17} strokeWidth={2} />
              {label}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Más módulos"
          className={cn(
            "relative flex flex-col items-center justify-center gap-0.5 text-[9.5px] font-medium transition-colors",
            enResto || open ? "text-verde" : "text-tinta-suave",
          )}
        >
          {enResto ? <span className="absolute top-0 h-0.5 w-8 rounded-b bg-verde" /> : null}
          <MoreHorizontal size={17} strokeWidth={2} />
          Más
        </button>
      </nav>
    </>
  );
}
