# Solar Eclipse Simulator

An interactive, educational client-side sandbox that simulates the orbital mechanics, light ray geometry, and sky views during a solar eclipse. Users can configure lunar distance, inclination, and node alignments, as well as select their latitudinal viewing position to see the transition between Total, Annular, and Partial solar eclipses.

## 🌕 Physics & Astronomical Geometry

### 1. Shadow Cones: Umbra, Penumbra, and Antumbra
Solar eclipses are defined by how the Moon blocks light rays originating from the Sun's disk:
* **Umbra (Total Eclipse)**: The inner, dark region of the shadow cone where the light source is completely obstructed by the Moon. A viewer within the umbra sees a **Total Solar Eclipse**.
* **Penumbra (Partial Eclipse)**: The outer, semi-shaded region of the shadow where only a portion of the Sun is blocked. A viewer here sees a **Partial Solar Eclipse**.
* **Antumbra (Annular Eclipse)**: The region beyond the vertex of the umbra. In this zone, the Moon appears entirely inside the Sun's disk, leaving a ring of light. A viewer here sees an **Annular Solar Eclipse** (or "Ring of Fire").

The transition between a Total and Annular eclipse is determined by the Moon's distance from Earth (apogee vs perigee) due to the eccentricity of the Moon's orbit.

### 2. Lunar Orbital Inclination & Nodes
The Moon orbits Earth at an inclination of approximately $5.14^\circ$ relative to the ecliptic plane (Earth's orbit around the Sun).
* **Conjunction (New Moon)**: Occurs every 29.53 days.
* **Nodes**: The two points where the Moon's tilted orbit intersects the ecliptic plane.
* **Eclipse Season**: A solar eclipse can *only* occur during a New Moon when the alignment is near one of the nodes (conjunction near nodes). If the Moon is too far above or below the ecliptic plane, its shadow misses Earth entirely.

### 3. Key Optical Milestones (Totality)
* **First Contact (C1)**: The Moon's limb first touches the Sun's edge (start of partial phase).
* **Second Contact (C2)**: The start of totality or annularity. Right before C2, the **Diamond Ring Effect** occurs as a single point of light shines through, preceded or followed by **Baily's Beads** (sunlight streaming through lunar valleys).
* **Totality**: The Sun's bright photosphere is completely hidden, revealing the faint, white, wispy **Solar Corona**. The sky becomes dark as twilight, temperatures drop, and birds/insects respond to the sudden night.
* **Third Contact (C3)**: Totality ends; the second Diamond Ring flashes on the opposite limb.
* **Fourth Contact (C4)**: The Moon fully leaves the Sun's disk (eclipse ends).

---

## ⚙️ Simulator Dashboards

1. **Dual Visualizer Layout**:
   - **Orbital Mechanics Pane**: Renders Sun rays, Earth, Moon, and traces the geometric Umbra and Penumbra shadow cones in real-time.
   - **Sky Viewer Pane**: Recreates the visual appearance of the Sun and Moon from Earth. Dynamically simulates the solar corona flares, Baily's beads sparkles, the diamond ring, and ambient sky illumination levels.

2. **Adjustable Orbital Controls**:
   - **Moon Distance (Perigee/Apogee)**: Varies Moon's angular diameter. Demonstrates why a closer Moon causes a Total eclipse, while a farther Moon causes an Annular eclipse.
   - **Orbital Inclination & Node Alignment**: Demonstrates how changing the inclination angle causes the shadow to pass above/below Earth.
   - **Viewer Position Selector**: Allows the viewer to scroll across latitudes (e.g. from the center of the path of totality into the partial penumbral zone).

3. **Presets**:
   - **Total Solar Eclipse**: Perfect node alignment and Moon at perigee.
   - **Annular Solar Eclipse**: Perfect node alignment and Moon at apogee.
   - **Partial Solar Eclipse**: Slight node misalignment resulting in partial obstruction.
   - **No Alignment (Shadow Miss)**: Demonstrates a typical New Moon where the tilted lunar orbit causes the shadow to pass into empty space.
