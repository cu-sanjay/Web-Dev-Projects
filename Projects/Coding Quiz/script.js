  const quizData = {
            JavaScript: [
                { q: "What is the output of 'typeof NaN'?", a: "number", options: ["number", "NaN", "undefined", "object"], exp: "In JS, NaN is considered a numeric type." },
                { q: "Which method is used to add an element at the end of an array?", a: "push()", options: ["push()", "pop()", "shift()", "unshift()"], exp: "push() appends to the end, while unshift() adds to the beginning." }
            ],
            Python: [
                { q: "Which keyword is used to create a function in Python?", a: "def", options: ["def", "func", "function", "lambda"], exp: "'def' is the standard keyword for function definitions." },
                { q: "How do you start a comment in Python?", a: "#", options: ["#", "//", "/*", "--"], exp: "# is used for single-line comments in Python." }
            ],
            Java: [
                { q: "Which of these is not a Java features?", a: "Use of pointers", options: ["Object-oriented", "Use of pointers", "Portable", "Dynamic"], exp: "Java explicitly removes pointers for memory safety." },
                { q: "Which class is the root of the Java class hierarchy?", a: "Object", options: ["Object", "System", "String", "Main"], exp: "java.lang.Object is the parent of all classes." }
            ],
            DSA: [
                { q: "What is the time complexity of searching in a balanced BST?", a: "O(log n)", options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"], exp: "Binary search in a balanced tree halves the search space each step." },
                { q: "Which data structure follows LIFO?", a: "Stack", options: ["Queue", "Stack", "LinkedList", "Heap"], exp: "Stack stands for Last-In First-Out." }
            ],
            DBMS: [
                { q: "Which SQL clause is used to filter records?", a: "WHERE", options: ["FILTER", "HAVING", "WHERE", "GROUP BY"], exp: "WHERE filters rows before grouping occurs." },
                { q: "What does ACID stand for in DBMS?", a: "Atomicity, Consistency, Isolation, Durability", options: ["Atomicity, Consistency, Isolation, Durability", "Access, Control, Integrity, Data", "Auto, Central, Internal, Disk", "None"], exp: "These properties guarantee database transactions are processed reliably." }
            ]
        };

        let currentCategory = "";
        let currentQIndex = 0;
        let score = 0;
        let userSelections = [];

        function startQuiz(cat) {
            currentCategory = cat;
            currentQIndex = 0;
            score = 0;
            userSelections = [];
            
            document.getElementById('categoryScreen').classList.add('hidden');
            document.getElementById('quizScreen').classList.remove('hidden');
            document.getElementById('topicDisplay').innerText = cat;
            
            loadQuestion();
        }

        function loadQuestion() {
            const questions = quizData[currentCategory];
            const q = questions[currentQIndex];
            
            document.getElementById('qNum').innerText = currentQIndex + 1;
            document.getElementById('qText').innerText = q.q;
            
            const list = document.getElementById('optionsList');
            list.innerHTML = "";
            
            q.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.innerText = opt;
                btn.onclick = () => selectOption(btn, opt);
                list.appendChild(btn);
            });

            document.getElementById('nextBtn').disabled = true;
            document.getElementById('nextBtn').style.opacity = 0.5;
        }

        function selectOption(btn, val) {
            document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            
            userSelections[currentQIndex] = val;
            document.getElementById('nextBtn').disabled = false;
            document.getElementById('nextBtn').style.opacity = 1;
        }

        function handleNext() {
            const questions = quizData[currentCategory];
            const correct = questions[currentQIndex].a;
            
            if (userSelections[currentQIndex] === correct) {
                score += 10;
            }

            currentQIndex++;
            if (currentQIndex < questions.length) {
                loadQuestion();
            } else {
                showResults();
            }
        }

        function showResults() {
            document.getElementById('quizScreen').classList.add('hidden');
            document.getElementById('resultScreen').classList.remove('hidden');
            document.getElementById('finalScore').innerText = score;

            const container = document.getElementById('reviewContainer');
            container.innerHTML = "";
            
            const questions = quizData[currentCategory];
            questions.forEach((q, idx) => {
                const isCorrect = userSelections[idx] === q.a;
                const div = document.createElement('div');
                div.className = `review-item ${isCorrect ? 'correct' : ''}`;
                
                div.innerHTML = `
                    <div style="font-weight: 500; margin-bottom: 10px;">${q.q}</div>
                    <div style="display: flex; gap: 20px;">
                        <div>
                            <div class="small-label">Your Answer</div>
                            <div style="color: ${isCorrect ? 'var(--success)' : 'var(--error)'}">${userSelections[idx]}</div>
                        </div>
                        ${!isCorrect ? `
                        <div>
                            <div class="small-label">Correct Answer</div>
                            <div style="color: var(--success)">${q.a}</div>
                        </div>` : ''}
                    </div>
                    <div style="margin-top: 10px; font-size: 13px; opacity: 0.7;">
                        <strong>Note:</strong> ${q.exp}
                    </div>
                `;
                container.appendChild(div);
            });

            // Save score to storage
            const session = JSON.parse(localStorage.getItem('sna_session'));
            if (session) {
                const history = JSON.parse(localStorage.getItem('quiz_history') || '[]');
                history.push({
                    user: session.username,
                    topic: currentCategory,
                    score: score,
                    date: new Date().toISOString()
                });
                localStorage.setItem('quiz_history', JSON.stringify(history));
            }
        }