# Periodic Table · Interactive

An 18-column IUPAC-periodic-table command center featuring 118-element data dictionary, family-filter highlighting, real-time search, and an atomic inspector card with electron shell configuration. Built with zero dependencies.

---

## Features

### Grid
- Full 118-element periodic table built with CSS Grid using explicit `grid-column`/`grid-row` positioning
- 10 family-driven neon color themes per element category
- Hover reveals atomic data in the inspector panel; click locks selection

### Filters

| Filter | Family | Color |
|---|---|---|
| Alkali Metals | Group 1 | Orange |
| Alkaline Earth | Group 2 | Yellow |
| Transition Metals | Groups 3–12 | Cyan |
| Post-Transition | Groups 13–16 | Teal |
| Metalloids | — | Amber |
| Nonmetals | — | Pink |
| Halogens | Group 17 | Yellow |
| Noble Gases | Group 18 | Emerald |
| Lanthanides | Row 6 | Violet |
| Actinides | Row 7 | Crimson |

### Inspector
- Atomic Number, Symbol, Full Name, Atomic Mass, Electronegativity
- Family, Period, Group coordinates
- Educational fun fact per element
- Electron shell configuration (button generates `1s²2s²...` notation)

### Search
- Real‑time name/symbol/number search with dimming of non‑matches
- Exact match triggers a pulsing glow animation

---

## File Structure

```
├── index.html         Layout — filter ribbon, 18‑column grid panel, inspector card, action footer
├── style.css          Dark lab — glassmorphic cells, 10 family neon themes, grid‑positioned cells
├── script.js          Full engine — 118‑element dictionary, grid builder, search, family filter
├── README.md          This file
└── project.json       Project metadata
```

Open `index.html` in any browser.
