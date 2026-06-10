# Energy Consumption Monitor

A real-time energy tracking dashboard built with vanilla HTML5, CSS3, JavaScript (ES6+), and the HTML5 Canvas API.

## Features

- **Appliance State Management** — Add/delete appliances with name, wattage, and daily run hours. Each appliance is stored in a state array and persisted to `localStorage`.
- **Mathematical Load Calculators** — Daily kWh = `(watts × hoursPerDay) / 1000`. Total daily consumption summed across all appliances. Monthly bill = `totalKwh × 30 × $0.12/kWh`. Carbon footprint = `totalKwh × 0.85 kg CO₂e`.
- **Native Canvas Donut Chart** — Clear + redraw on every mutation. Color-coded arcs with stroke separators, center text showing total daily kWh, and an inline legend mapping appliance names to consumption.
- **Rule-Based Optimization Advisor** — Evaluates each appliance against four rules: >20% of total consumption, >2000W high-wattage load running >4h, 24/7 vampire draw (>20h at >300W), HVAC extended runtime (>8h), electronics power-saving suggestions. Generates contextually tailored advice cards.
- **Seed Data** — 6 sample appliances (HVAC, Dev Rig, LED Lighting, Server, Refrigeration, Water Heater) auto-loaded on first boot.
- **Status Indicator** — Telemetry bar shows Optimal (<20 kWh), Elevated (20–50 kWh), or High Draw (>50 kWh) with color-coded badges.

## UI Theme

High-tech green energy terminal: `#05070c` backdrop, glassmorphic panels, neon cyan donut chart, emerald green status, amber high-draw warnings, monospace numeric readouts.

## Usage

Open `index.html` in any browser. Add appliances via the form, delete them with the × button, and watch the donut chart, telemetry, and advice cards update instantly.
