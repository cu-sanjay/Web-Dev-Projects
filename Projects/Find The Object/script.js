const EMOJIS = ["🍎", "🐶", "🚀", "🎸", "🍕", "🍦", "🦁", "🚗", "🌈", "🏀", "🍔", "🐱", "🛸", "🎹", "🍣", "🍩", "🐘", "🚂", "🍀", "🏈", "🍒", "🐼", "🚁", "🎻", "🥨", "🧁", "🦋", "🚲", "🍄", "🏐"];
    
    let state = {
        round: 1,
        score: 0,
        currentSet: [],
        hiddenItem: null,
        phase: 'start'
    };

    function startGame() {
        state.round = 1;
        state.score = 0;
        document.getElementById('overlay').classList.add('hidden');
        nextRound();
    }

    function nextRound() {
        if (state.round > 10) return endGame("Legendary Memory! 🏆");
        
        document.getElementById('round').innerText = state.round;
        document.getElementById('score').innerText = state.score;
        document.getElementById('options').classList.add('hidden');
        document.getElementById('phase-label').innerText = "Memorize the 10 items!";
        
        // Pick 10 unique random emojis
        state.currentSet = [...EMOJIS].sort(() => Math.random() - 0.5).slice(0, 10);
        renderGrid(state.currentSet);

        const timer = document.getElementById('timer-bar');
        timer.style.transition = 'none';
        timer.style.width = '100%';
        
        setTimeout(() => {
            timer.style.transition = 'width 4s linear';
            timer.style.width = '0%';
        }, 50);

        setTimeout(hidePhase, 4000);
    }

    function renderGrid(items) {
        const grid = document.getElementById('grid');
        grid.innerHTML = items.map(item => `<div class="obj-item">${item}</div>`).join('');
    }

    function hidePhase() {
        state.hiddenItem = state.currentSet[Math.floor(Math.random() * 10)];
        const remaining = state.currentSet.filter(i => i !== state.hiddenItem);
        
        document.getElementById('phase-label').innerText = "What's missing?";
        renderGrid(remaining);

        // Generate 4 choices
        let choices = [state.hiddenItem];
        while(choices.length < 4) {
            let r = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
            if(!state.currentSet.includes(r) && !choices.includes(r)) choices.push(r);
        }
        choices.sort(() => Math.random() - 0.5);

        const optContainer = document.getElementById('options');
        optContainer.innerHTML = choices.map(choice => 
            `<button class="option-btn" onclick="checkChoice('${choice}', this)">${choice}</button>`
        ).join('');
        optContainer.classList.remove('hidden');
    }

    function checkChoice(choice, btn) {
        const btns = document.querySelectorAll('.option-btn');
        btns.forEach(b => b.disabled = true);

        if (choice === state.hiddenItem) {
            btn.classList.add('correct');
            state.score += 10;
            state.round++;
            setTimeout(nextRound, 1000);
        } else {
            btn.classList.add('wrong');
            btns.forEach(b => { if(b.innerText === state.hiddenItem) b.classList.add('correct'); });
            setTimeout(() => endGame("Game Over! 🔮"), 1500);
        }
    }

    function endGame(title) {
        const overlay = document.getElementById('overlay');
        document.getElementById('overlay-title').innerText = title;
        overlay.querySelector('p').innerText = `Final Score: ${state.score} | Rounds: ${state.round - 1}`;
        overlay.classList.remove('hidden');
    }