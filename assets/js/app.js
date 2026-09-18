/* app.js — Arranque y cableado de la página de inicio */

(function () {
  const PREFS = 'linea1:prefs';

  const leerPrefs = () => {
    try { return JSON.parse(localStorage.getItem(PREFS)) || {}; } catch { return {}; }
  };
  const guardarPrefs = (p) => {
    try { localStorage.setItem(PREFS, JSON.stringify(p)); } catch { /* modo privado */ }
  };

  const prefs = leerPrefs();
  const origenSel = UI.el('#origen');
  const destinoSel = UI.el('#destino');
  const resultado = UI.el('#resultado');
  const linea = UI.el('#linea');

  /* ---------- Estado inicial ---------- */
  UI.llenarSelect(origenSel, prefs.origen || 'la-cultura');
  UI.llenarSelect(destinoSel, prefs.destino || 'gamarra');

  UI.pintarEstado(UI.el('#estado-servicio'));
  UI.pintarLinea(linea, { activa: origenSel.value });
  UI.pintarAfluencia(UI.el('#grafico-afluencia'));
  UI.pintarAvisos(UI.el('#avisos-lista'));
  Asistente.montar();

  /* Mejor franja del día */
  const mejor = L1.mejorFranja();
  UI.el('#mejor-franja').innerHTML =
    `⭐ Mejor momento para viajar hoy: <strong>${String(mejor).padStart(2, '0')}:00 – ${String(mejor + 1).padStart(2, '0')}:00</strong>`;

  /* Información al pasajero */
  UI.el('#info-horario').textContent = `${LINEA1.horario.apertura} – ${LINEA1.horario.cierre}`;
  UI.el('#info-tarifa').textContent = `${LINEA1.tarifa.moneda} ${LINEA1.tarifa.adulto.toFixed(2)}`;
  UI.el('#info-extremos').textContent =
    `~${L1.duracion(LINEA1.estaciones[0].id, LINEA1.estaciones[LINEA1.estaciones.length - 1].id)} min`;

  /* ---------- Métricas y próximos trenes ---------- */
  function refrescar() {
    const id = origenSel.value;
    const est = L1.porId(id);
    const ahora = new Date();
    const sentido = L1.sentido(id, destinoSel.value);
    const proximo = L1.proximosTrenes(id, sentido, 1, ahora)[0];
    const afl = L1.nivelAfluencia(ahora.getHours());

    UI.el('#m-proximo').textContent = `${proximo.minutos} min`;
    UI.el('#m-duracion').textContent = `${L1.duracion(id, destinoSel.value)} min`;
    UI.el('#m-afluencia').textContent = afl.texto;
    UI.el('#trenes-estacion').textContent = est.nombre;
    UI.pintarTrenes(UI.el('#trenes-lista'), id);
    UI.pintarEstado(UI.el('#estado-servicio'));
  }

  /* ---------- Calcular viaje ---------- */
  function calcular() {
    const viaje = Planner.calcular(origenSel.value, destinoSel.value);
    Planner.pintar(resultado, viaje);
    Planner.animarEnMapa(viaje);
    refrescar();
    guardarPrefs({ ...leerPrefs(), origen: origenSel.value, destino: destinoSel.value });
  }

  UI.el('#calcular').addEventListener('click', calcular);

  UI.el('#intercambiar').addEventListener('click', () => {
    const a = origenSel.value;
    origenSel.value = destinoSel.value;
    destinoSel.value = a;
    calcular();
  });

  [origenSel, destinoSel].forEach((s) =>
    s.addEventListener('change', () => {
      UI.pintarLinea(linea, { activa: origenSel.value });
      refrescar();
    })
  );

  /* ---------- Mapa: abrir tarjeta de estación ---------- */
  if (linea) {
    linea.addEventListener('click', (ev) => {
      const parada = ev.target.closest('.parada');
      if (!parada) return;
      UI.abrirPopover(parada.dataset.estacion, parada);
    });
  }

  document.addEventListener('click', (ev) => {
    const pop = UI.el('#popover');
    if (!pop || pop.hidden) return;
    if (ev.target.closest('[data-cerrar]')) return UI.cerrarPopover();
    if (!pop.contains(ev.target) && !ev.target.closest('.parada')) UI.cerrarPopover();
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') UI.cerrarPopover();
  });

  window.addEventListener('resize', UI.cerrarPopover, { passive: true });

  /* ---------- Usar mi ubicación ---------- */
  const campoOrigen = origenSel.closest('.campo');
  if (campoOrigen && navigator.geolocation) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip';
    btn.style.marginTop = '8px';
    btn.textContent = '📍 Usar mi ubicación';
    btn.addEventListener('click', () => {
      btn.textContent = 'Buscando…';
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const cerca = L1.masCercana(pos.coords.latitude, pos.coords.longitude);
          origenSel.value = cerca.estacion.id;
          btn.textContent = `📍 ${cerca.estacion.nombre} · ${cerca.km.toFixed(1)} km`;
          UI.pintarLinea(linea, { activa: origenSel.value });
          refrescar();
        },
        () => { btn.textContent = '📍 No se pudo obtener tu ubicación'; },
        { timeout: 8000 }
      );
    });
    campoOrigen.appendChild(btn);
  }

  /* ---------- Consulta de saldo (demostración) ---------- */
  const btnSaldo = UI.el('#consultar-saldo');
  if (btnSaldo) {
    btnSaldo.addEventListener('click', () => {
      btnSaldo.textContent = 'Consultando…';
      setTimeout(() => {
        UI.el('#saldo-actualizado').textContent = `Actualizado ${UI.hhmm(new Date())}`;
        btnSaldo.textContent = 'Consultar saldo';
      }, 800);
    });
  }

  /* ---------- Ciclo de actualización ---------- */
  refrescar();
  setInterval(refrescar, 15000);

  /* ---------- PWA ---------- */
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => { /* sin conexión */ });
    });
  }
})();
