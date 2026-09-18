# Activos visuales: qué falta, qué necesito de ti y cómo generarlo

El sitio **funciona completo sin una sola fotografía**: todo lo visual son
formas, color y tipografía. Pero hay huecos donde una imagen o un vídeo lo
elevan mucho. Aquí está el inventario exacto, con el prompt listo para pegar.

---

## 1. Lo que necesito **de ti** (no lo puedo inventar)

Marcado por prioridad. Sin lo de 🔴 el proyecto queda como demo; con ello queda
como producto.

### 🔴 Imprescindible

| # | Qué | Por qué |
|---|---|---|
| 1 | **¿Es un concepto o va en serio?** Si va en serio, necesitas permiso del operador para usar marca y datos. Si es concepto, mantenemos la banda de aviso y un nombre propio (p. ej. *"Metro Lima — concepto"*). | Define si se puede publicar con la identidad de Línea 1 |
| 2 | **Logotipo en SVG** (o PNG con fondo transparente, mínimo 1024 px) | Hoy hay un marcador de posición geométrico en `assets/img/` |
| 3 | **Verde exacto de marca** en HEX | Uso `#7AB51D`, es una aproximación |
| 4 | **Tipografía autorizada** | Uso Plus Jakarta Sans desde Google Fonts |

### 🟠 Muy recomendable

| # | Qué | Para qué |
|---|---|---|
| 5 | **Horarios oficiales** por estación y sentido (PDF, Excel o enlace) | Reemplazar `frecuencias` en `data.js` |
| 6 | **Tarifa vigente** y tipos de tarjeta | Hoy asumo S/ 1.50 plana |
| 7 | **Coordenadas reales** de las 26 estaciones | Las mías son aproximadas |
| 8 | **Listado de salidas** por estación (a qué avenida da cada vestíbulo) | Es la función que más se usaría a diario |
| 9 | **¿Existe API de llegadas en tiempo real?** Si no, ¿hay datos de validaciones? | Decide si «próximo tren» puede dejar de ser simulado |

### 🟡 Opcional

| # | Qué |
|---|---|
| 10 | Fotos propias de estaciones, andenes y trenes (con derechos) |
| 11 | ¿Quieres modo oscuro? ¿Versión en inglés y quechua? |
| 12 | Dominio para publicarlo |

---

## 2. Inventario de imágenes

Las tres primeras ya existen como **marcador de posición** generado por
`tools/generar_iconos.py`. Sustituye el archivo manteniendo nombre y tamaño y
no hay que tocar código.

| Archivo | Tamaño | Formato | Dónde aparece | Estado |
|---|---|---|---|---|
| `assets/img/favicon.svg` | 64×64 | SVG | Pestaña del navegador | 🟡 Provisional |
| `assets/img/icon-192.png` | 192×192 | PNG | Icono PWA en Android | 🟡 Provisional |
| `assets/img/icon-512.png` | 512×512 | PNG | Icono PWA e instalación | 🟡 Provisional |
| `assets/img/og-cover.png` | 1200×630 | PNG | Vista previa al compartir en WhatsApp, X, LinkedIn | 🟡 Provisional |
| `assets/img/hero.webp` | 1600×1200 | WebP | *(opcional)* fondo del hero | ⚪ No existe |
| `assets/img/estacion-*.webp` | 800×600 | WebP | *(opcional)* foto por estación | ⚪ No existe |
| `assets/img/screenshot-movil.png` | 390×844 | PNG | Captura para el README y la tienda PWA | ✅ Hecha |
| `assets/img/screenshot-escritorio.png` | 1440×1000 | PNG | Captura para el README | ✅ Hecha |

> Las dos capturas ya están tomadas del sitio funcionando. Para rehacerlas tras
> un cambio de diseño: `python3 -m http.server 8000`, abre y captura a esos
> tamaños exactos.

---

## 3. Prompts listos para ChatGPT / DALL·E

Pégalos tal cual. Están escritos para que el resultado encaje con la paleta y
el estilo del sitio.

### 3.1 · Icono de la app (`icon-512.png`)

```
Diseña un icono de aplicación móvil para el metro de Lima, formato cuadrado
1024x1024, esquinas que luego se recortarán en círculo (deja margen de
seguridad del 15% en todos los bordes).

Concepto: el número 1 formado por la vía del metro vista en perspectiva
cenital, o un vagón estilizado visto de frente. Geométrico, de trazo grueso,
legible a 48 píxeles.

Estilo: flat, sin degradados complejos, sin sombras realistas, sin texto
adicional, sin bordes biselados. Estética de icono de sistema iOS/Android 2025.

Color: fondo verde #7AB51D sólido, símbolo en blanco puro #FFFFFF.
Alternativa: fondo verde oscuro #163C2A con símbolo verde #7AB51D.

Fondo plano, sin mockup de teléfono, sin reflejos. PNG.
```

### 3.2 · Portada para compartir (`og-cover.png`)

```
Crea una imagen de portada horizontal 1200x630 px para una web de transporte
público llamada "Línea 1 — Metro de Lima".

Composición: dos tercios izquierdos con espacio negativo limpio para colocar
texto encima (lo añadiré yo, deja esa zona casi vacía). Tercio derecho: un
tren de metro moderno estilizado en vista tres cuartos, muy simplificado,
estilo ilustración vectorial plana.

Debajo, cruzando toda la imagen, una línea horizontal blanca gruesa con
círculos blancos regulares que representan las estaciones, como un plano de
metro esquemático.

Paleta estricta: verde #7AB51D, verde oscuro #163C2A, blanco #FFFFFF.
Degradado suave de verde oscuro arriba a verde claro abajo.

Sin texto, sin logotipos, sin personas, sin marcas reales. Estilo limpio,
geométrico, tipo ilustración editorial de producto digital. Alta resolución.
```

### 3.3 · Fondo del hero (`hero.webp`, opcional)

```
Fotografía cenital muy limpia de un andén de metro moderno, casi vacío,
con un tren entrando por la derecha y desenfoque de movimiento suave.

Luz difusa, sin personas reconocibles (siluetas lejanas como mucho).
Composición con mucho espacio libre en el tercio izquierdo para superponer
texto blanco.

Tratamiento de color: dominante verde y gris frío, poco saturado, contraste
medio-bajo para que el texto encima se lea. Aspecto 4:3, 1600x1200.

Sin marcas visibles, sin texto, sin carteles legibles.
```

Después conviértela: `cwebp -q 80 hero.png -o assets/img/hero.webp`.

### 3.4 · Ilustración por estación (`estacion-*.webp`, opcional)

```
Ilustración vectorial plana e isométrica del acceso a una estación de metro
elevado en Lima: escaleras, torniquetes, marquesina, palmeras bajas al fondo
y cielo claro de día nublado limeño.

Paleta: verde #7AB51D como acento principal, grises cálidos, blanco.
Sin personas con rostro definido, sin texto, sin logotipos.
Estilo limpio y geométrico, coherente con una app de transporte.
Aspecto 4:3, 800x600.
```

Repite cambiando el entorno: *comercial y denso* para Gamarra, *residencial y
abierto* para San Juan de Lurigancho, *institucional y con áreas verdes* para
La Cultura.

### 3.5 · Mascota o personaje guía (opcional)

```
Personaje mascota para una app de transporte público peruana: un vagón de
metro antropomórfico, redondeado, simpático pero sobrio, sin ojos enormes
ni estética infantil. Verde #7AB51D con detalles blancos.

Pose: saludando con una mano, de cuerpo entero, vista frontal.
Estilo vectorial plano, contorno limpio, fondo transparente.
Entrega también una versión solo de la cabeza para usar como avatar del
asistente.
```

---

## 4. Vídeos

### 4.1 · Vídeo de presentación (30–45 s)

No hace falta grabar nada: el mejor vídeo es **la web funcionando**.

1. Sirve el sitio y grábalo con captura de pantalla (OBS, o `Cmd+Shift+5` en Mac).
2. Guion, plano por plano:

| Seg. | Qué se ve | Texto en pantalla |
|---|---|---|
| 0–4 | Hero cargando, la barra verde de estado aparece | *26 estaciones. Una sola app.* |
| 4–12 | Se elige La Cultura → Gamarra y se pulsa Calcular | *Planifica tu viaje* |
| 12–20 | El itinerario se despliega, el tren recorre el mapa | *Tiempo real de tu recorrido* |
| 20–28 | Scroll al gráfico de afluencia, se resalta la mejor franja | *Viaja cuando hay menos gente* |
| 28–38 | Se escribe una pregunta al asistente y responde | *Pregunta en tu idioma* |
| 38–45 | Vista móvil con la barra inferior, se «instala» la PWA | *Añádela a tu pantalla de inicio* |

Música: pista sin derechos, tempo medio, electrónica cálida.
Formatos a exportar: **1920×1080** para web y **1080×1920** para redes.

### 4.2 · Prompt para Sora / generadores de vídeo (plano de recurso)

```
Plano fijo, 5 segundos, cámara estática a la altura del andén.
Un tren de metro moderno y limpio entra en una estación elevada a plena luz
del día, con desenfoque de movimiento suave y una parada progresiva.

Estética: publicitaria, limpia, luz natural difusa, dominante verde y gris.
Sin personas en primer plano, sin texto, sin logotipos ni marcas reales.
Relación de aspecto 16:9, cámara sin movimiento.
```

Otro plano útil:

```
Plano cenital de 6 segundos de un plano esquemático de metro impreso sobre
papel claro: una línea verde recorre la imagen con círculos que marcan
estaciones. Una mano desliza el dedo a lo largo de la línea, de abajo a
arriba. Luz suave, tonos verdes y blancos. Sin texto legible, sin marcas.
```

> Los vídeos generados por IA envejecen mal como contenido principal. Úsalos
> como plano de recurso de 3–5 segundos entre secciones, nunca como base.

---

## 5. Reglas para que todo se vea de la misma familia

Si generas activos, respeta esto o la web perderá coherencia:

```
Verde Línea 1       #7AB51D    acento principal, botones, riel del mapa
Verde oscuro        #163C2A    fondos de tarjeta destacada y pie
Verde suave         #EEF7E0    fondos de estado y etiquetas
Blanco              #FFFFFF    superficie de tarjetas
Gris fondo          #F5F7F5    fondo de página
Texto oscuro        #17201C    texto principal
Texto suave         #5C6B62    texto secundario
Amarillo alertas    #FFB020    demoras
Rojo incidencias    #E5484D    interrupciones
Naranja afluencia   #F57C1F    afluencia alta
```

- **Tipografía**: Plus Jakarta Sans (400, 600, 700, 800). Alternativas: Inter, Manrope.
- **Radios**: 10 px (pequeño), 16 px (medio), 24 px (grande), 999 px (píldora).
- **Sombras**: muy suaves y verdosas, nunca negras puras.
- **Espacio en blanco**: generoso. Nada de banners apilados.
- **Nunca**: degradados de tres colores, neones, glassmorphism, sombras duras,
  fotos con gente mirando a cámara, iconos de estilos distintos mezclados.

### Prompt de sistema para mantener el estilo en ChatGPT

Pégalo al inicio de la conversación donde generes activos:

```
Eres director de arte de una app de transporte público llamada Línea 1
(Metro de Lima). Todo lo que generes debe cumplir:

Paleta estricta: #7AB51D (verde principal), #163C2A (verde oscuro),
#FFFFFF, #F5F7F5, #17201C. Acentos solo #FFB020 y #E5484D.
Tipografía: Plus Jakarta Sans.
Estilo: flat, geométrico, mucho espacio en blanco, esquinas redondeadas,
sombras suaves. Referencias: Citymapper, Apple Maps, apps de metro europeas.
Prohibido: neón, glassmorphism, degradados arcoíris, stock fotográfico
genérico, texto dentro de las imágenes, logotipos de marcas reales.

Cuando te pida un activo, devuelve siempre el tamaño exacto en píxeles y el
formato de archivo recomendado.
```

---

## 6. Si prefieres diseñar antes de programar

Orden que recomiendo:

1. **Figma** — dos artboards: 390×844 (móvil) y 1440×1024 (escritorio).
2. Monta primero la portada con los colores de arriba; el código ya existente
   sirve de referencia exacta de medidas.
3. Exporta los iconos desde Figma directamente a `assets/img/`.
4. Lo que cambies en Figma se traslada al CSS tocando solo las variables de
   `:root` en `assets/css/style.css`.

No hace falta rediseñarlo todo para cambiar el aspecto: cambiando esas ~12
variables, el sitio entero cambia de identidad.
