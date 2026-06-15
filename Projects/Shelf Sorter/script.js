 const RULES = [
            { label: "Alphabetical Order (A-Z)", check: (arr) => arr.every((v, i) => i === 0 || v.title >= arr[i-1].title) },
            { label: "Size: Small to Large", check: (arr) => arr.every((v, i) => i === 0 || v.height >= arr[i-1].height) },
            { label: "Reverse Alphabetical (Z-A)", check: (arr) => arr.every((v, i) => i === 0 || v.title <= arr[i-1].title) },
            { label: "Hue: Rainbow Order", check: (arr) => arr.every((v, i) => i === 0 || v.hue >= arr[i-1].hue) }
        ];

        const COLORS = [
            { h: 0, c: "#E57373" },  // Red
            { h: 30, c: "#FFB74D" }, // Orange
            { h: 60, c: "#FFF176" }, // Yellow
            { h: 120, c: "#81C784" },// Green
            { h: 200, c: "#64B5F6" },// Blue
            { h: 280, c: "#BA68C8" } // Purple
        ];

        let state = {
            level: 0,
            score: 0,
            books: [],
            timeLeft: 30,
            timer: null
        };

        function startGame() {
            document.getElementById('start-overlay').classList.add('hidden');
            state.level = 0;
            state.score = 0;
            initLevel();
        }

        function initLevel() {
            document.getElementById('win-overlay').classList.add('hidden');
            state.timeLeft = Math.max(10, 30 - state.level * 2);
            
            const ruleIndex = state.level % RULES.length;
            document.getElementById('rule-text').innerText = RULES[ruleIndex].label;
            document.getElementById('level-val').innerText = state.level + 1;
            document.getElementById('score-val').innerText = state.score;

            generateBooks();
            startTimer();
        }

        function generateBooks() {
            const count = Math.min(12, 5 + Math.floor(state.level / 2));
            state.books = [];
            const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

            for (let i = 0; i < count; i++) {
                const color = COLORS[Math.floor(Math.random() * COLORS.length)];
                state.books.push({
                    id: i,
                    title: alphabet[Math.floor(Math.random() * 26)],
                    height: 100 + Math.random() * 80,
                    hue: color.h,
                    color: color.c
                });
            }

            // Shuffle to ensure it's not solved
            state.books.sort(() => Math.random() - 0.5);
            renderShelf();
        }

        function renderShelf() {
            const shelf = document.getElementById('shelf');
            shelf.innerHTML = '';
            state.books.forEach((book, index) => {
                const el = document.createElement('div');
                el.className = 'book';
                el.draggable = true;
                el.style.height = `${book.height}px`;
                el.style.backgroundColor = book.color;
                el.innerText = book.title;
                
                el.addEventListener('dragstart', () => el.classList.add('dragging'));
                el.addEventListener('dragend', () => {
                    el.classList.remove('dragging');
                    checkWin();
                });

                shelf.appendChild(el);
            });

            shelf.addEventListener('dragover', e => {
                e.preventDefault();
                const afterElement = getDragAfterElement(shelf, e.clientX);
                const dragging = document.querySelector('.dragging');
                if (afterElement == null) {
                    shelf.appendChild(dragging);
                } else {
                    shelf.insertBefore(dragging, afterElement);
                }
            });
        }

        function getDragAfterElement(container, x) {
            const draggableElements = [...container.querySelectorAll('.book:not(.dragging)')];
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = x - box.left - box.width / 2;
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }

        function checkWin() {
            const currentOrder = [...document.querySelectorAll('.book')].map(el => {
                return state.books.find(b => b.title === el.innerText && b.height === parseFloat(el.style.height));
            });

            const rule = RULES[state.level % RULES.length];
            if (rule.check(currentOrder)) {
                clearInterval(state.timer);
                state.score += (state.level + 1) * 100 + state.timeLeft * 10;
                document.getElementById('win-overlay').classList.remove('hidden');
            }
        }

        function startTimer() {
            clearInterval(state.timer);
            updateTimerUI();
            state.timer = setInterval(() => {
                state.timeLeft--;
                updateTimerUI();
                if (state.timeLeft <= 0) {
                    clearInterval(state.timer);
                    alert("Time's up! The sun has set on the library. 🌇");
                    startGame();
                }
            }, 1000);
        }

        function updateTimerUI() {
            document.getElementById('timer').innerText = state.timeLeft;
        }

        function nextLevel() {
            state.level++;
            initLevel();
        }