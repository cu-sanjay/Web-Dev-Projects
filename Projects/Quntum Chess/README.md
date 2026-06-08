# Quantum Micro-Chess // Superposition Variant

Quantum Micro-Chess is an experimental tactics engine mapping core principles of quantum physics onto a constrained 4x4 matrix landscape. By allowing game units to occupy dual-probability coordinates concurrently, the application replaces deterministic look-ahead mechanics with probability density and localized wavefunction collapses. The ecosystem operates entirely on client-side layers via native HTML5 grid models, neon CSS shaders, and raw vanilla JavaScript logic algorithms.

---

## Technical Capabilities & Core Specifications

### 1. Neon Aesthetic Scaffolding (`style.css`)

- **Strict Viewport Containment Framework:** Binds all structural rendering wrappers within a tactile dashboard interface footprint (`max-width: 1200px`, `height: 760px`) to shield components from grid collapsing anomalies across varying client resolutions.
- **Jitter-Proof Monospaced HUD Panels:** Turn indicators, real-time matrix logs, game ending condition alerts, and state trackers implement explicit monospaced font declarations (`ui-monospace`, `Consolas`), ensuring state mutations cause zero structural layout shift.
- **Sensory Component Visual Modifiers:**
  - `.matrix-cell.superposition-pulse`: Applies an alternate semi-transparent translucent backing color coupled to a high-visibility pulsing CSS loop (`@keyframes wave-glow`) to highlight cell coordinates holding split pieces.
  - `.matrix-cell:hover`: Leverages smooth hardware-accelerated translation variables to provide tactile cursor feedback transitions.

### 2. Micro-Chess Quantum Engine (`script.js`)

- **Dual-Reality State Matrix Mapping:** Represents the 4x4 board space internally using a multidimensional array structure. Each node contains standalone objects managing tracking fields:
  - `True State`: Holds definitive, collapsed chess unit identities.
  - `Quantum State`: Encodes reference pairings linking parallel split coordinates during superposition stages.
- **Algorithmic Wavefunction Collapser:** When a piece trapped inside a superposition layout is directly targeted by an opponent, or attempts to make a standard capture move, the engine runs a localized 50% probability client-side calculation (simulating a quantum flip). The piece instantly drops its phantom footprint on one tile and condenses permanently onto the other target coordinate.
- **Microscale Move Validation Trees:** Custom programmatic parsing validation pathways built from scratch for a restricted tactical variant subset:
  - **Kings [♔/♚]:** Radial 1-step displacements.
  - **Rooks [♖/♜]:** Linear orthogonal vectors.
  - **Knights [♘/♞]:** Asymmetric L-shaped leaps bypassing intervening block impediments.
  - **Pawns [♙/♟]:** Single forward march steps joined to forward-diagonal capture vectors.
- **True State King Capture Resolution:** Evaluates victory conditions or draw state markers based strictly on the definitive collapsed positions of Kings, instantly blocking matrix pointer access loops when an end-game state settles.

---

## Workspace Directory Layout

```text
Quantum Micro-Chess/
├── index.html       # Structural Viewport Framing and HUD Indicators
├── style.css        # CSS Matrix Grid Configuration and Pulsing Visual Shaders
├── script.js        # Multidimensional State Matrix and Wavefunction Collapse Engine
├── project.json     # Architecture Manifest Descriptor Metadata
└── README.md        # Technical Engineering Specifications Documentation
```
