 document.addEventListener('DOMContentLoaded', () => {
            const challenges = [
                { 
                    title: "Hello World", 
                    desc: "Write a function 'solution()' that returns the string 'Hello World'.", 
                    starter: "function solution() {\n  return \"\";\n}", 
                    tests: [{ input: [], output: "Hello World" }] 
                },
                { 
                    title: "Basic Addition", 
                    desc: "Write a function 'solution(a, b)' that returns the sum of a and b.", 
                    starter: "function solution(a, b) {\n  return a + b;\n}", 
                    tests: [{ input: [5, 3], output: 8 }, { input: [10, -2], output: 8 }] 
                },
                { 
                    title: "Is Even?", 
                    desc: "Write a function 'solution(n)' that returns true if n is even, and false if it is odd.", 
                    starter: "function solution(n) {\n  \n}", 
                    tests: [{ input: [4], output: true }, { input: [7], output: false }] 
                },
                {
                    title: "Return One",
                    desc: "Write a function 'solution()' that always returns the number 1.",
                    starter: "function solution() {\n  \n}",
                    tests: [{ input: [], output: 1 }]
                }
            ];

            let currentChallenge = null;
            let score = 0;

            const DOM = {
                title: document.getElementById('challengeTitle'),
                desc: document.getElementById('challengeDesc'),
                editor: document.getElementById('codeEditor'),
                score: document.getElementById('score'),
                result: document.getElementById('result'),
                run: document.getElementById('runBtn'),
                next: document.getElementById('nextBtn'),
                confetti: document.getElementById('confetti-canvas')
            };

            function createConfetti() {
                for (let i = 0; i < 50; i++) {
                    const confetti = document.createElement('div');
                    confetti.innerText = ["🎊", "🎉", "✨", "⭐"][Math.floor(Math.random() * 4)];
                    confetti.style.position = 'absolute';
                    confetti.style.left = Math.random() * 100 + 'vw';
                    confetti.style.top = '-5vh';
                    confetti.style.fontSize = (Math.random() * 20 + 20) + 'px';
                    confetti.style.transition = `all ${Math.random() * 2 + 2}s linear`;
                    DOM.confetti.appendChild(confetti);

                    setTimeout(() => {
                        confetti.style.top = '105vh';
                        confetti.style.transform = `rotate(${Math.random() * 1000}deg)`;
                    }, 50);

                    setTimeout(() => confetti.remove(), 4000);
                }
            }

            function loadRandomChallenge() {
                currentChallenge = challenges[Math.floor(Math.random() * challenges.length)];
                DOM.title.innerText = `🚀 ${currentChallenge.title}`;
                DOM.desc.innerText = currentChallenge.desc;
                DOM.editor.value = currentChallenge.starter;
                DOM.result.style.display = 'none';
            }

            function showResult(msg, type) {
                DOM.result.innerText = msg;
                DOM.result.style.display = 'block';
                DOM.result.style.background = type === 'success' ? 'rgba(129, 201, 149, 0.2)' : 'rgba(242, 139, 130, 0.2)';
                DOM.result.style.color = type === 'success' ? '#81c995' : '#f28b82';
                DOM.result.style.fontWeight = "bold";
                DOM.result.style.textAlign = "center";
                DOM.result.style.padding = "15px";
                DOM.result.style.borderRadius = "8px";
                DOM.result.style.fontSize = "1.2rem";
            }

            function handleSubmit() {
                if (!currentChallenge) return;

                const userCode = DOM.editor.value;
                try {
                    // Execute user code to verify the 'solution' function
                    const solveFn = new Function(`
                        ${userCode}
                        return typeof solution !== 'undefined' ? solution : null;
                    `)();

                    if (typeof solveFn !== 'function') {
                        throw new Error("No solution function found");
                    }

                    let allPassed = true;
                    for (const test of currentChallenge.tests) {
                        const result = solveFn(...test.input);
                        if (JSON.stringify(result) !== JSON.stringify(test.output)) {
                            allPassed = false;
                            break;
                        }
                    }

                    if (allPassed) {
                        score += 10;
                        DOM.score.innerText = score;
                        showResult("You Did It Champ", "success");
                        createConfetti();
                        
                        // Load next after a delay
                        setTimeout(loadRandomChallenge, 3000);
                    } else {
                        showResult("Do it one more time", "error");
                    }
                } catch (err) {
                    showResult("Do it one more time", "error");
                }
            }

            DOM.run.addEventListener('click', handleSubmit);
            DOM.next.addEventListener('click', loadRandomChallenge);
            
            loadRandomChallenge();
        });