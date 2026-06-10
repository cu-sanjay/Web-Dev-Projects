# Internet Speed Test UI

A simulated network diagnostic tool with an animated Canvas speedometer gauge, built with vanilla HTML5, CSS3, and JavaScript (ES6+).

## Features

- **Async Multi-Stage Telemetry Engine** — Promise-chained phases: Phase 1 (ping/jitter sampling over 1.5s), Phase 2 (download sweep ramping to ~250 Mbps over 4s), Phase 3 (upload sweep over 4s).
- **Canvas Speedometer Gauge** — `requestAnimationFrame` loop drives a concentric arc gauge with gradient fill (cyan → pink), tick marks (0–500 Mbps), animated needle, and ±12 Mbps noise injection for natural ripples.
- **Historical Ledger** — Each completed test records date/time, download, upload, and ping into a scrollable log panel. Persisted via `localStorage` (max 30 entries).
- **Telemetry Bar** — Live ping/jitter/ISP/status updates during each phase. ISP randomly cycles through ASN labels.

## Usage

Open `index.html` and click **Initiate Network Diagnostic Scan**. Watch the gauge animate through ping → download → upload phases.
