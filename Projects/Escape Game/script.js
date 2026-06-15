const puzzles = [
    {
        desc: "You are trapped in the exam hall. The digital clock reads 10:15 AM. A note on the proctor's desk says: 'The first part of the code is the number of minutes since 10:00 AM.'",
        answer: "15",
        hint: "Just look at the minutes on the clock."
    },
    {
        desc: "You found a calculator with a sticky note: 'Solve me to unlock the locker: (15 * 4) / 2 + 7'.",
        answer: "37",
        hint: "Perform multiplication, then division, then addition."
    },
    {
        desc: "A logic puzzle on the wall: 'A man is looking at a photograph. His friend asks, \"Who it is?\" The man replies, \"Brothers and sisters, I have none. But that man\'s father is my father\'s son.\" Who is in the photograph?'",
        answer: "son",
        hint: "Think about who 'my father's son' is if he has no siblings."
    },
    {
        desc: "The exit keypad asks for one final word: 'I have keys, but no locks. I have a space, but no room. You can enter, but never leave. What am I?'",
        answer: "keyboard",
        hint: "You are likely using one right now."
    }
];

let currentPuzzle = 0;
let timeLeft = 300; // 5 minutes
let timerId = null;

const timerDisplay = document.getElementById('timer');
const descDisplay = document.getElementById('scene-desc');
const inputField = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const feedback = document.getElementById('feedback');
const progressFill = document.getElementById('progress-fill');

function startTimer() {
    timerId = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

function updateTimerDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    
    if (timeLeft < 60) {
        timerDisplay.style.color = 'var(--urgent)';
    }
}

function renderPuzzle() {
    const p = puzzles[currentPuzzle];
    descDisplay.textContent = p.desc;
    inputField.value = '';
    feedback.textContent = '';
    updateProgress();
    inputField.focus();
}

function updateProgress() {
    const percent = (currentPuzzle / puzzles.length) * 100;
    progressFill.style.width = `${percent}%`;
}

function checkAnswer() {
    const userAnswer = inputField.value.trim().toLowerCase();
    const correctAnswer = puzzles[currentPuzzle].answer.toLowerCase();

    if (userAnswer === correctAnswer) {
        currentPuzzle++;
        if (currentPuzzle >= puzzles.length) {
            endGame(true);
        } else {
            showFeedback("Correct! The door opens...", "var(--success)");
            setTimeout(renderPuzzle, 1000);
        }
    } else {
        showFeedback("Incorrect. You lost 10 seconds!", "var(--urgent)");
        timeLeft = Math.max(0, timeLeft - 10);
        updateTimerDisplay();
    }
}

function showFeedback(msg, color) {
    feedback.textContent = msg;
    feedback.style.color = color;
}

function endGame(won) {
    clearInterval(timerId);
    if (won) {
        progressFill.style.width = '100%';
        descDisplay.innerHTML = `<h2 style="color: var(--success)">FREEDOM!</h2><p>You solved the final puzzle and escaped the hall just in time. The results don't matter now!</p>`;
    } else {
        descDisplay.innerHTML = `<h2 style="color: var(--urgent)">FAILED!</h2><p>The exam time is over. The doors are sealed. You are now a permanent part of the hall.</p>`;
    }
    
    document.querySelector('.input-area').style.display = 'none';
    feedback.textContent = won ? "You Escaped!" : "Game Over.";
}

submitBtn.addEventListener('click', checkAnswer);
inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkAnswer();
});

startTimer();
renderPuzzle();