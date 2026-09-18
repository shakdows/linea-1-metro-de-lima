# Arquitectura

## Hoy: HTML, CSS y JavaScript, sin build

La decisión fue deliberada: el sitio se abre, se lee y se despliega sin instalar
nada. Pesa pocos KB, funciona sin conexión y cualquiera puede editarlo.

```
navegador
│
├── data.js        Modelo de dominio (26 estaciones) + utilidades L1.*
├── ui.js          Componentes: selects, mapa, popover, gráfico, trenes, avisos
├── planner.js     Cálculo del viaje + animación del recorrido
├── assistant.js   Intérprete de preguntas por reglas
├── app.js         Portada
├── estacion.js    Ficha de estación
├── mapa.js        Mapa esquemático + Leaflet
│
└── sw.js          Service worker (cache-first) → PWA instalable
```

**Sin dependencias propias.** Solo dos recursos externos, ambos con alternativa:

| Recurso | Para qué | Si falla |
|---|---|---|
| Google Fonts (Plus Jakarta Sans + Caveat) | Tipografía | Cae a la fuente del sistema |
| Leaflet + OpenStreetMap | Mapa geográfico de `mapa.html` | Muestra un aviso; el esquema sigue funcionando |

### Convenciones

- **Todo en español**, incluidos los nombres de funciones y variables.
- **Variables CSS** en `:root` para color, radio, sombra y tipografía.
- **Mobile first**: el CSS base es móvil; `@media (min-width: 960px)` añade el
  escritorio (mapa horizontal, navegación superior).
- **Accesibilidad**: cada estación es un `<button>` real, hay `aria-label`,
  `aria-live` en el estado del servicio y soporte de `prefers-reduced-motion`.

## Mañana: Next.js + Supabase

Cuando haga falta datos en tiempo real, cuentas de usuario o favoritos:

```
Frontend                      Backend
├── Next.js (App Router)      ├── Supabase Postgres
├── TypeScript                │   ├── estaciones
├── Tailwind CSS              │   ├── horarios
├── Framer Motion             │   ├── alertas
└── Mapbox o Leaflet          │   └── afluencia_historica
                              ├── Supabase Auth (tarjeta, favoritos)
Vercel                        └── Edge Functions (ingesta en tiempo real)
```

**Ruta de migración, en orden:**

1. `npx create-next-app@latest --ts --tailwind`
2. Portar `data.js` a `lib/linea1.ts` — es TypeScript casi sin tocar.
3. Convertir cada bloque de `index.html` en un componente. El HTML ya está
   partido exactamente por estas fronteras:

   ```
   Navbar · Hero · TripPlanner · TripResult · MetroLineMap · StationTooltip
   NextTrains · CrowdingChart · MetroCard · ServiceAlerts · AIChat
   NearbyStations · Footer
   ```
4. Mover el CSS a `globals.css` manteniendo las mismas variables.
5. Cargar los datos con Server Components + `revalidate`.
6. El asistente pasa a una Route Handler (`app/api/asistente/route.ts`) que
   llama a un modelo con los datos de la línea como contexto; el hueco ya está
   previsto en `Asistente.responderRemoto()`.

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

## Ideas pendientes

- Favoritos tipo «Casa → Trabajo» guardados en `localStorage` (ya hay base: `linea1:prefs`).
- Notificaciones push de interrupciones (requiere el service worker + Web Push).
- Vista de estación más cercana usando la geolocalización que ya existe.
- Modo oscuro: las variables CSS ya están centralizadas, solo falta el bloque
  `@media (prefers-color-scheme: dark)`.
- Traducción a quechua e inglés.

---

## La aplicación de `web/`

Desde la versión con mapa geográfico, el proyecto tiene dos implementaciones
que comparten modelo de datos y lenguaje visual.

```
web/
├── Next.js 16 (App Router, exportación estática)
├── TypeScript
├── Tailwind CSS v4 (tokens en @theme)
├── Framer Motion   → transiciones y posición del tren
├── Lucide          → iconografía
└── Leaflet + OSM   → mapa geográfico
```

**Por qué exportación estática.** `output: "export"` genera HTML, CSS y JS
planos en `web/out`: se publica en GitHub Pages o en Vercel sin servidor, y
mantiene la promesa del proyecto de no necesitar infraestructura. Cuando haga
falta datos en vivo, basta con quitar esa línea y convertir los paneles en
Server Components.

**Una decisión que conviene entender.** La posición del tren no vive en el
estado de React sino en un `MotionValue`. Si viviera en el estado, cada
fotograma provocaría un render del árbol completo. Al ser un `MotionValue`,
`MetroMap` se suscribe con `position.on("change", …)` y mueve el marcador de
Leaflet directamente: React solo vuelve a renderizar en eventos discretos
(llegada a una estación, pausa, fin del tramo).

**Hidratación y relojes.** El HTML se genera en el build, con la hora de esa
máquina. Cualquier `new Date()` en el primer render produce un desajuste al
hidratar. Por eso el reloj arranca en una hora fija (`CLOCK_FALLBACK`) y se
pone en hora dentro de un `useEffect`, y las horas se formatean a mano en lugar
de con `toLocaleTimeString`, que usa separadores distintos en Node y en el
navegador.
