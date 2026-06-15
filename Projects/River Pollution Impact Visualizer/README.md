# River Pollution Impact Visualizer // Limnology Command Cockpit

An interactive river pollution simulation powered by HTML5 Canvas. Deploy pollutant spills, observe real-time ecological impact, and activate cleanup infrastructure — all driven by coupled biochemical equations.

---

## Features

- **Canvas River Ecosystem** — Boid-behavior fish schools, swaying riverbed flora, diffusing contaminant plumes with radial gradient blending
- **Three Pollutant Types** — Industrial Chemicals (toxicity spike), Organic Sewage (BOD surge → DO crash), Plastic Macro-Toxins (combined effects)
- **DO/BOD Chemistry Engine** — Dissolved Oxygen drops below 4.0 mg/L triggers fish mortality (upside-down, slowing, vanishing); toxicity > 50% causes flora to brown and shrivel
- **Real-Time Telemetry** — Dissolved Oxygen (mg/L), Toxicity Index (%), Biomass Survival (%), Eco-Health Rating (PRISTINE → HYPOXIA)
- **Interactive Controls** — Deploy spills, activate micro-filter cleanup (3-second recovery), purge & restore without page reload
- **Dark Marine Theme** — `#05060b` background, azure cyan river channels, amber sewage, magenta industrial, purple plastic

## Tech Stack

- HTML5 Canvas API (60fps particle rendering)
- CSS3 (glassmorphism, responsive grid)
- JavaScript ES6+ (boid separation, biochemical ODEs, requestAnimationFrame)

## How to Use

1. Select pollutant type, adjust dumping rate and flow velocity
2. Click **Deploy Spill** to inject pollution — watch plumes diffuse downstream
3. Monitor DO, toxicity, and biomass in the telemetry panel
4. Click **Activate Cleanup** to temporarily filter pollutants
5. Click **Purge & Restore** to fully reset the ecosystem

## Local Development

```bash
npx serve "Projects/River Pollution Impact Visualizer"
```
