(function () {
  'use strict';

  /* ========================================================================
     CONFIG
     ======================================================================== */
  const THEMES = {
    space: {
      symbols: ['🚀', '🌙', '⭐', '🌍', '🛸', '☄️', '🔭', '🛰️', '👩‍🚀', '🌌', '🪐', '🌠'],
      icon: '🚀',
      backIcon: '✦',
      backLabel: 'COSMOS',
      particles: { count: 70, speed: 0.3, hue: 195, size: 1.5 },
    },
    food: {
      symbols: ['🍕', '🍔', '🌮', '🥗', '🍩', '🍪', '🍫', '🍿', '🥨', '🧁', '🍣', '🥑'],
      icon: '🍕',
      backIcon: '◆',
      backLabel: 'FEAST',
      particles: { count: 45, speed: 0.2, hue: 40, size: 2.2 },
    },
    tech: {
      symbols: ['💻', '⌨️', '🖥️', '📱', '🖱️', '💾', '🔌', '🎧', '🕹️', '📡', '🤖', '💿'],
      icon: '💻',
      backIcon: '◈',
      backLabel: 'CYBER',
      particles: { count: 55, speed: 0.5, hue: 155, size: 1.8 },
    },
  };

  const DIFFICULTIES = {
    easy: { cols: 4, rows: 4, pairs: 8 },
    medium: { cols: 6, rows: 4, pairs: 12 },
  };

  const RANKS = [
    { name: 'Bronze',   minLevel: 1,  color: '#cd7f32' },
    { name: 'Silver',   minLevel: 3,  color: '#c0c0c0' },
    { name: 'Gold',     minLevel: 5,  color: '#ffd700' },
    { name: 'Platinum', minLevel: 8,  color: '#e5e4e2' },
    { name: 'Diamond',  minLevel: 12, color: '#b9f2ff' },
  ];

  const XP_PER_LEVEL = 500;
  const STREAK_BONUS_CAP = 5;
  const BASE_SCORE = 100;
  const BONUS_PER_STREAK = 25;

  const ACHIEVEMENTS = [
    { id: 'first_match',  label: 'First Blood',     icon: '⚔️', check: s => s.matched >= 2 },
    { id: 'combo_3',      label: 'Combo x3',         icon: '🔥', check: s => s.streak >= 3 },
    { id: 'combo_5',      label: 'Combo x5',         icon: '💥', check: s => s.streak >= 5 },
    { id: 'halfway',      label: 'Halfway There',    icon: '🏗️', check: s => {
        const t = DIFFICULTIES[s.difficulty].pairs * 2;
        return s.matched >= t / 2;
    }},
    { id: 'speed_demon',  label: 'Speed Demon',      icon: '⚡', check: s => s.moves <= DIFFICULTIES[s.difficulty].pairs + 2 && s.matched > 0 },
  ];

  /* ========================================================================
     DOM
     ======================================================================== */
  const $ = id => document.getElementById(id);
  const DOM = {
    board: $('board'),
    screenShake: $('screen-shake'),
    canvas: $('particles-canvas'),
    floatContainer: $('float-container'),
    toastContainer: $('toast-container'),
    confettiContainer: $('confetti-container'),

    moves: $('moves'),
    score: $('score'),
    combo: $('combo'),
    comboFill: $('combo-fill'),
    bestScore: $('best-score'),
    difficulty: $('difficulty'),
    theme: $('theme'),
    resetBtn: $('reset-btn'),

    levelBadge: $('level-badge'),
    rankTitle: $('rank-title'),
    xpFill: $('xp-fill'),
    xpCurrent: $('xp-current'),
    xpNext: $('xp-next'),
    progressFill: $('progress-fill'),
    matchedCount: $('matched-count'),
    totalCount: $('total-count'),

    modalOverlay: $('modal-overlay'),
    modalMoves: $('modal-moves'),
    modalScore: $('modal-score'),
    modalBestLabel: $('modal-best-label'),
    modalBestValue: $('modal-best-value'),
    modalMessage: $('modal-message'),
    modalXpFill: $('modal-xp-fill'),
    modalXpAmount: $('modal-xp-amount'),
    modalXpLabel: $('modal-xp-label'),
    starContainer: $('star-container'),
    playAgainBtn: $('play-again-btn'),
  };

  /* ========================================================================
     STATE
     ======================================================================== */
  let state;
  let particles;
  let unlocked = new Set();

  function fresh() {
    return {
      difficulty: DOM.difficulty.value,
      theme: DOM.theme.value,
      cards: [],
      flipped: [],
      matched: 0,
      moves: 0,
      score: 0,
      level: 1,
      xp: 0,
      streak: 0,
      locked: false,
      gameOver: false,
    };
  }

  /* ========================================================================
     UTILITY
     ======================================================================== */
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.random() * (i + 1) | 0;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function buildDeck(pairs, key) {
    const pool = THEMES[key].symbols;
    return shuffle(
      shuffle([...pool]).slice(0, pairs)
        .reduce((a, s) => a.concat([s, s]), [])
    ).map((s, i) => ({ id: i, symbol: s, flipped: false, matched: false }));
  }

  /* ========================================================================
     PERSISTENCE
     ======================================================================== */
  function loadBest(d) {
    try { const v = parseInt(localStorage.getItem(`mm_best_${d}`), 10); return isNaN(v) ? null : v; }
    catch { return null; }
  }

  function saveBest(d, m) {
    try {
      const c = loadBest(d);
      if (c === null || m < c) localStorage.setItem(`mm_best_${d}`, m);
    } catch { /* */ }
  }

  function loadLevel() {
    try { const v = parseInt(localStorage.getItem('mm_level'), 10); return isNaN(v) ? 1 : Math.max(1, v); }
    catch { return 1; }
  }

  function saveLevel(lv) {
    try { localStorage.setItem('mm_level', lv); } catch { /* */ }
  }

  /* ========================================================================
     RANK
     ======================================================================== */
  function getRank(level) {
    let r = RANKS[0];
    for (const rank of RANKS) {
      if (level >= rank.minLevel) r = rank;
    }
    return r;
  }

  /* ========================================================================
     THEME
     ======================================================================== */
  function applyTheme(key) {
    document.documentElement.setAttribute('data-theme', key);
    if (particles) particles.setTheme(key);
  }

  /* ========================================================================
     ACHIEVEMENTS
     ======================================================================== */
  function tryUnlock() {
    for (const a of ACHIEVEMENTS) {
      if (!unlocked.has(a.id) && a.check(state)) {
        unlocked.add(a.id);
        showToast(`${a.icon} ${a.label}`);
      }
    }
  }

  /* ========================================================================
     TOAST
     ======================================================================== */
  function showToast(text) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = text;
    DOM.toastContainer.appendChild(el);
    setTimeout(() => {
      el.classList.add('toast--out');
      setTimeout(() => el.remove(), 300);
    }, 1800);
  }

  /* ========================================================================
     FLOATING SCORE
     ======================================================================== */
  function floatScore(x, y, text, isStreak) {
    const el = document.createElement('div');
    el.className = 'float-score' + (isStreak ? ' float-score--streak' : '');
    el.textContent = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    DOM.floatContainer.appendChild(el);
    setTimeout(() => el.remove(), 950);
    popEl(DOM.score);
  }

  function popEl(el) {
    if (!el) return;
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
  }

  /* ========================================================================
     SCREEN SHAKE
     ======================================================================== */
  function shakeScreen() {
    const el = DOM.screenShake;
    el.classList.remove('shaking');
    void el.offsetWidth;
    el.classList.add('shaking');
  }

  /* ========================================================================
     STATS UPDATE
     ======================================================================== */
  function updateAll() {
    // Moves
    DOM.moves.textContent = state.moves;

    // Score
    DOM.score.textContent = state.score;

    // Combo
    DOM.combo.textContent = 'x' + state.streak;
    const comboEl = document.querySelector('.stat--combo');
    if (state.streak >= 2) {
      comboEl.classList.add('active');
    } else {
      comboEl.classList.remove('active');
    }
    // combo meter fill — up to x10
    const pct = Math.min(state.streak / 10 * 100, 100);
    DOM.comboFill.style.width = pct + '%';

    // Best
    const b = loadBest(state.difficulty);
    DOM.bestScore.textContent = b !== null ? b : '--';

    // Level
    DOM.levelBadge.textContent = state.level;
    const rank = getRank(state.level);
    DOM.rankTitle.textContent = rank.name;
    DOM.rankTitle.style.color = rank.color;

    // XP
    const xpInLevel = state.xp % XP_PER_LEVEL;
    DOM.xpFill.style.width = (xpInLevel / XP_PER_LEVEL * 100) + '%';
    DOM.xpCurrent.textContent = xpInLevel;
    DOM.xpNext.textContent = XP_PER_LEVEL;

    // Progress
    const cfg = DIFFICULTIES[state.difficulty];
    const total = cfg.pairs * 2;
    const progPct = total > 0 ? (state.matched / total * 100) : 0;
    DOM.progressFill.style.width = progPct + '%';
    DOM.matchedCount.textContent = state.matched / 2;
    DOM.totalCount.textContent = cfg.pairs;
  }

  /* ========================================================================
     RENDER BOARD
     ======================================================================== */
  function renderBoard() {
    const cfg = DIFFICULTIES[state.difficulty];
    DOM.board.innerHTML = '';
    DOM.board.className = 'board board--' + state.difficulty;

    state.cards = buildDeck(cfg.pairs, state.theme);

    state.cards.forEach(card => {
      const el = document.createElement('div');
      el.className = 'card';
      el.dataset.index = card.id;
      el.setAttribute('role', 'gridcell');

      const inner = document.createElement('div');
      inner.className = 'card__inner';

      const back = document.createElement('div');
      back.className = 'card__face card__face--back';

      const bi = document.createElement('span');
      bi.className = 'card__back-icon';
      bi.innerHTML = `<span class="icon-symbol">${THEMES[state.theme].backIcon}</span><span class="icon-label">${THEMES[state.theme].backLabel}</span>`;
      back.appendChild(bi);

      const front = document.createElement('div');
      front.className = 'card__face card__face--front';

      const sym = document.createElement('span');
      sym.className = 'card__symbol';
      sym.textContent = card.symbol;
      front.appendChild(sym);

      inner.appendChild(back);
      inner.appendChild(front);
      el.appendChild(inner);
      el.addEventListener('click', () => handleClick(card.id));

      DOM.board.appendChild(el);
    });

    updateAll();
  }

  function getEl(i) { return DOM.board.querySelector(`.card[data-index="${i}"]`); }

  function flip(i) {
    const c = state.cards[i];
    if (!c || c.flipped || c.matched) return;
    c.flipped = true;
    const el = getEl(i);
    if (el) el.classList.add('card--flipped');
  }

  function unflip(i) {
    const c = state.cards[i];
    if (!c) return;
    c.flipped = false;
    const el = getEl(i);
    if (el) el.classList.remove('card--flipped');
  }

  function markMatched(i) {
    const c = state.cards[i];
    if (!c) return;
    c.matched = true;
    const el = getEl(i);
    if (el) {
      el.classList.add('card--matched');
      el.classList.remove('card--flipped');
      spawnSparkles(el);
    }
  }

  /* ========================================================================
     SPARKLES
     ======================================================================== */
  function spawnSparkles(cardEl) {
    const colors = ['#00c8ff', '#7850ff', '#22e8a0', '#ffb400', '#ff4466', '#00ff88'];
    const rect = cardEl.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    for (let i = 0; i < 12; i++) {
      const s = document.createElement('div');
      s.className = 'match-sparkle';
      const a = (Math.PI * 2 * i) / 12 + Math.random() * 0.4;
      const d = 25 + Math.random() * 45;
      s.style.setProperty('--tx', (Math.cos(a) * d) + 'px');
      s.style.setProperty('--ty', (Math.sin(a) * d) + 'px');
      s.style.background = colors[i % colors.length];
      s.style.left = cx + 'px';
      s.style.top = cy + 'px';
      s.style.width = s.style.height = (3 + Math.random() * 6) + 'px';
      cardEl.querySelector('.card__inner').appendChild(s);
      setTimeout(() => s.remove(), 700);
    }
  }

  /* ========================================================================
     GAME LOGIC
     ======================================================================== */
  function handleClick(index) {
    if (state.locked || state.gameOver) return;
    const card = state.cards[index];
    if (!card || card.flipped || card.matched) return;
    if (state.flipped.length >= 2) return;

    flip(index);
    state.flipped.push(index);

    if (state.flipped.length === 2) {
      state.moves++;
      checkMatch();
    }
    updateAll();
  }

  function addXP(amount) {
    state.xp += amount;
    while (state.xp >= XP_PER_LEVEL) {
      state.xp -= XP_PER_LEVEL;
      state.level++;
      saveLevel(state.level);
      showToast(`⬆ Level ${state.level} — ${getRank(state.level).name}!`);
    }
  }

  function checkMatch() {
    state.locked = true;
    const [i1, i2] = state.flipped;
    const c1 = state.cards[i1];
    const c2 = state.cards[i2];

    if (c1.symbol === c2.symbol) {
      // Match!
      markMatched(i1);
      markMatched(i2);
      state.matched += 2;
      state.streak++;

      const bonus = Math.min(state.streak - 1, STREAK_BONUS_CAP);
      const points = BASE_SCORE + bonus * BONUS_PER_STREAK;
      state.score += points;
      addXP(points);

      state.flipped = [];
      state.locked = false;

      // Floating score
      const rect1 = getEl(i1)?.getBoundingClientRect();
      if (rect1) {
        floatScore(rect1.left + rect1.width / 2 - 20, rect1.top - 10,
          '+' + points + (state.streak >= 2 ? ' 🔥x' + state.streak : ''));
      }

      // Achievements
      tryUnlock();

      updateAll();

      const cfg = DIFFICULTIES[state.difficulty];
      if (state.matched === cfg.pairs * 2) endGame();
    } else {
      // Mismatch
      state.streak = 0;
      updateAll();
      shakeScreen();

      const el1 = getEl(i1);
      const el2 = getEl(i2);
      if (el1) el1.classList.add('card--mismatch');
      if (el2) el2.classList.add('card--mismatch');

      setTimeout(() => {
        unflip(i1); unflip(i2);
        if (el1) el1.classList.remove('card--mismatch');
        if (el2) el2.classList.remove('card--mismatch');
        state.flipped = [];
        state.locked = false;
      }, 700);
    }
  }

  /* ========================================================================
     END GAME
     ======================================================================== */
  function endGame() {
    state.gameOver = true;

    // Best score
    const best = loadBest(state.difficulty);
    const isNewBest = best === null || state.moves < best;
    if (isNewBest) saveBest(state.difficulty, state.moves);

    // Modal stats
    DOM.modalMoves.textContent = state.moves;
    DOM.modalScore.textContent = state.score;

    if (isNewBest) {
      DOM.modalMessage.textContent = '🏆 NEW PERSONAL BEST!';
      DOM.modalMessage.className = 'modal__message modal__message--new-best';
      DOM.modalBestValue.textContent = state.moves + ' moves';
      DOM.modalBestValue.style.color = '';
      DOM.modalBestLabel.textContent = '🏆 Best';
    } else {
      DOM.modalMessage.textContent = best ? `Best: ${best} moves` : '';
      DOM.modalMessage.className = 'modal__message modal__message--normal';
      DOM.modalBestValue.textContent = best ? best + ' moves' : '--';
      DOM.modalBestValue.style.color = '';
      DOM.modalBestLabel.textContent = 'Best';
    }

    // Stars (1-3 based on moves vs pairs)
    const cfg = DIFFICULTIES[state.difficulty];
    const stars = state.moves <= cfg.pairs ? 3 : state.moves <= cfg.pairs * 1.8 ? 2 : 1;
    const starEls = DOM.starContainer.querySelectorAll('.star');
    starEls.forEach((el, i) => {
      el.classList.remove('star--active');
      if (i < stars) {
        setTimeout(() => el.classList.add('star--active'), 100 + i * 200);
      }
    });

    // XP bar animation in modal
    const xpInLevel = state.xp % XP_PER_LEVEL;
    DOM.modalXpFill.style.width = '0%';
    DOM.modalXpAmount.textContent = '+' + state.score + ' XP';
    DOM.modalXpLabel.textContent = 'LV.' + state.level + ' ' + getRank(state.level).name;
    setTimeout(() => {
      DOM.modalXpFill.style.width = (xpInLevel / XP_PER_LEVEL * 100) + '%';
    }, 300);

    // Confetti
    spawnConfetti();

    // Show modal
    DOM.modalOverlay.classList.add('modal-overlay--visible');
  }

  /* ========================================================================
     CONFETTI
     ======================================================================== */
  function spawnConfetti() {
    DOM.confettiContainer.innerHTML = '';
    const colors = ['#00c8ff', '#ec4899', '#22e8a0', '#ffb400', '#7850ff', '#ff4466', '#00ff88'];
    const shapes = ['■', '●', '▲', '★', '♦', '◈'];

    for (let i = 0; i < 70; i++) {
      const p = document.createElement('span');
      p.className = 'confetti-piece';
      p.textContent = shapes[i % shapes.length];
      p.style.left = Math.random() * 100 + '%';
      p.style.color = colors[i % colors.length];
      p.style.fontSize = (5 + Math.random() * 12) + 'px';
      p.style.setProperty('--duration', (2 + Math.random() * 3) + 's');
      p.style.setProperty('--delay', (Math.random() * 1.8) + 's');
      p.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
      DOM.confettiContainer.appendChild(p);
    }
  }

  /* ========================================================================
     RESET
     ======================================================================== */
  function resetGame() {
    DOM.modalOverlay.classList.remove('modal-overlay--visible');
    DOM.floatContainer.innerHTML = '';
    DOM.toastContainer.innerHTML = '';
    document.querySelectorAll('.card--mismatch').forEach(e => e.classList.remove('card--mismatch'));
    DOM.screenShake.classList.remove('shaking');

    state = fresh();
    state.level = loadLevel();
    state.theme = DOM.theme.value;
    state.difficulty = DOM.difficulty.value;
    applyTheme(state.theme);
    renderBoard();
  }

  /* ========================================================================
     EVENTS
     ======================================================================== */
  function setupEvents() {
    DOM.difficulty.addEventListener('change', resetGame);
    DOM.theme.addEventListener('change', resetGame);
    DOM.resetBtn.addEventListener('click', resetGame);
    DOM.playAgainBtn.addEventListener('click', resetGame);
    DOM.modalOverlay.addEventListener('click', e => {
      if (e.target === DOM.modalOverlay) resetGame();
    });
  }

  /* ========================================================================
     PARTICLES
     ======================================================================== */
  class Particles {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.pts = [];
      this.key = 'space';
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.init();
      this.loop();
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    setTheme(key) { this.key = key; this.init(); }

    init() {
      const cfg = THEMES[this.key].particles;
      this.pts = [];
      for (let i = 0; i < cfg.count; i++) {
        this.pts.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          vx: (Math.random() - 0.5) * cfg.speed,
          vy: (Math.random() - 0.5) * cfg.speed - 0.08,
          s: cfg.size * (0.4 + Math.random()),
          a: 0.15 + Math.random() * 0.4,
        });
      }
    }

    loop() {
      this.update();
      this.draw();
      requestAnimationFrame(() => this.loop());
    }

    update() {
      const cfg = THEMES[this.key].particles;
      for (const p of this.pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = this.canvas.width;
        if (p.x > this.canvas.width) p.x = 0;
        if (p.y < 0) p.y = this.canvas.height;
        if (p.y > this.canvas.height) p.y = 0;
        p.a += (Math.random() - 0.5) * 0.015;
        p.a = Math.max(0.05, Math.min(0.6, p.a));
      }
    }

    draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      const cfg = THEMES[this.key].particles;

      for (const p of this.pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${cfg.hue}, 80%, 65%, ${p.a})`;
        ctx.fill();

        if (p.s > 1.2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.s * 3, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${cfg.hue}, 80%, 65%, ${p.a * 0.12})`;
          ctx.fill();
        }
      }
    }
  }

  /* ========================================================================
     BOOT
     ======================================================================== */
  function init() {
    state = fresh();
    state.level = loadLevel();
    particles = new Particles(DOM.canvas);
    applyTheme(state.theme);
    setupEvents();
    renderBoard();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
