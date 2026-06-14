 const challenges = {
        easy: [
            { code: "___ x = 10;\nconsole.log(x);", answer: "let", hint: "A keyword used to declare a block-scoped variable.", desc: "Declare the variable 'x'." },
            { code: "function add(a, b) {\n  ___ a + b;\n}", answer: "return", hint: "This keyword sends a value back to the caller.", desc: "Make the function return the sum." }
        ],
        medium: [
            { code: "if (user.isAdmin ___ true) {\n  grantAccess();\n}", answer: "===", hint: "Strict equality operator.", desc: "Check if user is an admin." },
            { code: "for (let i = 0; i < 5; ___ ) {\n  console.log(i);\n}", answer: "i++", hint: "Increment the loop variable.", desc: "Complete the loop iteration statement." }
        ],
        hard: [
            { code: "const numbers = [1, 2, 3];\nconst doubled = numbers.___((n) => n * 2);", answer: "map", hint: "Creates a new array with the results of calling a function on every element.", desc: "Double all values in the array." },
            { code: "___ function fetchData() {\n  const res = await fetch(url);\n}", answer: "async", hint: "Defines a function that returns a Promise.", desc: "Enable the use of 'await' inside this function." }
        ]
    };

    let currentLevel = 'easy';
    let challengeIndex = 0;
    let score = 0;
    let timeLeft = 30;
    let timerInterval;

    function loadChallenge() {
        const challenge = challenges[currentLevel][challengeIndex];
        const codeWindow = document.getElementById('codeWindow');
        const parts = challenge.code.split('___');
        
        codeWindow.innerHTML = `${parts[0]}<input type="text" id="blank" class="code-blank" autofocus>${parts[1]}`;
        document.getElementById('description').innerText = challenge.desc;
        document.getElementById('levelBadge').className = `difficulty-badge ${currentLevel}`;
        document.getElementById('levelBadge').innerText = currentLevel;
        document.getElementById('hintBox').style.display = 'none';
        document.getElementById('feedback').innerText = '';
        
        resetTimer();
    }

    function resetTimer() {
        clearInterval(timerInterval);
        timeLeft = currentLevel === 'easy' ? 30 : (currentLevel === 'medium' ? 45 : 60);
        updateTimerDisplay();
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                document.getElementById('feedback').innerText = "Time's up! Try again.";
                document.getElementById('feedback').style.color = 'var(--danger)';
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        document.getElementById('timer').innerText = `${timeLeft}s`;
    }

    function checkAnswer() {
        const userAnswer = document.getElementById('blank').value.trim();
        const challenge = challenges[currentLevel][challengeIndex];

        if (userAnswer === challenge.answer) {
            clearInterval(timerInterval);
            score += 100 + (timeLeft * 2);
            document.getElementById('score').innerText = score;
            document.getElementById('feedback').innerText = "Correct! Well done.";
            document.getElementById('feedback').style.color = 'var(--success)';
            
            setTimeout(nextChallenge, 1500);
        } else {
            document.getElementById('feedback').innerText = "Incorrect. Check your syntax!";
            document.getElementById('feedback').style.color = 'var(--danger)';
        }
    }

    function showHint() {
        const challenge = challenges[currentLevel][challengeIndex];
        const hintBox = document.getElementById('hintBox');
        hintBox.innerText = `Hint: ${challenge.hint}`;
        hintBox.style.display = 'block';
        score = Math.max(0, score - 20);
        document.getElementById('score').innerText = score;
    }

    function nextChallenge() {
        challengeIndex++;
        if (challengeIndex >= challenges[currentLevel].length) {
            if (currentLevel === 'easy') currentLevel = 'medium';
            else if (currentLevel === 'medium') currentLevel = 'hard';
            else return alert("Game Complete! Final Score: " + score);
            challengeIndex = 0;
        }
        loadChallenge();
    }

    loadChallenge();