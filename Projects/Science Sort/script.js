 const FACTS = [
            { f: "Light travels at approximately 300,000 kilometers per second.", a: "Physics" },
            { f: "Mitochondria is often described as the powerhouse of the cell.", a: "Biology" },
            { f: "The pH level of pure water is exactly 7.", a: "Chemistry" },
            { f: "Newton's Third Law: For every action, there is an equal and opposite reaction.", a: "Physics" },
            { f: "Humans have 46 chromosomes in almost every cell of their body.", a: "Biology" },
            { f: "Noble gases like Helium and Neon are generally unreactive.", a: "Chemistry" },
            { f: "Sound waves cannot travel through the vacuum of space.", a: "Physics" },
            { f: "Photosynthesis is the process by which plants convert light into energy.", a: "Biology" },
            { f: "Diamond and Graphite are both made entirely of Carbon atoms.", a: "Chemistry" },
            { f: "Gravity is the force that attracts objects toward the center of the earth.", a: "Physics" }
        ];

        let state = { score: 0, level: 0, shuffled: [] };

        function startGame() {
            state.score = 0;
            state.level = 0;
            state.shuffled = [...FACTS].sort(() => Math.random() - 0.5);
            document.getElementById('game-overlay').classList.add('hidden');
            loadFact();
        }

        function loadFact() {
            if (state.level >= state.shuffled.length) return endGame();
            
            document.getElementById('level-val').innerText = state.level + 1;
            document.getElementById('score-val').innerText = state.score;
            document.getElementById('fact-display').innerText = state.shuffled[state.level].f;
            
            document.querySelectorAll('.opt-btn').forEach(btn => {
                btn.className = btn.className.replace(' correct', '').replace(' wrong', '');
                btn.disabled = false;
            });
        }

        function checkAnswer(choice, btn) {
            const correct = state.shuffled[state.level].a;
            document.querySelectorAll('.opt-btn').forEach(b => b.disabled = true);

            if (choice === correct) {
                btn.classList.add('correct');
                state.score += 100;
            } else {
                btn.classList.add('wrong');
                Array.from(document.querySelectorAll('.opt-btn')).find(b => b.innerText.includes(correct)).classList.add('correct');
            }

            setTimeout(() => {
                state.level++;
                loadFact();
            }, 1500);
        }

        function endGame() {
            const overlay = document.getElementById('game-overlay');
            overlay.classList.remove('hidden');
            document.getElementById('overlay-title').innerText = "Lab Report Complete";
            document.getElementById('overlay-desc').innerText = `Final Scientific Accuracy: ${state.score} Points`;
        }