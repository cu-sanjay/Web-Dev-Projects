# Lens Optics Simulator

An interactive thin lens ray tracer and refraction sandbox visualizer. It models geometric paraxial refraction (Convex/Concave lenses) and boundary surface index refraction (triangular prisms, parallel glass slabs) with Cauchy dispersion spectrum splitting.

## 📐 Mathematical & Physical Background

### 1. Refraction & Snell's Law
When light travels from a medium with refractive index $n_1$ to another with index $n_2$:
$$n_1 \sin\theta_1 = n_2 \sin\theta_2$$

Where $\theta_1$ and $\theta_2$ are the angles relative to the interface normal.

### 2. Vector Refraction
In 2D vector space, an incident ray with unit direction vector $\vec{d}$ striking a boundary with unit normal $\hat{n}$ (pointing towards the incident side) refracts in direction $\vec{d}_r$:
$$\vec{d}_r = \eta \vec{d} + \left( \eta \cos\theta_1 - \cos\theta_2 \right) \hat{n}$$

Where:
* $\eta = \frac{n_1}{n_2}$ is the ratio of refractive indices.
* $\cos\theta_1 = -\vec{d} \cdot \hat{n}$.
* $\cos\theta_2 = \sqrt{1 - \eta^2 (1 - \cos^2\theta_1)}$.

If the term under the square root is negative, the ray undergoes **Total Internal Reflection (TIR)**. The ray reflections instead follow:
$$\vec{d}_{\text{reflected}} = \vec{d} - 2(\vec{d} \cdot \hat{n})\hat{n}$$

### 3. Thin Lens Equations
For a lens with focal length $f$:
$$\frac{1}{d_o} + \frac{1}{d_i} = \frac{1}{f}$$

Where:
* $d_o$ is the object distance from the lens center.
* $d_i$ is the image distance from the lens center (positive for real images on the opposite side, negative for virtual images on the same side).
* $f$ is the focal length (positive for convex/converging lenses, negative for concave/diverging lenses).

The lateral magnification $m$ is:
$$m = -\frac{d_i}{d_o} = \frac{h_i}{h_o}$$

### 4. Cauchy Dispersion Formula
The refractive index $n$ of glass varies slightly with wavelength $\lambda$ (color):
$$n(\lambda) = A + \frac{B}{\lambda^2}$$

As white light (a composite of different wavelengths) hits a prism at an angle, different colors bend by slightly different amounts, dispersing into a rainbow.

---

## 🎨 Simulation Modes & Scenarios

1. **Thin Lens Conjugation (Geometric Ray Tracing)**:
   - **Convex/Concave Lenses**: Drag the object arrow to see paraxial principal rays (parallel, focal, central) form real or virtual images.
   
2. **Prism Spectrometer & Refraction Sandbox**:
   - **Triangular Prism**: Shoot white light and watch it split into 7 glowing spectral rays.
   - **Glass Block (Slab)**: Illustrates lateral ray displacement.
   - **Critical Angle**: Shows Total Internal Reflection inside high-index glass boundaries.
