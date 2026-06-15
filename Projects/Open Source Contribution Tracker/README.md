# Open Source Contribution Tracker 🚀

An interactive, premium client-side dashboard workspace designed to track, analyze, and gamify your open source contributions. Log your pull requests, issues, commits, and code reviews, view your progress via a GitHub-style activity heatmap, and unlock badges as you earn developer XP.

## 🚀 Key Features

*   **GitHub-Style Activity Heatmap**: Interactive, grid-based contribution heatmap visualizes contribution intensity over the course of the past year. Hovering over blocks reveals date-specific activity counts.
*   **Gamified Dev Progress (XP & Leveling)**:
    *   Earn XP for every contribution logged based on type and status (e.g., Merged PRs award maximum XP).
    *   Level up dynamically as your total XP crosses leveling thresholds.
    *   Unlock achievement badges for contribution milestones (e.g., first PR merged, bug-hunting streaks).
*   **Analytics Telemetry & Charts**:
    *   **Contribution Type Distribution**: View proportional splits of PRs, Issues, Commits, Reviews, and Docs using custom Canvas charts.
    *   **Monthly Activity Tracker**: Graph contribution volume over time.
    *   **Repository leaderboard**: View contribution counts grouped by project repositories.
*   **Flexible Contribution Logging**:
    *   Manage contributions with a comprehensive form: Repository Name, Type (Pull Request, Issue, Commit, Code Review, Documentation), Title, Status (Open, In Progress, Merged, Closed), Wavelength/Difficulty (Easy/Good First Issue, Medium, Hard), Link, and Learnings.
    *   Detailed search, status filtering, and multi-criteria sorting.
*   **Data Portability & Offline Persistence**:
    *   Local storage integration preserves all metrics.
    *   Single-click JSON exports and imports allow seamless backup transfer.
    *   Pre-populated mock contributions let you see the dashboard in action immediately upon first launch.
*   **Glassmorphic Theme Engine**: Smooth toggle between Light and Dark mode using modern, high-contrast HSL color palettes and CSS transitions.

## ⌨️ Keyboard Shortcuts

*   `Alt + N`: Open New Contribution modal form
*   `Alt + T`: Toggle Light / Dark theme mode
*   `Alt + E`: Export local storage database to JSON
*   `Alt + I`: Open JSON database import dialog
*   `Alt + R`: Populate sandbox with sample seed contributions

## 🛠️ Technology Stack

*   **Structure**: Semantic HTML5 markup
*   **Styling**: Vanilla CSS3 (Custom properties, HSL color tokens, Flexbox/Grid layouts, custom scrollbars)
*   **Scripting**: Vanilla JS (ES6 modules, Canvas API, Web Storage APIs, Custom modal controls)

## 📦 File Structure

```
Open Source Contribution Tracker/
├── index.html       # Main UI grid, modal sheets, and templates
├── style.css        # Theme engine, glassmorphic layout tokens, responsive grids
├── script.js        # Heatmap engine, XP calculators, chart rendering, database manager
├── project.json     # Project meta-attributes
├── thumbnail.svg    # Dashboard thumbnail illustration
└── README.md        # Operations manual
```

## 🚀 How to Run

1. Navigate to the folder `Projects/Open Source Contribution Tracker/`.
2. Open `index.html` in your web browser.
