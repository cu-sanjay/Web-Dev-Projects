# CSS Domino Builder // 3D Kinetic Cascade Sandbox

CSS Domino Builder is an interactive web blueprint environment built to address the animation matrix requirements tracked in **Issue #184**. The application enables users to map, align, and trigger complex cascading chains of falling dominoes entirely driven by modern web layout structures, vanilla proximity algorithms, and hardware-accelerated 3D CSS transform boundaries.

---

## Technical Capabilities & Core Specifications

### 1. 3D Architectural Sandbox Scaffolding (`style.css`)

- **Locked Resolution Workspace Bounds:** Encapsulates the entire sandbox structure inside an anti-shiver container frame (`max-width: 1200px`, `height: 760px`) to shield grid layout systems from viewport stretching anomalies across high-end desktop monitors.
- **Tactile Engineering Blueprint Grid:** Utilizes intersecting pure CSS background linear-gradients to form a crisp, responsive layout grid matrix with smooth hover highlights over open cell nodes.
- **3D Perspective Domino Objects:** Styles individual cards with explicit structural perspective parameters (`transform-style: preserve-3d`, `backface-visibility: hidden`).
- **Directional Topple Animations:** Features dedicated modifier classes wrapping localized transform origins focused at the precise base edge profiles of cards to drive real-time toppling rotations:
  - `.topple-up`: Rotates negative coordinates along the X-axis around a `transform-origin: bottom center`.
  - `.topple-down`: Rotates positive coordinates along the X-axis around a `transform-origin: top center`.
  - `.topple-left`: Rotates negative coordinates along the Y-axis around a `transform-origin: bottom left`.
  - `.topple-right`: Rotates positive coordinates along the Y-axis around a `transform-origin: bottom right`.

### 2. Proximity Chain Validation Engines (`script.js`)

- **Grid Coordinate State Tracking:** Tracks sandboxed items using an internal index map matrix. Clicking cells initializes custom object profiles storing coordinate properties, background theme colors, and intended fallback vector parameters (Up, Down, Left, Right).
- **Dynamic Waterfall Cascade Engine:** Clicking "TRIGGER CHAIN" scans for the starting point, initiating a calculated timing delay loop (`setTimeout`). The script parses adjacent cells along the path using delta search matrices ($Row + \Delta x, Col + \Delta y$) corresponding to the element's vector property.
- **Sequential Animation Class Injection:** Upon confirmation of valid neighbor intersections, the tracking script appends appropriate `.topple-*` classes down the branch chain sequentially, ensuring a smooth, rhythmically synced visual waterfall cascade.
- **Workspace Cleanup Pipeline:** Provides zero-residual board sweeps when a reset is fired, safely unmounting active animation classes and restoring blocks back to standing parameters for instant redevelopment loops.

---

## Workspace Directory Layout

```text
CSS Domino Builder/
├── index.html       # Structural Semantic Blueprint Canvas and Control Panels
├── style.css        # Engineering Grid Schemes, 3D Rotations, and Topple Profiles
├── script.js        # Proximity Matrix Search and Sequential Cascade Class Injector
├── project.json     # Architecture Manifest Descriptor Metadata
└── README.md        # Technical Engineering Specifications Documentation
```
