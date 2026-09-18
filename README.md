# Línea 1 — Metro de Lima

Aplicación web de movilidad para la Línea 1 del Metro de Lima.

Son **dos piezas**: una portada que presenta el proyecto y un botón «Entrar», y
detrás la aplicación propiamente dicha —un **espacio de trabajo** con barra
lateral fija, barra superior y un área central que cambia de módulo sin
recargar: mapa geográfico con seguimiento del tren, planificador de ida y
vuelta, catálogo de estaciones, tarjeta, horarios, avisos y asistente.

| Ruta | Qué es |
|---|---|
| `/` | Portada: qué hace el proyecto, los módulos, el trazado animado y el botón de entrada |
| `/app/` | La aplicación |
| `/rediseno/` | Un rediseño explorado y descartado: panel de operación, un módulo a la vez |
| `/clasico/` | La primera versión del proyecto, en HTML y JS sin build |

La aplicación vive en [`web/`](web/): Next.js + TypeScript + Tailwind CSS +
Framer Motion + Leaflet, exportada como sitio estático.

> ⚠️ **Interfaz conceptual con fines académicos.** No representa el sitio oficial
> de Línea 1 ni tiene relación con su operador. Los tiempos, frecuencias y
> niveles de afluencia son **estimaciones simuladas**.
> Ver [`docs/DATOS.md`](docs/DATOS.md).

---

## Cómo está montada la aplicación (`/app/`)

El mapa ocupa el centro y **nunca se abandona**. Lo que cambia es el panel de la
izquierda, según la sección elegida en la barra lateral.

| Sección | Qué muestra en el panel |
|---|---|
| **Inicio** | Planificador, rutas frecuentes y, durante el viaje, el progreso y la estación actual |
| **Mapa** | El mapa a pantalla completa con sus controles |
| **Planificar viaje** | Origen, destino, modo y el detalle del tramo calculado |
| **Estaciones** | Las 26 estaciones con fotografía, buscables |
| **Tarjeta** | Saldo, viajes disponibles y accesos |
| **Horarios** | Primer y último tren, y la frecuencia por franja |
| **Avisos** | Estado del servicio y avisos vigentes |
| **Asistente** | Preguntas en lenguaje natural sobre rutas, horarios y tarifas |

### Cómo se comporta

- 🗺️ **Mapa geográfico real** (Leaflet + OpenStreetMap) con las 26 estaciones,
  el trazado de la línea y etiquetas de las avenidas principales.
- 🚆 **Tren animado sobre coordenadas reales**: interpola entre estaciones, se
  orienta según el rumbo, se detiene en cada parada y marca las ya recorridas.
  El recorrido se calcula, no está grabado.
- 🎛️ **Control del viaje**: iniciar, pausar, continuar, finalizar, reiniciar e
  **iniciar la vuelta** (el tren cambia a azul y gira).
- 🟢🔵 **Ida y vuelta** con ruta verde y azul, y el resto de la línea atenuado.
- 📍 **Selección desde el mapa**: al tocar una estación se abre su ficha con
  próximos trenes, afluencia, avenida y botones de origen y destino.
- 🎯 Zoom automático al tramo elegido y botón para ver toda la línea.
- 🧭 **Mi ubicación** con la estación más cercana.
- 📱 **Móvil**: el mapa ocupa la pantalla y el contenido vive en una hoja
  inferior arrastrable, con navegación inferior.

No hay botones decorativos: cada control está ligado a un estado real.

## Cómo ejecutarlo

```bash
git clone https://github.com/shakdows/linea-1-metro-de-lima.git
cd linea-1-metro-de-lima/web
npm install
npm run dev        # http://localhost:3000
```

Para generar el sitio estático que se publica (`web/out`):

```bash
npm run build
```

## Despliegue

**Vercel** — importa el repositorio tal cual. El `vercel.json` de la raíz ya
indica que debe construir `web/` y publicar `web/out`; no hace falta tocar el
*Root Directory*.

> Ojo con `vercel.json`: no debe llevar `trailingSlash` ni `cleanUrls`.
> `next.config.ts` ya genera las rutas con barra final, y repetirlo en Vercel
> hace que también se redirijan los `.css` y `.js`, que pasan a dar 404 y la
> página se queda sin estilos.

**GitHub Pages** — configurado en `.github/workflows/pages.yml`: construye
`web/` con `BASE_PATH=/<repo>` y publica `web/out`. En *Settings → Pages* elige
`GitHub Actions`.

## Estructura

```
web/                    Portada y aplicación en Next.js (ver web/README.md)
  public/rediseno/      El rediseño descartado, ya construido (archivo)
  public/clasico/       La primera versión, en HTML y JS sin build (archivo)
vercel.json             Le dice a Vercel que construya web/
docs/                   Datos, arquitectura, guía de activos y arquetipo de usuario
fotos linea 1/          Fotografías originales de las estaciones
```

## Las versiones archivadas

Nada se descarta: las dos versiones que no están en uso siguen publicadas y
enlazadas desde el pie de la portada.

### `/rediseno/` — el rediseño descartado

Una exploración que convertía la aplicación en un panel de operación: un módulo
a la vez en el centro, sin mapa permanente. Se probó y se volvió a la
disposición actual, en la que el mapa nunca se abandona. Es una **copia ya
construida**, guardada en `web/public/rediseno/`, así que se sirve tal cual sin
recompilarse.

Solo se le añadió, por JavaScript, una banda superior que avisa de lo que es y
enlaza a la versión actual. Se inserta colgando de `<html>` y no de `<body>`:
React hidrata los hijos de `body` y borraría cualquier nodo que no haya
generado él.

Comparte las fotografías de `/estaciones/` con la versión actual, así que no se
duplican. Sus rutas internas se fijaron para un dominio servido desde la raíz;
el flujo de GitHub Pages las reajusta al subdirectorio del repositorio antes de
publicar.

### `/clasico/` — la primera versión

HTML, CSS y JavaScript sin build, con sus tres páginas: portada, mapa y ficha de
estación. Se conserva íntegra en `web/public/clasico/`.

Se le hicieron solo dos cambios al archivarla, ambos por seguridad y no por
diseño:

- **Se retiró el service worker.** Servía desde caché con ámbito `/` y era la
  causa de que el despliegue siguiera mostrando la versión antigua después de
  publicar la nueva. La aplicación actual da de baja cualquier registro que
  quede, así que dejarlo habría hecho que ambos pelearan.
- **Se añadió `noindex`** y una banda superior que avisa de que es un archivo y
  enlaza a la versión actual, para que nadie llegue por buscador y crea que es
  el proyecto vigente.

Todo lo demás —maquetación, estilos, datos y comportamiento— está tal cual.

## Personalizar el aspecto

Toda la identidad vive en el bloque `@theme` de
[`web/app/globals.css`](web/app/globals.css):

```css
--color-sidebar: #081812;   --color-verde: #009b3a;    --color-azul: #1687f8;
--color-fondo:   #f5f7f6;   --color-superficie: #fff;  --color-borde: #dde4e0;
--color-tinta:   #111827;   --color-tinta-suave: #667085;
```

Tailwind genera las utilidades (`bg-verde`, `text-tinta-suave`, `border-borde`…)
a partir de esos *tokens*: cambiarlos cambia la aplicación entera.

## Documentación

- [`docs/DATOS.md`](docs/DATOS.md) — qué es real, qué es estimado y cómo conectar datos oficiales.
- [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md) — cómo está hecho por dentro.
- [`docs/ACTIVOS-Y-DISENO.md`](docs/ACTIVOS-Y-DISENO.md) — inventario de imágenes y vídeos, con los prompts para generarlos.
- [`docs/arquetipo/`](docs/arquetipo/) — arquetipo de usuario en PDF.

## Licencia

MIT — ver [`LICENSE`](LICENSE).
