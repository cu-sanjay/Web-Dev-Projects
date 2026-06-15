# Constellation · Explorer

An astronomical mapping terminal where users interactively connect star nodes to form constellation patterns. Built with zero dependencies.

---

## Constellations

| Target | Stars | Brightest | Avg Mag | Distance |
|---|---|---|---|---|
| **Orion · The Hunter** | Betelgeuse, Rigel, Bellatrix, Alnilam, Alnitak, Mintaka, Saiph | Rigel (0.1) | 0.8 | 1,344 ly |
| **Ursa Major · The Bear** | Dubhe, Merak, Phecda, Megrez, Alioth, Mizar, Alkaid | Alioth (1.8) | 1.8 | 80 ly |
| **Cassiopeia · The Queen** | Schedar, Caph, Ruchbah, Segin, Navi | Schedar (2.2) | 2.5 | 228 ly |
| **Taurus · The Bull** | Aldebaran, Elnath, Alcyone, Atlas, Electra, Merope, Taygeta | Aldebaran (0.9) | 3.0 | 148 ly |

## Interaction Model

| Action | Input | Result |
|---|---|---|
| Select star | Left-click near a node | Amber ring + glow highlight |
| Connect stars | Click first star, then second | Golden vector drawn between them |
| Deselect | Right-click anywhere | Clears active selection |
| Verify pattern | Click Verify Structural Vector Mapping | Checks connections against correct order |
| Guidance overlay | Activate Guidance Outline Overlay | Shows ghost grid + dashed hint lines |
| Flush | Flush Starmap Coordinates | Clears all connections, resets state |

## Proximity Check

$$d = \sqrt{\Delta x^2 + \Delta y^2}$$

Clicks within 16px of a star node register as a selection.

---

## File Structure

```
├── index.html         Layout — constellation ribbon, star chart canvas, coordinate log + telemetry cards
├── style.css          Dark observatory — cyan/amber/green neon states, glassmorphic panels, log lines
├── script.js          Star data for 4 constellations, Canvas twinkle engine, click-to-connect interaction, verification
├── README.md          This file
└── project.json       Project metadata
```

Open `index.html` in any browser.
