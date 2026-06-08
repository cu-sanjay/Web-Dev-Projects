# Chimp Memory Matrix // The Ayumu Primate Test

Chimp Memory Matrix is a high-fidelity spatial short-term working memory simulation framework built entirely client-side to satisfy the strategic path tracking and instant blanking criteria outlined in **Issue #886**. Modeled directly after the iconic Kyoto University primate cognitive research, the platform challenges users to compete against the exceptional visual memory limits displayed by chimpanzees by reconstructing numerical sequences after spatial data fields turn completely blank.

---

## Technical Capabilities & Core Specifications

### 1. Minimalist Research Grid Scaffolding (`style.css`)

- **Strict Resolution Viewport Bounds:** Encompasses all analytical HUD modules, metric subscales, and grid layout matrices inside an anti-shiver footprint (`max-width: 1200px`, `height: 760px`) protecting design layouts from flexing distortion on high-resolution desktop monitors.
- **Jitter-Proof Monospaced HUD Readouts:** Target sequence steps, current level streaks, maximum research milestones, and card indices utilize un-skewed monospace typography declarations (`ui-monospace, Consolas, monospace`), guaranteeing structural coordinates stay perfectly locked during numeric updates.
- **Interactive Component Visual Modifiers:**
  - `.matrix-tile`: High-tech dark grid squares that populate random positions with high-contrast digits upon generation passes.
  - `.tile.blanked-mask`: Triggered instantaneously across all coordinates the millisecond node "1" is activated, overriding display data with solid white masks using hardware-accelerated rendering transitions.
  - `.matrix-grid.shake-lockout`: Fires a rapid horizontal keyframe shake vibration template (`@keyframes block-vibrate`) upon sequence tracking errors or out-of-order selection indices.

### 2. Random Placement & Sequential Masking Logic (`script.js`)

- **Asymmetric Coordinate Distribution Matrix:** Programmatically distributes numbers 1 through 9 across random un-duplicated cells within a multi-column coordinate container grid. This prevents positional block clusters and forces pure spatial working memory mapping.
- **Instantaneous Blanking State Engine:** Monitors cursor tap parameters during execution. Tapping cell "1" instantly shifts the state machine, altering global CSS custom utility bindings to overwrite active text node variables with sterile white overlays, testing the operator's mental trace snapshot.
- **Incremental Path Reconstruction Evaluator:** Captures cell click vectors sequentially, continuously comparing input logs against a strict incremental validation queue ($1 \rightarrow 2 \rightarrow 3 \rightarrow \dots \rightarrow 9$):
  $$\text{Input Snapshot}[n] \equiv \text{Expected Sequence Element}[n]$$
  Successfully clearing the sequence up to block 9 advances the tier difficulty by shrinking initial digit display timers, whereas an out-of-order interaction immediately triggers lockout animation sequences, clears active streaks, and caches metrics.
- **LocalStorage Milestone Retention:** Automatically serializes supreme level thresholds and tracking achievements to local client storage structures to retain monitoring histories.

---

## Workspace Directory Layout

```text
Chimp Memory Matrix/
├── index.html       # Structural Semantic Research Core and Matrix Grid Layout Nodes
├── style.css        # Minimalist Lab Sheet, Blanking Masks, and Shake Lockouts
├── script.js        # Coordinate Shuffle, Instant Blanking Engine, and Validation Loops
├── project.json     # Architecture Manifest Descriptor Metadata
└── README.md        # Technical Engineering Specifications Documentation
```
