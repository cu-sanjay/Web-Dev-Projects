document.addEventListener('DOMContentLoaded', () => {
    // 1. Auth Guard (Assuming sna_session is handled by auth.js)
    const session = JSON.parse(localStorage.getItem('sna_session'));
    if (!session) {
        console.warn("User not logged in. High scores will be saved as Guest.");
    }

    const challenges = {
        easy: [
            {
                title: "Variable Typo",
                desc: "Fix the variable name being used in the alert.",
                code: "function greet(user) {\n  let message = 'Hello ' + user;\n  alert(mesage);\n}",
                solution: /alert\s*\(\s*message\s*\)/,
                points: 100
            },
            {
                title: "String Concatenation",
                desc: "Fix the missing operator in the string concatenation.",
                code: "const fullName = (first, last) => {\n  return first ' ' + last;\n};",
                solution: /first\s*\+\s*['"]\s*['"]\s*\+\s*last/,
                points: 100
            }
        ],
        medium: [
            {
                title: "Assignment Error",
                desc: "The if statement should check for equality, not assign a value.",
                code: "function isAdmin(role) {\n  if (role = 'admin') {\n    return true;\n  }\n  return false;\n}",
                solution: /role\s*===\s*['"]admin['"]/,
                points: 250
            },
            {
                title: "Loop Logic",
                desc: "Fix the loop condition to stop after 10 iterations (i < 10).",
                code: "for (let i = 0; i >= 0; i++) {\n  if (i > 10) break;\n  console.log(i);\n}",
                solution: /i\s*<\s*10/,
                points: 250
            }
        ],
        hard: [
            {
                title: "Missing Return",
                desc: "The arrow function body with curly braces needs an explicit return.",
                code: "const getSquare = (n) => {\n  n * n;\n};",
                solution: /return\s+n\s*\*\s*n/,
                points: 500
            },
            {
                title: "Recursion Base Case",
                desc: "Fix the infinite recursion by correctly reducing 'n' in the recursive call.",
                code: "function factorial(n) {\n  if (n === 0) return 1;\n  return n * factorial(n);\n}",
                solution: /factorial\s*\(\s*n\s*-\s*1\s*\)/,
                points: 500
            }
        ]
    };

    let currentLevel = 'easy';
    let currentChallengeIndex = 0;
    let score = 0;
    let timerInterval;
    let timeLeft = 30;
    let attempts = 0;

    const DOM = {
        score: document.getElementById('score'),
        difficultyBtns: document.querySelectorAll('.difficulty-btn[data-level]'),
        challengeNum: document.getElementById('challengeNum'),
        diffDisplay: document.getElementById('currentDiffDisplay'),
        timer: document.getElementById('timer'),
        desc: document.getElementById('challengeDesc'),
        editor: document.getElementById('codeEditor'),
        submit: document.getElementById('submitBtn'),
        reset: document.getElementById('resetBtn'),
        feedback: document.getElementById('feedbackBox')
    };

    function initGame() {
        score = 0;
        currentChallengeIndex = 0;
        attempts = 0;
        loadChallenge();
        updateStats();
    }

    function loadChallenge() {
        const challenge = challenges[currentLevel][currentChallengeIndex];
        DOM.desc.innerHTML = `<strong>${challenge.title}</strong>: ${challenge.desc}`;
        DOM.editor.value = challenge.code;
        DOM.challengeNum.innerText = `${currentChallengeIndex + 1}/${challenges[currentLevel].length}`;
        DOM.diffDisplay.innerText = currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1);
        
        timeLeft = currentLevel === 'easy' ? 30 : (currentLevel === 'medium' ? 60 : 120);
        attempts = 0;
        startTimer();
        showFeedback('', '');
    }

    function startTimer() {
        clearInterval(timerInterval);
        DOM.timer.innerText = `${timeLeft}s`;
        timerInterval = setInterval(() => {
            timeLeft--;
            DOM.timer.innerText = `${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                showFeedback("Time's up! Try again.", "error");
            }
        }, 1000);
    }

    function updateStats() {
        DOM.score.innerText = score;
    }

    function showFeedback(msg, type) {
        DOM.feedback.innerText = msg;
        DOM.feedback.className = `feedback ${type}`;
        if (!msg) DOM.feedback.style.display = 'none';
        else DOM.feedback.style.display = 'block';
    }

    function checkSolution() {
        attempts++;
        const userCode = DOM.editor.value;
        const challenge = challenges[currentLevel][currentChallengeIndex];

        if (challenge.solution.test(userCode)) {
            clearInterval(timerInterval);
            
            const timeBonus = Math.floor(timeLeft * (currentLevel === 'easy' ? 1 : 2));
            const pointsGained = Math.max(0, Math.floor(challenge.points / attempts) + timeBonus);
            score += pointsGained;
            
            updateStats();
            showFeedback(`Correct! +${pointsGained} points.`, "success");

            setTimeout(() => {
                nextChallenge();
            }, 1500);
        } else {
            showFeedback("Not quite right. Keep debugging!", "error");
        }
    }

    function nextChallenge() {
        currentChallengeIndex++;
        if (currentChallengeIndex >= challenges[currentLevel].length) {
            alert(`Level Complete! Your final score: ${score}`);
            currentChallengeIndex = 0;
        }
        loadChallenge();
    }

    DOM.submit.addEventListener('click', checkSolution);
    DOM.reset.addEventListener('click', () => loadChallenge());
    DOM.difficultyBtns.forEach(btn => btn.addEventListener('click', (e) => {
        DOM.difficultyBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentLevel = e.target.dataset.level;
        initGame();
    }));

    initGame();
});