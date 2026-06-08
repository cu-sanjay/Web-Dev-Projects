'use strict';

const SESSIONS = {
  focus: { minutes: 25, label: 'Focus', shortLabel: 'Focus / 25m' },
  short: { minutes: 5, label: 'Short Break', shortLabel: 'Short Break / 5m' },
  long: { minutes: 15, label: 'Long Break', shortLabel: 'Long Break / 15m' }
};

const state = {
  minutes: 25,
  seconds: 0,
  interval: null,
  isRunning: false,
  sessionMode: 'focus',
  focusCycles: 0,
  volumes: { rain: 0, cafe: 0, whiteNoise: 0, train: 0 },
  previousVolumes: { rain: 0, cafe: 0, whiteNoise: 0, train: 0 },
  muted: { rain: false, cafe: false, whiteNoise: false, train: false },
  audioInitialized: false
};

const timerDisplay = document.getElementById('timer-display');
const cycleCount = document.getElementById('cycle-count');
const sessionLabel = document.getElementById('session-label');
const timerStateLabel = document.getElementById('timer-state-label');
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const sessionBtns = document.querySelectorAll('.session-btn');
const audioSliders = document.querySelectorAll('.audio-slider');
const muteBtns = document.querySelectorAll('.mute-btn');
const volumeIndicators = document.querySelectorAll('.volume-indicator');

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.channels = {};
    this.running = false;
    this.rainInterval = null;
    this.cafeInterval = null;
  }

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.5;
    this.masterGain.connect(this.ctx.destination);
    this.running = true;

    this.createWhiteNoise();
    this.createRain();
    this.createCafe();
    this.createTrain();
  }

  createNoiseBuffer(duration) {
    const len = (this.ctx.sampleRate * (duration || 4));
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  createWhiteNoise() {
    const buffer = this.createNoiseBuffer(4);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 8000;
    filter.Q.value = 0.3;

    const gain = this.ctx.createGain();
    gain.gain.value = 0;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start();

    this.channels.whiteNoise = { source, filter, gain, type: 'whiteNoise' };
  }

  createRain() {
    const sampleRate = this.ctx.sampleRate;
    const duration = 12;
    const len = sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, len, sampleRate);
    const data = buffer.getChannelData(0);

    let amp = 0;
    for (let i = 0; i < len; i++) {
      if (Math.random() < 0.008) {
        amp = 0.15 + Math.random() * 0.35;
      }
      const noise = Math.random() * 2 - 1;
      data[i] = noise * (amp + Math.random() * 0.08);
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 3500;
    filter.Q.value = 0.5;

    const gain = this.ctx.createGain();
    gain.gain.value = 0;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start();

    this.channels.rain = { source, filter, gain, type: 'rain' };

    this.rainInterval = setInterval(() => {
      if (!this.running || !this.channels.rain) return;
      if (state.muted.rain) return;
      const base = (state.volumes.rain / 100) * 0.35;
      const variation = Math.random() * 0.12;
      gain.gain.setTargetAtTime(base * (0.8 + variation), this.ctx.currentTime, 0.05);
    }, 120);
  }

  createCafe() {
    const channels = [];
    const frequencies = [380, 1100, 2600];

    frequencies.forEach((freq, idx) => {
      const buffer = this.createNoiseBuffer(10);
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = freq;
      filter.Q.value = 0.5 + idx * 0.15;

      const gain = this.ctx.createGain();
      gain.gain.value = 0;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      source.start();

      channels.push({ source, filter, gain, freq });
    });

    this.channels.cafe = { sub: channels, type: 'cafe' };

    this.cafeInterval = setInterval(() => {
      if (!this.running || !this.channels.cafe) return;
      if (state.muted.cafe) return;
      const base = (state.volumes.cafe / 100) * 0.12;
      channels.forEach((ch, i) => {
        const val = base * (0.4 + Math.random() * 0.6) * (1 + i * 0.2);
        ch.gain.setTargetAtTime(val, this.ctx.currentTime, 0.08);
      });
    }, 400 + Math.random() * 600);
  }

  createTrain() {
    const sampleRate = this.ctx.sampleRate;
    const duration = 6;
    const len = sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, len, sampleRate);
    const data = buffer.getChannelData(0);

    const beatRate = sampleRate / 1.85;
    const clickRate = sampleRate / 3.7;

    for (let i = 0; i < len; i++) {
      const noise = Math.random() * 2 - 1;
      const beatPos = (i % beatRate) / beatRate;
      const beatEnv = Math.exp(-beatPos * 7);
      const clickPos = (i % clickRate) / clickRate;
      const clickEnv = Math.exp(-clickPos * 14);
      data[i] = noise * (beatEnv * 0.35 + clickEnv * 0.25);
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const bpFilter = this.ctx.createBiquadFilter();
    bpFilter.type = 'bandpass';
    bpFilter.frequency.value = 600;
    bpFilter.Q.value = 1.2;

    const gain = this.ctx.createGain();
    gain.gain.value = 0;

    source.connect(bpFilter);
    bpFilter.connect(gain);
    gain.connect(this.masterGain);
    source.start();

    this.channels.train = { source, filter: bpFilter, gain, type: 'train' };
  }

  setChannelVolume(channel, value) {
    if (!this.ctx || !this.channels[channel]) return;
    state.volumes[channel] = value;

    if (state.muted[channel]) return;

    const now = this.ctx.currentTime;
    switch (channel) {
      case 'whiteNoise':
        this.channels.whiteNoise.gain.gain.setTargetAtTime((value / 100) * 0.25, now, 0.02);
        break;
      case 'rain':
        this.channels.rain.gain.setTargetAtTime((value / 100) * 0.35 * 0.5, now, 0.02);
        break;
      case 'cafe':
        this.channels.cafe.sub.forEach((ch, i) => {
          const base = (value / 100) * 0.12 * (0.5 + i * 0.2);
          ch.gain.setTargetAtTime(base, now, 0.02);
        });
        break;
      case 'train':
        this.channels.train.gain.setTargetAtTime((value / 100) * 0.3, now, 0.02);
        break;
    }
  }

  mute(channel) {
    if (!this.ctx || !this.channels[channel]) return;
    state.muted[channel] = true;
    const now = this.ctx.currentTime;

    switch (channel) {
      case 'whiteNoise':
        this.channels.whiteNoise.gain.gain.setTargetAtTime(0, now, 0.02);
        break;
      case 'rain':
        this.channels.rain.gain.setTargetAtTime(0, now, 0.02);
        break;
      case 'cafe':
        this.channels.cafe.sub.forEach(ch => ch.gain.setTargetAtTime(0, now, 0.02));
        break;
      case 'train':
        this.channels.train.gain.setTargetAtTime(0, now, 0.02);
        break;
    }
  }

  unmute(channel) {
    if (!this.ctx || !this.channels[channel]) return;
    state.muted[channel] = false;
    let vol = state.volumes[channel];
    if (vol === 0) {
      vol = state.previousVolumes[channel] || 30;
      state.volumes[channel] = vol;
      const slider = document.querySelector(`.audio-slider[data-channel="${channel}"]`);
      if (slider) slider.value = vol;
      const indicator = document.querySelector(`.volume-indicator[data-channel="${channel}"]`);
      if (indicator) indicator.textContent = vol + '%';
    }
    this.setChannelVolume(channel, vol);
  }

  toggleMute(channel) {
    if (state.muted[channel]) {
      this.unmute(channel);
    } else {
      state.previousVolumes[channel] = state.volumes[channel];
      this.mute(channel);
    }
  }

  playChime() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = 880;
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start(now);
    osc1.stop(now + 0.25);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = 1100;
    gain2.gain.setValueAtTime(0.12, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.5);
  }
}

const audio = new AudioEngine();

async function ensureAudio() {
  if (!state.audioInitialized) {
    audio.init();
    state.audioInitialized = true;
  }
  if (audio.ctx && audio.ctx.state === 'suspended') {
    await audio.ctx.resume();
  }
}

function updateTimerDisplay() {
  const mins = String(state.minutes).padStart(2, '0');
  const secs = String(state.seconds).padStart(2, '0');
  timerDisplay.textContent = mins + ':' + secs;
  document.title = mins + ':' + secs + ' - Focus Beats // Sound Suite';
}

function updateTimerStateLabel() {
  if (state.isRunning) {
    timerStateLabel.textContent = 'Running';
  } else {
    timerStateLabel.textContent = 'Idle';
  }
}

function switchSession(mode) {
  if (state.isRunning) pauseTimer();
  state.sessionMode = mode;
  state.minutes = SESSIONS[mode].minutes;
  state.seconds = 0;
  updateTimerDisplay();
  updateTimerStateLabel();
  sessionLabel.textContent = SESSIONS[mode].label;
  timerDisplay.classList.remove('completed');

  sessionBtns.forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset.session === mode);
  });
}

function startTimer() {
  if (state.isRunning) return;
  ensureAudio().then(function () {
    state.isRunning = true;
    timerStateLabel.textContent = 'Running';
    playBtn.disabled = true;

    state.interval = setInterval(function () {
      if (state.seconds === 0) {
        if (state.minutes === 0) {
          clearInterval(state.interval);
          state.interval = null;
          state.isRunning = false;
          playBtn.disabled = false;
          timerStateLabel.textContent = 'Idle';
          audio.playChime();
          timerDisplay.classList.add('completed');

          if (state.sessionMode === 'focus') {
            state.focusCycles++;
            cycleCount.textContent = state.focusCycles;
            saveToStorage();
          }

          if (state.sessionMode === 'focus') {
            setTimeout(function () { switchSession('short'); }, 300);
          } else {
            setTimeout(function () { switchSession('focus'); }, 300);
          }
          return;
        }
        state.minutes--;
        state.seconds = 59;
      } else {
        state.seconds--;
      }
      updateTimerDisplay();
    }, 1000);
    updateTimerDisplay();
  });
}

function pauseTimer() {
  if (!state.isRunning) return;
  clearInterval(state.interval);
  state.interval = null;
  state.isRunning = false;
  playBtn.disabled = false;
  timerStateLabel.textContent = 'Paused';
}

function resetTimer() {
  pauseTimer();
  state.minutes = SESSIONS[state.sessionMode].minutes;
  state.seconds = 0;
  updateTimerDisplay();
  updateTimerStateLabel();
  playBtn.disabled = false;
  timerDisplay.classList.remove('completed');
}

function handleSliderChange(e) {
  const channel = e.target.dataset.channel;
  const value = parseInt(e.target.value, 10);

  ensureAudio().then(function () {
    audio.setChannelVolume(channel, value);
  });

  const indicator = document.querySelector('.volume-indicator[data-channel="' + channel + '"]');
  if (indicator) indicator.textContent = value + '%';

  const row = e.target.closest('.mixer-row');
  if (row) row.classList.toggle('active', value > 0);

  saveToStorage();
}

function handleMuteToggle(e) {
  const channel = e.currentTarget.dataset.channel;

  ensureAudio().then(function () {
    audio.toggleMute(channel);

    const btn = document.querySelector('.mute-btn[data-channel="' + channel + '"]');
    if (btn) btn.classList.toggle('muted', state.muted[channel]);

    const row = btn ? btn.closest('.mixer-row') : null;
    if (row) {
      const slider = row.querySelector('.audio-slider');
      const val = parseInt(slider.value, 10);
      if (!state.muted[channel] && val > 0) {
        row.classList.add('active');
      } else {
        row.classList.remove('active');
      }
    }

    saveToStorage();
  });
}

function syncSliderFromState() {
  audioSliders.forEach(function (slider) {
    const ch = slider.dataset.channel;
    const val = state.volumes[ch] || 0;
    slider.value = val;
    const indicator = document.querySelector('.volume-indicator[data-channel="' + ch + '"]');
    if (indicator) indicator.textContent = val + '%';
    const row = slider.closest('.mixer-row');
    if (row) row.classList.toggle('active', val > 0);
  });

  muteBtns.forEach(function (btn) {
    const ch = btn.dataset.channel;
    btn.classList.toggle('muted', !!state.muted[ch]);
  });
}

function saveToStorage() {
  try {
    localStorage.setItem('focusBeats_volumes', JSON.stringify(state.volumes));
    localStorage.setItem('focusBeats_cycles', String(state.focusCycles));
    localStorage.setItem('focusBeats_muted', JSON.stringify(state.muted));
  } catch (_) {}
}

function loadFromStorage() {
  try {
    const volumes = localStorage.getItem('focusBeats_volumes');
    const cycles = localStorage.getItem('focusBeats_cycles');
    const muted = localStorage.getItem('focusBeats_muted');

    if (volumes) {
      const p = JSON.parse(volumes);
      state.volumes = { rain: 0, cafe: 0, whiteNoise: 0, train: 0 };
      if (p.rain !== undefined) state.volumes.rain = p.rain;
      if (p.cafe !== undefined) state.volumes.cafe = p.cafe;
      if (p.whiteNoise !== undefined) state.volumes.whiteNoise = p.whiteNoise;
      if (p.train !== undefined) state.volumes.train = p.train;
    }
    if (cycles) {
      const n = parseInt(cycles, 10);
      if (!isNaN(n)) {
        state.focusCycles = n;
        cycleCount.textContent = n;
      }
    }
    if (muted) {
      const p = JSON.parse(muted);
      if (typeof p.rain === 'boolean') state.muted.rain = p.rain;
      if (typeof p.cafe === 'boolean') state.muted.cafe = p.cafe;
      if (typeof p.whiteNoise === 'boolean') state.muted.whiteNoise = p.whiteNoise;
      if (typeof p.train === 'boolean') state.muted.train = p.train;
    }
  } catch (_) {}
}

playBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

sessionBtns.forEach(function (btn) {
  btn.addEventListener('click', function () {
    switchSession(btn.dataset.session);
  });
});

audioSliders.forEach(function (slider) {
  slider.addEventListener('input', handleSliderChange);
});

muteBtns.forEach(function (btn) {
  btn.addEventListener('click', handleMuteToggle);
});

loadFromStorage();
syncSliderFromState();
updateTimerDisplay();
updateTimerStateLabel();
