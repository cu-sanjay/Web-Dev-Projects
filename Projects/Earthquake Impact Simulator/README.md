# Earthquake Impact · Simulator

A premium geophysics laboratory workspace modeling seismic wave propagation through subsurface strata with real-time Canvas visualization, building integrity telemetry, and base-isolation retrofit controls.

---

## Seismological & Geophysical Principles

The simulator models a **tectonic rupture event** at a user-defined hypocenter, releasing elastic strain energy that propagates as body waves through the Earth's crust:

- **P-Wave (Primary / Compressional)** — Longitudinal waves traveling at ~6 km/s. First arrival at each point, characterized by alternating compression and dilation of the medium.
- **S-Wave (Secondary / Shear)** — Transverse waves traveling at ~3.5 km/s (~58% of P-wave velocity). Cannot propagate through fluids; causes perpendicular particle motion responsible for the majority of structural damage.

### Energy–Magnitude Relationship

The total seismic energy released follows the Gutenberg–Richter energy–magnitude relation:

$$E = 10^{4.8 + 1.5M}$$

| Magnitude | Energy Released (J) | TNT Equivalent |
|---|---|---|
| 5.0 | $2.0 \times 10^{12}$ | 475 tons |
| 7.0 | $2.0 \times 10^{15}$ | 475 kilotons |
| 9.0 | $2.0 \times 10^{18}$ | 475 megatons |

---

## Peak Ground Acceleration & Soil Amplification

PGA is computed using a depth-attenuated nonlinear magnitude model modulated by the local soil classification:

$$PGA(g) = M \cdot 0.04 \cdot (1 + 0.3 \cdot (M - 1)^{1.5}) \cdot e^{-0.003h} \cdot S$$

| Soil Type | Coefficient ($S$) | Behavior |
|---|---|---|
| Solid Granite | 0.5 | High stiffness, minimal amplification, low resonance risk |
| Dense Sediment | 1.0 | Moderate stiffness, neutral amplification |
| Soft Alluvium Silt | 1.8 | Low stiffness, strong amplification, liquefaction potential |

### Modified Mercalli Intensity Scale

PGA is mapped to the 12-point Mercalli scale for qualitative damage assessment:

| Range | Intensity | Damage Description |
|---|---|---|
| < 0.0017 g | I – Instrumental | Not felt except by a few under favorable conditions |
| 0.0017 – 0.014 g | II–III – Light | Felt by persons at rest; hanging objects swing |
| 0.014 – 0.039 g | IV – Moderate | Felt indoors by many; dishes rattle |
| 0.039 – 0.092 g | V – Strong | Felt by nearly everyone; unstable objects overturned |
| 0.092 – 0.18 g | VI – Strong | Felt by all; some heavy furniture moved |
| 0.18 – 0.34 g | VII – Very Strong | General alarm; slight to moderate damage in well-built structures |
| 0.34 – 0.65 g | VIII – Destructive | Damage in well-built structures; chimneys fall |
| 0.65 – 1.24 g | IX – Violent | General panic; great damage in substantial buildings |
| 1.24 – 2.5 g | X – Extreme | Most masonry structures destroyed |
| > 2.5 g | XI–XII – Catastrophic | Total destruction; waves seen on ground surface |

---

## Architectural UI Code Design

### File Structure

```
├── index.html         Main application shell
├── style.css          Complete geophysics-lab theme and layout
├── script.js          Seismic engine, canvas rendering, and controls
├── README.md          This documentation
└── project.json       Project metadata
```

### Architecture Overview

- **Zero Dependencies**: No build tools, package managers, or server-side runtime required.
- **Client-Side Only**: All computation runs in the browser using vanilla JavaScript.
- **Canvas Rendering**: Ring-based P/S wave propagation with depth-compounded subsurface layers, epicenter glow effects, and building drift visualization.
- **State Management**: Single-source-of-truth state object tracks magnitude, depth, soil type, wave radii, PGA, and per-building structural data.

### Data Flow

1. User adjusts magnitude/depth/soil sliders → state parameters updated → ready for rupture
2. **Trigger** clicked → fault ruptured → `ruptureTime` captured → animation loop advances wave radii
3. Each frame → compute P/S wavefront positions → calculate PGA from depth-attenuated model → evaluate per-building S-wave drift → update telemetry cards and gauges
4. Buildings within S-wave radius oscillate with amplitude proportional to PGA × distance-intensity factor
5. Structural integrity degrades with cumulative drift and collapses trigger at PGA > 1.5g near epicenter
6. **Deploy Retrofits** toggles base-isolation factor (75% drift reduction)
7. **Purge** resets all wave states, telemetry, and building damage

---

## Simulation Operation Parameters

| Parameter | Range | Description |
|---|---|---|
| Richter Magnitude | 1.0 – 10.0 | Moment magnitude scale |
| Focal Depth | 5 – 150 km | Hypocenter depth below surface |
| Soil Type | Granite / Sediment / Alluvium | Local site amplification coefficient (0.5× / 1.0× / 1.8×) |

### Controls

- **Trigger Tectonic Rupture Spark**: Initiate seismic event at current hypocenter
- **Deploy Base-Isolation Structural Retrofits**: Toggle passive damping for 75% drift reduction
- **Purge Shockwaves & Stabilize Fault**: Clear all wave states, reset telemetry and building damage

### Telemetry Dashboard

| Metric | Description |
|---|---|
| Peak Ground Acceleration | Computed PGA in g (gravity units) |
| Shockwave Radius | P-wave front radius in km |
| Mercalli Intensity | Qualitative damage level (I – XII) |
| Structural Integrity | Composite score based on average drift × 8 + collapsed count × 20 |

### System Status Indicators

| Status | Meaning |
|---|---|
| STANDBY | Awaiting trigger, no seismic event |
| ACTIVE | Rupture in progress, waves propagating |
| COLLAPSE | Structural integrity below 30%, widespread failure |
| STABILIZED | Post-purge quiescent state |

---

## Local Standalone Browser Execution

No server, build step, or installation required:

1. Clone or download this directory
2. Open `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari)
3. The application loads instantly — zero external dependencies

### System Requirements

- Modern browser with HTML5 Canvas and ES6 support
- No additional software, frameworks, or package managers
- Offline-capable: all logic is self-contained

---

## License

Educational and research use. Built as a technical demonstration of seismic physics simulation and interactive Canvas visualization.
