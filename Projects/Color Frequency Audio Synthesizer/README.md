# Color Frequency Audio Synthesizer

An interactive audio synthesis laboratory mapping the visible light wavelength spectrum directly onto acoustic synthesizer pitches in real time using the Web Audio API.

---

## Mathematical Wavelength-to-Pitch Formulations

### Linear Interpolation Mapping

The core translation maps visible light wavelengths (380nm to 750nm) onto audible acoustic frequencies (220Hz to 880Hz / A3 to A5) using linear interpolation:

$$f = f_{\text{min}} + \frac{(\lambda - \lambda_{\text{min}}) \cdot (f_{\text{max}} - f_{\text{min}})}{\lambda_{\text{max}} - \lambda_{\text{min}}}$$

Where:
- $\lambda$ is the light wavelength in nanometers (380–750)
- $f$ is the output frequency in Hertz (220–880)
- $\lambda_{\text{min}} = 380\text{nm}$, $\lambda_{\text{max}} = 750\text{nm}$
- $f_{\text{min}} = 220\text{Hz}$ (A3), $f_{\text{max}} = 880\text{Hz}$ (A5)

### Harmonics Multiplication

The base frequency can be scaled by the Harmonics Multiplier ($H$):

$$f_{\text{final}} = f \times H \quad \text{where } H \in [1.0, 4.0]$$

This allows the user to shift the entire mapped range upward by octave multiples — at $2\times$, the range becomes 440–1760Hz (A4 to A6); at $4\times$, 880–3520Hz (A5 to A7).

### Ribbon Data Mapping

| Ribbon | Hex | $\lambda$ (nm) | Base $f$ (Hz) | Note |
|--------|-----|---------------|---------------|------|
| Red | `#dc2626` | 700 | 312.97 | D#4 |
| Orange | `#ea580c` | 620 | 421.62 | G#4 |
| Amber | `#d97706` | 590 | 470.27 | A#4 |
| Yellow | `#ca8a04` | 570 | 502.70 | B4 |
| Chartreuse | `#65a30d` | 550 | 535.14 | C5 |
| Green | `#16a34a` | 520 | 583.78 | D5 |
| Teal | `#0d9488` | 490 | 632.43 | D#5 |
| Cyan | `#0284c7` | 470 | 664.86 | E5 |
| Blue | `#2563eb` | 450 | 697.30 | F5 |
| Indigo | `#4f46e5` | 430 | 729.73 | F#5 |
| Violet | `#7c3aed` | 410 | 762.16 | G5 |
| Magenta | `#a21caf` | 390 | 794.59 | G#5 |

---

## Web Audio API Pipeline Architecture

### Audio Graph

```
OscillatorNode → GainNode → AudioContext.destination
     ↑                ↑
  frequency        gain.value
  (waveform)       (volume)
```

### Initialization Protocol

Modern browsers block `AudioContext` creation until a user gesture. The system initializes audio lazily on the first `mouseenter` or `mousedown` event on any ribbon card:

```javascript
function initAudio() {
  state.audioCtx = new AudioContext();
  state.gainNode = state.audioCtx.createGain();
  state.gainNode.connect(state.audioCtx.destination);
}
```

### Oscillator Lifecycle

1. **Start**: On `mouseenter`, create an `OscillatorNode` with the mapped frequency and selected waveform type. Connect through `GainNode`. Ramp gain from 0 to target volume over 30ms using `exponentialRampToValueAtTime` to avoid clicks.

2. **Update Frequency**: On hover transition between ribbons, call `oscillator.frequency.setValueAtTime()` with the new mapped frequency.

3. **Stop**: On `mouseleave`, ramp gain to near-zero over 80ms via `exponentialRampToValueAtTime`, then call `oscillator.stop()`.

### Gain Envelope (Click Prevention)

To eliminate audio pops and clicks during transitions:

```
Start:  gain.setValueAtTime(0, now)
        gain.exponentialRampToValueAtTime(volume, now + 0.03)

Stop:   gain.setValueAtTime(current, now)
        gain.exponentialRampToValueAtTime(0.001, now + 0.08)
        oscillator.stop(now + 0.08)
```

The 30ms attack and 80ms release envelopes provide smooth, natural-sounding transitions.

---

## UI Laboratory Design Philosophy

### Light Theme Rationale

Unlike the dark themes used in other labs, this synthesizer adopts a **clean laboratory blueprint aesthetic** — white and slate tones evoke oscilloscopes, signal analyzers, and engineering workbenches. The light background provides:

- Higher perceived contrast for the saturated color ribbons
- Better legibility for telemetry data at small sizes
- A visual distinction between analysis tools (dark) and real-time instruments (light)

### Ribbon Interaction Design

Each of the 12 vertical color strips is sized flexibly within a horizontal array. Hover interactions trigger:
- `scaleY(1.03)` — subtle vertical expansion for tactile feedback
- Blue indicator bar — rising from the bottom edge as a progress metaphor
- Label reveal — wavelength and color name appear on hover with backdrop blur

---

## Operational Instructions

### Playing the Synthesizer

1. **Activate audio**: Click anywhere on a ribbon card to initialize the Web Audio API context
2. **Hover to play**: Move your cursor across the ribbon array — each color triggers its corresponding pitch
3. **Select waveform**: Click Sine, Triangle, Sawtooth, or Square to change the oscillator timbre
4. **Adjust volume**: The Master Volume slider controls output gain
5. **Shift harmonics**: The Harmonics Multiplier ($1\times$–$4\times$) scales all frequencies upward

### Understanding the Telemetry

- **Wavelength**: The mapped light wavelength in nanometers for the currently hovered ribbon
- **Pitch**: The synthesized audio frequency in Hertz
- **Color Hex**: The hex code of the active ribbon
- **Note display**: Musical note and color name in the header

---

## File Directory Layout

```
color-frequency-audio-synthesizer/
├── index.html        # Application structure with synth deck and ribbon array
├── style.css         # Light laboratory theme, ribbon cards with hover physics
├── script.js         # Web Audio API DSP engine, wavelength mapping, gain envelope
├── README.md         # This documentation file
├── project.json      # Project metadata configuration
└── thumbnail.svg     # Application thumbnail icon
```

### Architecture

- **index.html** — Dual-column layout: Synthesizer Modulation Deck with waveform selector, volume/harmonics sliders, wavelength/pitch/hex telemetry; Chromatic Ribbon Array with 12 vertical color strips
- **style.css** — Light laboratory theme (Slate 100/white), ribbon cards with `scaleY(1.03)` hover, blue bottom indicator bar, custom range sliders with blue focus rings, waveform toggle buttons
- **script.js** — State management, `AudioContext` lazy initialization, `OscillatorNode` lifecycle with `exponentialRampToValueAtTime` envelopes, wavelength-to-frequency linear interpolation, waveform type switching, harmonics multiplier

---

## Local Deployment Verification

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, or Safari)
- No build tools, frameworks, or external dependencies required

### Steps

1. Clone or download the repository:
   ```
   git clone <repository-url>
   cd color-frequency-audio-synthesizer
   ```

2. Open `index.html` in your web browser:
   ```
   # On Windows
   start index.html

   # On macOS
   open index.html

   # On Linux
   xdg-open index.html
   ```

3. Verify the application loads with:
   - Dual-column light-theme dashboard layout
   - Slate 100 background with white panels
   - 12 vertical color ribbon strips
   - Waveform selector and volume/harmonics controls

### Testing

1. Hover over any ribbon — verify audio plays from your speakers
2. Move across ribbons — verify pitch changes smoothly
3. Click different waveform buttons — verify timbre changes
4. Adjust the volume slider — verify output level changes
5. Adjust the harmonics slider — verify pitch shifts upward

---

## Technical Details

- **Audio API**: Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`)
- **Frequency Range**: 220Hz (A3) to 880Hz (A5)
- **Wavelength Range**: 380nm to 750nm (visible spectrum)
- **Harmonics Range**: $1\times$ to $4\times$ (base frequency multiplier)
- **Waveforms**: Sine, Triangle, Sawtooth, Square
- **Gain Envelope**: 30ms attack / 80ms release with `exponentialRampToValueAtTime`
- **Theme**: Clean laboratory light theme (Slate palette)
- **Typography**: `ui-monospace, Consolas, monospace` monospaced stack

### Color Reference

| Token | Hex | Usage |
|-------|-----|-------|
| Canvas | `#f1f5f9` | Slate 100 — main background |
| Panel | `#ffffff` | White — instrument panels |
| Border | `#e2e8f0` | Slate 200 — dividers |
| Text primary | `#0f172a` | Slate 900 — headers |
| Text secondary | `#64748b` | Slate 500 — labels |
| Active accent | `#3b82f6` | Blue — audio active, sliders |
| Hover accent | `#10b981` | Green — hover state |
| Harmonics | `#f59e0b` | Amber — harmonics accent |
