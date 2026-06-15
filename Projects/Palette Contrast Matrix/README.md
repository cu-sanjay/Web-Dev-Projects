# Palette Contrast Matrix

An interactive, exploration-based color accessibility studio generating a dynamic 4×4 cross-tabulated matrix table to analyze contrast ratios across all permutations of user color inputs. Implements W3C relative luminance mathematical formulas to provide instantaneous WCAG 2.2 compliance validation logs.

---

## W3C Luminance Mathematics Foundations

### sRGB to Linear Conversion

The sRGB color space encodes gamma-compressed values. To compute accurate luminance, each channel must first be linearized:

$$C_{\text{linear}} = \begin{cases} \frac{C_{\text{sRGB}}}{12.92} & \text{if } C_{\text{sRGB}} \leq 0.04045 \\ \left( \frac{C_{\text{sRGB}} + 0.055}{1.055} \right)^{2.4} & \text{otherwise} \end{cases}$$

### Relative Luminance (Y)

The relative luminance of a color is the weighted sum of its linearized RGB channels, using the ITU-R BT.709 primaries:

$$Y = 0.2126 \cdot R_{\text{linear}} + 0.7152 \cdot G_{\text{linear}} + 0.0722 \cdot B_{\text{linear}}$$

### Contrast Ratio

The WCAG 2.2 contrast ratio compares the relative luminance of two colors (lighter vs. darker):

$$\text{Contrast Ratio} = \frac{L_{\text{lighter}} + 0.05}{L_{\text{darker}} + 0.05}$$

The resulting ratio ranges from 1:1 (identical luminance) to 21:1 (black vs. white).

---

## Combinatorial Data-to-Table DOM Pipeline Architecture

### State Management

A single-source-of-truth `state` object tracks:

| Property | Type | Description |
|----------|------|-------------|
| `colors` | `string[4]` | Active hex color values |
| `passedCount` | `number` | Number of AA-passing pairs |
| `status` | `string` | Current system status descriptor |

### Rendering Pipeline

```
User Input Mutation
       ↓
state.colors updated
       ↓
renderMatrix() called
       ↓
Clear grid → Build 5×5 layout
       ↓
For each col: create header swatch (BG 01–04)
For each row: create label swatch (FG 01–04)
       ↓
16× nested loop: cell = { fg: colors[row], bg: colors[col] }
       ↓
Compute contrastRatio(fg, bg) → getWCAGGrade(ratio)
       ↓
Assemble cell: preview text, ratio value, compliance badge
       ↓
Count passes → update telemetry + status
```

### WCAG Threshold Table

| Grade | Minimum Ratio | Passes AA | Passes AAA |
|-------|---------------|-----------|------------|
| AAA | 7.0:1 | ✅ | ✅ |
| AA | 4.5:1 | ✅ | ❌ |
| AA Large | 3.0:1 | ✅ (18pt+) | ❌ |
| FAIL | < 3.0:1 | ❌ | ❌ |

---

## Accessibility Threshold Definitions

- **AA (Normal Text)**: Contrast ratio ≥ 4.5:1 — required for all body text under 18pt (or 14pt bold).
- **AA (Large Text)**: Contrast ratio ≥ 3.0:1 — applies to text ≥ 18pt (or ≥ 14pt bold).
- **AAA (Normal Text)**: Contrast ratio ≥ 7.0:1 — enhanced readability for all text sizes.
- **AAA (Large Text)**: Contrast ratio ≥ 4.5:1 — enhanced readability for large text.

The matrix flags each of the 16 combinations with the appropriate grade badge, using color-coded visual indicators for pass/fail states.

---

## Operational User Guide

### Controls

| Control | Action |
|---------|--------|
| Color Picker (native) | Select a color visually for any seed |
| HEX Text Field | Type or paste a 6-digit hex value (e.g., `#3b82f6`) |
| MUTATE RANDOM SEEDS | Generate four random colors instantly |

### Reading the Matrix

- **X-axis (column headers)**: Background colors (BG 01–04)
- **Y-axis (row headers)**: Foreground/text colors (FG 01–04)
- **Intersection cells**: Each cell displays:
  - `Aa` preview text in the foreground color on the background color
  - Numerical contrast ratio (e.g., `12.34`)
  - WCAG compliance badge (`AAA`, `AA`, `AA-L`, or `FAIL`)

### Telemetry Dashboard

- **Total Permutations**: Fixed at 16 (4 foregrounds × 4 backgrounds)
- **Accessible Pairs**: Running count of pairs passing AA (≥ 4.5:1), formatted as `NN / 16 PASSED`
- **Diagnostics Banner**: System status updates reflecting current state

---

## Local Deployment Verification

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, or Safari)
- No build tools, frameworks, or external dependencies required

### Steps

1. Clone or download the repository:
   ```
   git clone <repository-url>
   cd palette-contrast-matrix
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
   - 4 color seed modules with pickers and hex inputs
   - 5×5 matrix grid with headers and 16 populated cells
   - Telemetry cards showing total permutations and accessible pairs
   - Diagnostics banner at the bottom of the control deck

### Testing

1. Change a color picker value — verify the matrix updates immediately
2. Type a hex code manually and press Enter — verify the picker and matrix sync
3. Click "MUTATE RANDOM SEEDS" — verify all 4 colors change and matrix recalculates
4. Verify contrast ratios match manual calculation using the W3C formula
5. Verify badge colors switch between `badge-pass`/`badge-fail` based on threshold
6. Resize the browser — verify layout remains stable with scroll boundaries

---

## Technical Details

- **Layout**: Asymmetric dual-column CSS Grid (300px control deck + fluid viewport)
- **Matrix**: 5×5 CSS Grid (`grid-template-columns: repeat(5, 1fr)`) with 6px gap
- **Canvas**: DOM-based (no Canvas API) — pure HTML/CSS cells for accessibility and composability
- **Color Space**: sRGB ↔ linear RGB with gamma decoding per IEC 61966-2-1
- **Luminance**: ITU-R BT.709 primaries (Rec. 709 / sRGB)
- **Contrast Ratio**: WCAG 2.2 definition per Understanding SC 1.4.3
- **Theme**: Vercel, Figma, and Linear.app inspired dark dashboard
- **Typography**: `ui-monospace, Consolas, monospace` monospaced stack for all ratio and hex display

### Color Reference

| Token | Hex | Usage |
|-------|-----|-------|
| App background | `#070a13` | Main canvas and body |
| Panel surface | `#111827` | Sidebar and grid headers |
| Grid cell surface | `#0f1421` | Default cell backgrounds |
| Cell borders | `#1f2937` | Grid lines and module borders |
| Primary text | `#f8fafc` | High-contrast typography |
| Secondary text | `#94a3b8` | Labels and metadata |
| Success / AA pass | `#10b981` | Pass badges and indicators |
| Danger / FAIL | `#ef4444` | Fail badges and indicators |
| Focus / AAA | `#3b82f6` | Focus states and AAA badges |
| Warning / AA-L | `#f59e0b` | Large-text AA badges |
