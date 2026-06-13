const questions = [
            {
                topic: "Loops & Strings",
                code: "let res = '';\nfor (let i = 0; i < 3; i++) {\n  res += i;\n}\nconsole.log(res);",
                answer: "012",
                explain: "The loop iterates from 0 up to 2, appending each number as a string to 'res'."
            },
            {
                topic: "Functions & Scope",
                code: "const greet = (name) => `Hi ${name}`;\nconsole.log(greet());",
                answer: "Hi undefined",
                explain: "Since no argument was passed, 'name' is initialized as undefined."
            },
            {
                topic: "Arrays",
                code: "const nums = [1, 2, 3];\nnums.length = 1;\nconsole.log(nums[1]);",
                answer: "undefined",
                explain: "Setting length to 1 truncates the array. Index 1 no longer exists."
            },
            {
                topic: "Conditions",
                code: "const val = 0 || 'JS' || 1;\nconsole.log(val);",
                answer: "JS",
                explain: "The OR (||) operator returns the first truthy value. 0 is falsy, 'JS' is truthy."
            },
            {
                topic: "Recursion",
                code: "function f(n) {\n  return n <= 1 ? 1 : n + f(n - 1);\n}\nconsole.log(f(3));",
                answer: "6",
                explain: "Calculation: 3 + f(2) -> 3 + 2 + f(1) -> 3 + 2 + 1 = 6."
            }
        ];

        let currentIdx = 0;
        let score = 0;

        const DOM = {
            code: document.getElementById('codeSnippet'),
            input: document.getElementById('userInput'),
            score: document.getElementById('score'),
            cat: document.getElementById('category'),
            feedback: document.getElementById('feedbackBox'),
            status: document.getElementById('statusText'),
            explain: document.getElementById('explanationText'),
            submit: document.getElementById('submitBtn'),
            next: document.getElementById('nextBtn')
        };

        function loadQuestion() {
            const q = questions[currentIdx];
            DOM.code.innerText = q.code;
            DOM.cat.innerText = q.topic;
            DOM.input.value = "";
            DOM.feedback.style.display = "none";
            DOM.input.focus();
        }

        DOM.submit.addEventListener('click', () => {
            const q = questions[currentIdx];
            const isCorrect = DOM.input.value.trim() === q.answer;
            
            if (isCorrect) {
                score += 10;
                DOM.score.innerText = score;
                DOM.status.innerText = "✨ You Did It Champ!";
                DOM.feedback.className = "feedback correct";
                DOM.explain.innerText = q.explain;
            } else {
                DOM.status.innerText = "❌ Not quite right";
                DOM.feedback.className = "feedback wrong";
                DOM.explain.innerText = `Correct Answer: ${q.answer}\n\n${q.explain}`;
            }
            DOM.feedback.style.display = "block";
        });

        DOM.next.addEventListener('click', () => {
            currentIdx = (currentIdx + 1) % questions.length;
            loadQuestion();
        });

        loadQuestion();