(function() {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const canvas = $('#elevCanvas');
  const ctx = canvas.getContext('2d');
  const peakRibbon = $('#peakRibbon');
  const refJet = $('#refJet');
  const refDeath = $('#refDeath');
  const refCloud = $('#refCloud');
  const tableContainer = $('#tableContainer');
  const teleContent = $('#teleContent');
  const teleEmpty = $('#teleEmpty');
  const telePanel = $('#telePanel');
  const tName = $('#tName');
  const tElev = $('#tElev');
  const tPressure = $('#tPressure');
  const tBoil = $('#tBoil');
  const tBadge = $('#tBadge');
  const btnSync = $('#btnSync');
  const btnBoost = $('#btnBoost');
  const btnFlush = $('#btnFlush');

  let boostActive = false;
  let selectedId = null;

  /* ─── MOUNTAIN DATABASE ─── */
  const mountains = [
    { id:'everest', name:'Mount Everest', height:8848, range:'Himalayas', country:'Nepal / China', color:'#00e5ff', snow:0.85 },
    { id:'k2', name:'K2', height:8611, range:'Karakoram', country:'Pakistan / China', color:'#00e5ff', snow:0.82 },
    { id:'kangchenjunga', name:'Kangchenjunga', height:8586, range:'Himalayas', country:'Nepal / India', color:'#00e5ff', snow:0.80 },
    { id:'kilimanjaro', name:'Kilimanjaro', height:5895, range:'Kilimanjaro', country:'Tanzania', color:'#ffc800', snow:0.65 },
    { id:'montblanc', name:'Mont Blanc', height:4807, range:'Alps', country:'France / Italy', color:'#ffc800', snow:0.55 },
    { id:'fuji', name:'Mount Fuji', height:3776, range:'Honshu', country:'Japan', color:'#b388ff', snow:0.40 }
  ];

  let active = [];

  /* ─── CANVAS ─── */
  let cw = 0, ch = 0;

  function resizeCanvas() {
    const wrap = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth || 500;
    const h = wrap.clientHeight || 360;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    cw = w;
    ch = h;
  }

  /* ─── BAROMETRIC ─── */
  function calcPressure(h) {
    return 101.325 * Math.pow(1 - 0.0065 * h / 288.15, 5.255);
  }

  function calcBoilingPoint(P) {
    return 100.0 * Math.pow(P / 101.325, 0.190);
  }

  function getZone(h) {
    if (h >= 8000) return { label:'DEATH ZONE', cls:'death', threat:true };
    if (h >= 5500) return { label:'NIVAL ZONE', cls:'nival', threat:false };
    if (h >= 4000) return { label:'ALPINE ZONE', cls:'alpine', threat:false };
    if (h >= 2500) return { label:'MONTANE ZONE', cls:'montane', threat:false };
    if (h >= 1000) return { label:'SUBMONTANE', cls:'montane', threat:false };
    return { label:'LOWLAND ZONE', cls:'lowland', threat:false };
  }

  function getHeight(m) {
    return boostActive ? Math.round(m.height * 1.15) : m.height;
  }

  /* ─── RENDER RIBBON ─── */
  function renderRibbon() {
    peakRibbon.innerHTML = '';
    mountains.forEach(m => {
      const btn = document.createElement('button');
      btn.className = 'peak-btn' + (active.includes(m.id) ? ' active' : '') + (m.height >= 8000 ? ' death-zone' : '');
      btn.textContent = m.name.toUpperCase();
      btn.dataset.id = m.id;
      btn.addEventListener('click', function() {
        const idx = active.indexOf(m.id);
        if (idx === -1) active.push(m.id);
        else active.splice(idx, 1);
        if (m.id === selectedId && idx !== -1) { selectedId = null; }
        syncAll();
      });
      peakRibbon.appendChild(btn);
    });
  }

  /* ─── DRAW CANVAS ─── */
  function drawCanvas() {
    const w = cw, h = ch;
    ctx.clearRect(0, 0, w, h);
    if (!w || !h) return;

    const pad = { t: 20, b: 30, l: 50, r: 20 };
    const chartW = w - pad.l - pad.r;
    const chartH = h - pad.t - pad.b;
    const maxElev = 10000;

    /* ── grid ── */
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    for (let e = 0; e <= maxElev; e += 1000) {
      const yy = pad.t + chartH * (1 - e / maxElev);
      ctx.beginPath(); ctx.moveTo(pad.l, yy); ctx.lineTo(w - pad.r, yy); ctx.stroke();
    }
    ctx.setLineDash([]);

    /* y-axis labels */
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.font = 'clamp(5px,0.55vmin,7px) "JetBrains Mono",monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let e = 0; e <= maxElev; e += 1000) {
      const yy = pad.t + chartH * (1 - e / maxElev);
      ctx.fillText((e / 1000) + 'km', pad.l - 6, yy);
    }

    /* ── reference lines ── */
    const refs = [];
    if (refJet.checked) refs.push({ elev: 10000, label: 'JET FLIGHT 10km', color: '#ffc800' });
    if (refDeath.checked) refs.push({ elev: 8000, label: 'DEATH ZONE 8km', color: '#ff1744' });
    if (refCloud.checked) refs.push({ elev: 2500, label: 'CLOUD LAYER 2.5km', color: '#b388ff' });
    refs.forEach(r => {
      const yy = pad.t + chartH * (1 - r.elev / maxElev);
      ctx.strokeStyle = r.color;
      ctx.globalAlpha = 0.15;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(pad.l, yy); ctx.lineTo(w - pad.r, yy); ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      ctx.fillStyle = r.color;
      ctx.globalAlpha = 0.3;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(r.label, pad.l + 4, yy - 2);
      ctx.globalAlpha = 1;
    });

    /* ── mountains ── */
    const list = mountains.filter(m => active.includes(m.id));
    if (list.length === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.font = 'clamp(7px,0.8vmin,10px) "JetBrains Mono",monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SELECT PEAKS TO RENDER', w / 2, h / 2);
      return;
    }

    const barW = Math.min(chartW / list.length * 0.6, 70);
    const gap = chartW / list.length;

    list.forEach((m, i) => {
      const hh = getHeight(m);
      const normH = Math.min(hh / maxElev, 1);
      const barH = normH * chartH;
      const bx = pad.l + gap * i + (gap - barW) / 2;
      const by = pad.t + chartH - barH;
      const baseY = pad.t + chartH;

      /* silhouette */
      const midX = bx + barW / 2;
      const tipY = by;
      const baseL = bx;
      const baseR = bx + barW;

      ctx.beginPath();
      ctx.moveTo(baseL, baseY);
      ctx.lineTo(midX, tipY);
      ctx.lineTo(baseR, baseY);
      ctx.closePath();

      const grad = ctx.createLinearGradient(midX, tipY, midX, baseY);
      grad.addColorStop(0, m.color);
      grad.addColorStop(1, 'rgba(255,255,255,0.02)');
      ctx.fillStyle = grad;
      ctx.globalAlpha = 0.6;
      ctx.fill();
      ctx.globalAlpha = 1;

      /* snowcap */
      if (hh > 1000) {
        const snowStart = 1 - (1000 / hh);
        const snowH = chartH * (normH - 1 + snowStart);
        const snowTip = tipY;
        const snowBot = snowTip + snowH;
        const t = snowStart;
        const leftEdge = baseL + (midX - baseL) * t;
        const rightEdge = baseR - (baseR - midX) * t;

        ctx.beginPath();
        ctx.moveTo(leftEdge, snowBot);
        ctx.lineTo(midX, snowTip);
        ctx.lineTo(rightEdge, snowBot);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fill();
      }

      /* name label */
      ctx.fillStyle = m.color;
      ctx.font = '600 clamp(5px,0.55vmin,7px) "JetBrains Mono",monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(m.name, midX, baseY + 4);

      /* elevation label */
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.font = 'clamp(4px,0.45vmin,6px) "JetBrains Mono",monospace';
      ctx.fillText(hh + 'm', midX, baseY + 4 + 9);

      /* clickable hit detection region */
      ctx._mountainRects = ctx._mountainRects || [];
      ctx._mountainRects.push({ id: m.id, x: baseL, y: tipY, w: barW, h: barH + 14 });
    });
  }

  /* ─── COMPARATIVE TABLE ─── */
  function renderTable() {
    const list = mountains.filter(m => active.includes(m.id));
    if (list.length === 0) {
      tableContainer.innerHTML = '<div class="table-empty">SELECT PEAKS TO COMPARE</div>';
      return;
    }
    const sorted = [...list].sort((a, b) => getHeight(b) - getHeight(a));
    let html = '<table class="metrics-table"><thead><tr><th>PEAK</th><th>HEIGHT</th><th>RANGE</th><th>COUNTRY</th></tr></thead><tbody>';
    sorted.forEach(m => {
      const hh = getHeight(m);
      html += '<tr><td class="mt-highlight">' + m.name + '</td><td>' + hh + 'm</td><td>' + m.range + '</td><td>' + m.country + '</td></tr>';
    });
    html += '</tbody></table>';
    tableContainer.innerHTML = html;
  }

  /* ─── TELEMETRY ─── */
  function showTelemetry(id) {
    selectedId = id;
    const m = mountains.find(x => x.id === id);
    if (!m) return;
    const hh = getHeight(m);
    const P = calcPressure(hh);
    const T = calcBoilingPoint(P);
    const zone = getZone(hh);

    teleEmpty.style.display = 'none';
    teleContent.style.display = 'block';
    tName.textContent = m.name;
    tElev.textContent = hh + 'm' + (boostActive ? ' (+15% boost)' : '');
    tPressure.textContent = P.toFixed(2) + ' kPa';
    tBoil.textContent = T.toFixed(1) + ' °C';

    tBadge.className = 'tele-badge ' + zone.cls;
    if (zone.threat) tBadge.textContent = '[METABOLIC THREAT: ACUTE DEATH ZONE ATMOSPHERE]';
    else tBadge.textContent = zone.label;

    telePanel.classList.toggle('death', zone.threat);
  }

  function clearTelemetry() {
    selectedId = null;
    teleEmpty.style.display = 'flex';
    teleContent.style.display = 'none';
    telePanel.classList.remove('death');
  }

  /* ─── CANVAS CLICK ─── */
  canvas.addEventListener('click', function(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const rects = ctx._mountainRects || [];
    for (const r of rects) {
      if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
        showTelemetry(r.id);
        return;
      }
    }
  });

  /* ─── SYNC ALL ─── */
  function syncAll() {
    ctx._mountainRects = [];
    drawCanvas();
    renderTable();
    /* update ribbon classes */
    $$('.peak-btn').forEach(btn => {
      btn.classList.toggle('active', active.includes(btn.dataset.id));
    });
    if (selectedId && !active.includes(selectedId)) clearTelemetry();
    if (selectedId) showTelemetry(selectedId);
  }

  /* ─── BOOST ─── */
  function toggleBoost() {
    boostActive = !boostActive;
    syncAll();
    if (selectedId) showTelemetry(selectedId);
  }

  /* ─── FLUSH ─── */
  function flushAll() {
    active = [];
    boostActive = false;
    refJet.checked = false;
    refDeath.checked = false;
    refCloud.checked = false;
    selectedId = null;
    ctx._mountainRects = [];
    clearTelemetry();
    renderRibbon();
    syncAll();
  }

  /* ─── REFRESH ON REF TOGGLE ─── */
  [refJet, refDeath, refCloud].forEach(cb => {
    cb.addEventListener('change', syncAll);
  });

  /* ─── RESIZE ─── */
  let resizeTm;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTm);
    resizeTm = setTimeout(() => { resizeCanvas(); syncAll(); }, 100);
  });

  /* ─── ADMIN BUTTONS ─── */
  btnSync.addEventListener('click', syncAll);
  btnBoost.addEventListener('click', toggleBoost);
  btnFlush.addEventListener('click', flushAll);

  /* ─── INIT ─── */
  function init() {
    resizeCanvas();
    renderRibbon();
    syncAll();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
