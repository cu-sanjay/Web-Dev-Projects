# Heat Transfer Simulator

An interactive, real-time client-side heat transfer and thermodynamics visualizer modeling conduction, isotherms, and heat flux vectors on a custom painted grid. Built on top of an unconditionally stable implicit 2D finite-difference heat diffusion solver.

## Features

- **Multi-Material Painting Sandbox**: Paint different materials directly onto the plate:
  - *Copper*: High thermal conductivity (dissipates heat rapidly).
  - *Iron*: Moderate thermal conductivity.
  - *Glass*: Low thermal conductivity (sluggish heat transfer).
  - *Wood*: Extremely low thermal conductivity (acts as an insulator).
  - *Air*: Low-density convection gap.
- **Fixed Temperature Sources & Sinks**:
  - *Heater Node*: Paints fixed hot nodes (up to $500^\circ\text{C}$).
  - *Cooler Node*: Paints fixed cold nodes (down to $-100^\circ\text{C}$).
  - *Eraser*: Wipes the cells back to ambient air.
- **Dynamic Visualization Modes**:
  - *Thermal Heatmap*: Displays a smooth color gradient mapping cold (blue), ambient (black), and hot (orange/red/white) temperatures.
  - *Isothermal Contours*: Renders isotherms (loops of equal temperature) using grid segment crossings.
  - *Heat Flux Vectors*: Overlays vector arrows showing the rate and direction of thermal flow ($q = -k\nabla T$) based on local gradients.
- **Interactive Probes**: Drag a thermometer sensor to display localized coordinate readouts, local temperature, heat capacity, material type, and a historical temperature chart.
- **Adjustable Boundary Modes**: Toggle between:
  - *Insulated (Neumann boundary)*: Zero heat exchange at canvas boundaries (adiabatic walls).
  - *Convective (Newton cooling boundary)*: Heat radiates to surrounding ambient air at a specified rate.
- **Demo Configurations**:
  - *Heat Sink Fins*: Standard CPU cooling fin geometry demonstrating surface area heat dissipation.
  - *Thermal Bridge*: Shows structural thermal leakage through a steel bolt intersecting wooden insulation.
  - *Concentric Insulation*: Insulated pipe layers showcasing radial temperature gradients.
- **Live Logs Console**: Details finite-difference relaxation steps, material properties, and thermal convergence rates in real time.

## Mathematical & Numerical Foundations

### 1. 2D Heat Diffusion Equation
Thermal conduction inside the grid is governed by the heat equation:
$$c_p \rho \frac{\partial T}{\partial t} = \nabla \cdot (k \nabla T) = \frac{\partial}{\partial x}\left(k\frac{\partial T}{\partial x}\right) + \frac{\partial}{\partial y}\left(k\frac{\partial T}{\partial y}\right)$$
where:
- $T(x,y,t)$ is the temperature field.
- $k(x,y)$ is the material's thermal conductivity.
- $c_p(x,y)$ is the heat capacity.
- $\rho(x,y)$ is the density.

### 2. Implicit Finite Difference Discretization
To allow high conductivities and fast steps without numerical instabilities, we discretize the equation implicitly using a backward Euler scheme:
$$C_{i,j} \frac{T_{i,j}^{n+1} - T_{i,j}^n}{\Delta t} = \frac{k_{i+1/2,j}(T_{i+1,j}^{n+1} - T_{i,j}^{n+1}) - k_{i-1/2,j}(T_{i,j}^{n+1} - T_{i-1,j}^{n+1})}{\Delta x^2} + \frac{k_{i,j+1/2}(T_{i,j+1}^{n+1} - T_{i,j}^{n+1}) - k_{i,j-1/2}(T_{i,j}^{n+1} - T_{i,j-1}^{n+1})}{\Delta y^2}$$
where $k_{i+1/2,j} = \frac{k_{i,j} + k_{i+1,j}}{2}$.
We solve this sparse linear system at each frame using Gauss-Seidel or Jacobi relaxation:
$$T_{i,j}^{new} = \frac{T_{i,j}^{old} + H_R T_{i+1,j} + H_L T_{i-1,j} + H_D T_{i,j+1} + H_U T_{i,j-1}}{1 + H_R + H_L + H_D + H_U}$$
where:
- $H_R = \frac{\Delta t}{2 C_{i,j} \Delta x^2}(k_{i,j} + k_{i+1,j})$
- $H_L = \frac{\Delta t}{2 C_{i,j} \Delta x^2}(k_{i,j} + k_{i-1,j})$
- $H_D = \frac{\Delta t}{2 C_{i,j} \Delta y^2}(k_{i,j} + k_{i,j+1})$
- $H_U = \frac{\Delta t}{2 C_{i,j} \Delta y^2}(k_{i,j} + k_{i,j-1})$

This implicit structure remains stable for any value of conductivity $k$ or time step $\Delta t$, enabling interactive painting.

### 3. Fourier's Law of Heat Flux
The directional thermal flow represented by the arrow field is computed using Fourier's Law:
$$\vec{q} = -k \nabla T = \left(-k \frac{\partial T}{\partial x}, -k \frac{\partial T}{\partial y}\right)$$
This vector field directs arrows from hot source areas towards cold sink boundaries, with arrow length scaling with flow rate.

## File Structure

- `index.html`: Structuring the control sidebar, materials palette brushes, canvas workspace, and telemetry HUD logs.
- `style.css`: Styles for glassmorphic elements, slider ranges, custom material color buttons, and console readouts.
- `script.js`: Solves the implicit conduction equations, computes isotherms, Fourier vectors, and captures drag-painting cursor events.
- `project.json`: Metadata configuration.
- `thumbnail.svg`: High-resolution vector thumbnail illustrating thermal conduction.
