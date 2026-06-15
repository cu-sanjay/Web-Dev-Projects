# Rocket Launch Simulator

An interactive, real-time client-side flight dynamics simulator and sandbox modeling 2D rocket ascent, atmospheric drag profiles (Max-Q), gravity turns, staging, and orbital insertion on an HTML5 canvas.

## Features

- **2D Kinematics Physics Engine**: Simulates flight trajectories integrating gravity, dynamic thrust, propellant mass flow, and altitude-dependent drag in real time.
- **Multi-Stage Staging**: Configure and execute stage separation:
  - *Stage 1 (Booster)*: High thrust, high fuel capacity, heavy dry mass.
  - *Stage 2 (Orbital Sustainer)*: Medium thrust, high specific impulse (Isp) in vacuum, lightweight dry mass.
  - *Payload Jettison*: Fairing separation and payload deployment at high altitudes.
- **Dynamic Atmosphere Rendering**: Background gradient scrolls and darkens realistically from bright sky-blue near sea level, through indigo stratosphere, to starry pitch black space as altitude increases.
- **Live HUD Telemetry Dashboard**: Real-time readouts of Altitude (km), Speed (km/s), Acceleration (m/s²), current propellant level (%), Thrust (kN), and G-force.
- **Dynamic Pressure (Max-Q) Tracking**: Calculates aerodynamic stress $q = \frac{1}{2}\rho v^2$ showing when structural load peaks during ascent.
- **Steering & Steering Controls**:
  - *Throttle Controller Slider*: Adjust engine thrust from $0\%$ to $100\%$ dynamically.
  - *Steering Guideline Slider*: Steer rocket pitch angle ($0^\circ$ to $90^\circ$) to perform gravity turns.
  - *Separation Trigger*: Jettison Stage 1 and ignite Stage 2 when prompted.
- **Presets & Flight Scenarios**:
  - *Low Earth Orbit (LEO)*: Guide the rocket into a circular orbit at $160\text{ km}$ altitude at $\approx 7.8\text{ km/s}$ speed.
  - *Suborbital Test Flight*: Brief launch to test engine separation boundaries and parachuting.
  - *Heavy Cargo Lift*: Launch with a weather satellite payload.
- **Flight History Graphs**: Dual canvas plots charting Altitude vs Downrange distance (trajectory profile) and Speed vs Time in real time.
- **Mission Control Log Console**: Chronological logs of launch status markers ("T-minus...", "Liftoff!", "Max-Q", "Booster depletion", "Separation confirmed", "Orbit achieved").

## Flight Mechanics & Mathematical Foundations

### 1. Rocket Thrust
Thrust is calculated based on mass flow rate $\dot{m}$ and specific impulse ($I_{sp}$):
$$F_T = \text{throttle} \cdot \dot{m} \cdot I_{sp} \cdot g_0$$
where $g_0 = 9.80665\text{ m/s}^2$ is the standard gravitational acceleration.
At each time step $\Delta t$, the rocket's mass decreases:
$$M(t + \Delta t) = M(t) - \text{throttle} \cdot \dot{m} \cdot \Delta t$$

### 2. Gravity Decay
Gravity decreases with altitude $h$ following Newton's law of universal gravitation:
$$g(h) = g_0 \left(\frac{R_E}{R_E + h}\right)^2$$
where $R_E \approx 6371\text{ km}$ is Earth's radius.

### 3. Atmospheric Density & Drag
Atmospheric density $\rho$ drops exponentially with altitude $h$:
$$\rho(h) = \rho_0 e^{-h / H}$$
where $\rho_0 = 1.225\text{ kg/m}^3$ is sea-level density, and $H \approx 8.5\text{ km}$ is the scale height.
The aerodynamic drag force is given by:
$$\vec{F}_D = -\frac{1}{2} C_D A \rho ||\vec{v}|| \vec{v}$$
where $C_D$ is the drag coefficient and $A$ is the rocket's cross-sectional area.

### 4. Dynamic Pressure (Max-Q)
Dynamic pressure $q$ represents aerodynamic load per unit area:
$$q = \frac{1}{2}\rho ||\vec{v}||^2$$
Max-Q is reached when $q$ peaks during the ascent.

### 5. Orbital Insertion Criteria
To achieve a stable circular orbit at altitude $h$, the rocket must reach a horizontal orbital velocity ($v_{\text{orbit}}$) where centripetal acceleration matches gravity:
$$v_{\text{orbit}} = \sqrt{\frac{G M_E}{R_E + h}} = \sqrt{g(h) (R_E + h)}$$
At $160\text{ km}$ altitude, $v_{\text{orbit}} \approx 7.8\text{ km/s}$.

## File Structure

- `index.html`: Structuring flight dashboard controls, settings panel, telemetry visualizer canvas, and mission control logs.
- `style.css`: Styles for dark themed layouts, throttle sliders, rocket status lights, and telemetry chart borders.
- `script.js`: Flight integration loops, mass burn rates, drag solvers, telemetry plots, and key sequencer logs.
- `project.json`: Metadata configuration.
- `thumbnail.svg`: High-resolution vector thumbnail.
