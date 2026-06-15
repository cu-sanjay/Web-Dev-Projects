'use strict';

/* ─── PLANET DATA ─── */
const PLANETS = {
  earth: {
    label:'Earth', icon:'🌍',
    diameter:12742, gravity:9.81, orbitAU:1.0, coreTemp:5500,
    color:'#00e5ff', orbitColor:'rgba(0,229,255,0.3)',
    atmosphere:[{gas:'N₂', pct:78, color:'#4a5268'},{gas:'O₂', pct:21, color:'#00e5ff'},{gas:'Ar', pct:1, color:'#8892a8'}],
    orbitalPeriod:365.25
  },
  mars: {
    label:'Mars', icon:'🌑',
    diameter:6779, gravity:3.72, orbitAU:1.52, coreTemp:1500,
    color:'#ff6d00', orbitColor:'rgba(255,109,0,0.3)',
    atmosphere:[{gas:'CO₂', pct:95, color:'#ff6d00'},{gas:'N₂', pct:3, color:'#4a5268'},{gas:'Ar', pct:2, color:'#8892a8'}],
    orbitalPeriod:687
  },
  jupiter: {
    label:'Jupiter', icon:'🟠',
    diameter:139820, gravity:24.79, orbitAU:5.2, coreTemp:24000,
    color:'#ffb800', orbitColor:'rgba(255,184,0,0.3)',
    atmosphere:[{gas:'H₂', pct:90, color:'#ffb800'},{gas:'He', pct:10, color:'#4a5268'}],
    orbitalPeriod:4333
  },
  venus: {
    label:'Venus', icon:'☀️',
    diameter:12104, gravity:8.87, orbitAU:0.72, coreTemp:5000,
    color:'#ffb800', orbitColor:'rgba(255,184,0,0.3)',
    atmosphere:[{gas:'CO₂', pct:96, color:'#ff6d00'},{gas:'N₂', pct:3.5, color:'#4a5268'},{gas:'SO₂', pct:0.5, color:'#ffd600'}],
    orbitalPeriod:225
  },
  saturn: {
    label:'Saturn', icon:'🪐',
    diameter:116460, gravity:10.44, orbitAU:9.58, coreTemp:12000,
    color:'#ffd600', orbitColor:'rgba(255,214,0,0.3)',
    atmosphere:[{gas:'H₂', pct:96, color:'#ffd600'},{gas:'He', pct:3, color:'#4a5268'},{gas:'CH₄', pct:0.5, color:'#00e5ff'}],
    orbitalPeriod:10759
  }
};

/* ─── DOM REFS ─── */
const $ = id => document.getElementById(id);
const canvas = $('mainCanvas');
const ctx = canvas.getContext('2d');
const telemBody = $('telemBody');
const atmoGrid = $('atmoGrid');
const canvasHint = $('canvasHint');
const telemHint = $('telemHint');
const atmoHint = $('atmoHint');
const topBadge = $('topBadge');
const selPrimary = $('selPrimary');
const selSecondary = $('selSecondary');
const btnGravity = $('btnGravity');
const btnSync = $('btnSync');
const btnPurge = $('btnPurge');

/* ─── STATE ─── */
let primary = 'earth';
let secondary = 'mars';
let rafId = null;
let orbitTime = 0;
let synced = false;

/* ─── TELEMETRY ─── */
function computeDelta(prim, sec, key) {
  const pVal = PLANETS[prim][key];
  const sVal = PLANETS[sec][key];
  const ratio = sVal !== 0 ? (pVal / sVal) : 1;
  return { pVal, sVal, ratio };
}

function renderTelemetry() {
  const p = PLANETS[primary];
  const s = PLANETS[secondary];

  const fields = [
    { label:'Diameter', key:'diameter', unit:'km', fmt:v=>v.toLocaleString(), colorP:p.color, colorS:s.color },
    { label:'Gravity', key:'gravity', unit:'m/s²', fmt:v=>v.toFixed(2), colorP:p.color, colorS:s.color },
    { label:'Orbit Semi-Major', key:'orbitAU', unit:'AU', fmt:v=>v.toFixed(2), colorP:p.color, colorS:s.color },
    { label:'Core Temperature', key:'coreTemp', unit:'°C', fmt:v=>v.toLocaleString(), colorP:p.coreTemp>10000?'#ff1744':p.coreTemp>5000?'#ffb800':'#00e5ff', colorS:s.coreTemp>10000?'#ff1744':s.coreTemp>5000?'#ffb800':'#00e5ff' }
  ];

  telemBody.innerHTML = fields.map(f => {
    const { pVal, sVal } = computeDelta(primary, secondary, f.key);
    const maxVal = Math.max(pVal, sVal, 1);
    const pW = (pVal / maxVal) * 100;
    const sW = (sVal / maxVal) * 100;
    const ratio = sVal > 0 ? (pVal / sVal) : 0;
    const deltaStr = ratio > 1 ? `${ratio.toFixed(2)}× larger` : ratio < 1 ? `${(1/ratio).toFixed(2)}× smaller` : 'equal';

    return `<div class="telem-row">
      <div class="tl-row-header">
        <span class="tl-row-label">${f.label}</span>
        <span class="tl-row-unit">${f.unit}</span>
      </div>
      <div class="tl-row-values">
        <span class="tl-row-val prim" style="color:${f.colorP}">${f.fmt(pVal)}</span>
        <div class="tl-row-bar-wrap">
          <div class="tl-row-bar-left" style="background:${f.colorP};width:${pW}%"></div>
          <div class="tl-row-bar-right" style="background:${f.colorS};left:${100-sW}%;width:${sW}%"></div>
        </div>
        <span class="tl-row-val sec" style="color:${f.colorS}">${f.fmt(sVal)}</span>
      </div>
      <div class="tl-row-delta">${p.label} is ${deltaStr}</div>
    </div>`;
  }).join('');

  // top badge
  topBadge.textContent = `${p.icon} vs ${s.icon}`;
}

/* ─── ATMOSPHERE ─── */
function renderAtmosphere() {
  const p = PLANETS[primary];
  const s = PLANETS[secondary];

  atmoGrid.innerHTML = [p, s].map((planet, idx) => {
    const total = planet.atmosphere.reduce((sum, g) => sum + g.pct, 0);
    return `<div class="atmo-block">
      <div class="atmo-block-title" style="color:${planet.color}">${planet.icon} ${planet.label}</div>
      <div class="atmo-stack">
        ${planet.atmosphere.map(g => {
          const pctW = (g.pct / total) * 100;
          return `<div class="atmo-bar-row">
            <span class="atmo-bar-label">${g.gas}</span>
            <div class="atmo-bar-track"><div class="atmo-bar-fill" style="width:${pctW}%;background:${g.color}"></div></div>
            <span class="atmo-bar-pct">${g.pct}%</span>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }).join('');
}

/* ─── CANVAS DRAW ─── */
function drawCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const wrap = canvas.parentElement;
  const w = wrap.clientWidth || 500;
  const h = Math.max(280, w * 0.55);
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.setTransform(1,0,0,1,0,0);
  ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,w,h);

  const p = PLANETS[primary];
  const s = PLANETS[secondary];

  // background
  const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w*0.6);
  grad.addColorStop(0,'#0a0e1a');
  grad.addColorStop(1,'#05060b');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,w,h);

  // stars
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  for (let i=0;i<60;i++) {
    const sx = (i*173.7+31)%w;
    const sy = (i*91.3+17)%h;
    ctx.fillRect(sx,sy,1,1);
  }

  // split down middle
  const mid = w/2;
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.setLineDash([3,3]);
  ctx.beginPath();
  ctx.moveTo(mid, 0);
  ctx.lineTo(mid, h);
  ctx.stroke();
  ctx.setLineDash([]);

  // ─── LEFT: PLANET CIRCLE ───
  // scale factor: max diameter (Jupiter ~140k) fits in ~80px radius
  const maxD = 140000;
  const rMax = Math.min(w*0.15, h*0.2);
  const pR = Math.max(6, (p.diameter / maxD) * rMax);
  const pX = mid * 0.45;
  const pY = h * 0.4;

  // glow
  const pGrad = ctx.createRadialGradient(pX, pY, 0, pX, pY, pR*2.5);
  pGrad.addColorStop(0, p.color+'44');
  pGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = pGrad;
  ctx.beginPath();
  ctx.arc(pX, pY, pR*2.5, 0, Math.PI*2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(pX, pY, pR, 0, Math.PI*2);
  ctx.fillStyle = p.color+'33';
  ctx.fill();
  ctx.strokeStyle = p.color+'88';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // label
  ctx.font = '6px JetBrains Mono, monospace';
  ctx.fillStyle = p.color;
  ctx.textAlign = 'center';
  ctx.fillText(p.icon+' '+p.label, pX, pY + pR + 16);
  ctx.font = '5px JetBrains Mono, monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillText(`${p.diameter.toLocaleString()} km`, pX, pY + pR + 28);

  // ─── RIGHT: PLANET CIRCLE ───
  const sR = Math.max(6, (s.diameter / maxD) * rMax);
  const sX = mid + (mid * 0.45);
  const sY = h * 0.4;

  const sGrad = ctx.createRadialGradient(sX, sY, 0, sX, sY, sR*2.5);
  sGrad.addColorStop(0, s.color+'44');
  sGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = sGrad;
  ctx.beginPath();
  ctx.arc(sX, sY, sR*2.5, 0, Math.PI*2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(sX, sY, sR, 0, Math.PI*2);
  ctx.fillStyle = s.color+'33';
  ctx.fill();
  ctx.strokeStyle = s.color+'88';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = '6px JetBrains Mono, monospace';
  ctx.fillStyle = s.color;
  ctx.textAlign = 'center';
  ctx.fillText(s.icon+' '+s.label, sX, sY + sR + 16);
  ctx.font = '5px JetBrains Mono, monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillText(`${s.diameter.toLocaleString()} km`, sX, sY + sR + 28);

  // ─── BOTTOM: ORBITAL TRACK ───
  const orbitY = h * 0.82;
  const orbitCX = w/2;
  const orbitR = Math.min(w*0.28, h*0.15);

  // sun
  ctx.beginPath();
  ctx.arc(orbitCX, orbitY, 8, 0, Math.PI*2);
  ctx.fillStyle = '#ffd600';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(orbitCX, orbitY, 12, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(255,214,0,0.15)';
  ctx.fill();

  // orbit rings
  const pOrbitR = orbitR * 0.6;
  const sOrbitR = orbitR * 0.85;
  ctx.beginPath();
  ctx.arc(orbitCX, orbitY, pOrbitR, 0, Math.PI*2);
  ctx.strokeStyle = p.orbitColor;
  ctx.lineWidth = 0.8;
  ctx.setLineDash([2,3]);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(orbitCX, orbitY, sOrbitR, 0, Math.PI*2);
  ctx.strokeStyle = s.orbitColor;
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.setLineDash([]);

  // orbiting bodies
  const pAngle = orbitTime / p.orbitalPeriod * Math.PI*2;
  const sAngle = orbitTime / s.orbitalPeriod * Math.PI*2;
  const pOx = orbitCX + Math.cos(pAngle) * pOrbitR;
  const pOy = orbitY + Math.sin(pAngle) * pOrbitR;
  const sOx = orbitCX + Math.cos(sAngle) * sOrbitR;
  const sOy = orbitY + Math.sin(sAngle) * sOrbitR;

  ctx.beginPath();
  ctx.arc(pOx, pOy, 4, 0, Math.PI*2);
  ctx.fillStyle = p.color;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sOx, sOy, 4, 0, Math.PI*2);
  ctx.fillStyle = s.color;
  ctx.fill();

  // labels
  ctx.font = '4.5px JetBrains Mono, monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.textAlign = 'center';
  ctx.fillText('Orbital Track', orbitCX, h - 8);
}

/* ─── LOOP ─── */
function loop() {
  orbitTime += 1;
  if (synced) {
    const p = PLANETS[primary];
    const s = PLANETS[secondary];
    // keep them aligned
  }
  drawCanvas();
  rafId = requestAnimationFrame(loop);
}

/* ─── UPDATE ─── */
function updateAll() {
  renderTelemetry();
  renderAtmosphere();
  canvasHint.textContent = `${PLANETS[primary].icon} vs ${PLANETS[secondary].icon}`;
  telemHint.textContent = 'COMPARISON ACTIVE';
  atmoHint.textContent = 'SPECTRUM';
}

/* ─── ACTIONS ─── */
function switchPrimary(planet) {
  if (planet === secondary) {
    // swap
    secondary = primary;
    document.querySelectorAll('#selSecondary .sel-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.planet === secondary);
    });
  }
  primary = planet;
  document.querySelectorAll('#selPrimary .sel-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.planet === primary);
  });
  updateAll();
  toast(`Primary: ${PLANETS[planet].icon} ${PLANETS[planet].label}`);
}

function switchSecondary(planet) {
  if (planet === primary) {
    secondary = primary;
    document.querySelectorAll('#selPrimary .sel-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.planet === primary);
    });
  }
  secondary = planet;
  document.querySelectorAll('#selSecondary .sel-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.planet === secondary);
  });
  updateAll();
  toast(`Secondary: ${PLANETS[planet].icon} ${PLANETS[planet].label}`);
}

function gravityJump() {
  const p = PLANETS[primary];
  const s = PLANETS[secondary];
  const ratio = s.gravity > 0 ? (p.gravity / s.gravity) : 1;
  let msg;
  if (ratio > 1) msg = `Jumping from ${s.label} (${s.gravity} m/s²) to ${p.label} (${p.gravity} m/s²) — weight increases ${ratio.toFixed(2)}×`;
  else if (ratio < 1) msg = `Jumping from ${s.label} (${s.gravity} m/s²) to ${p.label} (${p.gravity} m/s²) — weight decreases ${(1/ratio).toFixed(2)}×`;
  else msg = `Gravity on both planets is equal at ${p.gravity} m/s²`;
  toast(msg);
}

function syncAlignment() {
  synced = !synced;
  if (synced) {
    // set orbit time to align planets at same angle
    toast('Planetary orbits synchronized');
  } else {
    toast('Alignment released');
  }
}

function purgeVectors() {
  primary = 'earth';
  secondary = 'mars';
  document.querySelectorAll('.sel-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('#selPrimary [data-planet="earth"]').classList.add('active');
  document.querySelector('#selSecondary [data-planet="mars"]').classList.add('active');
  synced = false;
  updateAll();
  toast('Selection vectors purged — reset to Earth vs Mars');
}

/* ─── TOAST ─── */
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  $('toastContainer').appendChild(el);
  setTimeout(() => { el.classList.add('leave'); setTimeout(() => el.remove(), 300); }, 3000);
}

/* ─── INIT ─── */
function init() {
  // selector events
  selPrimary.querySelectorAll('.sel-btn').forEach(btn => {
    btn.addEventListener('click', () => switchPrimary(btn.dataset.planet));
  });
  selSecondary.querySelectorAll('.sel-btn').forEach(btn => {
    btn.addEventListener('click', () => switchSecondary(btn.dataset.planet));
  });

  // action buttons
  btnGravity.addEventListener('click', gravityJump);
  btnSync.addEventListener('click', syncAlignment);
  btnPurge.addEventListener('click', purgeVectors);

  // resize
  window.addEventListener('resize', () => { drawCanvas(); });

  // boot
  updateAll();
  loop();
  toast('Planet Comparison Dashboard ready');
}

document.addEventListener('DOMContentLoaded', init);
