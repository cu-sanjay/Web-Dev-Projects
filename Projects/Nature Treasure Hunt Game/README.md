# Nature Treasure Hunt Game

An interactive educational adventure where you explore ecosystems across the globe, solve clue-based puzzles, discover hidden treasures, and learn fascinating facts about nature and wildlife.

## Features

- **Interactive World Map** — 18 unique ecosystems to explore (Amazon, Sahara, Himalayas, Great Barrier Reef, and more)
- **Clue-Based Treasure Hunting** — Solve nature-themed riddles to find hidden treasures
- **Nature Challenges** — Quiz-based challenges that test your knowledge of ecosystems, species, and conservation
- **Progression System** — Earn XP, level up, and unlock achievements as you explore
- **15 Achievements** — From "First Discovery" to "Legendary Adventurer" and "Nature's Champion"
- **Educational Content** — 40+ treasures with real science facts and 28 quiz questions
- **Persistent Progress** — All game state saved via localStorage
- **Keyboard Shortcuts** — `Q` for quick quiz, `I` for zone info, `Escape` to close modals
- **Accessible** — ARIA labels, keyboard navigation, high contrast support, reduced motion

## How to Play

1. Open `index.html` in any modern web browser
2. Click on a highlighted zone on the world map
3. Read the clue for a hidden treasure
4. Click on treasure markers (golden dots) to attempt solving clues
5. Type your answer and earn XP for correct answers
6. Press `Q` to take nature challenges for extra XP
7. Explore all 18 zones and find all 40 treasures!

## Scoring

- **Treasure found**: +80–180 XP (varies by difficulty)
- **Partial credit** (3 attempts used): +30% of treasure XP
- **Quiz correct**: +80 XP
- **Quiz attempt**: +20 XP
- **Zone explored**: Difficulty × 20 XP

## Project Structure

```
Projects/Nature Treasure Hunt Game/
├── index.html       — Main HTML with two-panel layout
├── style.css        — Adventure-themed design system
├── script.js        — Game engine, data, and state management
├── thumbnail.svg    — Preview thumbnail
├── README.md        — This file
└── project.json     — Project metadata
```

## Technical Details

- Zero external dependencies — pure HTML, CSS, and JavaScript
- SVG-based interactive world map with 18 polygon zones
- 40 treasures with unique clues, answers, and educational facts
- 28 quiz questions with multiple choice and knowledge explanations
- 15 achievements with popup notifications
- All data embedded in script.js — no external files or APIs

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge).

## Author

- **Girish Madarkar** / Girish0902
