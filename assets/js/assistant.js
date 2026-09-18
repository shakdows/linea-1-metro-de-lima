/*
 * assistant.js — Asistente de la Línea 1
 *
 * Funciona 100% en el navegador con reglas sobre los datos de data.js:
 * no envía nada a ningún servidor y no necesita clave de API.
 *
 * Si más adelante quieres conectar un modelo real, implementa
 * `Asistente.responderRemoto(texto)` contra tu propio endpoint y
 * cambia `Asistente.modo` a 'remoto'. Ver docs/ARQUITECTURA.md.
 */

const Asistente = {
  modo: 'local',

  sugerencias: [
    '¿Cuánto demoro de La Cultura a Gamarra?',
    '¿A qué hora conviene viajar?',
    '¿Cuánto cuesta el pasaje?',
    'Quiero llegar a Gamarra antes de las 9:30 desde San Borja Sur'
  ],

  /* ---------- Normalización y búsqueda de estaciones ---------- */
  normalizar(t) {
    return t
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  },

  /* Devuelve las estaciones mencionadas, en el orden en que aparecen */
  detectarEstaciones(texto) {
    const t = this.normalizar(texto);
    const hallados = [];
    LINEA1.estaciones.forEach((e) => {
      const n = this.normalizar(e.nombre);
      const pos = t.indexOf(n);
      if (pos >= 0) hallados.push({ estacion: e, pos, largo: n.length });
    });
    /* Si dos coincidencias se solapan (p. ej. "San Juan" dentro de
       "San Juan de Lurigancho"), nos quedamos con la más larga */
    const filtrados = hallados.filter(
      (a) => !hallados.some((b) => b !== a && b.pos <= a.pos && b.pos + b.largo >= a.pos + a.largo && b.largo > a.largo)
    );
    return filtrados.sort((a, b) => a.pos - b.pos).map((h) => h.estacion);
  },

  detectarHora(texto) {
    const m = this.normalizar(texto).match(/(\d{1,2})[:.](\d{2})/);
    if (m) return { h: Number(m[1]), m: Number(m[2]) };
    const m2 = this.normalizar(texto).match(/(?:a las|antes de las|antes de la)\s+(\d{1,2})\b/);
    if (m2) return { h: Number(m2[1]), m: 0 };
    return null;
  },

  /* ---------- Motor de respuestas ---------- */
  responder(texto) {
    const t = this.normalizar(texto);
    const estaciones = this.detectarEstaciones(texto);
    const hora = this.detectarHora(texto);
    const ahora = new Date();

    /* 1. Llegar antes de una hora determinada */
    if (hora && /antes|llegar|reunion|cita|a las/.test(t) && estaciones.length >= 2) {
      const [a, b] = estaciones;
      /* Si la frase es "llegar a X ... desde Y", el origen es el segundo */
      const desdeSegundo = t.indexOf('desde') > t.indexOf(this.normalizar(a.nombre));
      const origen = desdeSegundo ? b : a;
      const destino = desdeSegundo ? a : b;
      const viaje = L1.duracion(origen.id, destino.id);
      const margen = 10;
      const limite = new Date(ahora);
      limite.setHours(hora.h, hora.m, 0, 0);
      const abordar = new Date(limite.getTime() - (viaje + margen) * 60000);
      const sentido = L1.sentido(origen.id, destino.id);
      return `Para llegar a ${destino.nombre} antes de las ${String(hora.h).padStart(2, '0')}:${String(hora.m).padStart(2, '0')}:

📍 Aborda en ${origen.nombre} a las ${UI.hhmm(abordar)} aprox.
🚆 Dirección ${LINEA1.sentidos[sentido].destino}
📍 Bajas en ${destino.nombre}
⏱ Viaje estimado: ${viaje} minutos
🛟 Margen recomendado: ${margen} minutos`;
    }

    /* 2. Ruta entre dos estaciones */
    if (estaciones.length >= 2) {
      const [origen, destino] = estaciones;
      const viaje = Planner.calcular(origen.id, destino.id, ahora);
      if (!viaje) return 'Parece que el origen y el destino son la misma estación.';
      const salida = viaje.salida ? `\n🚪 Salida sugerida en ${destino.nombre}: ${viaje.salida}` : '';
      return `${origen.nombre} → ${destino.nombre}

🚆 ${viaje.paradas.length - 1} estaciones, dirección ${LINEA1.sentidos[viaje.sentido].destino}
⏱ ${viaje.duracion} minutos a bordo
🕐 Próximo tren en ${viaje.espera} min · llegada aprox. ${UI.hhmm(viaje.llegada)}
👥 ${viaje.afluencia.clave === 'cerrado' ? 'Fuera del horario de servicio' : `Afluencia ${viaje.afluencia.texto.toLowerCase()}`}${salida}`;
    }

    /* 3. Horarios (primer / último tren) */
    if (/ultimo tren|ultimo servicio|hasta que hora|cierra/.test(t)) {
      const est = estaciones[0];
      return `El servicio cierra alrededor de las ${LINEA1.horario.cierre}${est ? ` en ${est.nombre}` : ''}. El último tren sale del terminal poco antes de esa hora, así que conviene llegar con 15 minutos de holgura. Confirma siempre el horario oficial de tu estación.`;
    }
    if (/primer tren|abre|desde que hora|apertura/.test(t)) {
      return `El servicio abre a las ${LINEA1.horario.apertura}${estaciones[0] ? ` en ${estaciones[0].nombre}` : ''}. En hora punta pasa un tren cada 3 minutos aproximadamente.`;
    }

    /* 4. Tarifa */
    if (/tarifa|cuesta|precio|pasaje|cuanto pago|costo/.test(t)) {
      return `El pasaje es de ${LINEA1.tarifa.moneda} ${LINEA1.tarifa.adulto.toFixed(2)} por viaje, sin importar cuántas estaciones recorras. Se paga con la tarjeta recargable, que puedes consultar en la sección "Mi tarjeta".`;
    }

    /* 5. Afluencia y mejor hora */
    if (/afluencia|lleno|llena|gente|hora conviene|mejor hora|menos gente|hora punta/.test(t)) {
      const mejor = L1.mejorFranja();
      const ahoraNivel = L1.nivelAfluencia(ahora.getHours());
      return `Ahora mismo (${UI.hhmm(ahora)}) la afluencia estimada es ${ahoraNivel.texto.toLowerCase()}.

⭐ La franja más tranquila del día es alrededor de las ${String(mejor).padStart(2, '0')}:00.
🔴 Las horas más cargadas son 07:00–09:00 y 18:00–20:00.

Es una estimación del patrón habitual, no un dato en tiempo real.`;
    }

    /* 6. Estado del servicio */
    if (/estado|demora|retraso|funciona|problema|incidencia/.test(t)) {
      const e = LINEA1.estado;
      return `Estado del servicio: ${e.mensaje}.${e.tramo ? ` Tramo afectado: ${e.tramo}.` : ''} Revisa la sección de avisos para los comunicados recientes.`;
    }

    /* 7. Cuántas estaciones / extremos */
    if (/cuantas estaciones|numero de estaciones|que estaciones/.test(t)) {
      return `La Línea 1 tiene ${LINEA1.estaciones.length} estaciones, desde ${LINEA1.estaciones[0].nombre} (sur) hasta ${LINEA1.estaciones[LINEA1.estaciones.length - 1].nombre} (norte). Recorrerla de punta a punta toma alrededor de ${L1.duracion(LINEA1.estaciones[0].id, LINEA1.estaciones[LINEA1.estaciones.length - 1].id)} minutos.`;
    }

    /* 8. Accesibilidad */
    if (/accesib|silla de ruedas|ascensor|discapacidad/.test(t)) {
      const est = estaciones[0];
      if (est) return `${est.nombre} está marcada como accesible en nuestros datos${est.accesible ? '' : ' (verifica en la web oficial)'}. Si necesitas apoyo, el personal de estación puede acompañarte al andén.`;
      return 'Todas las estaciones de la Línea 1 figuran como accesibles en nuestros datos. Indícame una estación concreta si quieres el detalle.';
    }

    /* 9. Una sola estación mencionada */
    if (estaciones.length === 1) {
      const est = estaciones[0];
      const norte = L1.proximosTrenes(est.id, 'norte', 1, ahora)[0];
      const sur = L1.proximosTrenes(est.id, 'sur', 1, ahora)[0];
      return `🚉 ${est.nombre} (${est.distrito})

🚆 Hacia ${LINEA1.sentidos.norte.corto}: ${norte.minutos} min
🚆 Hacia ${LINEA1.sentidos.sur.corto}: ${sur.minutos} min
👥 Afluencia ahora: ${L1.nivelAfluencia(ahora.getHours()).texto.toLowerCase()}
${est.salidas ? `🚪 Salidas: ${est.salidas.join(', ')}` : ''}

Dime a dónde quieres ir y te calculo el viaje.`;
    }

    /* 10. Saludo */
    if (/^(hola|buenas|hey|buenos dias|buenas tardes|buenas noches)/.test(t)) {
      return '¡Hola! Puedo calcularte una ruta, decirte cuándo pasa el próximo tren o a qué hora conviene viajar. Prueba con "de La Cultura a Gamarra".';
    }

    /* 11. Fallback */
    return `No pude interpretar esa consulta. Puedo ayudarte con:

• Rutas — "de Angamos a Bayóvar"
• Horarios — "¿a qué hora pasa el último tren?"
• Tarifas — "¿cuánto cuesta el pasaje?"
• Afluencia — "¿a qué hora conviene viajar?"
• Llegadas — "quiero llegar a Gamarra antes de las 9:30 desde San Borja Sur"`;
  },

  /* ---------- Vista ---------- */
  montar() {
    const hilo = UI.el('#hilo');
    const forma = UI.el('#forma-asistente');
    const input = UI.el('#pregunta');
    const sugs = UI.el('#sugerencias');
    if (!hilo || !forma) return;

    const burbuja = (texto, quien) => {
      const d = document.createElement('div');
      d.className = `burbuja burbuja--${quien}`;
      d.textContent = texto;
      hilo.appendChild(d);
      hilo.scrollTop = hilo.scrollHeight;
    };

    burbuja(
      '¡Hola! Soy el asistente de la Línea 1. Pregúntame por una ruta, un horario o la afluencia de una estación.',
      'bot'
    );

    const enviar = (texto) => {
      if (!texto.trim()) return;
      burbuja(texto, 'yo');
      const respuesta = this.responder(texto);
      setTimeout(() => burbuja(respuesta, 'bot'), 260);
    };

    forma.addEventListener('submit', (ev) => {
      ev.preventDefault();
      enviar(input.value);
      input.value = '';
    });

    if (sugs) {
      sugs.innerHTML = this.sugerencias
        .map((s) => `<button type="button" class="chip">${s}</button>`)
        .join('');
      sugs.addEventListener('click', (ev) => {
        const chip = ev.target.closest('.chip');
        if (chip) enviar(chip.textContent);
      });
    }
  }
};
