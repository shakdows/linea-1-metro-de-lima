/* mapa.js — Esquema de la línea, buscador, ubicación y mapa geográfico */

(function () {
  UI.pintarEstado();
  UI.pintarLinea(UI.el('#linea'), {});

  let mapa = null;
  let marcadorYo = null;
  const marcadores = {};

  /* ---------- Tooltip del esquema ---------- */
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

  /* ---------- Buscador ---------- */
  const input = UI.el('#buscar');
  const caja = UI.el('#buscar-resultados');
  const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  function seleccionar(id) {
    const est = L1.porId(id);
    UI.pintarLinea(UI.el('#linea'), { activa: id });
    const nodo = UI.el(`.parada[data-estacion="${id}"]`);
    const env = UI.el('#linea-envoltura');
    if (nodo && env) {
      env.scrollTo({ left: Math.max(0, nodo.offsetLeft - env.clientWidth / 2), behavior: 'smooth' });
      setTimeout(() => UI.abrirTooltip(id, nodo, { conAcciones: false }), 320);
    }
    if (mapa) mapa.setView([est.lat, est.lng], 14, { animate: true });
    caja.hidden = true;
    input.value = est.nombre;
  }

  input.addEventListener('input', () => {
    const q = norm(input.value.trim());
    if (q.length < 2) { caja.hidden = true; return; }
    const hits = LINEA1.estaciones
      .filter((e) => norm(e.nombre).includes(q) || norm(e.distrito).includes(q))
      .slice(0, 8);
    if (!hits.length) {
      caja.hidden = false;
      caja.innerHTML = '<button type="button" disabled style="color:var(--texto-suave)">Sin resultados</button>';
      return;
    }
    caja.hidden = false;
    caja.innerHTML = hits
      .map((e) => `<button type="button" data-id="${e.id}">${e.nombre}<small>${e.distrito}</small></button>`)
      .join('');
  });

  caja.addEventListener('click', (ev) => {
    const b = ev.target.closest('button[data-id]');
    if (b) seleccionar(b.dataset.id);
  });
  document.addEventListener('click', (ev) => {
    if (!ev.target.closest('.buscador')) caja.hidden = true;
  });

  /* ---------- Ubicación y caminata ---------- */
  UI.el('#detectar').addEventListener('click', (ev) => {
    const btn = ev.currentTarget;
    const previo = btn.innerHTML;
    if (!navigator.geolocation) { btn.textContent = 'Geolocalización no disponible'; return; }
    btn.disabled = true;
    btn.innerHTML = 'Buscando…';

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const c = L1.cercanas(lat, lng, 1)[0];
        btn.disabled = false;
        btn.innerHTML = previo;

        UI.el('#caminata').innerHTML = `
          <div class="card" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
            <span class="cercana__icono">${UI.icono('caminar', 20)}</span>
            <div>
              <div style="font-size:.8rem;color:var(--texto-suave)">Estás aquí · estación más cercana</div>
              <div style="font-weight:800;font-size:1.05rem">${c.estacion.nombre}</div>
              <div style="font-size:.84rem;color:var(--texto-suave)">${c.caminata.texto} · ${c.caminata.minutos} min caminando</div>
            </div>
            <a class="btn btn--primario btn--sm" style="margin-left:auto"
               href="https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=${lat}%2C${lng}%3B${c.estacion.lat}%2C${c.estacion.lng}"
               target="_blank" rel="noopener">Ver ruta a pie</a>
          </div>`;

        seleccionar(c.estacion.id);

        if (mapa) {
          if (marcadorYo) mapa.removeLayer(marcadorYo);
          marcadorYo = L.circleMarker([lat, lng], {
            radius: 9, color: '#fff', weight: 3, fillColor: '#1f6feb', fillOpacity: 1
          }).addTo(mapa).bindPopup('Estás aquí');
          L.polyline([[lat, lng], [c.estacion.lat, c.estacion.lng]], {
            color: '#68736f', weight: 3, dashArray: '6 7'
          }).addTo(mapa);
          mapa.fitBounds([[lat, lng], [c.estacion.lat, c.estacion.lng]], { padding: [60, 60] });
        }
      },
      () => {
        btn.disabled = false;
        btn.innerHTML = previo;
        UI.el('#caminata').innerHTML = `
          <div class="alerta alerta--aviso">
            <span class="alerta__icono">${UI.icono('alerta', 16)}</span>
            <div><h4>No pudimos obtener tu ubicación</h4><p>Revisa los permisos del navegador y vuelve a intentarlo.</p></div>
          </div>`;
      },
      { timeout: 9000 }
    );
  });

  /* ---------- Listado por distrito ---------- */
  const porDistrito = {};
  LINEA1.estaciones.forEach((e) => { (porDistrito[e.distrito] = porDistrito[e.distrito] || []).push(e); });
  UI.el('#listado').innerHTML = Object.entries(porDistrito)
    .map(
      ([distrito, ests]) => `
      <div class="card">
        <div class="card__cabecera" style="margin-bottom:12px">
          <span class="card__icono">${UI.icono('pin', 18)}</span>
          <h3>${distrito}</h3>
        </div>
        <ul class="lista-simple">
          ${ests.map((e) => `<li>${UI.icono('tren', 16)}<a href="estacion.html?id=${e.id}" style="text-decoration:none;font-weight:600">${e.nombre}</a></li>`).join('')}
        </ul>
      </div>`
    )
    .join('');

  /* ---------- Mapa geográfico ---------- */
  const contenedor = UI.el('#mapa-geo');
  if (typeof L === 'undefined') {
    contenedor.innerHTML = '<div class="mapa-fallback">No se pudo cargar el mapa geográfico. Revisa tu conexión: el esquema de arriba funciona sin internet.</div>';
    return;
  }

  contenedor.innerHTML = '';
  const puntos = LINEA1.estaciones.map((e) => [e.lat, e.lng]);
  mapa = L.map('mapa-geo', { scrollWheelZoom: false }).fitBounds(puntos, { padding: [30, 30] });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18, attribution: '© colaboradores de OpenStreetMap'
  }).addTo(mapa);

  L.polyline(puntos, { color: LINEA1.color, weight: 5, opacity: .9 }).addTo(mapa);

  LINEA1.estaciones.forEach((e) => {
    marcadores[e.id] = L.circleMarker([e.lat, e.lng], {
      radius: e.terminal ? 8 : 6, color: LINEA1.color, weight: 3, fillColor: '#fff', fillOpacity: 1
    })
      .addTo(mapa)
      .bindPopup(`<strong>${e.nombre}</strong><br>${e.distrito}<br>
        ${(e.salidas || []).map((s) => `🚪 ${s}`).join('<br>')}<br>
        <a href="estacion.html?id=${e.id}">Ver estación →</a>`);
  });
})();
