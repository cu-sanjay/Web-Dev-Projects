# Reading · Progress Tracker

A bibliographic telemetry console with an interactive library ledger, inline page-update cells, localStorage-persisted reading streaks, and an animated Canvas radial progress ring with per-book secondary arcs. Built with zero dependencies.

---

## Features

### Library Ledger
- Add books with title, total pages, and current page
- Inline page input for rapid progress updates
- Delete books with trash icon
- Persisted in localStorage across sessions

### Canvas Radial Ring
- Concentric track with neon cyan/emerald progress arc
- Glowing end dot and center percentage display
- Secondary perimeter arcs showing per-book completion
- `[METRIC METADATA STABILIZED: TEXT ARCHIVED COMPLETED]` banner at 100%

### Reading Streak
- Tracks consecutive active days via `localStorage`
- Bumped on each "Simulate Page Bump" action within valid 24‑hour windows
- Resets if a day is skipped

### Telemetry

| Metric | Source |
|---|---|
| Reading Streak | Consecutive active days logged |
| Total Pages Read | Σ current pages across all books |
| Completion Ratio | total read / total pages × 100 |
| Pacing Velocity | total pages / streak days |
| Books Finished | count of books at 100% |

## Presets

| Book | Total Pages |
|---|---|
| The Pragmatic Programmer | 350 |
| Introduction to Algorithms (CLRS) | 1,312 |
| Design Patterns (GoF) | 415 |

## Controls

| Action | Function |
|---|---|
| Add to Library | Adds a new book entry |
| Execute Library Compute | Recalculates all metrics |
| Simulate Page Bump | +10 pages on first unfinished book, updates streak |
| Purge Bibliographic Cache | Clears all data from memory and localStorage |

---

## File Structure

```
├── index.html         Layout — presets, book input form, library ledger table, ring canvas, telemetry, footer
├── style.css          Dark productivity lab — glassmorphic panels, cyan/emerald/amber states
├── script.js          Full engine — CRUD ledger, localStorage persistence, streak algorithm, Canvas ring
├── README.md          This file
└── project.json       Project metadata
```

Open `index.html` in any browser.
