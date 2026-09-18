"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, Bell, CircleHelp, Clock, CreditCard, Home, Map, Route, Settings, Sparkles, TrainFront,
} from "lucide-react";
import { cn } from "@/lib/cn";

export const SECTIONS = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "mapa", label: "Mapa", icon: Map },
  { id: "planificar", label: "Planificar viaje", icon: Route },
  { id: "estaciones", label: "Estaciones", icon: TrainFront },
  { id: "tarjeta", label: "Tarjeta", icon: CreditCard },
  { id: "horarios", label: "Horarios", icon: Clock },
  { id: "avisos", label: "Avisos", icon: Bell },
  { id: "asistente", label: "Asistente", icon: Sparkles },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"] | "ayuda" | "configuracion";

export function Sidebar({
  active,
  onNavigate,
}: {
  active: SectionId;
  onNavigate: (id: SectionId) => void;
}) {
  return (
    <aside className="hidden w-[228px] shrink-0 flex-col bg-[#0C1512] text-white lg:flex">
      <Link href="/" className="flex items-center gap-2.5 px-5 py-5 transition-opacity hover:opacity-80">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-verde text-white shadow-[0_6px_18px_rgba(0,155,58,.4)]">
          <TrainFront size={21} strokeWidth={2.2} />
        </span>
        <span className="leading-tight">
          <span className="block text-[15px] font-extrabold tracking-tight">LÍNEA 1</span>
          <span className="block text-[11px] font-medium text-white/55">Metro de Lima</span>
        </span>
      </Link>

      <nav className="flex flex-col gap-0.5 px-3 py-2" aria-label="Principal">
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
                isActive ? "text-white" : "text-white/55 hover:bg-white/6 hover:text-white/90",
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId="sidebar-activo"
                  className="absolute inset-0 rounded-xl bg-verde"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ) : null}
              <Icon size={18} strokeWidth={2.1} className="relative z-10" />
              <span className="relative z-10">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bloque de marca con fotografía */}
      <div className="relative mx-3 mt-4 flex-1 overflow-hidden rounded-2xl">
        <Image
          src="/img/anden-trenes.webp"
          alt=""
          fill
          sizes="220px"
          className="object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C1512] via-[#0C1512]/55 to-transparent" />
        <div className="absolute right-4 bottom-4 left-4">
          <p className="text-[14px] leading-snug font-bold">
            Una ciudad que
            <br />
            se mueve mejor.
          </p>
          <svg viewBox="0 0 120 18" className="mt-2 h-4 w-24 text-verde" fill="none" aria-hidden="true">
            <path d="M2 12c18-12 34 6 52-2s30-9 64 2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col gap-0.5 p-3">
        {([
          ["configuracion", "Configuración", Settings],
          ["ayuda", "Ayuda", CircleHelp],
        ] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-[13px] font-semibold transition-colors",
              active === id ? "bg-white/10 text-white" : "text-white/45 hover:text-white/80",
            )}
          >
            <Icon size={17} strokeWidth={2.1} />
            {label}
          </button>
        ))}

        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-white/45 transition-colors hover:text-white/80"
        >
          <ArrowLeft size={17} strokeWidth={2.1} />
          Volver a la portada
        </Link>
      </div>
    </aside>
  );
}
