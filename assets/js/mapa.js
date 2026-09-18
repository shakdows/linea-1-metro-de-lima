/* mapa.js — Mapa esquemático + mapa geográfico (Leaflet, opcional) */

(function () {
  UI.pintarEstado(UI.el('#estado-servicio'));
  UI.pintarLinea(UI.el('#linea'), {});

  /* ---------- Interacción con el esquema ---------- */
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

  /* ---------- Listado de estaciones por distrito ---------- */
  const porDistrito = {};
  LINEA1.estaciones.forEach((e) => {
    (porDistrito[e.distrito] = porDistrito[e.distrito] || []).push(e);
  });
  UI.el('#listado').innerHTML = Object.entries(porDistrito)
    .map(
      ([distrito, ests]) => `
      <div class="tarjeta">
        <div class="tarjeta__titulo"><span>📍</span><h3>${distrito}</h3></div>
        <ul class="lista-simple">
          ${ests
            .map(
              (e) =>
                `<li><span>🚉</span><a href="estacion.html?id=${e.id}" style="color:var(--texto);text-decoration:none;font-weight:600">${e.nombre}</a></li>`
            )
            .join('')}
        </ul>
      </div>`
    )
    .join('');

  /* ---------- Mapa geográfico ---------- */
  const contenedor = UI.el('#mapa-geo');
  if (typeof L === 'undefined') {
    contenedor.innerHTML =
      '<div class="mapa-fallback">No se pudo cargar el mapa geográfico. Revisa tu conexión: el esquema de arriba funciona sin internet.</div>';
    return;
  }

  contenedor.innerHTML = '';
  const puntos = LINEA1.estaciones.map((e) => [e.lat, e.lng]);
  const mapa = L.map('mapa-geo', { scrollWheelZoom: false }).fitBounds(puntos, { padding: [30, 30] });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© colaboradores de OpenStreetMap'
  }).addTo(mapa);

  L.polyline(puntos, { color: LINEA1.color, weight: 5, opacity: 0.9 }).addTo(mapa);

  LINEA1.estaciones.forEach((e) => {
    L.circleMarker([e.lat, e.lng], {
      radius: e.terminal ? 8 : 6,
      color: '#163C2A',
      weight: 2,
      fillColor: '#fff',
      fillOpacity: 1
    })
      .addTo(mapa)
      .bindPopup(
        `<strong>${e.nombre}</strong><br>${e.distrito}<br>` +
          `<a href="estacion.html?id=${e.id}">Ver estación →</a>`
      );
  });
})();
