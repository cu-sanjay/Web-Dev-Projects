# CPU Scheduling Simulator

> **KERN-SPROUT** — An ultra-premium, light botanical-themed interactive operating systems workspace simulating classical CPU scheduling algorithms with real-time Gantt charts, deep waiting/turnaround analytics, and raw CSV metric data exporters.

---

## CPU Scheduling & Resource Allocation Foundations

CPU scheduling is the fundamental mechanism by which an operating system allocates the processor's execution time among competing processes. The scheduler selects which process in the **ready queue** will be dispatched to the **running state**, directly influencing system responsiveness, throughput, and fairness.

The simulator models discrete-event execution queues over time, transforming process parameters into quantifiable performance indices.

---

## Comparative Analysis of Scheduling Algorithms

### First-Come, First-Served (FCFS)

The simplest scheduling discipline where processes are executed in order of arrival. Non-preemptive by nature.

- **Pros:** Minimal overhead, intuitively fair.
- **Cons:** Suffers from the **convoy effect** — a single long process can stall all subsequent short processes, dramatically increasing average waiting time.

### Shortest Job First (SJF) / Shortest Remaining Time First (SRTF)

SJF selects the process with the smallest burst time from the ready queue. SRTF is its preemptive variant, where a newly arriving shorter job can preempt the currently running process.

- **Pros:** Optimal average waiting time (provably minimal for non-preemptive).
- **Cons:** Requires accurate burst time prediction; SRTF can cause frequent context switching.

### Round Robin (RR)

Each process receives a fixed **time quantum** $q$ of CPU time in a circular FIFO order. If a process does not complete within its quantum, it is preempted and re-inserted at the tail of the ready queue.

- **Pros:** Excellent responsiveness and fairness for interactive workloads.
- **Cons:** Performance is highly sensitive to quantum selection — too small causes excessive context switches; too large degrades to FCFS.

### Priority Scheduling

Each process is assigned a priority scalar. The scheduler always dispatches the highest-priority ready process. Preemptive variant allows a higher-priority arrival to immediately preempt the running process.

- **Pros:** Clear differentiation of process importance.
- **Cons:** Vulnerable to **starvation** — low-priority processes may never execute. Mitigated via aging.

---

## Core Performance Metrics

For each process $P_i$:

$$\text{Completion Time } (CT) = \text{Time at which } P_i \text{ finishes execution}$$

$$\text{Turnaround Time } (TAT) = CT - AT$$

$$\text{Waiting Time } (WT) = TAT - BT$$

$$\text{Normalized Response Ratio } (NRR) = \frac{WT + BT}{BT} = \frac{TAT}{BT}$$

Systemic evaluation metrics:

$$\overline{WT} = \frac{1}{n}\sum_{i=1}^{n} WT_i \quad\quad \overline{TAT} = \frac{1}{n}\sum_{i=1}^{n} TAT_i$$

$$\text{Throughput} = \frac{n}{\text{Total Execution Time}} \quad\quad \text{CPU Utilization} = \frac{\text{Busy Time}}{\text{Total Time}} \times 100\%$$

---

## Core State Machine Architecture

```
                    +-----------+
                    |   NEW     |
                    +-----+-----+
                          |
                    (admitted to ready queue)
                          |
                          v
                    +-----------+       dispatch       +-----------+
          +-------->|   READY   |--------------------->|  RUNNING  |
          |         +-----------+                      +-----+-----+
          |               ^                                  |
          |               |                          (quantum expiry
          |     (preempt / re-queue)                   or I/O wait)
          |               |                                  |
          |               +----------------------------------+
          |                                                    |
          |                                            (process exits)
          |                                                    |
          |                                                    v
          |                                           +-----------+
          +-------------------------------------------| COMPLETED |
                                                      +-----------+
```

The simulator maintains a **single-source-of-truth state object** tracking:

| Component | Description |
|---|---|
| Process Pool | Input workload with AT, BT, Priority |
| Ready Queue | Processes eligible for CPU dispatch |
| Timeline Array | Ordered discrete-event execution trace |
| Metrics Cache | Derived performance indices |

---

## Interface User Manual

### Left Column — Process Control Deck

1. **Algorithm Selection:** Toggle between FCFS, SJF (toggle preemptive SRTF), Round Robin (adjust quantum $q$), and Priority (toggle preemptive mode, configure priority order).
2. **Process Injector:** Enter PID, Arrival Time, Burst Time, and Priority, then click **+ ADD PROCESS**.
3. **Process Queue:** Displays the current workload. Remove individual processes with the × button.
4. **Presets:** Load pre-built scenarios — *Convoy Effect*, *High Preemption Cascade*, *Balanced Thread Pool*.
5. **Action Nodes:**
   - **EXECUTE SCHEDULE** — Runs the complete simulation and renders all analytics.
   - **STEP TICK** — Advances simulation one time unit at a time for educational walkthroughs.
   - **FLUSH QUEUE** — Clears all processes and resets the simulation state.
   - **EXPORT CSV** — Downloads a structured CSV file of all computed metrics.

### Right Column — Analytics Viewport

- **Engine Status Bar:** Current CPU time, utilization percentage, active execution block, and selected algorithm.
- **Gantt Chart:** Horizontal scrolling timeline with per-process color-coded execution blocks and idle intervals.
- **Metrics Dashboard:** Average Waiting Time, Average Turnaround Time, Maximum Latency / Starvation indicator, and Throughput.
- **Performance Comparison Chart:** Grouped bar chart comparing Turnaround and Waiting times per process.
- **Process Telemetry Table:** Full tabular output with AT, BT, Priority, CT, TAT, WT, and NRR. The row with maximum waiting time is highlighted in red to signal starvation.

---

## Local Standalone Browser Deployment

```
CPU Scheduling Simulator/
  index.html        — Application shell and UI scaffold
  style.css         — Botanical-themed styling system
  script.js         — Simulation engine, rendering, and interaction logic
  README.md         — This documentation
  project.json      — Project metadata
  thumbnail.svg     — Vector preview graphic
```

**Requirements:** Any modern web browser (Chrome, Firefox, Safari, Edge) with JavaScript enabled. No build tools, servers, frameworks, or installation required.

**Deployment:**
1. Download or clone the repository.
2. Navigate to the project folder.
3. Open `index.html` in any modern browser.
4. The entire application runs client-side with zero network dependencies beyond the initial Chart.js CDN load for performance comparison charts.

---

*Built with meticulous attention to botanical UI aesthetics and discrete-event simulation fidelity.*
