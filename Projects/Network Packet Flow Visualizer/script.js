(function () {
  'use strict';

  /* ─── CONSTANTS ─── */
  const NODES = {
    client:   { lx: 0.12, ly: 0.50, label: 'CLIENT',   color: '#00e5ff', radius: 28 },
    router:   { lx: 0.35, ly: 0.50, label: 'ROUTER',   color: '#ffc800', radius: 24 },
    server:   { lx: 0.62, ly: 0.50, label: 'SERVER',   color: '#00e5ff', radius: 28 },
    database: { lx: 0.88, ly: 0.50, label: 'DATABASE', color: '#b388ff', radius: 28 },
  };

  const PATHS = {
    GET:   ['client', 'router', 'server', 'router', 'client'],
    DB:    ['client', 'router', 'server', 'database', 'server', 'router', 'client'],
    OAUTH: ['client', 'router', 'server', 'router', 'client'],
  };

  const PRESET_COLORS = { GET: '#00e5ff', DB: '#ffc800', OAUTH: '#33cc66' };
  const PRESET_CLASSES = { GET: 'active-get', DB: 'active-db', OAUTH: 'active-oauth' };

  const HOP_MESSAGES = {
    GET: {
      'client->router':  { text: 'Outbound HTTP GET /api/resource via {{protocol}}', type: 'syn' },
      'router->server':  { text: 'Routing HTTP request through upstream gateway — TTL {{ttl}}', type: 'syn' },
      'server->router':  { text: 'Response 200 OK — payload assembled, checksum {{csum}}', type: 'ack' },
      'router->client':  { text: 'Response delivered ({{size}}kb) — connection closing', type: 'ack' },
    },
    DB: {
      'client->router':  { text: 'BEGIN TRANSACTION — atomic write, isolation SERIALIZABLE', type: 'syn' },
      'router->server':  { text: 'Forwarding transactional payload — {{rows}} rows affected', type: 'syn' },
      'server->database':{ text: 'COMMIT — write-ahead log synced to persistent storage', type: 'syn' },
      'database->server':{ text: 'Persistent storage ack — row lock released, checksum {{csum}}', type: 'ack' },
      'server->router':  { text: 'Transaction verified — commit acknowledged', type: 'ack' },
      'router->client':  { text: 'COMMIT acknowledged — connection pool released', type: 'ack' },
    },
    OAUTH: {
      'client->router':  { text: 'Authorization request — grant_type=authorization_code', type: 'syn' },
      'router->server':  { text: 'Token endpoint /oauth/token — validating client credentials', type: 'syn' },
      'server->router':  { text: 'Access token + refresh token issued — scope: openid profile email', type: 'ack' },
      'router->client':  { text: 'Bearer token {{tok}} received — handshake complete', type: 'ack' },
    },
  };

  /* ─── DOM REFS ─── */
  const canvas = document.getElementById('topologyCanvas');
  const ctx = canvas.getContext('2d');
  const logContent = document.getElementById('logContent');
  const logStatus = document.getElementById('logStatus');

  const velocitySlider = document.getElementById('velocitySlider');
  const congestionSlider = document.getElementById('congestionSlider');
  const dropRateSlider = document.getElementById('dropRateSlider');
  const protocolSelect = document.getElementById('protocolSelect');
  const velValue = document.getElementById('velValue');
  const congValue = document.getElementById('congValue');
  const dropValue = document.getElementById('dropValue');

  const tHop = document.getElementById('tHop');
  const tLatency = document.getElementById('tLatency');
  const tPackets = document.getElementById('tPackets');
  const tBadge = document.getElementById('tBadge');
  const tHealth = document.getElementById('tHealth');
  const tProtocol = document.getElementById('tProtocol');
  const tDropped = document.getElementById('tDropped');
  const tCompleted = document.getElementById('tCompleted');

  const presetBtns = document.querySelectorAll('.preset-btn');
  const btnDispatch = document.getElementById('btnDispatch');
  const btnBreakdown = document.getElementById('btnBreakdown');
  const btnFlush = document.getElementById('btnFlush');

  /* ─── CANVAS DIMENSIONS ─── */
  let W = 0, H = 0;

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    W = rect.width || 800;
    H = rect.height || 400;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function nodePos(key) {
    const n = NODES[key];
    return { x: n.lx * W, y: n.ly * H };
  }

  /* ─── STATE ─── */
  const S = {
    activePreset: null,
    packets: [],
    explosions: [],
    animId: null,
    dispatched: 0,
    completed: 0,
    dropped: 0,
    running: false,
    autoDispatchId: null,
    linkBroken: null,
    linkFlash: 0,
    lastHop: '--',
    lastLatency: 0,
    frame: 0,
  };

  /* ─── STORAGE ─── */
  const STORAGE_KEY = 'npfv_telemetry';

  function persistTelemetry() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        dispatched: S.dispatched,
        completed: S.completed,
        dropped: S.dropped,
        velocity: velocitySlider.value,
        congestion: congestionSlider.value,
        dropRate: dropRateSlider.value,
        protocol: protocolSelect.value,
      }));
    } catch (_) {}
  }

  function restoreTelemetry() {
    try {
      const d = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!d) return;
      S.dispatched = d.dispatched || 0;
      S.completed = d.completed || 0;
      S.dropped = d.dropped || 0;
      velocitySlider.value = d.velocity || 5;
      congestionSlider.value = d.congestion || 30;
      dropRateSlider.value = d.dropRate || 5;
      protocolSelect.value = d.protocol || 'TCP';
      velValue.textContent = d.velocity || 5;
      congValue.textContent = d.congestion || 30;
      dropValue.textContent = d.dropRate || 5;
    } catch (_) {}
  }

  /* ─── UTILITY ─── */
  function lerp(a, b, t) { return a + t * (b - a); }
  function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function rng16() { return Math.random().toString(16).substr(2, 4); }
  function ts() { const d = new Date(); return d.toTimeString().substr(0, 8); }

  /* ─── PACKET CLASS ─── */
  class Packet {
    constructor(path, speed, dropRate, color) {
      this.path = path;
      this.segment = 0;
      this.t = rand(0, 0.25);
      this.baseSpeed = speed * (0.7 + rand(0, 0.6));
      this.speed = this.baseSpeed;
      this.dropRate = dropRate;
      this.color = color;
      this.size = rand(2.5, 4.5);
      this.alive = true;
      this.dropped = false;
      this.completed = false;
      this.trail = [];
      this.maxTrail = 10;
      this.loggedSegments = new Set();
      this.id = rng16();
      this.updateXY();
    }

    curKey() { return this.path[this.segment]; }
    nxtKey() { return this.path[this.segment + 1]; }

    updateXY() {
      const a = nodePos(this.curKey());
      const b = nodePos(this.nxtKey());
      return { x: lerp(a.x, b.x, this.t), y: lerp(a.y, b.y, this.t) };
    }

    update(congestion) {
      if (!this.alive) return false;

      const dropPct = parseFloat(dropRateSlider.value) / 100;
      if (Math.random() < dropPct * 0.08) {
        this.alive = false;
        this.dropped = true;
        this._deathFrame = S.frame;
        const pos = this.updateXY();
        S.explosions.push(new Explosion(pos.x, pos.y, '#ff1744'));
        addLog(`[DROP] Packet ${this.id} lost at ${this.curKey().toUpperCase()} → ${this.nxtKey().toUpperCase()} — checksum failure`, 'err');
        updateBadge('err', '[ ROUTE_FAILED: DATA_PACKET_DROPPED ]');
        return true;
      }

      const cong = parseFloat(congestion) / 100;
      this.speed = this.baseSpeed * (1 - cong * 0.6);
      const pos = this.updateXY();
      this.trail.push({ x: pos.x, y: pos.y });
      if (this.trail.length > this.maxTrail) this.trail.shift();

      this.t += this.speed * 0.004;
      if (this.t >= 1) {
        this.segment++;
        this.t = 0;
        const segKey = this.curKey() + '->' + this.nxtKey();
        if (!this.loggedSegments.has(segKey)) {
          this.loggedSegments.add(segKey);
          const hop = getHopMsg(segKey, this.path.length - 1);
          if (hop) addLog(hop.text, hop.type);
          S.lastHop = this.curKey().toUpperCase() + ' → ' + this.nxtKey().toUpperCase();
        }
        if (this.segment >= this.path.length - 1) {
          this.alive = false;
          this.completed = true;
          this._deathFrame = S.frame;
          S.completed++;
          S.lastHop = 'COMPLETED';
          addLog(`[ACK] Circuit ${this.id} complete — ${S.dispatched - S.dropped - S.completed + 1} in-flight remaining`, 'ack');
          updateBadge('done', '[ COMPLETED: PACKET_CIRCUIT_CLOSED ]');
          return true;
        }
      }
      this.updateXY();
      return true;
    }

    getXY() { return this.updateXY(); }
  }

  /* ─── EXPLOSION CLASS ─── */
  class Explosion {
    constructor(x, y, color) {
      this.x = x; this.y = y;
      this.color = color;
      this.radius = 4;
      this.maxRadius = 28;
      this.life = 1.0;
      this.debris = [];
      for (let i = 0; i < 10; i++) {
        const a = rand(0, Math.PI * 2);
        const spd = rand(0.8, 2.5);
        this.debris.push({
          x: x, y: y,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd,
          sz: rand(1, 3),
        });
      }
    }

    update() {
      this.radius += 0.6;
      this.life -= 0.025;
      this.debris.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        d.vx *= 0.96; d.vy *= 0.96;
        d.sz *= 0.97;
      });
      return this.life > 0;
    }

    draw() {
      const a = this.life;
      ctx.save();
      ctx.globalAlpha = a;
      /* ring */
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 12;
      ctx.stroke();
      /* debris */
      this.debris.forEach(d => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.sz * a, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 8;
        ctx.fill();
      });
      ctx.restore();
    }
  }

  /* ─── HOP MESSAGE HELPER ─── */
  function getHopMsg(segKey, totalHops) {
    const preset = S.activePreset;
    const proto = protocolSelect.value;
    const msgs = HOP_MESSAGES[preset];
    if (!msgs) return null;
    const tpl = msgs[segKey];
    if (!tpl) {
      const parts = segKey.split('->');
      return { text: `[HOP] ${parts[0].toUpperCase()} → ${parts[1].toUpperCase()} — forwarding packet`, type: 'dbg' };
    }
    let text = tpl.text
      .replace('{{protocol}}', proto)
      .replace('{{ttl}}', Math.floor(64 - totalHops + Math.random() * 5))
      .replace('{{csum}}', rng16())
      .replace('{{size}}', (2 + Math.random() * 6).toFixed(1))
      .replace('{{rows}}', Math.floor(10 + Math.random() * 90))
      .replace('{{tok}}', rng16() + rng16());
    return { text: '[' + (tpl.type === 'syn' ? 'SYN' : 'ACK') + '] ' + text, type: tpl.type };
  }

  /* ─── DISPATCH ─── */
  function dispatchBatch() {
    const preset = S.activePreset;
    if (!preset) { addLog('[SYSTEM] No active preset selected — load a transmission profile', 'warn'); return; }
    const path = PATHS[preset];
    if (!path) return;
    const vel = parseFloat(velocitySlider.value);
    const cong = parseFloat(congestionSlider.value);
    const dropR = parseFloat(dropRateSlider.value);
    const color = PRESET_COLORS[preset];
    const count = Math.max(1, Math.floor(3 + cong / 18));
    for (let i = 0; i < count; i++) {
      S.packets.push(new Packet([...path], vel, dropR, color));
    }
    S.dispatched += count;
    addLog(`[DISPATCH] ${count} packets injected — protocol ${protocolSelect.value} on ${preset} pathway`, 'syn');
    updateBadge('active', '[ TRANSMITTING: PACKETS_IN_FLIGHT ]');
    if (!S.running) startAnimation();
    persistTelemetry();
    updateTelemetry();
  }

  /* ─── ANIMATION ─── */
  function startAnimation() {
    if (S.running) return;
    S.running = true;
    loop();
  }

  function stopAnimation() {
    S.running = false;
    if (S.animId) { cancelAnimationFrame(S.animId); S.animId = null; }
  }

  function loop() {
    if (!S.running) { S.animId = null; return; }
    S.frame++;
    S.linkFlash = Math.max(0, S.linkFlash - 0.02);
    updatePackets();
    drawFrame();
    updateTelemetry();
    S.animId = requestAnimationFrame(loop);
  }

  /* ─── UPDATE PACKETS ─── */
  function updatePackets() {
    const cong = congestionSlider.value;
    /* check link broken: drop packets on the broken segment */
    if (S.linkBroken !== null) {
      S.packets.forEach(p => {
        if (!p.alive) return;
        if (p.segment === S.linkBroken) {
          p.alive = false;
          p.dropped = true;
          S.dropped++;
          const pos = p.getXY();
          S.explosions.push(new Explosion(pos.x, pos.y, '#ff1744'));
        }
      });
    }
    S.packets.forEach(p => p.update(cong));
    /* clean dead packets older than 120 frames (_deathFrame set inside Packet.update) */
    S.packets = S.packets.filter(p => p.alive || S.frame - (p._deathFrame || 0) < 120);

    /* update explosions */
    S.explosions = S.explosions.filter(e => e.update());
  }

  /* ─── CANVAS DRAWING ─── */
  function drawFrame() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    drawLinks();
    drawNodes();
    drawPackets();
    drawExplosions();
  }

  function drawGrid() {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.008)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 50) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 50) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.restore();
  }

  function drawNodes() {
    for (const [key, n] of Object.entries(NODES)) {
      const cx = n.lx * W, cy = n.ly * H;
      const r = n.radius;
      const glowColor = S.linkBroken !== null && keyMatchesBroken(key) ? '#ff1744' : n.color;

      /* outer glow via shadow */
      ctx.save();
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fill();
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      /* inner ring */
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = glowColor;
      ctx.globalAlpha = 0.06 + Math.sin(S.frame * 0.03 + cx * 0.1) * 0.03;
      ctx.fill();
      ctx.restore();

      /* label */
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.font = '600 clamp(8px,0.7vmin,11px) JetBrains Mono,Consolas,monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(n.label, cx, cy + r + 6);
      ctx.restore();
    }
  }

  function keyMatchesBroken(key) {
    if (S.linkBroken === null) return false;
    const p = PATHS[S.activePreset] || [];
    return p[S.linkBroken] === key || p[S.linkBroken + 1] === key;
  }

  function drawLinks() {
    const keys = Object.keys(NODES);
    for (let i = 0; i < keys.length - 1; i++) {
      const a = NODES[keys[i]], b = NODES[keys[i + 1]];
      const ax = a.lx * W, ay = a.ly * H;
      const bx = b.lx * W, by = b.ly * H;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    /* draw active pathway links (segments with active packets) */
    const activeSegs = new Set();
    S.packets.forEach(p => {
      if (p.alive) activeSegs.add(p.curKey() + '-' + p.nxtKey());
    });
    activeSegs.forEach(seg => {
      const [fk, tk] = seg.split('-');
      const fn = NODES[fk], tn = NODES[tk];
      if (!fn || !tn) return;
      const ax = fn.lx * W, ay = fn.ly * H;
      const bx = tn.lx * W, by = tn.ly * H;
      const color = S.activePreset ? PRESET_COLORS[S.activePreset] : '#00e5ff';
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.15 + Math.sin(S.frame * 0.05) * 0.05;
      ctx.lineWidth = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.restore();
    });

    /* broken link overlay */
    if (S.linkBroken !== null) {
      const preset = S.activePreset;
      if (preset) {
        const path = PATHS[preset];
        if (path && path[S.linkBroken] && path[S.linkBroken + 1]) {
          const fn = NODES[path[S.linkBroken]], tn = NODES[path[S.linkBroken + 1]];
          if (fn && tn) {
            const ax = fn.lx * W, ay = fn.ly * H;
            const bx = tn.lx * W, by = tn.ly * H;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.strokeStyle = '#ff1744';
            ctx.globalAlpha = 0.3 + Math.sin(S.frame * 0.1) * 0.2;
            ctx.lineWidth = 3;
            ctx.shadowColor = '#ff1744';
            ctx.shadowBlur = 20;
            ctx.setLineDash([8, 8]);
            ctx.lineDashOffset = -S.frame * 0.5;
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    }
  }

  function drawPackets() {
    S.packets.forEach(p => {
      if (!p.alive) return;
      const pos = p.getXY();
      const color = p.color;
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.shadowBlur = 0;
      /* core highlight */
      ctx.beginPath();
      ctx.arc(pos.x - p.size * 0.2, pos.y - p.size * 0.2, p.size * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fill();
      ctx.restore();

      /* trail */
      if (p.trail.length > 2) {
        ctx.save();
        for (let i = 1; i < p.trail.length; i++) {
          const a = i / p.trail.length;
          ctx.beginPath();
          ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y);
          ctx.lineTo(p.trail[i].x, p.trail[i].y);
          ctx.strokeStyle = color;
          ctx.globalAlpha = a * 0.2;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.restore();
      }
    });
  }

  function drawExplosions() {
    S.explosions.forEach(e => e.draw());
  }

  /* ─── LOG SYSTEM ─── */
  const logQueue = [];
  let logTyping = false;
  let logTimer = null;

  function addLog(text, className) {
    const t = '[' + ts() + '] ' + text;
    logQueue.push({ text: t, className: className || 'info' });
    if (!logTyping) processLogQueue();
  }

  function processLogQueue() {
    if (logQueue.length === 0) { logTyping = false; return; }
    logTyping = true;
    const entry = logQueue.shift();
    const el = document.createElement('div');
    el.className = 'log-msg ' + entry.className;
    logContent.appendChild(el);
    logContent.scrollTop = logContent.scrollHeight;
    let idx = 0;
    logTimer = setInterval(function () {
      if (idx < entry.text.length) {
        el.textContent += entry.text[idx];
        idx++;
        logContent.scrollTop = logContent.scrollHeight;
      } else {
        clearInterval(logTimer);
        logTimer = null;
        const logs = logContent.querySelectorAll('.log-msg');
        if (logs.length > 50) {
          for (let i = 0; i < logs.length - 40; i++) logs[i].remove();
        }
        if (logQueue.length > 0) processLogQueue();
        else logTyping = false;
      }
    }, 12);
  }

  /* ─── TELEMETRY ─── */
  function updateBadge(cls, text) {
    tBadge.className = 'tele-card-badge ' + cls;
    tBadge.textContent = text;
  }

  function updateHealth() {
    const drop = parseFloat(dropRateSlider.value);
    const cong = parseFloat(congestionSlider.value);
    const broken = S.linkBroken !== null;
    if (broken) {
      tHealth.className = 'tele-card-badge err';
      tHealth.textContent = 'LINK FAULT';
      return;
    }
    if (drop >= 25 || cong >= 70) {
      tHealth.className = 'tele-card-badge err';
      tHealth.textContent = 'CRITICAL';
    } else if (drop >= 10 || cong >= 40) {
      tHealth.className = 'tele-card-badge warn';
      tHealth.textContent = 'DEGRADED';
    } else {
      tHealth.className = 'tele-card-badge done';
      tHealth.textContent = 'STABLE';
    }
  }

  function updateTelemetry() {
    tHop.textContent = S.lastHop;
    const vel = parseFloat(velocitySlider.value);
    const pathLen = S.activePreset ? PATHS[S.activePreset].length : 4;
    const latency = Math.round((pathLen * 12 / vel + parseFloat(congestionSlider.value) * 0.3) * 10 + rand(0, 5));
    S.lastLatency = latency;
    tLatency.innerHTML = latency + ' <span class="tele-unit">ms</span>';
    tPackets.textContent = S.dispatched;
    tProtocol.textContent = protocolSelect.value;
    tDropped.textContent = S.dropped;
    tCompleted.textContent = S.completed;
    updateHealth();
    /* auto badge updates when no packet events */
    const activeAlive = S.packets.filter(p => p.alive).length;
    if (activeAlive > 0) {
      if (tBadge.textContent.indexOf('FAILED') === -1 && tBadge.textContent.indexOf('COMPLETED') === -1) {
        updateBadge('active', '[ TRANSMITTING: ' + activeAlive + '_PACKETS_IN_FLIGHT ]');
      }
    }
    logStatus.textContent = activeAlive > 0 ? 'ACTIVE: ' + activeAlive + ' PKTS' : 'STANDBY';
    logStatus.className = 'log-status' + (activeAlive > 0 ? ' active' : '');
  }

  /* ─── PRESETS ─── */
  function setPreset(preset) {
    S.activePreset = preset;
    S.lastHop = 'HOP 0 — INIT';
    presetBtns.forEach(b => {
      b.className = 'preset-btn';
      if (b.dataset.preset === preset) b.classList.add(PRESET_CLASSES[preset]);
    });
    addLog('[PROFILE] ' + preset + ' pathway loaded — ' + PATHS[preset].join(' → ').toUpperCase(), 'info');
    updateBadge('standby', '[ CONFIGURED: AWAITING_DISPATCH ]');
    updateTelemetry();
  }

  /* ─── LINK BREAKDOWN ─── */
  function triggerBreakdown() {
    if (!S.activePreset) { addLog('[SYSTEM] No active transmission path — cannot sever', 'warn'); return; }
    const path = PATHS[S.activePreset];
    if (!path || path.length < 2) return;
    const idx = Math.floor(Math.random() * (path.length - 1));
    S.linkBroken = idx;
    S.linkFlash = 1.0;
    const from = path[idx].toUpperCase(), to = path[idx + 1].toUpperCase();
    addLog('[LINK FAIL] Connection severed: ' + from + ' ↔ ' + to + ' — carrier signal lost', 'err');
    addLog('[ALERT] ' + S.packets.filter(p => p.alive && p.segment === idx).length + ' packets stranded on broken segment', 'err');
    updateBadge('err', '[ LINK_BREAK: SEGMENT_' + from + '_TO_' + to + '_DOWN ]');
    /* auto-restore after 3s */
    if (S._restoreTimer) clearTimeout(S._restoreTimer);
    S._restoreTimer = setTimeout(function () {
      S.linkBroken = null;
      addLog('[RECOVERY] Link re-established — BGP convergence complete', 'ack');
      updateBadge('done', '[ RECOVERED: LINK_RESTORED ]');
      updateTelemetry();
    }, 3000);
    persistTelemetry();
  }

  /* ─── FLUSH ─── */
  function flushAll() {
    stopAnimation();
    if (S.autoDispatchId) { clearInterval(S.autoDispatchId); S.autoDispatchId = null; }
    if (S._restoreTimer) { clearTimeout(S._restoreTimer); S._restoreTimer = null; }
    if (logTimer) { clearInterval(logTimer); logTimer = null; }
    S.packets = [];
    S.explosions = [];
    S.dispatched = 0;
    S.completed = 0;
    S.dropped = 0;
    S.lastHop = '--';
    S.lastLatency = 0;
    S.linkBroken = null;
    S.linkFlash = 0;
    S.running = false;
    S.activePreset = null;
    logQueue.length = 0;
    logTyping = false;
    logContent.innerHTML = '<div class="log-msg log-placeholder">[ SYSTEM ] — Visualizer channels flushed. Matrices re-zeroed.</div>';
    presetBtns.forEach(b => b.className = 'preset-btn');
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    drawLinks();
    drawNodes();
    updateBadge('standby', 'STANDBY');
    tHop.textContent = '--';
    tLatency.innerHTML = '-- <span class="tele-unit">ms</span>';
    tPackets.textContent = '0';
    tDropped.textContent = '0';
    tCompleted.textContent = '0';
    logStatus.textContent = 'STANDBY';
    logStatus.className = 'log-status';
    updateHealth();
    persistTelemetry();
  }

  /* ─── AUTO-DISPATCH ─── */
  function startAutoDispatch() {
    if (S.autoDispatchId) clearInterval(S.autoDispatchId);
    const cong = parseFloat(congestionSlider.value);
    const interval = Math.max(400, 2000 - cong * 16);
    S.autoDispatchId = setInterval(function () {
      if (S.activePreset) dispatchBatch();
    }, interval);
  }

  function stopAutoDispatch() {
    if (S.autoDispatchId) { clearInterval(S.autoDispatchId); S.autoDispatchId = null; }
  }

  /* ─── EVENT BINDING ─── */
  presetBtns.forEach(b => {
    b.addEventListener('click', function () {
      const preset = this.dataset.preset;
      setPreset(preset);
      if (parseFloat(congestionSlider.value) > 0) startAutoDispatch();
      if (!S.running && S.packets.length > 0) startAnimation();
    });
  });

  velocitySlider.addEventListener('input', function () {
    velValue.textContent = this.value;
    persistTelemetry();
  });

  congestionSlider.addEventListener('input', function () {
    congValue.textContent = this.value;
    if (S.activePreset) {
      stopAutoDispatch();
      if (parseFloat(this.value) > 0) startAutoDispatch();
    }
    updateTelemetry();
    persistTelemetry();
  });

  dropRateSlider.addEventListener('input', function () {
    dropValue.textContent = this.value;
    updateTelemetry();
    persistTelemetry();
  });

  protocolSelect.addEventListener('change', function () {
    tProtocol.textContent = this.value;
    addLog('[PROTOCOL] Switching to ' + this.value + ' — connection reset', 'info');
    persistTelemetry();
  });

  btnDispatch.addEventListener('click', function () {
    if (!S.activePreset) { addLog('[SYSTEM] Select a preset before dispatching', 'warn'); return; }
    dispatchBatch();
    if (!S.running) startAnimation();
  });

  btnBreakdown.addEventListener('click', triggerBreakdown);
  btnFlush.addEventListener('click', flushAll);

  /* ─── CANVAS RESIZE ─── */
  window.addEventListener('resize', resizeCanvas);

  /* ─── INIT ─── */
  function init() {
    restoreTelemetry();
    resizeCanvas();
    drawFrame();
    addLog('[SYSTEM] Network Packet Flow Visualizer v2.4.1 initialized', 'info');
    addLog('[SYSTEM] Select a transmission preset and dispatch payload', 'info');
    updateBadge('standby', 'STANDBY');
    updateTelemetry();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
