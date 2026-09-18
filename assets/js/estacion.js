/* estacion.js — Página de detalle de una estación (?id=la-cultura) */

(function () {
  const params = new URLSearchParams(location.search);
  const inicial = L1.porId(params.get('id')) ? params.get('id') : 'la-cultura';

  const selector = UI.el('#selector');
  const destinoSel = UI.el('#destino');
  UI.llenarSelect(selector, inicial);
  UI.llenarSelect(destinoSel, inicial === 'gamarra' ? 'la-cultura' : 'gamarra');

  function pintar(id) {
    const est = L1.porId(id);
    if (!est) return;

    document.title = `${est.nombre} — Línea 1`;
    UI.el('#miga-nombre').textContent = est.nombre;
    UI.el('#est-nombre').textContent = est.nombre;
    UI.el('#est-distrito').textContent = `Distrito de ${est.distrito}`;
    UI.pintarEstado(UI.el('#est-estado'));

    /* Etiquetas */
    const etiquetas = [];
    if (est.terminal) etiquetas.push('🚉 Estación terminal');
    if (est.accesible) etiquetas.push('♿ Accesible');
    if (est.conexiones) est.conexiones.forEach((c) => etiquetas.push(`🔀 ${c}`));
    etiquetas.push(`📍 Estación ${L1.indice(id) + 1} de ${LINEA1.estaciones.length}`);
    UI.el('#est-etiquetas').innerHTML = etiquetas.map((e) => `<span class="etiqueta">${e}</span>`).join('');

    /* Trenes y afluencia */
    UI.pintarTrenes(UI.el('#est-trenes'), id);
    UI.pintarAfluencia(UI.el('#est-afluencia'));
    const mejor = L1.mejorFranja();
    UI.el('#est-mejor').innerHTML =
      `⭐ Momento más tranquilo: <strong>${String(mejor).padStart(2, '0')}:00 – ${String(mejor + 1).padStart(2, '0')}:00</strong>`;

    /* Salidas */
    UI.el('#est-salidas').innerHTML = (est.salidas || ['Información no disponible'])
      .map((s) => `<li><span>🚪</span><span>${s}</span></li>`)
      .join('');

    /* Vecinas */
    const i = L1.indice(id);
    const vecinas = [];
    if (i > 0) vecinas.push({ e: LINEA1.estaciones[i - 1], dir: LINEA1.sentidos.sur.corto });
    if (i < LINEA1.estaciones.length - 1) vecinas.push({ e: LINEA1.estaciones[i + 1], dir: LINEA1.sentidos.norte.corto });
    UI.el('#est-vecinas').innerHTML = vecinas
      .map(
        (v) =>
          `<li><span>🚆</span><span><a href="estacion.html?id=${v.e.id}" style="color:var(--verde-600);font-weight:700;text-decoration:none">${v.e.nombre}</a> — hacia ${v.dir}</span></li>`
      )
      .join('');

    /* Horario */
    UI.el('#est-horario').innerHTML = `
      <li><span>🕐</span><span>Apertura: <strong>${LINEA1.horario.apertura}</strong></span></li>
      <li><span>🌙</span><span>Cierre: <strong>${LINEA1.horario.cierre}</strong></span></li>
      <li><span>🎫</span><span>Tarifa: <strong>${LINEA1.tarifa.moneda} ${LINEA1.tarifa.adulto.toFixed(2)}</strong></span></li>`;

    /* Mapa */
    UI.pintarLinea(UI.el('#linea'), { activa: id });

    /* Reiniciar planificador */
    UI.el('#resultado').hidden = true;
    if (destinoSel.value === id) {
      destinoSel.value = i === 0 ? LINEA1.estaciones[1].id : LINEA1.estaciones[0].id;
    }
  }

  selector.addEventListener('change', () => {
    const id = selector.value;
    history.replaceState(null, '', `estacion.html?id=${id}`);
    pintar(id);
  });

  UI.el('#calcular').addEventListener('click', () => {
    const viaje = Planner.calcular(selector.value, destinoSel.value);
    Planner.pintar(UI.el('#resultado'), viaje);
    Planner.animarEnMapa(viaje);
  });

  UI.el('#linea').addEventListener('click', (ev) => {
    const parada = ev.target.closest('.parada');
    if (!parada) return;
    UI.abrirPopover(parada.dataset.estacion, parada);
  });

  document.addEventListener('click', (ev) => {
    const pop = UI.el('#popover');
    if (!pop || pop.hidden) return;
    if (ev.target.closest('[data-cerrar]')) return UI.cerrarPopover();
    if (!pop.contains(ev.target) && !ev.target.closest('.parada')) UI.cerrarPopover();
  });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') UI.cerrarPopover(); });

  pintar(inicial);
  setInterval(() => UI.pintarTrenes(UI.el('#est-trenes'), selector.value), 15000);

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
