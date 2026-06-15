# Planet Comparison · Dashboard

A deep space telemetry laboratory for comparing planetary physical parameters side-by-side. Built with zero dependencies.

---

## Celestial Bodies

| Planet | Diameter | Gravity | Orbit | Core Temp | Atmosphere |
|---|---|---|---|---|---|
| **Earth** 🌍 | 12,742 km | 9.81 m/s² | 1.00 AU | 5,500°C | N₂ 78% · O₂ 21% |
| **Mars** 🌑 | 6,779 km | 3.72 m/s² | 1.52 AU | 1,500°C | CO₂ 95% · N₂ 3% |
| **Jupiter** 🟠 | 139,820 km | 24.79 m/s² | 5.20 AU | 24,000°C | H₂ 90% · He 10% |
| **Venus** ☀️ | 12,104 km | 8.87 m/s² | 0.72 AU | 5,000°C | CO₂ 96% · N₂ 3.5% |
| **Saturn** 🪐 | 116,460 km | 10.44 m/s² | 9.58 AU | 12,000°C | H₂ 96% · He 3% |

## Core Equation

$$g = \frac{G \cdot M}{R^2}$$

| Variable | Meaning |
|---|---|
| $g$ | Surface gravity (m/s²) |
| $G$ | Gravitational constant |
| $M$ | Planetary mass |
| $R$ | Planetary radius |

## Controls

| Action | Button | Description |
|---|---|---|
| Select primary | Top-left button group | Changes left planet + telemetry |
| Select secondary | Top-right button group | Changes right planet + telemetry |
| Gravitational jump | Execute Gravitational Jump Test | Shows weight ratio delta between planets |
| Sync alignment | Synchronize Planetary Alignment | Toggles orbital synchronization |
| Purge | Purge Selection Vectors | Resets to Earth vs Mars |

---

## File Structure

```
├── index.html         Layout — dual selectors, sizing canvas + orbital track, telemetry bars, atmosphere spectrum
├── style.css          Dark lab — cyan/copper/gold neon states, glassmorphic panels, bar-within-bar telemetry meters
├── script.js          Planetary dictionary, Canvas true-scale circles + Keplerian orbit animation, AQ comparison bars
├── README.md          This file
└── project.json       Project metadata
```

Open `index.html` in any browser.
