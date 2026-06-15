# Deforestation Impact Map — Global Forest Coverage Intelligence

An immersive, high-fidelity browser-based environmental analytics and GIS visualization platform. This dashboard allows climate researchers, educators, and policy advocates to analyze global forest coverage decline, examine regional deforestation drivers, run year-over-year comparisons (1990–2025), and calculate environmental offsets in real time.

---

## 1. Project Overview

The **Deforestation Impact Map** is a client-side visualization application built entirely using standard semantic HTML5, vanilla CSS3 grids/variables, and modern JavaScript. The platform provides a multi-dimensional analysis of Earth's key forest biomes, simulating ecological shifts over a 35-year time span.

---

## 2. Deforestation Monitoring Features

- **Interactive GIS Map**: Clickable world atlas highlighting 7 key forest regions and plotting a high-density, dynamically colored cellular forest matrix representing canopy cover.
- **Timeline Playback**: Automatic time-series playback (1990 to 2025) with multiple speed controls (Slow, Normal, Fast) to visualize deforestation frontiers expanding over time.
- **Coverage Comparison Mode**: An overlay showing forest loss, stable regions, at-risk buffer zones, and active reforestation recovery zones compared to baseline years (1990, 2000, or previous year).
- **Deep Analytics Panel**: Comprehensive breakdowns of deforestation drivers (logging, cattle ranching, infrastructure, mining, wildfires), biodiversity stats (threatened/endemic species count), and conservation systems.
- **Ecology Quiz Challenge**: An interactive, randomized 5-question multiple-choice quiz testing forest conservation knowledge with a score feedback box and local high score tracking.
- **Carbon & Land Calculator**: Converts protected forest land sizes (km²) into estimated metric tons of sequestered carbon, equivalent car emission offsets, protected species counts, and economic ecosystem values.
- **Eco-Insight Fact Generator**: An educational component showing fact-cards highlighting forest ecology and conservation achievements.

---

## 3. Forest Coverage Analysis

The map visualizes tree cover density using a dynamic cell-matrix. In standard view, cell density is classified into four categories:
- **Dense Forest** (Dark Green): Core forest cover, high canopy closure (>70%).
- **Moderate Forest** (Medium Green): Mixed woodland or regrowth (40%–70% cover).
- **Sparse Forest** (Light Green): Tree margins or degraded forest frontier (15%–40% cover).
- **Deforested Area** (Earth Brown): Cleared land (<15% cover) showing agricultural conversion, logging roads, or wildfire scars.

Deforestation spreads dynamically from outer edges ("deforestation frontiers") into the core areas based on a deterministic cell vulnerability index.

---

## 4. Time-Series Visualization

Timeline animation interpolates values between anchor years (1990, 2000, 2010, 2020, 2025):
- **Play/Pause Controls**: Triggers intervals to step through years.
- **Vulnerability Spreading**: Individual cells turn brown or green sequentially as the region's overall forest coverage decreases or rebounds.
- **Europe & Australia Recovery**: Simulates real-world reclamation. Europe shows continuous coverage expansion, and Australia exhibits recovery and stabilization after severe wildfire scars in 2019-2020.

---

## 5. Environmental Impact Metrics

Calculated dynamically in real-time:
- **Current Coverage**: Weighted percentage of forest cover.
- **Forest Area**: Total regional land area multiplied by active coverage.
- **Lost Cover**: Cumulative forest area cleared since the 1990 baseline.
- **Carbon Storage**: Estimated Gigatonnes of carbon dioxide equivalent (Gt CO₂eq) stored in the region's biomass.
- **Biodiversity Impact Index**: Score (0.0 to 10.0) reflecting habitat fragmentation. A higher value indicates robust biodiversity abundance.

---

## 6. Dataset Structure

The application's local dataset (`script.js`) contains regional forest entries:
```javascript
{
  amazon: {
    name: "Amazon Rainforest",
    continent: "South America",
    type: "Tropical Rainforest",
    totalArea: 5500000,
    treeDensity: 150,
    rainfall: "2,200 mm/year",
    biodiversityTotal: 3000000,
    endemicPercent: 45,
    conservationEfforts: [...],
    drivers: { "Cattle Ranching": 65, "Soy Agriculture": 20, "Logging": 10, "Wildfires": 5 },
    anchors: {
      1990: { coverage: 87.5, biodiversityIndex: 9.8, threatenedSpecies: 240, carbonStorage: 110 },
      ...
      2025: { coverage: 63.5, biodiversityIndex: 5.8, threatenedSpecies: 1450, carbonStorage: 80 }
    }
  }
}
```

---

## 7. Accessibility Features

- **Keyboard Navigation**: All interactive elements (selects, range sliders, SVG cells, modals, buttons) are keyboard-focusable and operable via `Enter` or `Space`.
- **ARIA Semantics**: Includes landmark elements (`main`, `aside`, `header`, `nav`), explicit roles (`role="dialog"`, `role="application"`), and live regions (`aria-live="polite"`).
- **High Contrast Mode**: Toggleable via `Alt + C` keyboard shortcut, swapping the color palette to ultra-high contrast dark values.
- **Reduced Motion Support**: Listens to system preferences (`@media (prefers-reduced-motion: reduce)`) to eliminate zoom transitions and slide animations.

---

## 8. Local Deployment Instructions

1. **Clone or Download**: Copy the project files (`index.html`, `style.css`, `script.js`, `project.json`, `thumbnail.svg`) into a local folder.
2. **Launch Browser**: Double-click `index.html` to open it directly in Google Chrome, Mozilla Firefox, Microsoft Edge, or Apple Safari.
3. **No Setup Needed**: The platform runs 100% client-side without requiring Node.js, python servers, compilers, build systems, or network calls.
