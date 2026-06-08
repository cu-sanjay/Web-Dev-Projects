(function(){
  'use strict';

  const STATE = {
    n: 2,
    running: false,
    trialCount: 0,
    maxTrials: 20,
    history: [],
    score: 0,
    correctCount: 0,
    incorrectCount: 0,
    missedMatches: 0,
    timer: null,
    currentStimulus: null,
    audioCtx: null,
    feedbackTimers: []
  };

  const LETTER_FREQ = {
    A:440.00, B:493.88, C:523.25, D:587.33, E:659.25,
    F:698.46, G:783.99, H:880.00, I:987.77, J:1046.50,
    K:1174.66, L:1318.51, M:1396.91, N:1567.98, O:1760.00,
    P:1975.53, Q:2093.00, R:2349.32, S:2637.02, T:2793.83,
    U:3135.96, V:3520.00, W:3951.07, X:4186.01, Y:4698.63,
    Z:5274.04
  };

  const LETTERS = Object.keys(LETTER_FREQ);

  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);

  const el = {
    score: $('score-display'),
    accuracy: $('accuracy-display'),
    missed: $('missed-display'),
    trial: $('trial-display'),
    nLevel: $('n-level'),
    startBtn: $('start-btn'),
    letterPrompt: $('audio-letter-prompt'),
    grid: $('spatial-grid'),
    posBtn: $('pos-match-btn'),
    letBtn: $('let-match-btn'),
    pb: $('personal-best'),
    pbDisplay: $('pb-display')
  };

  const gridCells = $$('.grid-cell');

  function randomInt(max){
    return Math.floor(Math.random() * max);
  }

  function randomLetter(){
    return LETTERS[randomInt(LETTERS.length)];
  }

  function getCell(index){
    return document.querySelector(`.grid-cell[data-index="${index}"]`);
  }

  function clearFeedback(){
    STATE.feedbackTimers.forEach(t => clearTimeout(t));
    STATE.feedbackTimers = [];
    gridCells.forEach(c => { c.classList.remove('correct','incorrect','active-flash'); });
    el.letterPrompt.classList.remove('correct','incorrect','active-flash');
  }

  function clearActiveFlash(){
    gridCells.forEach(c => c.classList.remove('active-flash'));
    el.letterPrompt.classList.remove('active-flash');
  }

  function showFeedback(element, type){
    element.classList.remove('correct','incorrect','active-flash');
    element.classList.add(type);
    const tid = setTimeout(() => {
      element.classList.remove(type);
    }, 500);
    STATE.feedbackTimers.push(tid);
  }

  function playTone(letter){
    const freq = LETTER_FREQ[letter];
    if (!freq) return;
    try {
      if (!STATE.audioCtx){
        STATE.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (STATE.audioCtx.state === 'suspended'){
        STATE.audioCtx.resume();
      }
      const osc = STATE.audioCtx.createOscillator();
      const gain = STATE.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, STATE.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.28, STATE.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, STATE.audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(STATE.audioCtx.destination);
      osc.start(STATE.audioCtx.currentTime);
      osc.stop(STATE.audioCtx.currentTime + 0.4);
    } catch(e){/* audio context may be blocked */}
  }

  function updateMetrics(){
    const totalResp = STATE.correctCount + STATE.incorrectCount;
    const acc = totalResp > 0 ? Math.round((STATE.correctCount / totalResp) * 100) : 0;
    el.score.textContent = STATE.score;
    el.accuracy.textContent = acc + '%';
    el.missed.textContent = STATE.missedMatches;
    el.trial.textContent = STATE.trialCount + ' / ' + STATE.maxTrials;
  }

  function generateStimulus(){
    const cell = randomInt(9);
    const letter = randomLetter();
    const idx = STATE.history.length;
    let posMatch = false;
    let letMatch = false;
    if (idx >= STATE.n){
      const back = STATE.history[idx - STATE.n];
      posMatch = back.cell === cell;
      letMatch = back.letter === letter;
    }
    return { cell, letter, posMatch, letMatch, posResponded: false, letResponded: false, posCorrect: null, letCorrect: null };
  }

  function displayStimulus(stim){
    clearActiveFlash();
    getCell(stim.cell).classList.add('active-flash');
    el.letterPrompt.textContent = stim.letter;
    el.letterPrompt.classList.add('active-flash');
    playTone(stim.letter);
  }

  function checkMisses(){
    const s = STATE.currentStimulus;
    if (!s) return;
    if (s.posMatch && !s.posResponded) STATE.missedMatches++;
    if (s.letMatch && !s.letResponded) STATE.missedMatches++;
  }

  function nextTrial(){
    if (!STATE.running) return;
    clearFeedback();
    checkMisses();
    STATE.trialCount++;
    if (STATE.trialCount > STATE.maxTrials){
      endSession();
      return;
    }
    const stim = generateStimulus();
    STATE.currentStimulus = stim;
    STATE.history.push(stim);
    displayStimulus(stim);
    updateMetrics();
  }

  function handlePositionMatch(){
    if (!STATE.running || !STATE.currentStimulus) return;
    const s = STATE.currentStimulus;
    if (s.posResponded) return;
    s.posResponded = true;
    const matched = s.posMatch;
    s.posCorrect = matched;
    if (matched){
      STATE.score++;
      STATE.correctCount++;
      showFeedback(getCell(s.cell), 'correct');
    } else {
      STATE.incorrectCount++;
      showFeedback(getCell(s.cell), 'incorrect');
    }
    updateMetrics();
  }

  function handleLetterMatch(){
    if (!STATE.running || !STATE.currentStimulus) return;
    const s = STATE.currentStimulus;
    if (s.letResponded) return;
    s.letResponded = true;
    const matched = s.letMatch;
    s.letCorrect = matched;
    if (matched){
      STATE.score++;
      STATE.correctCount++;
      showFeedback(el.letterPrompt, 'correct');
    } else {
      STATE.incorrectCount++;
      showFeedback(el.letterPrompt, 'incorrect');
    }
    updateMetrics();
  }

  function endSession(){
    STATE.running = false;
    clearFeedback();
    clearActiveFlash();
    el.letterPrompt.textContent = '—';
    if (STATE.timer){
      clearInterval(STATE.timer);
      STATE.timer = null;
    }
    el.startBtn.textContent = 'Start Training Cycle';
    el.startBtn.disabled = false;
    el.nLevel.disabled = false;
    el.posBtn.disabled = true;
    el.letBtn.disabled = true;

    const totalResp = STATE.correctCount + STATE.incorrectCount;
    const acc = totalResp > 0 ? Math.round((STATE.correctCount / totalResp) * 100) : 0;
    saveMilestone(STATE.n, STATE.score, acc);
    updateMetrics();
  }

  function saveMilestone(n, score, accuracy){
    let milestones = {};
    try {
      milestones = JSON.parse(localStorage.getItem('dnb-milestones')) || {};
    } catch(e){}
    const key = 'n' + n;
    const prev = milestones[key];
    if (!prev || score > prev.score || (score === prev.score && accuracy > prev.accuracy)){
      milestones[key] = { score, accuracy, date: new Date().toISOString() };
      localStorage.setItem('dnb-milestones', JSON.stringify(milestones));
    }
    renderMilestones(milestones);
  }

  function renderMilestones(milestones){
    const keys = Object.keys(milestones).filter(k => k.startsWith('n'));
    if (keys.length === 0){
      el.pb.style.display = 'none';
      return;
    }
    const last = keys[keys.length - 1];
    const m = milestones[last];
    el.pb.style.display = 'flex';
    el.pbDisplay.textContent = last.toUpperCase() + ' — Score: ' + m.score + ' — Acc: ' + m.accuracy + '%';
  }

  function loadMilestones(){
    try {
      const data = JSON.parse(localStorage.getItem('dnb-milestones')) || {};
      renderMilestones(data);
    } catch(e){}
  }

  function startSession(){
    if (STATE.running) return;
    clearFeedback();
    STATE.n = parseInt(el.nLevel.value, 10);
    STATE.running = true;
    STATE.trialCount = 0;
    STATE.history = [];
    STATE.score = 0;
    STATE.correctCount = 0;
    STATE.incorrectCount = 0;
    STATE.missedMatches = 0;
    STATE.currentStimulus = null;
    STATE.audioCtx = null;

    el.startBtn.textContent = 'Training...';
    el.startBtn.disabled = true;
    el.nLevel.disabled = true;
    el.posBtn.disabled = false;
    el.letBtn.disabled = false;

    clearActiveFlash();
    el.letterPrompt.textContent = '—';
    el.letterPrompt.classList.remove('active-flash','correct','incorrect');

    updateMetrics();

    if (STATE.timer){
      clearInterval(STATE.timer);
    }
    STATE.timer = setInterval(nextTrial, 2000);
  }

  function init(){
    el.startBtn.addEventListener('click', startSession);
    el.posBtn.addEventListener('click', handlePositionMatch);
    el.letBtn.addEventListener('click', handleLetterMatch);
    el.posBtn.disabled = true;
    el.letBtn.disabled = true;

    document.addEventListener('keydown', function(e){
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      if (key === 'a'){
        e.preventDefault();
        handlePositionMatch();
      } else if (key === 'l'){
        e.preventDefault();
        handleLetterMatch();
      }
    });

    el.nLevel.addEventListener('change', function(){
      STATE.n = parseInt(this.value, 10);
    });

    loadMilestones();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
