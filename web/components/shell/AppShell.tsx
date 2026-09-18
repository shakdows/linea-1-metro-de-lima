"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileTabs } from "./MobileTabs";
import type { ModuleId } from "./navigation";

/**
 * Armazón persistente: la barra lateral y la superior no se desmontan nunca.
 * Solo cambia el área de trabajo, con una transición corta para que el paso
 * entre módulos se sienta inmediato.
 */
export function AppShell({
  module,
  onNavigate,
  onPickStation,
  children,
}: {
  module: ModuleId;
  onNavigate: (id: ModuleId) => void;
  onPickStation: (id: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="flex h-dvh overflow-hidden bg-fondo">
      <Sidebar active={module} onNavigate={onNavigate} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar module={module} onPickStation={onPickStation} onNavigate={onNavigate} />

        <main className="min-h-0 flex-1 pb-[52px] lg:pb-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={module}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <MobileTabs active={module} onNavigate={onNavigate} />
    </div>
  );
}
