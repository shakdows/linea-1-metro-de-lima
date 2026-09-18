# Arquitectura

La aplicación que se publica vive en [`web/`](../web/). La primera versión del
proyecto, hecha con HTML y JavaScript sin build, sirvió de prototipo y se
conserva archivada en `web/public/clasico/`, publicada en `/clasico/`.

```
web/
├── Next.js 16 (App Router, exportación estática)
├── TypeScript
├── Tailwind CSS v4 (tokens en @theme)
├── Framer Motion   → transiciones y posición del tren
├── Lucide          → iconografía
└── Leaflet + OSM   → mapa geográfico
```

## Dos rutas

| Ruta | Qué es |
|---|---|
| `/` | Portada. La única página con desplazamiento y secciones: presenta el proyecto, muestra los módulos y el trazado, y lleva a la aplicación |
| `/app/` | La aplicación. No se comporta como una página |
| `/anterior/` | La disposición previa de la aplicación, ya construida y archivada |
| `/clasico/` | La primera versión, archivada: se sirve tal cual desde `public/`, sin pasar por Next |

La separación es deliberada: entrar directamente al espacio de trabajo dejaba
al visitante sin contexto y hacía que la herramienta pareciera una web a medio
hacer. La portada explica qué es y quién lo hizo; la aplicación no tiene que
explicar nada.

## Un armazón, ocho módulos

Dentro de `/app/` no hay páginas: hay un **armazón persistente** y un área de
trabajo que se reemplaza.

```
AppShell
├── Sidebar      (212 px, fija, oscura)   ── no se desmonta
├── Topbar       (56 px: buscador, estado, avisos)
├── main         ── AnimatePresence, 160 ms de fundido por módulo
│    └── HomeWorkspace │ MapWorkspace │ PlanWorkspace │ StationsWorkspace
│        CardWorkspace │ ScheduleWorkspace │ AlertsWorkspace │ AssistantWorkspace
└── MobileTabs   (52 px, solo móvil: 4 pestañas + hoja «Más»)

StationDrawer    ── cajón lateral derecho, por encima del armazón
```

`app/app/page.tsx` es el único dueño del estado: módulo activo, reloj, estación
inspeccionada, señales de dibujo del mapa y —a través de `useTrip`— todo el
viaje. Los módulos reciben lo que necesitan por props y no hablan entre sí.

Esa elevación del estado es lo que permite que una ruta calculada en Inicio, o
propuesta por el asistente, ya esté cargada al abrir el mapa: nadie recalcula
nada, solo cambia el módulo visible.

### Por qué un cajón lateral y no un modal

El inspector de estación (`StationDrawer`) entra desde la derecha y deja el
mapa o el listado visibles. Un modal centrado obligaría a cerrarlo para
recordar de dónde venías; el cajón conserva el contexto, que es lo que hace una
herramienta de trabajo y no una web de consulta.

## Capas de datos

| Capa | Archivos | Responsabilidad |
|---|---|---|
| **Datos** | `data/stations.ts`, `data/route.ts`, `data/card.ts` | Constantes: estaciones, trazado, frecuencias, afluencia, avisos, tarjeta |
| **Dominio** | `lib/trip.ts`, `lib/assistant.ts` | Tramos, próximos trenes, afluencia, formatos de hora, asistente por reglas |
| **Estado** | `hooks/useTrip.ts`, `hooks/useTrainAnimation.ts`, `hooks/useGeolocation.ts` | Selección, máquina de estados del viaje, animación, ubicación |
| **Vista** | `components/**` | Sin cálculos propios: todo lo que muestran viene derivado de arriba |

Cambiar una constante de `data/` se propaga por sí solo a todos los módulos.

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

`/anterior/` y `/clasico/` son archivos estáticos dentro de `public/`, así que
Next no los procesa: se copian al `out/` tal cual.

De `/anterior/` conviene saber dos cosas:

- **Es una copia ya construida** del commit `f728763`, no código que se
  recompile. Sus rutas internas llevan el prefijo `/anterior`, fijado en el
  momento de construirla, así que solo encajan si el sitio se sirve desde la
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
