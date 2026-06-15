 const EMOJI_POOL = ["🚀", "🦉", "🎸", "🍕", "🎭", "🏰", "🦄", "🌋", "🦖", "🛸", "🍄", "🚲", "🧁", "🐙", "🛰️", "💎"];
        
        let state = {
            level: 1,
            score: 0,
            selectedObj: null,
            matches: 0,
            currentSet: []
        };

        function startGame() {
            state.level = 1;
            state.score = 0;
            document.getElementById('start-screen').classList.add('hidden');
            initLevel();
        }

        function initLevel() {
            state.matches = 0;
            state.selectedObj = null;
            document.getElementById('win-screen').classList.add('hidden');
            document.getElementById('level-val').innerText = state.level;
            document.getElementById('score-val').innerText = state.score;

            // Increase complexity with level
            const count = Math.min(6, 3 + Math.floor(state.level / 2));
            const shuffled = [...EMOJI_POOL].sort(() => Math.random() - 0.5);
            state.currentSet = shuffled.slice(0, count);

            renderGrid();
        }

        function renderGrid() {
            const objCol = document.getElementById('objects-col');
            const shdCol = document.getElementById('shadows-col');
            objCol.innerHTML = '';
            shdCol.innerHTML = '';

            // Objects stay in one order, shadows shuffle
            const shadowSet = [...state.currentSet].sort(() => Math.random() - 0.5);

            state.currentSet.forEach(emoji => {
                const div = document.createElement('div');
                div.className = 'item';
                div.innerText = emoji;
                div.onclick = () => selectObject(emoji, div);
                objCol.appendChild(div);
            });

            shadowSet.forEach(emoji => {
                const div = document.createElement('div');
                div.className = 'item shadow-item';
                div.innerText = emoji;
                div.dataset.emoji = emoji;
                div.onclick = () => selectShadow(emoji, div);
                shdCol.appendChild(div);
            });
        }

        function selectObject(emoji, el) {
            if (el.classList.contains('matched')) return;
            document.querySelectorAll('#objects-col .item').forEach(i => i.classList.remove('selected'));
            el.classList.add('selected');
            state.selectedObj = { emoji, el };
        }

        function selectShadow(emoji, el) {
            if (!state.selectedObj || el.classList.contains('matched')) return;

            if (emoji === state.selectedObj.emoji) {
                // Match!
                state.matches++;
                state.score += 100 * state.level;
                el.classList.add('matched');
                state.selectedObj.el.classList.add('matched');
                state.selectedObj = null;
                document.getElementById('score-val').innerText = state.score;

                if (state.matches === state.currentSet.length) {
                    setTimeout(showWin, 500);
                }
            } else {
                // Fail
                el.style.borderColor = 'var(--error)';
                setTimeout(() => el.style.borderColor = '', 500);
            }
        }

        function useHint() {
            if (state.score < 50) return alert("Insufficient energy for signal (Need 50 points)");
            state.score -= 50;
            document.getElementById('score-val').innerText = state.score;

            const unmapped = [...document.querySelectorAll('#objects-col .item:not(.matched)')];
            if (unmapped.length === 0) return;
            
            const target = unmapped[0];
            const emoji = target.innerText;
            const shadow = [...document.querySelectorAll('#shadows-col .item')].find(s => s.dataset.emoji === emoji);
            
            shadow.classList.add('hint-highlight');
            setTimeout(() => shadow.classList.remove('hint-highlight'), 2000);
        }

        function showWin() {
            document.getElementById('win-screen').classList.remove('hidden');
            document.getElementById('final-stats').innerText = `Level ${state.level} Complete. Total Credits: ${state.score}`;
        }

        function nextLevel() {
            state.level++;
            initLevel();
        }