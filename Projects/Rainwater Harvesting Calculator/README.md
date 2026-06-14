# Rainwater Harvesting · Calculator

A civil engineering hydrology tool that computes Annual Rainwater Collection Yield using the formula **Y = A × R × Cr**, with animated Canvas visualization of rainfall collection and fluid-sloshing storage cistern.

## Features

- **Runoff Coefficient Engine**: Corrugated Metal (0.90), Concrete Tile (0.80), Asphalt Shingle (0.75), Green Roof (0.30)
- **60fps Canvas Fluid System**: Rain particle droplets falling from roof → gutter → downpipe → storage cistern
- **Sine Wave Water Surface**: Trigonometric wave animation (sin(x·freq + time)·amp) for lifelike sloshing effect
- **Overflow Detection**: Flashing red warning when yield exceeds tank capacity
- **Impact Metrics**: Toilet flush equivalents, shower cycles, garden irrigation area
- **Commercial Preset**: One-click load for 2,500 m² facility scenario
- **Zero-Refresh Flush**: Clears particles, resets cistern, restores defaults

## Tech Stack

- HTML5 + CSS3 (glassmorphism, custom properties, CSS grid)
- Vanilla JavaScript (ES6+, Canvas API, requestAnimationFrame)
- Google Fonts (Inter, JetBrains Mono, Orbitron)

## How to Use

1. Open `index.html` in any modern browser
2. Enter Roof Area, select Roof Material, adjust Rainfall slider
3. Click **Run Fluid Hydrology Simulation** to animate and compute
4. Click **Load Commercial Facility Preset** for a large-scale scenario
5. Click **Flush Cistern Storage & Clear Fields** to reset

## License

MIT
