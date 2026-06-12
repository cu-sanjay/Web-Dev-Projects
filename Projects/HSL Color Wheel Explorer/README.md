# HSL Color Wheel Explorer

An interactive, exploration-based color space utility that leverages polar coordinate tracking geometry and trigonometric math to navigate the HSL spectrum in real time.

---

## Mathematical Geometry Foundations

### Polar Coordinate System

The HSL color wheel is modeled as a polar coordinate system where:

- **Angle ($\theta$)** maps to **Hue** ($0^\circ$ to $360^\circ$)
- **Radius ($r$)** maps to **Saturation** ($0\%$ to $100\%$)

The center of the wheel represents zero saturation (grayscale), while the perimeter represents fully saturated color.

### Trigonometric Angle Extraction

When the user interacts with the wheel, the system computes the displacement vector from the wheel center $(x_c, y_c)$ to the pointer position $(x_m, y_m)$:

$$\Delta x = x_m - x_c, \quad \Delta y = y_m - y_c$$

The angle $\theta$ is derived using the two-argument arctangent function, which correctly handles all four quadrant positions:

$$\theta = \text{atan2}(\Delta y, \Delta x)$$

The raw result (ranging from $-\pi$ to $\pi$) is normalized to a $0^\circ$ to $360^\circ$ range and rotated by $+90^\circ$ so that $0^\circ$ corresponds to the top of the wheel (pure red at $H = 0^\circ$).

### Radius Normalization

The Euclidean distance (hypotenuse) from center to pointer is:

$$r = \sqrt{\Delta x^2 + \Delta y^2}$$

This raw pixel distance is normalized against the physical wheel radius $R$ (half the container width) to produce the saturation percentage:

$$\text{Saturation} = \min\left(\frac{r}{R}, 1\right) \times 100\%$$

Values exceeding the wheel boundary are clamped to $100\%$, and the system flags an "OUT OF FIELD BOUNDS" diagnostic when the pointer exceeds the threshold by more than 6px.

---

## Coordinate Mapping Algorithms

### Mouse and Touch Event Pipeline

1. **Event Capture** — Unified `mousedown`/`touchstart`, `mousemove`/`touchmove`, `mouseup`/`touchend` listeners on the wheel field.

2. **Center Calculation** — `getBoundingClientRect()` extracts the wheel container's viewport coordinates. The center $(x_c, y_c)$ and radius $R$ are computed from the bounding rect.

3. **Delta Computation** — Pointer coordinates $(x_m, y_m)$ are subtracted from center to get deltas $(\Delta x, \Delta y)$.

4. **Polar Transformation** — $\text{atan2}(\Delta y, \Delta x)$ yields the angle; $\sqrt{\Delta x^2 + \Delta y^2}$ yields the radius.

5. **Normalization** — Angle is mapped to $0^\circ$-$360^\circ$ and rotated; radius is divided by $R$ and clamped to $[0, 1]$.

6. **State Injection** — Hue and Saturation values are updated in the state engine, which triggers the HSL-to-RGB pipeline and UI re-render.

### Reticle Positioning

The floating cursor reticle is positioned using CSS custom properties `--reticle-x` and `--reticle-y`, computed as percentages of the wheel container dimensions:

$$\text{reticle-x} = \left(\frac{x_m - x_c}{2R} + 0.5\right) \times 100\%$$

$$\text{reticle-y} = \left(\frac{y_m - y_c}{2R} + 0.5\right) \times 100\%$$

These values are set on `document.documentElement.style` and consumed by the `.reticle` class via `left: var(--reticle-x)` and `top: var(--reticle-y)`.

---

## HSL-to-RGB Conversion Architecture

The HSL-to-RGB conversion follows the standard cylindrical-coordinate algorithm:

### Algorithm Steps

1. **Chroma Calculation**: $C = (1 - |2L - 1|) \times S$
2. **Secondary Component**: $X = C \times (1 - |(H / 60) \bmod 2 - 1|)$
3. **Match Lightness**: $m = L - C / 2$
4. **Sector Mapping**: Determine RGB values based on the $60^\circ$ hue sector:
   - $0^\circ-60^\circ$: $(C, X, 0)$
   - $60^\circ-120^\circ$: $(X, C, 0)$
   - $120^\circ-180^\circ$: $(0, C, X)$
   - $180^\circ-240^\circ$: $(0, X, C)$
   - $240^\circ-300^\circ$: $(X, 0, C)$
   - $300^\circ-360^\circ$: $(C, 0, X)$
5. **Finalize**: $(R, G, B) = ((R_1 + m) \times 255, (G_1 + m) \times 255, (B_1 + m) \times 255)$

### Hex Encoding

The final 8-bit RGB channels are encoded as a six-digit hexadecimal string:

$$\text{Hex} = \#\text{rrggbb} \quad \text{where rr} = \text{pad2}(\text{round}(R).\text{toString}(16))$$

---

## Interface Operations

### Color Wheel Interaction

- **Click or touch** anywhere on the wheel to select a color
- **Drag** across the wheel for continuous real-time tracking
- The **reticle** follows the pointer with sub-pixel precision via CSS custom properties
- **Diagnostics** update instantly to show IDLE, SAMPLING, or OUT OF FIELD BOUNDS states

### Lightness Control

- The **Lightness slider** (0%–100%) adjusts the $L$ parameter independently of the wheel interaction
- The slider track shows a live gradient preview of the current hue at varying lightness levels
- Default value: 50%

### Telemetry Readouts

| Field | Source | Format |
|-------|--------|--------|
| Hue (Angle) | $\text{atan2}$ normalized | $0^\circ$–$360^\circ$ |
| Saturation (Radius) | $r / R$ normalized | $0\%$–$100\%$ |
| HSL String | `hsl(H, S, L)` | CSS color string |
| Hex Code | HSL→RGB→Hex | `#RRGGBB` |
| RGB Channels | HSL→RGB | `R, G, B` |
| Coordinates | $(\Delta x, \Delta y)$ | `(+dx, +dy)px` |

### Locking Swatches

- Click **LOCK SELECTED SWATCH TO PALETTE** to save the current color
- Locked swatches appear in the palette strip below the button
- Click any saved swatch to copy its hex code to the clipboard
- Duplicate hex codes are automatically rejected

---

## File Directory Layout

```
hsl-color-wheel-explorer/
├── index.html        # Application structure with HSL wheel container
├── style.css         # Dark theme, conic-gradient wheel, radial saturation overlay
├── script.js         # Polar coordinate engine, HSL↔RGB↔Hex converters
├── README.md         # This documentation file
├── project.json      # Project metadata configuration
└── thumbnail.svg     # Application thumbnail icon
```

### Architecture

- **index.html** — Dual-column layout: Control & Telemetry Panel (left) with lightness slider, precision telemetry cards, diagnostics bar, lock button, and palette strip; Polar Interaction Stage (right) with the conic-gradient color wheel, saturation overlay, reticle cursor, and center dot
- **style.css** — CSS Grid dashboard, conic-gradient hue wheel, radial-gradient saturation overlay, custom range slider, reticle with crosshairs and glow ring, telemetry card borders
- **script.js** — State management with tracking flags, trigonometric polar mapping (`atan2`, hypotenuse), HSL-to-RGB-to-Hex conversion pipeline, CSS custom property injection for reticle positioning, palette history with duplicate detection

---

## Local Deployment Verification

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, or Safari)
- No build tools, frameworks, or external dependencies required

### Steps

1. Clone or download the repository:
   ```
   git clone <repository-url>
   cd hsl-color-wheel-explorer
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
   - Full-spectrum conic-gradient color wheel
   - Floating reticle cursor
   - Precision telemetry panel

### Testing

1. Click and drag across the color wheel — verify hue and saturation update in real time
2. Move the lightness slider — verify the preview card and telemetry update
3. Click "LOCK SELECTED SWATCH TO PALETTE" — verify the swatch appears in the palette strip
4. Click a locked swatch — verify hex code is copied to clipboard
5. Verify diagnostics bar shows correct state (IDLE, SAMPLING, OUT OF FIELD BOUNDS)

---

## Technical Details

- **Coordinate System**: 2D polar with trigonometric mapping ($\text{atan2}$, hypotenuse)
- **Wheel Construction**: CSS `conic-gradient` (hue) + `radial-gradient` (saturation) with `mix-blend-mode: overlay`
- **Reticle Positioning**: CSS custom properties updated via inline style for GPU-composited motion
- **Color Conversion**: HSL → RGB → Hex with cylindrical coordinate algorithm
- **Theme**: Vercel, Figma, and Linear.app inspired dark dashboard
- **Typography**: `ui-monospace, Consolas, monospace` monospaced stack

### Color Reference

| Token | Hex | Usage |
|-------|-----|-------|
| App background | `#070a13` | Main canvas and body |
| Panel surface | `#111827` | Sidebar panels |
| Border | `#1f2937` | Panel dividers and outlines |
| Text primary | `#f8fafc` | Telemetry values |
| Text secondary | `#94a3b8` | Labels and metadata |
| Interactive | `#3b82f6` | Slider thumb, action button |
| Reticle | `#f8fafc` | Cursor ring and crosshairs |
| Status OK | `#10b981` | Diagnostic idle/sampling |
| Status warn | `#ef4444` | Out of bounds warning |
