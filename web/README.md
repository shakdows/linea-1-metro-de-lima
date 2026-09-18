# Línea 1 — aplicación web

Aplicación de movilidad para la Línea 1 del Metro de Lima: mapa geográfico
interactivo con seguimiento del tren, planificador de ida y vuelta, y paneles
de servicio.

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
  layout.tsx          Fuente Inter, metadatos y tema
  globals.css         Tokens de diseño y estilos de los marcadores de Leaflet
  page.tsx            Composición del dashboard y estado compartido
components/
  Sidebar.tsx         Navegación lateral (escritorio)
  MobileNav.tsx       Navegación inferior (móvil)
  Header.tsx          Buscador de estaciones y avenidas, estado del servicio
  Hero.tsx            Cabecera compacta
  TripPlanner.tsx     Origen, destino, modo y cálculo de la ruta
  MetroMap.tsx        Mapa Leaflet: línea, estaciones, avenidas y tren
  CommandCenter.tsx   Panel derecho: planificador, resumen y rutas frecuentes
  StationDrawer.tsx   Ficha de estación a pantalla lateral, con fotografía
  StationList.tsx     Las 26 estaciones con foto, buscables
  TripHUD.tsx         Panel de cristal sobre el mapa durante el viaje
  MobileSheet.tsx     Hoja inferior de tres alturas
  TripControls.tsx    Iniciar, pausar, continuar, finalizar, reiniciar, vuelta
  TripProgress.tsx    Estación actual, siguiente, progreso y tiempo restante
  RoutePanel.tsx      Detalle del tramo con las estaciones recorridas
  AvenueToast.tsx     Aviso de la avenida por la que circula el tren
  BottomSheet.tsx     Hoja inferior deslizable en móvil
  SidePanels.tsx      Próximos trenes, afluencia, tarjeta, avisos y asistente
data/
  stations.ts         Las 26 estaciones con coordenadas, avenida y distrito
  route.ts            Trazado, avenidas, interpolación, rumbo y distancias
hooks/
  useTrip.ts          Selección, cálculo de la ruta y estados del viaje
  useTrainAnimation.ts  Movimiento del tren parada a parada
  useGeolocation.ts   Ubicación bajo demanda y estación más cercana
lib/
  trip.ts             Tramos, próximos trenes, afluencia y formatos
  assistant.ts        Asistente por reglas
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
derecha, según la sección elegida en la barra lateral: planificador, estaciones,
tarjeta, avisos, horarios o asistente. Al iniciar un viaje, el panel de cristal
toma el mando sobre el mapa y el resto pasa a segundo plano.

En móvil no se encoge esa disposición: el mapa ocupa la pantalla y el contenido
vive en una hoja inferior arrastrable de tres alturas.

## Estados del viaje

`idle → ready → traveling ⇄ paused → station-stop → completed → return-ready →
returning → finished`

Cada botón de `TripControls` está ligado a un estado concreto: no hay botones
decorativos.

## Notas sobre los datos

El orden, los nombres, los distritos y las avenidas de las 26 estaciones son
reales. Las **coordenadas son aproximadas** y los tiempos, frecuencias y
afluencia son **estimaciones simuladas**, marcadas como tales en la interfaz.
Ver [`../docs/DATOS.md`](../docs/DATOS.md).
