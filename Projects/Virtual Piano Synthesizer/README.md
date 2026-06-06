# Virtual Piano Synthesizer

An interactive and responsive virtual piano that allows users to play music directly in their browser using either mouse clicks or their computer keyboard. It leverages the native HTML5 Web Audio API to synthesize clean audio frequencies without relying on external audio assets, making it completely lightweight and dependency-free.

## Run it
Open `index.html` in any modern browser.

## Features
- **Dynamic Sound Generation:** Uses JavaScript's `AudioContext` to create sound wave oscillators for realistic real-time audio synthesis.
- **Synth Timbre Settings:** A built-in selector allows switching between distinct electronic wave shapes (Triangle, Sine, Square, Sawtooth) to alter the instrument's tone.
- **Sustain Pedal Simulation:** Users can toggle or press/hold the physical keyboard `Spacebar` to sustain notes smoothly across key releases.
- **Real-time Audio Visualizer:** An interactive HTML5 `<canvas>` rendering loop linked with a native `AnalyserNode` paints real-time responsive frequency waves above the keyboard.
- **Full Keyboard Mapping:** Play natural notes using the home row keys (`A`, `S`, `D`, `F`, `G`, `H`, `J`, `K`) and accidentals (sharps/flats) using the upper row keys (`W`, `E`, `T`, `Y`, `U`).
- **Visual Feedback:** Responsive UI controls and custom toggle sliders light up smoothly, fully honoring system `prefers-reduced-motion` configurations.

## What I Learned
- **Web Audio API Audio Pipelines:** Connecting multiple digital signal components (`OscillatorNode` -> `GainNode` -> `AnalyserNode` -> `AudioContext.destination`) to control sound synthesis programmatically.
- **Audio Wave Smoothing:** Implementing exponential gain envelope ramps to gracefully damp sound frequencies and erase disruptive audio clipping pops.
- **Interactive Canvas Sampling:** Binding data streams from an audio visual analyzer block to a high-speed JavaScript `requestAnimationFrame` drawing lifecycle loop.