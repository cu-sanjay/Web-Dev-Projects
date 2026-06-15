 const LEVELS = [
            {
                type: 'riddle',
                q: "I have a face but no eyes, hands but no arms. What am I?",
                a: "clock",
                hint: "I tell you when it's time for snacks!"
            },
            {
                type: 'math',
                q: "If 2 + 🌸 = 10, and 🌸 - 🥧 = 3, what is 🥧?",
                a: "5",
                hint: "First find the flower value!"
            },
            {
                type: 'sequence',
                q: "Watch the pattern and repeat it!",
                seq: [0, 2, 1, 3],
                hint: "Follow the colors carefully!"
            },
            {
                type: 'odd',
                q: "Which of these does not belong in a garden?",
                options: ["Rose 🌹", "Daisy 🌼", "Computer 💻", "Tulip 🌷"],
                a: "Computer 💻",
                hint: "Think about what needs water to grow!"
            }
        ];

        let state = {
            currentLevel: 0,
            keysCollected: [false, false, false, false],
            userSeq: []
        };

        function loadLevel(idx) {
            if (idx > 0 && !state.keysCollected[idx-1]) return; // Locked
            
            state.currentLevel = idx;
            state.userSeq = [];
            const level = LEVELS[idx];
            const area = document.getElementById('challenge-area');
            const feedback = document.getElementById('feedback');
            feedback.innerText = "";
            
            // Update Map UI
            document.querySelectorAll('.level-node').forEach((n, i) => {
                n.classList.remove('active');
                if (i === idx) n.classList.add('active');
            });

            if (level.type === 'riddle' || level.type === 'math') {
                area.innerHTML = `
                    <div class="puzzle-text">${level.q}</div>
                    <input type="text" id="ans-input" placeholder="Your answer..." autocomplete="off">
                    <button class="btn-cute" onclick="checkAnswer()">Unlock Key 🗝️</button>
                `;
                document.getElementById('ans-input').addEventListener('keypress', (e) => {
                    if(e.key === 'Enter') checkAnswer();
                });
            } else if (level.type === 'sequence') {
                area.innerHTML = `
                    <div class="puzzle-text">${level.q}</div>
                    <div class="sequence-dots">
                        <div class="dot" id="dot-0" style="color: #ff85a2; background: #fff0f3" onclick="handleSeq(0)"></div>
                        <div class="dot" id="dot-1" style="color: #7dd3fc; background: #e0f2fe" onclick="handleSeq(1)"></div>
                        <div class="dot" id="dot-2" style="color: #facc15; background: #fefce8" onclick="handleSeq(2)"></div>
                        <div class="dot" id="dot-3" style="color: #4ade80; background: #f0fdf4" onclick="handleSeq(3)"></div>
                    </div>
                    <button class="btn-cute" id="play-seq-btn" onclick="playSequence()">Play Pattern</button>
                `;
            } else if (level.type === 'odd') {
                area.innerHTML = `
                    <div class="puzzle-text">${level.q}</div>
                    <div class="options-grid">
                        ${level.options.map(opt => `<button class="btn-cute btn-secondary" onclick="checkChoice('${opt}')">${opt}</button>`).join('')}
                    </div>
                `;
            }
        }

        function checkAnswer() {
            const input = document.getElementById('ans-input').value.trim().toLowerCase();
            const correct = LEVELS[state.currentLevel].a;
            
            if (input === correct) {
                winLevel();
            } else {
                showFeedback("Not quite! 🎀 Try again!", "#ff85a2");
            }
        }

        function checkChoice(choice) {
            if (choice === LEVELS[state.currentLevel].a) {
                winLevel();
            } else {
                showFeedback("Oops! That belongs! 🌸", "#ff85a2");
            }
        }

        async function playSequence() {
            const btn = document.getElementById('play-seq-btn');
            btn.disabled = true;
            const seq = LEVELS[state.currentLevel].seq;
            
            for (let id of seq) {
                const dot = document.getElementById(`dot-${id}`);
                dot.classList.add('flash');
                await new Promise(r => setTimeout(r, 600));
                dot.classList.remove('flash');
                await new Promise(r => setTimeout(r, 200));
            }
            btn.disabled = false;
            state.userSeq = [];
        }

        function handleSeq(id) {
            state.userSeq.push(id);
            const target = LEVELS[state.currentLevel].seq;
            
            if (state.userSeq[state.userSeq.length - 1] !== target[state.userSeq.length - 1]) {
                showFeedback("Wrong pattern! 🥺", "#ff85a2");
                state.userSeq = [];
                return;
            }

            if (state.userSeq.length === target.length) {
                winLevel();
            }
        }

        function winLevel() {
            state.keysCollected[state.currentLevel] = true;
            const slot = document.getElementById(`slot-${state.currentLevel}`);
            slot.classList.add('collected', 'collected-anim');
            
            const node = document.getElementById(`map`).children[state.currentLevel];
            node.classList.add('completed');

            showFeedback("Key Collected! 🌟", "var(--secondary)");

            if (state.currentLevel < 3) {
                const nextNode = document.getElementById(`node-${state.currentLevel + 1}`);
                nextNode.classList.add('unlocked');
                setTimeout(() => loadLevel(state.currentLevel + 1), 1500);
            } else {
                setTimeout(() => document.getElementById('win-screen').classList.remove('hidden'), 1000);
            }
        }

        function showFeedback(msg, color) {
            const f = document.getElementById('feedback');
            f.innerText = msg;
            f.style.color = color;
        }

        loadLevel(0);