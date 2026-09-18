"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  CreditCard,
  Gift,
  History,
  MoreHorizontal,
  Send,
  Sparkles,
  TrainFront,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ALERTS, DIRECTIONS, LINE, type Station } from "@/data/stations";
import { CROWD_COLORS, bestSlot, crowdingLevel, hhmm, nextTrains } from "@/lib/trip";
import { SUGGESTIONS, answer, routeFromQuestion } from "@/lib/assistant";
import { Card, CardHeader, DataTag } from "./Card";

/* ------------------------------------------------------- próximos trenes */
export function NextTrains({ station, now }: { station: Station; now: Date }) {
  const canNorth = station.index < 25;
  const canSouth = station.index > 0;

  return (
    <Card className="p-5">
      <CardHeader
        icon={<TrainFront size={18} />}
        title="Próximos trenes"
        subtitle={`Desde ${station.name}`}
        action={<DataTag kind="estimado" />}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {(["norte", "sur"] as const)
          .filter((d) => (d === "norte" ? canNorth : canSouth))
          .map((direction) => (
            <div key={direction} className="overflow-hidden rounded-xl bg-fondo">
              <p className="px-4 pt-3 pb-2 text-[12.5px] font-bold">
                Hacia {DIRECTIONS[direction].to}
              </p>
              {nextTrains(station.index, direction, 3, now).map((t, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[auto_1fr_auto] items-baseline gap-2.5 border-t border-borde px-4 py-2"
                >
                  <span
                    className={`text-[15px] font-extrabold tracking-tight ${i === 0 ? "text-verde" : ""}`}
                  >
                    {t.minutes} min
                  </span>
                  <span className="text-[12px] font-medium text-tinta-suave">{t.status}</span>
                  <span className="text-[11.5px] text-tinta-suave tabular-nums">
                    {hhmm(t.at)}
                  </span>
                </div>
              ))}
            </div>
          ))}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------- afluencia */
export function CrowdingChart({ now }: { now: Date }) {
  const [selected, setSelected] = useState<number | null>(null);
  const hours = Object.keys(crowdMap()).map(Number).sort((a, b) => a - b);
  const slot = bestSlot();
  const shown = selected ?? now.getHours();
  const level = crowdingLevel(shown);

  return (
    <Card className="p-5">
      <CardHeader
        icon={<Users size={18} />}
        title="¿A qué hora conviene viajar?"
        subtitle="Nivel de afluencia estimada por franja horaria"
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="flex h-[112px] items-end gap-[3px]" onMouseLeave={() => setSelected(null)}>
            {hours.map((h) => {
              const l = crowdingLevel(h);
              return (
                <button
                  key={h}
                  type="button"
                  onMouseEnter={() => setSelected(h)}
                  onFocus={() => setSelected(h)}
                  onClick={() => setSelected(h)}
                  aria-label={`${h}:00, afluencia ${l.label.toLowerCase()}, ${l.value}%`}
                  className="flex h-full flex-1 items-end rounded transition-transform hover:scale-y-[1.03]"
                >
                  <motion.span
                    initial={{ height: 0 }}
                    animate={{ height: `${l.value}%` }}
                    transition={{ duration: 0.5, delay: 0.02 * (h - 5), ease: "easeOut" }}
                    style={{
                      backgroundColor: CROWD_COLORS[l.key],
                      boxShadow: h === shown ? "0 0 0 2px #121816" : undefined,
                    }}
                    className="w-full rounded-t-[4px]"
                  />
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[10.5px] font-semibold text-tinta-suave tabular-nums">
            {hours.filter((h) => h % 2 === 0).map((h) => (
              <span key={h}>{h}</span>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-[11.5px] text-tinta-suave">
            {(
              [
                ["bajo", "Baja"],
                ["medio", "Media"],
                ["alto", "Alta"],
                ["muy-alto", "Muy alta"],
              ] as const
            ).map(([key, label]) => (
              <span key={key} className="inline-flex items-center gap-1.5">
                <i className="size-2 rounded-full" style={{ backgroundColor: CROWD_COLORS[key] }} />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-verde-claro p-4 lg:w-[190px]">
          <p className="text-[11.5px] font-bold text-verde-oscuro">⭐ Mejor horario para viajar</p>
          <p className="mt-1 text-[16px] font-extrabold tracking-tight">{slot.label}</p>
          <p className="mt-1 text-[11.5px] text-tinta-suave">Menor afluencia estimada</p>
          <p className="mt-3 border-t border-verde/20 pt-3 text-[11.5px]">
            <strong className="text-[13px]">{String(shown).padStart(2, "0")}:00</strong> ·{" "}
            {level.label} · {level.value}% de ocupación
          </p>
        </div>
      </div>
    </Card>
  );
}

function crowdMap() {
  return {
    5: 1, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1, 12: 1, 13: 1,
    14: 1, 15: 1, 16: 1, 17: 1, 18: 1, 19: 1, 20: 1, 21: 1, 22: 1,
  } as Record<number, number>;
}

/* ------------------------------------------------------------- mi tarjeta */
export function MetroCard() {
  const balance = 18.5;
  const [updated, setUpdated] = useState<string | null>(null);

  return (
    <Card className="p-5">
      <CardHeader
        icon={<CreditCard size={18} />}
        title="Mi tarjeta"
        action={<DataTag kind="demo" />}
      />

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-verde to-verde-oscuro p-4 text-white shadow-[0_8px_22px_rgba(0,107,44,.28)]">
        <span className="absolute -right-10 -bottom-16 size-40 rounded-full bg-white/8" />
        <div className="relative flex items-start justify-between">
          <span className="flex items-center gap-2">
            <TrainFront size={20} />
            <span className="text-[12px] leading-tight font-extrabold">
              LÍNEA 1<span className="block text-[9.5px] font-semibold opacity-75">Metro de Lima</span>
            </span>
          </span>
          <Wallet size={18} className="opacity-70" />
        </div>
        <p className="relative mt-5 text-[12px] opacity-80">Saldo disponible</p>
        <p className="relative text-[26px] leading-tight font-extrabold tracking-tight">
          {LINE.currency} {balance.toFixed(2)}
        </p>
        <p className="relative mt-2 text-[12.5px] font-bold tracking-[.2em] opacity-90">•••• 4821</p>
      </div>

      <p className="mt-3 text-[11.5px] text-tinta-suave">
        {updated ?? "Actualizado hoy"} · alcanza para{" "}
        <strong className="text-tinta">{Math.floor(balance / LINE.fare)} viajes</strong>
      </p>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {(
          [
            ["Recargar", Wallet],
            ["Historial", History],
            ["Beneficios", Gift],
            ["Más", MoreHorizontal],
          ] as const
        ).map(([label, Icon]) => (
          <button
            key={label}
            type="button"
            onClick={() =>
              setUpdated(`Actualizado ${hhmm(new Date())}`)
            }
            className="flex flex-col items-center gap-1.5 rounded-xl bg-fondo py-2.5 text-[10.5px] font-semibold text-tinta-suave transition-colors hover:bg-verde-claro hover:text-verde-oscuro"
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------------- avisos */
export function ServiceAlerts() {
  const [showAll, setShowAll] = useState(false);
  const list = showAll ? ALERTS : ALERTS.slice(0, 2);

  return (
    <Card className="p-5">
      <CardHeader
        icon={<Bell size={18} />}
        title="Avisos del servicio"
        action={
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="text-[12.5px] font-bold text-verde transition-colors hover:text-verde-oscuro"
          >
            {showAll ? "Ver menos" : "Ver todos"}
          </button>
        }
      />
      <div className="space-y-2.5">
        {list.map((alert) => (
          <motion.article
            key={alert.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`rounded-xl p-3.5 ${alert.level === "aviso" ? "bg-amber-50" : "bg-fondo"}`}
          >
            <h3 className="text-[13px] font-bold">{alert.title}</h3>
            <p className="mt-1 text-[12px] leading-snug text-tinta-suave">{alert.detail}</p>
          </motion.article>
        ))}
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------- asistente */
export function AIChat({ onShowRoute }: { onShowRoute?: (originId: string, destinationId: string) => void } = {}) {
  const [messages, setMessages] = useState<{ from: "bot" | "me"; text: string }[]>([
    {
      from: "bot",
      text: "Hola 👋 Soy el asistente de Línea 1. Puedo ayudarte con rutas, horarios y estaciones.",
    },
  ]);
  const [value, setValue] = useState("");
  const [typing, setTyping] = useState(false);
  const [foundRoute, setFoundRoute] = useState<{ originId: string; destinationId: string } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { from: "me", text }]);
    setValue("");
    setTyping(true);
    setFoundRoute(routeFromQuestion(text));
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: "bot", text: answer(text) }]);
    }, 620);
  };

  return (
    <Card className="flex flex-col p-5">
      <CardHeader icon={<Sparkles size={18} />} title="Asistente Línea 1" />

      <div className="max-h-[260px] flex-1 space-y-2.5 overflow-y-auto pr-1 scroll-fino">
        {messages.map((m, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed whitespace-pre-line ${
              m.from === "me"
                ? "ml-auto rounded-br-md bg-verde-claro font-semibold text-verde-oscuro"
                : "rounded-bl-md bg-fondo"
            }`}
          >
            {m.text}
          </motion.p>
        ))}
        <AnimatePresence>
          {typing ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="inline-flex gap-1 rounded-2xl rounded-bl-md bg-fondo px-4 py-3"
            >
              {[0, 1, 2].map((i) => (
                <motion.i
                  key={i}
                  animate={{ y: [0, -3, 0], opacity: [0.35, 1, 0.35] }}
                  transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
                  className="size-1.5 rounded-full bg-tinta-suave"
                />
              ))}
            </motion.span>
          ) : null}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      {foundRoute && onShowRoute ? (
        <button
          type="button"
          onClick={() => onShowRoute(foundRoute.originId, foundRoute.destinationId)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-verde py-2.5 text-[12.5px] font-bold text-white transition-colors hover:bg-verde-oscuro"
        >
          Mostrar en el mapa
        </button>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setValue(s)}
            className="rounded-full border border-borde bg-white px-3 py-1.5 text-[11px] font-semibold text-tinta-suave transition-colors hover:border-verde hover:bg-verde-claro hover:text-verde"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(value);
        }}
        className="mt-3 flex items-center gap-2"
      >
        <label htmlFor="pregunta" className="sr-only">
          Escribe tu pregunta
        </label>
        <input
          id="pregunta"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Escribe tu pregunta..."
          className="h-11 min-w-0 flex-1 rounded-full border border-borde bg-white px-4 text-[13px] outline-none transition focus:border-verde focus:ring-4 focus:ring-verde/10"
        />
        <button
          type="submit"
          aria-label="Enviar"
          className="grid size-11 shrink-0 place-items-center rounded-full bg-verde text-white transition-colors hover:bg-verde-oscuro"
        >
          <Send size={17} />
        </button>
      </form>
    </Card>
  );
}
