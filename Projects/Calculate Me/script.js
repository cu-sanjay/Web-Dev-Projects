  let score = 0, timeLeft = 30, timerInterval, currentAnswer, isGameOver = false;

        const elements = {
            question: document.getElementById('question'),
            input: document.getElementById('answer-input'),
            score: document.getElementById('score'),
            timer: document.getElementById('timer'),
            feedback: document.getElementById('feedback'),
            submit: document.getElementById('submit-btn'),
            restart: document.getElementById('restart-btn'),
            area: document.getElementById('game-area')
        };

        function generateQuestion() {
            const ops = ['+', '-', '*'];
            const op = ops[Math.floor(Math.random() * ops.length)];
            let n1 = Math.floor(Math.random() * (op === '*' ? 12 : 50)) + 1;
            let n2 = Math.floor(Math.random() * (op === '*' ? 12 : 50)) + 1;

            if (op === '-' && n1 < n2) [n1, n2] = [n2, n1];
            elements.question.textContent = `${n1} ${op} ${n2}`;
            currentAnswer = op === '+' ? n1 + n2 : op === '-' ? n1 - n2 : n1 * n2;
        }

        function startGame() {
            score = 0; timeLeft = 30; isGameOver = false;
            elements.score.textContent = score; elements.timer.textContent = timeLeft;
            elements.feedback.textContent = ''; elements.area.classList.remove('hidden');
            elements.restart.style.display = 'none'; elements.input.value = '';
            elements.input.focus();
            generateQuestion();
            clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                if (--timeLeft <= 0) endGame();
                elements.timer.textContent = timeLeft;
            }, 1000);
        }

        function checkAnswer() {
            if (isGameOver || !elements.input.value) return;
            const correct = parseInt(elements.input.value) === currentAnswer;
            if (correct) { score++; elements.score.textContent = score; }
            elements.feedback.textContent = correct ? 'Correct! 🎉' : 'Wrong! ❌';
            elements.feedback.style.color = correct ? 'var(--success-color)' : 'var(--error-color)';
            elements.input.value = ''; elements.input.focus();
            generateQuestion();
            setTimeout(() => { if (!isGameOver) elements.feedback.textContent = ''; }, 800);
        }

        function endGame() {
            isGameOver = true; clearInterval(timerInterval);
            elements.area.classList.add('hidden'); elements.restart.style.display = 'block';
            elements.feedback.textContent = `Time's up! Final Score: ${score}`;
            elements.feedback.style.color = 'var(--primary-color)';
        }

        elements.submit.addEventListener('click', checkAnswer);
        elements.input.addEventListener('keypress', (e) => e.key === 'Enter' && checkAnswer());
        elements.restart.addEventListener('click', startGame);
        startGame();