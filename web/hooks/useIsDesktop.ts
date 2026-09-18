"use client";

import { useEffect, useState } from "react";

/**
 * Indica si estamos en la disposición de escritorio.
 *
 * Arranca en `true` para que coincida con el HTML exportado y no falle la
 * hidratación; se ajusta en el navegador. Sirve para montar el panel de la
 * derecha O la hoja inferior, nunca los dos: duplicarlos repetiría los `id`
 * de los campos y rompería las etiquetas.
 */
export function useIsDesktop(query = "(min-width: 1024px)") {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);

  return isDesktop;
}
