# Network Packet Flow Visualizer

A premium dark-laboratory telemetry dashboard for animating network packet flows across a 4-node topology (Client → Router → Server → Database) using native HTML5 Canvas with LERP-driven particle kinematics.

## Architecture

### Topology
```
CLIENT  ──→  ROUTER  ──→  SERVER  ──→  DATABASE
  ↑________________________________________↓
```

### Preset Pathways

| Preset | Route | Hops |
|---|---|---|
| HTTP GET Request | Client → Router → Server → Router → Client | 5 |
| Database Transaction Sync | Client → Router → Server → Database → Server → Router → Client | 7 |
| OAuth Authentication Sweep | Client → Router → Server → Router → Client | 5 |

### Controls

**Preset Ribbon** — Load a transmission profile (configures path + log templates)

**Param Panel:**
- Packet Propagation Velocity (1–10) — base speed multiplier
- Global Congestion Load Volume (0–100) — reduces speed ×(1−cong×0.6), increases batch size and dispatch frequency
- Dropped Packet Failure Rate (0–50%) — per-frame stochastic drop probability
- Protocol Select (TCP / UDP / ICMP)

**Admin Footer:**
- Initiate Data Payload Dispatch Async — injects a batch of particles
- Simulate Random Link Breakdown Drop — severs a random segment, drops in-flight packets, auto-restores after 3s
- Flush Visualizer Channels & Re-Zero Matrices — full stop, clear all state, no page reload

### Telemetry Dashboard
- Current Hop Sequence
- Round Trip Latency (ms)
- Total Packets Transmitted / Dropped / Completed
- Active Packet Status Badge (STANDBY / TRANSMITTING / ROUTE_FAILED / LINK_BREAK / COMPLETED)
- Structural Connection Health Tag (STABLE / DEGRADED / CRITICAL / LINK FAULT)
- Protocol Active badge

All telemetry persists across sessions via `localStorage`.

## File Structure

```
├── index.html    Layout — preset ribbon, param panel, canvas + log, telemetry, admin footer
├── style.css     Dark theme (#05060b), glassmorphic panels, neon state colors, custom sliders
├── script.js     Packet class (LERP), Explosion class, animation loop (rAF), typewriter log queue
├── README.md     This file
└── project.json  Project metadata
```

Open `index.html` in any browser.
