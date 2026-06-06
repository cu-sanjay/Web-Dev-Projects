# Minesweeper Lite

A modern responsive Minesweeper game built from scratch using Vanilla HTML, CSS, and Object-Oriented JavaScript.

## Features

- **First-Click Safety Guarantee**: Re-arranges mine arrays dynamically to ensure your first click is always a 0-neighbor safe cell.
- **Recursive Area Auto-Reveal**: Recursively clears blank tiles and boundary numbers.
- **Mobile Mode Helper**: Allows touch screen devices to toggle input flags ("Reveal" vs "Flag") seamlessly.
- **Three Classic Difficulties**:
  - Beginner (9x9, 10 Mines)
  - Intermediate (16x16, 40 Mines)
  - Expert (20x20, 80 Mines)
- **Glassmorphic Aesthetic UI**: Clean glow-in-dark presets, custom emoji face buttons, and retro-themed scoreboard fonts.
- **Personal Best Records**: Saves your fastest solve times in browser `localStorage`.
- **Responsive Sizing**: Adapts dynamically across phone screens, tablets, and desktops.

## Installation

Clone the repository and open `index.html` inside a web browser:
```bash
git clone https://github.com/MistryVishwa/Web-Dev-Projects.git
cd "Projects/Minesweeper Lite"
open index.html
```

Or run a local HTTP server:
```bash
npx http-server
```

## Folder Structure
```
Projects/Minesweeper Lite/
├── index.html       # DOM layout
├── style.css        # Interactive visual styles
├── script.js        # Minesweeper game mechanics and solver logic
├── project.json     # Game metadata configuration
└── README.md        # Documentation
```

## Author

- **Mistry Vishwa** ([MistryVishwa](https://github.com/MistryVishwa))
