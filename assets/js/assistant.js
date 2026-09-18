/*
 * assistant.js — Asistente de la Línea 1
 *
 * Funciona 100 % en el navegador con reglas sobre los datos de data.js:
 * no envía nada a ningún servidor y no necesita clave de API.
 *
 * Para conectar un modelo real, implementa `Asistente.responderRemoto(texto)`
 * contra tu propio endpoint y cambia `Asistente.modo` a 'remoto'.
 * Ver docs/ARQUITECTURA.md.
 */

const Asistente = {
  modo: 'local',
  ubicacion: null, // la rellena app.js cuando el usuario comparte su ubicación

  chips: ['Último tren', 'Tarifa', 'Estación cercana', 'Horario'],

  /* ---------- Normalización ---------- */
  normalizar(t) {
    return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
  },

  detectarEstaciones(texto) {
    const t = this.normalizar(texto);
    const hallados = [];
    LINEA1.estaciones.forEach((e) => {
      const n = this.normalizar(e.nombre);
      const pos = t.indexOf(n);
      if (pos >= 0) hallados.push({ estacion: e, pos, largo: n.length });
      /* "Arriola" también encuentra "Nicolás Arriola" */
      const corto = this.normalizar(e.nombre.split(' ').pop());
      if (pos < 0 && corto.length > 5 && t.includes(corto)) {
        hallados.push({ estacion: e, pos: t.indexOf(corto), largo: corto.length });
      }
    });
    const filtrados = hallados.filter(
      (a) => !hallados.some((b) => b !== a && b.pos <= a.pos && b.pos + b.largo >= a.pos + a.largo && b.largo > a.largo)
    );
    return filtrados.sort((a, b) => a.pos - b.pos).map((h) => h.estacion);
  },

  detectarHora(texto) {
    const t = this.normalizar(texto);
    const m = t.match(/(\d{1,2})[:.](\d{2})/);
    if (m) return { h: Number(m[1]), m: Number(m[2]) };
    const m2 = t.match(/(?:a las|antes de las|antes de la)\s+(\d{1,2})\b/);
    if (m2) return { h: Number(m2[1]), m: 0 };
    return null;
  },

  /* ---------- Motor ----------
     Devuelve { texto } o { tipo:'ruta', viaje, texto } para que la vista
     pueda pintar una tarjeta con acciones. */
  responder(texto) {
    const t = this.normalizar(texto);
    const estaciones = this.detectarEstaciones(texto);
    const hora = this.detectarHora(texto);
    const ahora = new Date();

    /* 1. Llegar antes de una hora determinada */
    if (hora && /antes|llegar|reunion|cita|a las/.test(t) && estaciones.length >= 2) {
      const [a, b] = estaciones;
      const desdeSegundo = t.indexOf('desde') > t.indexOf(this.normalizar(a.nombre));
      const origen = desdeSegundo ? b : a;
      const destino = desdeSegundo ? a : b;
      const viaje = Planner.calcular(origen.id, destino.id, ahora);
      const margen = 10;
      const limite = new Date(ahora);
      limite.setHours(hora.h, hora.m, 0, 0);
      const abordar = new Date(limite.getTime() - (viaje.duracion + margen) * 60000);
      return {
        tipo: 'ruta',
        viaje,
        texto: `Para llegar a ${destino.nombre} antes de las ${String(hora.h).padStart(2, '0')}:${String(hora.m).padStart(2, '0')}, aborda en ${origen.nombre} alrededor de las ${UI.hhmm(abordar)}. El viaje dura unos ${viaje.duracion} minutos y conviene dejar 10 de margen.`
      };
    }

    /* 2. Ruta entre dos estaciones */
    if (estaciones.length >= 2) {
      const [origen, destino] = estaciones;
      const viaje = Planner.calcular(origen.id, destino.id, ahora);
      if (!viaje) return { texto: 'El origen y el destino son la misma estación.' };
      return {
        tipo: 'ruta',
        viaje,
        texto: `El viaje entre ${origen.nombre} y ${destino.nombre} dura aproximadamente ${viaje.duracion} minutos. El próximo tren llega en unos ${viaje.espera} minutos.`
      };
    }

    /* 3. Estación más cercana */
    if (/cercan|cerca de mi|mas cerca|cerca de aqui/.test(t)) {
      if (!this.ubicacion) {
        return { texto: 'Para decirte cuál es tu estación más cercana necesito tu ubicación. Pulsa «Detectar mi ubicación» en la sección «Estaciones cerca de ti» y vuelve a preguntarme.' };
      }
      const c = L1.cercanas(this.ubicacion.lat, this.ubicacion.lng, 2);
      return {
        texto: `Tu estación más cercana es ${c[0].estacion.nombre}, a ${c[0].caminata.texto} (unos ${c[0].caminata.minutos} min caminando).\n\nLa siguiente es ${c[1].estacion.nombre}, a ${c[1].caminata.texto}.`
      };
    }

    /* 4. Horarios */
    if (/ultimo tren|ultimo servicio|hasta que hora|cierra/.test(t)) {
      const est = estaciones[0];
      return { texto: `El servicio cierra alrededor de las ${LINEA1.horario.cierre}${est ? ` en ${est.nombre}` : ''}. El último tren sale del terminal poco antes, así que conviene llegar con unos 15 minutos de holgura. Confirma siempre el horario oficial de tu estación.` };
    }
    if (/primer tren|abre|desde que hora|apertura|^horario/.test(t)) {
      return { texto: `El servicio opera de ${LINEA1.horario.apertura} a ${LINEA1.horario.cierre}${estaciones[0] ? ` en ${estaciones[0].nombre}` : ''}. En hora punta pasa un tren cada 3 minutos aproximadamente; en horas valle, cada 6 u 8.` };
    }

    /* 5. Tarifa */
    if (/tarifa|cuesta|precio|pasaje|cuanto pago|costo/.test(t)) {
      return { texto: `El pasaje es de ${LINEA1.tarifa.moneda} ${LINEA1.tarifa.adulto.toFixed(2)} por viaje, sin importar cuántas estaciones recorras. Se paga con la tarjeta recargable, que puedes consultar en la sección «Mi tarjeta».` };
    }

    /* 6. Afluencia */
    if (/afluencia|lleno|llena|gente|hora conviene|mejor hora|menos gente|hora punta/.test(t)) {
      const mejor = L1.mejorFranja();
      const nivel = L1.nivelAfluencia(ahora.getHours());
      return { texto: `Ahora (${UI.hhmm(ahora)}) la afluencia estimada es ${nivel.texto.toLowerCase()}.\n\n⭐ La franja más tranquila es alrededor de las ${String(mejor).padStart(2, '0')}:00.\n🔴 Las más cargadas son 07:00–09:00 y 18:00–20:00.\n\nEs una estimación del patrón habitual, no un dato en vivo.` };
    }

    /* 7. Estado del servicio */
    if (/estado|demora|retraso|funciona|problema|incidencia/.test(t)) {
      const e = LINEA1.estado;
      return { texto: `Estado del servicio: ${e.mensaje}.${e.tramo ? ` Tramo afectado: ${e.tramo}.` : ''} Revisa la sección de avisos para los comunicados recientes.` };
    }

    /* 8. Cuántas estaciones */
    if (/cuantas estaciones|numero de estaciones|que estaciones/.test(t)) {
      const ext = LINEA1.estaciones;
      return { texto: `La Línea 1 tiene ${ext.length} estaciones, desde ${ext[0].nombre} (sur) hasta ${ext[ext.length - 1].nombre} (norte). Recorrerla de punta a punta toma alrededor de ${L1.duracion(ext[0].id, ext[ext.length - 1].id)} minutos.` };
    }

    /* 9. Accesibilidad */
    if (/accesib|silla de ruedas|ascensor|discapacidad/.test(t)) {
      const est = estaciones[0];
      if (est) return { texto: `${est.nombre} figura como accesible en nuestros datos. Si necesitas apoyo, el personal de estación puede acompañarte al andén.` };
      return { texto: 'Todas las estaciones de la Línea 1 figuran como accesibles en nuestros datos. Dime una estación concreta si quieres el detalle.' };
    }

    /* 10. Una sola estación mencionada */
    if (estaciones.length === 1) {
      const est = estaciones[0];
      const idx = L1.indice(est.id);
      const norte = idx < LINEA1.estaciones.length - 1 ? L1.proximosTrenes(est.id, 'norte', 1, ahora)[0] : null;
      const sur = idx > 0 ? L1.proximosTrenes(est.id, 'sur', 1, ahora)[0] : null;
      return {
        texto: `🚉 ${est.nombre} (${est.distrito})\n\n${norte ? `→ ${LINEA1.sentidos.norte.corto}: ${norte.minutos} min\n` : ''}${sur ? `→ ${LINEA1.sentidos.sur.corto}: ${sur.minutos} min\n` : ''}👥 Afluencia ahora: ${L1.nivelAfluencia(ahora.getHours()).texto.toLowerCase()}${est.salidas ? `\n🚪 Salidas: ${est.salidas.join(', ')}` : ''}\n\nDime a dónde quieres ir y te calculo el viaje.`
      };
    }

    /* 11. Saludo */
    if (/^(hola|buenas|hey|buenos dias|buenas tardes|buenas noches)/.test(t)) {
      return { texto: '¡Hola! Puedo calcularte una ruta, decirte cuándo pasa el próximo tren o a qué hora conviene viajar. Prueba con «de La Cultura a Gamarra».' };
    }

    /* 12. Fallback */
    return {
      texto: 'No pude interpretar esa consulta. Puedo ayudarte con:\n\n• Rutas — «de Angamos a Bayóvar»\n• Horarios — «¿a qué hora pasa el último tren?»\n• Tarifas — «¿cuánto cuesta el pasaje?»\n• Afluencia — «¿a qué hora conviene viajar?»\n• Llegadas — «llegar a Gamarra antes de las 9:30 desde San Borja Sur»'
    };
  },

  /* ---------- Vista ---------- */
  montar({ alVerEnMapa } = {}) {
    const hilo = UI.el('#hilo');
    const forma = UI.el('#forma-asistente');
    const input = UI.el('#pregunta');
    const chips = UI.el('#sugerencias');
    if (!hilo || !forma) return;

    const alFondo = () => { hilo.scrollTop = hilo.scrollHeight; };

    const burbuja = (texto, quien) => {
      const d = document.createElement('div');
      d.className = `burbuja burbuja--${quien}`;
      d.textContent = texto;
      hilo.appendChild(d);
      alFondo();
    };

    const tarjetaRuta = (r) => {
      const { viaje } = r;
      const lista = viaje.paradas
        .map((p, i) => `<li class="${i === 0 || i === viaje.paradas.length - 1 ? 'extremo' : ''}">${p.nombre}</li>`)
        .join('');
      const d = document.createElement('div');
      d.className = 'respuesta';
      d.innerHTML = `
        <div class="respuesta__tarjeta">
          <div class="respuesta__titulo">${viaje.origen.nombre} → ${viaje.destino.nombre}</div>
          <div class="respuesta__filas">
            <div class="respuesta__fila">${UI.icono('tren', 15)} Dirección <strong>${LINEA1.sentidos[viaje.sentido].destino}</strong></div>
            <div class="respuesta__fila">${UI.icono('reloj', 15)} Tiempo de viaje <strong>${viaje.duracion} min</strong></div>
            <div class="respuesta__fila">${UI.icono('pin', 15)} Estaciones <strong>${viaje.paradas.length}</strong></div>
            <div class="respuesta__fila">${UI.icono('bandera', 15)} Llegada <strong>${UI.hhmm12(viaje.llegada)}</strong></div>
          </div>
          <ul class="respuesta__ruta">${lista}</ul>
          <div class="respuesta__acciones">
            <button class="btn btn--suave btn--sm" data-ver-mapa>Ver en el mapa</button>
          </div>
        </div>`;
      d.querySelector('[data-ver-mapa]').addEventListener('click', () => {
        if (alVerEnMapa) alVerEnMapa(viaje.origen.id, viaje.destino.id);
      });
      hilo.appendChild(d);
      alFondo();
    };

    const escribiendo = () => {
      const d = document.createElement('div');
      d.className = 'escribiendo';
      d.innerHTML = '<i></i><i></i><i></i>';
      d.setAttribute('aria-label', 'Escribiendo…');
      hilo.appendChild(d);
      alFondo();
      return d;
    };

    burbuja('¡Hola! Soy el asistente de la Línea 1. Pregúntame por una ruta, un horario o la afluencia de una estación.', 'bot');

    const enviar = (texto) => {
      if (!texto.trim()) return;
      burbuja(texto, 'yo');
      const puntos = escribiendo();
      const r = this.responder(texto);
      setTimeout(() => {
        puntos.remove();
        burbuja(r.texto, 'bot');
        if (r.tipo === 'ruta') tarjetaRuta(r);
      }, 620);
    };

    forma.addEventListener('submit', (ev) => {
      ev.preventDefault();
      enviar(input.value);
      input.value = '';
    });

    if (chips) {
      chips.innerHTML = this.chips.map((c) => `<button type="button" class="chip">${c}</button>`).join('');
      chips.addEventListener('click', (ev) => {
        const chip = ev.target.closest('.chip');
        if (!chip) return;
        /* Completar el input, no enviar: el usuario decide */
        input.value = { 'Último tren': '¿A qué hora pasa el último tren?', 'Tarifa': '¿Cuánto cuesta el pasaje?',
          'Estación cercana': '¿Cuál es la estación más cercana?', 'Horario': '¿Cuál es el horario del servicio?' }[chip.textContent]
          || chip.textContent;
        input.focus();
      });
    }

    this.preguntar = enviar;
  }
};
