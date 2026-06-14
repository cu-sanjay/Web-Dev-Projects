# Palette Evolution Sandbox

An interactive, exploration-based color space utility that leverages linear and mutated channel interpolation algorithms to blend and evolve color families across generations.

---

## Chromatic Space Vector Math and Interp Algorithms

### Linear RGB Interpolation (LERP)

The core generative engine computes child colors by linear interpolation between two parent colors in RGB space. For each RGB channel:

$$C_{\text{child},k}(t) = C_{A,k} \cdot (1 - t) + C_{B,k} \cdot t$$

where $k \in \{R, G, B\}$, $C_A$ and $C_B$ are the parent channel values (0–255), and $t$ is the interpolation parameter ($0 \leq t \leq 1$).

### Mutation Injection

After computing the base interpolated value, a random mutation offset is applied to each channel independently:

$$C_{\text{final},k} = C_{\text{child},k} + \mathcal{U}(-M, M)$$

where $\mathcal{U}(-M, M)$ is a uniform random variable and $M$ is the mutation magnitude derived from the user-controlled Mutation Rate slider:

$$M = \frac{\text{MutationRate}}{100} \times 255$$

The mutation rate slider ranges from 0% to 20%, corresponding to a maximum per-channel displacement of 0 to 51 steps in 8-bit color space.

### Generation Sampling

For each evolution pass, 6 child colors are generated at evenly spaced $t$ values across the interpolation range:

$$t_i = 0.14 + \frac{i}{5} \times 0.72 \quad \text{for } i = 0, 1, \ldots, 5$$

This produces children that sample the central 72% of the interpolation curve, avoiding the extremes that would closely match the parents.

### Hue Distance (Delta Metric)

The angular distance between parent hues on the color wheel is calculated as:

$$\Delta H = \min(|H_A - H_B|, 360 - |H_A - H_B|)$$

where $H_A$ and $H_B$ are the hues of Parent A and Parent B in degrees (0–360). This value is displayed as the "Hue Distance" telemetry metric.

---

## Generative Array Mutation Architecture

### State Management

The application state is organized into a single dictionary:

```
state {
  parentA: { hex, rgb }     // Primary parent anchor (blue)
  parentB: { hex, rgb }     // Secondary parent anchor (purple)
  children: [                // 6 interpolated offspring
    { hex, rgb, index }
  ]
  generation: 0              // Active generation counter
  iterations: 0              // Total session evolutions
  mutationRate: 5            // Mutation percentage (0–20)
}
```

### Evolution Flow

1. **EVOLVE LINEAGE ROW**: Reads parent A and B RGB values, computes 6 interpolated+mutation children, increments generation and iteration counters, renders child swatches with hex labels and "SET AS PARENT" action buttons.

2. **MUTATE RANDOM PARENTAL SEEDS**: Assigns both parents entirely new random hex colors, then automatically generates a new lineage row.

3. **SET AS PARENT (A/B)**: Clicking "SET A" or "SET B" on a child swatch promotes that child to become the respective parent, increments the generation counter, and generates a new lineage row — enabling recursive evolutionary breeding cycles.

### Lineage Routing

The "SET AS PARENT" action buttons implement a listener pattern:

```
childActionBtn → click event → read child hex → 
  update state.parentA|B → update displays → 
  recalculate delta variances → regenerate children → 
  increment generation counter
```

This allows users to select any offspring and route it back into the breeding pool, creating complex evolutionary trajectories across generations.

---

## UI Component Hierarchy Blueprint

```
#app (grid: 280px 1fr)
├── .left-panel
│   ├── .panel-header (brand)
│   ├── .telemetry-deck (GEN, Hue Distance, Iterations)
│   ├── .mutate-control (mutation rate slider)
│   ├── .action-buttons (EVOLVE, MUTATE)
│   └── .diagnostics-bar (status messages)
│
└── .viewport
    ├── .viewport-header (title + gen badge)
    ├── .parent-deck
    │   ├── .parent-card#parent-a (Parent A swatch + hex input + picker)
    │   └── .parent-card#parent-b (Parent B swatch + hex input + picker)
    └── .offspring-section
        ├── .offspring-header (title + count)
        └── .child-strip
            └── .child-swatch-card × 6
                ├── .child-hex (hex code label)
                └── .child-actions
                    ├── .set-a (route to Parent A)
                    └── .set-b (route to Parent B)
```

### Data Flow

```
User Input (hex / picker / mutation slider)
       ↓
State Update (parentA, parentB, mutationRate)
       ↓
Interpolation Engine (6-point LERP + mutation)
       ↓
Child Array Generation
       ↓
DOM Render (parent cards + child strip + telemetry)
       ↓
Lineage Routing (SET A/B click → state update → re-interpolate)
```

---

## Operational Instructions

### Breeding a New Lineage

1. **Adjust parents**: Type hex codes or use the color pickers on Parent A and Parent B cards
2. **Set mutation rate**: Drag the slider (0%–20%) to control color variance
3. **Generate offspring**: Click **EVOLVE LINEAGE ROW** to produce 6 interpolated children
4. **Route a child**: Hover over any child swatch and click **SET A** or **SET B** to make it a parent of the next generation
5. **Randomize seeds**: Click **MUTATE RANDOM PARENTAL SEEDS** for fresh starting colors

### Understanding the Metrics

- **GEN**: Current generation number (increments on manual evolve or child routing)
- **Hue Distance**: Angular difference between parent hues on the color wheel (0°–180°)
- **Session Iterations**: Total number of EVOLVE actions performed
- **Mutation Rate**: Percentage of random per-channel displacement applied to each child

---

## File Directory Layout

```
palette-evolution-sandbox/
├── index.html        # Application structure with control panel, parent deck, child strip
├── style.css         # Dark theme, parent/child cards with smooth transitions
├── script.js         # Interpolation engine, state management, lineage routing
├── README.md         # This documentation file
├── project.json      # Project metadata configuration
└── thumbnail.svg     # Application thumbnail icon
```

### Architecture

- **index.html** — Dual-column layout: Engineering Control Center with telemetry (GEN, Hue Distance, Iterations), mutation slider, action buttons; Chromatic Breeding Canvas with parent deck (two swatches with hex inputs and pickers) and 6-card offspring lineage strip
- **style.css** — CSS Grid dashboard, parent cards with gradient overlays and backdrop-filter hex inputs, child swatches with hover scale/translate and action button reveal, smooth transitions on all color changes
- **script.js** — State management, RGB hex parsing/conversion, HSL utilities, linear interpolation engine with mutation injection, 6-point evenly-spaced generation sampling, child-to-parent lineage routing with generation tracking

---

## Local Deployment Verification

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, or Safari)
- No build tools, frameworks, or external dependencies required

### Steps

1. Clone or download the repository:
   ```
   git clone <repository-url>
   cd palette-evolution-sandbox
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
   - Two parent swatch cards (blue and purple defaults)
   - 6 child swatches
   - Telemetry showing GEN: 00, Hue Distance, 0 iterations

### Testing

1. Click **EVOLVE LINEAGE ROW** — verify 6 new child swatches appear
2. Adjust parent hex codes — verify automatic regeneration
3. Hover a child and click **SET A** — verify generation increments and new children generate
4. Move the mutation rate slider and evolve again — verify increased color variance
5. Click **MUTATE RANDOM PARENTAL SEEDS** — verify both parents change

---

## Technical Details

- **Interpolation**: Linear RGB with optional per-channel uniform mutation
- **Sample Points**: 6 evenly spaced $t$ values from 0.14 to 0.86
- **Mutation Range**: 0%–20% of 255 per channel (0–51 steps)
- **Generation Counter**: Increments on EVOLVE and child routing actions
- **Color Conversions**: RGB ↔ Hex with HSL utilities for hue distance
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
| Parent A accent | `#3b82f6` | Parent A badge and action buttons |
| Parent B accent | `#a855f7` | Parent B badge and action buttons |
| Evolution flash | `#10b981` | Active generation badge |
| Warning | `#ef4444` | Error states |
