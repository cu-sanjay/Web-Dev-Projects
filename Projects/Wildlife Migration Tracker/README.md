# Wildlife Migration · Tracker

A GIS geospatial telemetry tracking system that simulates multi-species animal migration routes using Catmull-Rom spline interpolation with real-time particle tracking, weather hazard injection, collision detection, and a streaming activity log.

## Features

- **Three Species Profiles**: Monarch Butterfly (green particles), Humpback Whale (cyan circles), Arctic Tern (pink chevrons)
- **Catmull-Rom Spline Routes** — smooth parametric interpolation through multi-point waypoint arrays
- **60fps Wireframe Cartography Canvas** — continent outlines, latitude/longitude grid, route paths, resting zone radar pings
- **Crosswind Weather Hazard Injection** — amber hazard zones with particle slowdown, stochastic drift, color flash, and warning log entries
- **Activity Telemetry Stream** — scrollable log with timestamped INIT, INFO, WARN, HAZARD, and DONE messages
- **Flush & Reset** — zero-refresh workspace clear without browser reload
- **Climate Temperature & Scan Speed** — environmental parameter sliders

## Tech Stack

- HTML5 + CSS3 (glassmorphism, custom properties, CSS grid)
- Vanilla JavaScript (ES6+, Canvas API, Catmull-Rom splines, requestAnimationFrame)
- Google Fonts (Inter, JetBrains Mono, Orbitron)

## How to Use

1. Open `index.html` in any modern browser
2. Select a species from the dropdown
3. Click **Initiate Migration Cycle Async** to start particle tracking
4. Click **Inject Crosswind Weather Hazard** to place obstacles on the route
5. Click **Flush Vector Traces & Reset Sockets** to clear all data

## License

MIT
