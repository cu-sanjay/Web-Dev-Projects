 const TOPICS = [
            "Remote work is better for productivity than office work.",
            "Artificial intelligence will replace most creative jobs.",
            "Space exploration is a waste of resources.",
            "Video games are a valid form of high art.",
            "University degrees are becoming obsolete."
        ];

        const CONNECTORS = ['because', 'however', 'therefore', 'consequently', 'furthermore', 'nevertheless', 'moreover', 'although'];
        
        let state = {
            userHP: 100,
            oppHP: 100,
            side: 'PRO'
        };

        function startGame() {
            document.getElementById('start-overlay').classList.add('hidden');
            document.getElementById('topic-display').innerText = TOPICS[Math.floor(Math.random() * TOPICS.length)];
        }

        function setSide(s) {
            state.side = s;
            document.getElementById('pro-btn').classList.toggle('active', s === 'PRO');
            document.getElementById('con-btn').classList.toggle('active', s === 'CON');
        }

        function executeAttack() {
            const input = document.getElementById('argument-input').value.trim();
            if (input.length < 50) return alert("Argument too weak. Minimum 50 characters required.");

            // Calculate Damage
            let damage = 10; // Base damage
            damage += (input.length / 50); // Length bonus
            
            CONNECTORS.forEach(c => {
                if (input.toLowerCase().includes(c)) damage += 5; // Reasoning bonus
            });

            damage = Math.floor(damage);
            state.oppHP = Math.max(0, state.oppHP - damage);
            
            updateUI();
            log(`USER used ${state.side} Logic! Dealt ${damage} damage.`, 'user');
            
            document.getElementById('argument-input').value = "";
            
            if (state.oppHP > 0) {
                setTimeout(opponentCounter, 1000);
            } else {
                endGame(true);
            }
        }

        function opponentCounter() {
            const counterDamage = Math.floor(Math.random() * 15) + 10;
            state.userHP = Math.max(0, state.userHP - counterDamage);
            updateUI();
            log(`OPPONENT deployed Counter-Argument! Dealt ${counterDamage} damage.`, 'opp');
            
            if (state.userHP <= 0) endGame(false);
        }

        function updateUI() {
            document.getElementById('user-hp-val').innerText = state.userHP;
            document.getElementById('opp-hp-val').innerText = state.oppHP;
            document.getElementById('user-bar').style.width = state.userHP + "%";
            document.getElementById('opp-bar').style.width = state.oppHP + "%";
        }

        function log(msg, type) {
            const log = document.getElementById('battle-log');
            const div = document.createElement('div');
            div.className = `log-entry ${type}`;
            div.innerText = `> ${msg}`;
            log.prepend(div);
        }

        function endGame(win) {
            const overlay = document.getElementById('start-overlay');
            overlay.classList.remove('hidden');
            overlay.querySelector('h1').innerText = win ? "VICTORY" : "DEFEATED";
            overlay.querySelector('h1').style.color = win ? "var(--user-color)" : "var(--opponent-color)";
            overlay.querySelector('p').innerText = win ? "Your logic was impenetrable." : "Your reasoning was dismantled.";
            overlay.querySelector('button').innerText = "Rematch";
        }