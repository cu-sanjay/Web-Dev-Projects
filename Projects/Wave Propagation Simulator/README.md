# Wave Propagation Simulator

An interactive, real-time client-side physics simulator that models wave propagation, standing wave harmonics, and wave boundaries in 1D and 2D.

## 🌊 Mathematical & Physical Background

### 1. 1D Wave Dynamics
* **Transverse Waves**: Particles oscillate perpendicular to the direction of wave travel. The displacement $y(x, t)$ is modeled as:
  $$y(x, t) = A \sin(kx - \omega t + \phi)$$
* **Longitudinal Waves**: Particles oscillate parallel to the direction of wave travel, creating regions of high density (**Compressions**) and low density (**Rarefactions**).
* **Standing Waves & Harmonics**: Formed when two waves of identical frequency travel in opposite directions. For a string fixed at both ends, the standing wave pattern has nodes (amplitude = 0) and antinodes (amplitude = max). The harmonic wavelengths are:
  $$\lambda_n = \frac{2L}{n}, \quad n = 1, 2, 3, 4, \dots$$

### 2. 2D Wave Propagation (Water Ripples)
The propagation of waves in 2D is modeled by the classic second-order hyperbolic partial differential equation:
$$\frac{\partial^2 u}{\partial t^2} = c^2 \left( \frac{\partial^2 u}{\partial x^2} + \frac{\partial^2 u}{\partial y^2} \right)$$

Where:
* $u(x, y, t)$ is the wave amplitude displacement.
* $c$ is the wave speed.

### 3. Numerical Integration (Finite Difference Method)
To solve this in real-time on a discrete canvas grid, we approximate the spatial derivatives using central finite differences:
$$u_{i,j}^{t+1} = 2u_{i,j}^t - u_{i,j}^{t-1} + c^2 \Delta t^2 \left[ \frac{u_{i+1,j}^t + u_{i-1,j}^t - 2u_{i,j}^t}{\Delta x^2} + \frac{u_{i,j+1}^t + u_{i,j-1}^t - 2u_{i,j}^t}{\Delta y^2} \right]$$

Setting spatial resolution $\Delta x = \Delta y = 1$, the height update step becomes:
$$u_{i,j}^{t+1} = 2u_{i,j}^t - u_{i,j}^{t-1} + C \left( u_{i+1,j}^t + u_{i-1,j}^t + u_{i,j+1}^t + u_{i,j-1}^t - 4u_{i,j}^t \right) - \gamma (u_{i,j}^t - u_{i,j}^{t-1})$$

Where:
* $C = (c \cdot \Delta t)^2$ is the Courant coefficient (which must satisfy $C < 0.5$ for numerical stability).
* $\gamma$ is a damping coefficient representing wave energy dissipation over time.

---

## 🛠️ Simulation Settings & Modes

1. **1D String Visualizer**:
   - **Transverse Mode**: Vibrating string particles showing wavelength $\lambda$ adjustments.
   - **Longitudinal Mode**: spring coils showing moving compressions.
   - **Standing Wave Harmonics**: Visualizes the 1st, 2nd, 3rd, and 4th harmonics.

2. **2D Wave Sandbox**:
   - **Interactivity**: Click the canvas to trigger water ripple rings.
   - **Custom Barriers Brush**: Draw reflective barrier walls (grey cells) to guide waves or create custom slits.
   - **Oscilloscope Inspector**: Click or hover over any grid node to plot its height coordinates $u(t)$ over time.

3. **Astronomical & Optical Presets**:
   - **Young's Double Slit**: Traces neon interference fringes.
   - **Single Slit Diffraction**: Illustrates wave bending (diffraction).
   - **Standing Wave Nodes**: Forms static nodes in a circular or box boundary.
   - **Parabolic Mirror Focus**: Reflects plane waves into a single focus point.
