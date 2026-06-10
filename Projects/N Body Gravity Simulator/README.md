# GRAVITY ECO-SYSTEM: N-Body Gravity Simulator

An ultra-premium, light botanical-themed orbital physics platform simulating multi-body gravitational interactions via high-fidelity numerical integration, featuring collision detection, interactive click-and-slingshot planet creation, persistent fading orbital paths, and raw CSV vector exports.

---

## Newtonian Multi-Body Gravitational Foundations

The gravitational interaction between $N$ bodies is governed by Newton's law of universal gravitation:

### Gravitational Force Matrix

$$\mathbf{F}_i = \sum_{j \neq i}^{N} G \frac{m_i m_j}{|\mathbf{r}_j - \mathbf{r}_i|^3} \cdot (\mathbf{r}_j - \mathbf{r}_i)$$

Where:
- $G$ = Universal Gravitational Constant (configurable 0.1 – 10.0)
- $m_i, m_j$ = Masses of bodies $i$ and $j$
- $\mathbf{r}_i, \mathbf{r}_j$ = Position vectors
- $\mathbf{F}_i$ = Net gravitational force on body $i$

### Equations of Motion

Each body's acceleration is derived from Newton's second law:

$$\mathbf{a}_i = \frac{\mathbf{F}_i}{m_i} = \sum_{j \neq i} G \frac{m_j}{|\mathbf{r}_j - \mathbf{r}_i|^3} \cdot (\mathbf{r}_j - \mathbf{r}_i)$$

### Softening Parameter

A softening factor $\epsilon^2$ is added to the denominator to prevent infinite forces during close encounters:

$$\mathbf{a}_i = \sum_{j \neq i} G \frac{m_j \cdot (\mathbf{r}_j - \mathbf{r}_i)}{(|\mathbf{r}_j - \mathbf{r}_i|^2 + \epsilon^2)^{3/2}}$$

---

## Numerical Approximation Algorithms

### Velocity Verlet (Leapfrog) Integrator

Forward Euler integration accumulates severe energy errors. This simulator uses the **velocity Verlet** (a symplectic integrator) which conserves energy to machine precision over long timescales:

1. **Half-step kick**: $\mathbf{v}(t + \frac{h}{2}) = \mathbf{v}(t) + \frac{h}{2} \mathbf{a}(\mathbf{x}(t))$
2. **Drift**: $\mathbf{x}(t + h) = \mathbf{x}(t) + h \cdot \mathbf{v}(t + \frac{h}{2})$
3. **Recompute** $\mathbf{a}(\mathbf{x}(t + h))$
4. **Half-step kick**: $\mathbf{v}(t + h) = \mathbf{v}(t + \frac{h}{2}) + \frac{h}{2} \mathbf{a}(\mathbf{x}(t + h))$

Where $h = \Delta t$ is the integration timestep. Multiple sub-steps are taken per rendered frame to maintain stability.

### Euler Method (Explicitly Avoided)

Simple Euler integration: $\mathbf{x}(t + h) = \mathbf{x}(t) + h \cdot \mathbf{v}(t)$ systematically injects energy into the system, causing orbital blow-up. The Verlet integrator eliminates this drift.

---

## Momentum and Energy Conservation Metrics

### System Energies

**Kinetic Energy**: $KE = \frac{1}{2} \sum_i m_i |\mathbf{v}_i|^2$

**Potential Energy**: $PE = -G \sum_{i < j} \frac{m_i m_j}{|\mathbf{r}_j - \mathbf{r}_i|}$

**Total Energy**: $E = KE + PE$ (conserved in the absence of collisions)

### Inelastic Collisions

When two bodies overlap ($|\mathbf{r}_j - \mathbf{r}_i| < R_i + R_j$), they merge conserving momentum:

$$\mathbf{v}_{new} = \frac{m_1 \mathbf{v}_1 + m_2 \mathbf{v}_2}{m_1 + m_2}$$

Mass and radius combine additively: $m_{new} = m_1 + m_2$, $R_{new} = \sqrt[3]{R_1^3 + R_2^3}$.

---

## Interface Operations Guide

### Controls

| Action | Operation |
|---|---|
| **Click on canvas** | Place a body at cursor position with parameters from the Spawn panel |
| **Click-and-drag on canvas** | Slingshot: drag direction and distance set initial velocity |
| **Scroll wheel** | Zoom in/out on the center of mass |
| **LOAD preset** | Loads a pre-configured system (Binary Star, Solar Filament, Three-Body) |
| **Spawn Body** | Creates a body at a randomized position near center |
| **PAUSE / RESUME** | Toggle simulation |
| **CLEAR** | Remove all bodies |
| **EXPORT CSV** | Download current state + trail data |

### Telemetry

- **N**: Active body count
- **KE / PE / E Total**: Real-time energy tracking with Chart.js rolling graph
- **Collision Events**: Logged with timestamps and merged body IDs
- **Table**: Per-body mass, position, velocity magnitude, nearest neighbor distance

---

## Standalone Local Setup

No server, build step, or installation required:

1. Clone or download this directory
2. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari)
3. The application loads instantly — Chart.js is fetched from CDN on first load

### File Structure

```
├── index.html         Main application shell
├── style.css          Botanical theme and layout
├── script.js          Verlet integrator, canvas renderer, presets
├── README.md          This documentation
├── project.json       Project metadata
└── thumbnail.svg      Vector preview graphic
```

### System Requirements

- Modern browser with HTML5 Canvas and ES6+ support
- Internet connection (first load only, for Chart.js CDN)
- No additional software, frameworks, or package managers

---

## License

Educational and research use. Built as a technical demonstration of N-body gravitational dynamics, symplectic integration, and interactive physics visualization.
