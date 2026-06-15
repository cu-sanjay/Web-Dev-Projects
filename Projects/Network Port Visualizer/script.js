(function() {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const PORT_DB = [
    { port: 21,  name: 'FTP',      proto: 'TCP', desc: 'File Transfer Protocol — plain-text file transfer', secure: false, traffic: 'TCP' },
    { port: 22,  name: 'SSH',      proto: 'TCP', desc: 'Secure Shell — encrypted remote administration', secure: true, traffic: 'TCP' },
    { port: 23,  name: 'Telnet',   proto: 'TCP', desc: 'Telnet — unencrypted remote terminal', secure: false, traffic: 'TCP' },
    { port: 25,  name: 'SMTP',     proto: 'TCP', desc: 'Simple Mail Transfer Protocol — email delivery', secure: false, traffic: 'TCP' },
    { port: 53,  name: 'DNS',      proto: 'UDP', desc: 'Domain Name System — resolves hostnames to IPs', secure: false, traffic: 'UDP' },
    { port: 80,  name: 'HTTP',     proto: 'TCP', desc: 'HyperText Transfer Protocol — unencrypted web', secure: false, traffic: 'TCP' },
    { port: 110, name: 'POP3',     proto: 'TCP', desc: 'Post Office Protocol v3 — email retrieval', secure: false, traffic: 'TCP' },
    { port: 143, name: 'IMAP',     proto: 'TCP', desc: 'Internet Message Access Protocol — email sync', secure: false, traffic: 'TCP' },
    { port: 443, name: 'HTTPS',    proto: 'TCP', desc: 'HyperText Transfer Protocol Secure — encrypted web traffic over TLS', secure: true, traffic: 'TCP' },
    { port: 3306,name: 'MySQL',    proto: 'TCP', desc: 'MySQL database server — relational database', secure: false, traffic: 'TCP' },
    { port: 5432,name: 'PostgreSQL',proto:'TCP', desc: 'PostgreSQL database server — advanced relational database', secure: false, traffic: 'TCP' },
    { port: 6379,name: 'Redis',    proto: 'TCP', desc: 'Redis key-value store — in-memory data structure server', secure: false, traffic: 'TCP' },
    { port: 8080,name: 'HTTP-ALT', proto: 'TCP', desc: 'Alternative HTTP port — often used for proxies or dev servers', secure: false, traffic: 'TCP' },
    { port: 8443,name: 'HTTPS-ALT',proto: 'TCP', desc: 'Alternative HTTPS — commonly used for secure web admin consoles', secure: true, traffic: 'TCP' },
    { port: 27017,name: 'MongoDB', proto: 'TCP', desc: 'MongoDB database server — NoSQL document database', secure: false, traffic: 'TCP' }
  ];

  const portNumber = $('#portNumber');
  const portRange = $('#portRange');
  const transportSelect = $('#transportSelect');
  const fwToggle = $('#fwToggle');
  const portName = $('#portName');
  const portDesc = $('#portDesc');
  const canvas = $('#packetCanvas');
  const ctx = canvas.getContext('2d');
  const logConsole = $('#logConsole');
  const tClass = $('#tClass');
  const tAlias = $('#tAlias');
  const tVuln = $('#tVuln');
  const tEncrypt = $('#tEncrypt');
  const tBadge = $('#tBadge');
  const errorDetail = $('#errorDetail');
  const btnConnect = $('#btnConnect');
  const btnScan = $('#btnScan');
  const btnFlush = $('#btnFlush');
  const portBtns = $$('.port-btn');

  let firewallMode = 'allow';
  let animFrame = null;
  let packets = [];
  let explosions = [];
  let clientX, clientY, serverX, serverY;
  const NODE_RADIUS = 20;

  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }

  function lookupPort(num) {
    return PORT_DB.find(p => p.port === num);
  }

  function getPortClass(num) {
    if (num >= 0 && num <= 1023) return 'WELL-KNOWN (0-1023)';
    if (num >= 1024 && num <= 49151) return 'REGISTERED (1024-49151)';
    return 'DYNAMIC/PRIVATE (49152-65535)';
  }

  function updatePortInfo() {
    const num = parseInt(portNumber.value);
    const entry = lookupPort(num);
    portName.textContent = entry ? entry.name : 'UNASSIGNED / UNKNOWN';
    portDesc.textContent = entry ? entry.desc : 'No registry entry found for port ' + num;
    updateTelemetry(num, entry);
  }

  function updateTelemetry(num, entry) {
    tClass.textContent = getPortClass(num);
    if (entry) {
      tAlias.textContent = entry.name;
      tEncrypt.textContent = entry.secure ? 'ENCRYPTED / SECURE' : 'PLAINTEXT / RISK';
      tEncrypt.style.color = entry.secure ? '#33cc66' : '#ffc800';
    } else {
      tAlias.textContent = '--';
      tEncrypt.textContent = 'UNKNOWN';
      tEncrypt.style.color = '#ff3b30';
    }
    if (entry && entry.secure && firewallMode === 'allow') {
      tVuln.textContent = '12%';
      tVuln.style.color = '#33cc66';
      tBadge.className = 'tele-badge secure';
      tBadge.textContent = '[ OPERATIONAL: SECURE CHANNEL ACTIVE ]';
    } else if (entry && !entry.secure && firewallMode === 'allow') {
      tVuln.textContent = '78%';
      tVuln.style.color = '#ffc800';
      tBadge.className = 'tele-badge risk';
      tBadge.textContent = '[ OPERATIONAL: PLAINTEXT - VULNERABLE ]';
    } else if (firewallMode === 'block') {
      tVuln.textContent = '4%';
      tVuln.style.color = '#33cc66';
      tBadge.className = 'tele-badge active';
      tBadge.textContent = '[ OPERATIONAL: FIREWALL BLOCKING ALL TRAFFIC ]';
    } else {
      tVuln.textContent = '--';
      tVuln.style.color = '';
      tBadge.className = 'tele-badge standby';
      tBadge.textContent = 'STANDBY';
    }
  }

  function log(msg, cls) {
    const line = document.createElement('div');
    line.className = 'log-line ' + (cls || '');
    line.textContent = msg;
    logConsole.appendChild(line);
    logConsole.scrollTop = logConsole.scrollHeight;
  }

  function clearLog() {
    logConsole.innerHTML = '<div class="log-line dim">[IDLE] Awaiting connection parameters...</div>';
  }

  function drawNodes() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    clientX = w * 0.15;
    clientY = h * 0.5;
    serverX = w * 0.85;
    serverY = h * 0.5;

    ctx.beginPath();
    ctx.moveTo(clientX, clientY);
    ctx.lineTo(serverX, serverY);
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(clientX, clientY, NODE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,229,255,0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,229,255,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(0,229,255,0.3)';
    ctx.textAlign = 'center';
    ctx.fillText('CLIENT', clientX, clientY + NODE_RADIUS + 14);

    ctx.beginPath();
    ctx.arc(serverX, serverY, NODE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,229,255,0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,229,255,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,229,255,0.3)';
    ctx.fillText('SERVER:' + portNumber.value, serverX, serverY + NODE_RADIUS + 14);
  }

  function createPacket(fromX, fromY, toX, toY, blocked) {
    return {
      x: fromX, y: fromY, fromX: fromX, fromY: fromY,
      toX: toX, toY: toY, progress: 0,
      speed: 0.006 + Math.random() * 0.004,
      blocked: blocked, alive: true, radius: 4 + Math.random() * 2
    };
  }

  function createExplosion(x, y) {
    const particles = [];
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      particles.push({ x: x, y: y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, decay: 0.01 + Math.random() * 0.02 });
    }
    return particles;
  }

  function updatePackets() {
    packets.forEach(p => {
      if (!p.alive) return;
      p.progress += p.speed;
      if (p.blocked && p.progress > 0.45 && p.progress < 0.55) {
        p.alive = false;
        const mx = p.fromX + (p.toX - p.fromX) * 0.5;
        const my = p.fromY + (p.toY - p.fromY) * 0.5;
        explosions.push({ particles: createExplosion(mx, my), frame: 0 });
        log('!!! FIREWALL INTERCEPT - Packet blocked on port ' + portNumber.value, 'red');
        return;
      }
      if (p.progress >= 1) {
        p.alive = false;
        if (!p.blocked) log('[SYN-ACK] Handshake complete - connection established on port ' + portNumber.value, 'green');
      }
    });
    explosions.forEach(exp => {
      exp.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= p.decay; });
      exp.frame++;
    });
    explosions = explosions.filter(exp => exp.particles.some(p => p.life > 0));
  }

  function drawPackets() {
    packets.forEach(p => {
      if (!p.alive) return;
      const x = p.fromX + (p.toX - p.fromX) * p.progress;
      const y = p.fromY + (p.toY - p.fromY) * p.progress;
      const color = p.blocked ? '#ff3b30' : (p.progress < 0.33 ? '#ffc800' : p.progress < 0.66 ? '#00e5ff' : '#33cc66');
      ctx.beginPath();
      ctx.arc(x, y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = '8px monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.textAlign = 'center';
      ctx.fillText(p.progress < 0.5 ? '[SYN]' : '[ACK]', x, y - p.radius - 4);
    });
    explosions.forEach(exp => {
      exp.particles.forEach(p => {
        if (p.life <= 0) return;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,59,48,' + p.life + ')';
        ctx.shadowColor = '#ff3b30';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    });
  }

  function animate() {
    drawNodes();
    updatePackets();
    drawPackets();
    animFrame = requestAnimationFrame(animate);
  }

  function connect() {
    const num = parseInt(portNumber.value);
    if (num < 0 || num > 65535) {
      errorDetail.className = 'error-detail active';
      errorDetail.textContent = 'PORT OUT OF RANGE - valid range: 0-65535';
      return;
    }
    errorDetail.className = 'error-detail';
    errorDetail.textContent = '';
    const entry = lookupPort(num);
    const fw = firewallMode;
    log('[CONFIG] Port ' + num + ' | ' + transportSelect.value + ' | Firewall: ' + fw.toUpperCase(), 'cyan');
    log('[SYN] Sending SYN packet to ' + (entry ? entry.name : 'port ' + num) + '...', 'cyan');
    const blocked = fw === 'block';
    for (let i = 0; i < 3; i++) {
      setTimeout(() => { packets.push(createPacket(clientX, clientY, serverX, serverY, blocked)); }, i * 200);
    }
    if (!blocked) log('[SYN-ACK] Waiting for response from ' + num + '...', 'cyan');
    else log('[FIREWALL] Rule ACTIVE - packets will be intercepted', 'amber');
    updateTelemetry(num, entry);
  }

  function scan() {
    const num = Math.floor(Math.random() * 65536);
    portNumber.value = num;
    portRange.value = num;
    updatePortInfo();
    log('[SCAN] Probing random port ' + num + '...', 'amber');
    const entry = lookupPort(num);
    if (entry) log('[SCAN] Identified: ' + entry.name + ' (' + entry.desc + ')', entry.secure ? 'green' : 'amber');
    else log('[SCAN] Port ' + num + ' - no registry match', 'amber');
    connect();
  }

  function flushAll() {
    if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
    packets = [];
    explosions = [];
    portNumber.value = 443;
    portRange.value = 443;
    transportSelect.value = 'TCP';
    firewallMode = 'allow';
    $$('.fw-option').forEach(o => o.classList.toggle('active', o.dataset.fw === 'allow'));
    updatePortInfo();
    clearLog();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawNodes();
    tBadge.className = 'tele-badge standby';
    tBadge.textContent = 'STANDBY';
    errorDetail.className = 'error-detail';
    errorDetail.textContent = '';
    log('[IDLE] Port cache flushed - all channels cleared.', 'dim');
  }

  portNumber.addEventListener('input', () => { portRange.value = portNumber.value; updatePortInfo(); });
  portRange.addEventListener('input', () => { portNumber.value = portRange.value; updatePortInfo(); });
  fwToggle.addEventListener('click', (e) => {
    const opt = e.target.closest('.fw-option');
    if (!opt) return;
    $$('.fw-option').forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    firewallMode = opt.dataset.fw;
    updatePortInfo();
  });
  portBtns.forEach(btn => {
    btn.addEventListener('click', () => { portNumber.value = btn.dataset.port; portRange.value = btn.dataset.port; updatePortInfo(); });
  });
  btnConnect.addEventListener('click', connect);
  btnScan.addEventListener('click', scan);
  btnFlush.addEventListener('click', flushAll);

  function init() {
    resizeCanvas();
    drawNodes();
    updatePortInfo();
    if (!animFrame) animate();
  }

  window.addEventListener('resize', () => { resizeCanvas(); drawNodes(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
