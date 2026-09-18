/* ui.js — Componentes de interfaz reutilizables (sin framework) */

const UI = {
  /* ---------- Helpers ---------- */
  el(sel, raiz = document) { return raiz.querySelector(sel); },
  els(sel, raiz = document) { return Array.from(raiz.querySelectorAll(sel)); },

  hhmm(fecha) {
    return fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false });
  },

  sumarMinutos(fecha, min) {
    return new Date(fecha.getTime() + min * 60000);
  },

  fecha(iso) {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long' });
  },

  /* ---------- Selects de estación ---------- */
  llenarSelect(select, seleccionado) {
    select.innerHTML = LINEA1.estaciones
      .map((e) => `<option value="${e.id}">${e.nombre}</option>`)
      .join('');
    if (seleccionado) select.value = seleccionado;
  },

  /* ---------- Barra de estado del servicio ---------- */
  pintarEstado(nodo) {
    if (!nodo) return;
    const { nivel, mensaje, tramo, demoraMin } = LINEA1.estado;
    nodo.classList.remove('estado--demoras', 'estado--interrumpido');
    if (nivel === 'demoras') nodo.classList.add('estado--demoras');
    if (nivel === 'interrumpido') nodo.classList.add('estado--interrumpido');

    const extra = tramo
      ? ` <span class="estado__extra">· ${tramo}${demoraMin ? ` · +${demoraMin} min` : ''}</span>`
      : ` <span class="estado__extra">· actualizado ${UI.hhmm(new Date())}</span>`;

    nodo.innerHTML = `<span class="estado__pulso"></span><span class="estado__texto">${mensaje}</span>${extra}`;
  },

  /* ---------- Mapa esquemático de la línea ---------- */
  pintarLinea(contenedor, { activa, ruta = [] } = {}) {
    if (!contenedor) return;
    contenedor.innerHTML = LINEA1.estaciones
      .map((e) => {
        const clases = ['parada'];
        if (e.id === activa) clases.push('activa');
        if (ruta.includes(e.id)) clases.push('en-ruta');
        return `
        <button type="button" class="${clases.join(' ')}" role="listitem"
                data-estacion="${e.id}" data-terminal="${!!e.terminal}"
                aria-label="Estación ${e.nombre}, distrito ${e.distrito}">
          <span class="parada__riel"><span class="parada__punto"></span></span>
          <span class="parada__texto">
            <span class="parada__nombre">${e.nombre}</span>
            <span class="parada__distrito">${e.distrito}</span>
          </span>
          ${e.id === activa ? '<span class="parada__aqui">Estás aquí</span>' : ''}
        </button>`;
      })
      .join('');
  },

  /* ---------- Tarjeta flotante al tocar una estación ---------- */
  abrirPopover(estacionId, anchorEl) {
    const pop = UI.el('#popover');
    const est = L1.porId(estacionId);
    if (!pop || !est) return;

    const ahora = new Date();
    const norte = L1.proximosTrenes(est.id, 'norte', 1, ahora)[0];
    const sur = L1.proximosTrenes(est.id, 'sur', 1, ahora)[0];
    const afl = L1.nivelAfluencia(ahora.getHours());

    pop.innerHTML = `
      <button class="popover__cerrar" data-cerrar aria-label="Cerrar">×</button>
      <div class="popover__titulo">🚉 ${est.nombre}</div>
      <div style="font-size:.82rem;color:var(--texto-suave)">${est.distrito}</div>
      <dl>
        <dt>→ ${LINEA1.sentidos.norte.corto}</dt><dd>${norte.minutos} min</dd>
        <dt>→ ${LINEA1.sentidos.sur.corto}</dt><dd>${sur.minutos} min</dd>
        <dt>Afluencia</dt><dd>${afl.texto}</dd>
        <dt>Accesible</dt><dd>${est.accesible ? '♿ Sí' : 'No'}</dd>
      </dl>
      <a class="btn btn--primario btn--sm btn--bloque" style="margin-top:14px"
         href="estacion.html?id=${est.id}">Ver estación</a>`;

    pop.hidden = false;

    /* Posicionar cerca del elemento, sin salirse de la ventana */
    const r = anchorEl.getBoundingClientRect();
    const pr = pop.getBoundingClientRect();
    let top = r.bottom + 8;
    if (top + pr.height > window.innerHeight - 8) top = Math.max(8, r.top - pr.height - 8);
    let left = r.left + r.width / 2 - pr.width / 2;
    left = Math.min(Math.max(8, left), window.innerWidth - pr.width - 8);
    pop.style.top = `${top}px`;
    pop.style.left = `${left}px`;
  },

  cerrarPopover() {
    const pop = UI.el('#popover');
    if (pop) pop.hidden = true;
  },

  /* ---------- Gráfico de afluencia por hora ---------- */
  pintarAfluencia(contenedor, horaActual = new Date().getHours()) {
    if (!contenedor) return;
    const horas = Object.keys(LINEA1.afluencia).map(Number).sort((a, b) => a - b);
    contenedor.innerHTML = horas
      .map((h) => {
        const n = L1.nivelAfluencia(h);
        return `
        <div class="barra ${h === horaActual ? 'es-ahora' : ''}"
             title="${String(h).padStart(2, '0')}:00 · afluencia ${n.texto.toLowerCase()}">
          <div class="barra__relleno" data-nivel="${n.clave}" style="height:0%"></div>
          <div class="barra__hora">${String(h).padStart(2, '0')}</div>
        </div>`;
      })
      .join('');

    /* Animar la altura después del primer frame */
    requestAnimationFrame(() => {
      UI.els('.barra__relleno', contenedor).forEach((b, i) => {
        b.style.height = `${LINEA1.afluencia[horas[i]]}%`;
      });
    });
  },

  /* ---------- Avisos ---------- */
  pintarAvisos(contenedor) {
    if (!contenedor) return;
    contenedor.innerHTML = LINEA1.avisos
      .map(
        (a) => `
      <article class="aviso aviso--${a.tipo}">
        <span class="aviso__icono">${a.tipo === 'aviso' ? '⚠️' : 'ℹ️'}</span>
        <div>
          <h4>${a.titulo}</h4>
          <p>${a.detalle}</p>
          <time datetime="${a.fecha}">${UI.fecha(a.fecha)}</time>
        </div>
      </article>`
      )
      .join('');
  },

  /* ---------- Bloque de próximos trenes en ambos sentidos ---------- */
  pintarTrenes(contenedor, estacionId) {
    if (!contenedor) return;
    const ahora = new Date();
    const est = L1.porId(estacionId);
    const idx = L1.indice(estacionId);

    const bloques = [];
    if (idx < LINEA1.estaciones.length - 1) bloques.push('norte');
    if (idx > 0) bloques.push('sur');

    contenedor.innerHTML = bloques
      .map((sentido) => {
        const salidas = L1.proximosTrenes(estacionId, sentido, 3, ahora);
        const destino = LINEA1.sentidos[sentido].destino;
        const filas = salidas
          .map(
            (s, i) => `
          <div class="tren-fila">
            <div>
              <div class="tren-fila__destino">${i === 0 ? 'Próximo tren' : `Tren ${i + 1}`}</div>
              <div class="tren-fila__sub">Sale ${UI.hhmm(UI.sumarMinutos(ahora, s.minutos))}</div>
            </div>
            <div class="tren-fila__tiempo">${s.minutos}<span>min</span></div>
          </div>`
          )
          .join('');
        return `
        <div class="tarjeta">
          <div class="tarjeta__titulo">
            <span>🚆</span>
            <h3>Dirección ${destino}</h3>
          </div>
          <div class="trenes">${filas}</div>
          <p style="font-size:.78rem;color:var(--texto-suave);margin:12px 0 0">
            Frecuencia estimada: 1 tren cada ${L1.frecuenciaActual(ahora)} min desde ${est.nombre}.
          </p>
        </div>`;
      })
      .join('');
  }
};
