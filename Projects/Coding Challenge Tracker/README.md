# Coding Challenge Tracker 🚀

An interactive, modern, and client-side **Coding Challenge Tracker** dashboard workspace. It is designed to help developers record solved coding challenges, monitor coding streaks, track daily progress, set learning goals, and visualize coding statistics.

Features dynamic analytics plots, keyboard navigation shortcuts, achievement badging cards, and complete local data persistence.

## 🚀 Key Features

*   **Gamified Dashboard Metrics**:
    *   Streak counters: Visualizes current consecutive days and longest streak records.
    *   Daily coding goal trackers: Monitors daily target problem completions using progress meters.
    *   Milestone Achievements: Unlocks progress rewards and badges (e.g. "Solved 10 Hard Problems", "30-Day Consistency").
*   **Platform & Challenge Logs**:
    *   Add, edit, or delete solved problems.
    *   Record details: problem titles, platforms (LeetCode, HackerRank, Codeforces, CodeChef, GeeksforGeeks, Custom), difficulty (Easy, Medium, Hard), study topic, and date completed.
*   **Stats Visualizations**:
    *   Platform-wise distribution charts.
    *   Weekly coding volume activity bar graphs.
    *   Difficulty ratio indicators.
*   **Search & Filtering Registry**:
    *   Search by challenge title.
    *   Filter logs dynamically by difficulty, platform, and topic category.
    *   Sort listings by completion date or problem title.
*   **Theme Engine**: Toggles between a clean light layout and a neon glassmorphic dark theme.
*   **Data Portability**: Allows full database backups (exporting to JSON and importing saved backups). Offline availability utilizing `localStorage`.

## ⌨️ Keyboard Shortcuts

*   `Alt + N`: Log a new completed challenge
*   `Alt + G`: Edit daily goal target
*   `Alt + T`: Toggle Light / Dark Theme
*   `Alt + E`: Export JSON database backup
*   `Alt + I`: Trigger import database dialog

## 🛠️ Technology Stack

*   **Structure**: Semantic HTML5 markup
*   **Styling**: Vanilla CSS3 (HSL color tokens, CSS grid/flex, glassmorphic cards, transition timelines)
*   **Scripting**: Vanilla JS (ES6 state operations, HTML5 Canvas API, local storage interfaces)

## 📦 File Structure

```
Coding Challenge Tracker/
├── index.html       # Dashboard cards, forms, and logs workspace
├── style.css        # Glassmorphic dashboard visuals & light/dark theme rules
├── script.js        # Streak math, log CRUD, Canvas charts, and modal logic
├── project.json     # Project configuration file
├── thumbnail.svg    # Dashboard vector graphic mockup
└── README.md        # User documentation
```

## 🚀 How to Run

1. Locate the folder `Projects/Coding Challenge Tracker/`.
2. Double-click `index.html` to launch the dashboard inside your web browser.
