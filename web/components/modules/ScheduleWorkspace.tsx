"use client";

import { useMemo, useState } from "react";
import { DIRECTIONS, HEADWAY, LINE, STATIONS, type Direction } from "@/data/stations";
import { Panel, PanelHeader, Pill } from "@/components/ui";
import { cn } from "@/lib/cn";

type Dia = "laborable" | "sabado" | "domingo";

const DIAS: { id: Dia; label: string; cierre: string; factor: number }[] = [
  { id: "laborable", label: "Lunes a viernes", cierre: LINE.closingTime, factor: 1 },
  { id: "sabado", label: "Sábado", cierre: "22:00", factor: 1.35 },
  { id: "domingo", label: "Domingo y feriados", cierre: "22:00", factor: 1.6 },
];

/** Horarios en tabla: comparar estaciones es más fácil en filas que en tarjetas */
export function ScheduleWorkspace() {
  const [dia, setDia] = useState<Dia>("laborable");
  const [direccion, setDireccion] = useState<Direction>("norte");
  const [query, setQuery] = useState("");

  const config = DIAS.find((d) => d.id === dia)!;
  const punta = Math.round(HEADWAY[8] * config.factor);
  const valle = Math.round(HEADWAY[11] * config.factor);

  const filas = useMemo(() => {
    const norm = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const q = norm(query.trim());
    const lista = direccion === "norte" ? STATIONS : [...STATIONS].reverse();
    return lista
      .filter((s) => (direccion === "norte" ? s.index < STATIONS.length - 1 : s.index > 0))
      .filter((s) => !q || norm(s.name).includes(q) || norm(s.district).includes(q))
      .map((s, i) => {
        /* El primer tren sale del terminal y va sumando el tiempo entre estaciones */
        const desde = direccion === "norte" ? 0 : STATIONS.length - 1;
        let acumulado = 0;
        const paso = direccion === "norte" ? 1 : -1;
        for (let k = desde + paso; k !== s.index + paso; k += paso) {
          acumulado += STATIONS[direccion === "norte" ? k : k + 1]?.estimatedTime ?? 2;
        }
        const suma = (hhmm: string, min: number) => {
          const [h, m] = hhmm.split(":").map(Number);
          const t = h * 60 + m + min;
          return `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
        };
        return {
          station: s,
          primero: suma(LINE.openingTime, acumulado),
          ultimo: suma(config.cierre, acumulado - 30),
          orden: i,
        };
      });
  }, [direccion, query, config]);

  return (
    <div className="h-full p-4 lg:p-5">
      <Panel className="mx-auto flex h-full max-w-[1180px] flex-col overflow-hidden">
        <PanelHeader
          title="Horarios por estación"
          hint={`Frecuencia estimada: ${punta} min en hora punta · ${valle} min en hora valle`}
          action={<Pill tono="neutro">Estimación</Pill>}
        />

        <div className="flex flex-wrap items-center gap-2.5 border-b border-borde-suave px-4 py-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrar estación"
            aria-label="Filtrar estación"
            className="h-9 w-[180px] rounded-lg border border-borde bg-fondo px-3 text-[12.5px] outline-none transition focus:border-verde focus:bg-superficie focus:ring-2 focus:ring-verde/15"
          />

          <div className="flex rounded-lg border border-borde p-0.5">
            {(["norte", "sur"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDireccion(d)}
                aria-pressed={direccion === d}
                className={cn(
                  "rounded-[7px] px-3 py-1.5 text-[11.5px] font-medium whitespace-nowrap transition-colors",
                  direccion === d ? "bg-verde text-white" : "text-tinta-suave hover:text-tinta",
                )}
              >
                Hacia {DIRECTIONS[d].to}
              </button>
            ))}
          </div>

          <div className="flex rounded-lg border border-borde p-0.5">
            {DIAS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDia(d.id)}
                aria-pressed={dia === d.id}
                className={cn(
                  "rounded-[7px] px-3 py-1.5 text-[11.5px] font-medium whitespace-nowrap transition-colors",
                  dia === d.id ? "bg-verde text-white" : "text-tinta-suave hover:text-tinta",
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto scroll-fino">
          <table className="w-full min-w-[520px] text-left">
            <thead className="sticky top-0 z-10 bg-superficie">
              <tr className="border-b border-borde-suave text-[11px] text-tinta-suave">
                <th className="px-4 py-2 font-medium">Estación</th>
                <th className="px-4 py-2 font-medium">Distrito</th>
                <th className="px-4 py-2 text-right font-medium">Primer tren</th>
                <th className="px-4 py-2 text-right font-medium">Último tren</th>
                <th className="px-4 py-2 text-right font-medium">Frecuencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borde-suave">
              {filas.map(({ station, primero, ultimo }) => (
                <tr key={station.id} className="transition-colors hover:bg-fondo">
                  <td className="px-4 py-2.5 text-[12.5px] font-medium whitespace-nowrap">
                    {station.name}
                    {station.terminal ? (
                      <Pill tono="verde" className="ml-2">Terminal</Pill>
                    ) : null}
                  </td>
                  <td className="px-4 py-2.5 text-[12px] whitespace-nowrap text-tinta-suave">{station.district}</td>
                  <td className="px-4 py-2.5 text-right text-[12.5px] whitespace-nowrap tabular">{primero}</td>
                  <td className="px-4 py-2.5 text-right text-[12.5px] whitespace-nowrap tabular">{ultimo}</td>
                  <td className="px-4 py-2.5 text-right text-[12px] whitespace-nowrap text-tinta-suave tabular">
                    {punta}–{valle} min
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="border-t border-borde-suave px-4 py-3 text-[11.5px] text-tinta-suave">
          Horarios calculados a partir del tiempo estimado entre estaciones. Confirma siempre el
          horario oficial de tu estación.
        </p>
      </Panel>
    </div>
  );
}
