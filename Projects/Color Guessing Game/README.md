# Chromance // Premium RGB Color Guessing Game

Chromance is a high-fidelity gamified educational platform built to fulfill the requirements specified under repository issue tracking **Issue #107**. The system provides a real-time challenge requiring users to analyze standard `rgb(R, G, B)` string variables and choose matching visual hex/color vectors from a grid. Engineered completely within native standalone frameworks using semantic HTML5, pure client-side custom CSS properties, and modular ES6+, it executes with zero compilation overhead.

---

## Technical Capabilities & Core Specifications

### 1. Adaptive Workspace Matrix Grid (`style.css`)

- **Strict Layout Resolution Constraints:** Encapsulates design real estate parameters inside a locked dashboard view workspace container (`max-width: 1200px`, `height: 760px`) preventing visual layout breaking down when rescaled across varying viewports.
- **Typographical Vector Calibration:** Target value blocks displaying target color configurations, active streaks, and round counters deploy an explicit monospaced font family assembly (`ui-monospace`, `Consolas`), ensuring numeric indices updates happen seamlessly without causing structural component jitter.
- **Interactive Tile State Handlers:** \* Mismatch Choice: `.incorrect` handles incorrect user click inputs by triggering a quick shake keyframe sequence and smoothly dropping opacity layer dimensions down to `0` to remove the tile from the grid area.
  - Correct Choice: `.correct` locks user interactive points (`pointer-events: none`) and flashes the targeted card element using a sharp neon glow border highlighting the winning tile profile.

### 2. Random Algorithmic Matrix Engine (`script.js`)

- **Mathematical Channel Color Injection:** Utilizes a standard pseudo-random number generation logic stream ($Channel_{Val} = \lfloor Math.random() \times 256 \rfloor$) to generate three distinct value parameters mapping standard Red, Green, and Blue indices configurations.
- **Multi-Scale Density Scaling:** Dynamic handlers map and alter layout arrays matching difficulty parameters. Switching profiles scales the `#color-grid` layout container structure seamlessly between a 3-tile grid (Easy) and a 6-tile grid (Hard).
- **LocalStorage Session Permanence:** Synchronizes ongoing streak metrics directly into client-side browser storage layers to retain milestones across browser reloads.

---

## Workspace Directory Layout

```text
Color Guessing Game/
├── index.html       # Structural Semantic Dashboard Layout Nodes
├── style.css        # Typography Stability and Card Shift Animations
├── script.js        # Color Channel Generation and Match Evaluation Engine
├── project.json     # Architecture Manifest Descriptor Metadata
└── README.md        # Technical Engineering Specifications Documentation
```
