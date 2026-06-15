# Volcano Eruption Simulator

An interactive, high-fidelity geophysics laboratory simulator. It models volcanic eruptions, pyroclastic ballistics, visco-fluid flows, and seismic harmonics, featuring a custom particle-physics cross-section canvas, magma pressure build engines, and live seismograph charts.

---

## Features

### 1. Volcanic Cross-Section & Flow Physics (Canvas 2D)
- Renders a stratovolcano showing magma chamber, main conduit, crater, and slopes.
- Particle types:
  - **Rising Magma**: Magma particles ascending inside the conduit, driven by chamber pressure.
  - **Ballistic Ejecta (Pyroclasts)**: launched from the vent, experiencing gravity, air resistance, and wind drift forces.
  - **Ash Columns**: Fine particulate dust rising vertically due to thermal buoyancy, then drifting horizontally based on wind speed sliders.
  - **Viscous Lava Flow**: Liquid particles flowing down volcano slopes, sliding along terrain heights.
- Visual glows: neon orange/red lava, fading grey ash clouds, explosive flash triggers, and chamber pressure alerts.

### 2. Geophysics Controls
- **Viscosity**: Controls the lava velocity. Basaltic (low viscosity) flows quickly down slopes. Rhyolitic (high viscosity) moves sluggishly, plugging the vent and building high pressures.
- **Gas Content & Pressure**: Determines the explosiveness and launch velocities of ejecta.
- **Wind Speed & Direction**: Coordinates the horizontal drift velocity of ash cloud columns.
- **Vent Diameter**: Restricts conduit flow rate. Narrow vents accelerate launch speeds.

### 3. Eruption Style Presets

| Eruption Preset | VEI Rating | Visual Behaviors | Hazard Warnings |
|---|---|---|---|
| **Hawaiian** | VEI 0-1 | Low viscosity, low gas. Gentle, fast-running basaltic lava rivers, minimal ash plume. | Lava flows threat to structures. |
| **Strombolian** | VEI 2-3 | Medium viscosity and gas. Rhythmic, firework-like explosions ejecting glowing pyroclastic bombs. | Ballistic debris threat in close radius. |
| **Plinian** | VEI 5-6 | High viscosity, high gas. Colossal vertical columns of ash rising to the atmosphere. Heavy seismic tremors. | Ash fallout and pyroclastic flows. |

### 4. Seismology & Magma Pressure HUD
- **Magma Chamber Pressure**: Integrates pressure over time. When it breaches 100% of the vent strength, a violent eruption triggers.
- **Volcanic Tremor Seismograph**: Traces live seismic wave harmonics. Seismic amplitude increases as pressure builds, generating screen-shake actions during eruptions.
- **Volcanic Explosivity Index (VEI)**: Computes and displays the VEI scale (0-8 index) based on active parameters.

---

## File Structure
```
Volcano Eruption Simulator/
├── index.html        # Dashboard grid with viewport canvas and telemetry panels
├── style.css         # Glassmorphic volcanic terminal stylesheet
├── script.js         # Particle loops, fluid vector heights, and seismogram plotters
├── README.md         # Documentation
├── project.json      # Metadata configuration
└── thumbnail.svg     # Modern vector graphic of the volcano simulator
```
