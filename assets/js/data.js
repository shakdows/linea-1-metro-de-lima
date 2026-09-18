/*
 * data.js — Modelo de datos de la Línea 1 del Metro de Lima
 * ---------------------------------------------------------
 * IMPORTANTE (leer antes de usar en producción):
 *
 * Este archivo contiene datos DEMO. El orden y los nombres de las 26 estaciones
 * corresponden a la línea real, pero los siguientes campos son APROXIMADOS o
 * SIMULADOS y deben reemplazarse por datos oficiales antes de publicar:
 *
 *   - lat / lng ......... coordenadas aproximadas (para el mapa geográfico)
 *   - minutos ........... tiempo estimado entre estaciones
 *   - afluencia ......... perfil histórico estimado, NO es tiempo real
 *   - frecuencias ....... headway estimado por franja horaria
 *   - salidas ........... referencias de salida, incompletas
 *
 * Todo lo que la interfaz muestra a partir de estos campos está marcado en
 * pantalla con la etiqueta "DEMO" o "estimado". Ver docs/DATOS.md.
 */

const LINEA1 = {
  nombre: 'Línea 1',
  sistema: 'Metro de Lima',
  color: '#7AB51D',
  horario: { apertura: '05:30', cierre: '22:30' },
  tarifa: { adulto: 1.5, moneda: 'S/' },

  /* Terminales, usados para rotular los dos sentidos de circulación */
  sentidos: {
    norte: { id: 'norte', destino: 'Bayóvar', corto: 'Bayóvar' },
    sur: { id: 'sur', destino: 'Villa El Salvador', corto: 'Villa El Salvador' }
  },

  /* 26 estaciones, de sur a norte (Villa El Salvador → Bayóvar).
     `minutos` = tiempo estimado desde la estación anterior. */
  estaciones: [
    { id: 'villa-el-salvador', nombre: 'Villa El Salvador', distrito: 'Villa El Salvador', minutos: 0, lat: -12.2136, lng: -76.9370, accesible: true, terminal: true, salidas: ['Av. Separadora Industrial', 'Terminal terrestre'] },
    { id: 'parque-industrial', nombre: 'Parque Industrial', distrito: 'Villa El Salvador', minutos: 2, lat: -12.2050, lng: -76.9352, accesible: true, salidas: ['Av. Separadora Industrial'] },
    { id: 'pumacahua', nombre: 'Pumacahua', distrito: 'Villa El Salvador', minutos: 2, lat: -12.1960, lng: -76.9345, accesible: true, salidas: ['Av. Pumacahua'] },
    { id: 'villa-maria', nombre: 'Villa María', distrito: 'Villa María del Triunfo', minutos: 2, lat: -12.1866, lng: -76.9370, accesible: true, salidas: ['Av. Pachacútec'] },
    { id: 'maria-auxiliadora', nombre: 'María Auxiliadora', distrito: 'San Juan de Miraflores', minutos: 2, lat: -12.1755, lng: -76.9426, accesible: true, salidas: ['Hospital María Auxiliadora'] },
    { id: 'san-juan', nombre: 'San Juan', distrito: 'San Juan de Miraflores', minutos: 2, lat: -12.1670, lng: -76.9455, accesible: true, salidas: ['Av. Los Héroes'] },
    { id: 'atocongo', nombre: 'Atocongo', distrito: 'San Juan de Miraflores', minutos: 2, lat: -12.1581, lng: -76.9740, accesible: true, salidas: ['Av. Los Héroes', 'C.C. Atocongo'] },
    { id: 'jorge-chavez', nombre: 'Jorge Chávez', distrito: 'Santiago de Surco', minutos: 2, lat: -12.1480, lng: -76.9880, accesible: true, salidas: ['Av. Tomás Marsano'] },
    { id: 'ayacucho', nombre: 'Ayacucho', distrito: 'Santiago de Surco', minutos: 2, lat: -12.1400, lng: -76.9930, accesible: true, salidas: ['Av. Ayacucho'] },
    { id: 'cabitos', nombre: 'Cabitos', distrito: 'Santiago de Surco', minutos: 2, lat: -12.1320, lng: -76.9960, accesible: true, salidas: ['Av. Aviación'] },
    { id: 'angamos', nombre: 'Angamos', distrito: 'Surquillo', minutos: 2, lat: -12.1190, lng: -77.0010, accesible: true, salidas: ['Av. Angamos Este'] },
    { id: 'san-borja-sur', nombre: 'San Borja Sur', distrito: 'San Borja', minutos: 2, lat: -12.1060, lng: -77.0000, accesible: true, salidas: ['Av. San Borja Sur'] },
    { id: 'la-cultura', nombre: 'La Cultura', distrito: 'San Borja', minutos: 2, lat: -12.0970, lng: -76.9980, accesible: true, salidas: ['Av. Javier Prado Este', 'Museo de la Nación'] },
    { id: 'arriola', nombre: 'Arriola', distrito: 'La Victoria', minutos: 3, lat: -12.0770, lng: -77.0010, accesible: true, salidas: ['Av. Nicolás Arriola'] },
    { id: 'gamarra', nombre: 'Gamarra', distrito: 'La Victoria', minutos: 2, lat: -12.0680, lng: -77.0030, accesible: true, salidas: ['Av. Aviación', 'Emporio Gamarra'] },
    { id: 'miguel-grau', nombre: 'Miguel Grau', distrito: 'La Victoria', minutos: 2, lat: -12.0570, lng: -77.0170, accesible: true, salidas: ['Av. Grau', 'Conexión Metropolitano'], conexiones: ['Metropolitano (Est. Grau)'] },
    { id: 'el-angel', nombre: 'El Ángel', distrito: 'El Agustino', minutos: 3, lat: -12.0470, lng: -77.0080, accesible: true, salidas: ['Av. Locumba'] },
    { id: 'presbitero-maestro', nombre: 'Presbítero Maestro', distrito: 'El Agustino', minutos: 2, lat: -12.0430, lng: -77.0030, accesible: true, salidas: ['Av. Ancash'] },
    { id: 'caja-de-agua', nombre: 'Caja de Agua', distrito: 'San Juan de Lurigancho', minutos: 3, lat: -12.0290, lng: -77.0010, accesible: true, salidas: ['Av. Próceres de la Independencia'] },
    { id: 'piramide-del-sol', nombre: 'Pirámide del Sol', distrito: 'San Juan de Lurigancho', minutos: 2, lat: -12.0200, lng: -76.9980, accesible: true, salidas: ['Av. Próceres de la Independencia'] },
    { id: 'los-jardines', nombre: 'Los Jardines', distrito: 'San Juan de Lurigancho', minutos: 2, lat: -12.0100, lng: -76.9960, accesible: true, salidas: ['Av. Próceres de la Independencia'] },
    { id: 'los-postes', nombre: 'Los Postes', distrito: 'San Juan de Lurigancho', minutos: 2, lat: -12.0010, lng: -76.9930, accesible: true, salidas: ['Av. Próceres de la Independencia'] },
    { id: 'san-carlos', nombre: 'San Carlos', distrito: 'San Juan de Lurigancho', minutos: 2, lat: -11.9930, lng: -76.9900, accesible: true, salidas: ['Av. Próceres de la Independencia'] },
    { id: 'san-martin', nombre: 'San Martín', distrito: 'San Juan de Lurigancho', minutos: 2, lat: -11.9850, lng: -76.9870, accesible: true, salidas: ['Av. Próceres de la Independencia'] },
    { id: 'santa-rosa', nombre: 'Santa Rosa', distrito: 'San Juan de Lurigancho', minutos: 2, lat: -11.9770, lng: -76.9840, accesible: true, salidas: ['Av. Próceres de la Independencia'] },
    { id: 'bayovar', nombre: 'Bayóvar', distrito: 'San Juan de Lurigancho', minutos: 2, lat: -11.9690, lng: -76.9810, accesible: true, terminal: true, salidas: ['Av. Fernando Wiesse'] }
  ],

  /* Headway estimado (minutos entre trenes) por hora del día. DEMO. */
  frecuencias: {
    5: 8, 6: 5, 7: 3, 8: 3, 9: 4, 10: 6, 11: 7, 12: 6, 13: 6,
    14: 6, 15: 6, 16: 5, 17: 4, 18: 3, 19: 3, 20: 4, 21: 6, 22: 8
  },

  /* Perfil de afluencia estimado por hora (0 a 100). DEMO / histórico. */
  afluencia: {
    5: 35, 6: 62, 7: 88, 8: 95, 9: 74, 10: 45, 11: 38, 12: 46, 13: 52,
    14: 48, 15: 50, 16: 61, 17: 74, 18: 92, 19: 96, 20: 78, 21: 55, 22: 33
  },

  /* Avisos de servicio. En producción vendrían de una API / CMS. */
  avisos: [
    {
      id: 'av-1',
      tipo: 'info',
      titulo: 'Horario extendido por feriado',
      detalle: 'El servicio operará hasta las 23:30 durante el fin de semana largo.',
      fecha: '2026-09-17'
    },
    {
      id: 'av-2',
      tipo: 'aviso',
      titulo: 'Mantenimiento programado en Gamarra',
      detalle: 'Trabajos nocturnos en escaleras mecánicas. No afecta la circulación de trenes.',
      fecha: '2026-09-15'
    },
    {
      id: 'av-3',
      tipo: 'info',
      titulo: 'Recarga tu tarjeta desde la app',
      detalle: 'Ya puedes asociar tu DNI y consultar el saldo sin ir a la estación.',
      fecha: '2026-09-10'
    }
  ],

  /* Estado global del servicio: 'normal' | 'demoras' | 'interrumpido' */
  estado: {
    nivel: 'normal',
    mensaje: 'Todos los trenes operando con normalidad',
    tramo: null,
    demoraMin: 0
  }
};

/* ---------- Utilidades de dominio ---------- */

const L1 = {
  estaciones: LINEA1.estaciones,

  indice(id) {
    return LINEA1.estaciones.findIndex((e) => e.id === id);
  },

  porId(id) {
    return LINEA1.estaciones.find((e) => e.id === id) || null;
  },

  /* Sentido del viaje: 'norte' (hacia Bayóvar) o 'sur' (hacia Villa El Salvador) */
  sentido(origenId, destinoId) {
    return this.indice(destinoId) > this.indice(origenId) ? 'norte' : 'sur';
  },

  /* Lista ordenada de estaciones entre origen y destino, ambos incluidos */
  tramo(origenId, destinoId) {
    const a = this.indice(origenId);
    const b = this.indice(destinoId);
    if (a < 0 || b < 0) return [];
    const seg = LINEA1.estaciones.slice(Math.min(a, b), Math.max(a, b) + 1);
    return a <= b ? seg : seg.slice().reverse();
  },

  /* Tiempo de viaje estimado en minutos (suma de segmentos + paradas) */
  duracion(origenId, destinoId) {
    const a = this.indice(origenId);
    const b = this.indice(destinoId);
    if (a < 0 || b < 0 || a === b) return 0;
    const desde = Math.min(a, b) + 1;
    const hasta = Math.max(a, b);
    let total = 0;
    for (let i = desde; i <= hasta; i++) total += LINEA1.estaciones[i].minutos;
    return Math.max(1, Math.round(total));
  },

  frecuenciaActual(fecha = new Date()) {
    const h = fecha.getHours();
    return LINEA1.frecuencias[h] || 10;
  },

  /* Próximos trenes SIMULADOS a partir del reloj y del headway de la franja.
     Determinístico: la misma hora produce el mismo resultado. */
  proximosTrenes(estacionId, sentido, cantidad = 3, fecha = new Date()) {
    const headway = this.frecuenciaActual(fecha);
    const offset = (this.indice(estacionId) * 37 + (sentido === 'norte' ? 11 : 23)) % headway;
    const minutosDelDia = fecha.getHours() * 60 + fecha.getMinutes();
    const base = headway - ((minutosDelDia + offset) % headway);
    const segs = fecha.getSeconds();
    const salidas = [];
    for (let i = 0; i < cantidad; i++) {
      const min = base + i * headway;
      salidas.push({ minutos: min, segundos: (60 - segs) % 60 });
    }
    return salidas;
  },

  nivelAfluencia(hora) {
    const v = LINEA1.afluencia[hora];
    if (v == null) return { clave: 'cerrado', texto: 'Sin servicio', valor: 0 };
    if (v >= 85) return { clave: 'muy-alto', texto: 'Muy alta', valor: v };
    if (v >= 70) return { clave: 'alto', texto: 'Alta', valor: v };
    if (v >= 45) return { clave: 'medio', texto: 'Media', valor: v };
    return { clave: 'bajo', texto: 'Baja', valor: v };
  },

  /* Mejor franja para viajar dentro del horario de servicio */
  mejorFranja() {
    const horas = Object.keys(LINEA1.afluencia).map(Number).sort((x, y) => x - y);
    let mejor = horas[0];
    horas.forEach((h) => {
      if (LINEA1.afluencia[h] < LINEA1.afluencia[mejor]) mejor = h;
    });
    return mejor;
  },

  /* Estación más cercana a unas coordenadas, por distancia haversine */
  masCercana(lat, lng) {
    const R = 6371;
    const rad = (x) => (x * Math.PI) / 180;
    let mejor = null;
    LINEA1.estaciones.forEach((e) => {
      const dLat = rad(e.lat - lat);
      const dLng = rad(e.lng - lng);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(rad(lat)) * Math.cos(rad(e.lat)) * Math.sin(dLng / 2) ** 2;
      const d = 2 * R * Math.asin(Math.sqrt(a));
      if (!mejor || d < mejor.km) mejor = { estacion: e, km: d };
    });
    return mejor;
  }
};

if (typeof module !== 'undefined') module.exports = { LINEA1, L1 };
