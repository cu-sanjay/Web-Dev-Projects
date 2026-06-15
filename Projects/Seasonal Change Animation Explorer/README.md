# Seasonal Change · Animation Explorer

An astronomical simulation application that visualizes Keplerian orbital mechanics, Earth's axial tilt, and hemispheric solar intensity variations throughout the year. Built with native Canvas API — no external libraries.

## Features

- **Orbital Trajectory Canvas** — 2D side-view of Earth orbiting the Sun on an elliptical path, with fixed axial tilt vector, sun corona glow, and radiation rays
- **Solar Intensity Analysis Canvas** — hemispheric bar meters for Northern/Southern insolation flux percentages, plus temperature readouts
- **Real-Time Telemetry** — Current Day Counter, Active Orbital Phase (Summer Solstice / Equinox / Winter Solstice), N/S Intensity %, Solar Distance (AU)
- **Controls** — Manual Orbit Position slider (Day 1–365), Axial Obliquity tilt (0°–30°), Simulation Speed multiplier
- **Solstice Lock Preset** — snaps to the nearest solstice alignment and locks position
- **60fps Animation** — unified `requestAnimationFrame` loop driving all canvas paints and telemetry syncs

## Tech Stack

- HTML5 + CSS3 (glassmorphism, custom properties, CSS grid/flexbox)
- Vanilla JavaScript (ES6+, Canvas API, requestAnimationFrame)
- Google Fonts (Inter, JetBrains Mono, Orbitron)

## How to Use

1. Open `index.html` in any modern browser
2. Use the sliders to adjust day, axial tilt, and simulation speed
3. Click **Pause/Resume Simulation** to toggle animation
4. Click **Lock Solstice Alignment** to snap to and hold the nearest solstice
5. Click **Reset Simulation** to restore defaults

## License

MIT
