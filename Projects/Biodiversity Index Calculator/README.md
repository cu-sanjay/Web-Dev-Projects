# Biodiversity Index Calculator

An interactive web application for computing key biodiversity metrics from species abundance data — Richness (S), Shannon-Wiener (H'), Simpson (D), and Evenness (J') — with real-time visual feedback via Canvas-rendered bar charts and gauge meters.

## Features

- **Species Ingestion Table** — add/remove rows, inline edit species name and population count
- **Pre-seeded Data** — default starter set and a Tropical Rainforest template (10 species)
- **Validation** — flags empty species names and non-positive counts with row shake animation
- **Canvas Bar Chart** — proportional abundance visualization with color-coded bars
- **Gauge Meters** — Shannon (0–4), Simpson (0–1), Evenness (0–1) with animated fill
- **Ecosystem Verdict** — auto-categorized health label (HEALTHY / MODERATE / DEGRADED / MONOCULTURE)
- **Dark Theme** — low-light UI with monospace typography and neon accents

## Tech Stack

- HTML5 + CSS3 (custom properties, grid, backdrop-filter)
- Vanilla JavaScript (ES6+ module pattern, Canvas API)
- Google Fonts (Inter, JetBrains Mono, Orbitron)

## How to Use

1. Open `index.html` in any modern browser (no build step required)
2. Add/edit species rows in the ledger table
3. Click **Compute Analytics** to calculate indices and render charts
4. Click **Load Rainforest Template** to seed sample data
5. Click **Purge Data Matrix** to reset

## License

MIT
