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
| **Avisos de servicio** | Tres ejemplos fijos en `data.js` | Feed / CMS del operador |
| **Estado del servicio** | Constante `normal` | Endpoint de estado |
| **Saldo de la tarjeta** | Número fijo con animación | API de la tarjeta, con autenticación |
| **Salidas de estación** | Incompletas, una o dos por estación | Listado oficial de vestíbulos y salidas |
| **Horario 05:30–22:30** | Aproximado y uniforme | Horario por estación y sentido |

Todo lo simulado está marcado en pantalla con la banda superior de aviso y con
las palabras «estimado» o «aproximado» junto al dato.

## Dónde se cambia

Todo vive en un único archivo: [`assets/js/data.js`](../assets/js/data.js).

```js
const LINEA1 = {
  estaciones: [ /* 26 objetos */ ],
  frecuencias: { 7: 3, 8: 3, ... },   // minutos entre trenes por hora
  afluencia:   { 7: 88, 8: 95, ... }, // 0 a 100
  avisos:      [ ... ],
  estado:      { nivel: 'normal', mensaje: '...' }
};
```

Para probar el modo *demoras*, cambia:

```js
estado: {
  nivel: 'demoras',
  mensaje: 'Demoras en el servicio',
  tramo: 'Gamarra ↔ La Cultura',
  demoraMin: 10
}
```

## Cómo conectar datos reales

1. Sustituye el objeto `LINEA1` por una llamada `fetch()` a tu API o a Supabase.
2. Mantén la forma de los objetos: `L1.*` (las utilidades de dominio) seguirá
   funcionando sin cambios.
3. Reemplaza `L1.proximosTrenes()` por la respuesta del endpoint de llegadas.
4. Si publicas datos que no son oficiales, **deja la banda de aviso**.

## Aviso legal

Proyecto sin ánimo de lucro, sin relación con el operador de la Línea 1 ni con
la Autoridad de Transporte Urbano. Los nombres de estaciones se usan de forma
descriptiva. Si se incorporan la marca o los datos oficiales, hay que contar con
el permiso correspondiente.
