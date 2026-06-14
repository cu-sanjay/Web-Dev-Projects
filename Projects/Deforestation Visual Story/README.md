# Global Deforestation · Visual Story

An interactive geospatial observation terminal that visualizes 36 years (1990–2026) of deforestation across four critical biomes using the HTML5 Canvas API. Built with zero dependencies.

---

## Territories

| Region | Deforestation Pattern | Carbon Weight | Status |
|---|---|---|---|
| **Amazon Rainforest Basin** | Road-like canyon clearance streaks | 0.42 MtCO₂/ha | Rapid loss, 35% gone by 2026 |
| **Congo Basin Equatorial Core** | Scattered small-holder clearings | 0.38 MtCO₂/ha | Slower but accelerating |
| **Southeast Asian Archipelago** | Plantation checkerboard grid | 0.52 MtCO₂/ha | Severe peat-rich clearance |
| **Boreal Taiga Matrix** | Large irregular patch fires | 0.18 MtCO₂/ha | Low rate, massive area |

## Core Model

$$D_{t+1} = D_t \cdot (1 - \alpha) \quad \text{where } \alpha = \text{annual loss rate}$$

$$C_{\text{loss}} = A_{\text{lost}} \times W_{\text{biomass}}$$

## Controls

| Action | Button | Keyboard |
|---|---|---|
| Play/pause playback | Initiate Historical Playback Loop | Space |
| Stop | Halt Chronological Acceleration | H |
| Reset to 1990 | Restore Global Canopy Arrays | R |

---

## File Structure

```
├── index.html         Semantic layout — region ribbon, canvas, telemetry, timeline
├── style.css          Dark terminal theme — glassmorphic panels, neon states
├── script.js          Canvas engine, playback loop, telemetry computations
├── README.md          This file
└── project.json       Project metadata
```

No dependencies. Open `index.html` in any browser.
