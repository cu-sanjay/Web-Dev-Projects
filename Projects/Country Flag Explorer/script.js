(function() {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const searchInput = $('#searchInput');
  const continentSelect = $('#continentSelect');
  const cardGrid = $('#cardGrid');
  const resultCount = $('#resultCount');
  const inspectorContent = $('#inspectorContent');
  const mRegion = $('#mRegion');
  const mPopulation = $('#mPopulation');
  const mDensity = $('#mDensity');
  const mLinguistic = $('#mLinguistic');
  const btnQuery = $('#btnQuery');
  const btnG20 = $('#btnG20');
  const btnPurge = $('#btnPurge');

  let g20Filter = false;
  let selectedId = null;

  /* ─── COUNTRY DATABASE ─── */
  const countries = [
    {
      id: 'in', name: 'India', capital: 'New Delhi', continent: 'asia',
      population: 1428627663, landArea: 3287263,
      languages: ['Hindi','English','Bengali','Telugu','Marathi','Tamil','Urdu','Gujarati'],
      g20: true,
      flagSchema: [
        { op:'rect', color:'#FF9933', x:0, y:0, w:1, h:1/3 },
        { op:'rect', color:'#FFFFFF', x:0, y:1/3, w:1, h:1/3 },
        { op:'rect', color:'#138808', x:0, y:2/3, w:1, h:1/3 },
        { op:'circle', color:'#000080', cx:0.5, cy:0.5, r:0.1 }
      ]
    },
    {
      id: 'jp', name: 'Japan', capital: 'Tokyo', continent: 'asia',
      population: 123294513, landArea: 377975,
      languages: ['Japanese'],
      g20: true,
      flagSchema: [
        { op:'rect', color:'#FFFFFF', x:0, y:0, w:1, h:1 },
        { op:'circle', color:'#BC002D', cx:0.5, cy:0.5, r:0.28 }
      ]
    },
    {
      id: 'fr', name: 'France', capital: 'Paris', continent: 'europe',
      population: 68170228, landArea: 551695,
      languages: ['French'],
      g20: true,
      flagSchema: [
        { op:'rect', color:'#002395', x:0, y:0, w:1/3, h:1 },
        { op:'rect', color:'#FFFFFF', x:1/3, y:0, w:1/3, h:1 },
        { op:'rect', color:'#ED2939', x:2/3, y:0, w:1/3, h:1 }
      ]
    },
    {
      id: 'de', name: 'Germany', capital: 'Berlin', continent: 'europe',
      population: 84548231, landArea: 357022,
      languages: ['German'],
      g20: true,
      flagSchema: [
        { op:'rect', color:'#000000', x:0, y:0, w:1, h:1/3 },
        { op:'rect', color:'#DD0000', x:0, y:1/3, w:1, h:1/3 },
        { op:'rect', color:'#FFCE00', x:0, y:2/3, w:1, h:1/3 }
      ]
    },
    {
      id: 'ca', name: 'Canada', capital: 'Ottawa', continent: 'americas',
      population: 40097761, landArea: 9984670,
      languages: ['English','French'],
      g20: true,
      flagSchema: [
        { op:'rect', color:'#FF0000', x:0, y:0, w:0.25, h:1 },
        { op:'rect', color:'#FFFFFF', x:0.25, y:0, w:0.5, h:1 },
        { op:'rect', color:'#FF0000', x:0.75, y:0, w:0.25, h:1 },
        { op:'rect', color:'#FF0000', x:0.44, y:0.3, w:0.12, h:0.4 }
      ]
    },
    {
      id: 'br', name: 'Brazil', capital: 'Brasilia', continent: 'americas',
      population: 216422446, landArea: 8515767,
      languages: ['Portuguese'],
      g20: true,
      flagSchema: [
        { op:'rect', color:'#009739', x:0, y:0, w:1, h:1 },
        { op:'poly', color:'#FEDD00', pts:[{x:0.5,y:0.15},{x:0.85,y:0.5},{x:0.5,y:0.85},{x:0.15,y:0.5}] },
        { op:'circle', color:'#002776', cx:0.5, cy:0.5, r:0.15 }
      ]
    },
    {
      id: 'eg', name: 'Egypt', capital: 'Cairo', continent: 'africa',
      population: 112716598, landArea: 1002450,
      languages: ['Arabic'],
      g20: true,
      flagSchema: [
        { op:'rect', color:'#CE1126', x:0, y:0, w:1, h:1/3 },
        { op:'rect', color:'#FFFFFF', x:0, y:1/3, w:1, h:1/3 },
        { op:'rect', color:'#000000', x:0, y:2/3, w:1, h:1/3 },
        { op:'circle', color:'#C09300', cx:0.5, cy:0.5, r:0.1 }
      ]
    },
    {
      id: 'za', name: 'South Africa', capital: 'Pretoria', continent: 'africa',
      population: 60414495, landArea: 1221037,
      languages: ['Zulu','Xhosa','Afrikaans','English','Sotho','Tswana'],
      g20: true,
      flagSchema: [
        { op:'rect', color:'#DE3831', x:0, y:0, w:1, h:0.35 },
        { op:'rect', color:'#FFFFFF', x:0, y:0.35, w:1, h:0.1 },
        { op:'rect', color:'#007A4D', x:0, y:0.45, w:1, h:0.1 },
        { op:'rect', color:'#FFFFFF', x:0, y:0.55, w:1, h:0.1 },
        { op:'rect', color:'#002B7F', x:0, y:0.65, w:1, h:0.35 },
        { op:'poly', color:'#000000', pts:[{x:0,y:0},{x:0.35,y:0.5},{x:0,y:1}] },
        { op:'poly', color:'#FFB612', pts:[{x:0.06,y:0},{x:0.3,y:0.5},{x:0.06,y:1}] }
      ]
    },
    {
      id: 'au', name: 'Australia', capital: 'Canberra', continent: 'oceania',
      population: 26638544, landArea: 7692024,
      languages: ['English'],
      g20: true,
      flagSchema: [
        { op:'rect', color:'#00008B', x:0, y:0, w:1, h:1 },
        { op:'rect', color:'#FFFFFF', x:0, y:0, w:0.35, h:0.5 },
        { op:'rect', color:'#FF0000', x:0.15, y:0, w:0.05, h:0.5 },
        { op:'rect', color:'#FF0000', x:0, y:0.22, w:0.35, h:0.06 },
        { op:'circle', color:'#FFFFFF', cx:0.65, cy:0.18, r:0.05 },
        { op:'circle', color:'#FFFFFF', cx:0.8, cy:0.1, r:0.04 },
        { op:'circle', color:'#FFFFFF', cx:0.82, cy:0.3, r:0.04 },
        { op:'circle', color:'#FFFFFF', cx:0.7, cy:0.4, r:0.04 },
        { op:'circle', color:'#FFFFFF', cx:0.55, cy:0.35, r:0.03 }
      ]
    },
    {
      id: 'mx', name: 'Mexico', capital: 'Mexico City', continent: 'americas',
      population: 128455567, landArea: 1964375,
      languages: ['Spanish'],
      g20: true,
      flagSchema: [
        { op:'rect', color:'#006341', x:0, y:0, w:1/3, h:1 },
        { op:'rect', color:'#FFFFFF', x:1/3, y:0, w:1/3, h:1 },
        { op:'rect', color:'#C8102E', x:2/3, y:0, w:1/3, h:1 },
        { op:'circle', color:'#C09300', cx:0.5, cy:0.5, r:0.1 }
      ]
    }
  ];

  /* ─── DRAW FLAG ─── */
  function drawFlag(canvas, schema) {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    for (const cmd of schema) {
      ctx.beginPath();
      if (cmd.op === 'rect') {
        ctx.fillStyle = cmd.color;
        ctx.fillRect(cmd.x * w, cmd.y * h, cmd.w * w, cmd.h * h);
      } else if (cmd.op === 'circle') {
        ctx.fillStyle = cmd.color;
        ctx.arc(cmd.cx * w, cmd.cy * h, cmd.r * w, 0, Math.PI * 2);
        ctx.fill();
      } else if (cmd.op === 'poly') {
        ctx.fillStyle = cmd.color;
        ctx.moveTo(cmd.pts[0].x * w, cmd.pts[0].y * h);
        for (let i = 1; i < cmd.pts.length; i++) {
          ctx.lineTo(cmd.pts[i].x * w, cmd.pts[i].y * h);
        }
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  /* ─── RENDER CARDS ─── */
  function renderCards(list) {
    cardGrid.innerHTML = '';
    resultCount.textContent = list.length;

    list.forEach(c => {
      const card = document.createElement('div');
      card.className = 'country-card' + (c.id === selectedId ? ' active' : '');
      card.dataset.id = c.id;

      const fc = document.createElement('canvas');
      fc.className = 'flag-canvas';
      card.appendChild(fc);

      const name = document.createElement('div');
      name.className = 'card-name';
      name.textContent = c.name;
      card.appendChild(name);

      const cap = document.createElement('div');
      cap.className = 'card-capital';
      cap.textContent = c.capital;
      card.appendChild(cap);

      const dens = document.createElement('div');
      dens.className = 'card-density';
      const d = c.landArea > 0 ? (c.population / c.landArea).toFixed(1) : '--';
      dens.textContent = d + ' /km²';
      card.appendChild(dens);

      card.addEventListener('click', function() {
        selectCountry(c.id);
      });

      cardGrid.appendChild(card);

      /* draw flag after DOM attach */
      requestAnimationFrame(() => drawFlag(fc, c.flagSchema));
    });

    /* re-draw flags on the selected card if it's still visible */
    if (selectedId) {
      const sel = list.find(c => c.id === selectedId);
      if (sel) {
        renderInspector(sel);
      } else {
        clearInspector();
      }
    }
  }

  /* ─── FILTER ─── */
  function getFiltered() {
    const query = searchInput.value.toLowerCase().trim();
    const continent = continentSelect.value;
    return countries.filter(c => {
      if (continent !== 'all' && c.continent !== continent) return false;
      if (g20Filter && !c.g20) return false;
      if (query) {
        const nameMatch = c.name.toLowerCase().includes(query);
        const capMatch = c.capital.toLowerCase().includes(query);
        const langMatch = c.languages.some(l => l.toLowerCase().includes(query));
        if (!nameMatch && !capMatch && !langMatch) return false;
      }
      return true;
    });
  }

  function applyFilters() {
    const list = getFiltered();
    renderCards(list);
    updateMetrics(list);
  }

  /* ─── SELECT COUNTRY ─── */
  function selectCountry(id) {
    selectedId = id;
    $$('.country-card').forEach(c => c.classList.toggle('active', c.dataset.id === id));
    const c = countries.find(x => x.id === id);
    if (c) renderInspector(c);
  }

  function renderInspector(c) {
    const d = c.landArea > 0 ? (c.population / c.landArea).toFixed(1) : '--';
    const densityNum = parseFloat(d);
    const densityClass = densityNum > 300 ? 'green' : 'gold';

    inspectorContent.innerHTML = '';
    const fc = document.createElement('canvas');
    fc.className = 'inspector-flag';
    inspectorContent.appendChild(fc);

    const rows = [
      { l: 'SOVEREIGN STATE', v: c.name },
      { l: 'CAPITAL', v: c.capital, cls: 'gold' },
      { l: 'CONTINENT', v: c.continent.toUpperCase() },
      { l: 'POPULATION', v: c.population.toLocaleString() },
      { l: 'LAND AREA', v: c.landArea.toLocaleString() + ' km²' },
      { l: 'DENSITY', v: d + ' /km²', cls: densityClass }
    ];
    rows.forEach(r => {
      const row = document.createElement('div');
      row.className = 'inspector-row';
      const il = document.createElement('span');
      il.className = 'il';
      il.textContent = r.l;
      const iv = document.createElement('span');
      iv.className = 'iv' + (r.cls ? ' ' + r.cls : '');
      iv.textContent = r.v;
      row.appendChild(il);
      row.appendChild(iv);
      inspectorContent.appendChild(row);
    });

    if (c.g20) {
      const badge = document.createElement('div');
      badge.className = 'inspector-badge g20';
      badge.textContent = 'G20 MEMBER STATE';
      inspectorContent.appendChild(badge);
    }

    const langWrap = document.createElement('div');
    langWrap.className = 'inspector-langs';
    c.languages.forEach(l => {
      const s = document.createElement('span');
      s.textContent = l;
      langWrap.appendChild(s);
    });
    inspectorContent.appendChild(langWrap);

    requestAnimationFrame(() => drawFlag(fc, c.flagSchema));
  }

  function clearInspector() {
    selectedId = null;
    inspectorContent.innerHTML = '<div class="inspector-empty">CLICK A COUNTRY CARD<br>TO INSPECT PROFILE</div>';
  }

  /* ─── METRICS ─── */
  function updateMetrics(list) {
    if (list.length === 0) {
      mRegion.textContent = '--';
      mPopulation.textContent = '--';
      mDensity.textContent = '--';
      mLinguistic.textContent = '--';
      return;
    }

    const regions = {};
    list.forEach(c => { regions[c.continent] = (regions[c.continent] || 0) + 1; });
    const topRegion = Object.entries(regions).sort((a, b) => b[1] - a[1])[0][0];
    mRegion.textContent = topRegion.toUpperCase();

    const totalPop = list.reduce((s, c) => s + c.population, 0);
    mPopulation.textContent = totalPop.toLocaleString();

    const densities = list.map(c => c.landArea > 0 ? c.population / c.landArea : 0);
    const avgD = densities.reduce((s, v) => s + v, 0) / densities.length;
    mDensity.textContent = avgD.toFixed(1) + ' /km²';

    const allLangs = new Set();
    list.forEach(c => c.languages.forEach(l => allLangs.add(l)));
    mLinguistic.textContent = allLangs.size + ' LANGUAGES';
  }

  /* ─── QUERY ─── */
  function executeQuery() {
    applyFilters();
  }

  /* ─── G20 ─── */
  function filterG20() {
    g20Filter = true;
    continentSelect.value = 'all';
    searchInput.value = '';
    applyFilters();
  }

  /* ─── PURGE ─── */
  function purgeAll() {
    searchInput.value = '';
    continentSelect.value = 'all';
    g20Filter = false;
    selectedId = null;
    applyFilters();
    clearInspector();
  }

  /* ─── UI EVENTS ─── */
  searchInput.addEventListener('input', applyFilters);
  continentSelect.addEventListener('change', function() {
    g20Filter = false;
    applyFilters();
  });
  btnQuery.addEventListener('click', executeQuery);
  btnG20.addEventListener('click', filterG20);
  btnPurge.addEventListener('click', purgeAll);

  /* ─── INIT ─── */
  function init() {
    applyFilters();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
