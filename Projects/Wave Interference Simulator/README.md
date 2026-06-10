# Wave Interference Simulator

> An advanced signal processing and wave mechanics laboratory simulator that computes and renders the superposition of multiple sinusoidal wavefronts in real time.

---

## Mathematical Wave Models

The interference field is computed using the classical wave superposition formula:

$$z(x, y, t) = \sum_{i=1}^{n} A_i \sin\left(k_i \cdot r_i - \omega_i \cdot t + \phi_i\right)$$

Where for each source $i$:

- $A_i$ — Amplitude (px), controls peak displacement
- $k_i = \omega_i / v$ — Wave number derived from angular frequency and propagation velocity
- $r_i = \sqrt{(x - x_i)^2 + (y - y_i)^2}$ — Euclidean distance from point $(x,y)$ to source origin $(x_i,y_i)$
- $\omega_i = 2\pi f_i$ — Angular frequency derived from slider-controlled frequency $f_i$
- $t$ — Global simulation time offset (seconds)
- $\phi_i$ — Phase offset constant

The resulting scalar field $z(x,y,t)$ produces characteristic interference topologies:
- **Constructive reinforcement** — wavefronts align in phase, producing amplified crest/ trough amplitudes
- **Destructive cancellation** — wavefronts align out of phase, producing nodal null zones near zero displacement
- **Complex superposition** — partial interference producing irregular moire fringe geometries

---

## Signal Processing Engine Specifications

| Parameter | Range | Resolution | Description |
|-----------|-------|-----------|-------------|
| Frequency | 0.5 – 5.0 Hz | 0.1 Hz | Oscillation rate per source |
| Amplitude | 0 – 50 px | 1 px | Peak displacement magnitude per source |
| Wave Speed | 90 px/s (fixed) | — | Propagation velocity constant |
| Time Delta | Real-time | ~16.6ms | Accumulated per animation frame |
| Render Resolution | 2px grid | 2px | Spatial sampling step for performance |

Visual encoding:
- **Positive crests** → `#3b82f6` (blue), intensity proportional to displacement
- **Negative troughs** → `#ef4444` (red), intensity proportional to displacement
- **Nodal nulls** → `#070a13` / `#111827` (background), zero crossing zones
- **Source anchors** → `#10b981` (green), interactive drag handles

---

## Feature Walkthrough

### Wave Source Configuration
Adjust each independent source's **Frequency** and **Amplitude** via precision sliders in the left control panel. Live readouts display current values. Setting amplitude to zero visually disables that source and dims its control block.

### Interactive Source Positioning
Click and drag the green anchor markers on the canvas to reposition wave emitters in real time. Interference fringes update dynamically as geometric distances change.

### Simulation Controls
- **PAUSE / RESUME** — Freezes or continues wave propagation time
- **RESET SIGNAL WAVEFRONTS** — Resets simulation time to zero

### Real-Time Diagnostics
- **Phase Delta** — Instantaneous phase difference between the two sources (radians)
- **Time Elapsed** — Accumulated simulation time in seconds
- **Wave Mode** — Auto-detected interference regime (constructive / destructive / complex)
- **Frame Rate** — Live FPS counter for performance monitoring

### Pointer Telemetry
Hover over the canvas to track cursor position $(X,Y)$ and read the instantaneous combined wave amplitude $Z$ at that point.

---

## File Organization Hierarchy

```
├── index.html        Main application shell — grid layout, control panels, canvas viewport
├── style.css         Complete theme system — dark lab palette, custom sliders, responsive grid
├── script.js         Signal processing engine — wave physics, rendering loop, interaction layer
├── README.md         This documentation
├── project.json      Project metadata and tags
└── thumbnail.svg     Preview graphic
```

---

## Local Deployment Verification

This application runs entirely client-side with zero build steps or external dependencies.

### Quick Start
1. Open `index.html` directly in any modern browser (Chrome, Firefox, Edge, Safari)
2. No web server, package manager, or compilation required
3. All assets are self-contained within the project directory

### Requirements
- A modern browser with HTML5 Canvas API support
- JavaScript enabled
- No internet connection required after initial page load

### Performance Notes
- The canvas renders at 2px grid resolution for optimal performance
- High-DPI (Retina) displays are supported via `devicePixelRatio` scaling
- If experiencing low frame rates, reduce browser zoom or close other GPU-intensive tabs
