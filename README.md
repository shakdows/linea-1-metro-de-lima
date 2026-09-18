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
| `/anterior/` | La disposición previa de la aplicación, antes del rediseño |
| `/clasico/` | La primera versión del proyecto, en HTML y JS sin build |

La aplicación vive en [`web/`](web/): Next.js + TypeScript + Tailwind CSS +
Framer Motion + Leaflet, exportada como sitio estático.

> ⚠️ **Interfaz conceptual con fines académicos.** No representa el sitio oficial
> de Línea 1 ni tiene relación con su operador. Los tiempos, frecuencias y
> niveles de afluencia son **estimaciones simuladas**.
> Ver [`docs/DATOS.md`](docs/DATOS.md).

---

## Los módulos (dentro de `/app/`)

Un único armazón (`AppShell`) y ocho áreas de trabajo. La barra lateral y la
superior no se desmontan nunca; solo cambia el centro.

| Módulo | Qué resuelve |
|---|---|
| **Inicio** | Centro de operaciones personal: saludo, planificador, próximos trenes desde tu estación de referencia, afluencia, accesos guardados y la línea de extremo a extremo |
| **Mapa** | El mapa ocupa toda el área útil. Controles flotantes y, durante el viaje, un HUD inferior con progreso y mandos |
| **Planificar viaje** | Formulario arriba y los dos tramos —ida y vuelta— en paralelo, con la secuencia de paradas |
| **Estaciones** | Catálogo denso con fotografía, distrito, avenida, distintivos y próximo tren; filtros por zona y búsqueda |
| **Tarjeta** | Tarjeta de demostración y tabla de movimientos |
| **Horarios** | Tabla profesional por estación, sentido y tipo de día |
| **Avisos** | Centro de incidencias: lista cronológica a la izquierda, detalle a la derecha |
| **Asistente** | Conversación a la izquierda; a la derecha, la ruta que menciona la pregunta, con un botón que la carga en el mapa real |

### Cómo se comporta

- 🗺️ **Mapa geográfico real** (Leaflet + OpenStreetMap) con las 26 estaciones,
  el trazado de la línea y etiquetas de las avenidas principales.
- 🚆 **Tren animado sobre coordenadas reales**: interpola entre estaciones, se
  orienta según el rumbo, se detiene en cada parada y marca las ya recorridas.
  El recorrido se calcula, no está grabado.
- 🎛️ **Control del viaje**: iniciar, pausar, continuar, finalizar, reiniciar e
  **iniciar la vuelta** (el tren cambia a azul y gira).
- 🟢🔵 **Ida y vuelta** con ruta verde y azul, y el resto de la línea atenuado.
- 🔎 **Inspector de estación**: al tocar una estación —en el mapa, en el
  catálogo, en el buscador o en el diagrama de Inicio— se abre un cajón lateral
  derecho, no un modal que tape el contexto.
- 🎯 Zoom automático al tramo elegido y botón para ver toda la línea.
- 🧭 **Mi ubicación** con la estación más cercana.
- 📱 **Móvil**: cuatro pestañas inferiores y una hoja «Más» con el resto de
  módulos; ningún módulo queda inalcanzable.

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
  public/anterior/      La disposición previa, ya construida (archivo)
  public/clasico/       La primera versión, en HTML y JS sin build (archivo)
vercel.json             Le dice a Vercel que construya web/
docs/                   Datos, arquitectura, guía de activos y arquetipo de usuario
fotos linea 1/          Fotografías originales de las estaciones
```

## Las versiones archivadas

Nada se descarta: las dos versiones anteriores siguen publicadas y enlazadas
desde el pie de la portada.

### `/anterior/` — la disposición previa de la aplicación

El diseño que tenía antes de este rediseño: barra lateral oscura, un panel a la
vez y el mapa a la derecha. Es una **copia ya construida** del commit `f728763`,
guardada en `web/public/anterior/`, así que se sirve tal cual sin volver a
compilarse.

Solo se le añadió, por JavaScript, una banda superior que avisa de que es una
versión anterior y enlaza a la actual. Se inserta colgando de `<html>` y no de
`<body>`: React hidrata los hijos de `body` y borraría cualquier nodo que no
haya generado él.

Comparte con la versión actual las fotografías de `/estaciones/` y `/img/`, así
que no se duplican. Sus rutas internas se fijaron para un dominio servido desde
la raíz; el flujo de GitHub Pages las reajusta al subdirectorio del repositorio
antes de publicar.

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
