# Blind Color Mixer // Sensory Intuition Board

Blind Color Mixer is a standalone frontend sensory challenge and color space puzzle application engineered client-side to satisfy the value-concealing and feedback tracking constraints detailed in **Issue #888**. By decoupling standard analytical step metrics and numerical indices from input nodes, the interface challenges a designer's raw optical precision and sub-pixel color coordination across standard RGB channels.

---

## Technical Capabilities & Core Specifications

### 1. High-Contrast Sandbox Scaffolding (`style.css`)

- **Strict Real Estate Viewport Constraints:** Confines all control tracks, dashboard readouts, and preview windows inside an anti-shiver panel chassis frame layout (`max-width: 1200px`, `height: 760px`) to shield components from structural layout flexing shifts across large monitors.
- **Jitter-Proof Monospaced Typography Locks:** Match accuracy coefficients, active score streaks, historical maximum ceiling logs, and evaluation tags map onto clear monospaced font declarations (`ui-monospace, Consolas`), guaranteeing text mutations trigger zero spatial layout jitter.
- **Valueless Slider Customization Rules:**
  - `input[type="range"]`: Stripped of all native webkit browser ticks, numbers, and value readouts. The track is styled as a dark, sterile baseline bar hiding step boundaries.
  - Slider knobs are accented with discrete channel indicator pins (Red, Green, and Blue) that translate along the axis smoothly without leaking active coordinate numerical indices onto the interface.
  - `#target-specimen` & `#user-mixture`: Side-by-side balanced viewport cards rendering real-time variations instantly via style object variable injection.

### 2. Euclidean Color Space Analytics (`script.js`)

- **Random Target Specimen Generator:** Computes pseudo-random target color bounds using standalone integer generators spanning standard 8-bit channels ($R, G, B \in [0, 255]$).
- **Concealed Input Interceptor Chain:** Captures value changes from hidden range inputs, updating the background properties of the user's mixing canvas dynamically without echoing numerical indexes to the DOM tree.
- **Euclidean Distance Color Delta Vector ($\Delta E$):** Upon clicking "EVALUATE MIX", the engine extracts the hidden user parameters and compares them mathematically to the target properties using a localized Euclidean distance model across 3D coordinate color blocks:
  $$\Delta E = \sqrt{(R_{target} - R_{user})^2 + (G_{target} - G_{user})^2 + (B_{target} - B_{user})^2}$$
- **Accuracy Percentage Transformer:** Translates the calculated color space gap vector into an accurate score coefficient:
  $$\text{Accuracy \%} = \max\left(0, 100 \times \left(1 - \frac{\Delta E}{\sqrt{255^2 + 255^2 + 255^2}}\right)\right)$$
  A match parameter within close structural bounds ($\ge 92\%$) increments current streak tallies, whereas falling short resets multipliers while updating performance tracking records.
- **LocalStorage Milestone Caching:** Automatically serializes supreme color match scores and streak thresholds within client browser storage strings to preserve user profile analytics.

---

## Workspace Directory Layout

```text
Blind Color Mixer/
├── index.html       # Structural Semantic Target Cards and Range Slider Channels
├── style.css        # Valueless Track Customization, Dark Theme, and Badge Shaders
├── script.js        # Concealed Input Interceptors, Euclidean Color Deltas, and Caching Loops
├── project.json     # Architecture Manifest Descriptor Metadata
└── README.md        # Technical Engineering Specifications Documentation
```
