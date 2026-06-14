# Air Quality · Visual Dashboard

A premium atmospheric telemetry station built with vanilla HTML, CSS, and JavaScript. Monitor real-time air quality indices across four city profiles with live HTML5 Canvas particle smog simulation, multi-pollutant sub-index breakdowns, and clinical health advisory logic.

---

## Atmospheric Monitoring Framework

The dashboard simulates a multi-pollutant environmental monitoring station that computes composite Air Quality Index (AQI) values from four primary pollutant concentrations using EPA-standard breakpoint interpolation.

### City Profile Database

| Profile | PM₂.₅ (µg/m³) | PM₁₀ (µg/m³) | NO₂ (ppb) | CO (ppm) | Temp (°C) | Wind (km/h) |
|---|---|---|---|---|---|---|
| Industrial Complex | 82 | 210 | 175 | 11.5 | 38 | 8 |
| Coastal Metropolis | 42 | 75 | 55 | 4.5 | 26 | 14 |
| Alpine Sanctuary | 8 | 18 | 12 | 0.8 | 12 | 22 |
| Desert Hub | 62 | 175 | 28 | 2.4 | 44 | 30 |

### Pollutant Sub-Index Calculation

Each pollutant's concentration is converted to a sub-index (0–500) using linear interpolation between EPA breakpoints:

$$I = \frac{I_{hi} - I_{lo}}{BP_{hi} - BP_{lo}} \cdot (C - BP_{lo}) + I_{lo}$$

The **composite AQI** is the maximum of all four sub-indices.

| AQI Range | Classification | Color | Health Implication |
|---|---|---|---|
| 0–50 | Good | Green (#00e676) | Little or no risk |
| 51–100 | Moderate | Amber (#ffb800) | Acceptable for most |
| 101–150 | Unhealthy (Sensitive) | Orange (#ff6d00) | Sensitive groups affected |
| 151–200 | Unhealthy | Red (#ff1744) | Everyone affected |
| 201–300 | Very Unhealthy | Purple (#d500f9) | Health alert |
| 301–500 | Hazardous | Crimson (#b71c1c) | Emergency conditions |

---

## Architectural UI Code Design

### File Structure

```
├── index.html         Main application shell
├── style.css          Dark terminal atmospheric theme and layout
├── script.js          AQI engine, particle simulation, and health advisory
├── README.md          This documentation
└── project.json       Project metadata
```

### Architecture Overview

- **Zero Dependencies**: No build tools, package managers, or server-side runtime required.
- **Client-Side Only**: All computation runs in the browser using vanilla JavaScript.
- **Canvas Particle Engine**: Real-time smog particle system driven by `requestAnimationFrame` with wind-vector influence, AQI-based density modulation, alpha depth layering, and radial smudge rendering.
- **SVG Gauge Meter**: Circular AQI gauge with animated arc stroke-dashoffset transitions and dynamic color theming.
- **State-Driven UI**: Single state object controls pollutant values, city preset, wind/temperature, and simulation modifiers — all UI sections re-render from a single `updateAll()` call.

### Data Flow

1. **City Selection** → loads preset pollutant baselines → saves baseline for purge → updates all panels + particle density
2. **Wind/Temperature Sliders** → modify particle drift behavior and visual indicators
3. **Traffic Spike Trigger** → doubles particulate values + multiplies NO₂/CO → instantly increases particle density and AQI
4. **Air Purifier Engage** → interval-driven progressive scrubbing: decays pollutants toward 30% of baseline over 80 steps → clears particles from canvas → resets traffic spike flag
5. **Purge Command** → restores exact city baseline values → clears particle array → resets all modifier flags without page refresh

---

## Interactive Canvas Particle System

The particle smog simulator renders a dynamic field of floating particulate nodes:

| Parameter | Effect |
|---|---|
| AQI Value | Controls target particle count (30 at Good → 260 at Hazardous) |
| Wind Speed | Applies horizontal drift vector to all particles proportional to slider |
| AQI Color | Tints entire canvas with AQI range color at `min(aqi/500, 1) × 0.06` alpha |
| Layer System | Particles sorted by random layer value; background layers render at 0.6× alpha, foreground at 1.3× |
| Particle Size | Base size 1–6px scaled by AQI multiplier (1× at Good, 2.5× at Hazardous) |
| Smudge Rendering | Particles >3px render as radial gradient smudges for realistic haze effect |

---

## Clinical Health Advisory Panel

The right-hand panel dynamically adjusts based on current AQI:

| AQI | Lung Threat | Mask | Outdoor Training | Windows |
|---|---|---|---|---|
| 0–50 | Good | Not Required | Safe | Open Safe |
| 51–100 | Moderate | Not Required | Advised Reduction | Open Safe |
| 101–150 | Unhealthy (Sensitive) | Recommended | Advised | Recommended Closed |
| 151–200 | Unhealthy | Recommended | Avoid | Mandatory Closed |
| 201–300 | Very Unhealthy | Mandatory | Terminated | Mandatory Closed |
| 301–500 | Hazardous | Mandatory | Terminated | Mandatory Closed |

At **AQI ≥ 200**, a flashing crimson alert card activates. At **AQI ≥ 300**, severe warning text displays: `[HEALTH WARNING: AIR TOXICITY THRESHOLDS BREACHED. RESPIRATORY FAILURE RISK HIGH. TERMINATE OUTDOOR EXPOSURE]`.

---

## Controls & Interactions

### Keyboard Shortcuts (Canvas Focus)

| Key | Action |
|---|---|
| `T` | Trigger Peak Traffic Inflow Spike |
| `P` | Engage Regional Air Purifier System |
| `R` | Purge Pollutants & Re-Zero Telemetry |

### Footer Commands

| Button | Behavior |
|---|---|
| **Trigger Peak Traffic Inflow Spike** | Instantly doubles PM₂.₅, doubles PM₁₀, 2.5× NO₂, 1.8× CO; doubles particle density |
| **Engage Regional Air Purifier System** | Progressive 80-step cleaning sequence; decays pollutants to 30% of baseline; removes particles gradually |
| **Purge Pollutants & Re-Zero Telemetry** | Restores exact city baseline values; clears all particles; resets all flags; no page refresh |

---

## Local Standalone Execution

No server, build step, or installation required:

1. Clone or download this directory
2. Open `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari)
3. The application loads instantly — zero external dependencies

### System Requirements

- Modern browser with HTML5 Canvas, SVG, CSS Grid, and ES6 support
- No additional software, frameworks, or package managers
- Fully offline-capable: all logic and assets are self-contained

---

## License

Educational and research use. Built as a technical demonstration of environmental data visualization, particle system simulation, and real-time health advisory logic.
