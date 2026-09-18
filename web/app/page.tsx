"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, Bell, Clock, CreditCard, History, LayoutGrid, Map, MousePointerClick,
  Route, Sparkles, TrainFront,
} from "lucide-react";
import { LINE, STATIONS } from "@/data/stations";
import { LineaDiagrama } from "@/components/landing/LineaDiagrama";

const APP = "/app/";

/* En GitHub Pages el sitio cuelga de /<repo>/, así que los archivos estáticos
   (que no son rutas de Next) necesitan el prefijo a mano */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const CLASICO = `${BASE}/clasico/index.html`;
const REDISENO = `${BASE}/rediseno/index.html`;

const CIFRAS = [
  { valor: STATIONS.length, etiqueta: "estaciones" },
  { valor: "2", etiqueta: "terminales" },
  { valor: `${LINE.currency} ${LINE.fare.toFixed(2)}`, etiqueta: "tarifa plana" },
  { valor: `${LINE.openingTime}–${LINE.closingTime}`, etiqueta: "horario" },
];

const MODULOS = [
  { icon: LayoutGrid, nombre: "Inicio", texto: "Tu próximo viaje, el estado de la línea y tus accesos en una sola vista." },
  { icon: Map, nombre: "Mapa", texto: "Mapa geográfico real con el tren avanzando sobre las coordenadas de la línea." },
  { icon: Route, nombre: "Planificar viaje", texto: "Ida y vuelta calculadas en paralelo, con la secuencia de paradas." },
  { icon: TrainFront, nombre: "Estaciones", texto: "Las 26 estaciones con fotografía, distrito, salidas y próximos trenes." },
  { icon: CreditCard, nombre: "Tarjeta", texto: "Saldo, recarga y movimientos, con el detalle de cada viaje." },
  { icon: Clock, nombre: "Horarios", texto: "Primer y último tren por estación, sentido y tipo de día." },
  { icon: Bell, nombre: "Avisos", texto: "Centro de incidencias con el alcance y el estado de cada aviso." },
  { icon: Sparkles, nombre: "Asistente", texto: "Pregunta en lenguaje natural y la ruta aparece lista para el mapa." },
];

const PASOS = [
  { n: "01", titulo: "Elige origen y destino", texto: "Desde el planificador, desde el mapa o preguntándoselo al asistente." },
  { n: "02", titulo: "Mira el recorrido", texto: "El tren avanza por el trazado real, se detiene en cada estación y marca las recorridas." },
  { n: "03", titulo: "Consulta lo que necesites", texto: "Próximos trenes, afluencia, salidas y avisos, sin salir de la aplicación." },
];

const FOTOS = [
  { src: "/estaciones/gamarra.webp", nombre: "Gamarra" },
  { src: "/estaciones/la-cultura.webp", nombre: "La Cultura" },
  { src: "/estaciones/bayovar.webp", nombre: "Bayóvar" },
];

export default function Portada() {
  return (
    <div className="min-h-dvh bg-superficie">
      <Cabecera />
      <Hero />
      <Cifras />
      <Modulos />
      <Mapa />
      <Pasos />
      <Cierre />
      <Pie />
    </div>
  );
}

/* ------------------------------------------------------------- cabecera */

function Cabecera() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-sidebar/95 backdrop-blur">
      <div className="mx-auto flex h-[60px] max-w-[1180px] items-center gap-4 px-5">
        <span className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-verde text-white">
            <TrainFront size={17} strokeWidth={2.3} />
          </span>
          <span className="leading-none">
            <span className="block text-[13.5px] font-semibold tracking-tight text-white">LÍNEA 1</span>
            <span className="mt-0.5 block text-[10.5px] text-white/40">Metro de Lima</span>
          </span>
        </span>

        <nav className="ml-6 hidden items-center gap-6 md:flex" aria-label="Secciones">
          {[["#modulos", "Módulos"], ["#mapa", "El mapa"], ["#como", "Cómo funciona"]].map(([href, label]) => (
            <a key={href} href={href} className="text-[12.5px] text-white/50 transition-colors hover:text-white">
              {label}
            </a>
          ))}
        </nav>

        <Link
          href={APP}
          className="ml-auto inline-flex h-9 items-center gap-2 rounded-lg bg-verde px-4 text-[12.5px] font-semibold text-white transition-colors hover:bg-verde-oscuro"
        >
          Entrar <ArrowRight size={15} />
        </Link>
      </div>
    </header>
  );
}

/* ----------------------------------------------------------------- hero */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-sidebar">
      <span className="pointer-events-none absolute -top-40 -right-32 size-[560px] rounded-full bg-verde/12 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-52 -left-40 size-[480px] rounded-full bg-azul/8 blur-3xl" />

      <div className="relative mx-auto grid max-w-[1180px] gap-10 px-5 py-16 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/12 px-3 py-1.5 text-[11.5px] font-medium text-white/60">
            <span className="size-1.5 rounded-full bg-verde" />
            Interfaz conceptual · proyecto académico
          </span>

          <h1 className="mt-6 text-[38px] leading-[1.05] font-semibold tracking-[-0.02em] text-white sm:text-[52px] lg:text-[60px]">
            Resuelve tu viaje en la
            <br className="hidden sm:block" /> <span className="text-verde">Línea 1</span> de Lima.
          </h1>

          <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-white/55 sm:text-[16.5px]">
            No es una web informativa: es una aplicación. Mapa geográfico con el tren
            avanzando sobre el trazado real, planificador de ida y vuelta, horarios,
            afluencia, tarjeta y un asistente que entiende lo que le preguntas.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={APP}
              className="inline-flex h-12 items-center gap-2.5 rounded-lg bg-verde px-6 text-[14px] font-semibold text-white transition-all hover:bg-verde-oscuro active:scale-[.985]"
            >
              Entrar a la aplicación <ArrowRight size={17} />
            </Link>
            <a
              href="#modulos"
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/15 px-5 text-[13.5px] font-medium text-white/75 transition-colors hover:border-white/30 hover:text-white"
            >
              Ver qué incluye
            </a>
          </div>

          <p className="mt-5 flex items-center gap-2 text-[12px] text-white/35">
            <MousePointerClick size={13} />
            Sin registro y sin instalar nada. Funciona en el navegador.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="hidden justify-self-center lg:block"
        >
          <LineaDiagrama className="h-[520px] w-auto" />
        </motion.div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- cifras */

function Cifras() {
  return (
    <section className="border-y border-borde bg-fondo">
      <dl className="mx-auto grid max-w-[1180px] grid-cols-2 gap-px bg-borde sm:grid-cols-4">
        {CIFRAS.map((c) => (
          <div key={c.etiqueta} className="flex flex-col-reverse items-center gap-1 bg-fondo px-5 py-6">
            <dt className="text-[11.5px] text-tinta-suave">{c.etiqueta}</dt>
            <dd className="text-[24px] leading-none font-semibold tracking-tight tabular">{c.valor}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* -------------------------------------------------------------- módulos */

function Modulos() {
  return (
    <section id="modulos" className="scroll-mt-[60px] px-5 py-16 lg:py-20">
      <div className="mx-auto max-w-[1180px]">
        <Titulo
          etiqueta="Ocho módulos"
          titulo="Una aplicación, no una página con secciones"
          texto="La barra lateral y la superior no se mueven: solo cambia el área de trabajo. Cada módulo resuelve una cosa y no compite con las demás."
        />

        <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-borde bg-borde sm:grid-cols-2 lg:grid-cols-4">
          {MODULOS.map(({ icon: Icon, nombre, texto }, i) => (
            <motion.article
              key={nombre}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.24) }}
              className="group bg-superficie p-5 transition-colors hover:bg-fondo"
            >
              <span className="grid size-9 place-items-center rounded-lg bg-verde-suave text-verde-oscuro transition-colors group-hover:bg-verde group-hover:text-white">
                <Icon size={17} strokeWidth={2} />
              </span>
              <h3 className="mt-3.5 text-[13.5px] font-semibold tracking-tight">{nombre}</h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-tinta-suave">{texto}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- mapa */

function Mapa() {
  return (
    <section id="mapa" className="scroll-mt-[60px] border-y border-borde bg-fondo px-5 py-16 lg:py-20">
      <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <Titulo
            etiqueta="El centro de todo"
            titulo="El tren se mueve sobre la línea real"
            texto="El recorrido no está grabado: se calcula a partir de las estaciones que elijas. El tren interpola entre coordenadas, se orienta según el rumbo y se detiene en cada parada."
            alineado
          />

          <ul className="mt-7 space-y-3.5">
            {[
              "Mapa geográfico (OpenStreetMap) con las 26 estaciones y las avenidas por las que pasa.",
              "Ida en verde, vuelta en azul y el resto de la línea atenuado.",
              "Iniciar, pausar, continuar, reiniciar y arrancar la vuelta: ningún botón es de adorno.",
              "Toca una estación y se abre su ficha al lado, sin perder el mapa de vista.",
            ].map((t) => (
              <li key={t} className="flex gap-3 text-[13.5px] leading-relaxed text-tinta-suave">
                <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-verde" />
                {t}
              </li>
            ))}
          </ul>

          <Link
            href={APP}
            className="mt-8 inline-flex h-11 items-center gap-2 rounded-lg bg-verde px-5 text-[13.5px] font-semibold text-white transition-colors hover:bg-verde-oscuro"
          >
            Abrir el mapa <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {FOTOS.map((f, i) => (
            <motion.figure
              key={f.src}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              className={`relative overflow-hidden rounded-lg border border-borde bg-superficie ${
                i === 1 ? "mt-8" : ""
              }`}
            >
              <div className="relative aspect-[3/4]">
                <Image src={f.src} alt={`Estación ${f.nombre}`} fill sizes="(min-width:1024px) 180px, 30vw" className="object-cover" />
              </div>
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-sidebar/90 to-transparent px-3 pt-8 pb-2.5 text-[11.5px] font-medium text-white">
                {f.nombre}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- pasos */

function Pasos() {
  return (
    <section id="como" className="scroll-mt-[60px] px-5 py-16 lg:py-20">
      <div className="mx-auto max-w-[1180px]">
        <Titulo etiqueta="Cómo funciona" titulo="Tres pasos y estás viajando" />

        <ol className="mt-10 grid gap-px overflow-hidden rounded-lg border border-borde bg-borde md:grid-cols-3">
          {PASOS.map((p) => (
            <li key={p.n} className="bg-superficie p-6">
              <span className="text-[12px] font-semibold tracking-[.1em] text-verde">{p.n}</span>
              <h3 className="mt-2.5 text-[15px] font-semibold tracking-tight">{p.titulo}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-tinta-suave">{p.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- cierre */

function Cierre() {
  return (
    <section className="px-5 pb-16 lg:pb-20">
      <div className="relative mx-auto max-w-[1180px] overflow-hidden rounded-lg bg-sidebar px-6 py-14 text-center sm:px-10">
        <span className="pointer-events-none absolute -top-24 left-1/2 size-[420px] -translate-x-1/2 rounded-full bg-verde/12 blur-3xl" />
        <div className="relative">
          <h2 className="text-[26px] leading-tight font-semibold tracking-tight text-white sm:text-[32px]">
            Entra y planifica tu viaje
          </h2>
          <p className="mx-auto mt-3 max-w-[46ch] text-[14px] leading-relaxed text-white/50">
            Toda la aplicación funciona en el navegador, sin registro y sin enviar nada
            a ningún servidor.
          </p>
          <Link
            href={APP}
            className="mt-7 inline-flex h-12 items-center gap-2.5 rounded-lg bg-verde px-7 text-[14px] font-semibold text-white transition-all hover:bg-verde-oscuro active:scale-[.985]"
          >
            Entrar a la aplicación <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ pie */

function Pie() {
  return (
    <footer className="border-t border-borde px-5 py-9">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid size-7 place-items-center rounded-lg bg-verde text-white">
            <TrainFront size={15} strokeWidth={2.3} />
          </span>
          <span className="text-[12.5px] leading-none font-semibold">
            LÍNEA 1
            <span className="mt-0.5 block text-[10.5px] font-normal text-tinta-suave">Metro de Lima</span>
          </span>
        </div>

        <div className="max-w-[58ch] space-y-3">
          <p className="text-[11.5px] leading-relaxed text-tinta-suave">
            Interfaz conceptual para fines académicos. No representa el sitio oficial de
            Línea 1 ni tiene relación con su operador. Los nombres, el orden y los
            distritos de las estaciones son reales; las coordenadas son aproximadas y los
            horarios, frecuencias, afluencia y saldos son estimaciones simuladas.
          </p>
          <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-tinta-suave">
              <History size={12} /> Versiones anteriores, conservadas como archivo
            </p>
            <ul className="space-y-1 text-[11.5px] text-tinta-suave">
              <li>
                <a href={REDISENO} className="font-medium text-tinta underline decoration-borde underline-offset-4 transition-colors hover:decoration-verde">
                  Rediseño tipo panel de operación
                </a>
                <span className="ml-1.5 opacity-80">— un módulo a la vez, sin mapa permanente.</span>
              </li>
              <li>
                <a href={CLASICO} className="font-medium text-tinta underline decoration-borde underline-offset-4 transition-colors hover:decoration-verde">
                  Primera versión del proyecto
                </a>
                <span className="ml-1.5 opacity-80">— HTML y JavaScript sin build.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---------------------------------------------------------- reutilizado */

function Titulo({
  etiqueta, titulo, texto, alineado,
}: {
  etiqueta: string;
  titulo: string;
  texto?: string;
  alineado?: boolean;
}) {
  return (
    <div className={alineado ? "" : "max-w-[56ch]"}>
      <span className="text-[11.5px] font-semibold tracking-[.1em] text-verde uppercase">{etiqueta}</span>
      <h2 className="mt-3 text-[26px] leading-tight font-semibold tracking-tight sm:text-[32px]">{titulo}</h2>
      {texto ? <p className="mt-3.5 text-[14px] leading-relaxed text-tinta-suave sm:text-[15px]">{texto}</p> : null}
    </div>
  );
}
