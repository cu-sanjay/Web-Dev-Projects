(function() {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const canvas = $('#mainCanvas');
  const ctx = canvas.getContext('2d');
  const sliderDuration = $('#sliderDuration');
  const sliderPace = $('#sliderPace');
  const selectLayer = $('#selectLayer');
  const sliderGain = $('#sliderGain');
  const valDuration = $('#valDuration');
  const valPace = $('#valPace');
  const valGain = $('#valGain');
  const topBadge = $('#topBadge');
  const stateVal = $('#stateVal');
  const phaseVal = $('#phaseVal');
  const cycleVal = $('#cycleVal');
  const btnStart = $('#btnStart');
  const btnPause = $('#btnPause');
  const btnPurge = $('#btnPurge');
  const toastContainer = $('#toastContainer');
  const presetBtns = $$('.preset-btn');

  /* ─── STATE ─── */
  const state = {
    running: false,
    paused: false,
    duration: 20,
    pace: 4,
    layer: 'rain',
    gain: 0.4,
    elapsed: 0,
    cycleCount: 0,
    phase: 0,
    breathText: 'READY'
  };

  let animId = null;
  let audioCtx = null;
  let masterGain = null;
  let analyser = null;
  let noiseNode = null;
  let oscNodes = [];
  let isAudioInit = false;
  let sessionStart = 0;
  let pauseOffset = 0;

  /* ─── PRESETS ─── */
  const PRESETS = {
    zen:  { duration: 20, pace: 4,  layer: 'drone', gain: 30, label: 'Zen Deep Focus' },
    box:  { duration: 10, pace: 4,  layer: 'rain',  gain: 40, label: 'Box Breathing Training' },
    cosmic: { duration: 30, pace: 6,  layer: 'ocean', gain: 25, label: 'Cosmic Transcendence' }
  };

  /* ─── DOM EVENTS ─── */
  sliderDuration.addEventListener('input', function() {
    valDuration.textContent = this.value;
    state.duration = +this.value;
    if (!state.running) syncClock();
  });

  sliderPace.addEventListener('input', function() {
    valPace.textContent = this.value;
    state.pace = +this.value;
  });

  sliderGain.addEventListener('input', function() {
    valGain.textContent = this.value;
    state.gain = this.value / 100;
    if (masterGain) masterGain.gain.setTargetAtTime(state.gain, audioCtx.currentTime, 0.1);
  });

  selectLayer.addEventListener('change', function() {
    state.layer = this.value;
    if (state.running && !state.paused) {
      rebuildAudio();
    }
  });

  presetBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      presetBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const p = PRESETS[this.dataset.preset];
      if (!p) return;
      sliderDuration.value = p.duration;
      valDuration.textContent = p.duration;
      state.duration = p.duration;
      sliderPace.value = p.pace;
      valPace.textContent = p.pace;
      state.pace = p.pace;
      sliderGain.value = p.gain;
      valGain.textContent = p.gain;
      state.gain = p.gain / 100;
      selectLayer.value = p.layer;
      state.layer = p.layer;
      if (masterGain) masterGain.gain.setTargetAtTime(state.gain, audioCtx ? audioCtx.currentTime : 0, 0.1);
      if (state.running && !state.paused) rebuildAudio();
      syncClock();
      showToast('[PRESET] Loaded: ' + p.label, '#7c4dff');
    });
  });

  /* ─── AUDIO ENGINE ─── */
  function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = state.gain;
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.8;
    masterGain.connect(analyser);
    analyser.connect(audioCtx.destination);
    isAudioInit = true;
  }

  function buildNoise(type, gainVal) {
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'pink') {
        data[i] = pinkFromWhite(i, white);
      } else {
        data[i] = white;
      }
    }
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = audioCtx.createGain();
    gain.gain.value = gainVal;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = type === 'pink' ? 800 : 2000;
    filter.Q.value = 0.7;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    source.start();
    return { source, gain, filter };
  }

  let _pinkState = 0;
  function pinkFromWhite(i, white) {
    _pinkState = _pinkState + (white - _pinkState) * 0.02;
    return _pinkState * 0.5;
  }

  function buildOscillator(freq, type, gainVal, detune) {
    const osc = audioCtx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    if (detune) osc.detune.value = detune;
    const gain = audioCtx.createGain();
    gain.gain.value = gainVal;
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    return { osc, gain };
  }

  function buildRain() {
    const n = buildNoise('white', 0.35);
    const lp = audioCtx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 3000;
    n.source.disconnect(n.filter);
    n.source.connect(lp);
    lp.connect(n.gain);
    return { nodes: [n], cleanup: () => { try { n.source.stop(); n.source.disconnect(); n.gain.disconnect(); n.filter.disconnect(); lp.disconnect(); } catch(_) {} }};
  }

  function buildDrone() {
    const o1 = buildOscillator(110, 'sine', 0.25);
    const o2 = buildOscillator(112, 'sine', 0.25);
    const sub1 = buildOscillator(55, 'sine', 0.08, 0);
    const sub2 = buildOscillator(56, 'sine', 0.08, 0);
    const lfo = audioCtx.createOscillator();
    lfo.frequency.value = 0.05;
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 15;
    lfo.connect(lfoGain);
    lfoGain.connect(o1.osc.frequency);
    lfoGain.connect(o2.osc.frequency);
    lfo.start();
    return {
      nodes: [o1, o2, sub1, sub2, lfo],
      cleanup: () => {
        try {
          [o1, o2, sub1, sub2].forEach(n => { n.osc.stop(); n.osc.disconnect(); n.gain.disconnect(); });
          lfo.stop(); lfo.disconnect(); lfoGain.disconnect();
        } catch(_) {}
      }
    };
  }

  function buildOcean() {
    const o1 = buildOscillator(80, 'sine', 0.15);
    const o2 = buildOscillator(82, 'sine', 0.15);
    const n = buildNoise('pink', 0.12);
    const lfo = audioCtx.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 20;
    lfo.connect(lfoGain);
    lfoGain.connect(o1.osc.frequency);
    lfoGain.connect(o2.osc.frequency);
    lfo.start();

    const mod = audioCtx.createOscillator();
    mod.frequency.value = 0.03;
    const modGain = audioCtx.createGain();
    modGain.gain.value = 0.08;
    mod.connect(modGain);
    modGain.connect(n.gain.gain);
    mod.start();

    return {
      nodes: [o1, o2, n, lfo, mod],
      cleanup: () => {
        try {
          [o1, o2].forEach(n => { n.osc.stop(); n.osc.disconnect(); n.gain.disconnect(); });
          n.source.stop(); n.source.disconnect(); n.gain.disconnect(); n.filter.disconnect();
          lfo.stop(); lfo.disconnect(); lfoGain.disconnect();
          mod.stop(); mod.disconnect(); modGain.disconnect();
        } catch(_) {}
      }
    };
  }

  const LAYER_BUILDERS = { rain: buildRain, drone: buildDrone, ocean: buildOcean };
  let activeLayer = null;

  function buildAudioLayer() {
    const builder = LAYER_BUILDERS[state.layer];
    if (!builder) return null;
    return builder();
  }

  function rebuildAudio() {
    if (activeLayer) { activeLayer.cleanup(); activeLayer = null; }
    if (!state.running || state.paused) return;
    activeLayer = buildAudioLayer();
  }

  function startAudio() {
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    if (!activeLayer) activeLayer = buildAudioLayer();
  }

  function stopAudio() {
    if (activeLayer) { activeLayer.cleanup(); activeLayer = null; }
    if (audioCtx) { audioCtx.suspend(); }
  }

  function muteAll() {
    if (activeLayer) { activeLayer.cleanup(); activeLayer = null; }
    if (audioCtx) { audioCtx.close(); audioCtx = null; }
    isAudioInit = false;
    masterGain = null;
    analyser = null;
    oscNodes = [];
  }

  /* ─── TIMER ─── */
  function syncClock() {
    const remaining = Math.max(0, state.duration * 60 - state.elapsed);
    const min = Math.floor(remaining / 60);
    const sec = Math.floor(remaining % 60);
    stateVal.textContent = min.toString().padStart(2, '0') + ':' + sec.toString().padStart(2, '0');
  }

  /* ─── SESSION ─── */
  function startSession() {
    if (state.running && !state.paused) { showToast('[INFO] Session already active', '#ffb800'); return; }
    if (state.paused) {
      resumeSession();
      return;
    }
    state.running = true;
    state.paused = false;
    state.elapsed = 0;
    state.cycleCount = 0;
    sessionStart = performance.now();
    pauseOffset = 0;
    topBadge.textContent = 'ACTIVE';
    topBadge.style.color = '#00e5ff';
    topBadge.style.borderColor = 'rgba(0,229,255,0.35)';
    btnStart.textContent = '● Session Active';
    startAudio();
    showToast('[START] Meditation session initiated', '#00e5ff');
  }

  function pauseSession() {
    if (!state.running) { showToast('[WARN] No active session to pause', '#ffb800'); return; }
    if (state.paused) { resumeSession(); return; }
    state.paused = true;
    pauseOffset = state.elapsed;
    topBadge.textContent = 'PAUSED';
    topBadge.style.color = '#ffb800';
    topBadge.style.borderColor = 'rgba(255,184,0,0.35)';
    btnStart.textContent = '▶ Resume Session';
    if (audioCtx) audioCtx.suspend();
    showToast('[PAUSE] Respiration loop paused', '#ffb800');
  }

  function resumeSession() {
    if (!state.running || !state.paused) return;
    state.paused = false;
    sessionStart = performance.now();
    topBadge.textContent = 'ACTIVE';
    topBadge.style.color = '#00e5ff';
    topBadge.style.borderColor = 'rgba(0,229,255,0.35)';
    btnStart.textContent = '● Session Active';
    if (audioCtx) audioCtx.resume();
    showToast('[RESUME] Session continued', '#00e5ff');
  }

  function purgeAll() {
    state.running = false;
    state.paused = false;
    state.elapsed = 0;
    state.cycleCount = 0;
    state.phase = 0;
    state.breathText = 'READY';
    pauseOffset = 0;
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    muteAll();
    topBadge.textContent = 'STANDBY';
    topBadge.style.color = '#7c4dff';
    topBadge.style.borderColor = 'rgba(124,77,255,0.25)';
    btnStart.textContent = 'Initiate Meditation Session';
    stateVal.textContent = 'READY';
    phaseVal.textContent = '--';
    cycleVal.textContent = '0';
    renderFrame();
    showToast('[PURGE] Workspace cleared — audio muted', '#8892a8');
  }

  /* ─── CANVAS SETUP ─── */
  function resizeCanvas() {
    const wrap = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth || 320;
    const h = Math.max(300, Math.min(500, w * 0.9));
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    canvas._w = w;
    canvas._h = h;
  }

  /* ─── SPECTRUM ─── */
  let freqData = new Uint8Array(64);
  function getSpectrum() {
    if (!analyser) return;
    try { analyser.getByteFrequencyData(freqData); } catch(_) {}
  }

  function drawSpectrum(cx, cy, radius, time) {
    if (!analyser) return;
    const bins = freqData.length;
    const barW = (Math.PI * 2) / bins;
    const maxH = radius * 0.25;

    for (let i = 0; i < bins; i++) {
      const val = freqData[i] / 255;
      if (val < 0.01) continue;
      const angle = i * barW - Math.PI / 2;
      const h = 3 + val * maxH;
      const x0 = cx + Math.cos(angle) * (radius - 2);
      const y0 = cy + Math.sin(angle) * (radius - 2);
      const x1 = cx + Math.cos(angle) * (radius - 2 + h);
      const y1 = cy + Math.sin(angle) * (radius - 2 + h);

      const hue = 220 + val * 60 + Math.sin(time * 0.02 + i * 0.3) * 20;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${0.15 + val * 0.35})`;
      ctx.lineWidth = Math.max(1, 2 + val * 3);
      ctx.stroke();
    }
  }

  /* ─── BREATHING RING ─── */
  function updateBreath(dt) {
    if (!state.running || state.paused) return;

    state.elapsed = pauseOffset + (performance.now() - sessionStart) / 1000;

    const totalSec = state.duration * 60;
    if (state.elapsed >= totalSec) {
      endSession();
      return;
    }

    const cycleSec = state.pace * 3;
    const rawPhase = (state.elapsed % cycleSec) / cycleSec;

    let r;
    if (rawPhase < 0.42) {
      const p = rawPhase / 0.42;
      r = 0.5 + 0.5 * Math.sin(p * Math.PI - Math.PI / 2);
      state.breathText = 'INHALE';
    } else if (rawPhase < 0.54) {
      r = 1;
      state.breathText = 'HOLD';
    } else if (rawPhase < 0.92) {
      const p = (rawPhase - 0.54) / 0.38;
      r = 0.5 + 0.5 * Math.sin((1 - p) * Math.PI); // reversing the sin curve
      state.breathText = 'EXHALE';
    } else {
      const p = (rawPhase - 0.92) / 0.08;
      r = 0.5 + 0.5 * Math.sin(p * Math.PI - Math.PI / 2);
      state.breathText = 'HOLD';
    }

    state.phase = rawPhase;

    if (rawPhase < 0.02) state.cycleCount++;

    phaseVal.textContent = state.breathText;
    cycleVal.textContent = state.cycleCount;
    syncClock();
  }

  function endSession() {
    state.running = false;
    state.paused = false;
    state.elapsed = 0;
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    stopAudio();
    topBadge.textContent = 'COMPLETE';
    topBadge.style.color = '#00e676';
    topBadge.style.borderColor = 'rgba(0,230,118,0.35)';
    btnStart.textContent = 'Initiate Meditation Session';
    stateVal.textContent = 'DONE';
    showToast('[COMPLETE] Session finished — ' + state.cycleCount + ' cycles', '#00e676');
    renderFrame();
  }

  /* ─── RENDER ─── */
  function renderFrame() {
    const w = canvas._w;
    const h = canvas._h;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const outerR = Math.min(cx, cy) * 0.7;
    const ringW = Math.max(18, outerR * 0.25);

    const fillPct = state.running
      ? (0.5 + 0.5 * Math.sin(state.phase * Math.PI * 2 - Math.PI / 2))
      : 0;

    const R_base = outerR - ringW * 0.5;
    const A = ringW * 0.45;
    const ringR = state.running ? R_base + A * (0.5 + 0.5 * Math.sin(state.phase * Math.PI * 2 - Math.PI / 2)) : R_base;

    /* outer glow */
    const grad = ctx.createRadialGradient(cx, cy, ringR - ringW * 0.3, cx, cy, ringR + ringW * 0.7);
    grad.addColorStop(0, 'rgba(124,77,255,0)');
    grad.addColorStop(0.4, `rgba(124,77,255,${state.running ? 0.06 : 0.02})`);
    grad.addColorStop(1, 'rgba(124,77,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    /* spectrum ring */
    if (state.running && analyser) {
      getSpectrum();
      drawSpectrum(cx, cy, outerR + 6, performance.now());
    }

    /* ring background */
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = ringW * 1.1;
    ctx.stroke();

    /* active ring with gradient */
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    const ringGrad = ctx.createConicGradient(0, cx, cy);
    ringGrad.addColorStop(0, `rgba(124,77,255,${state.running ? 0.5 : 0.1})`);
    ringGrad.addColorStop(0.3, `rgba(0,229,255,${state.running ? 0.6 : 0.1})`);
    ringGrad.addColorStop(0.5, `rgba(124,77,255,${state.running ? 0.5 : 0.1})`);
    ringGrad.addColorStop(0.8, `rgba(0,229,255,${state.running ? 0.6 : 0.1})`);
    ringGrad.addColorStop(1, `rgba(124,77,255,${state.running ? 0.5 : 0.1})`);
    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = ringW;
    ctx.stroke();

    /* inner glow ring */
    ctx.beginPath();
    ctx.arc(cx, cy, ringR - ringW * 0.3, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(124,77,255,${state.running ? 0.08 : 0.02})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    /* outer glow line */
    ctx.beginPath();
    ctx.arc(cx, cy, ringR + ringW * 0.3, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0,229,255,${state.running ? 0.06 : 0.02})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    /* center text */
    const text = state.breathText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    /* glow under text */
    ctx.shadowColor = state.running
      ? (state.breathText === 'INHALE' ? 'rgba(0,229,255,0.3)' :
         state.breathText === 'EXHALE' ? 'rgba(255,23,68,0.3)' :
         state.breathText === 'HOLD' ? 'rgba(0,230,118,0.3)' : 'rgba(124,77,255,0.3)')
      : 'rgba(124,77,255,0.1)';
    ctx.shadowBlur = 20;

    const fontSize = Math.max(18, Math.min(42, ringR * 0.32));
    ctx.font = `600 ${fontSize}px "JetBrains Mono", monospace`;

    const textColor = state.running
      ? (state.breathText === 'INHALE' ? '#00e5ff' :
         state.breathText === 'EXHALE' ? '#ff1744' :
         state.breathText === 'HOLD' ? '#00e676' : '#7c4dff')
      : '#4a5268';
    ctx.fillStyle = textColor;
    ctx.fillText(text, cx, cy);

    ctx.shadowBlur = 0;

    /* timer below */
    ctx.font = `500 ${fontSize * 0.35}px "JetBrains Mono", monospace`;
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillText(stateVal.textContent, cx, cy + ringR * 0.7);

    /* corner markers */
    ctx.font = '5px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillText('MEDITATION v1.0', 6, h - 4);
  }



  /* ─── ANIMATION LOOP ─── */
  function loop(time) {
    if (state.running && !state.paused) {
      updateBreath(time);
    }
    renderFrame();
    animId = requestAnimationFrame(loop);
  }

  /* ─── EVENTS ─── */
  btnStart.addEventListener('click', startSession);
  btnPause.addEventListener('click', pauseSession);
  btnPurge.addEventListener('click', purgeAll);

  window.addEventListener('resize', () => { resizeCanvas(); });

  /* ─── TOASTS ─── */
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
    btnStart.textContent = 'Initiate Meditation Session';
    stateVal.textContent = 'READY';
    phaseVal.textContent = '--';
    cycleVal.textContent = '0';
    renderFrame();
    loop(0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
