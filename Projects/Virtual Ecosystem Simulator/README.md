# Virtual Ecosystem Simulator // Artificial Life Analytics Deck

A browser-based artificial life simulation with multi-tier agent-based ecology. Plants, herbivores, and carnivores interact in real-time on an HTML5 Canvas arena with live population charting.

---

## Features

- **Multi-Tier Agent Logic** — Plants (producers) multiply based on sunlight/water; Herbivores (consumers) seek and consume plants; Carnivores (predators) hunt herbivores in a self-regulating food chain
- **Dual Canvas Rendering** — 60fps `requestAnimationFrame` loop drives the ecosystem arena (emerald dots, cyan triangles, magenta rings) and the population trend chart (three colored curves)
- **Environmental Controls** — Real-time sliders for Sunlight Intensity, Water Supply, Mutation Rate, and Simulation Speed — all wired directly to agent behavior
- **Viral Outbreak** — Inject a pathogen that halves energy of 60% of consumers, triggering emergent recovery dynamics
- **Re-Seed Genesis** — Complete ecosystem reset without page reload — clears agents, history, and spawns a fresh balanced population
- **Stability Index** — Real-time telemetry computes ecosystem balance from population ratios
- **Dark Terminal Theme** — `#05060b` background, glassmorphic panels, neon green/cyan/pink agent colors

## Tech Stack

- HTML5 Canvas API (dual canvas, 60fps)
- CSS3 (glassmorphism, custom properties, responsive grid)
- JavaScript ES6+ (classes, IIFE, arrow functions, `requestAnimationFrame`)

## How to Use

1. Adjust sliders (Sunlight, Water, Mutation, Speed) to tune the environment
2. Watch agents interact in real-time — plants glow green, herbivores hunt as cyan triangles, carnivores stalk as pink rings
3. Use control buttons to Pause/Resume, inject a viral outbreak, or re-seed the ecosystem
4. Monitor the telemetry panel for live population counts and stability index

## Local Development

```bash
npx serve "Projects/Virtual Ecosystem Simulator"
# or open index.html directly
```
