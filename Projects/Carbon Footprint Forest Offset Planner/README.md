# Carbon Footprint · Forest Offset Planner

An interactive environmental informatics tool that computes Total Annual Carbon Emissions (kg CO₂/yr) from Transport, Electricity, Diet, and Aviation activity parameters, then derives the Required Mature Trees count, Afforestation Canopy Area, and Net Carbon Balance using the botanical absorption constant (22 kg CO₂/tree/yr).

## Features

- **Activity Parameter Console** — sliders + number fields for Transport Distance, Household Electricity, Dietary Carbon Density, and Aviation Flights
- **Annual Emissions Breakdown** — Canvas bar chart showing per-category contribution
- **Virtual Afforestation Grid** — Canvas-rendered tree tokens (green triangular pine icons) arranged in structured rows proportional to offset count
- **Carbon Telemetry Dashboard** — Total Emissions, Required Trees, Canopy Area, Net Balance, and Offset Progress gauge
- **Validation** — detects negative/absurd values with crimson borders, shake animation, and error banner
- **High-Impact Preset** — instantly loads a high-emission household scenario
- **Flush** — zeroes all fields, clears canvases, resets telemetry without page refresh

## Tech Stack

- HTML5 + CSS3 (glassmorphism, custom properties, flex/grid)
- Vanilla JavaScript (ES6+ module pattern, Canvas API)
- Google Fonts (Inter, JetBrains Mono, Orbitron)

## How to Use

1. Open `index.html` in any modern browser
2. Adjust the four activity sliders (or type values directly)
3. Click **Compute Ecological Balance Sheet** to calculate and render
4. Click **Load High-Impact Household Preset** to see a high-emissions scenario
5. Click **Flush Workspace Arrays** to reset all data

## License

MIT
