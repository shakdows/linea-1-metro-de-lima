"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Search, TrainFront } from "lucide-react";
import { useMemo, useState } from "react";
import { STATIONS, type Station } from "@/data/stations";

const normalize = (t: string) =>
  t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Listado de las 26 estaciones con su fotografía, buscable */
export function StationList({ onSelect }: { onSelect: (s: Station) => void }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return STATIONS;
    return STATIONS.filter(
      (s) =>
        normalize(s.name).includes(q) ||
        normalize(s.district).includes(q) ||
        normalize(s.avenue).includes(q),
    );
  }, [query]);

  return (
    <div className="flex flex-col lg:h-full">
      <div className="shrink-0 p-4 pb-3">
        <h2 className="mb-3 text-[17px] font-extrabold tracking-tight">Estaciones</h2>
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-tinta-suave" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar estación, avenida o distrito…"
            aria-label="Buscar estación"
            className="h-11 w-full rounded-xl border border-borde bg-fondo pr-4 pl-10 text-[13px] outline-none transition focus:border-verde focus:bg-white focus:ring-4 focus:ring-verde/10"
          />
        </div>
        <p className="mt-2 text-[11.5px] text-tinta-suave">
          {results.length} de {STATIONS.length} estaciones
        </p>
      </div>

      <div className="space-y-2 px-4 pb-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto scroll-fino">
        {results.map((s, i) => (
          <motion.button
            key={s.id}
            type="button"
            onClick={() => onSelect(s)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: Math.min(i * 0.015, 0.25) }}
            className="group flex w-full items-center gap-3 overflow-hidden rounded-xl border border-borde bg-white p-1.5 pr-3 text-left transition-all hover:-translate-y-0.5 hover:border-verde hover:shadow-media"
          >
            <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-fondo">
              {s.image ? (
                <Image
                  src={s.image}
                  alt=""
                  fill
                  sizes="56px"
                  loading="lazy"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <span className="grid h-full place-items-center text-tinta-suave">
                  <TrainFront size={20} />
                </span>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-bold">{s.name}</span>
              <span className="flex items-center gap-1 truncate text-[11.5px] text-tinta-suave">
                <MapPin size={11} /> {s.avenue}
              </span>
            </span>
            {s.terminal ? (
              <span className="shrink-0 rounded-full bg-verde-claro px-2 py-0.5 text-[10px] font-bold text-verde-oscuro">
                Terminal
              </span>
            ) : null}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
