# Daily Hydration · Dashboard

A biometric hydration tracking terminal featuring a Canvas fluid-sloshing bottle visualizer, micro-bubble particle system, weekly completion ledger, and persistent local storage. Built with zero dependencies.

---

## Biometric Engine

$$Target = Weight \times 35 + (Exercise\,Mins / 30) \times 350$$

The form dynamically scales the bottle capacity and progress metrics based on body mass and daily exercise duration.

## Controls

| Action | Button | Description |
|---|---|---|
| Calculate Target | Calculate Target | Computes daily mL target from weight + exercise |
| Log 250mL | Log 250mL Glass | Adds a standard glass portion |
| Log 500mL | Log 500mL Flask | Adds a flask portion |
| Log 750mL | Log 750mL Sport Bottle | Adds a sports bottle portion |
| Custom Log | Log Custom Volume | Adds user-defined mL from the custom field |
| Reminders | Toggle Smart Hydro Reminders | Enables/disables notification state |
| Purge | Purge Logging History | Clears all data, resets vessel to zero |

## Canvas Features

- **Sinusoidal wave surface**: $\sin(x \cdot freq + time) \cdot amplitude$ drives the water surface animation
- **Micro-bubble particle system**: Rising translucent bubbles spawned on each log event
- **Celebration glow**: Emerald neon pulse when target is reached
- **Dual-frequency wave composition**: Primary + harmonic wave for natural fluid motion

## Storage

All intake history, weekly completion, and target data persist in `localStorage`. The weekly tracker auto-rolls per calendar day.

---

## File Structure

```
├── index.html         Layout — config bar, canvas bottle, quick-log chips, action footer
├── style.css          Dark terminal — glassmorphic panels, neon cyan/emerald/amber states
├── script.js          Full simulation — formula engine, Canvas wave + bubble loop, localStorage
├── README.md          This file
└── project.json       Project metadata
```

Open `index.html` in any browser.
