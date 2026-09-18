# Arquitectura

La aplicación que se publica vive en [`web/`](../web/). Las dos versiones que
no están en uso —la primera, en HTML y JavaScript sin build, y un rediseño que
se exploró y se descartó— se conservan archivadas dentro de `web/public/`.

```
web/
├── Next.js 16 (App Router, exportación estática)
├── TypeScript
├── Tailwind CSS v4 (tokens en @theme)
├── Framer Motion   → transiciones y posición del tren
├── Lucide          → iconografía
└── Leaflet + OSM   → mapa geográfico
```

## Las rutas

| Ruta | Qué es |
|---|---|
| `/` | Portada. La única página con desplazamiento y secciones: presenta el proyecto, muestra qué incluye y el trazado, y lleva a la aplicación |
| `/app/` | La aplicación. No se comporta como una página |
| `/rediseno/` | Un rediseño explorado y descartado, ya construido y archivado |
| `/clasico/` | La primera versión, archivada: se sirve tal cual desde `public/`, sin pasar por Next |

La separación es deliberada: entrar directamente al espacio de trabajo dejaba
al visitante sin contexto y hacía que la herramienta pareciera una web a medio
hacer. La portada explica qué es y quién lo hizo; la aplicación no tiene que
explicar nada.

## El mapa en el centro

Dentro de `/app/` no hay páginas. El mapa ocupa el centro y **nunca se
abandona**; lo que cambia es el panel de la izquierda.

```
app/app/page.tsx
├── Sidebar      (228 px, fija, oscura)   ── elige la sección
├── Header       (buscador, estado del servicio, avisos)
├── panel izquierdo ── Planner │ TripPanel │ StationPanel │ StationList
│                      SidePanels (trenes, afluencia, tarjeta, avisos, asistente)
├── MetroMap     ── ocupa el resto, siempre montado
└── MobileNav + MobileSheet   (solo móvil)

StationDrawer    ── ficha de estación a pantalla lateral
```

`app/app/page.tsx` es el único dueño del estado: sección activa, reloj, estación
inspeccionada, señales de dibujo del mapa y —a través de `useTrip`— todo el
viaje. Los componentes reciben lo que necesitan por props y no hablan entre sí.

Esa elevación del estado es lo que permite que el mapa no se desmonte nunca: al
cambiar de sección solo se sustituye el contenido del panel, y el tren sigue
circulando.

### Por qué el mapa no se abandona

Se probó lo contrario —un panel de operación con un módulo a la vez y el mapa
como una sección más— y se archivó en `/rediseno/`. En una aplicación de
movilidad el mapa es el contexto, no un contenido: sacarlo de la vista obliga a
reconstruir mentalmente dónde estás cada vez que vuelves.

## Capas de datos## Capas de datos

| Capa | Archivos | Responsabilidad |
|---|---|---|
| **Datos** | `data/stations.ts`, `data/route.ts`, `data/card.ts` | Constantes: estaciones, trazado, frecuencias, afluencia, avisos, tarjeta |
| **Dominio** | `lib/trip.ts`, `lib/assistant.ts` | Tramos, próximos trenes, afluencia, formatos de hora, asistente por reglas |
| **Estado** | `hooks/useTrip.ts`, `hooks/useTrainAnimation.ts`, `hooks/useGeolocation.ts` | Selección, máquina de estados del viaje, animación, ubicación |
| **Vista** | `components/**` | Sin cálculos propios: todo lo que muestran viene derivado de arriba |

Cambiar una constante de `data/` se propaga por sí solo a toda la interfaz.

## Dos decisiones que conviene entender

**La posición del tren no vive en el estado de React.** Si viviera ahí, cada
fotograma provocaría un render del árbol completo. Es un `MotionValue` de
Framer Motion: `MetroMap` se suscribe con `position.on("change", …)` y mueve el
marcador de Leaflet directamente. React solo vuelve a renderizar en eventos
discretos —llegada a una estación, pausa, fin del tramo—.

**Exportación estática.** `output: "export"` genera HTML, CSS y JS planos en
`web/out`: se publica en Vercel o en GitHub Pages sin servidor. Cuando haga
falta datos en vivo, basta con quitar esa línea y convertir los paneles que
leen datos en Server Components.

## Trampas del entorno estático

- **Hidratación y relojes.** El HTML se genera en el build, con la hora de esa
  máquina. Cualquier `new Date()` en el primer render produce un desajuste al
  hidratar. El reloj arranca en una hora fija (`CLOCK_FALLBACK`) y se pone en
  hora dentro de un `useEffect`; las horas se formatean a mano en lugar de con
  `toLocaleTimeString`, que usa separadores distintos en Node y en el navegador.
- **`localStorage` no existe en el build.** Las rutas frecuentes se leen en un
  `useEffect`, nunca en el primer render.
- **Apilado de Leaflet.** Sus paneles usan `z-index` 400–700. Sin
  `isolation: isolate` en `.leaflet-container`, se pintan por encima de los
  cajones y hojas de la aplicación.
- **Las etiquetas de avenida tapan las estaciones** si no llevan
  `pointer-events: none`.
- **Los efectos que dibujan el mapa dependen de un estado `mapReady`**, no de
  los `ref`. Un `ref` no provoca re-render: sin ese estado, los efectos corrían
  una sola vez, antes de que resolviera el import dinámico de Leaflet, y las
  estaciones no se dibujaban nunca.
- **`vercel.json` no debe llevar `trailingSlash` ni `cleanUrls`**: duplicarían
  la barra final que ya añade `next.config.ts` y los `.css` y `.js` acabarían
  redirigidos a un 404.

## Las versiones archivadas

`/rediseno/` y `/clasico/` son archivos estáticos dentro de `public/`, así que
Next no los procesa: se copian al `out/` tal cual.

De `/rediseno/` conviene saber dos cosas:

- **Es una copia ya construida**, no código que se recompile. Sus rutas
  internas llevan el prefijo `/rediseno`, fijado en el momento de construirla, así que solo encajan si el sitio se sirve desde la
  raíz del dominio. El flujo de GitHub Pages las reajusta con un `sed` acotado
  a esa carpeta antes de publicar.
- **Su banda de aviso cuelga de `<html>`, no de `<body>`.** React hidrata los
  hijos de `body`: un nodo inyectado ahí lo borra al hidratar. Está comprobado.

De `/clasico/`:

- **No registra service worker.** El original lo hacía con ámbito `/`, y como
  era «caché primero» seguía sirviendo la portada antigua después de publicar
  la nueva. Se retiró al archivar; `LimpiarServiceWorker` en la aplicación
  actual da de baja cualquier registro que siga vivo en un navegador.
- **Lleva `noindex`**, para que no compita en buscadores con la versión vigente.

## Si algún día hay datos reales

Sustituir las constantes de `data/stations.ts` por una llamada a la API y
`nextTrains()` por el endpoint de llegadas. El resto del código no cambia,
porque nada más lee los datos directamente.

### Esquema de base de datos sugerido

```sql
create table estaciones (
  id text primary key,
  nombre text not null,
  distrito text not null,
  orden int not null,
  lat double precision,
  lng double precision,
  accesible boolean default true,
  salidas text[],
  cerca text[]          -- referencias cercanas ("Museo de la Nación")
);

create table horarios (
  estacion_id text references estaciones(id),
  sentido text check (sentido in ('norte','sur')),
  dia_tipo text check (dia_tipo in ('laborable','sabado','domingo')),
  hora time,
  frecuencia_min int
);

create table alertas (
  id uuid primary key default gen_random_uuid(),
  nivel text check (nivel in ('info','aviso','critico')),
  titulo text,
  detalle text,
  tramo_desde text references estaciones(id),
  tramo_hasta text references estaciones(id),
  activa boolean default true,
  creada_en timestamptz default now()
);

create table afluencia_historica (
  estacion_id text references estaciones(id),
  dia_semana int,
  hora int,
  nivel int check (nivel between 0 and 100)
);
```

El asistente pasaría a una Route Handler (`app/api/asistente/route.ts`) que
llama a un modelo con los datos de la línea como contexto; hoy `answer()` de
`lib/assistant.ts` responde con reglas y sin salir del navegador.

## Ideas pendientes

- Notificaciones de interrupciones (requiere service worker + Web Push).
- Modo oscuro: los tokens ya están centralizados en `@theme`, falta el bloque
  `@media (prefers-color-scheme: dark)`.
- Traducción a quechua e inglés.
