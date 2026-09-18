"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownLeft, Plus, TrainFront, Wallet, X } from "lucide-react";
import { useMemo, useState } from "react";
import { CARD, MOVEMENTS, type Movement } from "@/data/card";
import { LINE } from "@/data/stations";
import { hhmm } from "@/lib/trip";
import { Button, Empty, Panel, PanelHeader, Pill, Stat } from "@/components/ui";
import { cn } from "@/lib/cn";

const IMPORTES = [10, 20, 50] as const;

const FILTROS = [
  { id: "todos", label: "Todos" },
  { id: "viaje", label: "Viajes" },
  { id: "recarga", label: "Recargas" },
] as const;

/**
 * Una sola tarjeta protagonista y la tabla de movimientos al lado. La recarga
 * es una simulación, pero funciona de verdad: cambia el saldo y añade el
 * movimiento correspondiente. Ningún botón está de adorno.
 */
export function CardWorkspace() {
  const [balance, setBalance] = useState(CARD.balance);
  const [movements, setMovements] = useState<Movement[]>(MOVEMENTS);
  const [updated, setUpdated] = useState<string | null>(null);
  const [recharging, setRecharging] = useState(false);
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]["id"]>("todos");

  const viajes = Math.floor(balance / LINE.fare);

  const recargar = (amount: number) => {
    const now = new Date();
    setBalance((b) => +(b + amount).toFixed(2));
    setUpdated(`Actualizado ${hhmm(now)}`);
    setMovements((prev) => [
      {
        id: `r-${now.getTime()}`,
        date: now.toISOString().slice(0, 10),
        time: hhmm(now),
        type: "recarga",
        detail: "Recarga desde la aplicación",
        amount,
      },
      ...prev,
    ]);
    setRecharging(false);
    setFiltro("todos");
  };

  const filtradas = useMemo(
    () => (filtro === "todos" ? movements : movements.filter((m) => m.type === filtro)),
    [movements, filtro],
  );

  const gastado = useMemo(
    () => movements.filter((m) => m.amount < 0).reduce((t, m) => t + Math.abs(m.amount), 0),
    [movements],
  );

  return (
    <div className="h-full overflow-y-auto p-4 scroll-fino lg:overflow-hidden lg:p-5">
      <div className="mx-auto grid max-w-[1180px] gap-4 lg:h-full lg:grid-cols-[340px_minmax(0,1fr)]">

        {/* Columna izquierda: la tarjeta y sus acciones */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="relative overflow-hidden rounded-lg bg-sidebar p-5 text-white"
          >
            <span className="absolute -top-16 -right-14 size-44 rounded-full bg-verde/12" />
            <div className="relative flex items-start justify-between">
              <span className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-lg bg-verde">
                  <TrainFront size={15} strokeWidth={2.3} />
                </span>
                <span className="text-[11.5px] leading-none font-semibold">
                  LÍNEA 1
                  <span className="mt-0.5 block text-[9.5px] font-normal text-white/45">Metro de Lima</span>
                </span>
              </span>
              <Pill tono="neutro" className="bg-white/10 text-white/70">Demostración</Pill>
            </div>

            <p className="relative mt-7 text-[11px] text-white/45">Saldo disponible</p>
            <motion.p
              key={balance}
              initial={{ opacity: 0.4, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="relative text-[30px] leading-none font-semibold tracking-tight tabular"
            >
              {LINE.currency} {balance.toFixed(2)}
            </motion.p>

            <div className="relative mt-6 flex items-end justify-between">
              <span className="text-[12px] tracking-[.16em] text-white/70">{CARD.number}</span>
              <span className="text-[10.5px] text-white/40">
                {updated ?? `Actualizado ${CARD.updated}`}
              </span>
            </div>
          </motion.div>

          {/* Recarga: el único botón de acción, y hace lo que dice */}
          <Panel className="overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              {recharging ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="p-4"
                >
                  <div className="flex items-center gap-2">
                    <p className="flex-1 text-[12.5px] font-medium">Elige el importe</p>
                    <button
                      type="button"
                      onClick={() => setRecharging(false)}
                      aria-label="Cancelar recarga"
                      className="grid size-7 place-items-center rounded-lg text-tinta-suave transition-colors hover:bg-fondo hover:text-tinta"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {IMPORTES.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => recargar(a)}
                        className="rounded-lg border border-borde py-2.5 text-[13px] font-semibold transition-colors hover:border-verde hover:bg-verde-suave hover:text-verde-oscuro"
                      >
                        {LINE.currency} {a}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] text-tinta-suave">
                    Simulación local: no se realiza ningún cobro.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="cta"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="p-4"
                >
                  <Button variant="primario" className="w-full" onClick={() => setRecharging(true)}>
                    <Plus size={15} /> Recargar tarjeta
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </Panel>

          <Panel className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <Stat
                label="Viajes disponibles"
                value={viajes}
                hint={`A ${LINE.currency} ${LINE.fare.toFixed(2)} por viaje`}
              />
              <Stat
                label="Gastado"
                value={`${LINE.currency} ${gastado.toFixed(2)}`}
                hint={`${movements.filter((m) => m.type === "viaje").length} viajes registrados`}
              />
            </div>
            <p className="mt-4 border-t border-borde-suave pt-3 text-[11.5px] text-tinta-suave">
              Titular <span className="font-medium text-tinta">{CARD.holder}</span>
            </p>
          </Panel>
        </div>

        {/* Columna derecha: movimientos con filtro real */}
        <Panel className="flex min-h-0 flex-col overflow-hidden">
          <PanelHeader
            title="Movimientos"
            hint={`${filtradas.length} de ${movements.length} registros`}
            action={
              <div className="flex rounded-lg border border-borde p-0.5">
                {FILTROS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFiltro(f.id)}
                    aria-pressed={filtro === f.id}
                    className={cn(
                      "rounded-[7px] px-2.5 py-1 text-[11.5px] font-medium transition-colors",
                      filtro === f.id ? "bg-verde text-white" : "text-tinta-suave hover:text-tinta",
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            }
          />

          {filtradas.length === 0 ? (
            <Empty icon={<Wallet size={24} />} title="Sin movimientos" hint="No hay registros de este tipo todavía." />
          ) : (
            <div className="min-h-0 flex-1 overflow-auto scroll-fino">
              <table className="w-full min-w-[420px] text-left">
                <thead className="sticky top-0 z-10 bg-superficie">
                  <tr className="border-b border-borde-suave text-[11px] text-tinta-suave">
                    <th className="px-4 py-2 font-medium">Fecha</th>
                    <th className="px-4 py-2 font-medium">Detalle</th>
                    <th className="px-4 py-2 text-right font-medium">Importe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borde-suave">
                  {filtradas.map((m) => (
                    <tr key={m.id} className="transition-colors hover:bg-fondo">
                      <td className="px-4 py-3 text-[12px] whitespace-nowrap text-tinta-suave tabular">
                        {new Date(m.date + "T12:00:00").toLocaleDateString("es-PE", { day: "2-digit", month: "short" })}
                        <span className="ml-1.5 opacity-70">{m.time}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2.5">
                          <span
                            className={cn(
                              "grid size-7 shrink-0 place-items-center rounded-lg",
                              m.type === "recarga" ? "bg-verde-suave text-verde-oscuro" : "bg-fondo text-tinta-suave",
                            )}
                          >
                            {m.type === "recarga" ? <ArrowDownLeft size={14} /> : <TrainFront size={13} />}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[12.5px]">{m.detail}</span>
                            <span className="block text-[11px] text-tinta-suave capitalize">{m.type}</span>
                          </span>
                        </span>
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3 text-right text-[12.5px] font-semibold whitespace-nowrap tabular",
                          m.amount > 0 ? "text-verde-oscuro" : "",
                        )}
                      >
                        {m.amount > 0 ? "+" : "−"} {LINE.currency} {Math.abs(m.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
