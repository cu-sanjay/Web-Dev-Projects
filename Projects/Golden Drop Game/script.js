 // Simple list of common 3+ letter words for validation
        const DICTIONARY = ["THE", "AND", "FOR", "ARE", "BUT", "NOT", "YOU", "ALL", "ANY", "CAN", "HAD", "HER", "WAS", "ONE", "OUR", "OUT", "DAY", "GET", "HAS", "HIM", "HIS", "HOW", "MAN", "NEW", "NOW", "OLD", "SEE", "TWO", "WAY", "WHO", "BOY", "DID", "ITS", "LET", "PUT", "SAY", "SHE", "TOO", "USE", "WORD", "TIME", "BACK", "FROM", "GIVE", "GOOD", "HAVE", "LAST", "MADE", "NAME", "NEAR", "SOME", "TAKE", "THAN", "THAT", "THEIR", "THEM", "THEN", "THERE", "THESE", "THEY", "THIS", "THREE", "WANT", "WELL", "WENT", "WERE", "WHAT", "WHEN", "WHICH", "WILL", "WITH", "YOUR", "ABOUT", "AFTER", "AGAIN", "COULD", "EVERY", "FIRST", "GREAT", "HOUSE", "LARGE", "LEARN", "NEVER", "OTHER", "PLACE", "PLANT", "POINT", "RIGHT", "SMALL", "SOUND", "STILL", "STUDY", "THEIR", "THERE", "THESE", "THING", "THINK", "WATER", "WHICH", "WORLD", "WOULD", "WRITE"];
        
        let state = {
            score: 0,
            level: 1,
            letters: [],
            selected: [],
            isGameOver: false,
            lastSpawn: 0,
            spawnRate: 2000
        };

        const vault = document.getElementById('vault');
        const currentWordDisplay = document.getElementById('current-word');

        function startGame() {
            state = {
                score: 0,
                level: 1,
                letters: [],
                selected: [],
                isGameOver: false,
                lastSpawn: 0,
                spawnRate: 2000
            };
            vault.querySelectorAll('.letter-coin').forEach(c => c.remove());
            document.getElementById('start-overlay').classList.add('hidden');
            document.getElementById('game-over-overlay').classList.add('hidden');
            updateUI();
            requestAnimationFrame(gameLoop);
        }

        function spawnLetter() {
            const alphabet = "EEEEEEEEEEAAAAAAAIIIIIOOOOOUUUUNNNNRRRRTTTTLLLLSSSSDDDDGGGBBCCMMPPFFHHVVWWYYJKQX Z";
            const char = alphabet[Math.floor(Math.random() * alphabet.length)].trim();
            if (!char) return spawnLetter();

            const coin = document.createElement('div');
            coin.className = 'letter-coin';
            coin.innerText = char;
            coin.style.left = Math.random() * (vault.clientWidth - 60) + 'px';
            coin.style.top = '-60px';
            
            const letterObj = {
                el: coin,
                char: char,
                y: -60,
                speed: 0.5 + (state.level * 0.2)
            };

            coin.onclick = () => selectLetter(letterObj);
            vault.appendChild(coin);
            state.letters.push(letterObj);
        }

        function selectLetter(obj) {
            if (state.selected.includes(obj)) return;
            obj.el.classList.add('selected');
            state.selected.push(obj);
            currentWordDisplay.innerText = state.selected.map(o => o.char).join('');
        }

        function clearSelection() {
            state.selected.forEach(o => o.el.classList.remove('selected'));
            state.selected = [];
            currentWordDisplay.innerText = '';
        }

        function submitWord() {
            const word = state.selected.map(o => o.char).join('');
            if (word.length < 3) return;

            if (DICTIONARY.includes(word) || word.length > 5) { // Reward longer words even if not in mini-dict
                state.score += word.length * 10 * state.level;
                state.selected.forEach(o => {
                    o.el.remove();
                    state.letters = state.letters.filter(l => l !== o);
                });
                if (state.score > state.level * 500) {
                    state.level++;
                    state.spawnRate = Math.max(800, state.spawnRate - 200);
                }
                clearSelection();
                updateUI();
            } else {
                clearSelection();
            }
        }

        function gameLoop(time) {
            if (state.isGameOver) return;

            if (time - state.lastSpawn > state.spawnRate) {
                spawnLetter();
                state.lastSpawn = time;
            }

            state.letters.forEach(l => {
                l.y += l.speed;
                l.el.style.top = l.y + 'px';

                // Check if stacked too high
                if (l.y > vault.clientHeight - 60) {
                    l.y = vault.clientHeight - 60;
                }
            });

            if (state.letters.length > 20) {
                gameOver();
            }

            document.getElementById('count').innerText = `${state.letters.length}/20`;
            requestAnimationFrame(gameLoop);
        }

        function updateUI() {
            document.getElementById('score').innerText = state.score;
            document.getElementById('level').innerText = state.level;
        }

        function gameOver() {
            state.isGameOver = true;
            const over = document.getElementById('game-over-overlay');
            over.classList.remove('hidden');
            document.getElementById('final-stats').innerText = `You secured ${state.score} coins and reached level ${state.level}.`;
        }