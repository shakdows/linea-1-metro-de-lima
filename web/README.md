# Línea 1 — aplicación web

Espacio de trabajo de movilidad para la Línea 1 del Metro de Lima: barra lateral
fija, barra superior y un área central que cambia de módulo sin recargar.

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
  page.tsx              Estado compartido y elección del módulo activo
components/
  shell/
    AppShell.tsx        Armazón persistente; solo se reemplaza el centro
    navigation.ts       Definición de los ocho módulos
    Sidebar.tsx         Navegación lateral (escritorio)
    Topbar.tsx          Buscador de estaciones, estado del servicio, avisos
    MobileTabs.tsx      Cuatro pestañas inferiores y hoja «Más»
  modules/
    HomeWorkspace.tsx     Inicio: centro de operaciones personal
    MapWorkspace.tsx      Mapa a pantalla completa, controles y TripHUD
    PlanWorkspace.tsx     Planificador con los dos tramos en paralelo
    TripPlanner.tsx       Origen, destino, modo y cálculo (se reutiliza)
    RouteSummary.tsx      Resumen del tramo y secuencia de paradas
    StationsWorkspace.tsx Catálogo de estaciones con filtros y fotografía
    CardWorkspace.tsx     Tarjeta y tabla de movimientos
    ScheduleWorkspace.tsx Tabla de horarios por estación y sentido
    AlertsWorkspace.tsx   Centro de incidencias con panel de detalle
    AssistantWorkspace.tsx Chat a la izquierda, contexto de ruta a la derecha
  MetroMap.tsx          Mapa Leaflet: línea, estaciones, avenidas y tren
  StationDrawer.tsx     Inspector de estación: cajón lateral derecho
  ui.tsx                Panel, PanelHeader, Pill, Button, Stat, Empty
data/
  stations.ts           Las 26 estaciones, frecuencias, afluencia y avisos
  route.ts              Trazado, avenidas, interpolación, rumbo y distancias
  card.ts               Tarjeta de demostración y movimientos
hooks/
  useTrip.ts            Selección, cálculo de la ruta y estados del viaje
  useTrainAnimation.ts  Movimiento del tren parada a parada
  useGeolocation.ts     Ubicación bajo demanda y estación más cercana
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

## La aplicación cambia de módulo, no de página

`AppShell` mantiene montadas la barra lateral y la superior; solo el área
central se reemplaza, con una transición de 160 ms. El estado del viaje vive en
`page.tsx`, por encima de los módulos: por eso una ruta calculada en Inicio o
propuesta por el asistente ya está cargada al abrir el mapa.

Las estaciones se inspeccionan en un **cajón lateral derecho**, no en un modal
centrado, para no perder de vista el mapa o la lista de la que vienes.

En móvil hay cuatro pestañas inferiores —Inicio, Mapa, Viaje, Estaciones— y una
hoja «Más» con Tarjeta, Horarios, Avisos y Asistente.

## Estados del viaje

`idle → ready → traveling ⇄ paused → station-stop → completed → return-ready →
returning → finished`

Cada mando del `TripHUD` está ligado a un estado concreto: no hay botones
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

## Notas sobre los datos

El orden, los nombres, los distritos y las avenidas de las 26 estaciones son
reales. Las **coordenadas son aproximadas** y los tiempos, frecuencias,
afluencia, avisos y saldos son **estimaciones o simulaciones**, marcadas como
tales en la interfaz. Ver [`../docs/DATOS.md`](../docs/DATOS.md).
