# Contrast Accessibility Checker // WCAG Evaluation Suite

Contrast Accessibility Checker is a premium frontend utility designed to resolve the dynamic design accessibility requirements detailed in **Issue #874**. By translating complex visual space metrics into real-time numerical checks, the application provides frontend engineers with a streamlined diagnostic tool to verify visual readability and ensure inclusive interface architecture.

---

## Technical Capabilities & Core Specifications

### 1. High-End Engineering Workspace Scaffolding (`style.css`)

- **Strict Real Estate Bounds Constraint:** Encompasses all UI sections inside an anti-shiver container frame layout (`max-width: 1200px`, `height: 760px`) to prevent visual component jumping across high-end desktop monitors.
- **Jitter-Proof Monospaced HUD Panels:** Mathematical ratios, relative luminance metrics, hexadecimal text characters, and compliance verification checkmarks implement explicit monospaced font stacks (`ui-monospace, Consolas, monospace`), ensuring text mutations trigger zero spatial structural shifts.
- **Component Utility States:**
  - `.compliance-badge.pass`: Swaps element text colors to neon emerald green (`#10b981`), appending a glowing drop-shadow backlight backdrop.
  - `.compliance-badge.fail`: Swaps element text colors to high-contrast warning crimson red (`#ef4444`), triggering micro-pulse animations to emphasize visibility faults.
  - `#specimen-preview-box`: Dynamically accepts inline style variable mutations to transform foreground color and background color values concurrently.

### 2. Relative Luminance & Contrast Evaluation Engine (`script.js`)

- **Hexadecimal Color Space Parser:** Intercepts color value strings directly from native HTML color inputs, decomposing tracking structures into standalone Red, Green, and Blue (RGB) 8-bit integer formats (0 to 255).
- **Relative Linear Luminance Formula ($Y$):** Converts standard sRGB integer coordinates into relative linear luminance coefficients matching official WCAG equations. The system maps components down to explicit decimals:
  $$C_{sRGB} = \frac{C_{8bit}}{255}$$
  $$C_{linear} = \left( C_{sRGB} \le 0.04045 \right) ? \frac{C_{sRGB}}{12.92} : \left( \frac{C_{sRGB} + 0.055}{1.055} \right)^{2.4}$$
  $$Y = 0.2126 \times R_{linear} + 0.7152 \times G_{linear} + 0.0722 \times B_{linear}$$
- **Mathematical Compliance Verification Loop:** Calculates final contrast scores using linear relative parameters where $L_1$ acts as the lighter luminance and $L_2$ acts as the darker luminance value:
  $$\text{Contrast Ratio} = \frac{L_1 + 0.05}{L_2 + 0.05}$$
- **Threshold Parsing Filters:** Evaluates calculation ratios against official WCAG standards:
  1. **Normal Text Bounds:** Level AA requires $\ge 4.5:1$; Level AAA requires $\ge 7:1$.
  2. **Large Text Bounds ($\ge 18\text{pt}$ or bold $\ge 14\text{pt}$):** Level AA requires $\ge 3:1$; Level AAA requires $\ge 4.5:1$.
- **LocalStorage State Persistence:** Captures and serializes structural hexadecimal selections into local browser contexts, retaining active colors over window refreshes.

---

## Workspace Directory Layout

```text
Contrast Accessibility Checker/
├── index.html       # Structural Semantic Control Panels and Specimen Text Nodes
├── style.css        # Premium Dark-Mode Sheets, Color Variables, and Badge Shaders
├── script.js        # Relative Luminance Calculations and WCAG Verification Engine
├── project.json     # Architecture Manifest Descriptor Metadata
└── README.md        # Technical Engineering Specifications Documentation
```
