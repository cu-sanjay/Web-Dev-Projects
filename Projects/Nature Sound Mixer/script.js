(function () {
  'use strict';

  /* === CHANNEL DEFINITIONS === */
  const CHANNELS = [
    { id: 'rain', name: 'Rain', dotColor: '#00e5ff', filterType: 'lowpass', defaultFilter: 3000 },
    { id: 'birds', name: 'Forest Birds', dotColor: '#00e676', filterType: 'highpass', defaultFilter: 800 },
    { id: 'river', name: 'Rushing River', dotColor: '#ffb800', filterType: 'lowpass', defaultFilter: 2000 },
    { id: 'wind', name: 'Mountain Wind', dotColor: '#ff2d78', filterType: 'lowpass', defaultFilter: 1500 }
  ];

  /* === WEB AUDIO STATE === */
  let audioCtx = null;
  let masterGain = null;
  let analyser = null;
  let channels = {};
  let isPlaying = false;
  let sourceNodes = {};
  let filterNodes = {};
  let gainNodes = {};
  let noiseBuffers = {};
  let birdOscillators = [];

  /* === DOM REFS === */
  const $ = id => document.getElementById(id);
  const mixerGrid = $('mixerGrid');
  const sliderMaster = $('sliderMaster'), valMaster = $('valMaster');
  const btnToggle = $('btnToggle'), toggleLabel = $('toggleLabel'), playIcon = $('playIcon');
  const vizCanvas = $('vizCanvas'), ctxViz = vizCanvas.getContext('2d');
  const presetsBody = $('presetsBody'), presetList = $('presetList'), presetNameInput = $('presetNameInput');
  const btnSavePreset = $('btnSavePreset'), btnLoadDeepSleep = $('btnLoadDeepSleep'), btnPurge = $('btnPurge');
  const stateDot = $('stateDot'), stateLabel = $('stateLabel');

  /* === AUDIO INIT === */
  function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = parseFloat(sliderMaster.value) / 100;
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    masterGain.connect(analyser);
    analyser.connect(audioCtx.destination);
  }

  /* === NOISE GENERATORS === */
  function createNoiseBuffer(ctx, type, duration) {
    const sr = ctx.sampleRate;
    const len = sr * (duration || 4);
    const buf = ctx.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);
    let last = 0;

    for (let i = 0; i < len; i++) {
      if (type === 'white') {
        data[i] = Math.random() * 2 - 1;
      } else if (type === 'brown') {
        const white = Math.random() * 2 - 1;
        data[i] = (last + white * 0.02) / 1.02;
        last = data[i];
        data[i] *= 0.5;
      } else if (type === 'pink') {
        const white = Math.random() * 2 - 1;
        data[i] = (last + (white - last) * 0.1) * 0.6;
        last = data[i];
      }
    }
    return buf;
  }

  function createNoiseSource(ctx, buf, loop) {
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = loop !== false;
    return src;
  }

  /* === BUILD CHANNEL STRIPS === */
  function buildMixer() {
    mixerGrid.innerHTML = '';
    channels = {};

    CHANNELS.forEach(ch => {
      const el = document.createElement('div');
      el.className = 'mixer-channel';
      el.dataset.channel = ch.id;

      el.innerHTML = `
        <div class="channel-header">
          <span class="channel-dot" style="background:${ch.dotColor};box-shadow:0 0 4px ${ch.dotColor}66"></span>
          <span style="color:${ch.dotColor}">${ch.name}</span>
          <button class="channel-mute-btn" data-id="${ch.id}">MUTE</button>
        </div>
        <div class="channel-body">
          <div class="channel-row">
            <div class="channel-label"><span>Gain Level</span><span class="ch-val" id="valG_${ch.id}">75%</span></div>
            <input type="range" class="channel-slider ch-slider-gain" data-id="${ch.id}" data-param="gain" min="0" max="100" step="1" value="75">
          </div>
          <div class="channel-row">
            <div class="channel-label"><span>Filter Cutoff</span><span class="ch-val" id="valF_${ch.id}">${ch.defaultFilter} Hz</span></div>
            <input type="range" class="channel-slider ch-slider-filter" data-id="${ch.id}" data-param="filter" min="50" max="8000" step="10" value="${ch.defaultFilter}">
          </div>
        </div>
      `;

      mixerGrid.appendChild(el);
      channels[ch.id] = { muted: false, gain: 75, filter: ch.defaultFilter, el };

      /* Mute */
      el.querySelector('.channel-mute-btn').addEventListener('click', () => {
        const c = channels[ch.id];
        c.muted = !c.muted;
        el.querySelector('.channel-mute-btn').classList.toggle('active');
        el.classList.toggle('muted');
        if (gainNodes[ch.id]) {
          gainNodes[ch.id].gain.value = c.muted ? 0 : c.gain / 100;
        }
      });

      /* Gain slider */
      el.querySelector('[data-param="gain"]').addEventListener('input', (e) => {
        const v = parseFloat(e.target.value);
        const c = channels[ch.id];
        c.gain = v;
        el.querySelector('#valG_' + ch.id).textContent = Math.round(v) + '%';
        if (gainNodes[ch.id] && !c.muted) {
          gainNodes[ch.id].gain.value = v / 100;
        } else if (gainNodes[ch.id]) {
          gainNodes[ch.id].gain.value = 0;
        }
      });

      /* Filter slider */
      el.querySelector('[data-param="filter"]').addEventListener('input', (e) => {
        const v = parseFloat(e.target.value);
        channels[ch.id].filter = v;
        el.querySelector('#valF_' + ch.id).textContent = Math.round(v) + ' Hz';
        if (filterNodes[ch.id]) {
          filterNodes[ch.id].frequency.value = v;
        }
      });
    });
  }

  /* === START/STOP AUDIO === */
  function startAudio() {
    if (isPlaying) return;
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    CHANNELS.forEach(ch => {
      const ctx = audioCtx;
      const filter = ctx.createBiquadFilter();
      filter.type = ch.filterType;
      filter.frequency.value = channels[ch.id].filter;
      filter.Q.value = 1;

      const gain = ctx.createGain();
      gain.gain.value = channels[ch.id].muted ? 0 : channels[ch.id].gain / 100;

      let src;
      if (ch.id === 'birds') {
        /* Birds: multiple high-frequency oscillators with FM */
        const oscs = [];
        const birdGain = ctx.createGain();
        birdGain.gain.value = 0.08;

        for (let i = 0; i < 5; i++) {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.value = 2000 + i * 600 + Math.random() * 400;

          const mod = ctx.createOscillator();
          mod.type = 'sine';
          mod.frequency.value = 4 + Math.random() * 6;
          const modGain = ctx.createGain();
          modGain.gain.value = 300 + Math.random() * 200;
          mod.connect(modGain);
          modGain.connect(osc.frequency);
          mod.start();

          const ampMod = ctx.createGain();
          ampMod.gain.value = 0;
          const lfo = ctx.createOscillator();
          lfo.type = 'sine';
          lfo.frequency.value = 0.5 + Math.random() * 1.5;
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = 0.08;
          lfo.connect(lfoGain);
          lfoGain.connect(ampMod.gain);
          lfo.start();

          osc.connect(ampMod);
          ampMod.connect(birdGain);
          osc.start();

          oscs.push({ osc, mod, lfo, ampMod });
        }

        birdOscillators = oscs;
        birdGain.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        sourceNodes[ch.id] = birdGain;
      } else {
        /* Rain, River, Wind: noise-based */
        let type = 'brown';
        let dur = 4;
        if (ch.id === 'rain') { type = 'white'; dur = 3; }
        else if (ch.id === 'wind') { type = 'pink'; dur = 5; }

        if (!noiseBuffers[ch.id]) {
          noiseBuffers[ch.id] = createNoiseBuffer(ctx, type, dur);
        }
        src = createNoiseSource(ctx, noiseBuffers[ch.id], true);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        src.start();
        sourceNodes[ch.id] = src;
      }

      filterNodes[ch.id] = filter;
      gainNodes[ch.id] = gain;
    });

    isPlaying = true;
    btnToggle.classList.remove('muted');
    toggleLabel.textContent = 'PLAYING';
    playIcon.style.fill = 'currentColor';
    stateDot.className = 'state-dot playing';
    stateLabel.textContent = 'PLAYING';
  }

  function stopAudio() {
    Object.keys(sourceNodes).forEach(id => {
      try {
        if (sourceNodes[id] && sourceNodes[id].stop) sourceNodes[id].stop();
      } catch(e) {}
    });
    birdOscillators.forEach(o => {
      try { o.osc.stop(); o.mod.stop(); o.lfo.stop(); } catch(e) {}
    });
    birdOscillators = [];
    sourceNodes = {};
    filterNodes = {};
    gainNodes = {};
    isPlaying = false;
    btnToggle.classList.add('muted');
    toggleLabel.textContent = 'MUTED';
    playIcon.style.fill = 'none';
    stateDot.className = 'state-dot muted';
    stateLabel.textContent = 'MUTED';
  }

  function togglePlay() {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  }

  /* === MASTER VOLUME === */
  sliderMaster.addEventListener('input', () => {
    const v = parseFloat(sliderMaster.value);
    valMaster.textContent = Math.round(v) + '%';
    if (masterGain) masterGain.gain.value = v / 100;
  });

  btnToggle.addEventListener('click', togglePlay);

  /* === CANVAS VISUALIZER === */
  let dataArray = null;
  let bufferLength = 0;

  function sizeViz() {
    const wrap = vizCanvas.parentElement;
    const w = Math.min(wrap.clientWidth - 4, 900);
    const h = Math.max(140, Math.round(w * 0.3));
    vizCanvas.width = w; vizCanvas.height = h;
    vizCanvas.style.width = w + 'px'; vizCanvas.style.height = h + 'px';
    if (analyser) {
      bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
    } else {
      bufferLength = 128;
      dataArray = new Uint8Array(bufferLength);
    }
    return { w, h };
  }

  function drawVisualizer() {
    const { w, h } = sizeViz();
    const ctx = ctxViz;
    ctx.clearRect(0, 0, w, h);

    if (analyser && isPlaying) {
      analyser.getByteFrequencyData(dataArray);
    } else {
      dataArray.fill(0);
    }

    const barW = (w - 4) / bufferLength;
    const centerY = h / 2;

    for (let i = 0; i < bufferLength; i++) {
      const val = dataArray[i] / 255;
      const barH = val * h * 0.8;
      const x = 2 + i * barW;

      const hue = 160 + val * 60;
      const grad = ctx.createLinearGradient(x, centerY - barH / 2, x, centerY + barH / 2);
      grad.addColorStop(0, `hsla(${hue}, 80%, 55%, 0.8)`);
      grad.addColorStop(0.5, `hsla(${hue + 20}, 90%, 65%, 1)`);
      grad.addColorStop(1, `hsla(${hue}, 80%, 55%, 0.8)`);

      ctx.fillStyle = grad;
      ctx.shadowColor = `hsla(${hue}, 80%, 55%, 0.3)`;
      ctx.shadowBlur = 4;
      ctx.fillRect(x, centerY - barH / 2, Math.max(barW - 0.5, 1), barH);
    }
    ctx.shadowBlur = 0;
  }

  /* === PRESETS === */
  function getCurrentState() {
    const chData = {};
    CHANNELS.forEach(ch => {
      const c = channels[ch.id];
      chData[ch.id] = { gain: c.gain, filter: c.filter, muted: c.muted };
    });
    return {
      master: parseFloat(sliderMaster.value),
      channels: chData
    };
  }

  function applyState(state) {
    sliderMaster.value = state.master;
    valMaster.textContent = Math.round(state.master) + '%';
    if (masterGain) masterGain.gain.value = state.master / 100;

    CHANNELS.forEach(ch => {
      const d = state.channels[ch.id];
      if (!d) return;
      const c = channels[ch.id];
      c.gain = d.gain;
      c.filter = d.filter;
      c.muted = d.muted;

      const el = document.querySelector(`.mixer-channel[data-channel="${ch.id}"]`);
      if (el) {
        el.querySelector('[data-param="gain"]').value = d.gain;
        el.querySelector('#valG_' + ch.id).textContent = Math.round(d.gain) + '%';
        el.querySelector('[data-param="filter"]').value = d.filter;
        el.querySelector('#valF_' + ch.id).textContent = Math.round(d.filter) + ' Hz';
        if (d.muted) {
          el.querySelector('.channel-mute-btn').classList.add('active');
          el.classList.add('muted');
        } else {
          el.querySelector('.channel-mute-btn').classList.remove('active');
          el.classList.remove('muted');
        }
      }

      if (gainNodes[ch.id]) {
        gainNodes[ch.id].gain.value = d.muted ? 0 : d.gain / 100;
      }
      if (filterNodes[ch.id]) {
        filterNodes[ch.id].frequency.value = d.filter;
      }
    });

    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  }

  function savePreset() {
    const name = presetNameInput.value.trim();
    if (!name) { presetNameInput.focus(); return; }

    const state = getCurrentState();
    const presets = JSON.parse(localStorage.getItem('natureSoundMixerPresets') || '{}');
    presets[name] = state;
    localStorage.setItem('natureSoundMixerPresets', JSON.stringify(presets));
    presetNameInput.value = '';
    renderPresets();
  }

  function loadPreset(name) {
    const presets = JSON.parse(localStorage.getItem('natureSoundMixerPresets') || '{}');
    const state = presets[name];
    if (!state) return;
    applyState(state);
  }

  function deletePreset(name) {
    const presets = JSON.parse(localStorage.getItem('natureSoundMixerPresets') || '{}');
    delete presets[name];
    localStorage.setItem('natureSoundMixerPresets', JSON.stringify(presets));
    renderPresets();
  }

  function renderPresets() {
    const presets = JSON.parse(localStorage.getItem('natureSoundMixerPresets') || '{}');
    const names = Object.keys(presets);
    presetList.innerHTML = '';

    if (names.length === 0) {
      presetList.innerHTML = '<span class="preset-empty">No saved presets yet.</span>';
      return;
    }

    names.forEach(name => {
      const btn = document.createElement('button');
      btn.className = 'preset-btn';
      btn.innerHTML = `<span>${name}</span><span class="preset-del" data-name="${name}">✕</span>`;
      btn.addEventListener('click', (e) => {
        if (e.target.classList.contains('preset-del')) {
          deletePreset(name);
        } else {
          loadPreset(name);
        }
      });
      presetList.appendChild(btn);
    });
  }

  btnSavePreset.addEventListener('click', savePreset);
  presetNameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') savePreset(); });

  /* === DEEP SLEEP TEMPLATE === */
  btnLoadDeepSleep.addEventListener('click', () => {
    const deepSleep = {
      master: 60,
      channels: {
        rain: { gain: 85, filter: 2000, muted: false },
        birds: { gain: 20, filter: 800, muted: false },
        river: { gain: 70, filter: 1500, muted: false },
        wind: { gain: 50, filter: 1000, muted: false }
      }
    };
    applyState(deepSleep);
  });

  /* === PURGE === */
  btnPurge.addEventListener('click', () => {
    if (isPlaying) stopAudio();
    CHANNELS.forEach(ch => {
      const c = channels[ch.id];
      c.gain = 50; c.filter = ch.defaultFilter; c.muted = false;
      const el = document.querySelector(`.mixer-channel[data-channel="${ch.id}"]`);
      if (el) {
        el.querySelector('[data-param="gain"]').value = 50;
        el.querySelector('#valG_' + ch.id).textContent = '50%';
        el.querySelector('[data-param="filter"]').value = ch.defaultFilter;
        el.querySelector('#valF_' + ch.id).textContent = ch.defaultFilter + ' Hz';
        el.querySelector('.channel-mute-btn').classList.remove('active');
        el.classList.remove('muted');
      }
    });
    sliderMaster.value = 75; valMaster.textContent = '75%';
    if (masterGain) masterGain.gain.value = 0.75;
    stateDot.className = 'state-dot';
    stateLabel.textContent = 'PURGED';
  });

  /* === ANIMATION LOOP === */
  function tick() {
    drawVisualizer();
    requestAnimationFrame(tick);
  }

  /* === RESIZE === */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {}, 150);
  });

  /* === INIT === */
  function init() {
    buildMixer();
    sizeViz();
    renderPresets();
    tick();
    stateDot.className = 'state-dot';
    stateLabel.textContent = 'STANDBY';
  }

  init();

})();
