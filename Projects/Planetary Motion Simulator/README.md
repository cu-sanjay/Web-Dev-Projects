# Planetary Motion Simulator

An interactive 2D orbital mechanics sandbox illustrating planetary revolution around the Sun, Kepler's Three Laws of Planetary Motion, Newtonian gravitation, and Vis-Viva orbital speed profiles.

## 🪐 Kepler's Three Laws of Planetary Motion

### 1. Kepler's First Law (Law of Orbits)
Every planet's orbit is an ellipse with the Sun located at one of the two foci:
$$\frac{(x-c)^2}{a^2} + \frac{y^2}{b^2} = 1$$

Where:
* $a$ is the semi-major axis (orbital radius).
* $b = a\sqrt{1-e^2}$ is the semi-minor axis.
* $e$ is the orbital eccentricity ($0 \le e < 1$).
* $c = a \cdot e$ is the focal distance from the center of the ellipse.

### 2. Kepler's Second Law (Law of Areas)
A line segment joining a planet and the Sun sweeps out equal areas during equal intervals of time:
$$\frac{dA}{dt} = \frac{1}{2} r^2 \frac{d\theta}{dt} = \frac{h}{2} = \text{constant}$$

Where:
* $h$ is the specific angular momentum ($h = r \cdot v_{\theta}$).
* This implies that planets speed up at **Perihelion** (closest approach to the Sun) and slow down at **Aphelion** (farthest approach).

### 3. Kepler's Third Law (Law of Periods)
The square of the orbital period $T$ of a planet is directly proportional to the cube of the semi-major axis $a$ of its orbit:
$$T^2 = \left(\frac{4\pi^2}{G M_s}\right) a^3 = K \cdot a^3$$

Where:
* $G$ is the Gravitational Constant.
* $M_s$ is the Sun's mass.
* $K \approx 2.97 \times 10^{-19} \text{ s}^2/\text{m}^3$ is Kepler's constant for the solar system.
* This implies that the ratio $T^2 / a^3$ is identical for *all* bodies orbiting the same central mass.

---

## 🛠️ Instant Presets & Features

1. **Space Viewport**:
   - Canvas-based 2D space environment showing a glowing Sun.
   - Colored orbit path lines for Mercury, Venus, Earth, Mars, Jupiter, and Saturn.
   - Lock-on diagnostic camera centering on the selected planet.
   - Vectors showing Velocity Vector (Cyan) and Gravitational Acceleration Vector (Fuchsia).

2. **Kepler's Laws suite**:
   - **First Law visualizer**: Plots the ellipse center, focal point (Focus 2), and major/minor axes.
   - **Second Law area sweeper**: Highlights wedge sectors drawn at equal time intervals to demonstrate conservation of angular momentum.
   - **Third Law Ledger**: Real-time table calculating and displaying $T^2 / a^3$ for all active planets to verify Kepler's constant.

3. **Custom Planet Builder**:
   - Adjust Semi-Major Axis ($a$), Eccentricity ($e$), and orbital plane color.
   - Deploy custom planets in real-time.
