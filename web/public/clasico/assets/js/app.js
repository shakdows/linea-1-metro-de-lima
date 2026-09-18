/* app.js — Arranque y cableado de la portada */

(function () {
  const PREFS = 'linea1:prefs';
  const leerPrefs = () => { try { return JSON.parse(localStorage.getItem(PREFS)) || {}; } catch { return {}; } };
  const guardarPrefs = (p) => { try { localStorage.setItem(PREFS, JSON.stringify(p)); } catch { /* modo privado */ } };

  const prefs = leerPrefs();
  const origenSel = UI.el('#origen');
  const destinoSel = UI.el('#destino');
  const resultado = UI.el('#resultado');
  const linea = UI.el('#linea');
  let detalleAbierto = false;

  /* =====================================================  Estado inicial */
  UI.llenarSelect(origenSel, prefs.origen || 'la-cultura');
  UI.llenarSelect(destinoSel, prefs.destino || 'gamarra');

  UI.pintarEstado();
  UI.pintarLinea(linea, { activa: origenSel.value });
  UI.pintarAfluencia(UI.el('#grafico-afluencia'), UI.el('#afluencia-ejes'));
  UI.pintarAvisos(UI.el('#avisos-lista'));

  Asistente.montar({
    alVerEnMapa(origenId, destinoId) {
      origenSel.value = origenId;
      destinoSel.value = destinoId;
      calcular({ desplazar: true });
    }
  });

  /* Mejor franja del día */
  const mejor = L1.mejorFranja();
  UI.el('#mejor-franja').textContent =
    `${String(mejor).padStart(2, '0')}:15 – ${String(mejor + 1).padStart(2, '0')}:30`;

  /* Información al pasajero */
  UI.el('#info-horario').textContent = `${LINEA1.horario.apertura} – ${LINEA1.horario.cierre}`;
  UI.el('#info-tarifa').textContent = `${LINEA1.tarifa.moneda} ${LINEA1.tarifa.adulto.toFixed(2)}`;

  /* Tarjeta: viajes posibles con el saldo */
  const saldo = 18.5;
  UI.el('#saldo-viajes').innerHTML =
    `Con tu saldo puedes hacer aproximadamente <strong>${Math.floor(saldo / LINEA1.tarifa.adulto)} viajes</strong>.`;
  UI.el('#saldo-actualizado').textContent = `Actualizado hoy, ${UI.hhmm12(new Date())}`;

  /* Estaciones cercanas: sin ubicación, las vecinas del origen elegido */
  function cercanasPorDefecto() {
    const i = L1.indice(origenSel.value);
    const ids = [i - 1, i, i + 1].filter((n) => n >= 0 && n < LINEA1.estaciones.length);
    UI.pintarCercanas(
      UI.el('#cercanas-lista'),
      ids.map((n) => ({ estacion: LINEA1.estaciones[n] })),
      { conUbicacion: false }
    );
  }
  cercanasPorDefecto();

  /* =====================================================  Refresco  ==== */
  function refrescar() {
    const id = origenSel.value;
    UI.el('#trenes-estacion').textContent = L1.porId(id).nombre;
    UI.pintarTrenes(UI.el('#trenes-lista'), id);
    UI.pintarEstado();
  }

  /* =====================================================  Planificar  == */
  function calcular({ desplazar = false } = {}) {
    UI.skeleton(resultado);
    detalleAbierto = false;

    setTimeout(() => {
      const viaje = Planner.calcular(origenSel.value, destinoSel.value);
      Planner.pintar(resultado, viaje);
      Planner.animarEnMapa(viaje);
      refrescar();
      guardarPrefs({ ...leerPrefs(), origen: origenSel.value, destino: destinoSel.value });
      if (desplazar) resultado.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 500);
  }

  UI.el('#calcular').addEventListener('click', () => calcular());

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
      if (!Asistente.ubicacion) cercanasPorDefecto();
    })
  );

  /* Acciones dentro de la tarjeta de resultado (delegación) */
  resultado.addEventListener('click', (ev) => {
    if (ev.target.closest('#ver-detalle')) {
      detalleAbierto = !detalleAbierto;
      Planner.pintar(resultado, Planner.ultimo, { completo: detalleAbierto });
      return;
    }
    if (ev.target.closest('#iniciar-viaje')) iniciarViaje();
  });

  /* «Iniciar viaje»: cuenta atrás en vivo hasta la llegada */
  let viajeTimer = null;
  function iniciarViaje() {
    const viaje = Planner.ultimo;
    if (!viaje) return;
    const lateral = UI.el('.viaje__lateral');
    if (!lateral) return;

    clearInterval(viajeTimer);
    Planner.animarEnMapa(viaje);
    UI.el('#mapa').scrollIntoView({ block: 'center', behavior: 'smooth' });

    const pintarCuenta = () => {
      const restan = Math.max(0, Math.round((viaje.llegada - new Date()) / 60000));
      lateral.innerHTML = `
        <div class="alerta alerta--info" style="background:var(--verde-claro)">
          <span class="alerta__icono">${UI.icono('tren', 16)}</span>
          <div>
            <h4>${restan > 0 ? 'Viaje en curso' : 'Has llegado'}</h4>
            <p>${restan > 0
              ? `Llegas a <strong>${viaje.destino.nombre}</strong> en <strong>${restan} min</strong>, sobre las ${UI.hhmm12(viaje.llegada)}.`
              : `Destino: <strong>${viaje.destino.nombre}</strong>.`}</p>
          </div>
        </div>
        <button class="enlace-suave" id="cancelar-viaje" style="justify-content:center">Terminar viaje</button>`;
      if (restan <= 0) clearInterval(viajeTimer);
    };
    pintarCuenta();
    viajeTimer = setInterval(pintarCuenta, 30000);

    lateral.addEventListener('click', (ev) => {
      if (!ev.target.closest('#cancelar-viaje')) return;
      clearInterval(viajeTimer);
      Planner.pintar(resultado, viaje, { completo: detalleAbierto });
    });
  }

  /* =====================================================  Mapa  ======== */
  linea.addEventListener('click', (ev) => {
    const parada = ev.target.closest('.parada');
    if (!parada) return;
    UI.abrirTooltip(parada.dataset.estacion, parada);
  });

  /* Elegir una estación como origen o destino desde el tooltip */
  document.addEventListener('click', (ev) => {
    const elegir = ev.target.closest('[data-elegir]');
    if (elegir) {
      const id = UI.el('#tooltip').dataset.estacion;
      if (elegir.dataset.elegir === 'origen') origenSel.value = id;
      else destinoSel.value = id;
      UI.cerrarTooltip();
      calcular({ desplazar: true });
      return;
    }
    const pop = UI.el('#tooltip');
    if (!pop || pop.hidden) return;
    if (ev.target.closest('[data-cerrar]')) return UI.cerrarTooltip();
    if (!pop.contains(ev.target) && !ev.target.closest('.parada')) UI.cerrarTooltip();
  });

  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') UI.cerrarTooltip(); });
  window.addEventListener('resize', UI.cerrarTooltip, { passive: true });

  /* =====================================================  Afluencia  === */
  const grafico = UI.el('#grafico-afluencia');
  const detalleHora = UI.el('#hora-detalle');
  const mostrarHora = (ev) => {
    const barra = ev.target.closest('.barra');
    if (!barra) return;
    UI.els('.barra', grafico).forEach((b) => b.classList.remove('seleccionada'));
    barra.classList.add('seleccionada');
    UI.pintarHoraDetalle(detalleHora, Number(barra.dataset.hora));
  };
  grafico.addEventListener('click', mostrarHora);
  grafico.addEventListener('mouseover', mostrarHora);
  grafico.addEventListener('mouseleave', () => {
    UI.els('.barra', grafico).forEach((b) => b.classList.remove('seleccionada'));
    detalleHora.innerHTML = '';
  });

  /* =====================================================  Avisos  ====== */
  let todosLosAvisos = false;
  UI.el('#ver-avisos').addEventListener('click', (ev) => {
    todosLosAvisos = !todosLosAvisos;
    UI.pintarAvisos(UI.el('#avisos-lista'), todosLosAvisos ? 99 : 2);
    ev.currentTarget.firstChild.textContent = todosLosAvisos ? 'Ver menos ' : 'Ver todos ';
  });

  /* =====================================================  Ubicación  === */
  function detectarUbicacion(boton, textoOriginal) {
    if (!navigator.geolocation) {
      boton.textContent = 'Tu navegador no permite geolocalización';
      return;
    }
    boton.disabled = true;
    const etiqueta = boton.querySelector('span') || boton;
    const previo = boton.innerHTML;
    boton.innerHTML = 'Buscando tu ubicación…';

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        Asistente.ubicacion = { lat, lng };
        const cercanas = L1.cercanas(lat, lng, 3);
        UI.pintarCercanas(UI.el('#cercanas-lista'), cercanas, { conUbicacion: true });
        origenSel.value = cercanas[0].estacion.id;
        UI.pintarLinea(linea, { activa: origenSel.value });
        refrescar();
        boton.disabled = false;
        boton.innerHTML = previo;
        UI.el('#cercanas').scrollIntoView({ block: 'center', behavior: 'smooth' });
      },
      () => {
        boton.disabled = false;
        boton.innerHTML = previo;
        UI.el('#cercanas-lista').insertAdjacentHTML(
          'afterbegin',
          `<div class="alerta alerta--aviso" style="grid-column:1/-1">
            <span class="alerta__icono">${UI.icono('alerta', 16)}</span>
            <div><h4>No pudimos obtener tu ubicación</h4><p>Revisa los permisos del navegador o elige tu estación manualmente.</p></div>
          </div>`
        );
      },
      { timeout: 9000, enableHighAccuracy: false }
    );
  }

  UI.el('#ubicacion').addEventListener('click', (ev) => detectarUbicacion(ev.currentTarget));
  UI.el('#detectar').addEventListener('click', (ev) => detectarUbicacion(ev.currentTarget));

  /* =====================================================  Saldo  ======= */
  const btnSaldo = UI.el('#consultar-saldo');
  btnSaldo.addEventListener('click', () => {
    const previo = btnSaldo.textContent;
    btnSaldo.textContent = 'Consultando…';
    btnSaldo.disabled = true;
    setTimeout(() => {
      UI.el('#saldo-actualizado').textContent = `Actualizado hoy, ${UI.hhmm12(new Date())}`;
      btnSaldo.textContent = previo;
      btnSaldo.disabled = false;
    }, 700);
  });

  /* =====================================================  PWA  ========= */
  let promptInstalar = null;
  const btnInstalar = UI.el('#instalar');
  window.addEventListener('beforeinstallprompt', (ev) => {
    ev.preventDefault();
    promptInstalar = ev;
    if (btnInstalar) btnInstalar.hidden = false;
  });
  btnInstalar?.addEventListener('click', async () => {
    if (!promptInstalar) return;
    promptInstalar.prompt();
    promptInstalar = null;
    btnInstalar.hidden = true;
  });

  /* El service worker se retiró al archivar esta versión: servía desde caché
     y acababa mostrando esta portada en lugar de la aplicación actual. */

  /* =====================================================  Ciclo  ======= */
  refrescar();
  setInterval(refrescar, 15000);
})();
