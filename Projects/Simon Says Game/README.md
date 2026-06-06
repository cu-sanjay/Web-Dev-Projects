# Simon Says // Premium Audio & Sensory Game

Simon Says is a high-fidelity, arcade-accurate sensory response memory puzzle platform. Utilizing a premium Vercel and Linear-inspired dark-mode container workspace grid, the application operates 100% within standalone browser environments relying entirely on native APIs without compilation scripts, loaders, or external libraries.

---

## Technical Capabilities & Core Specifications

### 1. Vectorized Interface Geometry & Visuals (`style.css`)

- **Dual-Column Grid Scaffolding:** Arranges administrative metrics fields and the active gameboard grid layout side-by-side within a rigid, shift-proof constraint wrapper panel (`max-width: 1200px`, `height: 780px`).
- **Jitter-Proof Monospaced Counters:** Round step trackers, scores, and historical local milestones deploy precise monospaced typography stacks (`ui-monospace`, `Consolas`), ensuring numerical elements never stutter or shift layout grids during active increments.
- **Dynamic Radial Lighting Channels:** Activating quadrants appends an explicit `.active` utility state handler. This ruleset fires a high-brightness value calculation filter mapped alongside a sharp structural CSS drop-shadow blur glow layer (`box-shadow: 0 0 30px var(--accent-color)`).
- **Pointer Protection Blocking Masks:** During Simon sequence playbacks, a temporary state wrapper toggles `pointer-events: none` across pad container layouts to prevent out-of-turn click interruptions.

### 2. Synthesized Sound & State Logics (`script.js`)

- **Zero-Asset Synth Audio (Web Audio API):** To stay dependency-free, the audio system instantiates a standalone browser `AudioContext` pipeline. It builds sound signatures on the fly using electronic wave variables set to exact musical frequencies:
  - Green Pad Node: `261.63Hz` (Middle C tone variant)
  - Red Pad Node: `293.66Hz` (D tone variant)
  - Yellow Pad Node: `329.63Hz` (E tone variant)
  - Blue Pad Node: `349.23Hz` (F tone variant)
- **Strict Memory Queue Tracking:** Uses isolated sequential arrays (`simonSequence`, `userSequence`) to validate user inputs step-by-step.
- **Error Cascade Interrupt:** If a pattern check fails, the input streams are instantly blocked, a harsh low-frequency system buzz plays, and a global crimson background flash animation state modifier is triggered before high score values are serialized to `LocalStorage`.

---

## Workspace Directory Layout

```text
Simon Says Game/
├── index.html       # Structural Semantic Arcade Interactive Nodes
├── style.css        # Layout Matrix Colors and Radial Glow Configurations
├── script.js        # Web Audio Synth and Game State Sequence Engine
├── project.json     # Architecture Manifest Descriptor Metadata
└── README.md        # Technical Engineering Specifications Documentation
```
