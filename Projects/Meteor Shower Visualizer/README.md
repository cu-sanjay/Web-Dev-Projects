# Meteor Shower · Visualizer

An atmospheric ablation tracking terminal simulating hypervelocity meteor entries with real-time particle trails, bolide fireball explosions, and live telemetry. Built with zero dependencies.

---

## Debris Streams

| Stream | Color | Speed | Trail | Intensity |
|---|---|---|---|---|
| **Perseids** | Electric blue | 2.5 | 25px | 1.0 |
| **Leonids** | Luminous emerald | 3.0 | 20px | 0.9 |
| **Geminids** | Golden trails | 1.8 | 35px | 1.2 |
| **Custom** | Cosmic violet | 2.0 | 22px | 1.0 |

## Controls

| Action | Button | Description |
|---|---|---|
| Start / Stop | Initiate Atmospheric Inflow Run | Toggles meteor spawning |
| Fireball | Trigger Random Bolide Fireball | Spawns large slow meteor that explodes mid-screen |
| Flush | Flush Starfield Channels | Clears all particles, resets counters |

## Parameters

| Slider | Range | Effect |
|---|---|---|
| Inflow Rate | 5–80/hr | Meteor spawn probability per frame |
| Velocity Multiplier | 0.3–3.0× | Speed scale factor for all particles |
| Entry Angle | 10–80° | Trajectory angle from vertical |
| Star Density | 10–100% | Number of background twinkling stars |

## Core Model

$$\alpha_{t+1} = \alpha_t - \gamma$$

Trail particles decay linearly per frame. Kinetic Energy: $\Sigma \frac{1}{2} m v^2$ per active meteor.

---

## File Structure

```
├── index.html         Layout — stream selector, atmosphere sliders, night-sky canvas, telemetry panel
├── style.css          Dark observatory — blue/green/gold/violet neon per stream, glassmorphic panels
├── script.js          Particle system with trails, bolide explosion, Canvas twinkle engine, telemetry
├── README.md          This file
└── project.json       Project metadata
```

Open `index.html` in any browser.
