const DATA = [
            { t: ["Honey never spoils; edible honey was found in 3,000-year-old tombs.", "A bolt of lightning is five times hotter than the surface of the sun.", "Wombat poop is cube-shaped to prevent it from rolling away."], f: "Humans share 50% of their DNA with bananas, but 90% with strawberries." },
            { t: ["The Eiffel Tower can grow over 6 inches taller during the summer.", "Octopuses have three hearts and blue blood.", "Bananas are berries, but strawberries are not."], f: "The Great Wall of China is the only man-made structure visible from the Moon." },
            { t: ["A day on Venus is longer than a year on Venus.", "Sharks have been on Earth longer than trees have.", "Cowboys didn't actually wear cowboy hats until the late 1800s."], f: "Goldfish have a three-second memory span." },
            { t: ["Sloths can hold their breath longer than dolphins can.", "It rains diamonds on Saturn and Jupiter.", "There are more trees on Earth than stars in the Milky Way."], f: "Napoleon Bonaparte was extremely short, standing at only 5 feet tall." },
            { t: ["An individual blood cell takes about 60 seconds to make a complete circuit of the body.", "Venus is the hottest planet in our solar system, not Mercury.", "Russia has more surface area than Pluto."], f: "Bulls become enraged specifically by the color red." }
        ];

        let state = { score: 0, round: 0, currentFacts: [] };

        function startGame() {
            state.score = 0;
            state.round = 0;
            document.getElementById('game-overlay').classList.add('hidden');
            nextRound();
        }

        function nextRound() {
            if (state.round >= 5) return endGame();
            
            document.getElementById('round-val').innerText = state.round + 1;
            document.getElementById('score-val').innerText = state.score;
            
            const set = DATA[state.round];
            const facts = [...set.t.map(text => ({ text, isFake: false })), { text: set.f, isFake: true }];
            state.currentFacts = facts.sort(() => Math.random() - 0.5);

            const container = document.getElementById('fact-container');
            container.innerHTML = '';
            
            state.currentFacts.forEach((fact, i) => {
                const btn = document.createElement('button');
                btn.className = 'fact-btn';
                btn.innerText = fact.text;
                btn.onclick = () => check(fact.isFake, btn);
                container.appendChild(btn);
            });
        }

        function check(isFake, btn) {
            const btns = document.querySelectorAll('.fact-btn');
            btns.forEach(b => b.disabled = true);

            if (isFake) {
                btn.classList.add('correct');
                state.score += 100;
            } else {
                btn.classList.add('wrong');
                // Highlight the actual fake one
                Array.from(btns).find((_, i) => state.currentFacts[i].isFake).classList.add('correct');
            }

            setTimeout(() => {
                state.round++;
                nextRound();
            }, 2000);
        }

        function endGame() {
            const overlay = document.getElementById('game-overlay');
            overlay.classList.remove('hidden');
            overlay.querySelector('h1').innerText = "Mission Complete";
            overlay.querySelector('p').innerText = `You exposed the lies with a score of ${state.score}!`;
            overlay.querySelector('button').innerText = "Play Again";
        }