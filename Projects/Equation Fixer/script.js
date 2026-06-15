const PUZZLES = [
            { q: ["2", "+", "5", "=", "3"], a: ["2", "+", "3", "=", "5"] },
            { q: ["9", "-", "2", "=", "11"], a: ["9", "+", "2", "=", "11"] },
            { q: ["4", "*", "2", "=", "6"], a: ["4", "+", "2", "=", "6"] },
            { q: ["8", "=", "10", "+", "2"], a: ["10", "=", "8", "+", "2"] },
            { q: ["12", "/", "3", "=", "9"], a: ["12", "-", "3", "=", "9"] },
            { q: ["7", "+", "1", "=", "6"], a: ["7", "-", "1", "=", "6"] },
            { q: ["20", "=", "5", "*", "15"], a: ["20", "=", "5", "+", "15"] }
        ];

        let state = {
            level: 0,
            score: 0,
            currentEq: [],
            selectedIndex: null
        };

        function startGame() {
            state.level = 0;
            state.score = 0;
            document.getElementById('game-overlay').classList.add('hidden');
            loadLevel();
        }

        function loadLevel() {
            if (state.level >= PUZZLES.length) return end() ;
            state.currentEq = [...PUZZLES[state.level].q];
            state.selectedIndex = null;
            
            document.getElementById('level-val').innerText = state.level + 1;
            document.getElementById('score-val').innerText = state.score;
            document.getElementById('feedback').innerText = "";
            render();
        }

        function render() {
            const container = document.getElementById('eq-row');
            container.innerHTML = '';
            state.currentEq.forEach((token, idx) => {
                const div = document.createElement('div');
                div.className = `token ${state.selectedIndex === idx ? 'selected' : ''}`;
                div.innerText = token;
                div.onclick = () => handleTokenClick(idx);
                container.appendChild(div);
            });
        }

        function handleTokenClick(idx) {
            if (state.selectedIndex === null) {
                state.selectedIndex = idx;
            } else if (state.selectedIndex === idx) {
                state.selectedIndex = null;
            } else {
                // Swap
                const temp = state.currentEq[state.selectedIndex];
                state.currentEq[state.selectedIndex] = state.currentEq[idx];
                state.currentEq[idx] = temp;
                state.selectedIndex = null;
                checkEquation();
            }
            render();
        }

        function checkEquation() {
            const str = state.currentEq.join('').replace('=', '===');
            try {
                if (eval(str)) {
                    state.score += 150;
                    document.getElementById('feedback').innerText = "Equation Correct! ✨";
                    setTimeout(() => {
                        state.level++;
                        loadLevel();
                    }, 1500);
                }
            } catch (e) { /* Invalid equation during swap */ }
        }

        function end() {
            const overlay = document.getElementById('game-overlay');
            overlay.classList.remove('hidden');
            document.getElementById('overlay-title').innerText = "Master of Logic!";
            document.getElementById('overlay-desc').innerText = `Final Score: ${state.score}`;
        }