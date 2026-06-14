const CHAIN = [
            { q: "I have a face but no eyes, hands but no arms. What am I?", a: "clock" },
            { q: "The more of me there is, the less you see. What am I?", a: "darkness" },
            { q: "I have keys, but no locks. I have a space, but no room. What am I?", a: "keyboard" },
            { q: "What is full of holes but still holds water?", a: "sponge" },
            { q: "I'm tall when I'm young, and I'm short when I'm old. What am I?", a: "candle" }
        ];

        let currentStep = 0;

        function init() {
            const dotsContainer = document.getElementById('dots');
            dotsContainer.innerHTML = CHAIN.map(() => `<div class="dot"></div>`).join('');
            updateUI();
        }

        function updateUI() {
            if (currentStep >= CHAIN.length) return win();

            document.getElementById('clue-display').innerText = CHAIN[currentStep].q;
            document.getElementById('answer-input').value = "";
            document.getElementById('answer-input').focus();
            
            const dots = document.querySelectorAll('.dot');
            dots.forEach((dot, i) => {
                dot.className = 'dot';
                if (i < currentStep) dot.classList.add('done');
                if (i === currentStep) dot.classList.add('active');
            });
        }

        function checkAnswer() {
            const input = document.getElementById('answer-input').value.trim().toLowerCase();
            const feedback = document.getElementById('feedback');

            if (input === CHAIN[currentStep].a) {
                currentStep++;
                feedback.innerText = "CLICK! Link unlocked! 🎉";
                feedback.style.color = "var(--secondary)";
                setTimeout(() => {
                    feedback.innerText = "";
                    updateUI();
                }, 1000);
            } else {
                feedback.innerText = "NOPE! Try again! 🧐";
                feedback.style.color = "var(--primary)";
                document.getElementById('card').style.animation = "none";
                document.getElementById('card').offsetHeight; // Trigger reflow
                document.getElementById('card').style.animation = "bounce 0.2s 2";
            }
        }

        function win() {
            document.getElementById('clue-display').innerHTML = "<h2>Chain Completed!</h2><p>You solved the mystery of the chain!</p>";
            document.getElementById('controls').classList.add('hidden');
            document.getElementById('card').classList.add('won');
            document.getElementById('feedback').innerText = "FREEDOM!";
        }

        document.getElementById('answer-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkAnswer();
        });

        init();