'use strict';

/* ─── MATERIAL DICTIONARY ─── */
const MATERIALS = {
  fruit:  { label:'Fruit / Veg Scraps', type:'Green',  c:15,  n:1,   moisture:0.8,  bulk:0.4 },
  coffee: { label:'Coffee Grounds',     type:'Green',  c:20,  n:1,   moisture:0.6,  bulk:0.3 },
  leaves: { label:'Dry Leaves',         type:'Brown',  c:60,  n:1,   moisture:0.15, bulk:0.2 },
  cardboard:{ label:'Cardboard Shavings',type:'Brown', c:350, n:1,   moisture:0.1,  bulk:0.15 },
  straw:  { label:'Spent Straw',        type:'Brown',  c:80,  n:1,   moisture:0.2,  bulk:0.25 }
};

const MIX_OPTIMAL_LO = 25;
const MIX_OPTIMAL_HI = 30;

/* ─── STATE ─── */
let recipe = []; // { key, mass }

/* ─── DOM REFS ─── */
const $ = id => document.getElementById(id);

const recipeBody  = $('recipeBody');
const tableEmpty  = $('tableEmpty');
const recipeHint  = $('recipeHint');
const totalItems  = $('totalItems');
const totalMass   = $('totalMass');
const cnVal       = $('cnVal');
const tfCarbon    = $('tfCarbon');
const tfNitrogen  = $('tfNitrogen');
const tfRatio     = $('tfRatio');

const dashRatioVal  = $('dashRatioVal');
const dashTimeVal   = $('dashTimeVal');
const dashGradeVal  = $('dashGradeVal');
const dashMethaneVal = $('dashMethaneVal');
const dashStatusVal = $('dashStatusVal');
const dashStatusCard = $('dashStatusCard');

const alertBanner  = $('alertBanner');
const gaugeCanvas  = $('gaugeCanvas');
const barCanvas    = $('barCanvas');
const ctxG         = gaugeCanvas.getContext('2d');
const ctxB         = barCanvas.getContext('2d');

const matSelect  = $('matSelect');
const massInput  = $('massInput');
const btnAdd     = $('btnAdd');
const btnRoadmap = $('btnRoadmap');
const btnPreset  = $('btnPreset');
const btnPurge   = $('btnPurge');

const topBadge     = $('topBadge');

/* ─── TOAST ─── */
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  $('toastContainer').appendChild(el);
  setTimeout(() => { el.classList.add('leave'); setTimeout(() => el.remove(), 300); }, 2500);
}

/* ─── COMPUTATION ─── */
function computeTotals() {
  let totC = 0, totN = 0, totMass = 0;
  for (const row of recipe) {
    const m = MATERIALS[row.key];
    const mass = row.mass;
    totMass += mass;
    const frac = mass / (m.c + m.n);
    totC += frac * m.c;
    totN += frac * m.n;
  }
  return { totC, totN, totMass, items: recipe.length };
}

function computeRatio(totC, totN) {
  if (totN <= 0 || totC <= 0) return null;
  return totC / totN;
}

function getStatus(r) {
  if (r === null) return { label:'WAITING', cls:'', desc:'' };
  if (r >= MIX_OPTIMAL_LO && r <= MIX_OPTIMAL_HI) return { label:'OPTIMAL AEROBIC METABOLISM KINETICS', cls:'opt', desc:'Ideal microbial activity range' };
  if (r < MIX_OPTIMAL_LO) return { label:'ANAEROBIC PUTREFACTION RISK: EXCESS NITROGEN', cls:'crit', desc:'Add more carbon-rich browns' };
  return { label:'CARBON LOCKOUT: DECOMPOSITION STALLED', cls:'warn', desc:'Add more nitrogen-rich greens' };
}

function estimateWeeks(r, totMass) {
  if (r === null || totMass <= 0) return '--';
  // baseline 12 weeks at optimal, scaled by mass and ratio deviation
  const deviation = r < MIX_OPTIMAL_LO ? (MIX_OPTIMAL_LO - r) * 0.5 : (r > MIX_OPTIMAL_HI ? (r - MIX_OPTIMAL_HI) * 0.3 : 0);
  const massFactor = 1 + totMass / 5000;
  const w = (12 + deviation * 2) * massFactor;
  return Math.round(Math.max(4, Math.min(52, w)));
}

function estimateGrade(r) {
  if (r === null) return '--';
  if (r >= 25 && r <= 30) return 'A+';
  if (r >= 20 && r <= 35) return 'A';
  if (r >= 15 && r <= 45) return 'B';
  if (r >= 10 && r <= 60) return 'C';
  return 'D';
}

function estimateMethane(r, totMass) {
  if (r === null || totMass <= 0) return '--';
  // ~0.4 lbs CO₂-eq diverted per gram composted in aerobic conditions
  // lower at poor ratios
  const eff = r >= 20 && r <= 40 ? 1 : Math.max(0.3, 1 - Math.abs(r - 27.5) / 50);
  return ((totMass * 0.4 * eff) / 100).toFixed(1);
}

/* ─── RENDER ALL ─── */
function render() {
  const { totC, totN, totMass, items } = computeTotals();
  const ratio = computeRatio(totC, totN);
  const status = getStatus(ratio);
  const weeks = estimateWeeks(ratio, totMass);
  const grade = estimateGrade(ratio);
  const methane = estimateMethane(ratio, totMass);
  const rStr = ratio !== null ? ratio.toFixed(1) : '--';

  // table body
  if (recipe.length === 0) {
    recipeBody.innerHTML = '';
    tableEmpty.style.display = 'flex';
  } else {
    tableEmpty.style.display = 'none';
    recipeBody.innerHTML = recipe.map((row, i) => {
      const m = MATERIALS[row.key];
      const frac = row.mass / (m.c + m.n);
      const c = (frac * m.c).toFixed(1);
      const n = (frac * m.n).toFixed(1);
      return `<tr>
        <td style="color:${m.type==='Green'?'var(--gr)':'var(--am)'}">${m.label}</td>
        <td>${m.type}</td>
        <td>${row.mass}</td>
        <td>${c}</td>
        <td>${n}</td>
        <td><button class="rm-btn" data-idx="${i}" title="Remove">✕</button></td>
      </tr>`;
    }).join('');
    recipeBody.querySelectorAll('.rm-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        recipe.splice(parseInt(btn.dataset.idx), 1);
        render();
        toast('Item removed from recipe');
      });
    });
  }

  // top metrics
  totalItems.textContent = items;
  totalMass.textContent = totMass.toFixed(0);
  cnVal.textContent = rStr + ':1';
  recipeHint.textContent = items + (items===1?' ITEM':' ITEMS');

  // table footer
  tfCarbon.textContent = totC.toFixed(1);
  tfNitrogen.textContent = totN.toFixed(1);
  tfRatio.textContent = rStr;

  // dash cards
  const dashKeys = ['dashRatio','dashTime','dashGrade','dashMethane','dashStatusCard'];
  dashKeys.forEach(k => $(k).className = 'dash-card ' + status.cls);
  dashRatioVal.textContent = rStr + ':1';
  dashTimeVal.textContent = weeks;
  dashGradeVal.textContent = grade;
  dashMethaneVal.textContent = methane;
  dashStatusVal.textContent = status.label;

  // badge + border
  topBadge.textContent = status.label.includes('OPTIMAL')?'OPTIMAL':status.label.includes('RISK')?'N RISK':status.label.includes('LOCKOUT')?'C LOCKOUT':'WAITING';
  topBadge.style.color = status.cls==='opt'?'var(--gr)':status.cls==='crit'?'var(--rd)':status.cls==='warn'?'var(--am)':'var(--txtm)';
  topBadge.style.borderColor = status.cls==='opt'?'rgba(0,230,118,0.3)':status.cls==='crit'?'rgba(255,23,68,0.3)':status.cls==='warn'?'rgba(255,184,0,0.3)':'rgba(255,255,255,0.1)';

  // alert banner
  if (status.cls==='crit' || status.cls==='warn') {
    alertBanner.style.display = 'block';
    alertBanner.style.background = status.cls==='crit'? 'rgba(255,23,68,0.1)':'rgba(255,184,0,0.1)';
    alertBanner.style.borderColor = status.cls==='crit'? 'rgba(255,23,68,0.25)':'rgba(255,184,0,0.25)';
    alertBanner.style.color = status.cls==='crit'? '#ff1744':'#ffb800';
    alertBanner.textContent = status.desc ? '⚠ ' + status.desc : '';
  } else {
    alertBanner.style.display = 'none';
  }

  drawGauge(ratio);
  drawBars(totC, totN);
}

/* ─── CANVAS GAUGE ─── */
function drawGauge(ratio) {
  const dpr = window.devicePixelRatio || 1;
  const wrap = gaugeCanvas.parentElement;
  const w = wrap.clientWidth || 280;
  const h = Math.max(180, w * 0.55);
  gaugeCanvas.style.width = w + 'px';
  gaugeCanvas.style.height = h + 'px';
  gaugeCanvas.width = w * dpr;
  gaugeCanvas.height = h * dpr;
  const g = ctxG;
  g.setTransform(1,0,0,1,0,0);
  g.scale(dpr,dpr);
  g.clearRect(0,0,w,h);

  const cx = w/2, cy = h * 0.65;
  const radius = Math.min(w * 0.38, h * 0.55);

  // arc bg
  const startAng = Math.PI * 0.75;
  const endAng = Math.PI * 2.25;
  g.beginPath();
  g.arc(cx, cy, radius, startAng, endAng);
  g.strokeStyle = 'rgba(255,255,255,0.04)';
  g.lineWidth = 12;
  g.stroke();

  // value arc
  if (ratio !== null) {
    const frac = Math.max(0, Math.min(1, (ratio - 5) / 70)); // map 5-75 range
    const valAng = startAng + frac * (endAng - startAng);
    const color = ratio >= MIX_OPTIMAL_LO && ratio <= MIX_OPTIMAL_HI ? '#00e676' : ratio < MIX_OPTIMAL_LO ? '#ff1744' : '#ffb800';
    g.beginPath();
    g.arc(cx, cy, radius, startAng, valAng);
    g.strokeStyle = color;
    g.lineWidth = 8;
    g.lineCap = 'round';
    g.stroke();
  }

  // needle + center
  g.save();
  const nFrac = ratio !== null ? Math.max(0, Math.min(1, (ratio - 5) / 70)) : 0;
  const nAng = startAng + nFrac * (endAng - startAng);
  const needleLen = radius * 0.75;
  g.translate(cx, cy);
  g.rotate(nAng - Math.PI/2);
  g.beginPath();
  g.moveTo(-3, 0);
  g.lineTo(0, -needleLen);
  g.lineTo(3, 0);
  g.closePath();
  g.fillStyle = ratio !== null ? (ratio >= MIX_OPTIMAL_LO && ratio <= MIX_OPTIMAL_HI ? '#00e676' : ratio < MIX_OPTIMAL_LO ? '#ff1744' : '#ffb800') : '#4a5268';
  g.fill();
  g.restore();

  g.beginPath();
  g.arc(cx, cy, 5, 0, Math.PI*2);
  g.fillStyle = '#e0e4ec';
  g.fill();

  // labels
  g.font = '5px JetBrains Mono, monospace';
  g.fillStyle = 'rgba(255,255,255,0.12)';
  g.textAlign = 'center';
  g.fillText('5:1', cx - radius*0.7, cy + 16);
  g.fillText('75:1', cx + radius*0.7, cy + 16);
  g.fillText('CN', cx, cy - radius*0.55);

  // center value
  g.font = 'bold 18px Orbitron, sans-serif';
  g.fillStyle = ratio !== null ? '#e0e4ec' : '#4a5268';
  g.fillText(ratio !== null ? ratio.toFixed(1) + ':1' : '--:1', cx, cy + radius + 24);
}

/* ─── CANVAS BARS ─── */
function drawBars(totC, totN) {
  const dpr = window.devicePixelRatio || 1;
  const wrap = barCanvas.parentElement;
  const w = wrap.clientWidth || 280;
  const h = Math.max(40, w * 0.15);
  barCanvas.style.width = w + 'px';
  barCanvas.style.height = h + 'px';
  barCanvas.width = w * dpr;
  barCanvas.height = h * dpr;
  const b = ctxB;
  b.setTransform(1,0,0,1,0,0);
  b.scale(dpr,dpr);
  b.clearRect(0,0,w,h);

  const pad = 10, barH = 10, gap = 6, y1 = pad, y2 = pad + barH + gap;
  const maxVal = Math.max(totC, totN, 1);
  const avail = w - pad*2;

  // carbon bar
  const cW = (totC / maxVal) * avail;
  b.fillStyle = '#00e5ff';
  b.beginPath();
  b.roundRect(pad, y1, Math.max(2,cW), barH, 3);
  b.fill();
  b.font = '5px JetBrains Mono, monospace';
  b.fillStyle = '#4a5268';
  b.textAlign = 'right';
  b.fillText('C', pad - 4, y1 + 8);
  b.fillStyle = '#8892a8';
  b.textAlign = 'left';
  b.fillText(totC.toFixed(1) + ' g', pad + cW + 4, y1 + 8);

  // nitrogen bar
  const nW = (totN / maxVal) * avail;
  b.fillStyle = '#00e676';
  b.beginPath();
  b.roundRect(pad, y2, Math.max(2,nW), barH, 3);
  b.fill();
  b.font = '5px JetBrains Mono, monospace';
  b.fillStyle = '#4a5268';
  b.textAlign = 'right';
  b.fillText('N', pad - 4, y2 + 8);
  b.fillStyle = '#8892a8';
  b.textAlign = 'left';
  b.fillText(totN.toFixed(1) + ' g', pad + nW + 4, y2 + 8);
}

/* ─── VALIDATION ─── */
function validateInputs() {
  const mass = parseInt(massInput.value);
  if (!mass || mass <= 0 || isNaN(mass)) {
    btnAdd.classList.remove('shake');
    void btnAdd.offsetWidth;
    btnAdd.classList.add('shake');
    massInput.style.borderColor = '#ff1744';
    setTimeout(() => massInput.style.borderColor = '', 600);
    alertBanner.style.display = 'block';
    alertBanner.style.background = 'rgba(255,23,68,0.1)';
    alertBanner.style.borderColor = 'rgba(255,23,68,0.25)';
    alertBanner.style.color = '#ff1744';
    alertBanner.textContent = '⚠ Invalid mass — enter a positive quantity';
    toast('Invalid mass value');
    return false;
  }
  return true;
}

/* ─── ACTIONS ─── */
function addItem() {
  if (!validateInputs()) return;
  const key = matSelect.value;
  const mass = parseInt(massInput.value);
  recipe.push({ key, mass });
  alertBanner.style.display = 'none';
  render();
  toast(`Added ${mass}g ${MATERIALS[key].label}`);
}

function injectPreset() {
  recipe = [
    { key:'leaves',   mass:800 },
    { key:'fruit',    mass:400 },
    { key:'cardboard',mass:300 },
    { key:'coffee',   mass:200 }
  ];
  render();
  toast('Optimal baseline preset injected');
}

function purge() {
  recipe = [];
  render();
  toast('Material matrix ledger purged');
}

function generateRoadmap() {
  if (recipe.length === 0) {
    toast('Add materials before generating a roadmap');
    return;
  }
  const { totC, totN, totMass, items } = computeTotals();
  const ratio = computeRatio(totC, totN);
  const status = getStatus(ratio);
  const weeks = estimateWeeks(ratio, totMass);
  const grade = estimateGrade(ratio);
  const methane = estimateMethane(ratio, totMass);

  const lines = [
    '╔══ COMPOSTING ROADMAP ══╗',
    `Items:         ${items}`,
    `Total Mass:    ${totMass.toFixed(0)} g`,
    `C:N Ratio:     ${ratio !== null ? ratio.toFixed(1) + ':1' : '--'}`,
    `Status:        ${status.label}`,
    `Est. Time:     ${weeks} weeks`,
    `Grade:         ${grade}`,
    `Methane Div.:  ${methane} lbs CO₂-eq/yr`,
    '╚══════════════════════════╝'
  ];

  // show as toast sequence
  lines.forEach((line, i) => {
    setTimeout(() => toast(line), i * 500);
  });
}

/* ─── CANVAS INIT ─── */
function initCanvas() {
  render();
}

/* ─── BOOT ─── */
function init() {
  // events
  btnAdd.addEventListener('click', addItem);
  massInput.addEventListener('keydown', e => { if (e.key === 'Enter') addItem(); });
  btnPreset.addEventListener('click', injectPreset);
  btnPurge.addEventListener('click', purge);
  btnRoadmap.addEventListener('click', generateRoadmap);

  window.addEventListener('resize', () => {
    initCanvas();
  });

  // keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && document.activeElement === massInput) addItem();
  });

  initCanvas();
  toast('Smart Compost Planner ready');
}

document.addEventListener('DOMContentLoaded', init);
