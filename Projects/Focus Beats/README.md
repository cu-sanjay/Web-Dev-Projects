# Focus Beats // Ambient Sound Mixer

Focus Beats is an integrated workspace utility engineered to resolve the ambient focus and countdown constraints outlined in tracking item **Issue #182**. Built entirely with standard client-side browser modules, the suite provides a jitter-free digital Pomodoro timer alongside a multi-stream synthesizer block. This configuration allows professionals to curate specialized custom background noise mixtures while tracking structured intervals.

---

## Technical Capabilities & Core Specifications

### 1. Minimalist Interface Architecture (`style.css`)

- **Strict Real Estate Viewport Constraints:** Confines all active control rows inside a layout wrapper boundary shell (`max-width: 1200px`, `height: 760px`) to prevent visual fragmentation on wide monitors.
- **Jitter-Proof Monospaced Chronometers:** Digital clocks, focus cycle chips, and active audio gain tracking percentages utilize un-skewed monospace typography declarations (`ui-monospace, Consolas, monospace`), guaranteeing structural points stay perfectly locked during numerical mutations.
- **Tactile Slide Channels:** Range track selectors (`input[type="range"]`) are stripped of native browser properties and re-styled with thin violet nodes (`#a855f7`) and highly responsive hover knobs.

### 2. Standalone Acoustic Synthesis Engine (`script.js`)

- **High-Performance Pomodoro Timeline:** Operates a precise `setInterval` tracking thread to decrement active time parameters down to absolute zero. The script manages work-to-break crossovers, triggers browser tab metadata mutations to broadcast remaining time outside the app, and triggers a clean synthesized notification chime when deadlines expire.
- **Zero-Asset Web Audio API Pipeline:** To preserve absolute zero-dependency compliance and eliminate broken external file asset links, the app hooks directly into a native browser `AudioContext` graph. Ambient channels are mathematically generated on the fly via code calculations:
  1. **White Noise Waves:** Loops randomized buffer arrays containing math variations to project stable white noise hums.
  2. **Rain Patterns:** Passes standard white noise layers through a custom low-pass filter profile, joining them to rapid gain fluctuation arrays to emulate liquid drop dynamics.
  3. **Café Chatter & Train Tracks:** Combines multiple low-frequency oscillator arrays to synthesize rhythmic structural bumps, coupled with sporadic high-passed crackle transients.
- **Fluid Audio Mixing Controls:** Range nodes track direct input events, modulating the internal `gain.value` constraints of connected sound modules smoothly without causing clicks, pops, or audio hardware pops.
- **LocalStorage Preset Caching:** Automatically serializes custom volume configurations and total completed focus cycles to local client data spaces to ensure configurations survive browser refreshes.

---

## Workspace Directory Layout

```text
Focus Beats Ambient Sound Mixer/
├── index.html       # Structural Semantic Control Panels and Slider Nodes
├── style.css        # Minimalist Dark-Mode Sheets, Range Tracks, and Typography Locks
├── script.js        # Pomodoro Intervals and Mathematical Web Audio Synthesis Engine
├── project.json     # Architecture Manifest Descriptor Metadata
└── README.md        # Technical Engineering Specifications Documentation
```
