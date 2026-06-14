const QUESTIONS = [
            { q: "Which planet is known as the Red Planet?", a: "Mars", o: ["Earth", "Mars", "Jupiter", "Venus"] },
            { q: "What is the capital of France?", a: "Paris", o: ["London", "Berlin", "Paris", "Madrid"] },
            { q: "Who painted the Mona Lisa?", a: "Leonardo da Vinci", o: ["Picasso", "Van Gogh", "Leonardo da Vinci", "Michelangelo"] },
            { q: "Which is the largest ocean on Earth?", a: "Pacific Ocean", o: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"] },
            { q: "How many continents are there?", a: "7", o: ["5", "6", "7", "8"] },
            { q: "What is the chemical symbol for gold?", a: "Au", o: ["Ag", "Fe", "Au", "Pb"] },
            { q: "Which animal is known as the King of the Jungle?", a: "Lion", o: ["Tiger", "Lion", "Elephant", "Leopard"] },
            { q: "Who wrote 'Romeo and Juliet'?", a: "William Shakespeare", o: ["Charles Dickens", "Mark Twain", "William Shakespeare", "Jane Austen"] },
            { q: "Which is the smallest country in the world?", a: "Vatican City", o: ["Monaco", "Malta", "Vatican City", "San Marino"] },
            { q: "What is the hardest natural substance on Earth?", a: "Diamond", o: ["Gold", "Iron", "Diamond", "Quartz"] }
        ];

        let currentIndex = 0, score = 0, answered = false;
        const elements = {
            question: document.getElementById('question'), options: document.getElementById('options'),
            next: document.getElementById('next-btn'), currentQ: document.getElementById('current-q'),
            score: document.getElementById('current-score'), quiz: document.getElementById('quiz-screen'),
            results: document.getElementById('result-screen'), finalScore: document.getElementById('final-score'),
            restart: document.getElementById('restart-btn'), perf: document.getElementById('performance-msg')
        };

        function initQuiz() { currentIndex = 0; score = 0; elements.quiz.style.display = 'block'; elements.results.style.display = 'none'; loadQuestion(); }
        function loadQuestion() {
            answered = false; elements.next.style.display = 'none'; const data = QUESTIONS[currentIndex];
            elements.question.textContent = data.q; elements.currentQ.textContent = currentIndex + 1; elements.score.textContent = score;
            elements.options.innerHTML = '';
            data.o.forEach(opt => {
                const btn = document.createElement('button'); btn.textContent = opt; btn.className = 'option-btn';
                btn.onclick = () => { if(answered) return; answered = true; const correct = data.a === opt;
                    if(correct) { score++; elements.score.textContent = score; btn.classList.add('correct'); } else btn.classList.add('wrong');
                    Array.from(elements.options.children).forEach(b => { b.disabled = true; if(b.textContent === data.a) b.classList.add('correct'); });
                    elements.next.style.display = 'inline-block'; elements.next.textContent = currentIndex === QUESTIONS.length - 1 ? "Show Results" : "Next Question";
                }; elements.options.appendChild(btn);
            });
        }
        elements.next.onclick = () => { if(++currentIndex < QUESTIONS.length) loadQuestion(); else {
            elements.quiz.style.display = 'none'; elements.results.style.display = 'block'; elements.finalScore.textContent = score;
            elements.perf.textContent = score >= 8 ? "Excellent! 🌟" : score >= 5 ? "Good job! 👍" : "Keep learning! 😊";
        }};
        elements.restart.onclick = initQuiz; initQuiz();
  