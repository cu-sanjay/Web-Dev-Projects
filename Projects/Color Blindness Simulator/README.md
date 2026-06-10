# Color Blindness Simulator

An interactive digital accessibility laboratory for simulating color vision deficiencies using SVG matrix-transformation color-space filter overlays.

---

## Color Science Theory

### Human Color Vision

Human color vision is mediated by three types of cone photoreceptor cells in the retina, each sensitive to different wavelengths of light:

- **L-cones** (Long-wavelength): Peak sensitivity ~560nm (red-yellow region)
- **M-cones** (Medium-wavelength): Peak sensitivity ~530nm (green region)
- **S-cones** (Short-wavelength): Peak sensitivity ~420nm (blue-violet region)

Normal trichromatic vision uses all three cone types to perceive the full visible color spectrum.

### Color Vision Deficiencies

| Condition | Affected Cones | Prevalence | Effect |
|-----------|---------------|------------|--------|
| Protanopia | L-cones missing | ~2.5% males, ~0.05% females | Red-green confusion, reduced red perception |
| Deuteranopia | M-cones missing | ~6.0% males, ~0.4% females | Red-green confusion, reduced green perception |
| Tritanopia | S-cones missing | ~0.05% (equal sex ratio) | Blue-yellow confusion |
| Achromatopsia | All cones non-functional | ~0.003% (1 in 33,000) | Complete color blindness (monochromacy) |

---

## SVG `<feColorMatrix>` Mathematical Formulations

### Color-Space Matrix Transformation

Each vision deficiency is simulated by applying a $4 \times 5$ color matrix transformation to the rendered content via the CSS `filter: url(#deficit-matrix)` property. The general transformation is:

$$\begin{bmatrix} R' \\ G' \\ B' \\ A' \end{bmatrix} = \begin{bmatrix} m_{00} & m_{01} & m_{02} & 0 & m_{04} \\ m_{10} & m_{11} & m_{12} & 0 & m_{14} \\ m_{20} & m_{21} & m_{22} & 0 & m_{24} \\ 0 & 0 & 0 & 1 & 0 \end{bmatrix} \cdot \begin{bmatrix} R \\ G \\ B \\ A \\ 1 \end{bmatrix}$$

### Normal Trichromacy (Identity)

$$\begin{bmatrix} 1 & 0 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 & 0 \\ 0 & 0 & 1 & 0 & 0 \\ 0 & 0 & 0 & 1 & 0 \end{bmatrix}$$

No transformation; the original sRGB values pass through unchanged.

### Protanopia (L-cone deficit)

$$\begin{bmatrix} 0.567 & 0.433 & 0 & 0 & 0 \\ 0.558 & 0.442 & 0 & 0 & 0 \\ 0 & 0.242 & 0.758 & 0 & 0 \\ 0 & 0 & 0 & 1 & 0 \end{bmatrix}$$

The red channel is reconstructed from green and blue information, simulating the absence of L-cone response.

### Deuteranopia (M-cone deficit)

$$\begin{bmatrix} 0.625 & 0.375 & 0 & 0 & 0 \\ 0.700 & 0.300 & 0 & 0 & 0 \\ 0 & 0.300 & 0.700 & 0 & 0 \\ 0 & 0 & 0 & 1 & 0 \end{bmatrix}$$

The green channel is reconstructed from red and blue information, simulating the absence of M-cone response.

### Tritanopia (S-cone deficit)

$$\begin{bmatrix} 0.950 & 0.050 & 0 & 0 & 0 \\ 0 & 0.433 & 0.567 & 0 & 0 \\ 0 & 0.475 & 0.525 & 0 & 0 \\ 0 & 0 & 0 & 1 & 0 \end{bmatrix}$$

The blue channel is reconstructed from red and green information, simulating the absence of S-cone response.

### Achromatopsia (Grayscale)

$$\begin{bmatrix} 0.299 & 0.587 & 0.114 & 0 & 0 \\ 0.299 & 0.587 & 0.114 & 0 & 0 \\ 0.299 & 0.587 & 0.114 & 0 & 0 \\ 0 & 0 & 0 & 1 & 0 \end{bmatrix}$$

All three output channels are computed as the same weighted sum of input RGB values (ITU-R BT.601 luma coefficients), producing a grayscale image.

### Hardware Acceleration

Because the transformation is applied as a CSS `filter` referencing an SVG `<feColorMatrix>`, all pixel processing is handled by the GPU compositor pipeline, eliminating JavaScript-side pixel loops and delivering native frame-rate performance.

---

## Code Directory Layout

```
color-blindness-simulator/
├── index.html        # Application structure + inline SVG filter definitions
├── style.css         # Dark engineering theme and simulation stage art
├── script.js         # Filter switchboard and telemetry engine
├── README.md         # This documentation file
├── project.json      # Project metadata configuration
└── thumbnail.svg     # Application thumbnail icon
```

### Architecture

- **index.html** — Dual-column layout: Vision Matrix Controller (left) with deficiency selection buttons and scientific telemetry; Simulation Stage (right) with gradient bars, Ishihara-inspired color circles, geometric color blocks, contrast text samples, and overlapping transparency tests. Inline SVG filter definitions for all five vision profiles.
- **style.css** — CSS Grid dashboard, simulation stage with `transition: filter 0.4s var(--ease-out-expo)`, vision button active states, confusion zone markers, Ishihara circle grid, color art block array.
- **script.js** — State management, vision profile database (prevalence statistics, receptor data, accessibility classifications), filter switchboard with `<feColorMatrix>` URL application, telemetry populator with fade transitions, axis guide toggle.

---

## Operational Instructions

### Simulating a Vision Deficiency

1. Click any vision profile button in the left panel:
   - **Normal Trichromacy** — default clear state
   - **Protanopia** — red-blind simulation
   - **Deuteranopia** — green-blind simulation
   - **Tritanopia** — blue-blind simulation
   - **Achromatopsia** — complete grayscale

2. Observe the simulation stage update instantly via the GPU-composited `feColorMatrix` filter.

3. Read the scientific telemetry panel for detailed diagnostic data.

### Interactive Controls

- **TOGGLE CONFUSION AXIS GUIDE** — Highlights the red-green color confusion bar at the bottom of the simulation stage, with a crimson glow. Active while any deficiency is simulated.
- **RESET TO STANDARDIZED VISION** — Returns to normal trichromacy and clears any active axis guide overlays.

### Test Content

The simulation stage contains purpose-built visual test elements:
- **Full-spectrum gradient bar** — tests hue discrimination across the visible spectrum
- **Ishihara-inspired circles** — pseudo-isochromatic dot patterns that become invisible under specific deficiencies
- **16-cell color grid** — discrete saturated color blocks for differentiation testing
- **Contrast text samples** — 10 color combinations testing readability under each deficiency
- **Red-green confusion bar** — 10-segment gradient from pure red through yellow to cyan, rendered indistinguishable under protanopia/deuteranopia
- **Overlapping transparency test** — three semi-transparent RGB circles demonstrating additive color mixing

---

## Local Deployment Verification

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, or Safari)
- No build tools, frameworks, or external dependencies required

### Steps

1. Clone or download the repository:
   ```
   git clone <repository-url>
   cd color-blindness-simulator
   ```

2. Open `index.html` in your web browser:
   ```
   # On Windows
   start index.html

   # On macOS
   open index.html

   # On Linux
   xdg-open index.html
   ```

3. Verify the application loads with:
   - Dual-column dashboard layout
   - Dark engineering theme (#070a13 background)
   - Five vision profile selection buttons
   - Simulation stage with colorful test content
   - Scientific telemetry panel with prevalence data

### Testing

1. Click "Deuteranopia" and verify the stage desaturates red-green content
2. Click "Achromatopsia" and verify the stage renders entirely in grayscale
3. Click "TOGGLE CONFUSION AXIS GUIDE" and verify the confusion bar highlights
4. Verify telemetry values update with each profile change
5. Test that the RESET button returns to normal vision

---

## Technical Details

- **Filter Engine**: SVG `<feColorMatrix>` with `color-interpolation-filters="sRGB"`
- **Matrix Models**: Brettel-Vienot-Mollon derived LMS transformation matrices
- **Rendering Pipeline**: GPU-composited CSS filter with hardware acceleration
- **Animation**: `transition: filter 0.4s var(--ease-out-expo)` for smooth profile switching
- **Theme**: Vercel, Figma, and Linear.app inspired dark dashboard
- **Typography**: `ui-monospace, Consolas, monospace` monospaced stack

### Color Reference

| Token | Hex | Usage |
|-------|-----|-------|
| App background | `#070a13` | Main canvas and body |
| Panel surface | `#111827` | Sidebar panels |
| Border | `#1f2937` | Panel dividers and outlines |
| Text primary | `#f8fafc` | Headers and labels |
| Text secondary | `#94a3b8` | Sub-headers and metadata |
| Normal vision | `#3b82f6` | Trichromacy accent |
| Simulation active | `#10b981` | Active deficiency profile |
| Warning | `#ef4444` | Confusion zone markers |
