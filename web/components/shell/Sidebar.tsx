"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, TrainFront } from "lucide-react";
import { MODULES, type ModuleId } from "./navigation";
import { cn } from "@/lib/cn";

export function Sidebar({
  active,
  onNavigate,
}: {
  active: ModuleId;
  onNavigate: (id: ModuleId) => void;
}) {
  return (
    <aside className="hidden w-[212px] shrink-0 flex-col bg-sidebar lg:flex">
      <Link href="/" className="flex h-[56px] items-center gap-2.5 px-4 transition-opacity hover:opacity-80">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-verde text-white">
          <TrainFront size={16} strokeWidth={2.3} />
        </span>
        <span className="leading-none">
          <span className="block text-[13px] font-semibold tracking-tight text-white">LÍNEA 1</span>
          <span className="mt-0.5 block text-[10.5px] text-white/40">Metro de Lima</span>
        </span>
      </Link>

      <nav className="flex flex-col gap-px px-2 pt-3" aria-label="Módulos">
        {MODULES.map(({ id, label, icon: Icon }) => {
          const isActive = id === active;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12.5px] transition-colors",
                isActive ? "text-white" : "text-white/45 hover:bg-white/5 hover:text-white/80",
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId="nav-activo"
                  className="absolute inset-0 rounded-lg bg-white/8"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              ) : null}
              <Icon
                size={15.5}
                strokeWidth={2}
                className={cn("relative z-10 shrink-0", isActive && "text-verde")}
              />
              <span className={cn("relative z-10", isActive && "font-semibold")}>{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/8 px-2 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] text-white/45 transition-colors hover:bg-white/5 hover:text-white/80"
        >
          <ArrowLeft size={14} className="shrink-0" />
          Volver a la portada
        </Link>
        <p className="mt-1 px-2.5 text-[10.5px] leading-relaxed text-white/30">
          Interfaz conceptual
          <br />
          para fines académicos
        </p>
      </div>
    </aside>
  );
}
