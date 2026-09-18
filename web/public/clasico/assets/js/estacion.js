/* estacion.js — Ficha de estación (estacion.html?id=la-cultura) */

(function () {
  const params = new URLSearchParams(location.search);
  const inicial = L1.porId(params.get('id')) ? params.get('id') : 'la-cultura';

  const selector = UI.el('#selector');
  const destinoSel = UI.el('#destino');
  const resultado = UI.el('#resultado');
  UI.llenarSelect(selector, inicial);
  UI.llenarSelect(destinoSel, inicial === 'gamarra' ? 'la-cultura' : 'gamarra');

  function pintar(id) {
    const est = L1.porId(id);
    if (!est) return;
    const i = L1.indice(id);

    document.title = `${est.nombre} — Línea 1`;
    UI.el('#miga-nombre').textContent = est.nombre;
    UI.el('#est-nombre').textContent = est.nombre;
    UI.el('#est-distrito').textContent = `Distrito de ${est.distrito}`;
    UI.pintarEstado();

    /* Etiquetas */
    const etiquetas = [`Estación ${i + 1} de ${LINEA1.estaciones.length}`];
    if (est.terminal) etiquetas.unshift('Estación terminal');
    if (est.accesible) etiquetas.push('Accesible');
    (est.conexiones || []).forEach((c) => etiquetas.push(c));
    UI.el('#est-etiquetas').innerHTML = etiquetas.map((e) => `<span class="etiqueta">${e}</span>`).join('');

    /* Trenes y afluencia */
    UI.pintarTrenes(UI.el('#est-trenes'), id);
    UI.pintarAfluencia(UI.el('#est-afluencia'), UI.el('#est-ejes'));
    const mejor = L1.mejorFranja();
    UI.el('#est-mejor').textContent = `${String(mejor).padStart(2, '0')}:15 – ${String(mejor + 1).padStart(2, '0')}:30`;

    /* Salidas numeradas */
    UI.el('#est-salidas').innerHTML = (est.salidas || ['Información no disponible'])
      .map((s, n) => `<div class="salida"><span class="salida__num">${n + 1}</span><span>${s}</span></div>`)
      .join('');

    /* Referencias cercanas */
    const cardCerca = UI.el('#card-cerca');
    if (est.cerca && est.cerca.length) {
      cardCerca.hidden = false;
      UI.el('#est-cerca').innerHTML = est.cerca
        .map((c) => `<li>${UI.icono('pin', 16)}<span>${c}</span></li>`)
        .join('');
    } else {
      cardCerca.hidden = true;
    }

    /* Estaciones contiguas */
    const vecinas = [];
    if (i > 0) vecinas.push({ e: LINEA1.estaciones[i - 1], dir: LINEA1.sentidos.sur.corto });
    if (i < LINEA1.estaciones.length - 1) vecinas.push({ e: LINEA1.estaciones[i + 1], dir: LINEA1.sentidos.norte.corto });
    UI.el('#est-vecinas').innerHTML = vecinas
      .map(
        (v) => `
        <a class="cercana" href="estacion.html?id=${v.e.id}">
          <span class="cercana__icono">${UI.icono('tren', 18)}</span>
          <span>
            <span class="cercana__nombre">${v.e.nombre}</span>
            <span class="cercana__meta">Hacia ${v.dir}</span>
          </span>
          <span class="cercana__flecha">${UI.icono('chevron', 16)}</span>
        </a>`
      )
      .join('');

    /* Horario */
    UI.el('#est-horario').innerHTML = `
      <li>${UI.icono('reloj', 16)}<span>Apertura: <strong>${LINEA1.horario.apertura}</strong></span></li>
      <li>${UI.icono('reloj', 16)}<span>Cierre: <strong>${LINEA1.horario.cierre}</strong></span></li>
      <li>${UI.icono('info', 16)}<span>Tarifa: <strong>${LINEA1.tarifa.moneda} ${LINEA1.tarifa.adulto.toFixed(2)}</strong></span></li>`;

    /* Mapa */
    UI.pintarLinea(UI.el('#linea'), { activa: id });
    const env = UI.el('#linea-envoltura');
    const activa = UI.el('.parada.activa');
    if (env && activa) env.scrollTo({ left: Math.max(0, activa.offsetLeft - env.clientWidth / 2), behavior: 'smooth' });

    resultado.hidden = true;
    if (destinoSel.value === id) destinoSel.value = i === 0 ? LINEA1.estaciones[1].id : LINEA1.estaciones[0].id;
  }

  selector.addEventListener('change', () => {
    history.replaceState(null, '', `estacion.html?id=${selector.value}`);
    pintar(selector.value);
  });

  UI.el('#calcular').addEventListener('click', () => {
    UI.skeleton(resultado);
    setTimeout(() => {
      const viaje = Planner.calcular(selector.value, destinoSel.value);
      Planner.pintar(resultado, viaje);
      Planner.animarEnMapa(viaje);
    }, 500);
  });

  resultado.addEventListener('click', (ev) => {
    if (!ev.target.closest('#ver-detalle')) return;
    Planner.pintar(resultado, Planner.ultimo, { completo: !UI.el('#viaje-detalle') || UI.el('#viaje-detalle').hidden });
  });

  /* Afluencia interactiva */
  const grafico = UI.el('#est-afluencia');
  const detalleHora = UI.el('#est-hora-detalle');
  const mostrar = (ev) => {
    const barra = ev.target.closest('.barra');
    if (!barra) return;
    UI.els('.barra', grafico).forEach((b) => b.classList.remove('seleccionada'));
    barra.classList.add('seleccionada');
    UI.pintarHoraDetalle(detalleHora, Number(barra.dataset.hora));
  };
  grafico.addEventListener('click', mostrar);
  grafico.addEventListener('mouseover', mostrar);
  grafico.addEventListener('mouseleave', () => {
    UI.els('.barra', grafico).forEach((b) => b.classList.remove('seleccionada'));
    detalleHora.innerHTML = '';
  });

  /* Tooltip del mapa */
  UI.el('#linea').addEventListener('click', (ev) => {
    const parada = ev.target.closest('.parada');
    if (!parada) return;
    UI.abrirTooltip(parada.dataset.estacion, parada, { conAcciones: false });
  });
  document.addEventListener('click', (ev) => {
    const pop = UI.el('#tooltip');
    if (!pop || pop.hidden) return;
    if (ev.target.closest('[data-cerrar]')) return UI.cerrarTooltip();
    if (!pop.contains(ev.target) && !ev.target.closest('.parada')) UI.cerrarTooltip();
  });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') UI.cerrarTooltip(); });

  pintar(inicial);
  setInterval(() => UI.pintarTrenes(UI.el('#est-trenes'), selector.value), 15000);

  /* El service worker se retiró al archivar esta versión: servía desde caché
     y acababa mostrando esta portada en lugar de la aplicación actual. */
})();
