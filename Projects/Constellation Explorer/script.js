'use strict';

/* ─── CONSTELLATION DATA ─── */
const CONSTELLATIONS = {
  orion: {
    name:'Orion', label:'Orion · The Hunter',
    brightest:'Rigel', avgMag:0.8, distance:'~1,344 ly',
    myth:'In Greek mythology, Orion was a giant huntsman placed among the stars by Zeus. The constellation contains two of the brightest stars in the night sky — Rigel (a blue supergiant) and Betelgeuse (a red supergiant). Orion\'s Belt, three aligned stars, is one of the most recognizable asterisms in the northern sky.',
    connectOrder:[0,1,2,3,4,5,6], // indices into stars array
    stars:[
      { name:'Betelgeuse', x:0.25, y:0.18, mag:0.5,  color:'#ff6d00' },
      { name:'Bellatrix',  x:0.55, y:0.20, mag:1.6,  color:'#00e5ff' },
      { name:'Alnilam',    x:0.40, y:0.45, mag:1.7,  color:'#00e5ff' },
      { name:'Alnitak',    x:0.28, y:0.48, mag:1.9,  color:'#00e5ff' },
      { name:'Mintaka',    x:0.52, y:0.43, mag:2.2,  color:'#00e5ff' },
      { name:'Saiph',      x:0.22, y:0.78, mag:2.1,  color:'#00e5ff' },
      { name:'Rigel',      x:0.58, y:0.80, mag:0.1,  color:'#00e5ff' }
    ]
  },
  ursa: {
    name:'Ursa Major', label:'Ursa Major · The Great Bear',
    brightest:'Alioth', avgMag:1.8, distance:'~80 ly',
    myth:'Ursa Major, the Great Bear, has been known since antiquity. In Greek myth, Zeus transformed the nymph Callisto into a bear and later placed her in the sky. The seven brightest stars form the Big Dipper asterism — one of the most recognized patterns in the northern sky, used for centuries in navigation to locate Polaris.',
    connectOrder:[0,1,2,3,4,5,6],
    stars:[
      { name:'Dubhe',   x:0.20, y:0.20, mag:1.8, color:'#00e5ff' },
      { name:'Merak',   x:0.35, y:0.25, mag:2.4, color:'#00e5ff' },
      { name:'Phecda',  x:0.42, y:0.38, mag:2.4, color:'#00e5ff' },
      { name:'Megrez',  x:0.48, y:0.45, mag:3.3, color:'#00e5ff' },
      { name:'Alioth',  x:0.58, y:0.40, mag:1.8, color:'#00e5ff' },
      { name:'Mizar',   x:0.68, y:0.35, mag:2.2, color:'#00e5ff' },
      { name:'Alkaid',  x:0.80, y:0.28, mag:1.9, color:'#00e5ff' }
    ]
  },
  cassiopeia: {
    name:'Cassiopeia', label:'Cassiopeia · The Queen',
    brightest:'Schedar', avgMag:2.5, distance:'~228 ly',
    myth:'Cassiopeia was the boastful queen of Ethiopia in Greek mythology. As punishment for her vanity, she was chained to a throne in the heavens — and at certain times of the year appears upside-down. The constellation\'s distinctive W-shaped asterism is easily recognized in the northern sky, straddling the Milky Way.',
    connectOrder:[0,1,2,3,4],
    stars:[
      { name:'Schedar', x:0.18, y:0.55, mag:2.2, color:'#00e5ff' },
      { name:'Caph',    x:0.36, y:0.25, mag:2.3, color:'#00e5ff' },
      { name:'Ruchbah', x:0.50, y:0.45, mag:2.7, color:'#00e5ff' },
      { name:'Segin',   x:0.64, y:0.28, mag:3.4, color:'#00e5ff' },
      { name:'Navi',    x:0.80, y:0.58, mag:2.2, color:'#00e5ff' }
    ]
  },
  taurus: {
    name:'Taurus', label:'Taurus · The Bull',
    brightest:'Aldebaran', avgMag:3.0, distance:'~148 ly',
    myth:'Taurus represents the bull from Greek mythology — the form Zeus took to abduct Europa. The constellation features Aldebaran, a red giant marking the bull\'s eye, and the Pleiades star cluster (Seven Sisters) on its shoulder. Taurus has been recognized since the Bronze Age and marks the location of the Vernal Equinox.',
    connectOrder:[0,1,2,3,4,5,6],
    stars:[
      { name:'Aldebaran', x:0.38, y:0.60, mag:0.9, color:'#ff6d00' },
      { name:'Elnath',    x:0.55, y:0.20, mag:1.7, color:'#00e5ff' },
      { name:'Alcyone',   x:0.15, y:0.22, mag:2.9, color:'#00e5ff' },
      { name:'Atlas',     x:0.10, y:0.30, mag:3.6, color:'#00e5ff' },
      { name:'Electra',   x:0.20, y:0.18, mag:3.7, color:'#00e5ff' },
      { name:'Merope',    x:0.25, y:0.30, mag:4.1, color:'#00e5ff' },
      { name:'Taygeta',   x:0.22, y:0.38, mag:4.3, color:'#00e5ff' }
    ]
  }
};

const CLICK_RADIUS = 16;

/* ─── DOM REFS ─── */
const $ = id => document.getElementById(id);
const canvas = $('starCanvas');
const ctx = canvas.getContext('2d');
const iName = $('iName');
const iBrightest = $('iBrightest');
const iMagnitude = $('iMagnitude');
const iDistance = $('iDistance');
const iMyth = $('iMyth');
const logEntries = $('logEntries');
const canvasHint = $('canvasHint');
const infoHint = $('infoHint');
const topBadge = $('topBadge');
const nodeCount = $('nodeCount');
const linkCount = $('linkCount');
const statusLabel = $('statusLabel');
const btnVerify = $('btnVerify');
const btnOverlay = $('btnOverlay');
const btnFlush = $('btnFlush');

/* ─── STATE ─── */
let activeConst = 'orion';
let connections = []; // [{ from: starIdx, to: starIdx }]
let selectedStar = null; // currently active star idx for connecting
let showOverlay = false;
let verified = false;
let rafId = null;
let twinkleTime = 0;
let bgStars = [];

/* ─── GENERATE BACKGROUND STARS ─── */
function initBgStars() {
  bgStars = [];
  for (let i=0; i<200; i++) {
    bgStars.push({
      x: Math.random(),
      y: Math.random(),
      r: 0.3 + Math.random()*0.8,
      phase: Math.random()*Math.PI*2,
      speed: 0.5 + Math.random()*1.5
    });
  }
}

/* ─── GET CONST ─── */
function getConst() {
  return CONSTELLATIONS[activeConst];
}

/* ─── DRAW ─── */
function drawCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const wrap = canvas.parentElement;
  const w = wrap.clientWidth || 500;
  const h = Math.max(300, w * 0.6);
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.setTransform(1,0,0,1,0,0);
  ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,w,h);

  const c = getConst();

  // background
  const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w*0.7);
  grad.addColorStop(0,'#0a0e1a');
  grad.addColorStop(1,'#05060b');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,w,h);

  // background twinkling stars
  twinkleTime += 0.02;
  for (const s of bgStars) {
    const alpha = 0.015 + Math.sin(twinkleTime * s.speed + s.phase) * 0.015 + 0.01;
    ctx.beginPath();
    ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(255,255,255,${Math.max(0, alpha)})`;
    ctx.fill();
  }

  // overlay grid
  if (showOverlay) {
    ctx.strokeStyle = 'rgba(0,229,255,0.05)';
    ctx.lineWidth = 0.5;
    for (let x=0; x<w; x+=w/8) {
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke();
    }
    for (let y=0; y<h; y+=h/8) {
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke();
    }
  }

  // draw connections
  for (const conn of connections) {
    const fromStar = c.stars[conn.from];
    const toStar = c.stars[conn.to];
    const fx = fromStar.x * w, fy = fromStar.y * h;
    const tx = toStar.x * w, ty = toStar.y * h;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(tx, ty);
    ctx.strokeStyle = verified ? 'rgba(0,230,118,0.6)' : 'rgba(255,214,0,0.5)';
    ctx.lineWidth = verified ? 2 : 1.5;
    ctx.stroke();

    // glow on verified
    if (verified) {
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(tx, ty);
      ctx.strokeStyle = 'rgba(0,230,118,0.1)';
      ctx.lineWidth = 6;
      ctx.stroke();
    }
  }

  // guidance hint lines (ghost of correct pattern)
  if (showOverlay && !verified) {
    const order = c.connectOrder;
    ctx.beginPath();
    for (let i=0; i<order.length-1; i++) {
      const from = c.stars[order[i]];
      const to = c.stars[order[i+1]];
      const fx = from.x * w, fy = from.y * h;
      const tx = to.x * w, ty = to.y * h;
      ctx.moveTo(fx, fy);
      ctx.lineTo(tx, ty);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4,6]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // draw stars
  for (let i=0; i<c.stars.length; i++) {
    const star = c.stars[i];
    const sx = star.x * w, sy = star.y * h;
    const isConnected = connections.some(c2 => c2.from===i || c2.to===i);
    const isSelected = selectedStar === i;
    const baseR = Math.max(3, 7 - star.mag * 0.5);

    // glow
    const glowR = baseR * 4;
    const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
    const col = star.color;
    glow.addColorStop(0, col+'44');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(sx, sy, glowR, 0, Math.PI*2);
    ctx.fill();

    // star body
    const twinkle = 0.7 + Math.sin(twinkleTime * 2 + i * 1.7) * 0.3;
    ctx.beginPath();
    ctx.arc(sx, sy, baseR * twinkle, 0, Math.PI*2);
    ctx.fillStyle = verified && isConnected ? '#00e676' : isSelected ? '#ffd600' : col;
    ctx.fill();

    // hover ring for selected
    if (isSelected) {
      ctx.beginPath();
      ctx.arc(sx, sy, CLICK_RADIUS, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(255,214,0,0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2,3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // name label
    ctx.font = '5px JetBrains Mono, monospace';
    ctx.fillStyle = verified && isConnected ? 'rgba(0,230,118,0.6)' : 'rgba(255,255,255,0.2)';
    ctx.textAlign = 'center';
    ctx.fillText(star.name, sx, sy + baseR * twinkle + 12);
  }

  // completion flash
  if (verified) {
    ctx.font = '8px Orbitron, monospace';
    ctx.fillStyle = 'rgba(0,230,118,0.15)';
    ctx.textAlign = 'center';
    ctx.fillText('✦ CONSTELLATION MAPPED ✦', w/2, 20);
  }
}

/* ─── GET STAR FROM CLICK ─── */
function getStarAt(mx, my) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;
  const c = getConst();
  for (let i=0; i<c.stars.length; i++) {
    const s = c.stars[i];
    const sx = s.x * w, sy = s.y * h;
    const dist = Math.sqrt((mx-sx)**2 + (my-sy)**2);
    if (dist <= CLICK_RADIUS) return i;
  }
  return null;
}

/* ─── CONNECT STARS ─── */
function connectStars(from, to) {
  if (from === to) return;
  // check no duplicate connection
  if (connections.some(c => (c.from===from && c.to===to) || (c.from===to && c.to===from))) {
    toast('Stars already connected');
    return;
  }
  connections.push({ from, to });
  addLog(`Connected ${getConst().stars[from].name} → ${getConst().stars[to].name}`, false);
  updateCounts();
  verified = false;
  toast(`Linked ${getConst().stars[from].name} to ${getConst().stars[to].name}`);
}

/* ─── UPDATE COUNTS ─── */
function updateCounts() {
  const c = getConst();
  nodeCount.textContent = c.stars.length;
  linkCount.textContent = connections.length;
}

/* ─── LOG ─── */
function addLog(msg, isDone) {
  const empty = logEntries.querySelector('.log-empty');
  if (empty) empty.remove();
  const el = document.createElement('div');
  el.className = 'log-line' + (isDone ? ' done' : '');
  el.textContent = msg;
  logEntries.appendChild(el);
  logEntries.scrollTop = logEntries.scrollHeight;
}

/* ─── VERIFY ─── */
function verifyMapping() {
  const c = getConst();
  const order = c.connectOrder;

  // check connections match the expected sequence exactly
  if (connections.length !== order.length - 1) {
    toast(`Incomplete: need ${order.length-1} connections, have ${connections.length}`);
    return;
  }

  const expected = [];
  for (let i=0; i<order.length-1; i++) {
    expected.push({ from:order[i], to:order[i+1] });
  }

  // check each expected pair exists (in either order)
  const match = expected.every(exp => {
    return connections.some(conn =>
      (conn.from === exp.from && conn.to === exp.to) ||
      (conn.from === exp.to && conn.to === exp.from)
    );
  });

  if (match) {
    verified = true;
    topBadge.textContent = '✦ VERIFIED';
    topBadge.style.color = '#00e676';
    topBadge.style.borderColor = 'rgba(0,230,118,0.3)';
    statusLabel.textContent = 'VERIFIED';
    statusLabel.style.color = '#00e676';
    canvasHint.textContent = '✦ MAPPED';
    canvasHint.style.color = '#00e676';
    infoHint.textContent = 'VERIFIED';
    addLog('✓ CELESTIAL SIGNATURE STABILIZED: CONSTELLATION MAPPED SECURELY', true);
    toast('✦ Constellation verified!');
    // update info with mythology
    iMyth.textContent = c.myth;
    // update telemetry
    iName.textContent = c.label;
    iBrightest.textContent = c.brightest;
    iMagnitude.textContent = c.avgMag.toFixed(1);
    iDistance.textContent = c.distance;
  } else {
    verified = false;
    toast('Pattern mismatch — connections do not match the correct constellation layout');
    addLog('✗ Verification failed — check connection order', false);
  }
}

/* ─── SWITCH CONSTELLATION ─── */
function switchConst(key) {
  if (key === activeConst) return;
  activeConst = key;
  connections = [];
  selectedStar = null;
  verified = false;
  logEntries.innerHTML = '<div class="log-empty">No connections yet. Click a star to begin.</div>';
  const c = getConst();
  iName.textContent = c.name;
  iBrightest.textContent = c.brightest;
  iMagnitude.textContent = c.avgMag.toFixed(1);
  iDistance.textContent = c.distance;
  iMyth.textContent = 'Click stars to connect the constellation pattern. Connect all nodes in the correct order to verify.';
  updateCounts();
  statusLabel.textContent = 'MAPPING';
  statusLabel.style.color = '';
  canvasHint.textContent = c.name.toUpperCase();
  canvasHint.style.color = '';
  topBadge.textContent = 'MAPPING';
  topBadge.style.color = '#00e5ff';
  topBadge.style.borderColor = 'rgba(0,229,255,0.2)';
  infoHint.textContent = 'ACTIVE';
  toast(`Switched to ${c.label}`);
}

/* ─── OVERLAY TOGGLE ─── */
function toggleOverlay() {
  showOverlay = !showOverlay;
  toast(showOverlay ? 'Guidance overlay active' : 'Overlay hidden');
}

/* ─── FLUSH ─── */
function flushStarmap() {
  connections = [];
  selectedStar = null;
  verified = false;
  logEntries.innerHTML = '<div class="log-empty">No connections yet. Click a star to begin.</div>';
  const c = getConst();
  updateCounts();
  statusLabel.textContent = 'IDLE';
  statusLabel.style.color = '';
  canvasHint.textContent = c.name.toUpperCase();
  canvasHint.style.color = '';
  infoHint.textContent = 'IDLE';
  topBadge.textContent = 'STANDBY';
  topBadge.style.color = '#4a5268';
  topBadge.style.borderColor = 'rgba(255,255,255,0.1)';
  iMyth.textContent = 'Click stars to connect the constellation pattern. Connect all nodes in the correct order to verify.';
  toast('Starmap coordinates flushed');
}

/* ─── TOAST ─── */
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  $('toastContainer').appendChild(el);
  setTimeout(() => { el.classList.add('leave'); setTimeout(() => el.remove(), 300); }, 2500);
}

/* ─── LOOP ─── */
function loop() {
  drawCanvas();
  rafId = requestAnimationFrame(loop);
}

/* ─── INIT ─── */
function init() {
  initBgStars();

  const c = getConst();
  iName.textContent = c.name;
  iBrightest.textContent = c.brightest;
  iMagnitude.textContent = c.avgMag.toFixed(1);
  iDistance.textContent = c.distance;
  updateCounts();

  // canvas click
  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const mx = (e.clientX - rect.left) * (w / rect.width);
    const my = (e.clientY - rect.top) * (h / rect.height);

    const starIdx = getStarAt(mx, my);
    if (starIdx === null) return;

    if (selectedStar === null) {
      selectedStar = starIdx;
      toast(`Selected ${getConst().stars[starIdx].name}`);
    } else if (selectedStar === starIdx) {
      selectedStar = null;
      toast('Deselected');
    } else {
      connectStars(selectedStar, starIdx);
      selectedStar = starIdx; // chain to next
    }
  });

  // right-click to deselect
  canvas.addEventListener('contextmenu', e => {
    e.preventDefault();
    selectedStar = null;
    toast('Selection cleared');
  });

  // constellation buttons
  document.querySelectorAll('.const-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.const-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      switchConst(btn.dataset.const);
    });
  });

  btnVerify.addEventListener('click', verifyMapping);
  btnOverlay.addEventListener('click', toggleOverlay);
  btnFlush.addEventListener('click', flushStarmap);

  window.addEventListener('resize', () => {});

  loop();
  toast('Constellation Explorer ready — click stars to connect the pattern');
}

document.addEventListener('DOMContentLoaded', init);
