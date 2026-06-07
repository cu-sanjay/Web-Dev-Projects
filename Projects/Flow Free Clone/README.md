# Flow Free Clone

An interactive puzzle game where players connect matching colors with pipe lines to create a continuous flow.

## Game Rules

- **Connect Dots**: Connect matching colored dots on the grid to create flow paths.
- **No Path Crossings**: Paths cannot cross or overlap each other. If a new color path crosses an existing connection, the older path breaks and clears.
- **100% Board Fill**: To win, all colored dot pairs must be connected, and **every single cell** on the grid must be occupied.

## Features

- **Fluid Mouse & Touch Controls**: Seamless drag-to-draw path lines designed for desktops and smartphones.
- **Dynamic Color Lines Overlay**: Responsive SVG path overlay renders crisp, anti-aliased colored connections between cells.
- **Automatic Path Collision System**: Overlapping or crossing another color's line automatically breaks and clears it.
- **Progress Tracking Metrics**: Real-time stats rendering Flow Connection Count, Board Coverage Percentage, and solve times.
- **Difficulties/Grid Options**: Custom grid dimensions (5x5, 6x6, 7x7).
- **Personal Best Records**: Saves unlocked levels and best solve times in browser `localStorage`.
- **Glassmorphic UI**: High-fidelity dark neon themes and victory modal dashboard overlays.

## Installation

Clone the repository and open `index.html` inside a web browser:
```bash
git clone https://github.com/MistryVishwa/Web-Dev-Projects.git
cd "Projects/Flow Free Clone"
open index.html
```

Or run a local HTTP server:
```bash
npx http-server
```

## Folder Structure
```
Projects/Flow Free Clone/
├── index.html       # DOM skeleton
├── style.css        # Interactive style rules
├── script.js        # Drag coordinates tracker and path validations
├── project.json     # Game metadata configuration
└── README.md        # Documentation
```

## Author

- **Mistry Vishwa** ([MistryVishwa](https://github.com/MistryVishwa))
