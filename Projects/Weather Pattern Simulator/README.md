# Weather Pattern Simulator

An interactive, high-fidelity atmospheric physics laboratory. It models 2D thermodynamic fluid dynamics, pressure-driven wind velocity fields, Coriolis deflections, moisture evaporation, cloud condensation, and precipitation. It features an interactive map paintbrush, dynamic day/night cycles, and a micro-weather sky particle viewport rendering rain, snow, hail, lightning, and rotating tornado funnels.

---

## Features

### 1. Atmospheric Physics Grid (Map Viewport)
- Renders a 20x20 cell grid representing regional atmosphere coordinates.
- Cell layers:
  - **Temperature Map**: Hot (red) to cold (blue) distribution. Shows thermal inertia differences over coastlines (land heats/cools faster than ocean).
  - **Pressure Map**: High (yellow/orange) to low (purple) pressure zones.
  - **Moisture & Cloud Map**: Relative humidity percentages and cloud density overlays.
  - **Wind Vector Overlay**: Directional arrows representing wind speed and velocity vectors.
- Wind is driven by the pressure gradient force: $\vec{v} \propto -\vec{\nabla} P$, deflected by Coriolis acceleration, and dampened by boundary friction.

### 2. Micro-Weather Sky Viewport (Canvas 2D)
- Renders a high-end visual representation of local weather conditions in the sky for the selected grid cell.
- Transitions dynamically based on time of day (golden hour, bright sun, starry night) and cloud cover.
- Particle types:
  - **Rain**: Slanted lines falling downwards.
  - **Snow**: Drifting white circles with randomized horizontal wave fluctuations.
  - **Hail**: Small bouncing solid particles.
  - **Wind Streaks**: Flowing vector curves representing air currents.
  - **Lightning Arcs**: Forked electric discharges flashing when CAPE instability is extreme.
  - **Tornado Funnels**: A rotating column of spiraling debris particles revolving around a moving vortex.

### 3. Interactive Weather Brush
- Allows direct map manipulation by painting:
  - **Temperature**: Inject Hot or Cold air to create temperature fronts.
  - **Pressure**: Paint High Pressure domes or Low Pressure troughs.
  - **Moisture**: Add Humid (Wet) air or dry it out.
- Dynamic Day/Night Cycle cycles solar insolation, causing natural convective sea/land breezes.

### 4. Telemetry Analytics & Alerts
- Computes max wind speed, rain accumulation, cloud cover, and CAPE instability.
- Generates real-time severe weather alert logs matching the National Weather Service formats.

---

## Run It

Open `index.html` in any modern browser. No build steps, servers, or packages required.

---

## Scientific Formulations Used

- **Pressure Gradient Force**: Air accelerates from high pressure to low pressure: 
  $$\frac{d\vec{v}}{dt} = -\frac{1}{\rho}\vec{\nabla}P$$
- **Coriolis Force**: Deflects moving air in the Northern Hemisphere clockwise: 
  $$a_x = f \cdot v_y, \quad a_y = -f \cdot v_x$$
- **Clausius-Clapeyron Approximation**: Saturation vapor capacity halves roughly every 10°C decrease, triggering cloud condensation when relative humidity exceeds 100%.
- **Thermal Convection**: Solar heating raises temperatures, which lowers density and surface pressure, creating convective low-pressure centers.
