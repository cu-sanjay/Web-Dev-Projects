# Solar Panel · Efficiency Calculator

A photovoltaic energy terminal for modeling solar panel performance and financial return-on-investment. Built with vanilla HTML, CSS, and JavaScript — zero dependencies.

---

## Core Model

$$E = A \times H \times \frac{\eta}{100} \times 0.75 \times 365$$

| Variable | Meaning |
|---|---|
| $E$ | Annual energy yield (kWh) |
| $A$ | System surface area (m²) |
| $H$ | Daily peak sun hours |
| $\eta$ | Panel conversion efficiency (%) |
| $0.75$ | Derate factor (inverter, wiring, temp) |

### Secondary Metrics

| Metric | Formula |
|---|---|
| Annual Savings | $E \times \text{Tariff}$ |
| Payback Horizon | $\text{Cost} / \text{Annual Savings}$ (years) |
| Carbon Avoided | $E \times 0.000475$ metric tons CO₂ |

## Presets

| Preset | Area | Eff | Sun hrs | Tariff | Cost |
|---|---|---|---|---|---|
| Residential Roof Grid | 50 m² | 20% | 5.0 | $0.12 | $10,000 |
| Commercial Solar Farm | 2,000 m² | 22% | 5.5 | $0.10 | $45,000 |
| Off-Grid Cabin Unit | 15 m² | 18% | 4.5 | $0.18 | $6,000 |
| Saturated Monsoon Array | 80 m² | 16% | 2.5 | $0.14 | $14,000 |

## Controls

| Action | Button | Keyboard |
|---|---|---|
| Run calculation | Execute Photovoltaic Grid Run | Enter / R |
| Monsoon preset | Load Saturated Monsoon Array Preset | — |
| Flush & reset | Flush Analytical Cache | X |
| Presets | Top ribbon buttons | — |

---

## File Structure

```
├── index.html         Semantic layout — preset ribbon, parameter intake, canvas charts, summary cards
├── style.css          Dark terminal aesthetic — glassmorphic panels, solar yellow / emerald neon states
├── script.js          PV calculation engine, Canvas line chart + ROI bars, preset loader, validation
├── README.md          This file
└── project.json       Project metadata
```

Open `index.html` in any browser — no build tools required.
