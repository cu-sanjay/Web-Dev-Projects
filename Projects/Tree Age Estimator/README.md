# Tree Age Estimator // Silviculture Diagnostics Workbench

A high-fidelity browser-based tree age estimation tool built with HTML5 Canvas and vanilla JavaScript. Computes age from trunk circumference using species-specific growth factors and visualizes results through dual canvas renderings.

---

## Features

- **Species Database** — 8 tree species (White Oak, Red Maple, Giant Sequoia, American Beech, Pin Oak, Sugar Maple, Douglas Fir, Eastern White Pine) each with a calibrated growth factor coefficient
- **Mathematical Engine** — Calculates diameter (`d = c / π`), estimated age (`Age = d × Growth Factor`), carbon sequestration via allometric biomass equations, and lifecycle stage classification (Seedling → Ancient)
- **Dual Canvas Visualization** — Left canvas renders concentric light/dark growth ring pairs simulating a tree core cross-section; right canvas plots a century-scale growth timeline with logistic curve, area fill glow, and amber current-age marker
- **Unit Toggle** — Switch between Inches and Centimeters with automatic value conversion
- **Input Validation** — Rejects empty, negative, non-numeric, or out-of-bounds input with panel shake animation, crimson borders, and error banner
- **Reset Functionality** — Clears both canvases, resets telemetry, unit toggle, and species selector without page reload
- **Dark Theme** — Velvet black (`#05070c`) background, frosted glass panels, neon emerald (`#00ff88`) accents, monospace typography

## Tech Stack

- HTML5 Canvas API
- CSS3 (custom properties, glassmorphism, flexbox/grid, responsive breakpoints)
- JavaScript ES6+ (IIFE pattern, arrow functions, template literals)

## How to Use

1. Select measurement unit (Inches / Centimeters)
2. Enter trunk circumference at breast height (e.g. 96 inches)
3. Choose tree species from the dropdown
4. Click "Generate Full Growth Simulation" or press Enter
5. View concentric growth rings, growth timeline graph, and telemetry stats

## Local Development

```bash
# Serve with any static file server
npx serve "Projects/Tree Age Estimator"
# or open index.html directly in a browser
```
