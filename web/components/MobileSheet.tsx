"use client";

import { motion, useAnimation, useDragControls } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

type SheetState = "cerrado" | "medio" | "abierto";

/**
 * Hoja inferior al estilo de las apps de mapas: tres alturas y arrastre.
 * Cerrada deja el mapa casi entero; abierta muestra todo el detalle.
 */
export function MobileSheet({
  summary,
  children,
  bump,
}: {
  summary: ReactNode;
  children: ReactNode;
  /** Cambiar este número sube la hoja a la altura media */
  bump?: number;
}) {
  const [state, setState] = useState<SheetState>("medio");
  const controls = useDragControls();
  const anim = useAnimation();

  const heights: Record<SheetState, string> = {
    cerrado: "104px",
    medio: "46vh",
    abierto: "86vh",
  };

  useEffect(() => {
    anim.start({ height: heights[state] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    if (bump) setState("medio");
  }, [bump]);

  const cycle = () =>
    setState((s) => (s === "cerrado" ? "medio" : s === "medio" ? "abierto" : "cerrado"));

  return (
    <motion.section
      drag="y"
      dragControls={controls}
      dragListener={false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragEnd={(_, info) => {
        if (info.offset.y < -50) setState(state === "cerrado" ? "medio" : "abierto");
        if (info.offset.y > 50) setState(state === "abierto" ? "medio" : "cerrado");
      }}
      animate={anim}
      initial={{ height: heights.medio }}
      transition={{ type: "spring", stiffness: 300, damping: 34 }}
      className="fixed inset-x-0 bottom-[62px] z-50 flex flex-col overflow-hidden rounded-t-[26px] border-t border-borde bg-white shadow-[0_-10px_40px_rgba(18,24,22,.16)] lg:hidden"
      aria-label="Panel del viaje"
    >
      <button
        type="button"
        onPointerDown={(e) => controls.start(e)}
        onClick={cycle}
        aria-expanded={state !== "cerrado"}
        className="flex w-full shrink-0 touch-none flex-col items-center gap-2 px-4 pt-3 pb-2"
      >
        <span className="h-1.5 w-10 rounded-full bg-borde" />
        <span className="w-full text-left">{summary}</span>
      </button>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 scroll-fino">{children}</div>
    </motion.section>
  );
}
