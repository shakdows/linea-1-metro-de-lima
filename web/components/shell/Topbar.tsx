"use client";

import Link from "next/link";
import { Bell, Search, TrainFront } from "lucide-react";
import { useState } from "react";
import { SERVICE_STATUS, STATIONS } from "@/data/stations";
import { MODULE_TITLES, type ModuleId } from "./navigation";
import { cn } from "@/lib/cn";

const ESTADO = {
  normal: { pill: "bg-verde-suave text-verde-oscuro", dot: "bg-verde" },
  demoras: { pill: "bg-ambar-suave text-ambar", dot: "bg-ambar" },
  interrumpido: { pill: "bg-rojo-suave text-rojo", dot: "bg-rojo" },
} as const;

export function Topbar({
  module,
  onPickStation,
  onNavigate,
}: {
  module: ModuleId;
  onPickStation: (id: string) => void;
  onNavigate: (id: ModuleId) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const estado = ESTADO[SERVICE_STATUS.level];

  const norm = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const results =
    query.trim().length < 2
      ? []
      : STATIONS.filter(
          (s) => norm(s.name).includes(norm(query)) || norm(s.avenue).includes(norm(query)),
        ).slice(0, 6);

  return (
    <header className="flex h-[56px] shrink-0 items-center gap-4 border-b border-borde bg-superficie px-4 lg:px-5">
      <Link href="/" aria-label="Volver a la portada" className="flex items-center gap-2 lg:hidden">
        <span className="grid size-7 place-items-center rounded-lg bg-verde text-white">
          <TrainFront size={15} strokeWidth={2.3} />
        </span>
      </Link>

      <h1 className="hidden shrink-0 text-[14px] font-semibold tracking-tight sm:block">{MODULE_TITLES[module]}</h1>

      <div className="relative max-w-[340px] min-w-0 flex-1">
        <Search size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-tinta-suave" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 140)}
          placeholder="Buscar estación o avenida"
          aria-label="Buscar"
          className="h-9 w-full rounded-lg border border-borde bg-fondo pr-3 pl-9 text-[12.5px] outline-none transition placeholder:text-tinta-suave focus:border-verde focus:bg-superficie focus:ring-2 focus:ring-verde/15"
        />
        {open && results.length > 0 ? (
          <ul className="absolute top-[42px] right-0 left-0 z-50 overflow-hidden rounded-lg border border-borde bg-superficie shadow-flotante">
            {results.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onMouseDown={() => { onPickStation(s.id); setQuery(""); setOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-fondo"
                >
                  <TrainFront size={14} className="shrink-0 text-tinta-suave" />
                  <span className="min-w-0">
                    <span className="block truncate text-[12.5px] font-medium">{s.name}</span>
                    <span className="block truncate text-[11px] text-tinta-suave">{s.avenue}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => onNavigate("avisos")}
          className={cn(
            "hidden items-center gap-2 rounded-full px-3 py-1.5 text-[11.5px] font-medium transition-opacity hover:opacity-85 sm:inline-flex",
            estado.pill,
          )}
        >
          <span className={cn("size-1.5 rounded-full", estado.dot)} />
          {SERVICE_STATUS.title}
        </button>

        <button
          type="button"
          onClick={() => onNavigate("avisos")}
          aria-label="Avisos"
          className="relative grid size-9 place-items-center rounded-lg border border-borde text-tinta-suave transition-colors hover:text-tinta"
        >
          <Bell size={16} />
          <span className="absolute top-2 right-2 size-1.5 rounded-full bg-rojo" />
        </button>

        <span
          className="hidden size-9 place-items-center rounded-full bg-sidebar text-[11.5px] font-semibold text-white sm:grid"
          title="Cuenta"
        >
          M
        </span>
      </div>
    </header>
  );
}
