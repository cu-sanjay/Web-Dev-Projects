# Block-Stack Matrix // Drop-Line Cleansing

Block-Stack Matrix is a high-fidelity glassmorphic strategic tile puzzle simulation built to satisfy the computational geometry constraints outlined in tracking item **Issue #178**. By tasking users with real-time coordinate translation, multi-dimensional array mapping, and continuous gravity processing, the system functions as an advanced frontend exercise in deterministic layout calculations.

---

## Technical Capabilities & Core Specifications

### 1. Glassmorphic Viewport Scaffolding (`style.css`)

- **Strict Real Estate Bounds Constraint:** Encompasses all interactive layouts inside a locked panel wrapper (`max-width: 1200px`, `height: 760px`) to shield structural rows from flexing distortion over high-resolution monitors.
- **Jitter-Proof Monospaced HUD Panels:** Scoreboards, line cleansing tallies, falling speed trackers, and upcoming structure queues utilize explicit monospaced font declarations (`ui-monospace`, `Consolas`), ensuring state mutations cause zero structural layout shift.
- **Tactile Translucent Components:**
  - `.matrix-tube`: The vertical play corridor applies a crisp glassmorphic backdrop with micro-reflective linear borders (`background: rgba(255, 255, 255, 0.03)`, `backdrop-filter: blur(12px)`).
  - `.tile-block`: Styled with distinct high-contrast gradient textures mapping individual geometric cluster characters (I, J, L, O, S, T, Z pieces).
  - `.cleansing-flash`: Attached to cells when a solid row is detected, triggering an intense white neon opacity keyframe loop (`@keyframes cell-fade-wipe`) over `200ms` prior to row splicing.

### 2. Multi-Dimensional Geometry Processing (`script.js`)

- **The Playing Grid Matrix:** Operates an internal 2D array representation containing 20 rows by 10 columns ($20 \times 10$). Active indices store numerical flags identifying block colors, while open spaces read as `0`.
- **Matrix Rotation Axis Algorithm:** Up-arrow or custom rotational actions map geometry arrays around a central axis index. The system transposes columns and reverses row directions mathematically:
  $$\text{Rotated}[i][j] = \text{Original}[\text{Max\_Row} - j][i]$$
  If a provisional rotation step overlaps with existing blocks or steps past side walls, the engine runs an immediate recovery fallback step to discard the mutation.
- **Continuous Downward Velocity Loop:** Driven cleanly via an adaptive `requestAnimationFrame` clock tracker matching game ticks. The system slides active assemblies downward based on a dynamic time delta ($t_{elapsed} \ge t_{threshold}$). Dropping speed bounds increase linearly as cumulative cleared rows rise.
- **Solid Drop-Line Splicing Check:** Following block lock-in, the engine scans the 2D array from bottom to top. Rows containing zero open spaces (`0`) are sliced completely from the board state history array, prompting an immediate downward cascade of upper elements while prepending blank rows at index `0`.
- **LocalStorage Milestone Caching:** Serializes supreme score thresholds and configurations within browser-native data tracks to maintain historical profiles over window resets.

---

## Workspace Directory Layout

```text
Block-Stack Matrix/
├── index.html       # Structural Semantic Board Matrix Markup Nodes
├── style.css        # Glassmorphic Sheets, Block Color Scales, and Cleansing Flashes
├── script.js        # Matrix Rotation, Boundary Check, and Gravity Cascade Engine
├── project.json     # Architecture Manifest Descriptor Metadata
└── README.md        # Technical Engineering Specifications Documentation
```
