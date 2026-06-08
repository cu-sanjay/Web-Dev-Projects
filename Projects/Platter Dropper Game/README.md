# Palette Dropper Game // The Tetris-Color Hybrid

Palette Dropper Game is a high-velocity arcade puzzle and strategic colometric evaluation utility built client-side to satisfy the structural grid and color filtering constraints outlined in **Issue #887**. Combining the gravitational mechanics of classic stacking blocks with shifting rule configurations, the framework tests rapid pattern classification, wavelength categorization, and logical sorting speed.

---

## Technical Capabilities & Core Specifications

### 1. Retro Arcade Grid Scaffolding (`style.css`)

- **Strict Real Estate Viewport Constraints:** Confines all telemetry panels, action headers, and vertical tubes inside a locked dashboard assembly (`max-width: 1200px`, `height: 760px`) to shield components from stretching anomalies over variable desktop monitors.
- **Jitter-Proof Monospaced HUD Panels:** Active sorting command texts, score metrics, speed multiplier tallies, and block coordinates use explicit monospaced font declarations (`ui-monospace, Consolas`), guaranteeing structural layout points stay perfectly locked during numeric mutations.
- **Component Visual Modifiers:**
  - `.drop-tube-container`: Renders a precise column mesh grid utilizing translucent glassmorphic layers backed with clean reflective borders.
  - `.color-block`: Styled with distinct high-contrast linear gradients matching standard temperature spectrum ranges.
  - `.block-vaporize`: Attached to a cell upon matching active command rules, triggering a vibrant white-neon opacity wipe animation (`@keyframes block-shatter-dissolve`) over `180ms` before splicing the node from history trackers.

### 2. Chromatic Sorting & Grid Physics Loop (`script.js`)

- **Dynamic Hexadecimal Wavelength Classifier:** Rather than parsing arbitrary color tags, the engine maps generated blocks into distinct colometric ranges. Red, Orange, and Yellow profiles register as `Warm Tones`; Blue, Cyan, and Purple elements evaluate as `Cool Tones`.
- **Continuous Velocity Gravity Tracker:** Driven natively via an adaptive `requestAnimationFrame()` clock loop. Blocks descend down the grid lanes based on a dynamic time delta ($t_{elapsed} \ge t_{velocity}$). Gravity parameters scale up systematically as total cleared lines rise, raising interaction thresholds.
- **Procedural Command State Machine:** Evaluates user mouse taps or click coordinates instantly against active instruction tags. Selecting a correct block (e.g., clicking a warm red tile while a 'Clear Warm Colors' rule binds the matrix) invokes scores, vaporizes the target node, and forces upper floating tiles to cascade downward.
- **Incursion Violation Filter:** Registering a wrong step (e.g., tapping a cool tone tile during a warm condition filter, or letting a targeted tile reach the ceiling threshold) instantly terminates active multiplier blocks, executes a grid vibration animation, and saves performance summaries.
- **LocalStorage Session Storage:** Automatically serializes supreme score ceilings and speed milestones within browser data contexts to retain user game profiles across session reloads.

---

## Workspace Directory Layout

```text
Palette Dropper Game/
├── index.html       # Structural Semantic Control Panels and Drop Chamber Nodes
├── style.css        # Arcade Neon Theme Sheets, Block Color Scales, and Vaporize Shaders
├── script.js        # Gravity Physics Loop, Wavelength Filters, and State Machine
├── project.json     # Architecture Manifest Descriptor Metadata
└── README.md        # Technical Engineering Specifications Documentation
```
