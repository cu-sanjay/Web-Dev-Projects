(function () {
  'use strict';

  let species = [];
  let nextId = 1;

  const COLORS = ['#00e5ff','#00e676','#ffb800','#ff2d78','#7c4dff','#ff6d00','#00bcd4','#76ff03','#d500f9','#ffab00'];

  /* === DOM REFS === */
  const tbody = document.getElementById('tableBody');
  const ledgerError = document.getElementById('ledgerError');
  const btnAddRow = document.getElementById('btnAddRow');
  const btnCompute = document.getElementById('btnCompute');
  const btnTemplate = document.getElementById('btnTemplate');
  const btnPurge = document.getElementById('btnPurge');
  const barCanvas = document.getElementById('barCanvas');
  const gaugeCanvas = document.getElementById('gaugeCanvas');
  const ctxBar = barCanvas.getContext('2d');
  const ctxGauge = gaugeCanvas.getContext('2d');
  const valS = document.getElementById('valS');
  const valShannon = document.getElementById('valShannon');
  const valSimpson = document.getElementById('valSimpson');
  const valEvenness = document.getElementById('valEvenness');
  const verdictBadge = document.getElementById('verdictBadge');

  let lastCompute = null;

  /* === DEFAULT DATA === */
  const defaultSpecies = [
    { name: 'Birds', count: 45 },
    { name: 'Mammals', count: 22 },
    { name: 'Amphibians', count: 18 },
    { name: 'Reptiles', count: 12 },
    { name: 'Fish', count: 30 }
  ];

  const rainforestTemplate = [
    { name: 'Leaf-cutter Ants', count: 320 },
    { name: 'Poison Dart Frogs', count: 56 },
    { name: 'Jaguar', count: 8 },
    { name: 'Scarlet Macaw', count: 42 },
    { name: 'Howler Monkeys', count: 27 },
    { name: 'Sloth', count: 15 },
    { name: 'Toucan', count: 33 },
    { name: 'Anaconda', count: 6 },
    { name: 'Butterflies', count: 180 },
    { name: 'Capybara', count: 24 }
  ];

  /* === INIT === */
  function loadData(data) {
    species = data.map((d, i) => ({ id: nextId++, name: d.name, count: d.count }));
    renderTable();
    clearResults();
    clearCanvases();
  }

  /* === RENDER TABLE === */
  function renderTable() {
    tbody.innerHTML = '';
    species.forEach((s, idx) => {
      const tr = document.createElement('tr');
      tr.dataset.id = s.id;
      tr.innerHTML = `
        <td style="color:var(--txtm);font-size:8px">${idx + 1}</td>
        <td><input class="name-input" type="text" value="${s.name}" data-id="${s.id}"></td>
        <td><input class="count-input" type="text" value="${s.count}" data-id="${s.id}"></td>
        <td><button class="del-btn" data-id="${s.id}">✕</button></td>
      `;
      tbody.appendChild(tr);

      const nameInp = tr.querySelector('.name-input');
      const countInp = tr.querySelector('.count-input');
      const delBtn = tr.querySelector('.del-btn');

      nameInp.addEventListener('change', () => {
        const sp = species.find(x => x.id === s.id);
        if (sp) sp.name = nameInp.value;
      });

      countInp.addEventListener('change', () => {
        const sp = species.find(x => x.id === s.id);
        const val = parseInt(countInp.value);
        if (!isNaN(val) && val > 0 && sp) sp.count = val;
        else countInp.value = sp ? sp.count : 0;
      });

      delBtn.addEventListener('click', () => {
        species = species.filter(x => x.id !== s.id);
        renderTable();
        clearResults();
        clearCanvases();
      });
    });
  }

  /* === ADD ROW === */
  btnAddRow.addEventListener('click', () => {
    species.push({ id: nextId++, name: '', count: 1 });
    renderTable();
    clearResults();
    clearCanvases();
    const rows = tbody.querySelectorAll('tr');
    if (rows.length > 0) {
      const inp = rows[rows.length - 1].querySelector('.name-input');
      if (inp) inp.focus();
    }
  });

  /* === VALIDATE === */
  function validate() {
    let valid = true;
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(tr => {
      tr.classList.remove('shake');
      const nameInp = tr.querySelector('.name-input');
      const countInp = tr.querySelector('.count-input');
      nameInp.classList.remove('err');
      countInp.classList.remove('err');
    });
    ledgerError.classList.remove('show');

    for (const tr of rows) {
      const nameInp = tr.querySelector('.name-input');
      const countInp = tr.querySelector('.count-input');
      let rowErr = false;

      if (!nameInp.value.trim()) {
        nameInp.classList.add('err');
        rowErr = true;
      }

      const countVal = parseInt(countInp.value);
      if (isNaN(countVal) || countVal <= 0 || countInp.value.trim() === '' || /[a-zA-Z]/.test(countInp.value)) {
        countInp.classList.add('err');
        rowErr = true;
      }

      if (rowErr) {
        tr.classList.add('shake');
        valid = false;
      }
    }

    if (!valid) {
      ledgerError.classList.add('show');
    }
    return valid;
  }

  /* === READ TABLE DATA === */
  function readTable() {
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(tr => {
      const id = parseInt(tr.dataset.id);
      const nameInp = tr.querySelector('.name-input');
      const countInp = tr.querySelector('.count-input');
      const sp = species.find(x => x.id === id);
      if (sp) {
        sp.name = nameInp.value.trim();
        sp.count = parseInt(countInp.value) || 0;
      }
    });
    return species.filter(s => s.name && s.count > 0);
  }

  /* === CALCULATE === */
  function calculate(data) {
    const S = data.length;
    const N = data.reduce((sum, s) => sum + s.count, 0);
    if (S === 0 || N === 0) return null;

    const proportions = data.map(s => s.count / N);
    const H = -proportions.reduce((sum, p) => sum + (p > 0 ? p * Math.log(p) : 0), 0);
    const D = proportions.reduce((sum, p) => sum + p * p, 0);
    const J = S > 1 ? H / Math.log(S) : 0;

    return { S, N, H, D, J };
  }

  /* === UPDATE RESULTS === */
  function updateResults(res) {
    if (!res) {
      clearResults();
      return;
    }

    valS.textContent = res.S;
    valShannon.textContent = res.H.toFixed(4);
    valSimpson.textContent = res.D.toFixed(4);
    valEvenness.textContent = res.J.toFixed(4);

    let verdict, vColor;
    if (res.H > 2.5 && res.J > 0.7) {
      verdict = 'HEALTHY'; vColor = '#00e676';
    } else if (res.H > 1.5 && res.J > 0.4) {
      verdict = 'MODERATE'; vColor = '#ffb800';
    } else if (res.H > 0.5) {
      verdict = 'DEGRADED'; vColor = '#ff6d00';
    } else {
      verdict = 'MONOCULTURE'; vColor = '#ff2d78';
    }

    verdictBadge.textContent = verdict;
    verdictBadge.style.color = vColor;
    verdictBadge.style.border = `1px solid ${vColor}44`;
    verdictBadge.style.background = `${vColor}15`;
  }

  function clearResults() {
    valS.textContent = '—';
    valShannon.textContent = '—';
    valSimpson.textContent = '—';
    valEvenness.textContent = '—';
    verdictBadge.textContent = '—';
    verdictBadge.style.color = '#4a5268';
    verdictBadge.style.border = '1px solid rgba(255,255,255,0.05)';
    verdictBadge.style.background = 'transparent';
  }

  /* === CANVAS SIZING === */
  function sizeCanvas(cvs) {
    const wrap = cvs.parentElement;
    const w = Math.min(wrap.clientWidth - 12, 700);
    const h = cvs === gaugeCanvas ? 100 : w * 0.45;
    cvs.width = w;
    cvs.height = h;
    cvs.style.width = w + 'px';
    cvs.style.height = h + 'px';
    return { w, h };
  }

  /* === DRAW BAR CHART === */
  function drawBars(data) {
    const { w, h } = sizeCanvas(barCanvas);
    const ctx = ctxBar;
    ctx.clearRect(0, 0, w, h);

    if (!data || data.length === 0) return;

    const N = data.reduce((s, d) => s + d.count, 0);
    const pad = { t: 20, b: 28, l: 36, r: 14 };
    const gw = w - pad.l - pad.r;
    const gh = h - pad.t - pad.b;
    const gap = 6;
    const barW = Math.min((gw - gap * (data.length - 1)) / data.length, 50);

    const maxCount = Math.max(...data.map(d => d.count));

    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      const barH = (d.count / maxCount) * gh;
      const x = pad.l + i * (barW + gap);
      const y = pad.t + gh - barH;
      const color = COLORS[i % COLORS.length];

      ctx.fillStyle = color;
      ctx.shadowColor = color + '44';
      ctx.shadowBlur = 6;
      ctx.fillRect(x, y, barW, barH);
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#4a5268';
      ctx.font = '5px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(d.name.substring(0, 10), x + barW / 2, pad.t + gh + 4);

      ctx.fillStyle = color;
      ctx.font = '7px "JetBrains Mono", monospace';
      ctx.textBaseline = 'bottom';
      ctx.fillText(d.count, x + barW / 2, y - 2);
    }

    /* Y axis */
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const yy = pad.t + (gh / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad.l, yy);
      ctx.lineTo(pad.l + gw, yy);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.font = '5px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.round((maxCount / 4) * (4 - i)), pad.l - 4, yy);
    }
  }

  /* === DRAW GAUGES === */
  function drawGauges(res) {
    const { w, h } = sizeCanvas(gaugeCanvas);
    const ctx = ctxGauge;
    ctx.clearRect(0, 0, w, h);

    if (!res) return;

    const gauges = [
      { label: 'Shannon H\'', value: Math.min(res.H / 4.0, 1), raw: res.H, max: 4.0, color: '#00e5ff' },
      { label: 'Simpson D', value: Math.min(res.D, 1), raw: res.D, max: 1.0, color: '#ffb800' },
      { label: 'Evenness J\'', value: Math.min(res.J, 1), raw: res.J, max: 1.0, color: '#00e676' }
    ];

    const gH = h / 3;
    const padL = 85;
    const barW = w - padL - 60;

    for (let i = 0; i < gauges.length; i++) {
      const g = gauges[i];
      const y = i * gH + gH * 0.25;
      const barH = gH * 0.5;

      ctx.fillStyle = '#4a5268';
      ctx.font = '7px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(g.label, padL - 6, y + barH / 2);

      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.beginPath();
      ctx.roundRect(padL, y, barW, barH, 3);
      ctx.fill();

      const fillW = Math.max(barW * g.value, 2);
      ctx.fillStyle = g.color;
      ctx.shadowColor = g.color + '44';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.roundRect(padL, y, fillW, barH, 3);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = g.color;
      ctx.font = '9px "Orbitron", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(g.raw.toFixed(3), padL + barW + 8, y + barH / 2);
    }
  }

  function clearCanvases() {
    [barCanvas, gaugeCanvas].forEach(c => {
      const wrap = c.parentElement;
      const w = Math.min(wrap.clientWidth - 12, 700);
      const h = c === gaugeCanvas ? 100 : w * 0.45;
      c.width = w; c.height = h;
      c.style.width = w + 'px'; c.style.height = h + 'px';
      c.getContext('2d').clearRect(0, 0, w, h);
    });
  }

  /* === COMPUTE === */
  btnCompute.addEventListener('click', () => {
    if (!validate()) return;
    const data = readTable();
    const res = calculate(data);
    lastCompute = res;
    drawBars(data);
    drawGauges(res);
    updateResults(res);
  });

  /* === TEMPLATE === */
  btnTemplate.addEventListener('click', () => {
    loadData(rainforestTemplate);
    setTimeout(() => {
      btnCompute.click();
    }, 50);
  });

  /* === PURGE === */
  btnPurge.addEventListener('click', () => {
    loadData([]);
  });

  /* === RESIZE === */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const data = readTable();
      if (data.length > 0 && lastCompute) {
        drawBars(data);
        drawGauges(lastCompute);
      } else {
        clearCanvases();
      }
    }, 200);
  });

  /* === INIT === */
  loadData(defaultSpecies);
  setTimeout(() => btnCompute.click(), 100);

})();
