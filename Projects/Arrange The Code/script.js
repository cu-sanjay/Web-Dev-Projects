 const challenges = {
        easy: [
            {
                lines: ["let x = 5;", "let y = 10;", "console.log(x + y);"],
                desc: "Variable declaration and addition."
            },
            {
                lines: ["const greeting = 'Hello';", "function sayHi() {", "  console.log(greeting);", "}", "sayHi();"],
                desc: "Basic function and scope."
            }
        ],
        medium: [
            {
                lines: ["const nums = [1, 2, 3];", "let sum = 0;", "for (let n of nums) {", "  sum += n;", "}", "console.log(sum);"],
                desc: "Iterating through an array."
            },
            {
                lines: ["const isUser = true;", "if (isUser) {", "  console.log('Welcome');", "} else {", "  console.log('Guest');", "}"],
                desc: "Conditional logic flow."
            }
        ],
        hard: [
            {
                lines: ["async function load() {", "  const res = await fetch(url);", "  const data = await res.json();", "  return data;", "}", "load().then(console.log);"],
                desc: "Asynchronous data fetching."
            },
            {
                lines: ["class User {", "  constructor(name) {", "    this.name = name;", "  }", "  greet() { return 'Hi ' + this.name; }", "}", "const me = new User('Dev');"],
                desc: "Class definition and instantiation."
            }
        ]
    };

    let currentLevel = 'easy';
    let challengeIndex = 0;
    let score = 0;
    let timeLeft = 60;
    let timerInterval;
    let correctOrder = [];

    function shuffle(array) {
        let shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    function loadChallenge() {
        const challenge = challenges[currentLevel][challengeIndex];
        correctOrder = [...challenge.lines];
        const shuffledLines = shuffle(correctOrder);
        
        const container = document.getElementById('codeContainer');
        container.innerHTML = '';
        
        shuffledLines.forEach((line, index) => {
            const div = document.createElement('div');
            div.className = 'code-line';
            div.draggable = true;
            div.innerHTML = `<span class="drag-handle">☰</span> ${line}`;
            div.dataset.content = line;
            
            div.addEventListener('dragstart', () => div.classList.add('dragging'));
            div.addEventListener('dragend', () => div.classList.remove('dragging'));
            
            container.appendChild(div);
        });

        container.addEventListener('dragover', e => {
            e.preventDefault();
            const afterElement = getDragAfterElement(container, e.clientY);
            const dragging = document.querySelector('.dragging');
            if (afterElement == null) {
                container.appendChild(dragging);
            } else {
                container.insertBefore(dragging, afterElement);
            }
        });

        document.getElementById('description').innerText = challenge.desc;
        document.getElementById('levelBadge').className = `difficulty-badge ${currentLevel}`;
        document.getElementById('levelBadge').innerText = currentLevel;
        document.getElementById('feedback').innerText = '';
        
        resetTimer();
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.code-line:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function resetTimer() {
        clearInterval(timerInterval);
        timeLeft = currentLevel === 'easy' ? 60 : (currentLevel === 'medium' ? 90 : 120);
        document.getElementById('timer').innerText = `${timeLeft}s`;
        timerInterval = setInterval(() => {
            timeLeft--;
            document.getElementById('timer').innerText = `${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                document.getElementById('feedback').innerText = "Time's up! Try again.";
                document.getElementById('feedback').style.color = 'var(--danger)';
            }
        }, 1000);
    }

    function checkOrder() {
        const lines = [...document.querySelectorAll('.code-line')].map(el => el.dataset.content);
        const isCorrect = lines.every((val, index) => val === correctOrder[index]);

        if (isCorrect) {
            clearInterval(timerInterval);
            score += 150 + (timeLeft * 2);
            document.getElementById('score').innerText = score;
            document.getElementById('feedback').innerText = "Correct! Program works.";
            document.getElementById('feedback').style.color = 'var(--success)';
            setTimeout(nextChallenge, 1500);
        } else {
            document.getElementById('feedback').innerText = "Incorrect order. Try again!";
            document.getElementById('feedback').style.color = 'var(--danger)';
        }
    }

    function shuffleCurrent() {
        loadChallenge();
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