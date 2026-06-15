# Fluid Dynamics Simulator

An interactive, real-time client-side fluid physics visualizer modeling fluid flow, pressure, velocity vectors, obstacles, emitters, and glowing tracer particles on an HTML5 canvas. Built on top of a grid-based Navier-Stokes solver (using Jos Stam's real-time fluid algorithm).

## Features

- **Interactive Grid Solver**: Drag the mouse to sweep fluid dye across the grid, creating turbulent shear waves, vortex flows, and color mixtures in real time.
- **Custom Emitters**: Drag and place continuous sources of fluid and color dye:
  - *Faucet*: Injects fluid with constant velocity.
  - *Dye Source*: Continuous injection of color dye.
  - *Drain*: Sucks fluid and dye out of the grid.
- **Solid Obstacles**: Draw and drag shapes inside the fluid field. The fluid will dynamically flow around:
  - *Circular Obstacle*: Classic flow obstruction.
  - *Square Obstacle*: High-drag block.
  - *Airfoil Wing*: Curved surface demonstrating Bernoulli's principle and lift dynamics.
- **Dye Color Palettes**: Toggle between gorgeous glowing neon colors (Cyan, Magenta, Lime Green, and Fire Orange) for injection.
- **Multiple Visualization Heatmaps**:
  - *Dye Density*: Renders the concentration of fluid dye in selected color gradients.
  - *Velocity Magnitude*: Heatmap representing local speed of the flow.
  - *Pressure Map*: Displays high-pressure boundaries and low-pressure wake turbulence.
  - *Velocity Vectors*: Overlays a grid of arrows matching velocity direction and strength.
- **Tracer Particles**: Trace 1,200+ weightless floating particle markers drifting along the velocity field, rendering smooth glowing streamlines.
- **Preset Configurations**:
  - *Karman Vortex Street*: Left-to-right laminar flow breaking into alternating vortices behind a circular obstacle.
  - *Lid-Driven Cavity*: Enclosed fluid chamber with a moving top boundary, driving circular vortex structures.
  - *Airfoil Lift Flow*: Flow splitting around a wing shape, visualizing boundary layer separation.
- **Live Logs Console**: Outputs details of Navier-Stokes integration phases (advection, diffusion, mass conservation projection) in real time.

## Mathematical & Numerical Foundations

### 1. Navier-Stokes Equations
The fluid flow is modeled by the incompressible Navier-Stokes equations:
$$\frac{\partial \vec{u}}{\partial t} + (\vec{u} \cdot \nabla)\vec{u} = -\frac{1}{\rho}\nabla p + \nu \nabla^2 \vec{u} + \vec{f}$$
$$\nabla \cdot \vec{u} = 0$$
where:
- $\vec{u} = (u, v)$ is the velocity vector field.
- $p$ is the pressure field.
- $\rho$ is the fluid density.
- $\nu$ is the kinematic viscosity.
- $\vec{f}$ represents external force vectors (mouse forces, emitters).

### 2. Numerical Integration Steps
We discretize the fields onto a grid of size $N \times N$ ($45 \times 45$ cells). Stam's solver splits the time step $\Delta t$ into sequential steps to maintain stability:

1. **Add Forces / Sources**:
   Accumulate forces from user inputs (mouse drag, emitters) and update the velocity field:
   $$\vec{u}^{n+1} = \vec{u}^n + \Delta t \vec{f}$$

2. **Diffusion**:
   Simulate friction/viscosity by solving the diffusion equation:
   $$\frac{\partial q}{\partial t} = \alpha \nabla^2 q$$
   where $q$ is density or velocity. We solve this implicitly via Gauss-Seidel relaxation to ensure unconditional stability:
   $$x_{i,j}^{new} = \frac{x_{i,j}^{old} + a(x_{i-1,j}^{new} + x_{i+1,j}^{new} + x_{i,j-1}^{new} + x_{i,j+1}^{new})}{1 + 4a}$$

3. **Advection**:
   Move quantities (dye density, velocity) along the velocity field. We use a stable **Semi-Lagrangian** method: instead of pushing particles forward, we trace backwards in time from each grid cell:
   $$\vec{x}_{prev} = \vec{x} - \Delta t \vec{u}(\vec{x})$$
   We look up the quantity at $\vec{x}_{prev}$ using bilinear interpolation and assign it to the current cell.

4. **Projection (Incompressibility)**:
   Ensure mass conservation ($\nabla \cdot \vec{u} = 0$). We decompose the velocity field into a divergence-free part and a gradient part (Helmholtz-Hodge decomposition):
   $$\nabla^2 p = \nabla \cdot \vec{u}$$
   We solve this Poisson equation for pressure $p$ using Gauss-Seidel relaxation, then subtract the pressure gradient from the velocity field:
   $$\vec{u}_{\text{incompressible}} = \vec{u} - \nabla p$$

### 3. Obstacle Boundary Conditions
For solid obstacles, we enforce no-penetration boundary conditions:
- At the boundaries of obstacles, the normal velocity component is set to zero (fluid cannot enter solid objects).
- The tangential velocity component is set to zero (no-slip condition) or matches the obstacle's velocity.
- Emitters and obstacles are mapped onto grid indices to reflect or block fluid step updates.

## File Structure

- `index.html`: Web layout featuring settings panels, canvas viewport, and real-time equation telemetry logs.
- `style.css`: Modern glassmorphic styles with responsive column flex layouts and neon slider highlights.
- `script.js`: Fluid grid arrays solver, semi-Lagrangian advection, Jacobi/Gauss-Seidel solvers, particle tracers, and mouse event mapping.
- `project.json`: Metadata configuration.
- `thumbnail.svg`: High-quality vector art showing vortex street turbulence.
