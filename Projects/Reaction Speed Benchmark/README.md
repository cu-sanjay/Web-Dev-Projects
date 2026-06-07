# Reaction Speed Benchmark

A millisecond-accurate reaction time measurement tool built with vanilla JavaScript.

## Features

- 5-state machine: Idle → Waiting → Triggered → Penalty → Results.
- `performance.now()` high-resolution timing for millisecond-precise readings.
- Random delay window (2000–5000ms) before green signal.
- Anti-cheat false-start detection: clicking before the signal triggers a penalty screen.
- Historical attempt log with scrollable feed.
- Persistent best record via `localStorage` with animated "BEST" badge.
- Responsive design with a large tap target for mobile.

## Run it

Open `index.html` in any modern browser.
