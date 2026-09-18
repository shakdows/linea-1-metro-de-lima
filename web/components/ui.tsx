"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/* Superficie base de la aplicación: blanca, borde fino, sin sombra */
export function Panel({
  children, className, as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article" | "aside";
}) {
  return (
    <Tag className={cn("rounded-lg border border-borde bg-superficie", className)}>{children}</Tag>
  );
}

export function PanelHeader({
  title, hint, action, className,
}: {
  title: ReactNode;
  hint?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex items-center gap-3 border-b border-borde-suave px-4 py-3", className)}>
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-[13px] font-semibold tracking-tight">{title}</h2>
        {hint ? <p className="mt-0.5 truncate text-[11.5px] text-tinta-suave">{hint}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export type Tono = "verde" | "azul" | "ambar" | "rojo" | "neutro";

const TONOS: Record<Tono, string> = {
  verde: "bg-verde-suave text-verde-oscuro",
  azul: "bg-azul-suave text-azul",
  ambar: "bg-ambar-suave text-ambar",
  rojo: "bg-rojo-suave text-rojo",
  neutro: "bg-fondo text-tinta-suave",
};

const PUNTOS: Record<Tono, string> = {
  verde: "bg-verde",
  azul: "bg-azul",
  ambar: "bg-ambar",
  rojo: "bg-rojo",
  neutro: "bg-inactivo",
};

/** Estado discreto. Nunca decorativa: siempre comunica algo */
export function Pill({
  children, tono = "neutro", punto, className,
}: {
  children: ReactNode;
  tono?: Tono;
  punto?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap",
        TONOS[tono],
        className,
      )}
    >
      {punto ? <i className={cn("size-1.5 rounded-full", PUNTOS[tono])} /> : null}
      {children}
    </span>
  );
}

export function Button({
  children, onClick, variant = "secundario", size = "md", className, disabled, type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primario" | "secundario" | "fantasma" | "peligro" | "azul";
  size?: "sm" | "md";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all active:scale-[.985] disabled:opacity-50",
        size === "sm" ? "h-8 px-3 text-[12px]" : "h-10 px-4 text-[13px]",
        variant === "primario" && "bg-verde text-white hover:bg-verde-oscuro",
        variant === "secundario" && "border border-borde bg-superficie text-tinta hover:border-tinta-suave/40 hover:bg-fondo",
        variant === "fantasma" && "text-tinta-suave hover:bg-fondo hover:text-tinta",
        variant === "peligro" && "border border-borde bg-superficie text-rojo hover:bg-rojo-suave",
        variant === "azul" && "bg-azul text-white hover:brightness-95",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Dato con etiqueta encima, para rejillas de métricas */
export function Stat({
  label, value, unit, hint, tono,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  hint?: ReactNode;
  tono?: string;
}) {
  return (
    <div>
      <p className="text-[11px] text-tinta-suave">{label}</p>
      <p className="mt-0.5 flex items-baseline gap-1 text-[19px] leading-none font-semibold tracking-tight tabular" style={tono ? { color: tono } : undefined}>
        {value}
        {unit ? <span className="text-[12px] font-medium text-tinta-suave">{unit}</span> : null}
      </p>
      {hint ? <p className="mt-1 text-[11px] text-tinta-suave">{hint}</p> : null}
    </div>
  );
}

export function Empty({ icon, title, hint }: { icon?: ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      {icon ? <span className="text-inactivo">{icon}</span> : null}
      <p className="text-[13px] font-medium">{title}</p>
      {hint ? <p className="max-w-[34ch] text-[12px] text-tinta-suave">{hint}</p> : null}
    </div>
  );
}
