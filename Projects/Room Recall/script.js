 const QUESTIONS = [
            { q: "What color was the chair in the room?", o: ["Blue", "Yellow", "Red", "Grey"], a: "Yellow" },
            { q: "How many books were visible on the table?", o: ["1", "2", "3", "5"], a: "2" }
        ];

        let state = { currentQ: 0, score: 0 };

        function startObservation() {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('phase-label').innerText = "Observation Phase";
            document.getElementById('scan-line').classList.remove('hidden');
            
            const bar = document.getElementById('timer-bar');
            bar.style.transition = 'width 10s linear';
            bar.style.width = '100%';

            setTimeout(startInterrogation, 10000);
        }

        function startInterrogation() {
            document.getElementById('phase-label').innerText = "Interrogation Phase";
            document.getElementById('room-img').classList.add('redacted');
            document.getElementById('scan-line').classList.add('hidden');
            document.getElementById('timer-bar').classList.add('hidden');
            document.getElementById('question-area').classList.remove('hidden');
            loadQuestion();
        }

        function loadQuestion() {
            const data = QUESTIONS[state.currentQ];
            document.getElementById('q-text').innerText = data.q;
            const optContainer = document.getElementById('options');
            optContainer.innerHTML = '';

            data.o.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.innerText = opt;
                btn.onclick = () => handleAnswer(opt);
                optContainer.appendChild(btn);
            });
        }

        function handleAnswer(choice) {
            if (choice === QUESTIONS[state.currentQ].a) state.score++;
            
            state.currentQ++;
            if (state.currentQ < QUESTIONS.length) {
                loadQuestion();
            } else {
                showResults();
            }
        }

        function showResults() {
            document.getElementById('question-area').classList.add('hidden');
            document.getElementById('result-screen').classList.remove('hidden');
            document.getElementById('result-title').innerText = state.score === QUESTIONS.length ? "Perfect Recall" : "Recall Fragmented";
            document.getElementById('result-text').innerText = `You correctly reconstructed ${state.score} of ${QUESTIONS.length} environmental details.`;
        }