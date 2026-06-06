# Neon Cyber-Cycles // Tron-Inspired Arcade Variant

Neon Cyber-Cycles is a hardware-accelerated 2D vector playground game built entirely on client-side browser technologies. Heavily inspired by the classic retro-futuristic arcade aesthetic, the implementation maps fluid sub-pixel positioning systems, continuous coordinate tracking arrays, and autonomous predictive evasion trees to create a challenging environment testing algorithmic pathfinding speed.

---

## Technical Capabilities & Core Specifications

### 1. Retro Neon Scaffolding (`style.css`)

- **Strict Real Estate Scaling Bounds:** Anchors all visual viewports and control panels securely inside a centered, jitterless dashboard assembly (`max-width: 1200px`, `height: 760px`) preventing flexbox distortion on varied desktop resolutions.
- **Tron Cyber Aesthetics:** Uses deep dark canvas background matrices (`#0a0a12`) accented with intense CSS drop-shadow bloom glow styles applied across the HUD panels and canvas borders.
- **Arcade Typography Stability:** Digital scoreboard panels, high-frequency vector coordinates, system status tickers, and game control lists utilize an un-skewed monospace typography assembly (`ui-monospace, Consolas, monospace`), guaranteeing layout structural points stay perfectly locked during numerical mutations.

### 2. Hardware-Accelerated Vector Engine (`script.js`)

- **Continuous Sub-Pixel Game Loop:** Powered natively via high-frequency `requestAnimationFrame()` iteration hooks instead of standard grid-cell tile stepping timers, allowing fluid velocity calculations and precise positional scaling updates.
- **Precise Boundary & Trail Collision Detection:** Rather than basic bounding box tests, the logic tracks player coordinates across history coordinate path stacks. A terminal crash state triggers instantly if a lightcycle intersection vector hits:
  1. Outer boundary display pixels ($X < 0 \parallel X > Width \parallel Y < 0 \parallel Y > Height$)
  2. Coordinates tracked inside its own trailing array vector history list
  3. Coordinates tracked inside the opponent's trailing array vector history list
- **Predictive Autonomous AI Pathfinding Trajectory:** The AI script integrates forward scanning line segment vectors mapping its current velocity trajectory. When an imminent intersection threshold is tracked ahead (with walls or light trails), the engine autonomously branches vector direction loops, selecting alternative routes that optimize self-preservation while boxing in user coordinates.
- **State Resets & Score Retention:** Manages round terminal operations instantly upon intersection validation, isolating user input captures, flashing failure indicators, incrementing record indexes, and awaiting manual spacebar input hooks to reset the canvas board coordinate arrays.

---

## Workspace Directory Layout

```text
Neon Cyber-Cycles/
├── index.html       # Structural Semantic Arcade Shell and HUD Components
├── style.css        # Tron Cyber Aesthetic Sheets, Color Variables, and Glow Masks
├── script.js        # Hardware-Accelerated Canvas Engine and Predictive AI Controller
├── project.json     # Architecture Manifest Descriptor Metadata
└── README.md        # Technical Engineering Specifications Documentation
```
