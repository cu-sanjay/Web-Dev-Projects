const flashcardsContainer = document.getElementById("flashcards");
const questionInput = document.getElementById("questionInput");
const answerInput = document.getElementById("answerInput");
const scoreEl = document.getElementById("score");

let flashcards = JSON.parse(localStorage.getItem("flashcards")) || [];
let score = 0;

function addCard() {
  const question = questionInput.value.trim();
  const answer = answerInput.value.trim();
  if (!question || !answer) {
    alert("Please enter both question and answer!");
    return;
  }

  const card = { id: Date.now(), question, answer };
  flashcards.push(card);
  localStorage.setItem("flashcards", JSON.stringify(flashcards));
  questionInput.value = "";
  answerInput.value = "";
  renderCards();
}

function renderCards() {
  flashcardsContainer.innerHTML = "";
  flashcards.forEach(card => {
    const cardEl = document.createElement("div");
    cardEl.className = "card";
    cardEl.innerHTML = `
      <div class="card-inner">
        <div class="card-front">${card.question}</div>
        <div class="card-back">${card.answer}</div>
      </div>
    `;
    cardEl.addEventListener("click", () => {
      cardEl.classList.toggle("flipped");
      if (cardEl.classList.contains("flipped")) {
        score++;
        scoreEl.textContent = `Score: ${score}`;
      }
    });
    flashcardsContainer.appendChild(cardEl);
  });
}

// Initial render
renderCards();
