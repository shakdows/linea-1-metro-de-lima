"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Station } from "@/data/stations";

/** Aviso de llegada a una estación */
export function ArrivalToast({ station, show }: { station: Station | null; show: boolean }) {
  return (
    <AnimatePresence>
      {show && station ? (
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 340, damping: 30 }}
          className="glass-oscuro pointer-events-none max-w-full rounded-2xl px-4 py-3"
        >
          <p className="text-[10.5px] font-bold tracking-[.12em] text-white/60 uppercase">Llegando a</p>
          <p className="truncate text-[15px] font-extrabold tracking-tight">🚉 {station.name}</p>
          <p className="mt-0.5 text-[11.5px] text-white/70">{station.avenue}</p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
