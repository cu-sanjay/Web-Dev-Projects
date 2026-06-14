# 🪐 2D Physics Engine Particle Sandbox & Collision Simulator

An interactive, premium HTML5 Canvas physics simulation playground. Model vector mathematics, circles bouncing, elastic momentum equations, custom spring tethers, and hand-drawn line slides with a high-performance rendering loop.

---

## 🚀 Live Demo
Simply open `index.html` in your web browser, or host it locally using a static web server.

---

## 🌟 Key Features

1. **Vector Drawing Sandbox Board**:
   - Canvas workspace supporting particle spawning by clicking.
   - Click and drag to create static barrier lines (slopes, ramps, and boundaries).
   - Slingshot physics: drag particles back and launch them with custom speed and angle vectors.
   - Spring constraints: connect two particles with flexible spring cords.

2. **Custom Physics Parameters Dashboard**:
   - **Gravity**: Accelerate particles down, up, or sideways (ranges from -20 to 20 m/s²).
   - **Restitution (Bounciness)**: Control kinetic energy retention during collisions (elastic to inelastic).
   - **Air Damping (Friction)**: Add friction decay parameters to mock terminal velocity loops.
   - **Spring Stiffness**: Change spring cord tensions.

3. **Collision Resolution Engine**:
   - Particle-to-wall border collision rebound.
   - Particle-to-particle elastic collision mathematics (conservation of momentum and kinetic energy).
   - Particle-to-static barrier line normal vector bounce projection math.
   - Smart position correction buffer layers to prevent items from sticking or overlapping.

4. **Environment Presets**:
   - **Newton's Cradle**: A row of tethered suspended balls illustrating elastic collisions.
   - **Pachinko Grid**: Spawns arrays of static round obstacles to filter falling balls.
   - **Orbital Gravity Chaos**: Set gravity to zero and play with particle inertia and spring cords.

---

## 🛠️ Code Structure

- [index.html](file:///index.html): Simulation layout, drawing board selectors, properties faders, and timeline managers.
- [style.css](file:///style.css): Dark mode glassmorphic templates, accent faders, custom ranges, and responsive layouts.
- [script.js](file:///script.js): Collision resolution vectors, constraint spring loops, spatial partitioning check optimizations, presets, and requestAnimationFrame loops.
- [project.json](file:///project.json): Project configuration metadata. 
