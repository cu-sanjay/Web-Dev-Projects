# Dice Roller Simulator

A premium, interactive web application to simulate rolling single or multiple dice in full 3D. Features high-fidelity CSS 3D physics animations, dynamic Web Audio sound synthesis, multiple RPG polyhedral dice (D4, D6, D8, D10, D12, D20), dynamic roll history statistics, and premium design styles.

## Project Overview
This project brings a highly polished polyhedral dice rolling dashboard directly to the browser. Designed for board game enthusiasts and RPG players, it utilizes 3D matrix rotations for six-sided dice (D6) and custom SVG tumbling vectors for other formats. Roll statistics are updated in real time, showing probability distributions, roll summaries, and individual counts.

## Features
- **Preserve-3D Physics Cube**: Standard D6 dice are modeled as full 3D HTML cubes that roll realistically on a felt-lined background board.
- **Polyhedral RPG Dice Support**: Supports D4 (tetrahedron), D6 (cube), D8 (octahedron), D10 (pentagonal trapezohedron), D12 (dodecahedron), and D20 (icosahedron) shapes.
- **Synthesized Web Audio Effects**: Synthesizes rolling and collision sounds on the fly using the Web Audio API, eliminating the need to load heavy audio file assets.
- **Multi-Dice Selector**: Roll between 1 and 6 dice simultaneously in the tray.
- **Interactive Tray Settings**: Adjust rolling force/strength, toggle sound effects, and simulate shaking using a dedicated controls bar.
- **Detailed Analytics Dashboard**: Displays the rolling sum, average roll calculation, total history log, and a real-time probability frequency bar chart.
- **Premium Design Themes**: Obsidian Dark, Gold Trim, Glassmorphism, Neon Glow, and Ruby Red themes, instantly customisable.

## Tech Stack
- **Structure**: Semantic HTML5 markup
- **Styling**: Modern CSS3 (Preserve-3D matrices, keyframe animations, glassmorphism filters, theme selectors)
- **Scripting**: Vanilla ES6 JavaScript (DOM manipulation, audio synthesis nodes, mathematical rotation calculations)

## Installation Guide & Local Setup
No external compilation, build steps, or package managers are required to run this project. Follow these setup steps:

### Direct File System Execution (Quick Launch)
1. Clone the repository:
   ```bash
   git clone https://github.com/MistryVishwa/Web-Dev-Projects.git
   ```
2. Navigate to the simulator project folder:
   ```bash
   cd "Web-Dev-Projects/Projects/Dice Roller Simulator"
   ```
3. Double-click the `index.html` file to open it instantly in any modern web browser (e.g. Chrome, Firefox, Edge, Safari).

### Local Static Server Hosting
For serving over HTTP:
- **Python (v3+)**:
  ```bash
  python -m http.server 8000
  ```
- **NodeJS (`serve` helper)**:
  ```bash
  npx serve -l 8000
  ```
Open `http://localhost:8000` inside your browser window.

## Usage Guide
1. Select the **Dice Type** (D4 to D20) from the layout configurations header.
2. Select the **Quantity** (1 to 6) of dice to add to the tray.
3. Choose a styling theme preset (e.g. *Obsidian*, *Gold Trim*, *Neon Glow*) and ensure the *Sound Effects* check is enabled.
4. Click the **Roll Dice** button, press the **Spacebar**, or click inside the felt tray to trigger the roll.
5. Check the **Analytics Panel** to read the total sum, historical average results, and number frequency bars.

## Folder Structure
```
Dice Roller Simulator/
├── index.html       # Entry point layout
├── style.css        # Preserve-3D cubes, felt borders, themes sheets
├── script.js        # Matrix rotations, sound synthesis engine, stats
├── project.json     # Repo catalog indexing schema
├── thumbnail.svg    # Project graphic icon
└── README.md        # Documentation guide
```

## Screenshots Section
*(Add visual mockups or rolling screenshots here)*

## Future Enhancements
- Interactive 3D Canvas rendering (using WebGL / ThreeJS).
- Dynamic customizable custom dice skins (images/numbers).
- Multiplayer online room roll synchronization.

## Contribution Guidelines
- Implement changes strictly under `Projects/Dice Roller Simulator/`.
- Adhere to the code quality rules, specifically the `2 spaces` code indentation standards.
- Test in both dark/light and custom theme environments before committing.

## License Information
This project is licensed under the MIT License. See the main repository `LICENSE` file for details.
