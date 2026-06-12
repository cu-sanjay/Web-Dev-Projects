 const DATA = [
      { w: "GHOST", p: "GHO_T", m: "S" },
      { w: "BRAIN", p: "BRA_N", m: "I" },
      { w: "SPACE", p: "SPA_E", m: "C" },
      { w: "LIGHT", p: "LIG_T", m: "H" },
      { w: "POWER", p: "POW_R", m: "E" },
      { w: "FLAME", p: "FLA_E", m: "M" },
      { w: "OCEAN", p: "OC_AN", m: "E" },
      { w: "BREAD", p: "BRE_D", m: "A" },
      { w: "CLOCK", p: "CLO_K", m: "C" },
      { w: "FRUIT", p: "FR_IT", m: "U" }
    ];

    let state = { score: 0, round: 0, current: null, pool: [] };

    function initGame() {
      state = { score: 0, round: 0, pool: [...DATA].sort(() => Math.random() - 0.5) };
      document.getElementById('start-screen').classList.add('hidden');
      document.getElementById('end-screen').classList.add('hidden');
      document.getElementById('score-val').textContent = "0";
      loadRound();
    }

    function loadRound() {
      if (state.round >= 10) return finishGame();
      state.current = state.pool[state.round];
      document.getElementById('round-indicator').textContent = `ROUND ${state.round + 1}/10`;
      
      document.getElementById('display-word').innerHTML = state.current.p.replace('_', '<span></span>');

      let letters = [state.current.m];
      const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      while (letters.length < 6) {
        const char = alpha[Math.floor(Math.random() * 26)];
        if (!letters.includes(char)) letters.push(char);
      }
      letters.sort(() => Math.random() - 0.5);

      const container = document.getElementById('options-container');
      container.innerHTML = '';
      letters.forEach(l => {
        const b = document.createElement('button');
        b.className = 'opt-btn';
        b.textContent = l;
        b.onclick = () => {
          const btns = document.querySelectorAll('.opt-btn');
          btns.forEach(x => x.disabled = true);
          if (l === state.current.m) {
            state.score += 10;
            b.classList.add('correct');
            document.getElementById('score-val').textContent = state.score;
            document.getElementById('display-word').textContent = state.current.w;
          } else {
            b.classList.add('wrong');
            Array.from(btns).find(x => x.textContent === state.current.m).classList.add('correct');
          }
          setTimeout(() => { state.round++; loadRound(); }, 1200);
        };
        container.appendChild(b);
      });
    }

    function finishGame() {
      document.getElementById('end-screen').classList.remove('hidden');
      document.getElementById('final-stats').textContent = `Score: ${state.score} / 100`;
    }