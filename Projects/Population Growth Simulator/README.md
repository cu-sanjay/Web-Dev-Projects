# ECO-SPHERE: Population Growth Simulator

A premium, light botanical-themed interactive ecosystem simulation workspace modeling Exponential and Logistic biological population dynamics with real-time vector graphing, complete telemetry logs, and raw CSV data exporters.

---

## Eco-Dynamics & Biological Principles

This simulator models how biological populations change over discrete generational time steps under two classical ecological regimes:

- **Unlimited (Exponential) Growth**: In the absence of resource constraints, a population grows at a constant per-capita rate $r$, leading to unbounded geometric expansion. This model applies to early colonization events or species introduced to resource-rich environments.

- **Verhulst (Logistic) Growth**: Real ecosystems impose resource constraints. As population $N$ approaches the carrying capacity $K$, the growth rate declines sigmoidally, producing the characteristic S-curve that asymptotically stabilizes at $N = K$.

Key ecological phenomena observable:
- Density-dependent growth regulation
- Carrying capacity overshoot and resource saturation
- Extinction risk when death rate exceeds birth rate ($r < 0$)
- Equilibrium analysis at $N^* = K$ for logistic growth

---

## Mathematical Models

### Exponential Growth Model

**Differential form:**
$$\frac{dN}{dt} = r \cdot N$$

**Closed-form solution:**
$$N_t = N_0 \cdot e^{r \cdot t}$$

Where:
- $N_t$ = Population at time $t$
- $N_0$ = Initial population
- $r = b - d$ = Net intrinsic growth rate (birth rate minus death rate)
- $t$ = Time in generations

### Logistic Growth Model (Verhulst)

**Differential form:**
$$\frac{dN}{dt} = r \cdot N \cdot \left(1 - \frac{N}{K}\right)$$

**Closed-form solution:**
$$N_t = \frac{K \cdot N_0 \cdot e^{r \cdot t}}{K + N_0 \cdot (e^{r \cdot t} - 1)}$$

Where additional parameter:
- $K$ = Carrying capacity (maximum sustainable population)

### Derived Metrics

| Metric | Formula | Interpretation |
|---|---|---|
| Growth Velocity | $\frac{dN}{dt}$ | Instantaneous rate of population change |
| Resource Saturation | $\frac{N}{K} \times 100\%$ | Percentage of carrying capacity consumed |
| Net Growth Rate | $r = b - d$ | Balance of births over deaths |

---

## Architectural Code Design

### File Structure

```
├── index.html         Main application entry point
├── style.css          Complete theme and layout styling
├── script.js          Simulation engine and visualization logic
├── README.md          This documentation
├── project.json       Project metadata
└── thumbnail.svg      Vector preview graphic
```

### Architecture Overview

- **Zero Dependencies**: No build tools, package managers, or server-side runtime required.
- **Client-Side Only**: All computation runs in the browser using vanilla JavaScript.
- **CDN-Sourced Charting**: Chart.js v4 loaded via jsDelivr CDN for high-performance canvas rendering.
- **State Management**: Single-source-of-truth state object tracks all parameters, simulation progress, and data arrays.
- **Separation of Concerns**: Mathematical models isolated from rendering logic; visualization separated from control state.

### Data Flow

1. User manipulates sliders → state.params updated → simulation reset
2. RUN clicked → pre-compute all data arrays (O(tMax)) → begin animation loop
3. Each animation frame → advance step counter → update chart datasets → append table row → refresh telemetry cards
4. PAUSE toggles animation loop; STEP advances one generation
5. EXPORT CSV serializes simulation arrays → Blob → client-side download

---

## Simulation Operation Parameters

| Parameter | Range | Description |
|---|---|---|
| $N_0$ (Initial Population) | 10 – 5,000 | Starting population size |
| $b$ (Birth Rate) | 0.00 – 2.00 | Per-capita birth rate |
| $d$ (Death Rate) | 0.00 – 2.00 | Per-capita death rate |
| $r = b - d$ (Net Growth Rate) | −2.00 – 2.00 | Computed automatically |
| $K$ (Carrying Capacity) | 100 – 10,000 | Max sustainable population |
| $t_{max}$ (Time Horizon) | 10 – 200 | Number of generations to simulate |
| Model Toggle | Exponential / Logistic | Growth regime selector |

### Controls

- **RUN**: Execute full simulation with animation
- **PAUSE/STEP**: Pause running simulation or advance one generation
- **RESET**: Clear all data and return to initial state
- **EXPORT CSV**: Download simulation data as comma-separated values

### System Status Indicators

| Status | Meaning |
|---|---|
| AWAITING INITIALIZATION | Ready for input, no data computed |
| PROPAGATING GENERATIONAL ITERATIONS... | Simulation actively running |
| SIMULATION PAUSED | Animation suspended (press RUN or STEP to continue) |
| STABLE EQUILIBRIUM ACHIEVED | Carrying capacity reached or population stabilized |
| RESOURCE COLLAPSE WARNING | Environmental stress exceeds 90% of carrying capacity |

---

## Local Standalone Browser Execution

No server, build step, or installation required:

1. Clone or download this directory
2. Open `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari)
3. The application loads instantly — Chart.js is fetched from CDN on first load
4. For offline use, download Chart.js bundle and replace the CDN `<script>` tag with a local reference

### System Requirements

- Modern browser with HTML5 Canvas and ES6 support
- Internet connection (first load only, for Chart.js CDN)
- No additional software, frameworks, or package managers

---

## License

Educational and research use. Built as a technical demonstration of mathematical biology simulation and interactive data visualization.
