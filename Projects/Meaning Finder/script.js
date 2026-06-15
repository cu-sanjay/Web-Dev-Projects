  const ENTRIES = [
            { m: "The extreme fear of heights.", a: "acrophobia" },
            { m: "A person who loves or collects books.", a: "bibliophile" },
            { m: "The life story of a person written by that person.", a: "autobiography" },
            { m: "A place where bees are kept; a collection of beehives.", a: "apiary" },
            { m: "A word that has the same or nearly the same meaning as another.", a: "synonym" },
            { m: "The scientific study of stars, planets, and the universe.", a: "astronomy" },
            { m: "A person who travels in a spacecraft.", a: "astronaut" },
            { m: "A large, natural stream of water flowing in a channel to the sea.", a: "river" }
        ];

        let current = 0;

        function startGame() {
            document.getElementById('start-overlay').classList.add('hidden');
            loadEntry();
        }

        function loadEntry() {
            if (current >= ENTRIES.length) {
                document.getElementById('meaning-display').innerText = "Volume I Complete.";
                document.querySelector('.input-group').classList.add('hidden');
                document.querySelector('.right button').innerText = "Restart";
                document.querySelector('.right button').onclick = () => location.reload();
                return;
            }
            document.getElementById('meaning-display').innerText = `"${ENTRIES[current].m}"`;
            document.getElementById('current-entry').innerText = current + 1;
            document.getElementById('word-input').value = "";
            document.getElementById('word-input').focus();
            document.getElementById('feedback').innerText = "";
        }

        function checkAnswer() {
            const val = document.getElementById('word-input').value.trim().toLowerCase();
            const feedback = document.getElementById('feedback');
            
            if (val === ENTRIES[current].a) {
                feedback.innerText = "Correct. Proceed.";
                feedback.style.color = "var(--success)";
                current++;
                setTimeout(loadEntry, 1200);
            } else {
                feedback.innerText = "Incorrect identification.";
                feedback.style.color = "var(--error)";
                document.getElementById('word-input').select();
            }
        }