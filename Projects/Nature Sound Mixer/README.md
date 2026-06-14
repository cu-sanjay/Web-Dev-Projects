# Nature Sound · Mixer

A Web Audio API ambient productivity tool with procedurally generated environmental sound textures, per-channel DSP controls, FFT spectrum waveform visualizer, and localStorage preset management.

## Features

- **4 Channel Strips** — Rain (white noise), Forest Birds (FM oscillators), Rushing River (brown noise), Mountain Wind (pink noise)
- **Per-Channel Controls** — independent Gain Level slider, BiquadFilter Cutoff (lowpass/highpass), Mute toggle
- **Master Deck** — global Master Volume, Play/Mute toggle switch
- **FFT Spectrum Visualizer** — real-time Canvas frequency analyser at 60fps via AnalyserNode + requestAnimationFrame
- **Preset Profiles** — save/load/delete named snapshots via localStorage
- **Deep Sleep Template** — one-click preset for balanced ambient mix
- **Purge** — clean reset of all mixer parameters without page reload

## Tech Stack

- HTML5 + CSS3 (glassmorphism, custom properties, CSS grid)
- Vanilla JavaScript (ES6+, Web Audio API, AnalyserNode, BiquadFilterNode, Canvas API)
- Google Fonts (Inter, JetBrains Mono, Orbitron)

## How to Use

1. Open `index.html` in any modern browser
2. Click **PLAY** to initialize AudioContext and start sound generation
3. Adjust per-channel gain and filter sliders, or mute individual channels
4. Adjust Master Volume
5. Save your mix as a preset, or load the **Deep Sleep Template**
6. Click **Purge Mixer Channels** to reset everything

## License

MIT
