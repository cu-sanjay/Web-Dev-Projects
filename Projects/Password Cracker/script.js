 const WORDS = ["BRAIN", "LIGHT", "SPACE", "GHOST", "PIZZA", "CLOUD", "STORM", "WIZARD", "DRAGON", "COFFEE"];
        let state = { score: 0, round: 0, currentWord: "" };

        function startGame() {
            state.score = 0;
            state.round = 0;
            document.getElementById('game-overlay').classList.add('hidden');
            nextRound();
        }

        function nextRound() {
            if (state.round >= 5) return endGame();
            
            state.round++;
            state.currentWord = WORDS[Math.floor(Math.random() * WORDS.length)];
            
            document.getElementById('round-val').innerText = state.round;
            document.getElementById('score-val').innerText = state.score;
            document.getElementById('feedback').innerText = "";
            document.getElementById('user-input').value = "";
            document.getElementById('user-input').focus();

            generateHints();
        }

        function generateHints() {
            const word = state.currentWord;
            const hints = [
                `Length = ${word.length}`,
                `Starts with ${word[0]}`,
                `Contains a vowel: ${/[AEIOU]/i.test(word) ? "YES" : "NO"}`
            ];

            const hintList = document.getElementById('hint-list');
            hintList.innerHTML = hints.map(h => `<div class="hint-item">${h}</div>`).join('');
        }

        function checkGuess() {
            const input = document.getElementById('user-input').value.trim().toUpperCase();
            const feedback = document.getElementById('feedback');

            if (input === state.currentWord) {
                state.score += 100;
                feedback.innerText = "ACCESS GRANTED! 🔓";
                feedback.style.color = "var(--success)";
                setTimeout(nextRound, 1500);
            } else {
                feedback.innerText = "ACCESS DENIED! ❌";
                feedback.style.color = "var(--error)";
                document.getElementById('user-input').select();
            }
        }

        function endGame() {
            const overlay = document.getElementById('game-overlay');
            overlay.classList.remove('hidden');
            overlay.querySelector('h1').innerText = "System Breached";
            overlay.querySelector('p').innerText = `You cracked the encryption with a score of ${state.score}!`;
            overlay.querySelector('button').innerText = "Reboot Terminal";
        }