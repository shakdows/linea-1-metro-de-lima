# Línea 1 — Metro de Lima

Aplicación web de movilidad para la Línea 1 del Metro de Lima. No es una web
institucional: es la herramienta con la que un pasajero resuelve su viaje —
mapa geográfico interactivo con seguimiento del tren, planificador de ida y
vuelta, próximos trenes, afluencia por franja horaria, avisos y un asistente
que entiende lenguaje natural.

La aplicación vive en [`web/`](web/): Next.js + TypeScript + Tailwind +
Framer Motion + Leaflet, exportada como sitio estático.

> ⚠️ **Interfaz conceptual con fines académicos.** No representa el sitio oficial
> de Línea 1 ni tiene relación con su operador. Los tiempos, frecuencias y
> niveles de afluencia son **estimaciones simuladas**.
> Ver [`docs/DATOS.md`](docs/DATOS.md).

![Vista de escritorio](assets/img/screenshot-escritorio.png)

<p align="center">
  <img src="assets/img/screenshot-movil.png" alt="Vista móvil" width="300">
</p>

---

## Qué incluye

| Pantalla | Archivo | Contenido |
|---|---|---|
| Inicio | `index.html` | Hero, planificador, resultado del viaje, mapa, próximos trenes, afluencia, tarjeta, avisos, asistente, estaciones cercanas |
| Mapa | `mapa.html` | Esquema de la línea, buscador, ubicación, mapa geográfico (Leaflet) y listado por distrito |
| Estación | `estacion.html?id=gamarra` | Trenes por sentido, afluencia, salidas numeradas, referencias cercanas, contiguas y planificador |

### Funcionalidades

- 🗺️ **Mapa geográfico real** (Leaflet + OpenStreetMap) con las 26 estaciones,
  el trazado de la línea y etiquetas de las avenidas principales.
- 🚆 **Tren animado sobre coordenadas reales**: interpola entre estaciones, se
  orienta según el rumbo, se detiene 800 ms en cada parada y marca con ✓ las
  estaciones ya recorridas. El recorrido se calcula, no está grabado.
- 🎛️ **Control total del viaje**: iniciar, pausar, continuar, finalizar,
  reiniciar e **iniciar la vuelta** (el tren cambia a azul y gira).
- 🟢🔵 **Ida y vuelta** con ruta verde y azul, y el resto de la línea atenuado.
- 📍 **Selección desde el mapa**: al tocar una estación se abre su ficha con
  próximos trenes, afluencia, avenida y botones de origen y destino.
- 🎯 **Zoom automático** al tramo elegido y botón para ver toda la línea.
- 🧭 **Mi ubicación** con la estación más cercana y los minutos caminando.
- 📊 Próximos trenes, afluencia por franja horaria, tarjeta, avisos y asistente.
- 📱 **Mobile first**: navegación inferior y panel del viaje como hoja
  deslizable.


## Cómo ejecutarlo

**La aplicación** (Next.js):

```bash
git clone https://github.com/shakdows/linea-1-metro-de-lima.git
cd linea-1-metro-de-lima/web
npm install
npm run dev        # http://localhost:3000
```

## Despliegue

**GitHub Pages** — configurado en `.github/workflows/pages.yml`: construye
`web/` y publica `web/out`. En *Settings → Pages* elige `GitHub Actions`.

**Vercel** — importa el repositorio tal cual. El `vercel.json` de la raíz ya
indica que debe construir `web/` y publicar `web/out`; no hace falta tocar el
*Root Directory*.

> Ojo con `vercel.json`: no debe llevar `trailingSlash` ni `cleanUrls`.
> `next.config.ts` ya genera las rutas con barra final, y repetirlo en Vercel
> hace que también se redirijan los `.css` y `.js`, que pasan a dar 404 y la
> página se queda sin estilos.

## Estructura

```
web/                    Aplicación Next.js (ver web/README.md)
vercel.json             Le dice a Vercel que construya web/
mapa.html               Mapa esquemático + geográfico
estacion.html           Ficha de estación (?id=…)
manifest.webmanifest    Configuración PWA
sw.js                   Service worker (cache-first)
assets/
  css/style.css         Sistema de diseño completo (todo en :root)
  js/data.js            Las 26 estaciones y utilidades de dominio
  js/ui.js              Componentes: estado, mapa, tooltip, trenes, afluencia…
  js/planner.js         Cálculo del viaje y animación del recorrido
  js/assistant.js       Asistente por reglas
  js/app.js             Portada
  js/estacion.js        Ficha de estación
  js/mapa.js            Mapa, buscador y ubicación
  img/hero-tren.svg     Ilustración del hero (sustituible por foto)
docs/                   Datos, arquitectura y guía de diseño
```

## Personalizar el aspecto

Toda la identidad vive en `:root` de `assets/css/style.css`:

```css
--verde: #009b3a;      --verde-oscuro: #006b2c;   --verde-claro: #e8f7ed;
--fondo: #f7f9f8;      --texto: #101817;          --texto-suave: #68736f;
--amarillo: #f5b82e;   --naranja: #f07c1f;        --rojo: #e5484d;
```

Cambiando esas variables cambia el sitio entero, sin tocar el HTML.

## Documentación

- [`docs/DATOS.md`](docs/DATOS.md) — qué es real, qué es estimado y cómo conectar datos oficiales.
- [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md) — cómo está hecho y cómo migrar a Next.js + Supabase.
- [`docs/ACTIVOS-Y-DISENO.md`](docs/ACTIVOS-Y-DISENO.md) — **inventario de imágenes y vídeos, con los prompts listos para generarlos**.

## Licencia

MIT — ver [`LICENSE`](LICENSE).
