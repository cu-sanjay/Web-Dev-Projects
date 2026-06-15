# Sustainable Transport Calculator

A green logistics carbon accounting terminal comparing 4 transit modes (Cycling, Electric Bus, Urban Rail, Gas Sedan) via real-time Canvas horizontal bar charts. Computes emissions per passenger (`M_c = d × EF / P`), ecological sequestration tree-days, and eco-mobility efficiency tiers.

---

## Features

### Carbon Analytics Engine
4 transport vectors with fixed emission factors:

| Mode | EF (g CO₂/km) |
|---|---|
| Cycling | 0 |
| Electric Bus | 45 |
| Urban Transit Rail | 28 |
| Gas Sedan Car | 171 |

Formula: `M_c = (Distance × EF) / Passengers` converted to kg CO₂

### Canvas Bar Chart
- Horizontal multi-mode bars scaled to max emission value
- Cycling bar glows emerald at zero emissions (pulsing border)
- Bars exceeding 15 kg CO₂ flash warning crimson
- Real-time updates on every parameter change

### Ecological Sequestration
- Tree-days to offset: `total kg / 22 kg per tree per year × 365`
- Trees needed count, equivalent months to full offset
- Zero-emission route detection

### Telemetry
- Commute distance × passengers
- Net carbon footprint delta (kg CO₂)
- Tree-days for full sequestration
- Clean energy subsidy status (ON/OFF, -20% emissions)
- Efficiency tier: EMISSION_FREE / LOW IMPACT / MODERATE / CRITICAL

### Presets
- Daily Suburb Commute (25 km, 1 pax)
- Cross-City Heavy Transit (120 km, 2 pax)
- Micro-Urban Sprint (5 km, 1 pax)

## Controls

| Action | Function |
|---|---|
| Preset Buttons | Instant trip configuration |
| Compute Footprint | Calculate all emissions and metrics |
| Inject Grid Subsidy | Toggle -20% clean energy multiplier |
| Flush & Re-Zero | Reset all parameters and charts |

---

## File Structure

```
├── index.html        Layout — preset ribbon, input console, Canvas chart, sequestration box, telemetry, footer
├── style.css         Dark terminal — glassmorphic panels, neon green/yellow/amber/crimson states
├── script.js         Engine — emission dictionary, M_c formula, Canvas bars, sequestration math, telemetry
├── README.md         This file
└── project.json      Project metadata
```

Open `index.html` in any browser.
