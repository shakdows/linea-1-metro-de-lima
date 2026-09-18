"use client";

import { useCallback, useState } from "react";
import { nearestStation } from "@/data/route";

export interface GeoResult {
  latitude: number;
  longitude: number;
  nearest: ReturnType<typeof nearestStation>;
}

/**
 * Geolocalización bajo demanda. Nunca se pide el permiso al cargar la página:
 * solo cuando la persona pulsa el botón.
 */
export function useGeolocation() {
  const [status, setStatus] = useState<"idle" | "locating" | "ready" | "error">("idle");
  const [result, setResult] = useState<GeoResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const locate = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("error");
      setError("Tu navegador no permite compartir la ubicación.");
      return;
    }

    setStatus("locating");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setResult({
          latitude: coords.latitude,
          longitude: coords.longitude,
          nearest: nearestStation(coords.latitude, coords.longitude),
        });
        setStatus("ready");
      },
      () => {
        setStatus("error");
        setError("No pudimos obtener tu ubicación. Revisa los permisos del navegador.");
      },
      { timeout: 9000, enableHighAccuracy: false },
    );
  }, []);

  return { status, result, error, locate };
}
