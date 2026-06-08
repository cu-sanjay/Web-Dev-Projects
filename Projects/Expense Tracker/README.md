# Expense Tracker

A premium dark-theme personal finance tracker built with vanilla HTML5, CSS3, and JavaScript (ES6+).

## Features

- **Real-time Scorecard** — Net balance, total income, and total expenses computed via `.reduce()` and updated on every mutation.
- **Defensive Transaction Ingestion** — Validates non-empty descriptions, blocks non-numeric characters from the amount field, rejects zero/negative values, and parses to precision floats.
- **Decoupled State Matrix** — All transactions stored in a single `transactions` array. Every add/delete triggers `saveState()` then a single `render()` call that redraws the ledger and breakdowns from data.
- **Category Breakdown Bars** — Expenses grouped by category via `.filter()` and `.reduce()`, rendered as proportional CSS progress bars with percentage widths.
- **Type Filter** — All / Income / Expense toggle scoped to the active ledger view.
- **Persistent localStorage** — Full ledger and ID counter synced to localStorage on every change, restored on boot.
- **Fintech Dark Aesthetic** — `#05070e` background, glassmorphic cards, emerald income / ruby expense accents, monospace tabular numbers, spring-easing error shake animation.
- **Responsive** — 3-column scorecard → single-column on mobile, sidebar breakdown reflows below the ledger on narrow screens.

## Run it

Open `index.html` in any modern browser.
