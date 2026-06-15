# Study Session Manager

An interactive, high-fidelity study workspace and time-blocking planner. Organize your curriculum decks, set focused Pomodoro timers, play synthetically generated focus sound loops (White Noise, Pink Noise, Brown Noise) using the native browser Web Audio engine, review terms with interactive 3D flashcard flippers, and evaluate daily study analytics.

## 🚀 Features

- **Pomodoro Focus Station**: Visual digital clocks with customizable intervals (Focus, Short Break, Long Break) and reactive SVG progress dials.
- **Web Audio Noise Synthesizer**: Fully integrated sound loop engine. Synthesizes White Noise, Pink Noise, and Brown Noise locally in real-time. Completely offline, vector-based sound parameters.
- **Curriculum Decks & Tasks**: Catalog subjects (e.g. *Computer Science*, *Mathematics*) with task lists. Track task-specific estimated Pomodoro targets.
- **Interactive 3D Flashcards**: Flip cards in 3D views to review key study terms. Tracks individual card success scores.
- **Statistics KPIs**: Monitor focus minutes, daily study streaks, card reviews, and subject progress ratios.
- **Local JSON Data Backups**: Instantly back up or restore study decks, logged sessions, and configurations as JSON datasets.
- **Adaptive Modern Themes**: Beautiful light and dark themes optimized for visual appeal.

## 📂 Project Structure

```
Study Session Manager/
├── README.md         # User handbook & manuals
├── project.json      # Project metadata descriptor
├── index.html        # App semantic layouts and overlays
├── style.css         # Typography, Pomodoro station, card animation, and themes
├── script.js         # State storage, sound audio generators, and timer engines
└── thumbnail.svg     # Brand vector thumbnail
```

## 🛠️ How to Use

1. Launch `index.html` in your web browser.
2. The workspace pre-populates with seed decks (e.g. *Algorithms*, *Operating Systems*), flashcard decks, and logged histories if no previous database is found.
3. Start the **Stopwatch / Pomodoro** in the timer tab. Select your target subject and log tasks.
4. Set the **Focus Audio** selector to play background noises (White/Pink/Brown Noise).
5. Switch to **Flashcards** to review study topics. Click **Flip** to inspect answers and mark confidence scores.
6. Toggle light/dark settings or back up files in the **Settings** panel.
