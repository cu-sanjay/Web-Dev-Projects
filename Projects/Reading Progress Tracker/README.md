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
# Reading Progress Tracker

A premium, interactive library dashboard and reading habits tracker. Easily organize your digital bookshelf, monitor your pages-per-hour speed, log focused reading session stopwatches, capture inspiring book quotes, and review monthly progress analytics.

## 🚀 Features

- **Personal Bookshelf Catalogue**: Organise books under categories like *To Read*, *Reading*, *Completed*, or *On Hold*, styled with custom card colors and visual gauges.
- **Granular Page Metrics**: Log incremental progress checks, updating active progress ratios and computing estimated finish dates.
- **Reading Stopwatch Timer**: Focused sessions stopwatch with built-in elapsed counter. Automatically logs duration and increments pages read when complete.
- **Quotes & Notes Vault**: Central repository to capture meaningful text passages, tagged with citation page numbers and sorted per book.
- **Analytics KPI Dashboard**: Track reading velocity metrics, annual milestones, current streak counters, and pages read trends.
- **Data Backup Portability**: Instantly download your full library database as a portable JSON file, or restore existing files on secondary devices.
- **Modern Adaptive Theme**: Curated dark and light layouts built for accessibility and distraction-free tracking.

## 📂 Project Structure

```
Reading Progress Tracker/
├── README.md         # Full project handbook
├── project.json      # Metadata descriptor
├── index.html        # App semantic structure and layout
├── style.css         # Dark & light variables, UI layouts, and animations
├── script.js         # Library states, timers, and storage drivers
└── thumbnail.svg     # Brand vector thumbnail
```

## 🛠️ How to Use

1. Load `index.html` in your web browser.
2. The application automatically populates high-fidelity seed entries (e.g. *Atomic Habits*, *Dune*) on first launch to explore dashboard metrics.
3. Use the **My Library** panel to add books, adjust active page marks, or delete catalog records.
4. Launch the **Stopwatch Timer** in the **Sessions** tab when reading to log precise time durations.
5. Store insights in the **Quotes & Notes** panel.
6. Toggle light/dark settings or manage JSON backup uploads via the **Settings** sidebar tab.
