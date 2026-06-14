const STARTERS = [
        "A tiny clockwork dragon sat on the library shelf, waiting for its owner.",
        "The moon turned a bright shade of teal, and suddenly everyone could hear each other's thoughts.",
        "In a city where it only rained neon light, a detective found a real umbrella."
    ];

    const BOT_RESPONSES = [
        "Suddenly, a strange whistling sound echoed from the distance.",
        "A shimmering portal flickered into existence right before their eyes.",
        "Without warning, the gravity in the room shifted, sending books flying.",
        "A cat wearing a top hat stepped out from the shadows and winked.",
        "The air grew cold, and the smell of jasmine filled the hallway."
    ];

    const ENDINGS = {
        happy: "And so, with a smile, they realized that the greatest adventure was only just beginning.",
        mystery: "But as the dust settled, the mysterious key was gone, leaving only a faint trail of stardust.",
        drama: "The choice was made, and the world would never be the same again, for better or for worse."
    };

    let currentStory = [];
    let savedStories = JSON.parse(localStorage.getItem('weaver_stories')) || [];

    function init() {
        const starter = STARTERS[Math.floor(Math.random() * STARTERS.length)];
        currentStory = [{ text: starter, type: 'bot' }];
        renderStory();
        renderHistory();
    }

    function renderStory() {
        const box = document.getElementById('storyBox');
        box.innerHTML = currentStory.map(s => 
            `<span class="sentence-${s.type}">${s.text} </span>`
        ).join('');
        box.scrollTop = box.scrollHeight;
    }

    function submitSentence() {
        const input = document.getElementById('userInput');
        const text = input.value.trim();
        if (!text) return;

        currentStory.push({ text: text, type: 'user' });
        input.value = '';
        renderStory();

        // Bot turn
        document.getElementById('bot-status').classList.remove('hidden');
        setTimeout(() => {
            const response = BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)];
            currentStory.push({ text: response, type: 'bot' });
            document.getElementById('bot-status').classList.add('hidden');
            renderStory();
        }, 1500);
    }

    function showEndingChoices() {
        document.getElementById('input-area').classList.add('hidden');
        document.getElementById('ending-area').classList.remove('hidden');
    }

    function wrapUp(style) {
        currentStory.push({ text: ENDINGS[style], type: 'bot' });
        renderStory();

        // Save logic
        const fullText = currentStory.map(s => s.text).join(' ');
        const storyObj = {
            id: Date.now(),
            content: fullText,
            date: new Date().toLocaleDateString()
        };
        
        savedStories.unshift(storyObj);
        localStorage.setItem('weaver_stories', JSON.stringify(savedStories));
        
        renderHistory();
        
        // Reset UI after a delay
        setTimeout(() => {
            alert("Story Saved to your collection! ✨");
            document.getElementById('input-area').classList.remove('hidden');
            document.getElementById('ending-area').classList.add('hidden');
            init();
        }, 1000);
    }

    function renderHistory() {
        const list = document.getElementById('savedStories');
        if (savedStories.length === 0) {
            list.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No stories yet. Start writing!</p>';
            return;
        }
        
        list.innerHTML = savedStories.map(s => `
            <div class="history-item">
                <div style="font-size: 0.8rem; color: var(--primary); font-weight: 700;">${s.date}</div>
                <div style="font-size: 0.9rem; margin-top: 5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${s.content}
                </div>
            </div>
        `).join('');
    }

    init();