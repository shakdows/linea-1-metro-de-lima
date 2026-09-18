# Datos: qué es real y qué es estimado

Este proyecto es una **demostración de interfaz**. Para que nadie se confunda,
aquí está separado con claridad el origen de cada dato.

## ✅ Real

| Dato | Detalle |
|---|---|
| Número de estaciones | 26, entre Villa El Salvador y Bayóvar |
| Nombres y orden | Corresponden a la línea real, de sur a norte |
| Distritos | Distrito en el que se ubica cada estación |
| Tarifa plana | La Línea 1 cobra una tarifa única por viaje, sin importar la distancia |

## ⚠️ Estimado o simulado

| Dato | Cómo se genera hoy | Qué hace falta |
|---|---|---|
| **Coordenadas** (`lat`, `lng`) | Aproximadas a mano | Coordenadas oficiales o extraídas de OpenStreetMap |
| **Tiempo entre estaciones** | 2–3 min por tramo | Tiempos reales de la operación |
| **Próximos trenes** | Función determinística sobre el reloj y el *headway* de la franja | API de llegadas en tiempo real |
| **Frecuencias** | Tabla por hora (3 min en punta, 8 min en valle) | Tabla horaria oficial por sentido y estación |
| **Afluencia** | Perfil por hora inventado a partir del patrón típico | Datos de validaciones o conteo de pasajeros |
| **Avisos de servicio** | Siete registros de ejemplo en `data/stations.ts` | Feed / CMS del operador |
| **Estado del servicio** | Constante `normal` | Endpoint de estado |
| **Saldo de la tarjeta** | Número fijo con animación | API de la tarjeta, con autenticación |
| **Salidas de estación** | Incompletas, una o dos por estación | Listado oficial de vestíbulos y salidas |
| **Referencias cercanas** | Solo 9 de 26 estaciones | Listado de puntos de interés por estación |
| **Distancia caminando** | Línea recta × 1,3 a 4,5 km/h | Ruteo peatonal real (OSRM, Mapbox) |
| **Horario 05:30–22:30** | Aproximado y uniforme | Horario por estación y sentido |

Todo lo simulado está identificado en pantalla: cada módulo lleva la nota
«Interfaz conceptual para fines académicos» y las cifras estimadas se muestran
como tales (afluencia *estimada*, frecuencia *estimada*, próximos trenes
calculados sobre el *headway* de la franja).

## Dónde se cambia

Los datos viven en `web/data/`:

| Archivo | Contenido |
|---|---|
| `data/stations.ts` | `STATIONS` (26 estaciones), `LINE`, `DIRECTIONS`, `HEADWAY`, `CROWDING`, `ALERTS`, `SERVICE_STATUS` |
| `data/route.ts` | Trazado (`LINE_PATH`), avenidas y utilidades geográficas |
| `data/card.ts` | Tarjeta de demostración y sus movimientos |

La lógica derivada (rutas, próximos trenes, afluencia, formato de hora) está en
`web/lib/trip.ts`, y el asistente por reglas en `web/lib/assistant.ts`.

```ts
// data/stations.ts
export const HEADWAY: Record<number, number> = { 7: 3, 8: 3, /* … */ };
export const CROWDING: Record<number, number> = { 7: 88, 8: 95, /* … */ };
export const SERVICE_STATUS = { level: "normal", title: "Servicio normal", detail: "…" };
```

Para probar el modo con incidencias, cambia `SERVICE_STATUS`:

```ts
export const SERVICE_STATUS = {
  level: "demoras",
  title: "Demoras en el servicio",
  detail: "Frecuencias ampliadas por regulación",
  segment: "Gamarra ↔ La Cultura",
  extraMinutes: 10,
};
```

Toda la interfaz (barra superior, Inicio, Avisos, inspector de estación) lee de
ahí, así que basta ese cambio para ver el estado degradado en todos los módulos.

## Cómo conectar datos reales

1. Sustituye las constantes de `data/stations.ts` por una llamada a tu API.
   Mantén la forma de los objetos y el resto del código seguirá funcionando.
2. Reemplaza `nextTrains()` de `lib/trip.ts` por la respuesta del endpoint de
   llegadas en tiempo real.
3. Cambia `answer()` de `lib/assistant.ts` por una llamada a tu modelo si
   quieres un asistente real; hoy responde con reglas sobre los datos locales.
4. Si publicas datos que no son oficiales, **deja la nota de aviso**.

## Aviso legal

Proyecto sin ánimo de lucro, sin relación con el operador de la Línea 1 ni con
la Autoridad de Transporte Urbano. Los nombres de estaciones se usan de forma
descriptiva. Si se incorporan la marca o los datos oficiales, hay que contar con
el permiso correspondiente.

---

## Fotografías de las estaciones

La aplicación muestra fotografías reales en la ficha de cada estación, en el
listado y en la tarjeta que aparece al pasar el puntero sobre el mapa.

- **21 de las 26 estaciones** tienen fotografía (`web/public/estaciones/*.webp`).
- Sin foto: Parque Industrial, Pumacahua, San Juan, Atocongo y Ayacucho. La
  interfaz usa un marcador con el color de marca cuando falta.
- Los originales están en `fotos linea 1/estaciones/`; las versiones servidas
  son WebP de 880×560 px, que reducen el peso de 5,5 MB a unos 1,5 MB.

> ⚠️ **Derechos de imagen.** Las fotografías las aportó el autor del proyecto y
> varias parecen material de prensa con personas identificables. Antes de
> publicar el sitio fuera de un contexto académico conviene verificar la
> licencia de cada una o sustituirlas por fotografías propias. La aplicación
> funciona sin ellas: basta con quitar el campo `image` en `data/stations.ts`.
