 const WORD_POOL = [
        { w: "BRAVE", a: "COWARDLY", d: ["FEARLESS", "STRONG", "BOLD"] },
        { w: "ANCIENT", a: "MODERN", d: ["OLD", "HISTORIC", "AGED"] },
        { w: "GENEROUS", a: "SELFISH", d: ["KIND", "GIVING", "STINGY"] },
        { w: "OPTIMISTIC", a: "PESSIMISTIC", d: ["HOPEFUL", "HAPPY", "BRIGHT"] },
        { w: "ARROGANT", a: "HUMBLE", d: ["PROUD", "LOUD", "VAIN"] },
        { w: "FRAGILE", a: "DURABLE", d: ["WEAK", "SOFT", "THIN"] },
        { w: "VICTORY", a: "DEFEAT", d: ["WIN", "GLORY", "SUCCESS"] },
        { w: "ABUNDANT", a: "SCARCE", d: ["PLENTY", "RICH", "FULL"] },
        { w: "INTENTIONAL", a: "ACCIDENTAL", d: ["PLANNED", "DIRECT", "FAST"] },
        { w: "TRANSPARENT", a: "OPAQUE", d: ["CLEAR", "GLASSY", "THIN"] }
    ];

    let state = { score: 0, streak: 0, timeLeft: 100, timerId: null, currentPair: null };

    function startGame() {
        state.score = 0;
        state.streak = 0;
        document.getElementById('screen-overlay').classList.add('hidden');
        updateStats();
        nextQuestion();
    }

    function nextQuestion() {
        state.timeLeft = 100;
        const pair = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
        state.currentPair = pair;
        
        document.getElementById('current-word').innerText = pair.w;
        
        const options = [pair.a, ...pair.d.slice(0, 3)].sort(() => Math.random() - 0.5);
        const container = document.getElementById('options-container');
        container.innerHTML = '';
        
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerText = opt;
            btn.onclick = () => checkAnswer(opt, btn);
            container.appendChild(btn);
        });

        startTimer();
    }

    function startTimer() {
        clearInterval(state.timerId);
        state.timerId = setInterval(() => {
            state.timeLeft -= 1.5;
            document.getElementById('timer').style.width = state.timeLeft + "%";
            if (state.timeLeft <= 0) endGame("Time's Up! ⏰");
        }, 100);
    }

    function checkAnswer(selected, btn) {
        clearInterval(state.timerId);
        const isCorrect = selected === state.currentPair.a;
        
        if (isCorrect) {
            btn.classList.add('correct');
            state.score += 10 + Math.floor(state.timeLeft / 10);
            state.streak++;
            setTimeout(nextQuestion, 600);
        } else {
            btn.classList.add('wrong');
            endGame("Wrong Answer! 🥺");
        }
        updateStats();
    }

    function updateStats() {
        document.getElementById('score').innerText = state.score;
        document.getElementById('streak').innerText = state.streak;
    }

    function endGame(reason) {
        clearInterval(state.timerId);
        document.getElementById('overlay-title').innerText = reason;
        document.getElementById('overlay-desc').innerText = `Final Score: ${state.score} | Best Streak: ${state.streak}`;
        document.getElementById('screen-overlay').classList.remove('hidden');
    }