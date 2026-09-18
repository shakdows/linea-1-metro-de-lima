/* ui.js — Componentes de interfaz reutilizables (sin framework) */

const UI = {
  /* ---------- Selectores ---------- */
  el(sel, raiz = document) { return raiz.querySelector(sel); },
  els(sel, raiz = document) { return Array.from(raiz.querySelectorAll(sel)); },

  /* ---------- Iconografía lineal ---------- */
  iconos: {
    tren: '<rect x="4" y="3" width="16" height="13" rx="4"/><path d="M4 11h16M8 20l-2 2M16 20l2 2"/>',
    reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    personas: '<path d="M16 20v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="3"/><path d="M22 20v-2a4 4 0 00-3-3.87"/>',
    bandera: '<path d="M4 21V4M4 4h13l-2 4 2 4H4"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z"/><circle cx="12" cy="10" r="3"/>',
    chevron: '<path d="M9 6l6 6-6 6"/>',
    flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    caminar: '<circle cx="13" cy="4" r="2"/><path d="M11 21l2-6-3-3 1-5 3 3 3 1M9 13l-2 8"/>',
    puerta: '<path d="M14 3H6a1 1 0 00-1 1v17h9M14 3l5 2v16h-5M14 3v18"/><circle cx="11" cy="12" r=".8" fill="currentColor"/>',
    alerta: '<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17.5v.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/>',
    accesible: '<circle cx="12" cy="4.5" r="2"/><path d="M12 8v5h4l3 6M12 13H8l-1 7"/>',
    mapa: '<path d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3z"/><path d="M9 3v15M15 6v15"/>'
  },

  icono(nombre, tam = 16) {
    return `<svg width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${this.iconos[nombre] || ''}</svg>`;
  },

  /* ---------- Fechas y horas ---------- */
  hhmm(fecha) {
    return fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false });
  },
  hhmm12(fecha) {
    return fecha.toLocaleTimeString('es-PE', { hour: 'numeric', minute: '2-digit', hour12: true })
      .replace('a. m.', 'a. m.').replace('p. m.', 'p. m.');
  },
  sumarMinutos(fecha, min) { return new Date(fecha.getTime() + min * 60000); },
  fecha(iso) {
    return new Date(iso + 'T12:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'long' });
  },

  /* ---------- Etiqueta de procedencia del dato ---------- */
  etiquetaDato(clave, claro = false) {
    const p = LINEA1.procedencia[clave];
    if (!p) return '';
    return `<span class="dato dato--${p.clave}${claro ? ' dato--claro' : ''}" title="${p.detalle}">${p.icono} ${p.texto}</span>`;
  },

  /* ---------- Selects de estación ---------- */
  llenarSelect(select, seleccionado) {
    select.innerHTML = LINEA1.estaciones.map((e) => `<option value="${e.id}">${e.nombre}</option>`).join('');
    if (seleccionado) select.value = seleccionado;
  },

  /* ---------- Estado del servicio ---------- */
  pintarEstado() {
    const { nivel, mensaje, tramo, demoraMin } = LINEA1.estado;
    const titulos = { normal: 'Servicio normal', demoras: 'Demoras en el servicio', interrumpido: 'Servicio interrumpido' };

    const pill = UI.el('#estado-pill');
    if (pill) {
      pill.classList.remove('estado-pill--demoras', 'estado-pill--interrumpido');
      if (nivel !== 'normal') pill.classList.add(`estado-pill--${nivel}`);
      UI.el('.estado-pill__titulo', pill).textContent = titulos[nivel] || titulos.normal;
      UI.el('.estado-pill__sub', pill).textContent = mensaje;
    }

    /* Banda superior solo cuando hay incidencia */
    const banda = UI.el('#incidencia');
    if (!banda) return;
    if (nivel === 'normal') { banda.hidden = true; return; }

    banda.hidden = false;
    banda.classList.toggle('incidencia--interrumpido', nivel === 'interrumpido');
    const partes = tramo ? tramo.split('↔').map((t) => t.trim()) : [];
    banda.innerHTML = `
      <div class="incidencia__inner">
        <span>${UI.icono('alerta', 22)}</span>
        <div style="flex:1;min-width:200px">
          <div class="incidencia__titulo">${titulos[nivel]}</div>
          ${partes.length === 2 ? `
            <div class="incidencia__tramo">
              <strong>${partes[0]}</strong><span class="incidencia__linea"></span><strong>${partes[1]}</strong>
              ${demoraMin ? `<span>+${demoraMin} min aprox.</span>` : ''}
            </div>` : `<div class="incidencia__tramo">${mensaje}</div>`}
        </div>
        <a class="btn btn--fantasma btn--sm" href="#avisos">Ver incidencia</a>
      </div>`;
  },

  /* ---------- Mapa esquemático horizontal ---------- */
  pintarLinea(contenedor, { activa, ruta = [] } = {}) {
    if (!contenedor) return;
    contenedor.classList.toggle('con-ruta', ruta.length > 0);
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
          <span class="parada__nombre">${e.nombre}</span>
        </button>`;
      })
      .join('');
  },

  /* ---------- Ficha flotante de estación ---------- */
  abrirTooltip(estacionId, anchorEl, { conAcciones = true } = {}) {
    const pop = UI.el('#tooltip');
    const est = L1.porId(estacionId);
    if (!pop || !est) return;

    const ahora = new Date();
    const idx = L1.indice(est.id);
    const norte = idx < LINEA1.estaciones.length - 1 ? L1.proximosTrenes(est.id, 'norte', 1, ahora)[0] : null;
    const sur = idx > 0 ? L1.proximosTrenes(est.id, 'sur', 1, ahora)[0] : null;
    const afl = L1.nivelAfluencia(ahora.getHours());
    const estados = { normal: 'Servicio normal', demoras: 'Demoras en el servicio', interrumpido: 'Servicio interrumpido' };

    pop.innerHTML = `
      <button class="tooltip-estacion__cerrar" data-cerrar aria-label="Cerrar">×</button>
      <div class="tooltip-estacion__titulo">${UI.icono('tren', 18)} ${est.nombre}</div>
      <div class="tooltip-estacion__distrito">${est.distrito}</div>
      <div class="tooltip-estacion__estado"><span style="width:7px;height:7px;border-radius:50%;background:currentColor"></span>${estados[LINEA1.estado.nivel]}</div>
      <dl>
        ${norte ? `<dt>→ ${LINEA1.sentidos.norte.corto}</dt><dd>${norte.minutos} min</dd>` : ''}
        ${sur ? `<dt>→ ${LINEA1.sentidos.sur.corto}</dt><dd>${sur.minutos} min</dd>` : ''}
        <dt>Afluencia</dt><dd>${afl.texto}</dd>
        ${est.accesible ? '<dt>Accesible</dt><dd>Sí</dd>' : ''}
      </dl>
      ${conAcciones ? `
        <div class="tooltip-estacion__acciones">
          <button class="btn btn--suave btn--sm" data-elegir="origen">Como origen</button>
          <button class="btn btn--suave btn--sm" data-elegir="destino">Como destino</button>
        </div>` : ''}
      <a class="btn btn--primario btn--sm btn--bloque" href="estacion.html?id=${est.id}">
        Ver estación ${UI.icono('flecha', 14)}
      </a>`;

    pop.dataset.estacion = est.id;
    pop.hidden = false;

    const r = anchorEl.getBoundingClientRect();
    const pr = pop.getBoundingClientRect();
    let top = r.bottom + 10;
    if (top + pr.height > window.innerHeight - 10) top = Math.max(10, r.top - pr.height - 10);
    let left = r.left + r.width / 2 - pr.width / 2;
    left = Math.min(Math.max(10, left), window.innerWidth - pr.width - 10);
    pop.style.top = `${top}px`;
    pop.style.left = `${left}px`;
  },

  cerrarTooltip() {
    const pop = UI.el('#tooltip');
    if (pop) pop.hidden = true;
  },

  /* ---------- Próximos trenes: dos columnas con estado del tren ---------- */
  pintarTrenes(contenedor, estacionId) {
    if (!contenedor) return;
    const ahora = new Date();
    const idx = L1.indice(estacionId);
    const sentidos = [];
    if (idx < LINEA1.estaciones.length - 1) sentidos.push('norte');
    if (idx > 0) sentidos.push('sur');

    contenedor.innerHTML = sentidos
      .map((sentido) => {
        const salidas = L1.proximosTrenes(estacionId, sentido, 3, ahora);
        const filas = salidas
          .map((s, i) => {
            const estado = s.minutos <= 1 ? 'En plataforma' : i === 0 ? 'Llegando' : 'En camino';
            return `
            <div class="anden__fila ${i === 0 ? 'anden__fila--proximo' : ''}">
              <span class="anden__min">${s.minutos} min</span>
              <span class="anden__estado">${estado}</span>
              <span class="anden__hora">${UI.hhmm(UI.sumarMinutos(ahora, s.minutos))}</span>
            </div>`;
          })
          .join('');
        return `
        <div class="anden">
          <div class="anden__titulo">Hacia ${LINEA1.sentidos[sentido].destino}${UI.icono('chevron', 15)}</div>
          ${filas}
        </div>`;
      })
      .join('');
  },

  /* ---------- Gráfico de afluencia ---------- */
  pintarAfluencia(contenedor, ejes) {
    if (!contenedor) return;
    const horaActual = new Date().getHours();
    const horas = Object.keys(LINEA1.afluencia).map(Number).sort((a, b) => a - b);

    contenedor.innerHTML = horas
      .map((h) => {
        const n = L1.nivelAfluencia(h);
        return `
        <button type="button" class="barra ${h === horaActual ? 'es-ahora' : ''}" data-hora="${h}"
                aria-label="${String(h).padStart(2, '0')}:00, afluencia ${n.texto.toLowerCase()}, ${n.valor} por ciento estimado">
          <span class="barra__relleno" data-nivel="${n.clave}" style="height:0%"></span>
        </button>`;
      })
      .join('');

    requestAnimationFrame(() => {
      UI.els('.barra__relleno', contenedor).forEach((b, i) => {
        b.style.height = `${LINEA1.afluencia[horas[i]]}%`;
      });
    });

    /* El eje usa la misma rejilla que el gráfico, así cada etiqueta queda
       exactamente debajo de su barra. */
    if (ejes) {
      ejes.innerHTML = horas
        .map((h) => `<span>${h % 2 === 0 ? h : ''}</span>`)
        .join('');
    }
  },

  /* ---------- Detalle de una hora concreta ---------- */
  pintarHoraDetalle(contenedor, hora) {
    if (!contenedor) return;
    const n = L1.nivelAfluencia(hora);
    const colores = { bajo: '#57c97e', medio: '#f5b82e', alto: '#f07c1f', 'muy-alto': '#e5484d', cerrado: '#c9d2ce' };
    contenedor.innerHTML = `
      <div class="hora-detalle">
        <div>
          <div class="hora-detalle__hora">${String(hora).padStart(2, '0')}:00</div>
        </div>
        <div>
          <div class="hora-detalle__nivel">
            <span class="punto-nivel" style="background:${colores[n.clave]}"></span>${n.texto}
          </div>
          <div class="hora-detalle__pct">${n.valor}% de ocupación estimada</div>
        </div>
        <div class="hora-detalle__medidor"><i style="width:${n.valor}%;background:${colores[n.clave]}"></i></div>
      </div>`;
  },

  /* ---------- Avisos ---------- */
  pintarAvisos(contenedor, limite = 2) {
    if (!contenedor) return;
    contenedor.innerHTML = LINEA1.avisos
      .slice(0, limite)
      .map(
        (a) => `
      <article class="alerta alerta--${a.tipo}">
        <span class="alerta__icono">${UI.icono(a.tipo === 'info' ? 'info' : 'alerta', 17)}</span>
        <div>
          <h4>${a.titulo}</h4>
          <p>${a.detalle}</p>
          <time datetime="${a.fecha}">${UI.fecha(a.fecha)}</time>
        </div>
      </article>`
      )
      .join('');
  },

  /* ---------- Estaciones cercanas ---------- */
  pintarCercanas(contenedor, lista, { conUbicacion = false } = {}) {
    if (!contenedor) return;
    contenedor.innerHTML = lista
      .map(
        (c, i) => `
      <a class="cercana ${i === 0 && conUbicacion ? 'cercana--primera' : ''}" href="estacion.html?id=${c.estacion.id}">
        <span class="cercana__icono">${UI.icono('tren', 19)}</span>
        <span>
          <span class="cercana__nombre">${c.estacion.nombre}</span>
          <span class="cercana__meta">${
            conUbicacion
              ? `${c.caminata.texto} · ${c.caminata.minutos} min caminando`
              : c.estacion.distrito
          }</span>
        </span>
        <span class="cercana__flecha">${UI.icono('chevron', 17)}</span>
      </a>`
      )
      .join('');
  },

  /* ---------- Skeleton mientras se calcula ---------- */
  skeleton(contenedor, alto = 'bloque') {
    if (!contenedor) return;
    contenedor.hidden = false;
    contenedor.innerHTML = `
      <div class="card">
        <div class="skeleton skeleton--linea skeleton--ancho" style="height:18px"></div>
        <div class="skeleton skeleton--${alto}" style="margin-top:16px"></div>
      </div>`;
  }
};
