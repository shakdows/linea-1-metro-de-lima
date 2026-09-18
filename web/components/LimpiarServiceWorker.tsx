"use client";

import { useEffect } from "react";

/**
 * La versión estática anterior de este proyecto registraba un service worker
 * con estrategia «cache primero» y ámbito `/`. Ese service worker sigue vivo
 * en los navegadores que la visitaron y seguiría sirviendo la portada antigua
 * aunque el despliegue ya apunte a esta aplicación.
 *
 * Este componente lo da de baja y vacía sus cachés la primera vez que alguien
 * abre la versión nueva. No registra ninguno: la aplicación no lo necesita.
 */
export function LimpiarServiceWorker() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => Promise.all(regs.map((r) => r.unregister())))
      .then((results) => {
        if (!results.some(Boolean)) return;
        /* Había uno registrado: limpiamos lo que dejó en caché */
        if ("caches" in window) {
          caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
        }
      })
      .catch(() => {
        /* Sin permisos o en modo privado: no pasa nada */
      });
  }, []);

  return null;
}
