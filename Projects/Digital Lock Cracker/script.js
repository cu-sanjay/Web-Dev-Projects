let secretCode = generateCode();
let attemptsLeft = 10;

const guessInput = document.getElementById("guessInput");
const guessBtn = document.getElementById("guessBtn");
const history = document.getElementById("history");
const message = document.getElementById("message");
const attemptsDisplay = document.getElementById("attempts");
const restartBtn = document.getElementById("restartBtn");

function generateCode() {
    let code = "";

    while (code.length < 4) {
        code += Math.floor(Math.random() * 10);
    }

    return code;
}

function checkGuess() {
    const guess = guessInput.value.trim();

    if (!/^\d{4}$/.test(guess)) {
        showMessage("Enter exactly 4 digits.", "error");
        return;
    }

    attemptsLeft--;
    attemptsDisplay.textContent = attemptsLeft;

    let correctPosition = 0;
    let correctDigit = 0;
    let hintText = [];

    for (let i = 0; i < 4; i++) {

        if (guess[i] === secretCode[i]) {
            correctPosition++;
            hintText.push(
                `Position ${i + 1}: ✅ ${guess[i]} is correct`
            );
        }

        else if (secretCode.includes(guess[i])) {
            correctDigit++;
            hintText.push(
                `Position ${i + 1}: 🟡 ${guess[i]} exists but is misplaced`
            );
        }

        else {
            hintText.push(
                `Position ${i + 1}: ❌ ${guess[i]} not in code`
            );
        }
    }

    const item = document.createElement("div");
    item.classList.add("history-item");

    item.innerHTML = `
        <div>
            <strong>Guess:</strong> ${guess}<br>
            <small>
                ✅ Correct Position: ${correctPosition} |
                🟡 Correct Digit: ${correctDigit}
            </small>
            <br><br>
            ${hintText.join("<br>")}
        </div>
    `;

    history.prepend(item);

    if (guess === secretCode) {
        showMessage(
            `🎉 Congratulations! You cracked the lock. Secret Code: ${secretCode}`,
            "success"
        );

        guessBtn.disabled = true;
        guessInput.disabled = true;
        return;
    }

    if (attemptsLeft <= 0) {
        showMessage(
            `💀 Game Over! Secret Code was ${secretCode}`,
            "error"
        );

        guessBtn.disabled = true;
        guessInput.disabled = true;
        return;
    }

    showMessage(
        `✅ ${correctPosition} correct position | 🟡 ${correctDigit} correct digit`,
        "info"
    );

    guessInput.value = "";
}
function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
}

function restartGame() {
    secretCode = generateCode();
    attemptsLeft = 10;

    attemptsDisplay.textContent = attemptsLeft;
    history.innerHTML = "";

    guessBtn.disabled = false;
    guessInput.disabled = false;

    guessInput.value = "";
    showMessage("New game started. Good luck!", "info");
}

guessBtn.addEventListener("click", checkGuess);

guessInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        checkGuess();
    }
});

restartBtn.addEventListener("click", restartGame);