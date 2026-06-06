# Pipe Connection Puzzle

Rotate pipe pieces to connect all numbered endpoints into a complete network with no leaks.

## Features

- **Puzzle Solver Mechanics**: Rotate pipe segments (Straight, Elbow, T-Shape, Cross, Endpoints) to align path directions.
- **Dynamic Liquid/Energy Flow**: Liquid energy flows dynamically through connected pipes.
- **Predefined Level Presets**: Easy (4x4), Medium (6x6), and Hard (8x8) grids.
- **Victory Visual Overlays**: Clean win dashboard listing elapsed times and total rotation moves.
- **State Persistence**: Saves unlocked levels, best times, and move scores in `localStorage`.
- **Fully Responsive**: Adapts across phone screens, tablets, and desktops.

## Technologies Used

- **HTML5**: Semantic UI layouts and dynamic SVG elements.
- **CSS3**: Variables, glassmorphic styling, and rotation animations.
- **JavaScript (ES6+)**: OOP Game Engine state and Depth-First Search (DFS) path solvers.

## Installation & Setup

Simply clone the repository and open `index.html` inside a web browser:
```bash
# Clone repository
git clone https://github.com/MistryVishwa/Web-Dev-Projects.git

# Navigate to project and run
cd "Projects/Pipe Connection Puzzle"
open index.html
```

Or run a local HTTP server:
```bash
npx http-server
```

## Project Structure
```
Projects/Pipe Connection Puzzle/
├── index.html       # Markup Structure
├── style.css        # Visual styles
├── script.js        # Game mechanics and solver engine
├── project.json     # Configuration file
└── README.md        # Documentation
```

## Author

- **Mistry Vishwa** ([MistryVishwa](https://github.com/MistryVishwa))
