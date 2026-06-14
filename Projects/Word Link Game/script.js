  const START_WORDS = ["PLANET", "DRAGON", "COFFEE", "GUITAR", "WIZARD", "ORANGE", "ENERGY", "BRIGHT", "GHOST", "PIZZA"];
    let state = { score: 0, chain: [], timeLeft: 20, timer: null };

    const elements = {
      input: document.getElementById('user-input'),
      target: document.getElementById('target-word'),
      score: document.getElementById('score-val'),
      feedback: document.getElementById('feedback'),
      timer: document.getElementById('timer-progress'),
      start: document.getElementById('start-screen'),
      end: document.getElementById('end-screen'),
      finalScore: document.getElementById('final-score')
    };

    function initGame() {
      state.score = 0;
      state.timeLeft = 20;
      const startWord = START_WORDS[Math.floor(Math.random() * START_WORDS.length)];
      state.chain = [startWord];
      
      elements.score.textContent = "0";
      elements.target.innerHTML = formatWord(startWord);
      elements.input.value = "";
      elements.feedback.textContent = "";
      
      elements.start.classList.add('hidden');
      elements.end.classList.add('hidden');
      elements.input.focus();
      
      resetTimer();
    }

    function formatWord(word) {
      const last = word.slice(-1);
      return word.slice(0, -1) + `<span class="highlight">${last}</span>`;
    }

    function resetTimer() {
      clearInterval(state.timer);
      state.timeLeft = 20;
      updateTimerUI();
      state.timer = setInterval(() => {
        state.timeLeft--;
        updateTimerUI();
        if (state.timeLeft <= 0) endGame();
      }, 1000);
    }

    function updateTimerUI() {
      const percent = (state.timeLeft / 20) * 100;
      elements.timer.style.width = percent + "%";
      if (state.timeLeft <= 5) elements.timer.style.background = "var(--error)";
      else elements.timer.style.background = "var(--accent)";
    }

    function submitWord() {
      const val = elements.input.value.trim().toUpperCase();
      if (!val) return;

      const lastWord = state.chain[state.chain.length - 1];
      const requiredLetter = lastWord.slice(-1);

      if (val[0] !== requiredLetter) {
        showFeedback(`Must start with ${requiredLetter}`, "var(--error)");
        return;
      }

      if (state.chain.includes(val)) {
        showFeedback("Already used!", "var(--error)");
        return;
      }

      if (val.length < 3) {
        showFeedback("Too short! (min 3)", "var(--error)");
        return;
      }

      // Success logic
      state.chain.push(val);
      state.score += val.length * 10;
      elements.score.textContent = state.score;
      elements.target.innerHTML = formatWord(val);
      elements.input.value = "";
      showFeedback("Excellent! +Time", "var(--success)");
      
      // Reward with some extra time
      state.timeLeft = Math.min(state.timeLeft + 6, 20);
      updateTimerUI();
    }

    function showFeedback(msg, color) {
      elements.feedback.textContent = msg;
      elements.feedback.style.color = color;
      setTimeout(() => {
        if (elements.feedback.textContent === msg) elements.feedback.textContent = "";
      }, 1500);
    }

    function endGame() {
      clearInterval(state.timer);
      elements.finalScore.textContent = state.score;
      elements.end.classList.remove('hidden');
    }

    elements.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') submitWord();
    });