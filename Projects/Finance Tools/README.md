# Finance Tools

A personal savings goal tracker with Canvas concentric ring charts, built with vanilla HTML5, CSS3, and JavaScript (ES6+).

## Features

- **Financial State Management** — Array of goal objects: `name`, `targetSum`, `currentSaved`, `monthlyContribution`, `deadlineMonths`. Progress = `currentSaved / targetSum × 100`. On-track calculation compares required months vs deadline.
- **Canvas Ring Chart** — Up to 5 concentric `ctx.arc()` rings with color-coded strokes. Center text shows aggregated saved vs target. Redraws on every state change.
- **Top-Up with Validation** — Inline input on each goal card. Validates numeric, positive, XSS-sanitized. On invalid → card shake animation. On success → emerald border flash + smooth bar transition.
- **Telemetry** — Total saved, total target, global completion %, projected horizon in months.
- **Persistence** — `localStorage` serialization. 4 seed goals (Emergency Fund, Workstation, Downpayment, Seed Capital) auto-loaded on first boot.

## UI Theme

Quantitative trading terminal: `#05070c` backdrop, glassmorphic panels, neon cyan/emerald progress, auto-fit responsive 3-column grid.

## Usage

Open `index.html`. Add goals via the form, top up with inline inputs, delete with ×. Canvas ring and telemetry update in real time.
