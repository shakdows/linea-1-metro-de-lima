# Línea 1 — aplicación y presentación

Dos rutas propias, más dos versiones archivadas y una redirección, todas
exportadas como HTML estático:

| Ruta | Archivo | Qué es |
|---|---|---|
| `/` | `app/page.tsx` | La aplicación: el mapa en el centro y un panel que cambia de sección |
| `/bienvenida/` | `app/bienvenida/page.tsx` | Presentación del proyecto, enlazada desde la barra lateral |
| `/app/` | `public/app/index.html` | Redirección a `/`, para los enlaces antiguos |
| `/rediseno/` | `public/rediseno/` | Un rediseño explorado y descartado, ya construido |
| `/clasico/` | `public/clasico/` | La primera versión del proyecto, en HTML y JS sin build |

La presentación es la única página con desplazamiento y secciones. La
aplicación no se comporta como una página: el mapa nunca se abandona.

## Ejecutar

```bash
cd web
npm install
npm run dev     # http://localhost:3000
```

Para generar el sitio estático (`out/`), que es lo que se publica:

```bash
npm run build
```

## Estructura

```
app/
  layout.tsx            Fuente, metadatos y tema
  globals.css           Tokens de diseño (@theme) y estilos de Leaflet
  page.tsx              Estado compartido y composición de la aplicación
  bienvenida/
    layout.tsx          Metadatos de la presentación
    page.tsx            Presentación del proyecto
components/
  Sidebar.tsx           Navegación lateral (escritorio)
  MobileNav.tsx         Navegación inferior (móvil)
  Header.tsx            Buscador de estaciones y avenidas, estado del servicio
  Planner.tsx           Origen, destino, modo y cálculo de la ruta
  MetroMap.tsx          Mapa Leaflet: línea, estaciones, avenidas y tren
  TripPanel.tsx         Progreso del viaje, estación actual y seguimiento
  TripControls.tsx      Iniciar, pausar, continuar, finalizar, reiniciar, vuelta
  StationPanel.tsx      Ficha de estación en el panel
  StationDrawer.tsx     Ficha de estación a pantalla lateral, con fotografía
  StationPopup.tsx      Tarjeta al pasar el puntero sobre una estación del mapa
  StationList.tsx       Las 26 estaciones con foto, buscables
  SidePanels.tsx        Próximos trenes, afluencia, tarjeta, avisos y asistente
  ArrivalToast.tsx      Aviso de llegada a cada estación
  MobileSheet.tsx       Hoja inferior arrastrable en móvil
  Card.tsx              Superficie base y cabecera de tarjeta
  landing/
    LineaDiagrama.tsx   El trazado real proyectado a SVG, para la presentación
public/
  estaciones/           Fotografías de 21 de las 26 estaciones (WebP)
  img/                  Fotografías de tren y viaducto de la barra lateral
  app/                  Redirección para los enlaces antiguos a /app/
  rediseno/             El rediseño descartado, ya construido (archivo)
  clasico/              La primera versión del proyecto (archivo)
data/
  stations.ts           Las 26 estaciones, frecuencias, afluencia y avisos
  route.ts              Trazado, avenidas, interpolación, rumbo y distancias
hooks/
  useTrip.ts            Selección, cálculo de la ruta y estados del viaje
  useTrainAnimation.ts  Movimiento del tren parada a parada
  useGeolocation.ts     Ubicación bajo demanda y estación más cercana
  useIsDesktop.ts       Monta el panel de escritorio o la hoja de móvil, no ambos
lib/
  trip.ts               Tramos, próximos trenes, afluencia y formatos de hora
  assistant.ts          Asistente por reglas sobre los datos locales
```

## Cómo se mueve el tren

`useTrainAnimation` produce un **índice fraccional** dentro del recorrido
(`0` = primera parada, `1.5` = a medio camino de la tercera) en un `MotionValue`
de Framer Motion. `MetroMap` se suscribe a ese valor y traduce cada fotograma a
coordenadas con `interpolate()`, orientando el icono con `bearing()`.

Esto tiene dos consecuencias:

- El tren circula a 60 fps **sin provocar un render de React por fotograma**.
- El recorrido **no es una animación fija**: se deriva del tramo elegido, así
  que cambiar origen o destino cambia el trayecto, el sentido y la duración.

## La aplicación cambia de estado, no de página

El mapa ocupa el centro y nunca se abandona. Lo que cambia es el panel de la
izquierda, según la sección elegida en la barra lateral: planificador,
estaciones, tarjeta, avisos, horarios o asistente. Al iniciar un viaje, el panel
pasa a mostrar el progreso y la estación actual.

En móvil no se encoge esa disposición: el mapa ocupa la pantalla y el contenido
vive en una hoja inferior arrastrable.

## Estados del viaje

`idle → ready → traveling ⇄ paused → station-stop → completed → return-ready →
returning → finished`

Cada botón de `TripControls` está ligado a un estado concreto: no hay botones
decorativos.

## Detalles que conviene no romper

- **Hidratación**: el HTML se genera en el build con la hora de esa máquina. El
  reloj arranca en `CLOCK_FALLBACK` (fecha fija) y se pone en hora ya montado;
  las horas se formatean a mano porque Node y el navegador usan separadores
  distintos antes de «a. m.».
- **Leaflet y el apilado**: `.leaflet-container` lleva `isolation: isolate` y
  `z-index: 0` para que sus paneles (z-index 400–700) no se pinten por encima
  de las hojas y cajones de la aplicación.
- **Etiquetas de avenida**: llevan `pointer-events: none`; si no, tapan los
  puntos de estación y estos dejan de poder pulsarse.
- **Efectos de dibujo del mapa**: dependen de un estado `mapReady`, no de los
  `ref`. Un `ref` no provoca re-render, así que sin ese estado los efectos
  corrían una sola vez —antes de que resolviera el import dinámico de Leaflet—
  y las estaciones nunca se dibujaban.
- **`useIsDesktop`**: monta el panel de escritorio o la hoja de móvil, nunca los
  dos. Montarlos a la vez duplicaba los `id` de los campos del formulario.

## Notas sobre los datos

El orden, los nombres, los distritos y las avenidas de las 26 estaciones son
reales. Las **coordenadas son aproximadas** y los tiempos, frecuencias,
afluencia, avisos y saldos son **estimaciones o simulaciones**, marcadas como
tales en la interfaz. Ver [`../docs/DATOS.md`](../docs/DATOS.md).
