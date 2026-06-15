# Traffic Intersection Controller

A municipal smart-city traffic management console with a real-time 4-way intersection Canvas simulation, finite state signal machine (Green → Yellow → Red cycles), vehicle particle kinematics with proximity-based deceleration, congestion telemetry, and rush-hour surge injection.

---

## Features

### 4-Way Intersection Engine
- **Cross-shaped asphalt grid** with vertical (NS) and horizontal (EW) dual-lane tracks
- **Vehicle particle system** — micro-rectangle tokens spawn at boundaries, advance along coordinate lanes
- **Proximity detection** — cars decelerate smoothly when approaching a lead vehicle or red signal stop line
- **Tail-light glow** — stopped vehicles display crimson brake lights

### Signal State Machine
- **Automated Mode**: Timer-driven cycling through NS-Green → NS-Yellow → EW-Green → EW-Yellow with configurable phase durations
- **Manual Override**: Decoupled timers; click to cycle phases instantly
- Conflicting directions never display green simultaneously

### Controls
- Vehicle spawn rate (1–20)
- Speed limit vector (1–6 px/frame)
- Green phase duration (3–20s)
- Yellow buffer time (1–8s)

### Telemetry

| Metric | Source |
|---|---|
| Vehicles Dispatched | Cumulative spawn count |
| Active Vehicles | Current on-road count |
| Congestion Rating | % of stationary vehicles (v=0) |
| Avg Intersectional Delay | Mean stopped time per vehicle |
| Light State | Current NS/EW signal colors |
| Throughput Badge | FLOW → MODERATE → GRIDLOCK CRITICAL (>70%) |

### Incident Log
- Real-time console with timestamped entries
- Crimson-highlighted `[GRIDLOCK ALERT]` at critical congestion
- Auto-scroll with 50-entry retention

## Controls

| Action | Function |
|---|---|
| Mode Ribbon | Toggle Automated / Manual signal control |
| Trigger Rush Hour Surge | Inject 15 vehicles across all lanes |
| Manual Switch Phase | Cycle to next light state (manual mode) |
| Flush & Re-Zero | Clear all vehicles and reset telemetry |

---

## File Structure

```
├── index.html        Layout — mode ribbon, parameter console, Canvas arena, incident log, telemetry, admin footer
├── style.css         Dark terminal — glassmorphic panels, neon cyan/green/amber/crimson states, congestion glow
├── script.js         Engine — vehicle kinematics, signal FSM, proximity deceleration, Canvas rendering, telemetry
├── README.md         This file
└── project.json      Project metadata
```

Open `index.html` in any browser.
