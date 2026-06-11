# PAGI-SPROUT // Page Replacement Simulator

An interactive browser-based educational platform for simulating and visualizing virtual memory page replacement algorithms. Built with a premium light botanical UI theme, this tool transforms abstract operating systems concepts into tangible, real-time interactive frame grids.

---

## Virtual Memory Architecture & Page Swapping Mechanics

In modern operating systems, virtual memory enables processes to address more memory than physically available. Memory is divided into fixed-size blocks called **pages** (virtual) and **frames** (physical). When a process references a memory address, the Memory Management Unit (MMU) translates the virtual page number to a physical frame number via a **page table**.

If the referenced page is not currently resident in physical memory, a **page fault** occurs, triggering the OS to load the page from disk into a physical frame. When all physical frames are occupied, the OS must **evict** an existing page to make room — this is where **page replacement algorithms** govern the eviction policy.

### Key Performance Metrics

The efficiency of a page replacement algorithm is measured by its ability to minimize page faults:

$$PFR = \left( \frac{\text{Total Page Faults}}{\text{Total Page Requests}} \right) \cdot 100\%$$

$$CHR = \left( \frac{\text{Total Page Hits}}{\text{Total Page Requests}} \right) \cdot 100\% = 100\% - PFR$$

Optimal cache utilization minimizes the absolute page fault tally:

$$Faults = \sum_{t=1}^{t_{max}} [Request(t) \notin F_t]$$

Where $F_t$ is the set of frames resident in physical memory at time $t$.

---

## Comparative Evaluation of Page Eviction Schemes

### First-In-First-Out (FIFO)

Maintains a circular queue of resident pages. The page that entered memory first is evicted first, regardless of usage patterns. Simple to implement but can suffer from **Belady's Anomaly** — where increasing the number of frames paradoxically increases the page fault rate.

### Least Recently Used (LRU)

Evicts the page that has remained unreferenced for the longest backward temporal window. LRU leverages **temporal locality** — pages accessed recently are likely to be accessed again. It requires tracking a timestamp or access order for each resident page, making it more complex than FIFO but typically yielding lower fault rates.

### Optimal Page Replacement (OPT)

Also known as Belady's Algorithm, OPT evicts the page that will not be referenced for the longest duration in the future. By looking forward through the reference string, OPT produces the **minimum possible page fault rate** for any fixed frame count. It serves as a theoretical benchmark since actual implementations cannot peer into the future.

---

## Structural Time-Travel State Machine Topology

The simulator maintains a single-source-of-truth state matrix tracking:

- Complete **reference string** with page sequence
- **Step-by-step history logs** storing full cache frame snapshots, eviction vectors, hit/fault status, and running fault tallies
- A **current timeline index pointer** enabling forward/backward navigation through execution history
- **Aggregate telemetry** including total faults, cache hit ratio, and performance variance versus baseline FIFO

The state machine fully supports bidirectional stepping through the execution timeline without recomputation, enabling detailed study of memory state transitions at each time tick.

---

## Interface Operational Guidelines

1. **Select Algorithm** — Choose FIFO, LRU, or OPT via the tabbed selector on the left panel.
2. **Configure Frames** — Set the number of physical frame slots (3–7) using the range slider.
3. **Load Reference String** — Enter a comma-separated sequence of page numbers, or load a preset:
   - *Belady's Anomaly* — Demonstrates FIFO's counterintuitive fault behavior.
   - *High Locality* — A sequence with strong temporal/spatial locality patterns.
   - *Cyclic Saturation* — A cyclical reference pattern for stress testing.
4. **Execute** — Use action buttons to control simulation flow:
   - **RUN ENTIRE SEQUENCE** — Computes the complete timeline in one pass.
   - **STEP NEXT TICK** — Advance one time step forward.
   - **PREVIOUS STEP** — Rewind one time step backward.
   - **FLUSH CACHE** — Clear all simulation state and reset.
   - **EXPORT CSV** — Download full diagnostic matrices as a CSV file.
5. **Analyze Results** — The right viewport displays:
   - **Diagnostic header** showing current time, page request, status, CHR, and PFR.
   - **Step-by-Step Frame Trace Matrix** — A horizontal scrolling timeline of frame states at each tick.
   - **Telemetry Cards** displaying total faults, cache hit ratio, and variance vs FIFO.
   - **Fault Convergence Chart** — Live-updating cumulative fault curve.
   - **Execution Telemetry Log** — Tabular log of every step with cache state and fault ratio.

---

## Local Standalone Browser Deployment

This application runs entirely client-side with no server dependencies, build steps, or compilation tools.

### Requirements

- A modern web browser (Chrome, Firefox, Edge, Safari)
- Internet connection for first load (Chart.js is fetched from CDN; subsequent loads may cache locally)

### Setup

1. Clone or download the repository containing the six project files.
2. Open `index.html` in any modern web browser.
3. The simulator is ready to use — no installation or build step required.

### File Structure

```
page-replacement-simulator/
  index.html       — Main application structure
  style.css        — Botanical theme stylesheet
  script.js        — Simulation engine and UI controllers
  thumbnail.svg    — Vector preview graphic
  project.json     — Project metadata
  README.md        — This documentation
```

---

## License

MIT — Free for educational and personal use.
