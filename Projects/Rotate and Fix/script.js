 let state = {
            gridSize: 3,
            moves: 0,
            seconds: 0,
            timer: null,
            tiles: [],
            imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop'
        };

        function setDifficulty(size, btn) {
            state.gridSize = size;
            document.querySelectorAll('.btn-diff').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }

        function startGame() {
            document.getElementById('start-screen').classList.add('hidden');
            initBoard();
            startTimer();
        }

        function initBoard() {
            const board = document.getElementById('game-board');
            board.style.gridTemplateColumns = `repeat(${state.gridSize}, 1fr)`;
            board.innerHTML = '';
            state.tiles = [];
            state.moves = 0;
            document.getElementById('moves-val').innerText = '0';

            const tileSize = 400 / state.gridSize;

            for (let r = 0; r < state.gridSize; r++) {
                for (let c = 0; c < state.gridSize; c++) {
                    const tile = document.createElement('div');
                    tile.className = 'tile';
                    tile.style.width = `${80 * (3 / state.gridSize) * 1.2}px`;
                    tile.style.height = `${80 * (3 / state.gridSize) * 1.2}px`;
                    tile.style.backgroundImage = `url(${state.imageUrl})`;
                    tile.style.backgroundPosition = `-${c * tileSize}px -${r * tileSize}px`;
                    tile.style.backgroundSize = `400px 400px`;
                    
                    // Random initial rotation (90, 180, 270)
                    const rot = (Math.floor(Math.random() * 3) + 1) * 90;
                    tile.style.transform = `rotate(${rot}deg)`;
                    tile.dataset.rotation = rot;

                    tile.onclick = () => rotateTile(tile);
                    board.appendChild(tile);
                    state.tiles.push(tile);
                }
            }
        }

        function rotateTile(tile) {
            let rot = parseInt(tile.dataset.rotation) + 90;
            tile.style.transform = `rotate(${rot}deg)`;
            tile.dataset.rotation = rot;
            
            state.moves++;
            document.getElementById('moves-val').innerText = state.moves;
            
            checkWin();
        }

        function checkWin() {
            const isWon = state.tiles.every(tile => (parseInt(tile.dataset.rotation) % 360) === 0);
            if (isWon) {
                clearInterval(state.timer);
                setTimeout(showWinScreen, 500);
            }
        }

        function startTimer() {
            state.seconds = 0;
            state.timer = setInterval(() => {
                state.seconds++;
                const m = Math.floor(state.seconds / 60).toString().padStart(2, '0');
                const s = (state.seconds % 60).toString().padStart(2, '0');
                document.getElementById('timer-val').innerText = `${m}:${s}`;
            }, 1000);
        }

        function showWinScreen() {
            const screen = document.getElementById('win-screen');
            const time = document.getElementById('timer-val').innerText;
            document.getElementById('final-stats').innerText = `Completed in ${time} with ${state.moves} maneuvers.`;
            screen.classList.remove('hidden');
        }