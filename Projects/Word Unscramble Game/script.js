 const WORDS = ["JUMP", "BRAIN", "ORANGE", "GHOST", "PIZZA", "PLANET", "COFFEE", "GUITAR", "WIZARD", "DRAGON"];
    let state = { level: 0, score: 0, currentWord: "", pool: [] };

    function scramble(word) {
      let arr = word.split('');
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      let scrambled = arr.join('');
      return scrambled === word ? scramble(word) : scrambled;
    }

    function initGame() {
      state = { level: 0, score: 0, pool: [...WORDS].sort(() => Math.random() - 0.5) };
      document.getElementById('start-screen').classList.add('hidden');
      document.getElementById('end-screen').classList.add('hidden');
      document.getElementById('score-val').textContent = "0";
      loadLevel();
    }

    function loadLevel() {
      if (state.level >= state.pool.length) return finishGame();
      state.currentWord = state.pool[state.level];
      document.getElementById('level-indicator').textContent = `LEVEL ${state.level + 1}/${state.pool.length}`;
      document.getElementById('word-display').textContent = scramble(state.currentWord);
      document.getElementById('user-input').value = "";
      document.getElementById('user-input').focus();
      document.getElementById('feedback').textContent = "";
    }

    function checkAnswer() {
      const input = document.getElementById('user-input').value.trim().toUpperCase();
      const feedback = document.getElementById('feedback');
      if (input === state.currentWord) {
        state.score += 10; state.level++;
        document.getElementById('score-val').textContent = state.score;
        feedback.textContent = "Correct! ✨"; feedback.style.color = "var(--success)";
        setTimeout(loadLevel, 1000);
      } else {
        feedback.textContent = "Try again! ❌"; feedback.style.color = "var(--error)";
        document.getElementById('user-input').select();
      }
    }

    function finishGame() { document.getElementById('end-screen').classList.remove('hidden'); }
  