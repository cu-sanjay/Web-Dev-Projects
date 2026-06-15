# Mountain Height Comparator

A macro-topography command deck for comparing world peaks with true-to-scale Canvas silhouette rendering. Displays barometric pressure, water boiling point, and climatic zone classification for each summit — all computed in real time.

---

## Features

### Peak Database
6 world mountains with full geographic profiles:

| Peak | Height | Range | Country |
|---|---|---|---|
| Mount Everest | 8,848m | Himalayas | Nepal / China |
| K2 | 8,611m | Karakoram | Pakistan / China |
| Kangchenjunga | 8,586m | Himalayas | Nepal / India |
| Kilimanjaro | 5,895m | Kilimanjaro | Tanzania |
| Mont Blanc | 4,807m | Alps | France / Italy |
| Mount Fuji | 3,776m | Honshu | Japan |

### Atmospheric Physics Engine
- **Barometric Pressure**: `P = 101.325 × (1 − 0.0065h / 288.15)^5.255`
- **Water Boiling Point**: `T_boil = 100 × (P / 101.325)^0.190`
- **Climatic Zones**: Lowland → Montane → Alpine → Nival → Death Zone (≥8,000m)

### Canvas Elevation Workspace
- Coordinate calibration grid with 1km elevation milestones (0–10,000m)
- True-to-scale triangular mountain silhouettes with gradient fills
- Snowcap rendering on high-altitude segments
- Click any peak to inspect its atmospheric vitals

### Reference Overlays
- Commercial Jet Flight Level (10,000m)
- Death Zone Threshold (8,000m) — with crimson warning
- Cumulus Cloud Condensation Layer (2,500m)

### Comparative Metrics Table
- Sorted by height descending
- Peak name, absolute elevation, range, country

### Telemetry
- Peak name, absolute elevation, pressure (kPa), boiling point (°C)
- Climatic Zone badge (death zone triggers pulsing crimson alert)
- Tectonic Elevation Boost (+15%) simulation

## Controls

| Action | Function |
|---|---|
| Peak Checklist | Toggle which mountains to render |
| Reference Overlays | Show/hide benchmark elevation lines |
| Execute Topographical Scale Sync | Refresh canvas and metrics |
| Trigger Tectonic Boost | Apply +15% height to all peaks |
| Flush Selection Vectors | Clear all selections and resets |

---

## File Structure

```
├── index.html        Layout — peak ribbon, reference toggles, Canvas workspace, metrics table, telemetry, footer
├── style.css         Dark terminal — glassmorphic panels, neon cyan/amber/purple/crimson death zone states
├── script.js         Engine — mountain database, barometric/boil physics, Canvas silhouettes, telemetry
├── README.md         This file
└── project.json      Project metadata
```

Open `index.html` in any browser.
