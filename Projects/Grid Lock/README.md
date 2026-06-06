# Grid-Lock // Premium Target-Sum Matrix

Grid-Lock is a high-fidelity mental agility mathematical puzzle framework. Featuring a premium dark-mode dashboard workspace inspired by Vercel and Linear.app, the system challenges players to calculate arithmetic solutions inside a dynamic 4x4 matrix while complying with automated rule boundaries. It executes entirely client-side using semantic HTML5, clean custom CSS custom properties, and modern vanilla JavaScript (ES6+).

---

## Technical Capabilities & Core Specifications

### 1. Vector Workspace Scaffolding (`style.css`)

- **Strict Resolution Bound Constraint:** Binds all visual containers within an anti-shiver layout shell (`max-width: 1200px`, `height: 760px`) to prevent rendering breakdown across varying viewport monitors.
- **Jitter-Proof Monospaced Grids:** Target sums, numerical grid digits, combo counters, and countdown clocks use explicit monospaced font declarations (`ui-monospace`, `Consolas`), ensuring text mutations cause zero spatial layout shift.
- **Component Utility States:** \* `.matrix-tile.selected`: Applies a prominent violet backlight mask joined to an active inner box-glow highlight (`box-shadow: 0 0 16px var(--accent-violet)`).
  - `.matrix-tile.fade-out`: Scales card items down to `0` and transitions opacity settings over `250ms` on valid matches.
  - `.matrix-tile.shake`: Fires a high-speed horizontal keyframe vibration template (`@keyframes tile-shake`) upon rule violations or invalid sums.

### 2. Matrix Validation & Drop Cascades (`script.js`)

- **Target and Constraint Parser:** Programmatically samples possible arithmetic permutations from current tile variables to guarantee solvable equations, accompanied by randomized structural filtering constraints:
  1. "Select exactly X blocks" (where X evaluates to 2 or 3)
  2. "Select only even numbers"
  3. "Select only odd numbers"
  4. "No restrictions (Standard sum matching)"
- **Gravity Column Cascade Algorithm:** Upon successful group clears, the script sweeps the board data array column-by-column from row index 3 up to 0. It programmatically slides remaining high-index numbers down to occupy empty index boundaries, feeds fresh pseudo-random digits (1-9) into the top nodes, and injects clean translation paths to update the DOM tree.
- **LocalStorage Session Retention:** Synchronizes historical score ceilings and multipliers natively within the client browser storage engine to preserve statistics across reloads.

---

## Workspace Directory Layout

```text
Grid-Lock Game/
├── index.html       # Structural Semantic Matrix Node Wireframes
├── style.css        # Dashboard Grid color definitions and Card Vibrations
├── script.js        # Constraint Matching and Column Gravity Cascade Engine
├── project.json     # Architecture Manifest Descriptor Metadata
└── README.md        # Technical Engineering Specifications Documentation
```
