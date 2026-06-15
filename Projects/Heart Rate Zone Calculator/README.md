# Heart Rate · Zone Calculator

A sports-performance biometric computing terminal using the Karvonen heart rate formula to calculate 5-zone cardiac thresholds with real-time Canvas spectrum visualization. Built with zero dependencies.

---

## Karvonen Formula

$$HR_{max} = 220 - Age$$

$$HRR = HR_{max} - HR_{rest}$$

$$Target = (HRR \times Intensity\%) + HR_{rest}$$

## 5 Training Zones

| Zone | Range | Color | Classification |
|---|---|---|---|
| **Z1 Recovery** | 50–60% | Cyan | Active Recovery |
| **Z2 Aerobic** | 60–70% | Emerald | Endurance Base |
| **Z3 Tempo** | 70–80% | Amber | Lactate Threshold |
| **Z4 Anaerobic** | 80–90% | Orange | Power Endurance |
| **Z5 Vo2 Max** | 90–100% | Crimson | Peak Capacity |

## Presets

| Profile | Age | HRrest | Intensity |
|---|---|---|---|
| Elite Marathoner | 28 | 42 | 75% |
| Sedentary Recovery | 55 | 82 | 55% |
| HIIT Conditioning | 25 | 58 | 88% |

## Controls

| Action | Function |
|---|---|
| Compute Cardiovascular Metrics | Runs full Karvonen calculation and renders zone chart |
| Inject Anaerobic Stress Test Values | Loads 22yr/72bpm@92% for high-intensity scenario |
| Flush Biometric Cache | Clears all calculations and resets display |

## Canvas Features

- Horizontal 5-segment stadium track with zone-colored fills
- Active intensity cursor with neon glow pin + dashed leader + BPM label
- Real-time zone card grid with computed BPM ranges per zone

---

## File Structure

```
├── index.html         Layout — presets, parameter panel, zone canvas, telemetry, action footer
├── style.css          Dark lab — glassmorphic panels, cyan/emerald/amber/orange/crimson zones
├── script.js          Full engine — Karvonen loops, Canvas zone spectrum, validation, localStorage
├── README.md          This file
└── project.json       Project metadata
```

Open `index.html` in any browser.
