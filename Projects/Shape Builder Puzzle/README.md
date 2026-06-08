# Shape Builder Puzzle

An interactive puzzle game where players draw shapes originating from numbered cells to completely fill the board.

## Rules of the Game

- **Cell Values**: Each numbered cell represents the size (area) of the shape you must draw. For example, a `4` requires a shape of area 4 (e.g., a 2×2 square, 1×4 line, or 4×1 line).
- **Origin Constraints**: Every drawn shape must contain **exactly one** numbered cell, which acts as the origin/generator of that shape.
- **Leak-Free Coverage**: Placed shapes must not overlap each other, and you must cover the board completely without leaving any empty gaps.

## Features

- **Interactive Drag-to-Draw Engine**: Drag mouse or finger diagonally from a numbered cell to draw/resize blocks.
- **Smart Validation System**: Real-time evaluation checking if the shape matches the required area, fits within boundary limits, and doesn't overlap existing shapes.
- **Preset Difficulty Configurations**: Play on 4x4, 6x6, or 8x8 boards.
- **Interactive Solver Hints**: Highlights a valid layout for a selected numbered cell to guide you when stuck.
- **State Persistence**: Keeps track of completed levels and best solve times using browser `localStorage`.
- **Completely Responsive**: Adapts fluidly across mobile, tablet, and desktop viewports.

## Technologies Used

- **HTML5**: Grid markup representation.
- **CSS3**: Layout variables, glassmorphic themes, drag overlays, and error highlights.
- **JavaScript (ES6+)**: OOP Game state manager, area solver modules, and touch/drag event handlers.

## Local Setup

Clone the repository and open `index.html` inside a web browser:
```bash
git clone https://github.com/MistryVishwa/Web-Dev-Projects.git
cd "Projects/Shape Builder Puzzle"
open index.html
```

Or serve the directory using a local HTTP server:
```bash
npx http-server
```

## Folder Structure
```
Projects/Shape Builder Puzzle/
├── index.html       # DOM skeleton
├── style.css        # Interactive style rules
├── script.js        # Drag calculator engine and solver logic
├── project.json     # Game metadata configuration
└── README.md        # Documentation
```

## Author

- **Mistry Vishwa** ([MistryVishwa](https://github.com/MistryVishwa))
