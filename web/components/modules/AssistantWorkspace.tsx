"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Map as MapIcon, Send, Sparkles, TrainFront } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DIRECTIONS, stationById } from "@/data/stations";
import { SUGGESTIONS, answer, routeFromQuestion } from "@/lib/assistant";
import { buildTrip, crowdingLevel, hhmm, nextTrains } from "@/lib/trip";
import { Panel, PanelHeader, Pill, Button, Stat } from "@/components/ui";
import { cn } from "@/lib/cn";

interface Mensaje {
  from: "bot" | "me";
  text: string;
}

/**
 * Conversación a la izquierda, contexto del viaje a la derecha. Cuando la
 * pregunta menciona dos estaciones, el panel derecho se llena con esa ruta
 * y el botón la carga en el mapa real de la aplicación.
 */
export function AssistantWorkspace({
  now, onShowRoute,
}: {
  now: Date;
  onShowRoute: (originId: string, destinationId: string) => void;
}) {
  const [messages, setMessages] = useState<Mensaje[]>([
    { from: "bot", text: "Hola. Soy el asistente de Línea 1. Pregúntame por una ruta, un horario, la tarifa o la afluencia." },
  ]);
  const [value, setValue] = useState("");
  const [typing, setTyping] = useState(false);
  const [route, setRoute] = useState<{ originId: string; destinationId: string } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, typing]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q || typing) return;
    setMessages((m) => [...m, { from: "me", text: q }]);
    setValue("");
    setTyping(true);
    const found = routeFromQuestion(q);
    if (found) setRoute(found);
    window.setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: "bot", text: answer(q, now) }]);
    }, 560);
  };

  return (
    <div className="grid h-full min-h-0 grid-rows-[1fr_auto] lg:grid-cols-[minmax(0,1fr)_336px] lg:grid-rows-1">
      {/* Conversación */}
      <section className="flex min-h-0 flex-col border-borde lg:border-r">
        <header className="flex items-center gap-2.5 border-b border-borde bg-superficie px-4 py-3">
          <span className="grid size-7 place-items-center rounded-lg bg-verde text-white">
            <Sparkles size={14} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[13px] font-semibold tracking-tight">Asistente Línea 1</h2>
            <p className="text-[11px] text-tinta-suave">Responde con los datos de esta aplicación, sin conexión externa</p>
          </div>
          <Pill tono="verde" punto>En línea</Pill>
        </header>

        <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 py-4 scroll-fino">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                "w-fit max-w-[min(560px,88%)] rounded-lg px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-line",
                m.from === "me"
                  ? "ml-auto bg-verde text-white"
                  : "border border-borde bg-superficie",
              )}
            >
              {m.text}
            </motion.div>
          ))}

          <AnimatePresence>
            {typing ? (
              <motion.span
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="inline-flex gap-1 rounded-lg border border-borde bg-superficie px-3.5 py-3"
              >
                {[0, 1, 2].map((i) => (
                  <motion.i
                    key={i}
                    animate={{ y: [0, -3, 0], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
                    className="size-1.5 rounded-full bg-tinta-suave"
                  />
                ))}
              </motion.span>
            ) : null}
          </AnimatePresence>
          <div ref={endRef} />
        </div>

        <footer className="border-t border-borde bg-superficie px-4 py-3">
          <div className="mb-2.5 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full border border-borde px-3 py-1.5 text-[11.5px] text-tinta-suave transition-colors hover:border-verde hover:text-verde"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); send(value); }}
            className="flex items-center gap-2"
          >
            <label htmlFor="pregunta" className="sr-only">Escribe tu pregunta</label>
            <input
              id="pregunta"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Escribe tu pregunta…"
              className="h-10 min-w-0 flex-1 rounded-lg border border-borde bg-superficie px-3.5 text-[13px] outline-none transition focus:border-verde focus:ring-2 focus:ring-verde/15"
            />
            <button
              type="submit"
              aria-label="Enviar"
              disabled={!value.trim()}
              className="grid size-10 shrink-0 place-items-center rounded-lg bg-verde text-white transition-colors hover:bg-verde-oscuro disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </form>
        </footer>
      </section>

      {/* Contexto */}
      <aside className="min-h-0 overflow-y-auto border-t border-borde bg-fondo p-4 scroll-fino lg:border-t-0">
        <ContextoRuta route={route} now={now} onShowRoute={onShowRoute} />
      </aside>
    </div>
  );
}

function ContextoRuta({
  route, now, onShowRoute,
}: {
  route: { originId: string; destinationId: string } | null;
  now: Date;
  onShowRoute: (originId: string, destinationId: string) => void;
}) {
  if (!route) {
    return (
      <Panel className="p-4">
        <p className="text-[11px] tracking-[.09em] text-tinta-suave uppercase">Contexto</p>
        <p className="mt-2 text-[13px] leading-relaxed text-tinta-suave">
          Nombra dos estaciones en tu pregunta y aquí aparecerá la ruta calculada, con la
          opción de abrirla en el mapa.
        </p>
        <p className="mt-3 rounded-lg bg-fondo px-3 py-2 text-[12px] text-tinta-suave">
          Ejemplo: «de La Cultura a Gamarra»
        </p>
      </Panel>
    );
  }

  const origin = stationById(route.originId)!;
  const destination = stationById(route.destinationId)!;
  const trip = buildTrip(route.originId, route.destinationId, "ida");
  if (!trip) return null;
  const leg = trip.outbound;
  const train = nextTrains(origin.index, leg.direction, 1, now)[0];
  const crowd = crowdingLevel(now.getHours());

  return (
    <Panel className="overflow-hidden">
      <PanelHeader title="Ruta de la conversación" hint={`Dirección ${DIRECTIONS[leg.direction].to}`} />

      <div className="space-y-3 p-4">
        <div className="flex items-center gap-2 text-[13px] font-semibold tracking-tight">
          <span className="truncate">{origin.name}</span>
          <ArrowRight size={14} className="shrink-0 text-tinta-suave" />
          <span className="truncate">{destination.name}</span>
        </div>

        <div className="grid grid-cols-3 gap-3 border-y border-borde-suave py-3">
          <Stat label="Duración" value={leg.minutes} unit="min" />
          <Stat label="Estaciones" value={leg.stops} />
          <Stat label="Pasaje" value={`S/ ${trip.fare.toFixed(2)}`} />
        </div>

        <div className="flex items-center gap-2">
          <Pill tono="verde" punto>
            <TrainFront size={11} /> Próximo tren {train.minutes} min · {hhmm(train.at)}
          </Pill>
        </div>
        <Pill
          tono={
            crowd.key === "cerrado" ? "neutro"
              : crowd.key === "bajo" ? "verde"
                : crowd.key === "medio" ? "ambar" : "rojo"
          }
        >
          {crowd.key === "cerrado" ? "Fuera de servicio" : `Afluencia ${crowd.label.toLowerCase()}`}
        </Pill>

        <Button
          variant="primario"
          className="w-full"
          onClick={() => onShowRoute(route.originId, route.destinationId)}
        >
          <MapIcon size={15} /> Mostrar en el mapa
        </Button>
        <p className="text-[11px] text-tinta-suave">
          Carga esta ruta en el planificador y abre el módulo de mapa.
        </p>
      </div>
    </Panel>
  );
}
