  let state = {
            level: 1,
            score: 0,
            pattern: [],
            userSelections: [],
            isAcceptingInput: false
        };

        const gridEl = document.getElementById('grid');

        function startGame() {
            state.level = 1;
            state.score = 0;
            document.getElementById('game-overlay').classList.add('hidden');
            nextRound();
        }

        function nextRound() {
            state.userSelections = [];
            state.isAcceptingInput = false;
            state.pattern = [];
            
            document.getElementById('level-val').innerText = state.level;
            document.getElementById('score-val').innerText = state.score;
            document.getElementById('status-msg').innerText = "Memorize!";

            // Create Grid
            gridEl.innerHTML = '';
            for(let i=0; i<16; i++) {
                const tile = document.createElement('div');
                tile.className = 'tile disabled';
                tile.onclick = () => handleTileClick(i, tile);
                gridEl.appendChild(tile);
            }

            // Generate Pattern
            const numTiles = 2 + Math.floor(state.level / 2);
            while(state.pattern.length < numTiles) {
                let rand = Math.floor(Math.random() * 16);
                if(!state.pattern.includes(rand)) state.pattern.push(rand);
            }

            // Show Pattern
            setTimeout(() => {
                state.pattern.forEach(idx => gridEl.children[idx].classList.add('active'));
                setTimeout(() => {
                    state.pattern.forEach(idx => gridEl.children[idx].classList.remove('active'));
                    startInputPhase();
                }, 2000);
            }, 500);
        }

        function startInputPhase() {
            state.isAcceptingInput = true;
            document.getElementById('status-msg').innerText = "Recall!";
            Array.from(gridEl.children).forEach(tile => tile.classList.remove('disabled'));
        }

        function handleTileClick(index, tile) {
            if(!state.isAcceptingInput || state.userSelections.includes(index)) return;

            state.userSelections.push(index);

            if(state.pattern.includes(index)) {
                tile.classList.add('correct');
                if(state.userSelections.length === state.pattern.length) {
                    state.score += (state.level * 100);
                    state.level++;
                    state.isAcceptingInput = false;
                    setTimeout(nextRound, 1000);
                }
            } else {
                tile.classList.add('wrong');
                state.isAcceptingInput = false;
                // Show correct pattern
                state.pattern.forEach(idx => gridEl.children[idx].classList.add('correct'));
                setTimeout(endGame, 1500);
            }
        }

        function endGame() {
            const overlay = document.getElementById('game-overlay');
            overlay.classList.remove('hidden');
            document.getElementById('overlay-title').innerText = "System Failure";
            document.getElementById('overlay-desc').innerText = `Your memory reached Level ${state.level}. Final Score: ${state.score}`;
        }