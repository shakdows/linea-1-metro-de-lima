"use client";

import Link from "next/link";
import { Bell, Menu, Search, TrainFront } from "lucide-react";
import { useState } from "react";
import { SERVICE_STATUS, STATIONS } from "@/data/stations";
import { cn } from "@/lib/cn";

const STATUS_STYLES = {
  normal: "bg-verde-claro text-verde-oscuro",
  demoras: "bg-amber-50 text-amber-800",
  interrumpido: "bg-red-50 text-red-800",
} as const;

const DOT_STYLES = {
  normal: "bg-verde",
  demoras: "bg-amarillo",
  interrumpido: "bg-rojo",
} as const;

export function Header({
  onPickStation,
  onOpenMenu,
}: {
  onPickStation: (id: string) => void;
  onOpenMenu: () => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const normalize = (t: string) =>
    t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  const results =
    query.trim().length < 2
      ? []
      : STATIONS.filter(
          (s) =>
            normalize(s.name).includes(normalize(query)) ||
            normalize(s.district).includes(normalize(query)) ||
            normalize(s.avenue).includes(normalize(query)),
        ).slice(0, 6);

  return (
    <header className="sticky top-0 z-40 border-b border-borde bg-white/92 backdrop-blur-xl">
      <div className="flex h-[68px] items-center gap-3 px-4 lg:px-6">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Abrir menú"
          className="grid size-10 shrink-0 place-items-center rounded-xl border border-borde text-tinta-suave transition-colors hover:text-tinta lg:hidden"
        >
          <Menu size={19} />
        </button>

        <Link href="/" aria-label="Volver a la portada" className="flex items-center gap-2 lg:hidden">
          <span className="grid size-9 place-items-center rounded-[10px] bg-verde text-white">
            <TrainFront size={18} strokeWidth={2.2} />
          </span>
          <span className="text-[14px] font-extrabold tracking-tight">LÍNEA 1</span>
        </Link>

        <div className="relative hidden max-w-md flex-1 sm:block">
          <Search
            size={17}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-tinta-suave"
          />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Buscar estación, avenida o información..."
            aria-label="Buscar"
            className="h-11 w-full rounded-xl border border-borde bg-fondo pr-4 pl-10 text-[13.5px] outline-none transition focus:border-verde focus:bg-white focus:ring-4 focus:ring-verde/10"
          />

          {open && results.length > 0 ? (
            <ul className="absolute top-[52px] right-0 left-0 z-50 overflow-hidden rounded-xl border border-borde bg-white shadow-alta">
              {results.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onMouseDown={() => {
                      onPickStation(s.id);
                      setQuery("");
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] transition-colors hover:bg-verde-claro"
                  >
                    <TrainFront size={15} className="text-verde" />
                    <span>
                      <span className="block font-semibold">{s.name}</span>
                      <span className="block text-[11.5px] text-tinta-suave">{s.avenue} · {s.district}</span>
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
            aria-label="Notificaciones"
            className="relative grid size-10 place-items-center rounded-xl border border-borde text-tinta-suave transition-colors hover:text-tinta"
          >
            <Bell size={18} />
            <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-rojo ring-2 ring-white" />
          </button>

          <div
            className={cn(
              "hidden items-center gap-2.5 rounded-full px-3.5 py-2 sm:flex",
              STATUS_STYLES[SERVICE_STATUS.level],
            )}
            role="status"
          >
            <span className={cn("relative size-2.5 rounded-full pulso", DOT_STYLES[SERVICE_STATUS.level])} />
            <span className="leading-tight">
              <span className="block text-[12.5px] font-bold">{SERVICE_STATUS.title}</span>
              <span className="block text-[10.5px] opacity-80">{SERVICE_STATUS.detail}</span>
            </span>
          </div>

          <span
            className="grid size-10 place-items-center rounded-full bg-verde-oscuro text-[13px] font-bold text-white"
            aria-label="Cuenta de usuario"
            title="María"
          >
            M
          </span>
        </div>
      </div>
    </header>
  );
}
