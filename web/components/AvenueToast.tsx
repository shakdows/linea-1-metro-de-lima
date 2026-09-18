"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Aviso que aparece cuando el tren entra en una avenida distinta.
 * Se desliza, permanece 3 segundos y desaparece.
 */
export function AvenueToast({ avenue, active }: { avenue: string | null; active: boolean }) {
  const [shown, setShown] = useState<string | null>(null);

  useEffect(() => {
    if (!active || !avenue) {
      setShown(null);
      return;
    }
    setShown(avenue);
    const t = setTimeout(() => setShown(null), 3000);
    return () => clearTimeout(t);
  }, [avenue, active]);

  return (
    <AnimatePresence>
      {shown ? (
        <motion.div
          initial={{ opacity: 0, y: -14, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="pointer-events-none"
        >
          <p className="glass-oscuro flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-bold">
            <MapPin size={14} className="text-verde" />
            Pasando por <span className="text-verde">{shown}</span>
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
