# Water Cycle · Interactive Explorer

A hydrological modeling terminal simulating the complete water cycle through particle physics on HTML5 Canvas. Built with zero dependencies.

---

## Four-Phase Particle System

| Phase | Color | Description | Physics |
|---|---|---|---|
| **Evaporation** | Solar amber | H₂O molecules escape ocean surface, rise with thermal velocity | $E_v = \alpha \cdot T$ |
| **Condensation** | Ghostly purple | Vapor clusters into cloud formations at dew-point altitude | Adiabatic cooling convection |
| **Precipitation** | Electric blue | Cloud droplets trigger collision-coalescence, fall as rain streaks | Terminal velocity $\sqrt{2mg/\rho A C_d}$ |
| **Surface Runoff** | Emerald green | Hortonian overland flow follows steepest gradient, returns to basin | Manning's equation $V = \frac{1}{n}R^{2/3}\sqrt{S}$ |

## Parameters

| Slider | Range | Effect |
|---|---|---|
| Solar Thermal Intensity | 0–100% | Scales evaporation rate and particle velocity |
| Cloud Condensation Humidity | 0–100% | Probability of precipitation from cloud clusters |
| Wind Velocity Vector | 0–12 m/s | Horizontal drift on vapor, rain, and cloud position |
| Surface Basin Capacity | 10–100% | Controls ocean baseline / terrain saturation |

## Controls

| Action | Button | Effect |
|---|---|---|
| Start / Halt | Initiate Continuous Earth Cycle | Toggles `requestAnimationFrame` loop |
| Storm | Trigger Flash Storm Sub-Routine | Toggles heavy precipitation mode (crimson alert) |
| Reset | Reset Hydrological Core Matrix | Clears particles, resets sliders, restores standby |
| Phase isolation | Ribbon buttons (All / Evap / Cond / Precip / Runoff) | Dims non-selected phases; updates informatics panel |

## File Structure

```
├── index.html         Semantic layout — phase ribbon, parameter sliders, canvas, informatics panel
├── style.css          Dark lab aesthetic — glassmorphic panels, neon phase states (amber/purple/blue/green)
├── script.js          Particle system engine, sine-wave ocean, terrain profile, state machine, telemetry
├── README.md          This file
└── project.json       Project metadata
```

Open `index.html` in any browser.
