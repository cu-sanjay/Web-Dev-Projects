# Pomo Timer

A delta-time-based Pomodoro timer built with HTML5, CSS3, and vanilla JavaScript.

## Features

- Tri-state phases: Focus (25m), Short Break (5m), Long Break (15m).
- Delta-time countdown engine using `Date.now() + remaining` — immune to background tab throttling.
- SVG progress ring with phase-colored stroke (amber focus, teal short, purple long).
- Customizable durations per phase via settings drawer.
- Session ledger: total focus blocks, total minutes, daily count.
- Automatic phase sequencing: Focus → Short Break → Focus → Long Break cycle.
- Completion modal on each phase end.
- All data persisted via `localStorage`.

## Run it

Open `index.html` in any modern browser.
