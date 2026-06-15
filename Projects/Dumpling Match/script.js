 const LEVELS = [
            {
                category: "Fruits & Colors",
                pairs: [
                    { l: "🍎 Apple", r: "Red", match: "Red" },
                    { l: "🍌 Banana", r: "Yellow", match: "Yellow" },
                    { l: "🍇 Grapes", r: "Purple", match: "Purple" },
                    { l: "🍊 Orange", r: "Orange", match: "Orange" }
                ]
            },
            {
                category: "Animals & Sounds",
                pairs: [
                    { l: "🐱 Cat", r: "Meow", match: "Meow" },
                    { l: "🐶 Dog", r: "Woof", match: "Woof" },
                    { l: "🐮 Cow", r: "Moo", match: "Moo" },
                    { l: "🐷 Pig", r: "Oink", match: "Oink" }
                ]
            },
            {
                category: "Math Challenges",
                pairs: [
                    { l: "2 + 2", r: "4", match: "4" },
                    { l: "10 / 2", r: "5", match: "5" },
                    { l: "3 x 3", r: "9", match: "9" },
                    { l: "15 - 8", r: "7", match: "7" }
                ]
            }
        ];

        let state = {
            level: 0,
            matches: 0,
            activeDumpling: null,
            isDrawing: false,
            currentConnections: []
        };

        const svg = document.getElementById('line-svg');
        let tempLine = null;

        function startGame() {
            document.getElementById('start-screen').classList.add('hidden');
            loadLevel();
        }

        function loadLevel() {
            const levelData = LEVELS[state.level % LEVELS.length];
            state.matches = 0;
            state.currentConnections = [];
            state.activeDumpling = null;
            
            document.getElementById('level-val').innerText = state.level + 1;
            document.getElementById('match-val').innerText = "0";
            document.getElementById('win-screen').classList.add('hidden');
            svg.innerHTML = '';

            const leftCol = document.getElementById('left-col');
            const rightCol = document.getElementById('right-col');
            leftCol.innerHTML = '';
            rightCol.innerHTML = '';

            // Shuffle Right column for difficulty
            const shuffledRight = [...levelData.pairs].sort(() => Math.random() - 0.5);

            levelData.pairs.forEach((p, i) => {
                leftCol.innerHTML += `<div class="dumpling" data-side="left" data-match="${p.match}" onmousedown="startDraw(event, this)" ontouchstart="startDraw(event, this)">${p.l}</div>`;
            });

            shuffledRight.forEach((p, i) => {
                rightCol.innerHTML += `<div class="dumpling" data-side="right" data-val="${p.r}" onmouseup="endDraw(this)" ontouchend="endDraw(this)">${p.r}</div>`;
            });
        }

        function startDraw(e, el) {
            if (el.classList.contains('matched')) return;
            state.isDrawing = true;
            state.activeDumpling = el;
            el.classList.add('selected');

            tempLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            tempLine.setAttribute("stroke", "var(--primary)");
            tempLine.setAttribute("stroke-width", "4");
            tempLine.setAttribute("stroke-dasharray", "8,4");
            svg.appendChild(tempLine);
            moveLine(e);
        }

        function moveLine(e) {
            if (!state.isDrawing) return;
            const rect = svg.getBoundingClientRect();
            const startRect = state.activeDumpling.getBoundingClientRect();
            
            const x1 = startRect.right - rect.left;
            const y1 = (startRect.top + startRect.height / 2) - rect.top;
            
            const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
            const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);
            
            tempLine.setAttribute("x1", x1);
            tempLine.setAttribute("y1", y1);
            tempLine.setAttribute("x2", clientX - rect.left);
            tempLine.setAttribute("y2", clientY - rect.top);
        }

        function endDraw(target) {
            if (!state.isDrawing) return;
            const isCorrect = target.dataset.side === 'right' && target.dataset.val === state.activeDumpling.dataset.match;

            if (isCorrect) {
                state.matches++;
                document.getElementById('match-val').innerText = state.matches;
                target.classList.add('matched');
                state.activeDumpling.classList.add('matched');
                
                // Make line permanent
                tempLine.setAttribute("stroke", "var(--line-correct)");
                tempLine.setAttribute("stroke-dasharray", "0");
                tempLine = null;

                if (state.matches === 4) {
                    setTimeout(() => document.getElementById('win-screen').classList.remove('hidden'), 500);
                }
            } else {
                if (tempLine) tempLine.remove();
            }

            state.isDrawing = false;
            if (state.activeDumpling) state.activeDumpling.classList.remove('selected');
        }

        function nextLevel() {
            state.level++;
            loadLevel();
        }

        window.addEventListener('mousemove', moveLine);
        window.addEventListener('touchmove', moveLine);
        window.addEventListener('mouseup', () => { if(state.isDrawing) { state.isDrawing = false; if(tempLine) tempLine.remove(); if(state.activeDumpling) state.activeDumpling.classList.remove('selected'); } });
  