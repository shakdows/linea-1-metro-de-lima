"use client";

import { useMotionValue } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

export type TrainPhase = "idle" | "traveling" | "station-stop" | "paused" | "completed";

export interface TrainAnimationOptions {
  /** Número de estaciones del recorrido, incluidos origen y destino */
  stops: number;
  /** Segundos que tarda el tren entre dos estaciones */
  legSeconds?: number;
  /** Milisegundos que el tren se detiene en cada estación intermedia */
  dwellMs?: number;
  /** Multiplicador de velocidad: 1 = normal, 2 = el doble de rápido */
  animationSpeed?: number;
  onArrive?: (stopIndex: number) => void;
  onFinish?: () => void;
}

/**
 * Anima un tren estación por estación sobre un recorrido de N paradas.
 *
 * La posición continua vive en un MotionValue, no en el estado de React: el
 * tren se mueve a 60 fps sin provocar un render por fotograma. El estado de
 * React solo cambia en eventos discretos (llegada, parada, pausa, fin).
 *
 * El recorrido NO es una animación fija: se deriva del número de paradas del
 * tramo seleccionado, por lo que cambiar origen o destino cambia el trayecto.
 */
export function useTrainAnimation({
  stops,
  legSeconds = 2.5,
  dwellMs = 800,
  animationSpeed = 1,
  onArrive,
  onFinish,
}: TrainAnimationOptions) {
  /** Índice fraccional dentro del recorrido: 0 = primera parada, 1.5 = a medio camino de la tercera */
  const position = useMotionValue(0);
  /** 0 a 1 sobre el recorrido completo */
  const progress = useMotionValue(0);

  const [phase, setPhase] = useState<TrainPhase>("idle");
  const [currentStop, setCurrentStop] = useState(0);

  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const arriveRef = useRef(onArrive);
  const finishRef = useRef(onFinish);
  arriveRef.current = onArrive;
  finishRef.current = onFinish;

  const legs = Math.max(1, stops - 1);
  const legMs = (legSeconds * 1000) / Math.max(0.25, animationSpeed);
  const dwell = dwellMs / Math.max(0.25, animationSpeed);

  const clear = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    rafRef.current = null;
    timerRef.current = null;
  }, []);

  /** Avanza desde una posición fraccional concreta; permite reanudar tras una pausa */
  const runFrom = useCallback(
    (startPosition: number) => {
      clear();

      const leg = Math.min(Math.floor(startPosition), legs - 1);
      const k0 = Math.min(0.999, startPosition - leg);
      const remaining = legMs * (1 - k0);
      const t0 = performance.now();

      setPhase("traveling");

      const frame = (t: number) => {
        const k = k0 + (1 - k0) * Math.min(1, (t - t0) / remaining);
        const p = leg + k;
        position.set(p);
        progress.set(p / legs);

        if (k < 1) {
          rafRef.current = requestAnimationFrame(frame);
          return;
        }

        const arrived = leg + 1;
        position.set(arrived);
        progress.set(arrived / legs);
        setCurrentStop(arrived);
        arriveRef.current?.(arrived);

        if (arrived >= legs) {
          setPhase("completed");
          finishRef.current?.();
          return;
        }

        setPhase("station-stop");
        timerRef.current = setTimeout(() => runFrom(arrived), dwell);
      };

      rafRef.current = requestAnimationFrame(frame);
    },
    [clear, legs, legMs, dwell, position, progress],
  );

  const start = useCallback(() => {
    position.set(0);
    progress.set(0);
    setCurrentStop(0);
    runFrom(0);
  }, [position, progress, runFrom]);

  const pause = useCallback(() => {
    clear();
    setPhase("paused");
  }, [clear]);

  const resume = useCallback(() => {
    if (position.get() >= legs) return;
    runFrom(position.get());
  }, [position, legs, runFrom]);

  const reset = useCallback(() => {
    clear();
    position.set(0);
    progress.set(0);
    setCurrentStop(0);
    setPhase("idle");
  }, [clear, position, progress]);

  /* Si cambia el recorrido, la animación anterior deja de tener sentido */
  useEffect(() => {
    reset();
    return clear;
  }, [stops, reset, clear]);

  return {
    position,
    progress,
    phase,
    currentStop,
    nextStop: Math.min(currentStop + 1, stops - 1),
    running: phase === "traveling" || phase === "station-stop",
    start,
    pause,
    resume,
    reset,
  };
}
