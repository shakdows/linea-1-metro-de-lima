/* planner.js — Cálculo del viaje, tarjeta de resultado y animación del recorrido */

const Planner = {
  ultimo: null,

  /* Devuelve todo lo que la interfaz necesita para pintar un viaje */
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

    return {
      origen, destino, sentido, paradas, duracion, espera, llegada,
      afluencia: L1.nivelAfluencia(ahora.getHours()),
      salida: destino.salidas ? destino.salidas[0] : null,
      tarifa: LINEA1.tarifa.adulto
    };
  },

  colorNivel(clave) {
    return { bajo: '#57c97e', medio: '#f5b82e', alto: '#f07c1f', 'muy-alto': '#e5484d', cerrado: '#c9d2ce' }[clave];
  },

  /* Lista de paradas del recorrido; en modo resumen solo muestra los extremos
     y una intermedia cuando el tramo es largo. */
  listaParadas(paradas, completo) {
    const mostrar = completo || paradas.length <= 4
      ? paradas
      : [paradas[0], null, paradas[paradas.length - 1]];

    return mostrar
      .map((p, i) => {
        if (!p) {
          return `<li style="animation-delay:${i * 60}ms;color:var(--texto-suave);font-size:.84rem">
            ${paradas.length - 2} estaciones intermedias</li>`;
        }
        const extremo = p.id === paradas[0].id || p.id === paradas[paradas.length - 1].id;
        const etiqueta = p.id === paradas[0].id ? 'Subes' : p.id === paradas[paradas.length - 1].id ? 'Bajas' : '';
        return `<li class="${extremo ? 'es-extremo' : ''}" style="animation-delay:${i * 60}ms">
          ${p.nombre}${etiqueta ? `<small>${etiqueta}</small>` : ''}
        </li>`;
      })
      .join('');
  },

  pintar(contenedor, viaje, { completo = false } = {}) {
    if (!contenedor) return;
    this.ultimo = viaje;

    if (!viaje) {
      contenedor.hidden = false;
      contenedor.innerHTML = `
        <div class="card" style="text-align:center;color:var(--texto-suave)">
          Elige un origen y un destino diferentes para planificar tu viaje.
        </div>`;
      return;
    }

    const { origen, destino, paradas, duracion, espera, llegada, afluencia, sentido, salida, tarifa } = viaje;
    const cerrado = afluencia.clave === 'cerrado';

    contenedor.hidden = false;
    contenedor.innerHTML = `
      <div class="card viaje">
        <div class="viaje__cabecera">
          <span class="viaje__ruta">
            ${UI.icono('tren', 21)} ${origen.nombre} <span style="color:var(--texto-suave)">→</span> ${destino.nombre}
          </span>
          <span class="badge">Ruta sugerida</span>
          <span class="badge" style="background:var(--fondo);color:var(--texto-suave)">Dirección ${LINEA1.sentidos[sentido].destino}</span>
        </div>

        <div class="viaje__cuerpo">
          <ul class="recorrido" id="recorrido">
            <span class="recorrido__riel" id="recorrido-riel"></span>
            ${this.listaParadas(paradas, completo)}
          </ul>

          <div class="viaje__metricas">
            <div class="metrica">
              <span class="metrica__icono">${UI.icono('reloj', 18)}</span>
              <span>
                <span class="metrica__etiqueta">Tiempo de viaje</span>
                <span class="metrica__valor">${duracion} min</span>
              </span>
            </div>
            <div class="metrica">
              <span class="metrica__icono">${UI.icono('tren', 18)}</span>
              <span>
                <span class="metrica__etiqueta">Próximo tren en</span>
                <span class="metrica__valor">${espera} min</span>
              </span>
            </div>
            <div class="metrica">
              <span class="metrica__icono">${UI.icono('personas', 18)}</span>
              <span>
                <span class="metrica__etiqueta">Afluencia estimada</span>
                <span class="metrica__valor">
                  <span class="punto-nivel" style="background:${this.colorNivel(afluencia.clave)}"></span>${afluencia.texto}
                </span>
              </span>
            </div>
            <div class="metrica">
              <span class="metrica__icono">${UI.icono('bandera', 18)}</span>
              <span>
                <span class="metrica__etiqueta">Hora estimada de llegada</span>
                <span class="metrica__valor">${UI.hhmm12(llegada)}</span>
              </span>
            </div>
          </div>

          <div class="viaje__lateral">
            <button class="btn btn--primario" id="iniciar-viaje">
              Iniciar viaje ${UI.icono('flecha', 15)}
            </button>
            <button class="enlace-suave" id="ver-detalle" style="justify-content:center">
              ${completo ? 'Ocultar detalle' : 'Ver detalle de la ruta'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"
                   stroke-linecap="round" aria-hidden="true" style="transform:rotate(${completo ? 180 : 0}deg)"><path d="M6 9l6 6 6-6"/></svg>
            </button>
          </div>
        </div>

        <div class="viaje__detalle" id="viaje-detalle" ${completo ? '' : 'hidden'}>
          <div class="rejilla" style="grid-template-columns:repeat(auto-fit,minmax(190px,1fr))">
            <div class="alerta alerta--info">
              <span class="alerta__icono">${UI.icono('tren', 16)}</span>
              <div><h4>Recorrido</h4><p>${paradas.length} estaciones en total, ${paradas.length - 1} tramos entre ${origen.nombre} y ${destino.nombre}.</p></div>
            </div>
            ${salida ? `
            <div class="alerta alerta--info">
              <span class="alerta__icono">${UI.icono('puerta', 16)}</span>
              <div><h4>Al bajar</h4><p>Usa la salida hacia <strong>${salida}</strong>.</p></div>
            </div>` : ''}
            <div class="alerta alerta--info">
              <span class="alerta__icono">${UI.icono('info', 16)}</span>
              <div><h4>Tarifa</h4><p>${LINEA1.tarifa.moneda} ${tarifa.toFixed(2)} por viaje, sin importar la distancia.</p></div>
            </div>
            ${cerrado ? `
            <div class="alerta alerta--aviso">
              <span class="alerta__icono">${UI.icono('alerta', 16)}</span>
              <div><h4>Fuera de horario</h4><p>El servicio opera de ${LINEA1.horario.apertura} a ${LINEA1.horario.cierre}.</p></div>
            </div>` : ''}
          </div>
          <p style="font-size:.78rem;color:var(--texto-suave);margin:14px 0 0">
            ${UI.etiquetaDato('estimado')} Tiempos calculados sobre el patrón habitual de la línea.
          </p>
        </div>
      </div>`;

    /* La línea del recorrido se dibuja después del primer frame */
    requestAnimationFrame(() => {
      const riel = UI.el('#recorrido-riel');
      const lista = UI.el('#recorrido');
      if (!riel || !lista) return;
      const items = UI.els('li', lista);
      if (items.length < 2) return;
      const alto = items[items.length - 1].offsetTop + items[items.length - 1].offsetHeight / 2
        - (items[0].offsetTop + items[0].offsetHeight / 2);
      riel.style.top = `${items[0].offsetTop + items[0].offsetHeight / 2}px`;
      riel.style.height = `${Math.max(0, alto)}px`;
    });
  },

  /* Ilumina el tramo en el mapa y desplaza un tren por él */
  animarEnMapa(viaje) {
    const linea = UI.el('#linea');
    if (!linea) return;

    UI.el('.tren-movil', linea)?.remove();
    clearInterval(this._timer);

    if (!viaje) {
      UI.pintarLinea(linea, {});
      return;
    }

    const ids = viaje.paradas.map((p) => p.id);
    UI.pintarLinea(linea, { activa: viaje.origen.id, ruta: ids });

    const nodos = ids.map((id) => UI.el(`.parada[data-estacion="${id}"]`, linea)).filter(Boolean);
    if (!nodos.length) return;

    const tren = document.createElement('div');
    tren.className = 'tren-movil';
    tren.innerHTML = UI.icono('tren', 22);
    tren.setAttribute('aria-hidden', 'true');
    linea.appendChild(tren);

    const colocar = (nodo) => {
      if (nodo) tren.style.left = `${nodo.offsetLeft + nodo.offsetWidth / 2 - 13}px`;
    };
    colocar(nodos[0]);

    let i = 0;
    this._timer = setInterval(() => {
      i += 1;
      if (i >= nodos.length) {
        clearInterval(this._timer);
        setTimeout(() => tren.remove(), 800);
        return;
      }
      colocar(nodos[i]);
    }, 780);

    /* Centrar el tramo en el carrusel horizontal */
    const env = UI.el('#linea-envoltura');
    if (env) {
      const centro = nodos[0].offsetLeft - env.clientWidth / 2 + nodos[0].offsetWidth / 2;
      env.scrollTo({ left: Math.max(0, centro), behavior: 'smooth' });
    }
  }
};
