# Corsi Block Tapper // The Spatial Span Test

Corsi Block Tapper is a high-fidelity visual short-term memory assessment platform built entirely client-side to satisfy the cognitive mapping and asymmetric arrangement criteria outlined in **Issue #1028**. Replicating standardized clinical psychological paradigms, the utility measures visuospatial memory span lengths by tasking operators with observing, retaining, and matching non-verbal sequential location chains across an un-aligned coordinate field.

---

## Technical Capabilities & Core Specifications

### 1. Minimalist Spatial Scaffolding (`style.css`)

- **Strict Real Estate Layout Bounds:** Confines all telemetry panels, recall status bars, block fields, and option selectors inside an anti-shiver panel wrapper (`max-width: 1200px`, `height: 760px`) to prevent visual component displacement over varied desktop monitors.
- **Jitter-Proof Monospaced Dashboard Readouts:** Target loop indexes, active span levels, maximum score logs, reaction timers, and validation arrays map onto clear monospaced typography parameters (`ui-monospace, Consolas`), ensuring state data updates trigger zero layout shifts.
- **Tactile Component Shaders:**
  - `.corsi-block`: Nine identical deep-blue rectangular cards arranged in a fixed, non-aligned layout.
  - `.block.active-flash`: Injects a glowing neon-cyan background overwrite accompanied by an intense outer bloom box shadow (`box-shadow: 0 0 20px #60a5fa`) indicating automated system playback steps.
  - `.block.player-selected`: Provides immediate amber light responses during input collection phases.
  - `.container.shake-error`: Triggers an instantaneous full-grid horizontal vibration transformation keyframe (`@keyframes layout-vibrate`) on input mismatches or out-of-order recall steps.

### 2. Sequential Playback & Array Processing Logic (`script.js`)

- **Asymmetric Coordinate Scatter Constraint:** Anchors elements using hardcoded pixel index deltas to form an intentionally scattered, messy visual array. This breaks linear scanning paths and blocks structural grid memorization shortcuts, isolating non-verbal memory testing parameters.
- **Progressive History Queue Buffer:** Sequence lengths increment sequentially ($L_{span} = 2, 3, 4, \dots$) upon successful recall iterations. The logic generates target trails by sampling randomized integers corresponding to the indices of the 9 blocks:
  $$\text{Target Sequence Queue} = [ \text{Node}_i, \text{Node}_j, \dots, \text{Node}_n ]$$
- **Asynchronous Timeline Playback Loop:** Manages sequence display routines via synchronized code blocks (`async/await` paired with timing promises). The script highlights each node in the sequence queue for `1000ms`, separated by a sterile `500ms` intermission delay where all tiles return to resting configurations.
- **Input Validation Queue Evaluator:** Intercepts player interaction steps during the recall window. It logs taps against a localized temporary queue array, continuously verifying matches step-by-step:
  $$\text{Input Snapshot}[k] \equiv \text{Target Sequence Queue}[k]$$
  Any mis-ordered interaction sets off error indicators immediately, aborts the current session, registers the final short-term visuospatial capacity index, and updates historical scores.
- **LocalStorage Metrics Retention:** Records high-score ceiling parameters natively within client browser storage strings to preserve user testing histories.

---

## Workspace Directory Layout

```text
Corsi Block Tapper/
├── index.html       # Structural Semantic Dashboard Layout and 9 Spatial Block Nodes
├── style.css        # Minimalist Dark Sheet, Glowing Block Shaders, and Shake Animations
├── script.js        # Asynchronous Playback Timelines, Queue Verification, and Storage Hooks
├── project.json     # Architecture Manifest Descriptor Metadata
└── README.md        # Technical Engineering Specifications Documentation
```
