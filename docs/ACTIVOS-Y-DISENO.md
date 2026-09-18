# Activos visuales: qué falta, qué necesito de ti y cómo generarlo

El sitio **funciona completo sin una sola fotografía**: el hero, los iconos y el
mapa son vectores propios. Pero hay huecos donde una imagen o un vídeo lo
elevan. Aquí está el inventario exacto, con el prompt listo para pegar.

---

## 1. Lo que necesito **de ti** (no lo puedo inventar)

### 🔴 Imprescindible

| # | Qué | Por qué |
|---|---|---|
| 1 | **¿Es un concepto académico o va en serio?** Si va en serio, necesitas permiso del operador para usar marca y datos. | Hoy el sitio lleva la franja «Interfaz conceptual para fines académicos» en todas las páginas |
| 2 | **Logotipo en SVG** (o PNG transparente ≥1024 px) | Hoy hay una marca geométrica propia en `assets/img/` |
| 3 | **Verde exacto de marca en HEX** | Uso `#009B3A`, tomado de tu especificación |
| 4 | **Tipografía autorizada** | Uso Plus Jakarta Sans desde Google Fonts |

### 🟠 Muy recomendable

| # | Qué | Para qué |
|---|---|---|
| 5 | **Horarios oficiales** por estación y sentido | Reemplazar `frecuencias` en `data.js` |
| 6 | **Tarifa vigente** y tipos de tarjeta | Hoy asumo S/ 1.50 plana |
| 7 | **Coordenadas reales** de las 26 estaciones | Las mías son aproximadas |
| 8 | **Listado de salidas** por estación | Es la función que más se usaría a diario; hoy solo hay 1–2 por estación |
| 9 | **Referencias cercanas** por estación | Solo 9 de 26 estaciones tienen la sección «Cerca de aquí» |
| 10 | **¿Existe API de llegadas en tiempo real?** | Decide si «próximo tren» deja de ser simulado |

### 🟡 Opcional

Fotos propias de estaciones y trenes (con derechos) · modo oscuro · versión en
inglés y quechua · dominio propio para publicarlo.

---

## 2. Inventario de imágenes

| Archivo | Tamaño | Formato | Dónde aparece | Estado |
|---|---|---|---|---|
| `assets/img/hero-tren.svg` | 1200×800 | SVG | Fondo derecho del hero | ✅ Hecho (vector propio) |
| `assets/img/favicon.svg` | 64×64 | SVG | Pestaña del navegador | 🟡 Provisional |
| `assets/img/icon-192.png` | 192×192 | PNG | Icono PWA en Android | 🟡 Provisional |
| `assets/img/icon-512.png` | 512×512 | PNG | Icono PWA e instalación | 🟡 Provisional |
| `assets/img/og-cover.png` | 1200×630 | PNG | Vista previa al compartir | 🟡 Provisional |
| `assets/img/screenshot-escritorio.png` | 1440 ancho | PNG | README | ✅ Hecha |
| `assets/img/screenshot-movil.png` | 390×844 | PNG | README | ✅ Hecha |
| `assets/img/estacion-*.webp` | 800×600 | WebP | *(opcional)* foto por estación | ⚪ No existe |

Los tres PNG provisionales los genera `python3 tools/generar_iconos.py` sin
dependencias. Sustituye el archivo manteniendo nombre y tamaño: no hay que
tocar código.

### Cambiar el hero por una fotografía

El hero está preparado para aceptar una foto sin tocar el CSS:

```html
<!-- index.html, dentro de .hero__arte -->
<img src="assets/img/hero-tren.webp" alt="">
```

El degradado blanco que funde la imagen con el fondo ya está aplicado en
`.hero__arte::after`. La foto debe tener el tren a la derecha y espacio libre a
la izquierda.

---

## 3. Prompts listos para ChatGPT / DALL·E

Pégalos tal cual. Están escritos para la paleta del proyecto.

### 3.1 · Fotografía del hero (lo que más cambia el resultado)

```
Fotografía publicitaria de un tren de metro moderno color blanco y verde
circulando por un viaducto elevado sobre una ciudad latinoamericana costera,
con cerros áridos al fondo y palmeras bajas.

Encuadre horizontal 3:2. El tren ocupa el tercio derecho, avanzando hacia la
cámara en tres cuartos. El tercio izquierdo debe quedar despejado, con cielo
claro y poco contraste, porque encima irá texto oscuro.

Luz de mañana difusa, cielo ligeramente nublado. Dominante verde y gris
frío, saturación media-baja. Sin personas reconocibles, sin texto, sin
carteles legibles, sin logotipos de marcas reales.

Resolución alta, aspecto limpio y editorial, no HDR.
```

Después conviértela: `cwebp -q 82 hero.png -o assets/img/hero-tren.webp`.

### 3.2 · Icono de la app (`icon-512.png`)

```
Diseña un icono de aplicación móvil para el metro de Lima, cuadrado
1024x1024, con margen de seguridad del 15% en todos los bordes porque se
recortará en círculo.

Concepto: el número 1 formado por la vía del metro vista en cenital, o un
vagón estilizado visto de frente. Geométrico, trazo grueso, legible a 48 px.

Estilo: flat, sin degradados complejos, sin sombras realistas, sin texto
adicional, sin biselados. Estética de icono de sistema iOS/Android 2025.

Color: fondo verde #009B3A sólido, símbolo en blanco puro #FFFFFF.

Fondo plano, sin mockup de teléfono, sin reflejos. PNG.
```

### 3.3 · Portada para compartir (`og-cover.png`)

```
Imagen de portada horizontal 1200x630 px para una web de transporte público
llamada "Línea 1 — Metro de Lima".

Composición: dos tercios izquierdos con espacio negativo limpio para colocar
texto encima (déjalo casi vacío). Tercio derecho: un tren de metro moderno
estilizado en vista tres cuartos, ilustración vectorial plana.

Cruzando toda la imagen por abajo, una línea horizontal blanca gruesa con
círculos blancos regulares que representan estaciones, como un plano de metro
esquemático.

Paleta estricta: verde #009B3A, verde oscuro #006B2C, blanco #FFFFFF.
Degradado suave de verde oscuro arriba a verde claro abajo.

Sin texto, sin logotipos, sin personas, sin marcas reales.
```

### 3.4 · Ilustración por estación (`estacion-*.webp`, opcional)

```
Ilustración vectorial plana e isométrica del acceso a una estación de metro
elevado en Lima: escaleras, torniquetes, marquesina, palmeras bajas al fondo
y cielo claro de día nublado limeño.

Paleta: verde #009B3A como acento principal, grises cálidos, blanco.
Sin personas con rostro definido, sin texto, sin logotipos.
Estilo limpio y geométrico, coherente con una app de transporte.
Aspecto 4:3, 800x600.
```

Repite cambiando el entorno: *comercial y denso* para Gamarra, *residencial y
abierto* para San Juan de Lurigancho, *institucional y con áreas verdes* para
La Cultura.

---

## 4. Vídeos

### 4.1 · Vídeo de presentación (30–45 s)

El mejor vídeo es **la web funcionando**. Grábala con captura de pantalla
(OBS, o `Cmd+Shift+5` en Mac).

| Seg. | Qué se ve | Texto en pantalla |
|---|---|---|
| 0–4 | Hero cargando, el indicador de estado aparece en la barra | *26 estaciones. Una sola app.* |
| 4–12 | La Cultura → Gamarra, clic en «Planificar mi viaje», skeleton y despliegue | *Planifica tu recorrido* |
| 12–20 | El recorrido se dibuja, el tren avanza por el mapa | *Mira tu ruta en el mapa* |
| 20–26 | Clic en una estación del mapa → tooltip → «Como destino» | *Toca cualquier estación* |
| 26–33 | Hover sobre el gráfico de afluencia, se resalta la mejor franja | *Viaja cuando hay menos gente* |
| 33–40 | Pregunta al asistente, animación de «escribiendo», respuesta | *Pregunta en tu idioma* |
| 40–45 | Vista móvil con la barra inferior, «Añadir a pantalla de inicio» | *Instálala como app* |

Exporta en **1920×1080** para web y **1080×1920** para redes.

### 4.2 · Prompt para Sora (plano de recurso)

```
Plano fijo, 5 segundos, cámara estática a la altura del andén.
Un tren de metro moderno y limpio entra en una estación elevada a plena luz
del día, con desenfoque de movimiento suave y una parada progresiva.

Estética publicitaria, luz natural difusa, dominante verde y gris.
Sin personas en primer plano, sin texto, sin logotipos ni marcas reales.
Aspecto 16:9, cámara sin movimiento.
```

> Los vídeos generados por IA envejecen mal como contenido principal. Úsalos
> como plano de recurso de 3–5 segundos entre secciones, nunca como base.

---

## 5. Sistema visual (respétalo o el sitio pierde coherencia)

```
Verde principal      #009B3A   botones, acentos, riel del mapa
Verde oscuro         #006B2C   hover de botones, tarjeta física
Verde claro          #E8F7ED   fondos de estado, chips, iconos
Fondo principal      #F7F9F8   fondo de página
Blanco               #FFFFFF   superficie de tarjetas
Texto principal      #101817
Texto secundario     #68736F
Borde                #E4EAE7
Amarillo             #F5B82E   demoras, afluencia media
Naranja              #F07C1F   afluencia alta
Rojo                 #E5484D   interrupciones, afluencia muy alta
```

- **Tipografía**: Plus Jakarta Sans (400, 600, 700, 800). Alternativas: Inter, Manrope.
- **Acento manuscrito**: Caveat (solo para la firma «Lima avanza contigo»).
- **Radios**: 10 / 14 / 20 / 26 px y 999 px para píldoras.
- **Sombras**: muy suaves, nunca negras puras.
- **Movimiento**: 180–340 ms, `cubic-bezier(.2,.8,.3,1)`. Nada más largo.
- **Nunca**: neón, glassmorphism, degradados arcoíris, stock genérico con gente
  mirando a cámara, texto dentro de las imágenes, iconografía de estilos mezclados.

Todo esto vive en `:root` dentro de `assets/css/style.css`. Cambiando esas ~20
variables, el sitio entero cambia de identidad sin tocar el HTML.

### Prompt de sistema para ChatGPT

Pégalo al inicio de la conversación donde generes activos:

```
Eres director de arte de una app de transporte público llamada Línea 1
(Metro de Lima). Todo lo que generes debe cumplir:

Paleta estricta: #009B3A (verde principal), #006B2C (verde oscuro),
#E8F7ED (verde claro), #F7F9F8 (fondo), #FFFFFF, #101817 (texto).
Acentos solo #F5B82E, #F07C1F y #E5484D.
Tipografía: Plus Jakarta Sans.
Estilo: flat, geométrico, mucho espacio en blanco, esquinas redondeadas de
14 a 26 px, sombras muy suaves. Referencias: Citymapper, Apple Maps, apps de
metro europeas.
Prohibido: neón, glassmorphism, degradados arcoíris, stock fotográfico
genérico, texto dentro de las imágenes, logotipos de marcas reales.

Cuando te pida un activo, devuelve siempre el tamaño exacto en píxeles y el
formato de archivo recomendado.
```

---

## 6. Si quieres llevarlo a Figma

1. Dos artboards: **1440×1024** (escritorio) y **390×844** (móvil).
2. Crea los estilos de color con los HEX de arriba y los de texto con los
   tamaños que ya usa el CSS (`h1` 56 px, `h2` 26 px, cuerpo 15 px, meta 13 px).
3. Componentes a montar, en este orden: `Navbar`, `Hero`, `TripPlanner`,
   `TripResult`, `MetroLineMap`, `StationTooltip`, `NextTrains`,
   `CrowdingChart`, `MetroCard`, `ServiceAlerts`, `AIChat`, `NearbyStations`,
   `Footer`. Son exactamente los bloques que ya existen en el código.
4. Exporta los iconos desde Figma directamente a `assets/img/`.

No hace falta rediseñarlo todo para cambiar el aspecto: con las variables de
`:root` el sitio entero cambia de identidad.
