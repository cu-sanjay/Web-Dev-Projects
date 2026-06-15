# Smart Compost · Planner

A biochemical conversion terminal for optimizing compost recipes. Built with vanilla HTML, CSS, and JavaScript — zero dependencies.

---

## Material Dictionary

| Material | Type | C:N Ratio | Carbon | Nitrogen |
|---|---|---|---|---|
| Fruit / Veg Scraps | Green | 15:1 | 15 | 1 |
| Coffee Grounds | Green | 20:1 | 20 | 1 |
| Dry Leaves | Brown | 60:1 | 60 | 1 |
| Cardboard Shavings | Brown | 350:1 | 350 | 1 |
| Spent Straw | Brown | 80:1 | 80 | 1 |

## Core Calculation

$$C:N_{\text{mixture}} = \frac{\sum C_i}{\sum N_i}$$

| Range | Status | Indicator |
|---|---|---|
| **25:1 – 30:1** | Optimal Aerobic Metabolism | Emerald |
| **< 25:1** | Putrefaction Risk (excess N) | Crimson |
| **> 30:1** | Carbon Lockout (stalled) | Amber |

## Controls

| Action | Button | Description |
|---|---|---|
| Add material | + Add to Recipe | Appends row with mass field |
| Optimal preset | Inject Optimal Baseline Preset | Loads balanced recipe |
| Purge | Purge Material Matrix Ledger | Clears all rows |
| Roadmap | Generate Composting Roadmap | Shows timed toast summary |
| Remove row | ✕ button per row | Deletes single entry |

---

## File Structure

```
├── index.html         Semantic layout — ingestion deck, recipe table, canvas, dash cards
├── style.css          Dark lab aesthetic — glassmorphic panels, neon status states
├── script.js          Chemistry engine, ratio math, Canvas gauge + bar charts
├── README.md          This file
└── project.json       Project metadata
```

Open `index.html` in any browser.
