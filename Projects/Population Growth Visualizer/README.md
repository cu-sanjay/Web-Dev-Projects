# Population Growth · Visualizer

A demographic forecasting terminal with 3 mathematical growth models, real-time Canvas line chart with gradient fill, macro agent particle crowd grid, resource saturation warnings, and pandemic event injection. Built with zero dependencies.

---

## Growth Models

| Model | Equation | Behavior |
|---|---|---|
| **Exponential** | P(t) = P₀ · e^(rt) | Unchecked growth — no upper limit |
| **Logistic** | P(t) = (K·P₀·e^(rt)) / (K + P₀(e^(rt) − 1)) | S-curve bounded by carrying capacity K |
| **Malthusian** | P(t+1) = P(t) · (1 + r · max(0, 1 − P/K)) | Resource-limited with collapse potential |

## Parameters

| Slider | Range | Effect |
|---|---|---|
| Initial Pop (P₀) | 10–500 | Starting population in year 0 |
| Birth Rate | 0.5–8% | Crude birth rate per year |
| Death Rate | 0.1–5% | Crude death rate per year |
| Carrying Capacity (K) | 200–5000 | Environmental ceiling (logistic/Malthusian) |
| Time Horizon | 20–500 yr | Total simulation duration |

## Controls

| Action | Function |
|---|---|
| Initiate Generational Run | Computes full population projection over time horizon |
| Inject Pandemic Event | Reduces population by 30% from current year forward |
| Purge Dataset & Re-Zero | Clears all data, resets parameters to defaults |

## Telemetry

- **Doubling Time**: 70 / (net growth rate × 100) — Rule of 70
- **Strain Factor**: Current population / Carrying Capacity × 100
- **Saturation Badge**: Switches from CYAN → AMBER at 70%, → CRIMSON at 90%

## Canvas Features

- **Growth Chart**: Neon line + gradient fill, 5×4 grid, K threshold dashed line, active year cursor
- **Crowd Grid**: Up to 200 floating agent particles scaled to population/K ratio, color-matched to strain

---

## File Structure

```
├── index.html         Layout — model selector, parameter sliders, chart + particle canvases, telemetry, footer
├── style.css          Dark analytics lab — glassmorphic panels, cyan/amber/crimson strain states
├── script.js          Full engine — 3 model equations, Canvas chart + particle renderers, event injection
├── README.md          This file
└── project.json       Project metadata
```

Open `index.html` in any browser.
