  let state = { score: 0, level: 1, target: { r: 0, g: 0, b: 0 } };

        function startGame() {
            state.score = 0;
            state.level = 1;
            document.getElementById('start-screen').classList.add('hidden');
            initLevel();
        }

        function initLevel() {
            document.getElementById('result-screen').classList.add('hidden');
            document.getElementById('level-val').innerText = state.level;
            document.getElementById('score-val').innerText = state.score;

            // Complexity increases with level
            const complexity = Math.min(255, 50 + (state.level * 20));
            state.target = {
                r: Math.floor(Math.random() * complexity),
                g: state.level > 1 ? Math.floor(Math.random() * complexity) : 0,
                b: state.level > 2 ? Math.floor(Math.random() * complexity) : 0
            };

            document.getElementById('target-orb').style.backgroundColor = `rgb(${state.target.r}, ${state.target.g}, ${state.target.b})`;
            resetMix();
        }

        function resetMix() {
            ['red', 'green', 'blue'].forEach(c => document.getElementById(`${c}-slider`).value = 0);
            updateMix();
        }

        function updateMix() {
            const r = document.getElementById('red-slider').value;
            const g = document.getElementById('green-slider').value;
            const b = document.getElementById('blue-slider').value;
            document.getElementById('user-orb').style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        }

        function submitMatch() {
            const r = parseInt(document.getElementById('red-slider').value);
            const g = parseInt(document.getElementById('green-slider').value);
            const b = parseInt(document.getElementById('blue-slider').value);

            const diff = Math.sqrt(
                Math.pow(state.target.r - r, 2) +
                Math.pow(state.target.g - g, 2) +
                Math.pow(state.target.b - b, 2)
            );

            const accuracy = Math.max(0, 100 - (diff / 4.41)); // 4.41 is max possible distance / 100
            const points = Math.floor(accuracy * state.level);

            if (accuracy > 85) {
                state.score += points;
                showResult(accuracy, points);
            } else {
                alert(`Mix is only ${accuracy.toFixed(1)}% accurate. The Alchemist requires at least 85%!`);
            }
        }

        function showResult(acc, points) {
            const screen = document.getElementById('result-screen');
            const title = document.getElementById('result-title');
            const stats = document.getElementById('result-stats');

            title.innerText = acc > 98 ? "ALCHEMICAL MASTERY!" : "GREAT MIX!";
            stats.innerText = `Accuracy: ${acc.toFixed(1)}% | Earned: ${points} XP`;
            screen.classList.remove('hidden');
        }

        function nextLevel() {
            state.level++;
            initLevel();
        }