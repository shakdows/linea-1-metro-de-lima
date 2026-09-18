"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { useState } from "react";
import { ALERTS, SERVICE_STATUS, type ServiceAlert } from "@/data/stations";
import { Panel, PanelHeader, Pill } from "@/components/ui";
import { cn } from "@/lib/cn";

const NIVEL = {
  info: { tono: "verde", icon: Info, label: "Informativo" },
  aviso: { tono: "ambar", icon: AlertTriangle, label: "Precaución" },
  critico: { tono: "rojo", icon: AlertTriangle, label: "Incidencia" },
} as const;

/** Centro de incidencias: lista cronológica y detalle al lado */
export function AlertsWorkspace() {
  const [selected, setSelected] = useState<ServiceAlert | null>(ALERTS[0] ?? null);

  return (
    <div className="h-full overflow-y-auto p-4 scroll-fino lg:overflow-hidden lg:p-5">
      <div className="mx-auto grid h-full max-w-[1180px] gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-stretch">
        <Panel className="flex min-h-0 flex-col overflow-hidden">
          <PanelHeader
            title="Avisos del servicio"
            hint={`${ALERTS.length} registros`}
            action={<Pill tono="verde" punto>{SERVICE_STATUS.title}</Pill>}
          />
          <ul className="min-h-0 flex-1 divide-y divide-borde-suave overflow-y-auto scroll-fino">
            {ALERTS.map((a) => {
              const n = NIVEL[a.level];
              const Icon = n.icon;
              const active = selected?.id === a.id;
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(a)}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                      active ? "bg-fondo" : "hover:bg-fondo",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg",
                        a.level === "info" ? "bg-verde-suave text-verde-oscuro"
                          : a.level === "aviso" ? "bg-ambar-suave text-ambar" : "bg-rojo-suave text-rojo",
                      )}
                    >
                      <Icon size={14} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[12.5px] font-medium">{a.title}</span>
                        <Pill tono={n.tono as never}>{n.label}</Pill>
                        {a.resolved ? <Pill>Resuelto</Pill> : null}
                      </span>
                      <span className="mt-0.5 line-clamp-1 block text-[11.5px] text-tinta-suave">{a.detail}</span>
                      <span className="mt-1 block truncate text-[11px] text-tinta-suave">
                        {a.scope ?? "Toda la línea"}
                      </span>
                    </span>
                    <time className="shrink-0 text-[11px] text-tinta-suave tabular" dateTime={a.date}>
                      {new Date(a.date + "T12:00:00").toLocaleDateString("es-PE", { day: "2-digit", month: "short" })}
                    </time>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>

        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
            >
              <Panel>
                <PanelHeader
                  title="Detalle"
                  action={
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      aria-label="Cerrar detalle"
                      className="grid size-7 place-items-center rounded-lg text-tinta-suave transition-colors hover:bg-fondo hover:text-tinta"
                    >
                      <X size={14} />
                    </button>
                  }
                />
                <div className="p-4">
                  <Pill tono={NIVEL[selected.level].tono as never}>{NIVEL[selected.level].label}</Pill>
                  <h3 className="mt-2.5 text-[14px] leading-snug font-semibold tracking-tight">{selected.title}</h3>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-tinta-suave">{selected.detail}</p>
                  <dl className="mt-4 space-y-2 border-t border-borde-suave pt-4 text-[12px]">
                    <div className="flex justify-between gap-3">
                      <dt className="text-tinta-suave">Publicado</dt>
                      <dd className="font-medium tabular">
                        {new Date(selected.date + "T12:00:00").toLocaleDateString("es-PE", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-tinta-suave">Afecta a</dt>
                      <dd className="max-w-[60%] text-right font-medium">{selected.scope ?? "Toda la línea"}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-tinta-suave">Estado</dt>
                      <dd className="font-medium">{selected.resolved ? "Resuelto" : "Vigente"}</dd>
                    </div>
                  </dl>
                  <p className="mt-4 flex items-start gap-2 rounded-lg bg-fondo px-3 py-2.5 text-[11.5px] text-tinta-suave">
                    <CheckCircle2 size={14} className="mt-px shrink-0 text-verde" />
                    El servicio opera con normalidad en el resto de la red.
                  </p>
                </div>
              </Panel>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
