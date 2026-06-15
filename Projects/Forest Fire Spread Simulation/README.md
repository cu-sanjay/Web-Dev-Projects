# Forest Fire Spread Simulation // Containment Operations Deck

A cellular automata wildfire simulation powered by HTML5 Canvas. Watch fire propagate across a 25×40 forest grid with wind-directed spread, moisture damping, and interactive containment controls.

---

## Features

- **Cellular Automata Engine** — Four cell states: Empty (firebreak), Healthy Tree, Active Fire, Burnt Ash. Fire spreads to neighboring trees using a Moore neighborhood with wind-biased probability weighting.
- **Wind Compass** — Toggle N/S/E/W wind direction; speed slider scales downwind ignition probability up to 3× baseline.
- **Moisture Damping** — Higher moisture reduces ignition likelihood across the grid.
- **Interactive Painting** — Click/drag to carve firebreaks (clear trees) or re-plant on empty cells. Double-click to drop a spark anywhere.
- **Containment Burn** — Clears perimeter trees to create a firebreak boundary.
- **Real-Time Telemetry** — Unburned canopy count, active blazes, carbonized acreage (×0.62 ac coefficient), destruction percentage.
- **Dark Ops Theme** — `#05060b` background, neon orange fire glow, emerald canopy, charcoal ash.

## Tech Stack

- HTML5 Canvas API (grid rendering)
- CSS3 (glassmorphism, compass dial, responsive grid)
- JavaScript ES6+ (IIFE, 2D arrays, interval timer)

## How to Use

1. Adjust Wind Velocity, Moisture, Direction, and Step Delay
2. Click **Ignite Random Spark** or double-click a cell to start a fire
3. Paint firebreaks by clicking/dragging over healthy trees
4. Use **Containment Burn** to clear a perimeter, **Halt** to pause/resume
5. **Re-Seed Forest** resets to a healthy grid without page reload

## Local Development

```bash
npx serve "Projects/Forest Fire Spread Simulation"
```
