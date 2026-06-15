# Ocean Food Chain · Simulator

A marine biology trophic cascade simulation with agent-based modeling across four discrete food chain tiers. Built with Canvas 2D particle systems — no external libraries.

## Features

- **Four Trophic Tiers**: Phytoplankton (green glow particles), Krill (cyan consumers), Fish (orange predators), Sharks (crimson apex)
- **Predator-Prey AI**: Krill seek and consume phytoplankton; fish hunt krill; sharks pursue fish — each with distance-based detection and pursuit vectors
- **Extinction Toggles**: Wipe any tier to observe cascading population crashes, overgrazing, and starvation events
- **Extinction Cascade Event**: Automated full-chain collapse triggering successive die-offs
- **Invasive Species**: Inject oversized predatory fish and sharks to destabilize the ecosystem
- **Real-Time Telemetry**: Population counts per tier, Biomass Balance ratio, Ecosystem Stability (PRISTINE → STABLE → UNBALANCED → CASCADE RISK → COLLAPSE)
- **Mini Gauges**: Visual density bars for each trophic level
- **Water Temperature & Predator Agility**: Environmental sliders affecting metabolism and chase speed
- **Zero-Refresh Purge**: Clean re-seed without page reload

## Tech Stack

- HTML5 + CSS3 (glassmorphism, custom properties, CSS grid)
- Vanilla JavaScript (ES6+, Canvas 2D, requestAnimationFrame)
- Google Fonts (Inter, JetBrains Mono, Orbitron)

## How to Use

1. Open `index.html` in any modern browser
2. Watch the ecosystem auto-simulate — phytoplankton grow, krill graze, fish hunt, sharks patrol
3. Click **Wipe [Tier]** buttons to trigger local extinctions
4. Click **Induce Extinction Cascade** for automated chain collapse
5. Click **Introduce Invasive Species** to inject oversized predators
6. Click **Purge & Re-Seed** to reset

## License

MIT
