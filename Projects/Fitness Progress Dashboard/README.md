# Fitness Progress Dashboard

A premium, interactive personal analytics dashboard designed to help users log, track, and visualize workouts, weight progress, calorie metrics, and daily hydration goals. Powered by client-side static web standards with clean, animated data charts.

## Project Overview
This project provides a modern fitness command center. By utilizing a high-contrast dark visual design featuring pitch-black layouts, charcoal cards, and energetic emerald green accents, the dashboard visualizes workout stats, tracks calories burned vs consumed, charts weight changes over time, and manages daily active targets entirely inside the local browser context.

## Features
- **Daily Goal Rings**: Radial active rings displaying progress on active minutes, active calories, and water consumption targets.
- **Interactive Hydration Tracker**: Log daily cups of water with simple click-to-increment or decrement buttons.
- **Dynamic Charting Panel**: Switch between different charts powered by Chart.js:
  - *Workout Duration Trends*: Weekly column logs showing active workout minutes.
  - *Calorie Balance Indicator*: Side-by-side comparisons of calories consumed (Intake) vs calories burned.
  - *Weight Tracking Log*: Smooth line chart illustrating weight updates over time.
- **Workout Log Recorder**: Interactive logs where users enter workout type, duration, and calories burned to build a chronological timeline history.
- **Calorie Intake Logger**: Log food meals to count daily caloric intake.
- **Weight Recorder**: Log periodic weights to map trend progress automatically.
- **LocalStorage State Preservation**: Saves and restores all logged activities, weights, food entries, and hydration metrics across user browser sessions.
- **Responsive Layout**: Fluid flex/grid structures optimized to display beautifully on phone, tablet, and widescreen viewports.

## Technology Stack
- **HTML5**: Semantic elements and layouts.
- **CSS3**: Variable-based color schemes (Charcoal/Emerald Green), Preserve-3d elements, keyframes, layout grids, and media queries.
- **JavaScript (ES6)**: Core client-side calculations, event management, and storage handlers.
- **External Library**: [Chart.js (v4.4+)](https://cdn.jsdelivr.net/npm/chart.js) imported via CDN for dynamic visual chart configurations.

## Installation Steps & Local Setup
No build frameworks, compilers, or server dependencies are required. To run the dashboard locally:

### Direct Launch
1. Clone your fork of the repository:
   ```bash
   git clone https://github.com/MistryVishwa/Web-Dev-Projects.git
   ```
2. Navigate to the project directory:
   ```bash
   cd "Web-Dev-Projects/Projects/Fitness Progress Dashboard"
   ```
3. Open `index.html` directly in any web browser by double-clicking it.

### Host with local web server
To launch it via a static port:
- **Python (v3+)**:
  ```bash
  python -m http.server 8000
  ```
- **NodeJS (`serve` utility)**:
  ```bash
  npx serve -l 8000
  ```
Then visit `http://localhost:8000` in your web browser.

## Folder Structure
```
Fitness Progress Dashboard/
├── index.html       # Visual dashboard layout
├── style.css        # Emerald Green and Charcoal style properties
├── script.js        # Chart.js configs, math calculations, local caching
├── project.json     # Catalog listing metadata
├── thumbnail.svg    # Visual project graphic
└── README.md        # Documentation guide
```

## Usage Instructions
1. View your **Daily Goals** rings on load to see active minutes, calories burned, and water cups relative to daily targets.
2. Log physical workouts inside the **Log Workout** form (select type, write duration, and estimated calories).
3. Log daily food meals in the **Log Calorie Intake** panel.
4. Record your weight inside the **Update Weight** form.
5. Tap on the **Charts navigation tabs** (*Workouts*, *Calories*, *Weight*) to switch the active visual chart display.
6. Refresh the page to confirm that all activities, statistics, and graphs reload correctly.

## Screenshots Section
*(Add screenshots of the dark theme dashboard layouts here)*

## Future Enhancements
- Integration of custom user profile goals (custom calorie/water goals).
- Sleep quality tracking analytics and graphs.
- Export summaries to CSV/JSON files.

## Author Details
- **Name**: Vishwa Mistry
- **GitHub**: [MistryVishwa](https://github.com/MistryVishwa)

## License Information
This project is licensed under the MIT License. See the main repository `LICENSE` file for details.
