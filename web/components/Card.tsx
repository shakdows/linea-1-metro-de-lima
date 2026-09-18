import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Card({
  className,
  children,
  as: Tag = "section",
}: {
  className?: string;
  children: ReactNode;
  as?: "section" | "div" | "article" | "aside";
}) {
  return (
    <Tag
      className={cn(
        "rounded-card border border-borde bg-white shadow-suave",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  icon,
  title,
  action,
  subtitle,
}: {
  icon?: ReactNode;
  title: ReactNode;
  action?: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <header className="mb-4 flex items-start gap-3">
      {icon ? (
        <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-verde-claro text-verde">
          {icon}
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-[15px] font-bold tracking-tight">{title}</h2>
        {subtitle ? (
          <p className="mt-0.5 text-[12.5px] text-tinta-suave">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

/** Etiqueta de procedencia del dato: estimación, demostración o tiempo real */
export function DataTag({
  kind,
  className,
}: {
  kind: "estimado" | "demo" | "vivo";
  className?: string;
}) {
  const map = {
    vivo: { text: "Tiempo real", cls: "bg-verde-claro text-verde-oscuro", dot: "bg-verde" },
    estimado: { text: "Estimación", cls: "bg-violet-50 text-violet-700", dot: "bg-violet-500" },
    demo: { text: "Demostración", cls: "bg-slate-100 text-tinta-suave", dot: "bg-slate-400" },
  }[kind];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-bold",
        map.cls,
        className,
      )}
      title={
        kind === "estimado"
          ? "Calculado sobre el patrón habitual de la línea. No es un dato en vivo."
          : kind === "demo"
            ? "Valor de ejemplo. Requiere conectar la fuente oficial."
            : "Dato recibido de la operación en vivo."
      }
    >
      <i className={cn("size-1.5 rounded-full", map.dot)} />
      {map.text}
    </span>
  );
}
