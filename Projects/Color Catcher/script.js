const gameArea = document.getElementById("gameArea");
const catcher = document.getElementById("catcher");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const startBtn = document.getElementById("startBtn");

let catcherX = 160;
let score = 0;
let lives = 3;
let speed = 3;
let gameRunning = false;

document.addEventListener("keydown", (e) => {
    if (!gameRunning) return;

    if (e.key === "ArrowLeft" && catcherX > 0) {
        catcherX -= 20;
    }

    if (e.key === "ArrowRight" && catcherX < 320) {
        catcherX += 20;
    }

    catcher.style.left = catcherX + "px";
});

function createBall() {
    if (!gameRunning) return;

    const ball = document.createElement("div");
    ball.classList.add("falling");

    const colors = ["red", "blue", "green"];
    const color = colors[Math.floor(Math.random() * colors.length)];

    ball.style.background = color;
    ball.dataset.color = color;
    ball.style.left = Math.random() * 370 + "px";
    ball.style.top = "0px";

    gameArea.appendChild(ball);

    let fall = 0;

    const interval = setInterval(() => {
        fall += speed;
        ball.style.top = fall + "px";

        const ballX = ball.offsetLeft;
        const catcherLeft = catcher.offsetLeft;

        if (
            fall > 450 &&
            ballX > catcherLeft - 20 &&
            ballX < catcherLeft + 80
        ) {
            score++;
            scoreDisplay.textContent = score;

            if (score % 5 === 0) {
                speed += 0.5;
            }

            ball.remove();
            clearInterval(interval);
        }

        if (fall > 500) {
            lives--;
            livesDisplay.textContent = lives;

            ball.remove();
            clearInterval(interval);

            if (lives <= 0) {
                gameRunning = false;
                alert("Game Over! Score: " + score);
            }
        }
    }, 20);
}

startBtn.addEventListener("click", () => {
    score = 0;
    lives = 3;
    speed = 3;

    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;

    gameRunning = true;

    setInterval(() => {
        if (gameRunning) {
            createBall();
        }
    }, 1000);
});
