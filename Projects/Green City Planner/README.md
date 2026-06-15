# Green City · Planner

A municipal zoning simulation terminal for designing sustainable urban environments on a 10×10 grid. Built with zero dependencies.

---

## Structural Zoning Palette

| Structure | Icon | Green Cover | AQI Effect | Energy | Population |
|---|---|---|---|---|---|
| **Eco-Park** | 🌿 | +8% | −15 | 0 | 0 |
| **Urban Trees** | 🌳 | +5% | −8 | 0 | 0 |
| **Smart Housing** | 🏘️ | +2% | +5 | +5 MW | +150 |
| **Multi-Lane Road** | 🛣️ | −2% | +12 | 0 | 0 |
| **Industrial Factory** | 🏭 | −5% | +30 | 0 | +500 |

## Core Formula

$$AQI = 50 + \sum E_i - \sum S_i$$

Where $E_i$ = pollution emitters (factory, road, housing) and $S_i$ = pollution sinks (parks, trees).

## Rating Tiers

| AQI Range | Grade | Color |
|---|---|---|
| 0–50 | S-TIER — Eco Utopia | Green |
| 51–80 | A-TIER — Sustainable | Cyan |
| 81–120 | B-TIER — Moderate | Yellow |
| 121–180 | C-TIER — Stressed | Orange |
| 180+ | D-TIER — Critical | Crimson |

## Controls

| Action | Button / Input | Description |
|---|---|---|
| Select tool | Click palette item | Then click grid cell to place |
| Clear cell | Click without tool / Right-click | Removes structure |
| Deselect | ✕ Clear selected | Clears active tool |
| Rate city | Calculate Strategic City Rating | Shows toast with grade |
| Blueprint | Pre-Build Industrial Metropolis | Loads preset layout |
| Purge | Purge Municipal Matrix | Clears all + resets |

---

## File Structure

```
├── index.html         Layout — toolbox, 10×10 canvas grid, telemetry panel, action bar
├── style.css          Dark terminal — green/cyan/yellow/orange/crimson structure states, blinking alert
├── script.js          Grid model, AQI engine, Canvas rendering with particle effects, localStorage
├── README.md          This file
└── project.json       Project metadata
```

Open `index.html` in any browser. Grid auto-saves to `localStorage`.
