 const LEVELS = [
            { size: 16, sequence: [0, 1, 5, 9, 10], target: 10, hint: "Start at the top-left." },
            { size: 16, sequence: [3, 7, 11, 10, 6, 2], target: 2, hint: "Right column descent." },
            { size: 16, sequence: [12, 13, 14, 10, 6, 2, 1, 0], target: 0, hint: "Spiral into the origin." },
            { size: 16, sequence: [0, 4, 8, 12, 13, 9, 5, 1, 2, 6, 10, 14, 15], target: 15, hint: "The weaving path." },
            { size: 16, sequence: [15, 11, 7, 3, 2, 6, 10, 14, 13, 9, 5, 1, 0, 4, 8, 12], target: 12, hint: "Full circuit required." }
        ];

        let state = {
            level: 0,
            currentStep: 0,
            moves: 0,
            isLocked: false
        };

        function startGame() {
            document.getElementById('start-overlay').classList.add('hidden');
            document.getElementById('result-overlay').classList.add('hidden');
            loadLevel();
        }

        function loadLevel() {
            const lvl = LEVELS[state.level % LEVELS.length];
            state.currentStep = 0;
            state.moves = 0;
            state.isLocked = false;

            document.getElementById('level-val').innerText = state.level + 1;
            document.getElementById('move-val').innerText = state.moves;
            document.getElementById('feedback').innerText = "";
            document.getElementById('feedback').style.color = 'var(--text)';

            const grid = document.getElementById('grid');
            grid.innerHTML = '';

            for (let i = 0; i < lvl.size; i++) {
                const node = document.createElement('div');
                node.className = 'node';
                if (i === lvl.target) node.classList.add('target');
                node.dataset.id = i;
                node.onclick = () => handleNodeClick(i, node);

                if (i === lvl.sequence[0]) {
                    node.innerText = '⚡';
                    node.style.borderColor = 'var(--gold-light)';
                }

                grid.appendChild(node);
            }
        }

        function handleNodeClick(id, node) {
            if (state.isLocked || node.classList.contains('active')) return;

            const lvl = LEVELS[state.level % LEVELS.length];

            if (id === lvl.sequence[state.currentStep]) {
                node.classList.add('active');
                node.classList.add('pulse');
                state.currentStep++;
                state.moves++;
                document.getElementById('move-val').innerText = state.moves;

                if (id === lvl.target && state.currentStep === lvl.sequence.length) {
                    completeLevel();
                }
            } else {
                triggerFailure();
            }
        }

        function triggerFailure() {
            state.isLocked = true;
            const feedback = document.getElementById('feedback');
            feedback.innerText = 'LINK SEVERED — REBOOTING';
            feedback.style.color = 'var(--error)';

            const nodes = document.querySelectorAll('.node');
            nodes.forEach(n => {
                if (n.classList.contains('active')) {
                    n.style.background = 'var(--error)';
                }
            });

            setTimeout(() => {
                loadLevel();
            }, 1000);
        }

        function completeLevel() {
            state.isLocked = true;
            const feedback = document.getElementById('feedback');
            feedback.innerText = 'PROTOCOL SYNCHRONIZED ✨';
            feedback.style.color = 'var(--success)';

            setTimeout(() => {
                const overlay = document.getElementById('result-overlay');
                overlay.classList.remove('hidden');
                document.getElementById('result-msg').innerText = `Sector ${state.level + 1} synchronized in ${state.moves} interactions.`;
                state.level++;
            }, 1000);
        }