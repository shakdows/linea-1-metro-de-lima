"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative max-h-[290px] overflow-hidden rounded-card border border-borde bg-white"
    >
      {/* Fondo: viaducto de la Línea 1 */}
      <div className="absolute inset-0">
        <Image
          src="/img/viaducto.webp"
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 900px"
          className="object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/92 to-white/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/70 to-transparent" />
      </div>

      {/* Tren */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        className="pointer-events-none absolute right-0 bottom-0 hidden h-[86%] w-[52%] md:block"
      >
        <Image
          src="/img/tren.webp"
          alt="Tren de la Línea 1 del Metro de Lima"
          fill
          sizes="(max-width: 768px) 0px, 600px"
          className="object-contain object-bottom-right"
        />
      </motion.div>

      <div className="relative px-6 py-6 md:max-w-[58%] md:py-7 md:pl-8">
        <h1 className="text-[26px] leading-[1.1] font-extrabold tracking-tight md:text-[34px]">
          Tu ciudad en movimiento
        </h1>
        <p className="mt-2 max-w-[42ch] text-[14px] text-tinta-suave md:text-[15px]">
          Planifica tu recorrido y sigue tu viaje por la Línea 1.
        </p>

        <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-[12.5px] font-semibold">
          {[
            ["26", "estaciones"],
            ["1", "línea, de punta a punta"],
            ["S/ 1.50", "tarifa única"],
          ].map(([value, label]) => (
            <li key={label} className="leading-tight">
              <span className="block text-[17px] font-extrabold tracking-tight text-verde-oscuro">
                {value}
              </span>
              <span className="text-tinta-suave">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}
