# MEM-SPROUT // Memory Management Simulator

An ultra-premium, light botanical-themed interactive memory allocation simulation workspace modeling First Fit, Best Fit, and Worst Fit RAM management mechanics with live address-mapped block visualizations, internal/external fragmentation tracking profiles, heap compactor engines, and raw CSV state exporters.

---

## Memory Allocation Systems and Contiguous Partitioning Foundations

Contiguous memory allocation assigns each process a single contiguous block of physical memory. The system maintains a list of available (free) blocks and on request searches for a suitable block using one of three classical strategies. Over time, as processes are allocated and deallocated, the free space becomes fragmented — broken into small non-contiguous pieces that together may be sufficient but individually are too small to satisfy new requests.

### Block Model

The physical RAM is represented as an ordered array of variable-sized blocks. Each block carries:

- **Base Address** and **Limit Address** — hex-encoded boundaries within the 16-bit address space
- **Size** — total capacity in KB
- **Status** — `free` or `allocated`
- **Process ID** — owning process tag (when allocated)
- **Used Size** — actual KB consumed by the process (may be less than block size)
- **Waste** — internal fragmentation within the block (size minus used size)
- **Lifetime** — remaining simulation steps before automatic deallocation

---

## Comparative Mechanics of Allocation Schemes

### Internal Fragmentation

Internal fragmentation measures wasted space *within* an allocated block — the portion of the block that is reserved for a process but not actually used.

$$F_{int} = \text{Size}(B_j) - \text{Size}(R_i) \quad \text{where } B_j \text{ is allocated to } R_i$$

The metric tracks the cumulative waste across all allocated blocks. High internal fragmentation indicates that processes are being given blocks larger than they need, wasting usable memory.

### External Fragmentation

External fragmentation occurs when the total free space across all blocks is sufficient to satisfy a request, but no *single* contiguous free block is large enough.

$$F_{ext} = \sum \text{Size}(B_{\text{free}}) \quad \text{when no single } B_{\text{free}} \ge \text{Size}(R_i)$$

In the dashboard, the Free Space metric displays the sum of all free block sizes. When an allocation fails due to external fragmentation, the diagnostics banner recommends compaction.

### Memory Utilization Efficiency

The overall memory utilization rate measures how much of the total system RAM is actually in use by processes (excluding waste).

$$U = \left( \frac{\sum \text{Size}(R_{\text{allocated}})}{\text{Total System RAM}} \right) \cdot 100\%$$

### Algorithm Comparison

| Algorithm | Strategy | Internal Fragmentation | External Fragmentation | Search Cost |
|-----------|----------|----------------------|----------------------|-------------|
| **First Fit** | Scans from block 0, allocates the first block that fits | Moderate | Moderate | Low (stops at first match) |
| **Best Fit** | Scans all blocks, allocates the smallest block that fits | Low (minimizes waste per block) | High (leaves many tiny fragments) | High (full scan) |
| **Worst Fit** | Scans all blocks, allocates the largest block that fits | High (leaves large leftover blocks) | Low (leaves fewer, larger fragments) | High (full scan) |

---

## Core Heap State Machine

```
IDLE  ----[Initialize RAM]---->  READY
READY ----[Allocate Process]--->  ALLOCATED
READY ----[External Frag]------>  FRAGMENTED (compaction recommended)
ALLOCATED ----[Deallocate]----->  READY
ALLOCATED ----[Lifetime Expiry]-> READY
FRAGMENTED ---[Compaction]----->  COMPACTED
COMPACTED ---[Allocate]-------->  ALLOCATED
any state ---[Flush All]------->  READY
```

Transitions are tracked in real time through the diagnostics banner, telemetry table, and RAM map visualization.

---

## Interface Instructions

### Left Panel — Configuration and Control

1. **Algorithm Selector**: Click First Fit, Best Fit, or Worst Fit to choose the allocation strategy for the next request.
2. **RAM Configuration**: Enter comma-separated block sizes in KB (e.g., `100, 500, 200, 300, 600`) and click **INITIALIZE RAM**.
3. **Process Request Stream**: Enter a Process ID tag, request size in KB, and lifetime in simulation steps.
4. **Actions**:
   - **ALLOCATE MEMORY** — dispatches the current request using the selected algorithm
   - **COMPACT RAM** — consolidates all allocated blocks to the base of memory, merging free space
   - **STEP CLOCK** — advances the simulation clock by one tick; decrements process lifetimes and auto-deallocates expired processes
   - **FLUSH ALL** — deallocates every process, freeing all memory
   - **EXPORT CSV** — downloads the current heap state as a CSV file

### Right Panel — Visualization and Telemetry

1. **Stats Header**: Total system capacity, number of active allocations, current clock step.
2. **Interactive RAM Map**: A proportional-width horizontal bar showing every memory block. Free blocks appear in pale mint, allocated blocks in deep green (with red portions indicating internal fragmentation waste). Hover for detailed tooltips.
3. **Metrics Row**: Memory Utilization (U), Internal Fragmentation (F_int), and Free Space (F_ext).
4. **Utilization History**: A live line chart tracking the utilization percentage over time.
5. **Heap Telemetry Log**: Scrollable table with Block ID, hex addresses, size, status badges, process owner, and fragmentation waste.

---

## Local Operational Steps

1. Clone or download the project to a local directory.
2. Open `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari).
3. No build tools, servers, or dependencies required — the application runs entirely client-side.
4. The simulator auto-initializes with a default RAM configuration on load. Adjust the block sizes and click **INITIALIZE RAM** to reconfigure.
5. Optionally, load Chart.js from CDN for the utilization history graph (loaded automatically via `<script>` tag).

### File Structure

```
Memory Management Simulator/
├── index.html          # Main HTML document
├── style.css           # Botanical green theme stylesheet
├── script.js           # Simulation engine and rendering
├── README.md           # This documentation
├── project.json        # Project metadata
└── thumbnail.svg       # Vector preview graphic
```

### Requirements

- Modern browser with ES5+ support
- Internet connection only required for the Chart.js CDN resource (optional — the simulation runs fully without it)
