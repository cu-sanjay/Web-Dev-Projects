 const words = ["SUN", "HOUSE", "CAT", "PIZZA", "TREE", "CAKE", "FLOWER", "SNAKE", "MOON", "HEART", "APPLE", "STAR", "FISH", "BIRD"];
        let currentWord = "";
        let score = 0;
        let timeLeft = 60;
        let timerId = null;

        // Canvas Logic
        const canvas = document.getElementById('paintCanvas');
        const ctx = canvas.getContext('2d');
        let drawing = false;
        let currentColor = "#000";

        function resizeCanvas() {
            const wrap = document.getElementById('canvas-wrap');
            canvas.width = wrap.clientWidth;
            canvas.height = 350;
        }
        window.addEventListener('resize', resizeCanvas);

        function startPosition(e) {
            drawing = true;
            draw(e);
        }
        function endPosition() {
            drawing = false;
            ctx.beginPath();
        }
        function draw(e) {
            if (!drawing) return;
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.strokeStyle = currentColor;

            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX || e.touches[0].clientX) - rect.left;
            const y = (e.clientY || e.touches[0].clientY) - rect.top;

            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        }

        canvas.addEventListener('mousedown', startPosition);
        canvas.addEventListener('mouseup', endPosition);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startPosition(e); });
        canvas.addEventListener('touchend', endPosition);
        canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e); });

        function setColor(color, el) {
            currentColor = color;
            document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
            el.classList.add('active');
        }

        function clearCanvas() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // Game Navigation
        function showScreen(id) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById(id).classList.add('active');
        }

        function startGame() {
            currentWord = words[Math.floor(Math.random() * words.length)];
            document.getElementById('word-prompt').innerText = currentWord;
            document.getElementById('drawing-word-hint').innerText = currentWord;
            clearCanvas();
            showScreen('screen-pre-draw');
        }

        function startDrawing() {
            showScreen('screen-draw');
            resizeCanvas();
            timeLeft = 60;
            document.getElementById('timer-text').innerText = timeLeft;
            clearInterval(timerId);
            timerId = setInterval(() => {
                timeLeft--;
                document.getElementById('timer-text').innerText = timeLeft;
                if (timeLeft <= 0) finishDrawing();
            }, 1000);
        }

        function finishDrawing() {
            clearInterval(timerId);
            const dataURL = canvas.toDataURL();
            document.getElementById('drawn-image-preview').src = dataURL;
            document.getElementById('guess-input').value = "";
            showScreen('screen-guess');
        }

        function submitGuess() {
            const guess = document.getElementById('guess-input').value.trim().toUpperCase();
            const title = document.getElementById('result-title');
            const text = document.getElementById('result-text');

            if (guess === currentWord) {
                score += 10;
                title.innerText = "AMAZING! 🌟";
                text.innerText = `You correctly guessed ${currentWord}!`;
                text.style.color = "var(--secondary)";
            } else {
                title.innerText = "OH NO! 🥺";
                text.innerText = `It was actually ${currentWord}.`;
                text.style.color = "var(--primary)";
            }

            document.getElementById('score-val').innerText = score;
            showScreen('screen-result');
        }