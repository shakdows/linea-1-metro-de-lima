/* planner.js — Planificador de viajes y animación del recorrido */

const Planner = {
  ultimaRuta: [],

  /* Calcula el viaje y devuelve un objeto con todo lo que la UI necesita */
  calcular(origenId, destinoId, ahora = new Date()) {
    if (origenId === destinoId) return null;

    const origen = L1.porId(origenId);
    const destino = L1.porId(destinoId);
    if (!origen || !destino) return null;

    const sentido = L1.sentido(origenId, destinoId);
    const paradas = L1.tramo(origenId, destinoId);
    const duracion = L1.duracion(origenId, destinoId);
    const espera = L1.proximosTrenes(origenId, sentido, 1, ahora)[0].minutos;
    const llegada = UI.sumarMinutos(ahora, espera + duracion);
    const afl = L1.nivelAfluencia(ahora.getHours());

    return {
      origen,
      destino,
      sentido,
      paradas,
      duracion,
      espera,
      llegada,
      afluencia: afl,
      salida: paradas[paradas.length - 1].salidas ? paradas[paradas.length - 1].salidas[0] : null,
      tarifa: LINEA1.tarifa.adulto
    };
  },

  /* Dibuja el resultado dentro del contenedor indicado */
  pintar(contenedor, viaje) {
    if (!contenedor) return;

    if (!viaje) {
      contenedor.hidden = false;
      contenedor.innerHTML = `
        <div class="tarjeta tarjeta--plana" style="border-style:dashed;text-align:center">
          Elige un origen y un destino diferentes para calcular tu viaje.
        </div>`;
      return;
    }

    const { origen, destino, paradas, duracion, espera, llegada, afluencia, sentido, salida, tarifa } = viaje;
    const intermedias = paradas.length - 2;

    const lista = paradas
      .map((p, i) => {
        const extremo = i === 0 || i === paradas.length - 1;
        const etiqueta = i === 0 ? 'Subes' : i === paradas.length - 1 ? 'Bajas' : '';
        return `<li class="${extremo ? 'es-extremo' : ''}" style="animation-delay:${i * 45}ms">
          ${p.nombre}${etiqueta ? `<small>${etiqueta}</small>` : ''}
        </li>`;
      })
      .join('');

    contenedor.hidden = false;
    contenedor.innerHTML = `
      <div class="resultado__tarjeta">
        <div style="font-size:.74rem;letter-spacing:.08em;text-transform:uppercase;opacity:.7;margin-bottom:4px">
          Dirección ${LINEA1.sentidos[sentido].destino}
        </div>
        <div style="font-weight:800;font-size:1.15rem;margin-bottom:18px">
          ${origen.nombre} → ${destino.nombre}
        </div>

        <div class="resultado__cifras">
          <div><span class="cifra__valor">${duracion} min</span><span class="cifra__etiqueta">A bordo</span></div>
          <div><span class="cifra__valor">${paradas.length - 1}</span><span class="cifra__etiqueta">Estaciones</span></div>
          <div><span class="cifra__valor">${UI.hhmm(llegada)}</span><span class="cifra__etiqueta">Llegada aprox.</span></div>
        </div>

        <ul class="itinerario">${lista}</ul>

        <p class="resultado__nota">
          <span>🚆</span>
          <span>Próximo tren en <strong>${espera} min</strong>.
          ${intermedias > 0 ? `Pasas por ${intermedias} estación${intermedias > 1 ? 'es' : ''} intermedia${intermedias > 1 ? 's' : ''}.` : 'Es la estación contigua.'}
          ${afluencia.clave === 'cerrado' ? 'Consulta el horario: el servicio está fuera de operación a esta hora.' : `Afluencia ${afluencia.texto.toLowerCase()} en este momento.`}</span>
        </p>

        ${salida ? `<p class="resultado__nota"><span>🚪</span><span>Al bajar en <strong>${destino.nombre}</strong>, usa la salida hacia <strong>${salida}</strong>.</span></p>` : ''}

        <p class="resultado__nota"><span>🎫</span><span>Tarifa ${LINEA1.tarifa.moneda} ${tarifa.toFixed(2)} por viaje, sin importar la distancia.</span></p>
      </div>`;
  },

  /* Resalta el recorrido en el mapa esquemático y anima el tren */
  animarEnMapa(viaje) {
    const linea = UI.el('#linea');
    if (!linea) return;

    UI.els('.parada', linea).forEach((p) => p.classList.remove('en-ruta', 'activa'));
    UI.el('.tren-movil', linea)?.remove();
    if (!viaje) return;

    const ids = viaje.paradas.map((p) => p.id);
    this.ultimaRuta = ids;

    const nodos = ids
      .map((id) => UI.el(`.parada[data-estacion="${id}"]`, linea))
      .filter(Boolean);
    nodos.forEach((n) => n.classList.add('en-ruta'));
    nodos[0]?.classList.add('activa');

    /* Tren que recorre las paradas del tramo */
    const tren = document.createElement('div');
    tren.className = 'tren-movil';
    tren.textContent = '🚆';
    tren.setAttribute('aria-hidden', 'true');
    linea.appendChild(tren);

    const horizontal = window.matchMedia('(min-width: 960px)').matches;
    const colocar = (nodo) => {
      if (!nodo) return;
      if (horizontal) {
        tren.style.left = `${nodo.offsetLeft + nodo.offsetWidth / 2 - 11}px`;
        tren.style.top = '0px';
      } else {
        tren.style.top = `${nodo.offsetTop + nodo.offsetHeight / 2 - 11}px`;
      }
    };

    colocar(nodos[0]);
    let i = 0;
    clearInterval(this._timer);
    this._timer = setInterval(() => {
      i += 1;
      if (i >= nodos.length) {
        clearInterval(this._timer);
        setTimeout(() => tren.remove(), 900);
        return;
      }
      colocar(nodos[i]);
    }, 900);

    nodos[0]?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }
};
