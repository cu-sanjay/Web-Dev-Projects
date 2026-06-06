document.addEventListener('DOMContentLoaded', () => {
  // Dictionary sets
  const WORD_BANKS = {
    easy: [
      "the", "of", "to", "and", "a", "in", "is", "it", "you", "that", "he", "was", "for", "on", "are", "as", "with", "his", "they", "I",
      "at", "be", "this", "have", "from", "or", "one", "had", "by", "word", "but", "not", "what", "all", "were", "we", "when", "your", "can", "said"
    ],
    medium: [
      "about", "before", "between", "country", "different", "during", "example", "family", "govern", "happen", "important", "journal", "keep", "large", "member", "nation", "occur", "public", "question", "reason",
      "school", "simple", "thought", "under", "value", "window", "yesterday", "balance", "dynamic", "capture", "display", "process", "quality", "respond", "support", "network", "system", "program", "science", "library"
    ],
    hard: [
      "architecture", "biodegradable", "characteristic", "differentiate", "establishment", "fluctuation", "globalization", "hypothetical", "implementation", "jurisdiction", "kinetic", "luminescence", "multidimensional", "nanotechnology", "omnipresent", "philosophical", "quintessential", "reconciliation", "synchronization", "transportation"
    ]
  };

  // Web Audio Synth Haptic Click Sound generator
  class SoundSynth {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    init() {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
    }

    playClick(isError = false) {
      if (!this.enabled) return;
      this.init();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (isError) {
        // Harsh low click for typing error
        osc.frequency.setValueAtTime(120, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
      } else {
        // High crisp synthetic mechanical typewriter click
        osc.frequency.setValueAtTime(1000, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
      }
    }
  }

  // App State Manager
  class TypingEngine {
    constructor() {
      this.timeLimit = 30; // seconds
      this.timeLeft = 30;
      this.difficulty = 'easy';
      this.timerInterval = null;
      this.isTesting = false;
      this.hasStarted = false;

      // Stats
      this.typedCharacters = 0;
      this.correctCharacters = 0;
      this.errors = 0;
      this.wpmHistory = []; // tracked second by second for graph

      // Words layout arrays
      this.words = [];
      this.activeWordIndex = 0;
      this.activeCharIndex = 0;

      // Storage
      this.highScore = parseInt(localStorage.getItem('tpa_high_score')) || 0;
      this.totalTests = parseInt(localStorage.getItem('tpa_total_tests')) || 0;
      this.avgWPM = parseInt(localStorage.getItem('tpa_avg_wpm')) || 0;
      this.avgAcc = parseInt(localStorage.getItem('tpa_avg_acc')) || 0;
      this.historyLogs = JSON.parse(localStorage.getItem('tpa_history_logs')) || [];

      // Audio Click
      this.sfx = new SoundSynth();
      this.sfx.enabled = localStorage.getItem('tpa_audio_sfx') !== 'off';
    }

    generateWords() {
      const bank = WORD_BANKS[this.difficulty];
      const randomized = [];
      for (let i = 0; i < 60; i++) {
        const idx = Math.floor(Math.random() * bank.length);
        randomized.push(bank[idx]);
      }
      this.words = randomized;
      this.activeWordIndex = 0;
      this.activeCharIndex = 0;
    }

    startTest() {
      this.isTesting = true;
      this.hasStarted = true;
      this.timeLeft = this.timeLimit;
      this.typedCharacters = 0;
      this.correctCharacters = 0;
      this.errors = 0;
      this.wpmHistory = [];

      clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => {
        this.timeLeft--;
        
        // Track stats history for SVG timeline plotting
        const elapsed = this.timeLimit - this.timeLeft;
        const currentWpm = this.calculateWPM(elapsed);
        this.wpmHistory.push({ second: elapsed, wpm: currentWpm });

        if (this.timeLeft <= 0) {
          this.endTest();
        } else {
          this.onTick();
        }
      }, 1000);
    }

    endTest() {
      clearInterval(this.timerInterval);
      this.isTesting = false;
      this.hasStarted = false;

      // Calculate final stats parameters
      const totalElapsed = this.timeLimit;
      const finalWpm = this.calculateWPM(totalElapsed);
      const finalAcc = this.calculateAccuracy();

      // Persist Stats
      this.totalTests++;
      if (finalWpm > this.highScore) {
        this.highScore = finalWpm;
        localStorage.setItem('tpa_high_score', this.highScore);
      }
      
      this.avgWPM = Math.round(((this.avgWPM * (this.totalTests - 1)) + finalWpm) / this.totalTests);
      this.avgAcc = Math.round(((this.avgAcc * (this.totalTests - 1)) + finalAcc) / this.totalTests);
      
      localStorage.setItem('tpa_total_tests', this.totalTests);
      localStorage.setItem('tpa_avg_wpm', this.avgWPM);
      localStorage.setItem('tpa_avg_acc', this.avgAcc);

      // Add to logs histories
      const logRecord = {
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        wpm: finalWpm,
        accuracy: finalAcc,
        difficulty: this.difficulty.toUpperCase()
      };
      this.historyLogs.unshift(logRecord);
      if (this.historyLogs.length > 20) this.historyLogs.pop();
      localStorage.setItem('tpa_history_logs', JSON.stringify(this.historyLogs));

      this.onComplete(finalWpm, finalAcc, this.correctCharacters, this.typedCharacters);
    }

    reset() {
      clearInterval(this.timerInterval);
      this.isTesting = false;
      this.hasStarted = false;
      this.timeLeft = this.timeLimit;
      this.generateWords();
    }

    calculateWPM(secondsElapsed = 30) {
      if (secondsElapsed <= 0) return 0;
      // WPM = (Correct Characters / 5) / (Minutes Elapsed)
      const minutes = secondsElapsed / 60;
      const wpm = (this.correctCharacters / 5) / minutes;
      return Math.round(wpm);
    }

    calculateAccuracy() {
      if (this.typedCharacters === 0) return 100;
      return Math.round((this.correctCharacters / this.typedCharacters) * 100);
    }

    // Callbacks placeholder triggers overridden by UI Controller binding
    onTick() {}
    onComplete() {}
  }

  // UI Controller mapping & rendering
  class UIController {
    constructor(engine) {
      this.engine = engine;

      // Elements
      this.hoursEl = document.getElementById('hours');
      this.minutesEl = document.getElementById('minutes');
      this.liveWpm = document.getElementById('live-wpm');
      this.liveAccuracy = document.getElementById('live-accuracy');
      this.liveTimer = document.getElementById('live-timer');
      this.wordsContainer = document.getElementById('words-container');
      this.keyboardCatcher = document.getElementById('keyboard-catcher');
      this.typingBoxContainer = document.getElementById('typing-box-container');
      
      // Control buttons
      this.timeButtons = document.querySelectorAll('#time-select .toggle-btn');
      this.diffButtons = document.querySelectorAll('#diff-select .toggle-btn');
      this.audioToggle = document.getElementById('audio-toggle');
      this.highScoreVal = document.getElementById('high-score-val');
      
      // Performance layouts
      this.avgWpmVal = document.getElementById('avg-wpm-val');
      this.avgAccVal = document.getElementById('avg-acc-val');
      this.testsCountVal = document.getElementById('tests-count-val');
      this.historyLogsContainer = document.getElementById('history-logs-container');

      // Modals
      this.resultsModal = document.getElementById('results-modal');
      this.resWpm = document.getElementById('res-wpm');
      this.resAcc = document.getElementById('res-acc');
      this.resChars = document.getElementById('res-chars');
      this.wpmSvgGraph = document.getElementById('wpm-svg-graph');
      this.modalRetryBtn = document.getElementById('modal-retry-btn');
      this.modalCloseBtn = document.getElementById('modal-close-btn');

      this.init();
    }

    init() {
      // Bind controls listeners
      this.timeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          this.timeButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.engine.timeLimit = parseInt(btn.dataset.time);
          this.resetTest();
        });
      });

      this.diffButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          this.diffButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.engine.difficulty = btn.dataset.diff;
          this.resetTest();
        });
      });

      // Sound trigger
      this.audioToggle.addEventListener('click', () => {
        this.engine.sfx.enabled = !this.engine.sfx.enabled;
        localStorage.setItem('tpa_audio_sfx', this.engine.sfx.enabled ? 'on' : 'off');
        this.audioToggle.classList.toggle('active');
      });

      if (this.engine.sfx.enabled) {
        this.audioToggle.classList.add('active');
      } else {
        this.audioToggle.classList.remove('active');
      }

      // Input click handlers catcher
      this.typingBoxContainer.addEventListener('click', () => {
        this.keyboardCatcher.focus();
        this.typingBoxContainer.classList.remove('blurred');
      });

      this.keyboardCatcher.addEventListener('blur', () => {
        this.typingBoxContainer.classList.add('blurred');
      });

      // Character input capture logic
      this.keyboardCatcher.addEventListener('input', (e) => this.handleInput(e));

      // Theme toggle triggers
      document.querySelectorAll('.theme-picker .theme-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          document.querySelectorAll('.theme-picker .theme-dot').forEach(d => d.classList.remove('active'));
          dot.classList.add('active');
          
          document.body.className = '';
          document.body.classList.add(`theme-${dot.dataset.theme}`);
          localStorage.setItem('tpa_theme', dot.dataset.theme);
        });
      });

      // Load initial cached preferences
      const cachedTheme = localStorage.getItem('tpa_theme') || 'cyan';
      const activeThemeDot = document.querySelector(`.theme-picker .theme-dot.${cachedTheme}`);
      if (activeThemeDot) activeThemeDot.click();

      // Modal Triggers
      this.modalRetryBtn.addEventListener('click', () => {
        this.resultsModal.classList.remove('open');
        this.resetTest();
      });

      this.modalCloseBtn.addEventListener('click', () => {
        this.resultsModal.classList.remove('open');
        this.resetTest();
      });

      // Bind Engine Callbacks
      this.engine.onTick = () => {
        this.liveTimer.textContent = this.engine.timeLeft;
        const currentElapsed = this.engine.timeLimit - this.engine.timeLeft;
        this.liveWpm.textContent = this.engine.calculateWPM(currentElapsed);
        this.liveAccuracy.textContent = `${this.engine.calculateAccuracy()}%`;
      };

      this.engine.onComplete = (wpm, acc, correct, total) => {
        this.resWpm.textContent = wpm;
        this.resAcc.textContent = `${acc}%`;
        this.resChars.textContent = `${correct}/${total}`;
        
        this.renderGraph();
        this.resultsModal.classList.add('open');
        this.updateStatsDisplay();
      };

      // Set focus visual
      this.typingBoxContainer.classList.add('blurred');
      this.resetTest();
      this.updateStatsDisplay();
    }

    resetTest() {
      this.engine.reset();
      this.liveTimer.textContent = this.engine.timeLimit;
      this.liveWpm.textContent = '0';
      this.liveAccuracy.textContent = '100%';
      this.keyboardCatcher.value = '';
      this.renderWords();
    }

    updateStatsDisplay() {
      this.highScoreVal.textContent = `${this.engine.highScore} WPM`;
      this.avgWpmVal.textContent = `${this.engine.avgWPM} WPM`;
      this.avgAccVal.textContent = `${this.engine.avgAcc}%`;
      this.testsCountVal.textContent = this.engine.totalTests;

      // History logs rendering
      this.historyLogsContainer.innerHTML = '';
      if (this.engine.historyLogs.length === 0) {
        this.historyLogsContainer.innerHTML = `<div class="no-history">No tests completed yet. Ready? Go!</div>`;
      } else {
        this.engine.historyLogs.forEach(log => {
          const item = document.createElement('div');
          item.className = 'history-item';
          item.innerHTML = `
            <div class="hist-left">
              <span class="hist-diff">${log.difficulty}</span>
              <span class="hist-date">${log.date}</span>
            </div>
            <div class="hist-right">
              <span class="hist-wpm">${log.wpm} WPM</span>
              <span class="hist-acc">${log.accuracy}% ACC</span>
            </div>
          `;
          this.historyLogsContainer.appendChild(item);
        });
      }
    }

    renderWords() {
      this.wordsContainer.innerHTML = '';
      this.engine.words.forEach((wordText, wIdx) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';
        wordSpan.id = `w-${wIdx}`;
        
        // Character components
        for (let cIdx = 0; cIdx < wordText.length; cIdx++) {
          const charSpan = document.createElement('span');
          charSpan.textContent = wordText[cIdx];
          wordSpan.appendChild(charSpan);
        }

        // Add a space character at the end of every word except final
        if (wIdx < this.engine.words.length - 1) {
          const spaceSpan = document.createElement('span');
          spaceSpan.textContent = ' ';
          spaceSpan.className = 'space-char';
          wordSpan.appendChild(spaceSpan);
        }

        this.wordsContainer.appendChild(wordSpan);
      });

      this.updateActiveIndicator();
    }

    updateActiveIndicator() {
      // Clear previous active markers
      document.querySelectorAll('.words-wrapper span').forEach(el => el.classList.remove('active'));

      const activeWordEl = document.getElementById(`w-${this.engine.activeWordIndex}`);
      if (activeWordEl) {
        const charElements = activeWordEl.querySelectorAll('span');
        if (charElements[this.engine.activeCharIndex]) {
          charElements[this.engine.activeCharIndex].classList.add('active');
          
          // Scroll box helper so active line stays visible
          const activeTop = activeWordEl.offsetTop;
          this.wordsContainer.scrollTop = activeTop - 30;
        }
      }
    }

    handleInput(e) {
      if (!this.engine.isTesting && !this.engine.hasStarted) {
        this.engine.startTest();
      }

      const inputVal = e.target.value;
      const lastTyped = inputVal.slice(-1);

      const activeWordEl = document.getElementById(`w-${this.engine.activeWordIndex}`);
      if (!activeWordEl) return;

      const charElements = activeWordEl.querySelectorAll('span');
      const targetCharEl = charElements[this.engine.activeCharIndex];
      if (!targetCharEl) return;

      const expectedChar = targetCharEl.textContent;

      // Match check
      const isCorrect = (lastTyped === expectedChar);
      this.engine.typedCharacters++;

      if (isCorrect) {
        targetCharEl.classList.remove('wrong');
        targetCharEl.classList.add('correct');
        this.engine.correctCharacters++;
        this.engine.sfx.playClick(false);
      } else {
        targetCharEl.classList.remove('correct');
        targetCharEl.classList.add('wrong');
        this.engine.errors++;
        this.engine.sfx.playClick(true);
      }

      // Map dynamic virtual keyboard pressed visual highlight
      this.animateVirtualKey(expectedChar.toLowerCase());

      // Advance indices logic
      this.engine.activeCharIndex++;
      if (this.engine.activeCharIndex >= charElements.length) {
        this.engine.activeWordIndex++;
        this.engine.activeCharIndex = 0;
      }

      // Reset catcher inputs
      e.target.value = '';
      this.updateActiveIndicator();
    }

    animateVirtualKey(keyChar) {
      const keyEl = document.querySelector(`.key[data-key="${keyChar}"]`);
      if (keyEl) {
        keyEl.classList.add('pressed');
        setTimeout(() => keyEl.classList.remove('pressed'), 100);
      }
    }

    renderGraph() {
      const history = this.engine.wpmHistory;
      if (history.length === 0) return;

      const svgW = 500;
      const svgH = 150;
      const padding = 15;

      const maxWpm = Math.max(...history.map(d => d.wpm), 40); // default grid scale max
      const totalSecs = history.length;

      let dPath = "";
      let nodesMarkup = "";

      history.forEach((point, idx) => {
        const x = padding + (idx / (totalSecs - 1)) * (svgW - padding * 2);
        const y = svgH - padding - (point.wpm / maxWpm) * (svgH - padding * 2);

        if (idx === 0) {
          dPath += `M ${x} ${y}`;
        } else {
          dPath += ` L ${x} ${y}`;
        }

        nodesMarkup += `<circle class="graph-node" cx="${x}" cy="${y}" r="4" />`;
      });

      this.wpmSvgGraph.innerHTML = `
        <path class="graph-line" d="${dPath}" fill="none" stroke-width="3"></path>
        ${nodesMarkup}
      `;
    }
  }

  // Ignite Architecture
  const engine = new TypingEngine();
  new UIController(engine);
});
