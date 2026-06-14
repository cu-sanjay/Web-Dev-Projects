const IMAGES = [
      { name: "Lion", url: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=600&q=80" },
      { name: "Eiffel Tower", url: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=600&q=80" },
      { name: "Pizza", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80" },
      { name: "Space", url: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&q=80" },
      { name: "Ocean", url: "https://images.unsplash.com/photo-1505118380757-91f5f45d8de4?w=600&q=80" },
      { name: "Mountain", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80" },
      { name: "Coffee", url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80" },
      { name: "Forest", url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80" },
      { name: "Elephant", url: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=600&q=80" },
      { name: "Cityscape", url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80" }
    ];

    let state = { score: 0, round: 0, current: null, shuffled: [] };

    function initGame() {
      state = { score: 0, round: 0, shuffled: [...IMAGES].sort(() => Math.random() - 0.5) };
      document.getElementById('start-screen').classList.add('hidden');
      document.getElementById('end-screen').classList.add('hidden');
      document.getElementById('score-val').textContent = "0";
      loadRound();
    }

    function loadRound() {
      if (state.round >= 10) return finishGame();
      state.current = state.shuffled[state.round];
      document.getElementById('round-indicator').textContent = `ROUND ${state.round + 1}/10`;
      const img = document.getElementById('display-img');
      img.style.opacity = '0';
      setTimeout(() => { img.src = state.current.url; img.onload = () => img.style.opacity = '1'; }, 50);

      let opts = [state.current.name];
      while (opts.length < 4) {
        const r = IMAGES[Math.floor(Math.random() * IMAGES.length)].name;
        if (!opts.includes(r)) opts.push(r);
      }
      opts.sort(() => Math.random() - 0.5);

      const container = document.getElementById('options-container');
      container.innerHTML = '';
      opts.forEach(o => {
        const b = document.createElement('button');
        b.className = 'opt-btn';
        b.textContent = o;
        b.onclick = () => {
          document.querySelectorAll('.opt-btn').forEach(btn => btn.disabled = true);
          if (o === state.current.name) {
            state.score++;
            b.classList.add('correct');
            document.getElementById('score-val').textContent = state.score;
          } else {
            b.classList.add('wrong');
            Array.from(container.children).find(x => x.textContent === state.current.name).classList.add('correct');
          }
          setTimeout(() => { state.round++; loadRound(); }, 1200);
        };
        container.appendChild(b);
      });
    }

    function finishGame() {
      document.getElementById('end-screen').classList.remove('hidden');
      document.getElementById('final-stats').textContent = `Correct: ${state.score} / 10`;
    }