"use client";

import { motion, useDragControls } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { useState, type ReactNode } from "react";

/**
 * Hoja inferior para móvil: muestra un resumen siempre visible y se despliega
 * al arrastrarla hacia arriba o al tocar la cabecera.
 */
export function BottomSheet({
  summary,
  children,
}: {
  summary: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const controls = useDragControls();

  return (
    <motion.section
      drag="y"
      dragControls={controls}
      dragListener={false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.12}
      onDragEnd={(_, info) => {
        if (info.offset.y < -60) setOpen(true);
        if (info.offset.y > 60) setOpen(false);
      }}
      animate={{ height: open ? "72vh" : "auto" }}
      transition={{ type: "spring", stiffness: 320, damping: 34 }}
      className="fixed inset-x-0 bottom-[66px] z-40 overflow-hidden rounded-t-3xl border-t border-borde bg-white shadow-[0_-8px_30px_rgba(18,24,22,.12)] lg:hidden"
      aria-label="Panel del viaje"
    >
      <button
        type="button"
        onPointerDown={(e) => controls.start(e)}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full touch-none flex-col items-center gap-2 px-4 pt-3 pb-1"
      >
        <span className="h-1.5 w-11 rounded-full bg-borde" />
        <span className="flex w-full items-center gap-2">
          <span className="min-w-0 flex-1 text-left">{summary}</span>
          <ChevronUp
            size={18}
            className={`shrink-0 text-tinta-suave transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      <div className="max-h-[calc(72vh-70px)] overflow-y-auto px-4 pt-2 pb-5 scroll-fino">
        {children}
      </div>
    </motion.section>
  );
}
