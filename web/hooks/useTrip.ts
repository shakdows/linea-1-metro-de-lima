"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { STATIONS, stationById } from "@/data/stations";
import { buildTrip, type TripMode } from "@/lib/trip";
import { useTrainAnimation } from "./useTrainAnimation";

export type TripStatus =
  | "idle"
  | "ready"
  | "traveling"
  | "paused"
  | "station-stop"
  | "completed"
  | "return-ready"
  | "returning"
  | "finished";

export type LegId = "outbound" | "inbound";

/**
 * Estado completo del viaje: selección, cálculo de la ruta y animación del
 * tren sobre el tramo activo. Todo lo que muestra la interfaz se deriva de
 * aquí, de modo que cambiar origen, destino o modo lo recalcula todo.
 */
export function useTrip({ animationSpeed = 1 }: { animationSpeed?: number } = {}) {
  const [originId, setOriginId] = useState("la-cultura");
  const [destinationId, setDestinationId] = useState("gamarra");
  const [mode, setMode] = useState<TripMode>("ida-vuelta");
  const [status, setStatus] = useState<TripStatus>("idle");
  const [activeLeg, setActiveLeg] = useState<LegId>("outbound");
  const [calculating, setCalculating] = useState(false);

  const trip = useMemo(
    () => buildTrip(originId, destinationId, mode),
    [originId, destinationId, mode],
  );

  const leg = activeLeg === "outbound" ? trip?.outbound : trip?.inbound;
  const stops = leg?.stops ?? 2;

  const train = useTrainAnimation({
    stops,
    animationSpeed,
    onFinish: () => {
      if (activeLeg === "outbound" && trip?.inbound) setStatus("return-ready");
      else setStatus("finished");
    },
  });

  /* Cualquier cambio en la selección invalida el viaje en curso */
  useEffect(() => {
    train.reset();
    setActiveLeg("outbound");
    setStatus("idle");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originId, destinationId, mode]);

  /* El estado del viaje sigue a la fase del tren mientras este circula */
  useEffect(() => {
    if (status === "idle" || status === "ready") return;
    if (train.phase === "traveling") setStatus(activeLeg === "outbound" ? "traveling" : "returning");
    else if (train.phase === "station-stop") setStatus("station-stop");
    else if (train.phase === "paused") setStatus("paused");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [train.phase, activeLeg]);

  const calculate = useCallback(() => {
    setCalculating(true);
    train.reset();
    setActiveLeg("outbound");
    window.setTimeout(() => {
      setCalculating(false);
      setStatus("ready");
    }, 450);
  }, [train]);

  const swap = useCallback(() => {
    setOriginId(destinationId);
    setDestinationId(originId);
  }, [originId, destinationId]);

  const setOrigin = useCallback(
    (id: string) => {
      if (id === destinationId) {
        setDestinationId(originId);
      }
      setOriginId(id);
    },
    [destinationId, originId],
  );

  const setDestination = useCallback(
    (id: string) => {
      if (id === originId) {
        setOriginId(destinationId);
      }
      setDestinationId(id);
    },
    [originId, destinationId],
  );

  const startJourney = useCallback(() => {
    setActiveLeg("outbound");
    setStatus("traveling");
    train.start();
  }, [train]);

  const startReturn = useCallback(() => {
    setActiveLeg("inbound");
    setStatus("returning");
    /* El hook reinicia solo cuando cambia el número de paradas; para el tramo
       de vuelta las paradas son las mismas, así que arrancamos en el frame
       siguiente, ya con el tramo de vuelta activo. */
    window.setTimeout(() => train.start(), 30);
  }, [train]);

  const pause = useCallback(() => {
    train.pause();
    setStatus("paused");
  }, [train]);

  const resume = useCallback(() => {
    train.resume();
    setStatus(activeLeg === "outbound" ? "traveling" : "returning");
  }, [train, activeLeg]);

  const restart = useCallback(() => {
    train.reset();
    setActiveLeg("outbound");
    setStatus("ready");
  }, [train]);

  const finish = useCallback(() => {
    train.reset();
    setStatus("ready");
  }, [train]);

  const currentStation = leg?.stations[train.currentStop] ?? leg?.stations[0] ?? STATIONS[0];
  const nextStation =
    leg?.stations[Math.min(train.currentStop + 1, (leg?.stations.length ?? 1) - 1)] ?? null;

  return {
    /* selección */
    originId,
    destinationId,
    mode,
    origin: stationById(originId)!,
    destination: stationById(destinationId)!,
    setOrigin,
    setDestination,
    setMode,
    swap,

    /* ruta */
    trip,
    leg,
    activeLeg,
    calculating,
    calculate,

    /* viaje */
    status,
    train,
    currentStation,
    nextStation,
    visitedCount: train.currentStop,

    startJourney,
    startReturn,
    pause,
    resume,
    restart,
    finish,
  };
}
