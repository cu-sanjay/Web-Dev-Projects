 const state = {
            clues: new Set(),
            interviews: new Set(),
            gameEnded: false
        };

        function switchTab(tabId) {
            if (state.gameEnded) return;
            
            document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
            document.getElementById(tabId).classList.remove('hidden');
            
            document.querySelectorAll('.nav-btn').forEach(b => {
                b.classList.remove('active');
                if (b.innerText.toLowerCase().includes(tabId.split('-')[0])) b.classList.add('active');
            });
        }

        function collectClue(id, name, desc) {
            if (state.clues.has(name)) return;
            
            state.clues.add(name);
            document.getElementById(`clue-${id}`).classList.add('found');
            document.getElementById(`clue-${id}`).innerText = "INSIGHT COLLECTED";
            
            updateCaseFile();
            showStatus(`Found: ${name}`);
        }

        function interview(name, role, statement) {
            const entry = `<strong>${name} (${role}):</strong> ${statement}`;
            if (state.interviews.has(entry)) return;
            
            state.interviews.add(entry);
            updateCaseFile();
            showStatus(`Interviewed ${name}`);
        }

        function updateCaseFile() {
            const clueBox = document.getElementById('clue-list');
            const interviewBox = document.getElementById('interview-list');
            
            if (state.clues.size > 0) {
                clueBox.innerHTML = Array.from(state.clues)
                    .map(c => `<div class="clue-item">🔍 ${c}</div>`).join('');
            }
            
            if (state.interviews.size > 0) {
                interviewBox.innerHTML = Array.from(state.interviews)
                    .map(i => `<div class="clue-item" style="border-bottom:1px solid rgba(255,255,255,0.05); padding: 5px 0;">${i}</div>`).join('');
            }
        }

        function showStatus(msg) {
            const status = document.getElementById('game-status');
            status.innerText = msg;
            status.style.color = 'var(--accent)';
            setTimeout(() => {
                status.style.color = 'var(--text-dim)';
            }, 2000);
        }

        function accuse(culprit) {
            state.gameEnded = true;
            const main = document.querySelector('.main-view');
            const nav = document.querySelector('.navigation');
            nav.classList.add('hidden');

            // LOGIC:
            // The fiber was BLUE (Arthur wears Blue).
            // The access was via Card #42 (Marla's lost card).
            // The print was a work boot (Technicians and Janitors wear these).
            // The coffee receipt links to Viktor (The double espresso).
            // WINNER: Viktor. He stole Marla's card, used it to enter, and left a fiber from the Guard's spare uniform he wore as a disguise.

            if (culprit === 'Viktor') {
                main.innerHTML = `
                    <div class="scene-card" style="border-color: var(--success); text-align: center;">
                        <h2 style="color: var(--success)">CASE CLOSED!</h2>
                        <p>Viktor was the thief! He stole Marla's keycard while "fixing" the staff breakroom. He wore a stolen Guard's jacket to evade detection (the blue fiber) and caffeinated himself for the late-night heist.</p>
                        <button class="nav-btn" onclick="location.reload()" style="margin-top: 20px;">Restart Case</button>
                    </div>
                `;
            } else {
                main.innerHTML = `
                    <div class="scene-card" style="border-color: var(--error); text-align: center;">
                        <h2 style="color: var(--error)">FALSE ACCUSATION</h2>
                        <p>You accused ${culprit}, but they had an alibi you missed. While you were distracted, the real thief sold the Midnight Star on the black market and vanished.</p>
                        <p style="font-size: 0.8rem; margin-top: 10px;">Hint: Connect the Blue Fiber to the Guard's uniform, but note the coffee receipt and the stolen keycard.</p>
                        <button class="nav-btn" onclick="location.reload()" style="margin-top: 20px;">Try Again</button>
                    </div>
                `;
            }
        }