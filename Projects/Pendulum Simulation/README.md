# Pendulum Simulation

---

## Mathematical System Overview

This simulator models the non-linear dynamics of a simple pendulum using the exact differential equation governing angular acceleration:

$$\frac{d^2\theta}{dt^2} + \frac{g}{L} \sin\theta = 0$$

For damped motion, a velocity-proportional drag term is included:

$$\frac{d^2\theta}{dt^2} + b\frac{d\theta}{dt} + \frac{g}{L} \sin\theta = 0$$

Where:
- \(\theta\) = angular displacement (rad)
- \(L\) = pendulum cable length (m)
- \(g\) = gravitational acceleration (m/s\u00b2)
- \(b\) = damping coefficient

### Energy Equations

- **Potential Energy**: \(PE = mgL(1 - \cos\theta)\)
- **Kinetic Energy**: \(KE = \frac{1}{2}mL^2\omega^2\)
- **Total Mechanical Energy**: \(E = PE + KE\)

---

## Physics Engine Specifications

- **Numerical Integration**: Semi-implicit Euler (symplectic) method with fixed 120 Hz timestep for stable energy conservation
- **No linear small-angle approximation** \u2014 uses exact \(\sin\theta\) term, supporting full 180\u00b0 swings and over-the-top trajectories
- **Variable timestep accumulation** with step capping prevents physics explosion under frame drops
- **Damping**: Linear velocity-proportional drag, configurable from 0 (vacuum) to 0.1 (viscous medium)

---

## Interactive Dashboard Controls

| Control | Function |
|---|---|
| Cable Length slider | Adjusts L from 0.5 m to 3.0 m |
| Gravity buttons | Toggle between Earth, Mars, Moon |
| Damping slider | Sets air resistance coefficient |
| PAUSE / RESUME | Freezes or continues physics |
| RESET | Returns pendulum to 30\u00b0 initial angle |
| Canvas drag | Click and drag the bob to any angle |

---

## Architectural Component Outline

```
Pendulum Simulation/
  index.html        Three-column layout (controls, canvas, energy)
  style.css         Dark lab theme, styled energy bars, custom sliders
  script.js         Physics engine, canvas renderer, drag interaction
  README.md         Documentation
  project.json      Project metadata
  thumbnail.svg     Visual preview
```

---

## Local Execution Deployment Steps

1. Clone or download the repository
2. Navigate to the `Pendulum Simulation` directory
3. Open `index.html` in any modern web browser
4. Adjust parameters and drag the pendulum bob to begin
