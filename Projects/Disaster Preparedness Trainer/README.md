# Disaster · Preparedness Trainer

A premium emergency management operations center built with vanilla HTML, CSS, and JavaScript. Train crisis response across three disaster scenarios with real-time Canvas physics simulation, resource allocation scoring, dilemma-based decision training, and structural integrity tracking.

---

## Crisis Scenarios

| Mode | Canvas Visualization | Critical Resources | Dilemmas |
|---|---|---|---|
| **Seismic Earthquake Fault** | Building shake with high-frequency displacement + debris particles | Seismic Shutoff Valves (30 pts), Evacuation Horns (25 pts) | 3 choice-based scenarios |
| **Flash Hydro-Flood** | Rising toxic water line with wave oscillation + floating debris | Sandbag Girders (35 pts), Rations Kit (25 pts) | 3 choice-based scenarios |
| **Category-5 Cyclone Vortex** | Spiral vortex particle stream with elliptical wind trajectories | Window Shutters (30 pts), Sandbags (25 pts) | 3 choice-based scenarios |

## Scoring: Preparedness Index

$$S_p = \sum w_i I_i$$

Where $w_i$ = item weight per disaster, $I_i$ = 1 if deployed, 0 otherwise.

| Score | Readiness Level |
|---|---|
| ≥70% | DEPLOYED — Adequate for crisis |
| 40–69% | PARTIAL — Gaps in coverage |
| <40% | UNDER-PREPARED — High risk |

## Structural Integrity Drain

When running, integrity drains per tick: $\Delta S = (100 - S_p) \times 0.002 \times (1 + t / 10000)$. At 0%, simulation halts with `CATASTROPHIC COLLAPSE` and score is archived to localStorage.

---

## File Structure

```
├── index.html         Main application shell
├── style.css          Dark emergency operations theme
├── script.js          Crisis engine, Canvas physics, dilemma system
├── README.md          This documentation
└── project.json       Project metadata
```

No dependencies. Open `index.html` in any browser.
