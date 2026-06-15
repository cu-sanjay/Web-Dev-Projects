# Mission Control Dashboard

An aerospace telemetry command center with a real-time polar-coordinate Canvas radar sweep, atmospheric physics engine (`V_e = √(2GM/r)`), 4-subsystem health monitoring with failure injection, live operational log, and mission phase timeline.

---

## Features

### Radar Sweep Visualizer
- Concentric polar rings with crosshair axes
- Rotating alpha-gradient sweep beam (trigonometric `x = cos(θ)·R`)
- 12 stochastic blip targets that glow on beam intersection
- Center dot with neon cyan glow

### Physics Engine
| Parameter | Formula / Source |
|---|---|
| Altitude | Mission time × thrust factor |
| Velocity | Mission time + thrust contribution |
| Core Temperature | 20° + time × 0.8 + thrust contribution |
| Escape Velocity | `V_e = √(2GM / (R + h))` |

### Subsystem Diagnostics
4 tracked modules: Propellant Tanks, Thermal Shields, Guidance Computations, Life Support
- Health bars (0–100%) with green/red status
- Failure injection drops random subsystem by 40–80%
- Critical subsystem triggers `[CRITICAL: ... DEGRADED]` alert

### Mission Phase Timeline
- Pre-Launch → Atmospheric Ascent → Max-Q → Orbital Insertion
- Auto-advances based on altitude during launch
- Clickable for manual override in standby

### Live Operational Log
- Timestamped entries: `[T+12s]: BOOSTER SEPARATION STABILIZED`
- Typewriter auto-log at 3s intervals
- Warning and error color coding

### Telemetry
- Flight velocity (km/s)
- Cumulative altitude (km)
- Structural core temperature (°C)
- Escape velocity (km/s)
- Safety status badge (STANDBY / MONITORING / NOMINAL / CRITICAL)

## Controls

| Action | Function |
|---|---|
| Initiate Main Stage Ignition | Start launch sequence |
| Inject Subsystem Failure | Corrupt random subsystem health |
| Purge Operational Matrix | Full reset to pre-launch state |

---

## File Structure

```
├── index.html        Layout — phase timeline, parameter core, radar canvas, log, telemetry, footer
├── style.css         Dark terminal — glassmorphic panels, cyan radar, amber warnings, crimson critical
├── script.js         Engine — radar sweep, physics (V_e), subsystems, failure injector, log sequencer
├── README.md         This file
└── project.json      Project metadata
```

Open `index.html` in any browser.
