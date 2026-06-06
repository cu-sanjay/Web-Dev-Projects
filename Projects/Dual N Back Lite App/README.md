# Dual N-Back Lite // Working Memory Booster

Dual N-Back Lite is a high-fidelity cognitive simulation framework built to satisfy the focus-training specifications outlined in tracking item **Issue #748**. Famously scientifically proven to increase working short-term memory capacity and expand fluid intelligence, the system challenges users to monitor independent visual and auditory stream loops simultaneously, checking for match events exactly $N$ steps backward in execution history.

---

## Technical Capabilities & Core Specifications

### 1. Unified Dashboard Architecture (`style.css`)

- **Strict Resolution Real Estate Constraints:** Confines all visual components within an anti-jitter panel wrapper (`max-width: 1200px`, `height: 760px`) to shield grid nodes from layout compression anomalies across varying client monitors.
- **Typographic Structural Stability:** Selection parameters, history trial counters, accuracy metrics, and digital scoring badges utilize a clean monospaced font stack assembly (`ui-monospace`, `Consolas`), preventing text dimensions from causing layout jumps when data states alter dynamically.
- **Sensory Component Visual Modifiers:**
  - `.grid-cell.active-flash`: Appends a bright blue backlight accompanied by an active box-shadow outer bloom glow (`box-shadow: 0 0 24px #3b82f6`) marking a spatial tracking node trigger.
  - `.audio-prompt-box.active-flash`: Fires a violet boundary highlight indicating a simultaneous auditory step injection.
  - `.match-success`: Triggers an instantaneous emerald green background flash upon correct verification inputs.
  - `.match-failure`: Triggers a crimson red border pulse upon incorrect input sequences or missed target windows.

### 2. Algorithmic Rolling Memory Buffers (`script.js`)

- **Bounded Historical Queue Pipeline:** Tracks testing sequences using a continuous JavaScript array buffer matrix. Each trial pushes an integrated snapshot pair—encoding an integer coordinate mapping position ($0$ through $8$) and a string literal letter character—while keeping a tight slice constraint bounded precisely to the chosen $N$ difficulty parameter (e.g., $1$-Back, $2$-Back, or $3$-Back).
- **Zero-Asset Audio Tone Synthesizer:** To preserve absolute zero-dependency compliance and eliminate broken external file path constraints, the application instantiates a native browser `AudioContext` graph. Every time a new letter asset registers, the engine synthesizes distinct electronic audio tone frequencies on the fly using standard mathematical sine wave oscillators:
  - Letter "A" Maps to $440.00\text{ Hz}$
  - Letter "F" Maps to $349.23\text{ Hz}$
  - Letter "Q" Maps to $293.66\text{ Hz}$
  - Letter "R" Maps to $392.00\text{ Hz}$
- **High-Frequency Input Interceptors:** Attaches event listener nodes monitoring physical mouse click paths as well as native alphanumeric keyboard keystrokes mapped directly to target verification shortcuts:
  - Key `A`: Triggers spatial position match verification routines.
  - Key `L`: Triggers audio/letter match verification routines.
- **Evaluation Core Equations:** Validates user button responses during the fixed 2-second trial window against queue positions:
  $$\text{Current State} \equiv \text{Buffer History}[\text{Current Index} - N]$$
  Unchecked target windows automatically register as match omissions, decreasing overall accuracy metrics.

---

## Workspace Directory Layout

```text
Dual N-Back Lite/
├── index.html       # Structural Semantic Control Panels and Matrix Node Layouts
├── style.css        # Polycarbonate Mesh Scaffolding and Glow Modification Rules
├── script.js        # Bounded Rolling History Buffer and Web Audio Synthesis Engine
├── project.json     # Architecture Manifest Descriptor Metadata
└── README.md        # Technical Engineering Specifications Documentation
```
