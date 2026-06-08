# Simon Auditory Recall // Symphonic Sequence Recall

Simon Auditory Recall is a high-fidelity audio-spatial short-term memory assessment platform designed client-side to satisfy the acoustic sequencing and zero-dependency compliance criteria detailed in **Issue #262**. Shifting away from basic visual match setups, the suite emphasizes tone retention thresholds and localized auditory coordinates, tasking users to replicate expanding harmonic sound streams synthesized natively via the browser.

---

## Technical Capabilities & Core Specifications

### 1. Minimal Monochromatic Scaffolding (`style.css`)

- **Strict Real Estate Viewport Constraints:** Anchors all analytical dashboards, focus chips, and target soundboards inside an anti-shiver panel footprint (`max-width: 1200px`, `height: 760px`) to shield grid nodes from stretching anomalies across high-end monitors.
- **Jitter-Proof Monospaced Typography Locks:** Sequence length values, current matching steps, peak history data trackers, and target audio frequency strings utilize explicit monospaced font declarations (`ui-monospace, Consolas, monospace`), guaranteeing structural coordinates stay perfectly locked during numeric updates.
- **Tactile Component Shaders:**
  - `.sound-pad`: Four elegant, muted monochromatic trigger blocks featuring clean transitions on hover actions.
  - `.sound-pad.system-playing`: Injects an instantaneous high-contrast white overlay coupled with an intense box-shadow bloom glow (`box-shadow: 0 0 24px #ffffff`) to track active tone streaming parameters.
  - `.sound-pad.input-error`: Triggers a sudden crimson red pulse sequence if an out-of-order user interaction registers.

### 2. Standalone Web Audio API Synthesizer (`script.js`)

- **Zero-Asset Waveform Oscillator Graph:** Bypasses bulk media downloads or broken external file paths by instantiating a native browser `AudioContext` timeline pool. The application generates individual instrumental pitches on the fly using standard mathematical sine wave oscillators mapping fixed frequencies:
  - Pad Index 0 (Middle C): $261.63\text{ Hz}$
  - Pad Index 1 (E Note): $329.63\text{ Hz}$
  - Pad Index 2 (G Note): $392.00\text{ Hz}$
  - Pad Index 3 (A Note): $440.00\text{ Hz}$
- **Asynchronous Timeline Sequential Streamer:** Leverages recursive promise trackers (`async/await` loops) to execute sequential audio-visual playback passes. The system schedules each sequence node to flash and play for a duration of $600\text{ms}$, separated by a fixed $300\text{ms}$ silence padding threshold to separate tone boundaries.
- **Auditory Input Validation Queue:** Listens for mouse clicks and coordinate input steps during the user selection window. Taps populate an internal response queue that is continually cross-checked against the main tracking history array:
  $$\text{User Selection Buffer}[m] \equiv \text{System Sequence History}[m]$$
  Any structural step violation immediately triggers an error sequence, breaks the active session thread, maps final acoustic memory span scores, and saves record statistics.
- **LocalStorage Milestone Caching:** Synchronizes historical focus ceilings and streak records within browser-native datasets to maintain data profiles.

---

## Workspace Directory Layout

```text
Simon Auditory Recall/
├── index.html       # Structural Semantic Control Panels and 4 Monochromatic Soundboards
├── style.css        # Monochromatic Studio Sheet, Reverb Shaders, and Typography Shields
├── script.js        # Web Audio Tone Synthesizer, Asynchronous Timelines, and State Logs
├── project.json     # Architecture Manifest Descriptor Metadata
└── README.md        # Technical Engineering Specifications Documentation
```
