# Soil Health · Analyzer

A premium agronomic laboratory terminal built with vanilla HTML, CSS, and JavaScript. Analyze soil health across five electrochemical parameters with real-time NPK bar charting, multi-crop compatibility matching, and biochemical scoring.

---

## Agronomic Scoring Engine

The composite soil health score is computed from five weighted parameters:

| Parameter | Weight | Ideal Range | Scoring Logic |
|---|---|---|---|
| pH Deviance | 25 pts | 6.0–7.0 | Distance from 6.5 neutral point |
| Moisture Content | 25 pts | 40–60% | Saturation curve with penalties for arid/waterlogged |
| Nitrogen (N) | 20 pts | 40–60 mg/kg | Proximity to ideal midpoint |
| Phosphorus (P) | 20 pts | 25–40 mg/kg | Proximity to ideal midpoint |
| Potassium (K) | 20 pts | 35–55 mg/kg | Proximity to ideal midpoint |

Total = 0–100 pts → **Composite Soil Health Score %**

### pH Classification

| Range | Classification | Color |
|---|---|---|
| < 5.0 | Strongly Acidic | Crimson |
| 5.0–5.5 | Moderately Acidic | Orange |
| 5.5–6.0 | Slightly Acidic | Amber |
| 6.0–7.5 | Optimal Near-Neutral | Green |
| 7.5–8.5 | Moderately Alkaline | Amber |
| > 8.5 | Alkaline Alum Hazard | Crimson |

### Grade Tiers

| Score | Grade | Meaning |
|---|---|---|
| ≥80 | A — Rich Loam | Excellent growing conditions |
| 65–79 | B — Fertile | Good for most crops |
| 50–64 | C — Moderate | Adequate with careful selection |
| 35–49 | D — Degraded | Requires amendment |
| <35 | F — Barren | Poor growing potential |

---

## Crop Compatibility Matrix

Four crop species with distinct parameter requirements are evaluated against active soil readings. Each crop receives a 0–100% match rating computed from per-parameter proximity scoring.

| Crop | pH Range | Moisture % | N | P | K | Best Soil |
|---|---|---|---|---|---|---|
| Rice 🌾 | 5.5–7.0 | 60–80 | 40–60 | 20–35 | 25–40 | Neutral clay, high moisture |
| Wheat 🌿 | 6.0–7.5 | 40–60 | 50–70 | 25–40 | 30–45 | Loamy NPK, moderate moisture |
| Potatoes 🥔 | 5.0–6.5 | 50–70 | 30–50 | 30–50 | 40–60 | Sandy, slightly acidic |
| Tomatoes 🍅 | 6.0–7.0 | 50–70 | 40–60 | 30–45 | 45–65 | Rich loam, high potassium |

---

## File Structure

```
├── index.html         Main application shell
├── style.css          Dark laboratory terminal theme
├── script.js          Scoring engine, canvas charting, crop matching
├── README.md          This documentation
└── project.json       Project metadata
```

No dependencies. Open `index.html` in any browser.
