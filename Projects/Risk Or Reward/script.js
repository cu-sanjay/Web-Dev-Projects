 let state = {
            score: 0,
            streak: 0,
            highScore: localStorage.getItem('risk_high_score') || 0,
            level: 1
        };

        function startGame() {
            state.score = 0;
            state.streak = 0;
            state.level = 1;
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('game-over').classList.add('hidden');
            updateUI();
        }

        function updateUI() {
            document.getElementById('score').innerText = state.score;
            document.getElementById('streak').innerText = state.streak;
            document.getElementById('high-score').innerText = state.highScore;
            document.getElementById('level').innerText = state.level;
            
            const safeAmt = 10 + (state.level * 2);
            const riskyAmt = 50 + (state.level * 10);
            
            document.getElementById('safe-reward').innerText = `+${safeAmt}`;
            document.getElementById('risky-reward').innerText = `+${riskyAmt}`;
        }

        function play(isRisky) {
            const safeAmt = 10 + (state.level * 2);
            const riskyAmt = 50 + (state.level * 10);
            const msgEl = document.getElementById('message');

            if (!isRisky) {
                state.score += safeAmt;
                state.streak = 0;
                msgEl.innerText = "Borrrring... but you got paid. 💸";
                msgEl.style.color = "blue";
            } else {
                const baseProb = 0.7;
                const penalty = (state.level * 0.05) + (state.streak * 0.02);
                const winProb = Math.max(0.1, baseProb - penalty);
                
                if (Math.random() < winProb) {
                    state.score += riskyAmt;
                    state.streak++;
                    msgEl.innerText = "YOOOOOO BIG W! +"+riskyAmt+" 🚀📈";
                    msgEl.style.color = "green";
                    
                    if (state.streak % 3 === 0) {
                        state.level++;
                        msgEl.innerText += " LEVEL UP! IT'S GETTING REAL! 🔥";
                    }
                } else {
                    gameOver();
                    return;
                }
            }

            if (state.score > state.highScore) {
                state.highScore = state.score;
                localStorage.setItem('risk_high_score', state.highScore);
            }

            updateUI();
        }

        function gameOver() {
            const gameOverScreen = document.getElementById('game-over');
            document.getElementById('final-score').innerText = "SCORE: " + state.score + " | LEVEL: " + state.level;
            gameOverScreen.classList.remove('hidden');
        }