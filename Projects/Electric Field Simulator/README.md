# Electric Field Simulator

An interactive, client-side HTML5 canvas physics sandbox that computes and visualizes electric fields, field lines, and equipotential voltage contours from point charges, line charges, and parallel plates. It also features charged particle trajectory tracing using Coulomb forces.

## Features

- **Interactive Sandbox**: Drag-and-drop point charges, line charges, parallel plates, and a voltage sensor probe around the canvas in real time.
- **Electric Field Lines**: Trace smooth field line curves starting from positive charges (rendered in glowing cyan) and terminating on negative charges (rendered in glowing red) or sandbox boundaries.
- **Electric Field Vectors**: Draw a grid of arrows representing the field direction and magnitude (indicated by opacity/length) across the canvas.
- **Equipotential Contours**: Calculate and render isometric contour curves where the electrical potential ($V$) remains constant.
- **Potential Heatmap**: Toggle a smooth color-gradient background overlay mapping positive potential (cyan glow) and negative potential (magenta/red glow) dynamically.
- **HUD Telemetry Dashboard**: Real-time readouts of peak electric field, active charge count, active trace particle count, and simulator FPS.
- **Sensor Probe Board**: Drag a sensor probe to view exact coordinates, local electric field vector $\vec{E} = (E_x, E_y)$ in V/m, total electric field strength, and electric potential $V$ in Volts.
- **Charged Particle Injector**: Launch particles with specified charge, mass, and initial velocity vectors. Track their trajectories under Coulomb forces:
  $$\vec{F} = q\vec{E}$$
  using numerical Verlet integration with gorgeous glowing neon path trails.
- **Formulas Console Log**: A dedicated text panel that updates in real time to show the mathematical models and physics equations being evaluated.

## Physics & Mathematical Foundations

### 1. Point Charge Electric Field
The electric field $\vec{E}$ at a position $\vec{r}$ due to a point charge $q$ located at $\vec{r}_i$ is given by Coulomb's Law:
$$\vec{E}(\vec{r}) = \frac{k_e q}{||\vec{r} - \vec{r}_i||^2} \hat{u}$$
where:
- $k_e$ is the electrostatic constant (simplified in the simulator space).
- $\hat{u} = \frac{\vec{r} - \vec{r}_i}{||\vec{r} - \vec{r}_i||}$ is the unit vector pointing from the charge to the position.
- $q$ is the charge magnitude.

### 2. Point Charge Electric Potential
The electric potential $V$ at position $\vec{r}$ is a scalar field calculated as:
$$V(\vec{r}) = \frac{k_e q}{||\vec{r} - \vec{r}_i||}$$
For multiple charges, the total potential and field are obtained using the principle of superposition:
$$\vec{E}_{\text{total}}(\vec{r}) = \sum_i \vec{E}_i(\vec{r})$$
$$V_{\text{total}}(\vec{r}) = \sum_i V_i(\vec{r})$$

### 3. Line Charges and Parallel Plates
- **Line Charges** are modeled as a linear grid of discrete point charges spaced closely together. This allows uniform numerical evaluation of fields and potentials without needing complicated analytic piecewise segment integrations.
- **Parallel Plates** are modeled as two parallel line charges of equal and opposite charge density, creating a highly uniform electric field in the gap between them.

### 4. Trajectory Tracing (Equations of Motion)
A particle of mass $m$ and charge $q_p$ placed in the field experiences an electrostatic force:
$$\vec{F} = q_p \vec{E}_{\text{total}}$$
According to Newton's Second Law:
$$\vec{a} = \frac{d\vec{v}}{dt} = \frac{q_p \vec{E}_{\text{total}}}{m}$$
The simulator uses Euler-Verlet integration to solve these equations step-by-step:
$$\vec{v}_{t + \Delta t} = \vec{v}_t + \vec{a}_t \Delta t$$
$$\vec{r}_{t + \Delta t} = \vec{r}_t + \vec{v}_{t + \Delta t} \Delta t$$
To ensure stability, particles are automatically captured or removed if they collide directly with charges or leave the simulation boundaries.

## File Structure

- `index.html`: Structuring the panels, controls, simulation canvas, and consoles.
- `style.css`: Styling the glassmorphic science dashboard panels, custom ranges, neon icons, and buttons.
- `script.js`: Core physics engine, integration loops, drag handlers, particle solvers, and canvas drawing routines.
- `project.json`: Metadata configuration.
- `thumbnail.svg`: Visual banner representing the physics simulations.
