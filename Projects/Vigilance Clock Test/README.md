# Vigilance Clock Test // The Mackworth Clock Simulator

Vigilance Clock Test is an interactive client-side implementation of the classic Mackworth Clock experimental model, built to address the sustained human-attention simulation constraints detailed in tracking item **Issue #1028**. Designed historically during World War II to analyze the alertness profiles of radar operators over extended tracking intervals, the tool tests cognitive endurance by requiring operators to monitor a predictable linear system and rapidly flag rare, stochastic system anomalies.

---

## Technical Capabilities & Core Specifications

### 1. Minimalist Tactical HUD Scaffolding (`style.css`)

- **Strict Real Estate Viewport Constraints:** Confines all telemetry panels, action controllers, and the clock container layout inside an anti-shiver wrapper configuration (`max-width: 1200px`, `height: 760px`) to shield components from rendering anomalies on large desktop monitors.
- **Jitter-Proof Monospaced HUD Readouts:** Reaction time limits, anomaly capture ratios, missed double-jump omissions, total session seconds, and angular metrics utilize clear monospaced typography parameters (`ui-monospace, Consolas, monospace`), guaranteeing structural coordinates stay perfectly locked during numeric updates.
- **Sensory Visual Design Nodes:**
  - `#mackworth-clock-face`: Formed as a smooth concentric loop mapping 60 precise perimeter indexing slots using high-contrast mathematical radial translation vectors.
  - `.clock-marker`: Styled as a glowing amber or radar-green indicator capsule navigating the layout rim via hardware-accelerated transforms.
  - `.flash-success`: Sweeps a short translucent green neon wash across the workspace panel when an anomaly is successfully flagged.
  - `.flash-omission`: Triggers an instantaneous crimson red screen vignette pulse when a double-jump skip bypasses operator interception unregistered.

### 2. Stochastic Skip Core Physics Engine (`script.js`)

- **Trigonometric Coordinate Matrix Generator:** Rather than placing manual DOM items, the logic generates exact grid placements across a circular footprint using basic trigonometric sine and cosine conversions linked to stepping integer intervals ($\theta = i \times \frac{2\pi}{60}$):
  $$X = R \times \cos(\theta) \quad \text{and} \quad Y = R \times \sin(\theta)$$
- **Asynchronous Anomaly Probability Parser:** Runs an unyielding `setInterval` background ticker pacing standard 1000ms clock ticks. While standard operations step the active node index by exactly $1$, a pseudorandom algorithm executes an automated statistical check every step. With a low probability weight ($\approx 5\%$), it injects a double-jump step ($Index = (Index + 2) \pmod{60}$), simulating a rare radar distortion signature.
- **High-Precision Reaction Interval Tracker:** Captures exact user response transactions using high-resolution millisecond tracking timestamps (`performance.now()`). Pressing the spacebar or target button within an isolated $800\text{ms}$ execution window from the anomaly step records a positive hit; late inputs or false positives register as errors or omissions, resetting active streaks.
- **LocalStorage Milestone Retention:** Automatically serializes supreme sustained accuracy scores and reaction records to local client storage structures to retain monitoring histories.

---

## Workspace Directory Layout

```text
Vigilance Clock Test/
├── index.html       # Structural Semantic Control Panels and Radial Clock Layout Nodes
├── style.css        # Radar Aesthetic Sheet, Concentric Tracks, and Screen Flashes
├── script.js        # Trigonometric Vector Mapping, Anomaly Probability, and Timer loops
├── project.json     # Architecture Manifest Descriptor Metadata
└── README.md        # Technical Engineering Specifications Documentation
```
