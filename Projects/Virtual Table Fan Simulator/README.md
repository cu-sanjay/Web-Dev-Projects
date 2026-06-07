# Virtual Table Fan Simulator // Mechanical Physics Dashboard

Virtual Table Fan Simulator is an ultra-realistic interactive hardware physics simulation engine executing completely client-side. Built using native browser mechanics, the platform couples real-time rotational inertia equations with programmatic multi-channel acoustic synthesis networks. This arrangement models genuine hardware telemetry, mechanical spin thresholds, and periodic side-to-side sweeping oscillation states without third-party audio codecs or graphics engines.

---

## Technical Capabilities & Core Specifications

### 1. Hardware Control & Canvas Architecture (`style.css`)

- **Strict Real Estate Viewport Constraints:** Confines all telemetry readouts and design layouts inside an anti-shiver chassis structure (`max-width: 1200px`, `height: 780px`) protecting grid structures from layout shifting distortions.
- **Jitter-Proof Monospaced HUD Panels:** Digital timers, current speed selectors, precise calculated RPM values, and active angular sweep degrees utilize un-skewed monospace typography declarations (`ui-monospace, Consolas, monospace`), guaranteeing structural coordinates stay perfectly locked during numeric updates.
- **Pure CSS Vector Geometry:** Renders an elegant multi-layered mechanical fan chassis. Concentric wire guard spokes, radiating alignment rails, protective rotor enclosures, and an aerodynamic blade stack are built from the ground up using scalable, modular visual wrappers.

### 2. High-Frequency Physics & Sound Synthesis (`script.js`)

- **Rotational Inertia Physics Equation Loop:** Powered natively via a sub-millisecond `requestAnimationFrame()` ticking loop thread. When shifting speed categories (0 through 3), the blade tracking values avoid sudden tier snaps; instead, velocity layers simulate mechanical drag and mass momentum using differential integration equations:
  $$\omega_{current} = \omega_{current} + (\omega_{target} - \omega_{current}) \times \text{Inertia\_Coefficient}$$
- **Periodic Angular Oscillation Engine:** Simulates horizontal sweeping kinematics by mapping real-time sine function variations ($Angle = \sin(t) \times \text{Max\_Sweep}$). The calculation dynamically injects mathematical translation values to control the CSS transform rotation matrix across the whole fan head element array.
- **Zero-Asset Procedural Wind Synthesizer:** Instantiates a native browser `AudioContext` graph layer to create sound waves on the fly. The engine pipes a white noise generation buffer block directly into an adjustable `BiquadFilterNode` linked to a low-frequency oscillator baseline thread. It modulates filter cutoff bounds and output gain states smoothly in a linear correlation with the active physical fan blades RPM:
  $$\text{Gain}_{Value} \propto \text{RPM}_{Current} \quad \text{and} \quad \text{Filter\_Cutoff}_{Frequency} \propto \text{RPM}_{Current}$$
- **LocalStorage Presets Cache:** Automatically saves user velocity presets and oscillation selections to local client browser storage blocks to retain state across initialization reloads.

---

## Workspace Directory Layout

```text
Virtual Table Fan/
├── index.html       # Structural Semantic Control Panels, HUD Counters, and Fan Nodes
├── style.css        # Technical Layout Grid, Concentric Wire Spokes, and Rotator Profiles
├── script.js        # Inertia Physics Differential Loops and Web Audio Synthesis Engine
├── project.json     # Architecture Manifest Descriptor Metadata
└── README.md        # Technical Engineering Specifications Documentation
```
