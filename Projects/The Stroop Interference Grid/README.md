# The Stroop Interference Grid // Cognitive Control

The Stroop Interference Grid is a high-fidelity psychological focus simulator built to address the attention-training constraints outlined in **Issue #745**. By continuously tasking users to override their immediate reading impulses and evaluate stimulus mismatch states, the platform trains selective focus and fluid override execution under severe time limits. Built entirely client-side using native modern web specifications.

---

## Technical Capabilities & Core Specifications

### 1. Visual Scaffolding & Theme Geometry (`style.css`)

- **Strict Real Estate Viewport Constraints:** Anchors all control decks inside an anti-shiver container frame (`max-width: 1200px`, `height: 760px`) to prevent structural degradation across fluctuating display resolutions.
- **Jitter-Proof Monospaced Typography Docks:** Countdown loading indicators, active rule headers, current scores, and record milestones use dedicated monospaced font declarations (`ui-monospace`, `Consolas`), ensuring data updates cause zero layout jitter.
- **Component Utility States:** \* `.color-target-btn`: Elegant, responsive tile buttons hosting hidden index assignments that map a balanced, high-contrast accessible hexadecimal color palette.
  - `.grid-shake`: Attached globally to the playground node stack to execute a violent keyframe vibration animation sequence (`@keyframes grid-shake`) when input mismatches or clock expirations hit.

### 2. Random Shuffling & Evaluation Pipelines (`script.js`)

- **Combinatorial Mismatch Generator:** Iterates the core configuration pool to generate asymmetric target variables where the word string value explicitly mismatches its element text ink styling (e.g., text displays "RED" inside a vibrant emerald green background vector).
- **Fisher-Yates Position Scrambler:** To break muscle memory adaptations, a shuffle routine randomizes button assignments inside `#target-grid` completely every round.
- **High-Speed Clock Interpolator:** Tracks a precise `2000ms` round constraint window via a `requestAnimationFrame` loop, binding clock progress to a smooth visual loading bar track.
- **Acoustic Feedback Synthesis (Web Audio API):** Leverages a native browser `AudioContext` graph to generate synthesized electronic wave alerts on the fly, avoiding broken external MP3/WAV media path dependencies.

---

## Workspace Directory Layout

```text
The Stroop Interference Grid/
├── index.html       # Structural Semantic Dashboard Layout and Stimulus Nodes
├── style.css        # Shuffled Keypad Layout, Color Pools, and Matrix Vibrations
├── script.js        # High-Speed Countdown Timer and Fisher-Yates Scramble Engine
├── project.json     # Architecture Manifest Descriptor Metadata
└── README.md        # Technical Engineering Specifications Documentation
```
