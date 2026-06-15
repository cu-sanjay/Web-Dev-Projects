# Lunar Orbit Visualizer

An interactive 2D orbital mechanics sandbox illustrating the Moon's revolution around Earth, tidal locking, lunar phases, apsidal/nodal precession, and optical libration (wobbling).

## 🌙 Celestial Mechanics & Orbital Dynamics

### 1. Elliptical Orbit & Keplerian Velocity
The Moon orbits Earth in an elliptical trajectory with a mean eccentricity $e \approx 0.0549$.
* **Perigee (Closest Approach)**: $r_p \approx 363,300\text{ km}$ from center of Earth.
* **Apogee (Farthest Approach)**: $r_a \approx 405,500\text{ km}$ from center of Earth.

According to the Vis-Viva equation:
$$v = \sqrt{G(M_E + M_m)\left(\frac{2}{r} - \frac{1}{a}\right)}$$

Where:
* $a$ is the semi-major axis ($384,400\text{ km}$).
* $r$ is the current Earth-Moon distance.
* The Moon speeds up at perigee ($v \approx 1.08\text{ km/s}$) and slows down at apogee ($v \approx 0.97\text{ km/s}$).

### 2. Tidal Locking (1:1 Spin-Orbit Resonance)
Tidal locking occurs due to gravitational gradient forces dragging the Moon's shape over billions of years.
* **Synchronous Rotation**: The Moon takes exactly the same time to complete one rotation on its axis as it does to complete one orbit around Earth ($27.32$ days).
* **Consequence**: The same hemisphere (the near side) always faces Earth, while the far side remains hidden from Earth observers.

### 3. Libration (Optical Wobbling)
Although the Moon is tidally locked, an observer on Earth can see about $59\%$ of the lunar surface over the course of a month due to **Libration**:
* **Libration in Longitude**: Caused by the Moon's elliptical orbit. The Moon's orbital speed varies (Kepler's 2nd Law) while its axial rotation is uniform. This causes the Moon's rotation to lead or lag its orbital position, letting us peer past the eastern and western limbs.
* **Libration in Latitude**: Caused by the tilt of the Moon's rotational axis (about $6.69^\circ$ relative to its orbit plane). This allows us to peer past the northern and southern poles.

---

## ⚙️ Visualizer Panels & Features

1. **Dual Canvas Presentation**:
   - **Orbital Path View**: Rendered from above the ecliptic plane showing the Sun's rays, Earth, Moon, elliptical trajectory trail, and the Line of Apsides.
   - **Librational Moon View**: Shows the Moon as seen by an observer on Earth, displaying crater textures, phase terminator shading lines, and horizontal/vertical coordinate wobbling (libration).

2. **Configs & Preset Parameters**:
   - **Eccentricity Controls**: Set the orbit shape from circular ($e=0.0$) to highly elliptical ($e=0.4$) to see extreme speed changes and libration swings.
   - **Inclination Adjustments**: Tilt the orbital plane to visualize vertical libration.
   - **Conjunction Scrubber**: Slide through time manually or play the clock to watch phases transition from New Moon to Crescent, Quarter, Gibbous, and Full Moon.
