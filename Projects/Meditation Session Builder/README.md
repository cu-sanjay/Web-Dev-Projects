# Meditation · Session Builder

An audio-visual focus cockpit featuring procedurally synthesized ambient audio, a trigonometric breathing ring with real-time phase guidance, and a circular FFT spectrum visualizer. Built with zero dependencies.

---

## Presets

| Preset | Duration | Pace | Layer | Gain |
|---|---|---|---|---|
| **Zen Deep Focus** | 20 min | 4 s | Sine Drone (110+112 Hz) | 30% |
| **Box Breathing Training** | 10 min | 4 s | White Rain | 40% |
| **Cosmic Transcendence** | 30 min | 6 s | Oceanic Hum | 25% |

## Controls

| Action | Function |
|---|---|
| Initiate Meditation Session | Starts/resumes session, activates audio + canvas |
| Pause Active Respiration Loop | Pauses timer and audio, preserves state |
| Purge Workspace & Mute Audio | Stops all audio, resets canvas, clears state |

## Breath Phase Engine

$$R = R_{base} + A \cdot \sin\left(\frac{2\pi}{T} \cdot t\right)$$

Smooth trigonometric radius expansion mapped to INHALE → HOLD → EXHALE → HOLD text states. Cycles tracked in real time.

## Audio Synthesis

- **White Rain**: Procedural white noise → bandpass filter → lowpass
- **Sine Drone**: Dual detuned oscillators (110Hz / 112Hz) producing ~2 Hz binaural beat, with LFO frequency modulation
- **Oceanic Hum**: 80 Hz + 82 Hz oscillators + pink noise, dual LFO modulation

AnalyserNode → Uint8Array FFT → circular perimeter spectrum bars at 60fps.

---

## File Structure

```
├── index.html         Layout — presets, parameter panel, canvas, action footer
├── style.css          Dark DAW — glassmorphic panels, violet/cyan/emerald neon states
├── script.js          Full engine — AudioContext synthesis, Canvas ring + spectrum, timer
├── README.md          This file
└── project.json       Project metadata
```

Open `index.html` in any browser.
