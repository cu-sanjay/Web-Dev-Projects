# Climate Change · Timeline

A macro-climatology research terminal spanning 1850–2100 with historical data, radiative forcing calculations, and dual-line Canvas trend charts. Built with zero dependencies.

---

## Core Model

$$\Delta F = 5.35 \cdot \ln(C / 280)$$

| Variable | Meaning |
|---|---|
| $\Delta F$ | Radiative forcing (W/m²) |
| $C$ | CO₂ concentration (ppm) |
| $280$ | Pre-industrial baseline (ppm) |

## Data Coverage

| Epoch | CO₂ Range | Temp Anomaly | Sea Level |
|---|---|---|---|
| 1850 Pre-Industrial Core | 280 ppm | 0.00 °C | 0 mm |
| 1950 Mid-Century Industrial Boom | ~310 ppm | ~0.50 °C | ~40 mm |
| 2026 Modern Anthropocene Epoch | ~420 ppm | ~1.50 °C | ~120 mm |
| 2100 Extended Future Scenario | 550–800 ppm | 2.0–4.0 °C | 650+ mm |

## Controls

| Action | Button | Keyboard |
|---|---|---|
| Start / Stop playback | Initiate / Halt | Space |
| Year step | — | ← → (10-yr) |
| Jump to epoch | Ribbon buttons (1850/1950/2026/2100) | — |
| Reset to 1850 | Purge Dataset Memory & Re-Zero | — |

## Parameters

| Slider | Effect |
|---|---|
| Base CO₂ Concentration | Overrides historical CO₂ level |
| Deforestation Rate | Modifies effective CO₂ (+0.3%/%) and temperature (+0.5%/%) |
| Fossil Fuel Subsidy | Modifies effective CO₂ (+0.2%/%) and temperature (+0.3%/%) |

---

## File Structure

```
├── index.html         Layout — epoch ribbon, parameter sliders, trend canvas, summary box, telemetry
├── style.css          Dark terminal — cyan/amber/crimson state theming, glassmorphic panels
├── script.js          Data matrix (251 years), radiative forcing, Canvas dual-line chart, playback engine
├── README.md          This file
└── project.json       Project metadata
```

Open `index.html` in any browser.
