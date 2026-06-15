# Eco Habit Tracker

A green lifestyle command terminal for logging daily eco-actions with Canvas concentric radial progress rings, localStorage-persisted habit streaks, quantitative ecological scoring, and behavioral integrity tier badges.

---

## Features

### Habit Categories
4 eco-actions with tracked impact metrics:

| Habit | Eco Points | Plastic Diverted | Water Preserved | CO₂ Skipped |
|---|---|---|---|---|
| Waste Recycling | +15 | 0.5 kg | — | — |
| Water Conservation | +10 | — | 40 L | — |
| Carbon Mitigation | +25 | — | — | 1.2 kg |
| Reusable Containers | +12 | 0.3 kg | — | 0.1 kg |

### Canvas Radial Rings
- Three concentric neon arcs per habit category
- Smooth 60fps completion animation
- "ALL HABITS COMPLETE" glow at center when all daily tasks done

### Checklist Table
- Toggle switches for each habit
- Completed items show strikethrough with dimmed opacity
- Remove completion by re-clicking

### Streak Engine
- Consecutive-day tracking via localStorage
- Color-coded: cyan (<3), amber (3-6), emerald (7+)
- 7-day streak simulation button for testing

### Telemetry
- Eco streak (consecutive days)
- Net plastic diverted (kg)
- Net water preserved (L)
- CO₂ skipped (kg)
- Global ecological point yield
- Integrity tier: BEGINNER → INTERMEDIATE → ADVANCED → MASTER

## Controls

| Action | Function |
|---|---|
| Quick-Log Buttons | Instantly log a habit for today |
| Checklist Toggles | Toggle individual habit completion |
| Execute Systemic Recalculation | Refresh all metrics and rings |
| Simulate 7-Day Streak | Fill 7 consecutive days with all habits |
| Purge Operational History | Clear localStorage and reset all data |

---

## File Structure

```
├── index.html        Layout — quick-log ribbon, checklist, Canvas rings, telemetry, admin footer
├── style.css         Dark terminal — glassmorphic panels, neon emerald/cyan/amber/pink states
├── script.js         Engine — habit database, scoring, Canvas radial arcs, localStorage persistence, streak engine
├── README.md         This file
└── project.json      Project metadata
```

Open `index.html` in any browser.
