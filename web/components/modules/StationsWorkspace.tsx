"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Accessibility, ChevronRight, Search, TrainFront } from "lucide-react";
import { useMemo, useState } from "react";
import { STATIONS, type Station } from "@/data/stations";
import { nextTrains } from "@/lib/trip";
import { Empty, Panel, Pill } from "@/components/ui";
import { cn } from "@/lib/cn";

const ZONAS = [
  { id: "todas", label: "Todas", test: () => true },
  { id: "sur", label: "Sur", test: (s: Station) => s.index <= 9 },
  { id: "centro", label: "Centro", test: (s: Station) => s.index >= 10 && s.index <= 17 },
  { id: "norte", label: "Norte", test: (s: Station) => s.index >= 18 },
] as const;

const norm = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Catálogo de estaciones: lista densa y ordenada, no una cuadrícula de tarjetas */
export function StationsWorkspace({
  now, onSelect,
}: {
  now: Date;
  onSelect: (s: Station) => void;
}) {
  const [query, setQuery] = useState("");
  const [zona, setZona] = useState<(typeof ZONAS)[number]["id"]>("todas");

  const results = useMemo(() => {
    const q = norm(query.trim());
    const filtro = ZONAS.find((z) => z.id === zona)!.test;
    return STATIONS.filter(
      (s) =>
        filtro(s) &&
        (!q || norm(s.name).includes(q) || norm(s.district).includes(q) || norm(s.avenue).includes(q)),
    );
  }, [query, zona]);

  return (
    <div className="h-full p-4 lg:p-5">
      <Panel className="mx-auto flex h-full max-w-[1180px] flex-col overflow-hidden">
        <div className="flex shrink-0 flex-wrap items-center gap-2.5 border-b border-borde-suave px-4 py-3">
          <div className="relative min-w-[200px] flex-1">
            <Search size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-tinta-suave" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar estación, distrito o avenida"
              aria-label="Buscar estación"
              className="h-9 w-full rounded-lg border border-borde bg-fondo pr-3 pl-9 text-[12.5px] outline-none transition focus:border-verde focus:bg-superficie focus:ring-2 focus:ring-verde/15"
            />
          </div>

          <div className="flex rounded-lg border border-borde p-0.5">
            {ZONAS.map((z) => (
              <button
                key={z.id}
                type="button"
                onClick={() => setZona(z.id)}
                aria-pressed={zona === z.id}
                className={cn(
                  "rounded-[7px] px-3 py-1.5 text-[11.5px] font-medium transition-colors",
                  zona === z.id ? "bg-verde text-white" : "text-tinta-suave hover:text-tinta",
                )}
              >
                {z.label}
              </button>
            ))}
          </div>

          <span className="text-[11.5px] whitespace-nowrap text-tinta-suave tabular">
            {results.length} de {STATIONS.length}
          </span>
        </div>

        {results.length === 0 ? (
          <Empty icon={<TrainFront size={26} />} title="Sin resultados" hint="Prueba con otro nombre de estación, distrito o avenida." />
        ) : (
          <ul className="min-h-0 flex-1 divide-y divide-borde-suave overflow-y-auto scroll-fino">
            {results.map((s, i) => {
              const norte = s.index < STATIONS.length - 1 ? nextTrains(s.index, "norte", 1, now)[0] : null;
              return (
                <motion.li
                  key={s.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.18, delay: Math.min(i * 0.012, 0.25) }}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(s)}
                    className="group flex w-full items-center gap-3.5 px-4 py-2.5 text-left transition-colors hover:bg-fondo"
                  >
                    <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-fondo">
                      {s.image ? (
                        <Image src={s.image} alt="" fill sizes="44px" loading="lazy" className="object-cover" />
                      ) : (
                        <span className="grid h-full place-items-center text-inactivo">
                          <TrainFront size={16} />
                        </span>
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">{s.name}</span>
                      <span className="block truncate text-[11.5px] text-tinta-suave">
                        {s.district} · {s.avenue}
                      </span>
                    </span>

                    <span className="hidden shrink-0 items-center gap-1.5 sm:flex">
                      {s.terminal ? <Pill tono="verde">Terminal</Pill> : null}
                      {s.connections?.length ? <Pill tono="azul">{s.connections[0]}</Pill> : null}
                      {s.accessible ? (
                        <span title="Estación accesible" className="text-tinta-suave">
                          <Accessibility size={14} />
                        </span>
                      ) : null}
                    </span>

                    {norte ? (
                      <span className="hidden w-[92px] shrink-0 text-right text-[12px] text-tinta-suave md:block">
                        Próximo <b className="font-semibold text-tinta tabular">{norte.minutes} min</b>
                      </span>
                    ) : null}

                    <ChevronRight size={15} className="shrink-0 text-inactivo transition-colors group-hover:text-tinta-suave" />
                  </button>
                </motion.li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
