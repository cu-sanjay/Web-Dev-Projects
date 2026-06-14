const emojis = ['🔥', '🔥', '💻', '💻', '🚀', '🚀', '🎨', '🎨', '🎮', '🎮', '🍕', '🍕', '🐱', '🐱', '🤖', '🤖'];
let shuffledEmojis = [];
let flippedCards = [];
let matchedCount = 0;
let moves = 0;
let timer = 0;
let timerInterval = null;
let isGameStarted = false;

const grid = document.getElementById('grid');
const movesDisplay = document.getElementById('moves');
const timerDisplay = document.getElementById('timer');

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function startGame() {
    grid.innerHTML = '';
    shuffledEmojis = shuffle([...emojis]);
    flippedCards = [];
    matchedCount = 0;
    moves = 0;
    timer = 0;
    movesDisplay.textContent = moves;
    timerDisplay.textContent = '0s';
    isGameStarted = false;
    clearInterval(timerInterval);

    for (let i = 0; i < shuffledEmojis.length; i++) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.index = i;
        card.addEventListener('click', flipCard);
        grid.appendChild(card);
    }
}

function startTimer() {
    isGameStarted = true;
    timerInterval = setInterval(() => {
        timer++;
        timerDisplay.textContent = timer + 's';
    }, 1000);
}

function flipCard() {
    if (!isGameStarted) startTimer();
    if (flippedCards.length >= 2 || this.classList.contains('flipped') || this.classList.contains('matched')) return;

    this.classList.add('flipped');
    this.textContent = shuffledEmojis[this.dataset.index];
    flippedCards.push(this);

    if (flippedCards.length === 2) {
        moves++;
        movesDisplay.textContent = moves;
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    if (card1.textContent === card2.textContent) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedCount += 2;
        flippedCards = [];
        if (matchedCount === emojis.length) {
            clearInterval(timerInterval);
            setTimeout(() => alert(`🎉 Congratulations! You won in ${moves} moves and ${timer} seconds!`), 300);
        }
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            card1.textContent = '';
            card2.textContent = '';
            flippedCards = [];
        }, 800);
    }
}

function restartGame() {
    startGame();
}

startGame();