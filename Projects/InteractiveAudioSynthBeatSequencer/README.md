# 🎹 Interactive Audio DSP Synthesizer & Beat Sequencer

A premium, interactive synthesiser and 8-channel step sequencer built with the HTML5 Web Audio API and HTML5 Canvas. Learn digital sound processing (DSP), wave oscillators, ADSR envelopes, filters, and real-time audio visualization.

---

## 🚀 Live Demo
Simply open `index.html` in your web browser, or host it locally using a static web server.

---

## 🌟 Key Features

1. **8-Channel Step Sequencer**:
   - Program beat patterns across 16 horizontal steps.
   - 4 Drum channels (Kick, Snare, Hi-Hat, Clap) powered by customized audio synthesis algorithms.
   - 4 Synthesizer channels mapped to pitch notes (`C4`, `E4`, `G4`, `B4`).
   - Drag/mute controls, master BPM tempo slider (40-240 BPM), and live scanning playhead.

2. **Seeded Wave Synthesizer**:
   - Choose your core oscillator waveform: **Sine**, **Square**, **Sawtooth**, or **Triangle**.
   - Shape sound dynamics with responsive **ADSR Envelope** sliders (Attack, Decay, Sustain, Release).
   - Filter sound frequencies using modular **Low-Pass Filter** frequency and Q-factor resonance sliders.

3. **Live Canvas Visualizer**:
   - Large, neon-glowing interactive audio wave visualizer.
   - Switch visual layouts: **Time Domain (Oscilloscope)** or **Frequency Spectrum (Bar Analyzer)**.

4. **Keyboard Instrument**:
   - Interactive 12-key piano keyboard (spanning `C4` to `B5`) at the bottom.
   - Play notes manually using cursor clicks or corresponding keyboard triggers (`A`, `S`, `D`, `F`, `G`, `H`, `J`, `K`, `W`, `E`, `T`, `Y`, `U`).

5. **Backup Presets System**:
   - Save custom pattern configurations as JSON files.
   - Import sequence files using file browser upload.

---

## 🛠️ Code Structure

- [index.html](file:///index.html): Audio workspace design including sequencing grids, sliders, visualizer canvas, and piano key layouts.
- [style.css](file:///style.css): Core dark mode dashboard styles, HSL neon glows, glassmorphic card overlays, and responsive breaks.
- [script.js](file:///script.js): Sound synthesis oscillators, drum generator buffers, audio routing nodes, animation visualizer calculations, and import managers.
- [project.json](file:///project.json): Project configuration metadata.
