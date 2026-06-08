# Projectile Motion Simulator

---

## Mathematical Overview

This simulator models classical ballistic trajectories using the fundamental kinematic equations of projectile motion under uniform gravitational fields. The core governing equation describes the parabolic path of a projectile launched at an angle \(\theta\) with initial velocity \(u\):

$$y = x \tan\theta - \frac{g x^2}{2 u^2 \cos^2\theta}$$

### Key Derived Quantities

- **Horizontal Range**: \(R = \dfrac{u^2 \sin(2\theta)}{g}\)
- **Maximum Height**: \(H = \dfrac{u^2 \sin^2\theta}{2g}\)
- **Time of Flight**: \(T = \dfrac{2u \sin\theta}{g}\)

---

## Key Features

- Real-time ballistic trajectory plotting with interactive parameter controls
- Adjustable launch angle (0\u00b0\u201390\u00b0) via precision range slider
- Configurable initial velocity (5\u2013100 m/s)
- Three gravitational environments: Earth (9.81 m/s\u00b2), Mars (3.71 m/s\u00b2), Moon (1.62 m/s\u00b2)
- Live telemetry readouts for max range, peak apogee, and total flight time
- Instantaneous position tracking (X(t), Y(t)) during flight
- Cartesian grid with labeled axes and markers for apex and impact
- Real-time animated projectile with glow trail rendering

---

## Architectural Directory Layout

```
Projectile Motion Simulator/
  index.html        Application entry point with dual-column layout
  style.css         Dark lab theme, CSS Grid, custom-styled controls
  script.js         Physics engine, canvas renderer, animation loop
  README.md         Documentation and usage guide
  project.json      Project metadata
  thumbnail.svg     Visual preview thumbnail
```

---

## Deployment Guide

1. Clone or download the repository
2. Navigate to the `Projectile Motion Simulator` directory
3. Open `index.html` in any modern web browser
4. Adjust angle, velocity, and gravity parameters
5. Press **FIRE BALISTIC SIMULATION** to launch

No build tools, compilers, or external dependencies are required.

---

## Analytical Trajectory Formulas

The parametric equations governing the motion are:

$$x(t) = u \cdot t \cdot \cos\theta$$

$$y(t) = u \cdot t \cdot \sin\theta - \frac{1}{2} g \cdot t^2$$

Where:
- \(u\) = initial velocity (m/s)
- \(\theta\) = launch angle (degrees)
- \(g\) = gravitational acceleration (m/s\u00b2)
- \(t\) = time (s)
