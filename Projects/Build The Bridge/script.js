 const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        let width, height;

        const LEVELS = [
            { gap: 300, steel: 500, label: "Basic Crossing" },
            { gap: 450, steel: 600, label: "Deep Chasm" },
            { gap: 550, steel: 700, label: "Structural Challenge" }
        ];

        let state = {
            level: 0,
            steelUsed: 0,
            nodes: [],
            beams: [],
            isTesting: false,
            car: { x: 50, y: 0, vx: 2, isActive: false },
            dragStart: null,
            mousePos: { x: 0, y: 0 }
        };

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight - 80;
        }
        window.onresize = resize;
        resize();

        function initLevel() {
            document.getElementById('start-overlay').classList.add('hidden');
            document.getElementById('win-overlay').classList.add('hidden');
            document.getElementById('fail-overlay').classList.add('hidden');
            const lvl = LEVELS[state.level % LEVELS.length];
            
            state.nodes = [
                { x: 100, y: height/2, fixed: true },
                { x: 100 + lvl.gap, y: height/2, fixed: true }
            ];
            state.beams = [];
            state.steelUsed = 0;
            state.isTesting = false;
            state.car.isActive = false;
            updateUI();
        }

        function updateUI() {
            const lvl = LEVELS[state.level % LEVELS.length];
            document.getElementById('steel-val').innerText = `${Math.round(state.steelUsed)} / ${lvl.steel}`;
            document.getElementById('level-val').innerText = state.level + 1;
            document.getElementById('test-btn').innerText = state.isTesting ? "Resetting..." : "Launch Rover";
        }

        canvas.addEventListener('mousedown', e => {
            if (state.isTesting) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Snap to existing node
            let snapped = state.nodes.find(n => Math.hypot(n.x - x, n.y - y) < 20);
            state.dragStart = snapped || { x, y, temp: true };
        });

        canvas.addEventListener('mousemove', e => {
            const rect = canvas.getBoundingClientRect();
            state.mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        });

        canvas.addEventListener('mouseup', e => {
            if (!state.dragStart || state.isTesting) return;
            const lvl = LEVELS[state.level % LEVELS.length];
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            let endNode = state.nodes.find(n => Math.hypot(n.x - x, n.y - y) < 20);
            if (!endNode) {
                endNode = { x, y, fixed: false };
                state.nodes.push(endNode);
            }

            if (state.dragStart.temp) {
                state.nodes.push(state.dragStart);
                state.dragStart.temp = false;
            }

            const dist = Math.hypot(state.dragStart.x - endNode.x, state.dragStart.y - endNode.y);
            if (dist > 10 && state.steelUsed + dist <= lvl.steel) {
                state.beams.push({ a: state.dragStart, b: endNode, len: dist });
                state.steelUsed += dist;
            }
            
            state.dragStart = null;
            updateUI();
        });

        function testBridge() {
            if (state.isTesting) { initLevel(); return; }
            state.isTesting = true;
            state.car = { x: 50, y: height/2 - 10, vx: 2, isActive: true };
            updateUI();
        }

        function clearBridge() {
            if (!state.isTesting) initLevel();
        }

        function nextLevel() {
            state.level++;
            initLevel();
        }

        function loop() {
            ctx.clearRect(0, 0, width, height);
            const lvl = LEVELS[state.level % LEVELS.length];

            // Draw Platforms
            ctx.fillStyle = "#111827";
            ctx.fillRect(0, height/2, 100, height);
            ctx.fillRect(100 + lvl.gap, height/2, width, height);
            ctx.strokeStyle = getThemeVar('--accent');
            ctx.lineWidth = 2;
            ctx.strokeRect(0, height/2, 100, 2);
            ctx.strokeRect(100 + lvl.gap, height/2, width, 2);

            // Physics & Simulation
            if (state.isTesting) {
                // Gravity on nodes
                state.nodes.forEach(n => { if(!n.fixed) n.y += 0.5; });
                // Constraints
                for(let i=0; i<5; i++) {
                    state.beams.forEach(b => {
                        const dx = b.b.x - b.a.x;
                        const dy = b.b.y - b.a.y;
                        const d = Math.hypot(dx, dy);
                        const diff = (b.len - d) / d;
                        const offsetX = dx * diff * 0.5;
                        const offsetY = dy * diff * 0.5;
                        if(!b.a.fixed) { b.a.x -= offsetX; b.a.y -= offsetY; }
                        if(!b.b.fixed) { b.b.x += offsetX; b.b.y += offsetY; }
                    });
                }

                // Rover Physics (Follow Bridge)
                state.car.x += state.car.vx;
                let groundY = height + 100;
                let foundGround = false;

                if (state.car.x < 100 || state.car.x > 100 + lvl.gap) {
                    groundY = height / 2;
                    foundGround = true;
                } else {
                    state.beams.forEach(b => {
                        const minX = Math.min(b.a.x, b.b.x);
                        const maxX = Math.max(b.a.x, b.b.x);
                        if (state.car.x >= minX && state.car.x <= maxX) {
                            const t = (state.car.x - b.a.x) / (b.b.x - b.a.x);
                            const yAtX = b.a.y + t * (b.b.y - b.a.y);
                            if (yAtX < groundY) {
                                groundY = yAtX;
                                foundGround = true;
                            }
                        }
                    });
                }

                if (foundGround && state.car.y <= groundY) {
                    state.car.y = groundY - 10;
                } else {
                    state.car.y += 5; // Gravity falls
                }

                if (state.car.x > width && state.car.y < height) {
                    document.getElementById('win-overlay').classList.remove('hidden');
                    state.isTesting = false;
                } else if (state.car.y > height) {
                    document.getElementById('fail-overlay').classList.remove('hidden');
                    state.isTesting = false;
                }
            }

            // Draw Beams
            state.beams.forEach(b => {
                const currentLen = Math.hypot(b.b.x - b.a.x, b.b.y - b.a.y);
                const stress = Math.min(1, Math.abs(currentLen - b.len) / 15);
                ctx.strokeStyle = stress > 0.5 ? getThemeVar('--danger') : getThemeVar('--steel');
                ctx.lineWidth = 3;
                ctx.beginPath(); ctx.moveTo(b.a.x, b.a.y); ctx.lineTo(b.b.x, b.b.y); ctx.stroke();
            });

            // Draw Nodes
            state.nodes.forEach(n => {
                ctx.fillStyle = n.fixed ? getThemeVar('--accent') : getThemeVar('--steel');
                ctx.beginPath(); ctx.arc(n.x, n.y, 4, 0, Math.PI*2); ctx.fill();
            });

            // Preview Line
            if (state.dragStart) {
                ctx.setLineDash([5, 5]);
                ctx.strokeStyle = getThemeVar('--accent');
                ctx.beginPath(); ctx.moveTo(state.dragStart.x, state.dragStart.y); ctx.lineTo(state.mousePos.x, state.mousePos.y); ctx.stroke();
                ctx.setLineDash([]);
            }

            // Draw Rover
            if (state.car.isActive) {
                ctx.fillStyle = getThemeVar('--danger');
                ctx.fillRect(state.car.x - 15, state.car.y - 10, 30, 15);
            }

            requestAnimationFrame(loop);
        }

        function getThemeVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

        loop();