# CMYK to RGB Converter

An interactive, client-side color-space visualization platform that converts subtractive printing profiles into additive digital display channels. Features highly styled, color-coded range sliders for Cyan, Magenta, Yellow, and Key Black parameters, real-time hexadecimal and RGB string transpilers, an adaptive contrast preview tile, and an analytical telemetry monitor dashboard.

---

## Subtractive vs. Additive Color Theory

### Subtractive Color (CMYK)

The CMYK color model describes the absorption of light by physical pigments — the foundational model for process printing (cyan, magenta, yellow, and key black). Each channel represents the proportion of ink deposited on a white substrate:

- **Cyan ($C$)**: Absorbs red light, reflects green and blue.
- **Magenta ($M$)**: Absorbs green light, reflects red and blue.
- **Yellow ($Y$)**: Absorbs blue light, reflects red and green.
- **Key Black ($K$)**: Absorbs all visible light; deepens shadows, improves contrast, and reduces ink consumption.

Because inks physically absorb (subtract) wavelengths from incident white light, mixing all four channels produces a dark near-black, while the absence of all ink produces white (the paper substrate).

### Additive Color (sRGB)

The sRGB color model describes the emission of light from electronic displays — the foundational model for screens, monitors, and digital projectors. $R$, $G$, and $B$ channels represent independent light emitters:

- **Red ($R$)**: Emits long-wavelength light (~700 nm).
- **Green ($G$)**: Emits mid-wavelength light (~546 nm).
- **Blue ($B$)**: Emits short-wavelength light (~435 nm).

Mixing all three at full intensity produces white light; the absence of all emission produces black.

---

## Mathematical Color Matrix Transformations

### CMYK to RGB Conversion

Each sRGB channel is computed from the corresponding complementary CMYK channel scaled by the key black absorption:

$$R = 255 \cdot (1 - C) \cdot (1 - K)$$

$$G = 255 \cdot (1 - M) \cdot (1 - K)$$

$$B = 255 \cdot (1 - Y) \cdot (1 - K)$$

Where $C$, $M$, $Y$, $K$ are normalized to $[0.0, 1.0]$ from the slider percentages $[0, 100]$.

### Perceptual Lightness Threshold

To determine readable text color over the computed swatch, a weighted perceived lightness formula is used:

$$L = 0.299 \cdot R + 0.587 \cdot G + 0.114 \cdot B$$

If $L > 140$, dark text (`#0f172a`) is applied; otherwise, light text (`#f8fafc`) ensures WCAG-adequate readability against the background.

---

## Architectural Component Outline

### State Management

A single-source-of-truth `state` object tracks all active parameters:

| Property | Type | Description |
|----------|------|-------------|
| `c, m, y, k` | `number` | Current slider percentages (0–100) |
| `r, g, b` | `number` | Computed sRGB channels (0–255) |
| `hex` | `string` | 24-bit hex notation (`#FFFFFF`) |
| `rgb` | `string` | CSS rgb() string |
| `status` | `string` | Current system diagnostics descriptor |

### Signal Flow

```
Slider Input (C, M, Y, K)
       ↓
Normalize to [0.0, 1.0]
       ↓
R = 255 × (1 − C) × (1 − K)
G = 255 × (1 − M) × (1 − K)
B = 255 × (1 − Y) × (1 − K)
       ↓
Clamp to [0, 255] → Round to integer
       ↓
Format rgb(r, g, b) + #RRGGBB
       ↓
Update telemetry cards
       ↓
Set preview swatch background
       ↓
Compute lightness → toggle text color
       ↓
Update diagnostics banner
```

### File Structure

```
cmyk-to-rgb-converter/
├── index.html        # Dual-column layout with slider rack + preview
├── style.css         # Dark theme, color-coded slider tracks, animations
├── script.js         # Conversion pipeline, DOM sync, reset handler
├── README.md         # This documentation file
├── project.json      # Project metadata configuration
└── thumbnail.svg     # Application thumbnail icon
```

---

## User Operations Instructions

### Controls

| Control | Action |
|---------|--------|
| Cyan slider | Adjust cyan ink percentage (0–100%) |
| Magenta slider | Adjust magenta ink percentage (0–100%) |
| Yellow slider | Adjust yellow ink percentage (0–100%) |
| Key Black slider | Adjust key black ink percentage (0–100%) |
| RESET TO STANDARD ATMOSPHERE | Reset all sliders to 0% |

### Telemetry Readouts

- **Additive Vector**: The computed `rgb(R, G, B)` string for direct CSS use.
- **Hex Notation**: The computed 6-digit hexadecimal color string.

### Preview Swatch

The large right-panel tile displays the computed color in real-time. The `Aa` sample text automatically switches between dark and light for optimal readability. The transition is smoothed via `cubic-bezier(0.16, 1, 0.3, 1)`.

---

## Local Deployment Verification

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, or Safari)
- No build tools, frameworks, or external dependencies required

### Steps

1. Clone or download the repository:
   ```
   git clone <repository-url>
   cd cmyk-to-rgb-converter
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
   - Dual-column dark-theme dashboard
   - 4 color-coded sliders (Cyan, Magenta, Yellow, Key Black)
   - Telemetry cards showing `rgb()` and hex values
   - Large white preview swatch in the right panel
   - Diagnostics banner at the bottom of the control deck

### Testing

1. Drag the Cyan slider to 100% — verify preview swatch changes to cyan (`rgb(0, 255, 255)` / `#00FFFF`)
2. Drag the Magenta slider to 100% — verify preview swatch changes to magenta (`rgb(255, 0, 255)` / `#FF00FF`)
3. Drag the Yellow slider to 100% — verify preview swatch changes to yellow (`rgb(255, 255, 0)` / `#FFFF00`)
4. Drag Key Black to 100% — verify all channels fall to 0 and swatch turns black
5. Click "RESET TO STANDARD ATMOSPHERE" — verify all sliders return to 0% and swatch returns to white
6. Verify text color toggles between dark and light across different color values

---

## Technical Details

- **Layout**: Asymmetric dual-column CSS Grid (300px control deck + fluid viewport)
- **Conversion**: CMYK → sRGB per the subtractive-to-additive matrix with Key black scaling
- **Lightness**: Weighted perceived brightness ($0.299R + 0.587G + 0.114B$)
- **Slider Styling**: Color-coded gradient tracks with neon-blue focus halos
- **Theme**: Vercel, Figma, and Linear.app inspired dark dashboard
- **Typography**: `ui-monospace, Consolas, monospace` for all numerical readouts; system sans-serif for labels

### Color Reference

| Token | Hex | Usage |
|-------|-----|-------|
| App background | `#070a13` | Main canvas and body |
| Panel surface | `#111827` | Sidebar panels |
| Cell borders | `#1f2937` | Module and card borders |
| Primary text | `#f8fafc` | High-contrast typography |
| Secondary text | `#94a3b8` | Labels and metadata |
| Cyan channel | `#06b6d4` | Cyan slider track |
| Magenta channel | `#ec4899` | Magenta slider track |
| Yellow channel | `#eab308` | Yellow slider track |
| Key Black channel | `#64748b` | Key slider track |
