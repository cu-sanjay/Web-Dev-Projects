# Utility Projects — Geolocation Dashboard

A real-time geolocation telemetry dashboard built with the native HTML5 Geolocation API, vanilla CSS3, and JavaScript (ES6+).

## Features

- **Asynchronous Ping Engine** — `navigator.geolocation.getCurrentPosition()` with `enableHighAccuracy: true`. Captures latitude, longitude, heading, speed, accuracy, and timestamp. Maps data into monospace telemetry cards with smooth transitions.
- **Continuous Watcher Stream** — `watchPosition()` with high-accuracy parameters. Live-updates all telemetry values as coordinates change. Computes speed from consecutive fixes when native speed is unavailable. Heading shown in degrees.
- **Defensive Error Handling** — Explicit switch/case for all three Geolocation error codes:
  - `PERMISSION_DENIED (1)` → Screen shake + crimson overlay: "Access Denied: Please reset location permission tokens…"
  - `POSITION_UNAVAILABLE (2)` → "Hardware Sensor Unreachable or Satellite Signal Blocked."
  - `TIMEOUT (3)` → "Network connection timed out while establishing coordinate lock."
- **Watcher Lifecycle** — Start/stop buttons manage the watch ID. Stop resets telemetry to baseline without page refresh. Watcher badge and animated dot reflect active/inactive state.
- **Log Panel** — Timestamped event log for all actions (ping requests, position acquisitions, errors, watcher start/stop).
- **Distance Calculation** — Haversine formula computes great-circle distance between consecutive fixes when native speed/heading are unavailable.

## UI Theme

Network monitoring deck: `#04060b` backdrop, glassmorphic cards, neon cyan metric readouts, green/red status badges, animated pulse dot for active tracking, responsive 2-column grid → single column on mobile.

## Usage

Open `index.html` (requires HTTPS or localhost for geolocation). Click **Request One-Time Ping** for a single fix, or **Initialize Live Vector Tracking Stream** for continuous updates. Grant location permission when prompted.
