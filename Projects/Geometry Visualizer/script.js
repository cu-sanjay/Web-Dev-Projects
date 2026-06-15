(function() {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const canvas = $('#mainCanvas');
  const ctx = canvas.getContext('2d');
  const ctrlBody = $('#ctrlBody');
  const formulaBody = $('#formulaBody');
  const formulaTitle = $('#formulaTitle');
  const shapeBtns = $$('.shape-btn');
  const shapeVal = $('#shapeVal');
  const dimsVal = $('#dimsVal');
  const statusVal = $('#statusVal');
  const topBadge = $('#topBadge');
  const telePerim = $('#telePerim');
  const teleArea = $('#teleArea');
  const teleVolume = $('#teleVolume');
  const teleRating = $('#teleRating');
  const teleBadge = $('#teleBadge');
  const btnExec = $('#btnExec');
  const btn3d = $('#btn3d');
  const btnFlush = $('#btnFlush');
  const toastContainer = $('#toastContainer');

  /* ─── SHAPE DEFINITIONS ─── */
  const SHAPES = {
    circle: {
      label: 'Circle',
      sliders: [
        { id: 'r', label: 'Radius', min: 1, max: 30, value: 10, unit: 'px' }
      ],
      compute: (p) => {
        const r = p.r;
        return {
          perim: 2 * Math.PI * r,
          area: Math.PI * r * r,
          volume: 0,
          volLabel: 'N/A (Planar Node)',
          dims: '2D'
        };
      },
      formulas: [
        'Circumference: C = 2\u03C0r',
        'Area: A = \u03C0r\u00B2',
        'Status: Planar — no volumetric capacity'
      ],
      rating: (p) => p.r > 0 ? 'Perfect (Planar)' : 'Undefined'
    },
    rectangle: {
      label: 'Rectangle',
      sliders: [
        { id: 'w', label: 'Width', min: 2, max: 40, value: 20, unit: 'px' },
        { id: 'h', label: 'Height', min: 2, max: 40, value: 14, unit: 'px' }
      ],
      compute: (p) => {
        const { w, h } = p;
        return {
          perim: 2 * (w + h),
          area: w * h,
          volume: 0,
          volLabel: 'N/A (Planar Node)',
          dims: '2D'
        };
      },
      formulas: [
        'Perimeter: P = 2(w + h)',
        'Area: A = w \u00D7 h',
        'Status: Planar — no volumetric capacity'
      ],
      rating: (p) => p.w > 0 && p.h > 0 ? 'Perfect (Planar)' : 'Undefined'
    },
    triangle: {
      label: 'Right Triangle',
      sliders: [
        { id: 'b', label: 'Base', min: 2, max: 40, value: 16, unit: 'px' },
        { id: 'h', label: 'Height', min: 2, max: 40, value: 12, unit: 'px' }
      ],
      compute: (p) => {
        const { b, h } = p;
        const hyp = Math.sqrt(b * b + h * h);
        return {
          perim: b + h + hyp,
          area: 0.5 * b * h,
          volume: 0,
          volLabel: 'N/A (Planar Node)',
          dims: '2D',
          hyp
        };
      },
      formulas: [
        'Hypotenuse: c\u00B2 = a\u00B2 + b\u00B2',
        'Area: A = \u00BDbh',
        'Status: Planar — no volumetric capacity'
      ],
      rating: (p) => p.b > 0 && p.h > 0 ? 'Perfect (Planar)' : 'Undefined'
    },
    sphere: {
      label: 'Sphere',
      sliders: [
        { id: 'r', label: 'Radius', min: 1, max: 25, value: 10, unit: 'px' }
      ],
      compute: (p) => {
        const r = p.r;
        return {
          perim: 2 * Math.PI * r,
          area: 4 * Math.PI * r * r,
          volume: (4 / 3) * Math.PI * r * r * r,
          volLabel: '3D Solid',
          dims: '3D'
        };
      },
      formulas: [
        'Circumference: C = 2\u03C0r',
        'Surface Area: SA = 4\u03C0r\u00B2',
        'Volume: V = \u00BE\u03C0r\u00B3'
      ],
      rating: (p) => {
        if (p.r <= 0) return 'Undefined';
        const v = (4 / 3) * Math.PI * p.r * p.r * p.r;
        if (v > 0) return '\u221e Stable (3D Solid)';
        return 'Degenerate';
      }
    },
    cylinder: {
      label: 'Cylinder',
      sliders: [
        { id: 'r', label: 'Radius', min: 1, max: 25, value: 8, unit: 'px' },
        { id: 'h', label: 'Height', min: 1, max: 40, value: 16, unit: 'px' }
      ],
      compute: (p) => {
        const { r, h } = p;
        return {
          perim: 2 * Math.PI * r,
          area: 2 * Math.PI * r * (r + h),
          volume: Math.PI * r * r * h,
          volLabel: '3D Solid',
          dims: '3D'
        };
      },
      formulas: [
        'Circumference: C = 2\u03C0r',
        'Surface Area: SA = 2\u03C0r\u00B2 + 2\u03C0rh',
        'Volume: V = \u03C0r\u00B2h'
      ],
      rating: (p) => {
        if (p.r <= 0 || p.h <= 0) return 'Undefined';
        const v = Math.PI * p.r * p.r * p.h;
        if (v > 0) return '\u221e Stable (3D Solid)';
        return 'Degenerate';
      }
    }
  };

  /* ─── STATE ─── */
  let currentShape = 'circle';
  let params = {};
  let results = {};
  let show3d = false;
  let animId = null;

  /* ─── SHAPE SELECT ─── */
  shapeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      shapeBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentShape = this.dataset.shape;
      rebuildSliders();
      compute();
      topBadge.textContent = currentShape.toUpperCase();
      shapeVal.textContent = SHAPES[currentShape].label;
      showToast('[SHAPE] ' + SHAPES[currentShape].label, '#ffb800');
    });
  });

  /* ─── SLIDER BUILDER ─── */
  function rebuildSliders() {
    const def = SHAPES[currentShape];
    ctrlBody.innerHTML = '';
    params = {};

    def.sliders.forEach(s => {
      params[s.id] = s.value;
      const group = document.createElement('div');
      group.className = 'ctrl-group';
      group.innerHTML = `
        <label class="ctrl-label">${s.label} <span class="ctrl-val" id="val_${s.id}">${s.value}</span> ${s.unit}</label>
        <input type="range" class="ctrl-slider" id="sl_${s.id}" min="${s.min}" max="${s.max}" value="${s.value}" step="0.5">
      `;
      ctrlBody.appendChild(group);

      const slider = group.querySelector('.ctrl-slider');
      const valSpan = group.querySelector('.ctrl-val');
      slider.addEventListener('input', function() {
        params[s.id] = parseFloat(this.value);
        valSpan.textContent = this.value;
        compute();
      });
    });

    dimsVal.textContent = def.sliders.length + ' param(s)';
  }

  /* ─── COMPUTE ─── */
  function compute() {
    const def = SHAPES[currentShape];
    results = def.compute(params);
    const rating = def.rating(params);

    telePerim.textContent = results.perim.toFixed(2);
    teleArea.textContent = results.area.toFixed(2);
    teleVolume.textContent = results.volume > 0 ? results.volume.toFixed(2) + ' u\u00B3' : '0.00 ' + results.volLabel;
    teleRating.textContent = rating;

    const is3d = currentShape === 'sphere' || currentShape === 'cylinder';
    teleVolume.style.color = results.volume > 0 ? '#00e676' : '#4a5268';
    teleVolume.style.textShadow = results.volume > 0 ? '0 0 8px rgba(0,230,118,0.3)' : 'none';

    if (results.volume > 0 || currentShape === 'circle' || currentShape === 'rectangle' || currentShape === 'triangle') {
      teleBadge.textContent = (results.volume > 0 ? 'VOLUMETRIC' : 'PLANAR') + ' ACTIVE';
      teleBadge.style.background = results.volume > 0 ? 'rgba(0,230,118,0.1)' : 'rgba(0,229,255,0.1)';
      teleBadge.style.borderColor = results.volume > 0 ? 'rgba(0,230,118,0.3)' : 'rgba(0,229,255,0.3)';
      teleBadge.style.color = results.volume > 0 ? '#00e676' : '#00e5ff';
    }

    /* formula */
    formulaTitle.textContent = def.label + ' — Formula Syntax Blueprint';
    formulaBody.innerHTML = def.formulas.map(f =>
      '<div class="formula-line">' + f + '</div>'
    ).join('');

    renderCanvas();
  }

  /* ─── CANVAS ─── */
  function resizeCanvas() {
    const wrap = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth || 300;
    const h = Math.max(240, Math.min(420, w * 0.7));
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    canvas._w = w;
    canvas._h = h;
  }

  function renderCanvas() {
    const w = canvas._w;
    const h = canvas._h;
    ctx.clearRect(0, 0, w, h);

    drawGrid(w, h);
    drawShape(w, h);
  }

  function drawGrid(w, h) {
    const step = 30;
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 0.5;

    /* vertical */
    for (let x = step; x < w; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    /* horizontal */
    for (let y = step; y < h; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    /* axes */
    const cx = w / 2, cy = h / 2;
    ctx.strokeStyle = 'rgba(0,229,255,0.06)';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();

    /* center marker */
    ctx.fillStyle = 'rgba(0,229,255,0.08)';
    ctx.beginPath(); ctx.arc(cx, cy, 2, 0, Math.PI * 2); ctx.fill();

    /* border */
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(0, 0, w, h);
  }

  function drawShape(w, h) {
    const cx = w / 2, cy = h / 2;
    const scale = Math.min(w, h) / 60;

    switch (currentShape) {
      case 'circle': drawCircle(cx, cy, params.r * scale); break;
      case 'rectangle': drawRect(cx, cy, params.w * scale, params.h * scale); break;
      case 'triangle': drawTriangle(cx, cy, params.b * scale, params.h * scale); break;
      case 'sphere': drawSphere(cx, cy, params.r * scale); break;
      case 'cylinder': drawCylinder(cx, cy, params.r * scale, params.h * scale); break;
    }
  }

  function drawCircle(cx, cy, r) {
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,229,255,0.08)';
    ctx.fill();
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    /* radius line */
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + r, cy);
    ctx.strokeStyle = 'rgba(0,229,255,0.3)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3,3]);
    ctx.stroke();
    ctx.setLineDash([]);

    /* label */
    ctx.fillStyle = 'rgba(0,229,255,0.5)';
    ctx.font = '5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('r = ' + params.r.toFixed(1), cx + r/2, cy - 4);
    ctx.fillText('C = ' + results.perim.toFixed(1), cx, cy - r - 8);
    ctx.fillText('A = ' + results.area.toFixed(1), cx, cy + r + 12);
  }

  function drawRect(cx, cy, w, h) {
    const x = cx - w/2, y = cy - h/2;
    ctx.fillStyle = 'rgba(0,229,255,0.06)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);

    /* dims */
    ctx.fillStyle = 'rgba(0,229,255,0.4)';
    ctx.font = '5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('w = ' + params.w.toFixed(1), cx, cy + h/2 + 10);
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('h = ' + params.h.toFixed(1), cx + w/2 + 4, cy);
  }

  function drawTriangle(cx, cy, b, h) {
    const x0 = cx - b/2, y0 = cy + h/2;
    const x1 = cx + b/2, y1 = cy + h/2;
    const x2 = cx, y2 = cy - h/2;

    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.closePath();
    ctx.fillStyle = 'rgba(0,229,255,0.06)';
    ctx.fill();
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    /* dims */
    ctx.fillStyle = 'rgba(0,229,255,0.4)';
    ctx.font = '5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('b = ' + params.b.toFixed(1), cx, cy + h/2 + 10);
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    if (results.hyp) ctx.fillText('c = ' + results.hyp.toFixed(1), cx + b/2 + 4, cy - h/4);
  }

  function drawSphere(cx, cy, r) {
    /* circle outline */
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,184,0,0.06)';
    ctx.fill();
    ctx.strokeStyle = '#ffb800';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    /* equator */
    ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 0.4, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,184,0,0.2)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    /* meridian */
    ctx.beginPath(); ctx.ellipse(cx, cy, r * 0.4, r, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,184,0,0.2)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    if (show3d) {
      drawSphere3d(cx, cy, r);
    }

    /* labels */
    ctx.fillStyle = 'rgba(255,184,0,0.5)';
    ctx.font = '5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('r = ' + params.r.toFixed(1), cx + r/2, cy - 4);
    ctx.fillText('SA = ' + results.area.toFixed(1), cx, cy - r - 8);
    ctx.fillText('V = ' + results.volume.toFixed(1), cx, cy + r + 12);
  }

  function drawSphere3d(cx, cy, r) {
    /* isometric grid lines */
    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      const ry = r * 0.4 * t;
      const rx = r * Math.sqrt(1 - t * t);
      ctx.beginPath(); ctx.ellipse(cx, cy - r * t + r/2, rx, ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,184,0,0.08)';
      ctx.lineWidth = 0.3;
      ctx.stroke();
    }
  }

  function drawCylinder(cx, cy, r, h) {
    const topY = cy - h/2;
    const botY = cy + h/2;

    /* body fill */
    ctx.fillStyle = 'rgba(255,184,0,0.05)';
    ctx.fillRect(cx - r, topY, r * 2, h);

    /* top ellipse */
    ctx.beginPath(); ctx.ellipse(cx, topY, r, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,184,0,0.08)';
    ctx.fill();
    ctx.strokeStyle = '#ffb800';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    /* bottom ellipse */
    ctx.beginPath(); ctx.ellipse(cx, botY, r, r * 0.3, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffb800';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    /* sides */
    ctx.beginPath(); ctx.moveTo(cx - r, topY); ctx.lineTo(cx - r, botY);
    ctx.moveTo(cx + r, topY); ctx.lineTo(cx + r, botY);
    ctx.strokeStyle = '#ffb800';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (show3d) {
      drawCylinder3d(cx, cy, r, h);
    }

    /* labels */
    ctx.fillStyle = 'rgba(255,184,0,0.5)';
    ctx.font = '5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('r = ' + params.r.toFixed(1), cx + r + 10, cy - 2);
    ctx.fillText('h = ' + params.h.toFixed(1), cx, botY + 10);
  }

  function drawCylinder3d(cx, cy, r, h) {
    const topY = cy - h/2;
    const botY = cy + h/2;

    /* vertical guide lines */
    for (let i = 1; i <= 6; i++) {
      const angle = (i / 7) * Math.PI;
      const rx = Math.cos(angle) * r;
      const ry = Math.sin(angle) * r * 0.3;
      ctx.beginPath();
      ctx.moveTo(cx + rx, topY + ry);
      ctx.lineTo(cx + rx, botY + ry);
      ctx.strokeStyle = 'rgba(255,184,0,0.06)';
      ctx.lineWidth = 0.3;
      ctx.stroke();
    }
  }

  /* ─── 3D TOGGLE ─── */
  btn3d.addEventListener('click', function() {
    show3d = !show3d;
    this.textContent = show3d ? '● 3D Projection Active' : 'Deploy 3D Projection';
    this.style.color = show3d ? '#00e676' : '#ffb800';
    this.style.borderColor = show3d ? 'rgba(0,230,118,0.35)' : 'rgba(255,184,0,0.35)';
    renderCanvas();
    showToast(show3d ? '[3D] Isometric projection deployed' : '[3D] Projection disabled', '#ffb800');
  });

  /* ─── EXEC ─── */
  btnExec.addEventListener('click', function() {
    compute();
    showToast('[EXEC] Vector geometry computed — ' + SHAPES[currentShape].label, '#00e5ff');
  });

  /* ─── FLUSH ─── */
  btnFlush.addEventListener('click', function() {
    currentShape = 'circle';
    shapeBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('.shape-btn[data-shape="circle"]').classList.add('active');
    show3d = false;
    btn3d.textContent = 'Deploy 3D Projection';
    btn3d.style.color = '#ffb800';
    btn3d.style.borderColor = 'rgba(255,184,0,0.35)';
    topBadge.textContent = 'STANDBY';
    shapeVal.textContent = '--';
    telePerim.textContent = '--';
    teleArea.textContent = '--';
    teleVolume.textContent = '--';
    teleRating.textContent = '--';
    teleBadge.textContent = 'STANDBY';
    teleBadge.style.background = '';
    teleBadge.style.borderColor = '';
    teleBadge.style.color = '';
    teleVolume.style.color = '';
    teleVolume.style.textShadow = '';
    formulaTitle.textContent = 'Formula Syntax Blueprint';
    formulaBody.innerHTML = '<div class="formula-placeholder">Select a shape to view geometric proofs</div>';
    resizeCanvas();
    const w = canvas._w, h = canvas._h;
    ctx.clearRect(0, 0, w, h);
    drawGrid(w, h);
    rebuildSliders();
    dimsVal.textContent = '--';
    showToast('[FLUSH] Drafting canvas cleared — all vectors zeroed', '#8892a8');
  });

  /* ─── CANVAS SETUP ─── */
  function resizeAndRender() {
    resizeCanvas();
    renderCanvas();
  }

  window.addEventListener('resize', resizeAndRender);

  /* ─── TOAST ─── */
  function showToast(msg, color) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    if (color) el.style.borderLeft = '3px solid ' + color;
    toastContainer.appendChild(el);
    setTimeout(() => {
      el.classList.add('leave');
      setTimeout(() => { if (el.parentNode) el.remove(); }, 250);
    }, 3500);
  }

  /* ─── INIT ─── */
  function init() {
    resizeCanvas();
    rebuildSliders();
    compute();
    shapeVal.textContent = SHAPES.circle.label;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
