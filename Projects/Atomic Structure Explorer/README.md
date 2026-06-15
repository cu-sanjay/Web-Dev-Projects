# Atomic Structure Explorer

An interactive, real-time client-side simulator that combines a nuclear isotope builder with a Bohr quantum transition model. It provides a visual platform to explore atomic structures, electron configurations, ionization charges, isotope stability, and spectral emission wavelengths.

## ⚛️ Mathematical & Physical Background

### 1. The Bohr Model Orbitals
In the Bohr model, electrons orbit the central nucleus in discrete, quantized spherical shells. The radius $r_n$ of the $n$-th shell is modeled as:
$$r_n = n^2 \cdot r_0$$

Where:
* $n$ is the principal quantum number ($n = 1, 2, 3, 4, \dots$).
* $r_0$ is the Bohr radius (scaled for screen visualization).

The maximum electron capacity of each shell follows $2n^2$:
* Shell 1 (K): 2 electrons
* Shell 2 (L): 8 electrons
* Shell 3 (M): 18 electrons (Madelung rule limits this to 8 for $Z \le 20$ in ground states)
* Shell 4 (N): 32 electrons

### 2. Quantum Electron Transitions (Rydberg Formula)
When an electron falls from a higher initial energy level $n_i$ to a lower final energy level $n_f$, it emits a photon. The wavelength $\lambda$ of the emitted light is modeled by the Rydberg formula:
$$\frac{1}{\lambda} = R_H \left( \frac{1}{n_f^2} - \frac{1}{n_i^2} \right)$$

Where:
* $R_H \approx 1.097 \times 10^7 \text{ m}^{-1}$ is the Rydberg constant.
* For transitions ending at $n_f = 2$, this resolves to the **Balmer Series** (visible light spectrum):
  - $n = 3 \to 2$: Red light ($656.3$ nm)
  - $n = 4 \to 2$: Cyan light ($486.1$ nm)
  - $n = 5 \to 2$: Blue light ($434.0$ nm)
  - $n = 6 \to 2$: Violet light ($410.2$ nm)

### 3. Nuclear Stability & Net Charge
* **Isotopic Stability**: A nucleus is stable if the ratio of neutrons $N$ to protons $Z$ lies within the valley of stability. For light elements ($Z \le 20$), this ratio is stable near $N/Z \approx 1.0$.
* **Ionization Charge**: The net charge $q$ is determined by the balance of protons and electrons:
  $$q = Z - E$$
  - If $q = 0$: Neutral Atom.
  - If $q > 0$: Cation (positively charged).
  - If $q < 0$: Anion (negatively charged).

---

## 🛠️ Simulation Features & Presets

1. **Atomic Sandbox Builder**: Increment or decrement protons, neutrons, and electrons. Watch the element profile update in real time.
2. **Quantum transition panel**: Excite electrons to higher orbits and relax them. Emits colored photon wave packets and lights up corresponding lines on the spectrometer.
3. **Element Presets**: Quick loading configurations for elements like Hydrogen ($H$), Carbon ($C$), Neon ($Ne$), and Calcium ($Ca$).
