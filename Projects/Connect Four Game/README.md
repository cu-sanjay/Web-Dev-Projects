# Connect Four // Premium Algorithmic Board Matrix

Connect Four is a high-fidelity interactive browser implementation of the classic gravity-drop token connection puzzle built to fulfill the structural demands of repository tracking item **Issue #113**. Featuring a sleek workspace dashboard dashboard layout inspired by Vercel and Linear.app, this project serves as an advanced educational showcase for 2D multi-dimensional array traversals, win-condition vector testing, and clean interface style states.

---

## Technical Capabilities & Core Specifications

### 1. Mesh Grid Scaffolding & Component Design (`style.css`)

- **Strict Real Estate Bounds Constraint:** Encompasses all visual components within an anti-shiver panel wrapper container (`max-width: 1200px`, `height: 780px`) to shield grid layout systems from viewport skewing anomalies.
- **Typographical Vector Safety:** Match results dashboards, timers, tracking steps, and turn counters employ dedicated monospaced font declarations (`ui-monospace`, `Consolas`), ensuring text shifts never cause physical layout shivering during real-time data changes.
- **Token Overlay Modifiers:**
  - `.player-one`: Injects an active crimson disc token featuring a rich layered radial glow scheme (`#ef4444`).
  - `.player-two`: Injects an active amber yellow disc token with metallic radial highlights (`#f59e0b`).
  - `.winning-cell`: Triggers a distinct concentric edge highlight mask joined to an active animation pulse state channels keyframe loop (`@keyframes winning-pulse`).

### 2. Multi-Dimensional Array Validation Pipelines (`script.js`)

- **Data Model Ingestion Map:** Tracks game parameters through an internal board array mapping a 6-row by 7-column grid structure matrix ($6 \times 7$). Empty locations read as `0`, Player 1 coordinates mark as `1`, and Player 2 indices evaluate as `2`.
- **Gravity Drop Column Scanner:** Tapping or targeting columns prompts a downward structural check indexing rows from index 5 down through to 0 to identify the lowest available data slot coordinates, appending player tokens smoothly while enforcing column limits.
- **Rigid Win-Condition Testing Vectors:** Following every input step event, a multi-directional scanning validator sweeps arrays tracking index sequences to check for four identical values in a row across four distinct directional offsets:
  1. Horizontal sequences: `[row][col]` to `[row][col+3]`
  2. Vertical sequences: `[row][col]` to `[row+3][col]`
  3. Diagonal-Up sequences: `[row][col]` to `[row+3][col+3]`
  4. Diagonal-Down sequences: `[row][col]` to `[row+3][col-3]`
- **Interaction Lock Overlay:** Upon confirmation of a winning pattern match vector, the interface attaches a global `.locked` utility state disabling input events during highlight renders.

---

## Workspace Directory Layout

```text
Connect Four/
├── index.html       # Structural Semantic Board Matrix Markup Nodes
├── style.css        # Polycarbonate Mesh Layout and Neon Token Pulsing Rules
├── script.js        # Multi-Directional Array Vector Win-Condition Checking Engine
├── project.json     # Architecture Manifest Descriptor Metadata
└── README.md        # Technical Engineering Specifications Documentation
```
