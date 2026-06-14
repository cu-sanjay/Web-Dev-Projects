# OS Process Scheduler Simulator

An interactive, high-fidelity operating systems workspace designed to simulate, analyze, and visualize CPU scheduling algorithms in real-time. Built entirely with vanilla HTML5, CSS3, and JavaScript, the application features an advanced scheduling engine supporting interactive I/O transitions, starvation ageing, and context-switching overheads.

---

## 🚀 Key Features

*   **Algorithms Simulated**:
    *   **First Come First Served (FCFS)** (Non-preemptive)
    *   **Shortest Job First (SJF)** (Non-preemptive)
    *   **Shortest Remaining Time First (SRTF / Preemptive SJF)**
    *   **Priority Scheduling** (Non-preemptive)
    *   **Preemptive Priority Scheduling**
    *   **Round Robin (RR)** (with adjustable Time Quantum)
    *   **Multi-Level Feedback Queue (MLFQ)** (adjustable time quanta and aging feedback loops across multiple queues)
*   **3-State Process Lifecycle**: Models transitions between **Ready**, **Running**, **Blocked** (I/O burst execution), and **Completed** states.
*   **Dynamic Actions**:
    *   **Trigger I/O Interrupts**: Interactive interrupt button to pause the active CPU process and send it to the Blocked Queue for a custom duration.
    *   **Priority Ageing**: Automatically increments priority for waiting processes at set clock tick thresholds to prevent starvation in Priority scheduling.
    *   **Context Switch Cost**: Models CPU overhead (in clock cycles) when switching between processes, showing context-switching gaps in the Gantt Chart.
*   **Visualizations**:
    *   Horizontal scrollable Gantt Chart mapping CPU executions, idle times, and context switch costs.
    *   Real-time queue tracking panels showing Ready, Running, and Blocked queues.
    *   Detailed statistics tables showing PID, Arrival Time, Burst Time, Remaining Time, Priority, Waiting Time, Turnaround Time, and Response Time.
    *   System performance metrics telemetry dashboard (Average Waiting Time, Turnaround Time, Response Time, and CPU Utilization).
    *   Activity logs console logging precise clock events.
*   **Data Export**: Download simulation reports containing all process performance metrics in raw CSV format.

---

## 📊 Scheduling Complexity & Evaluation Formulas

The simulator calculates metrics dynamically at each clock tick using standard OS scheduling equations:

### 1. Waiting Time ($W_i$)
The total time a process spends waiting in the Ready queue.
$$W_i = T_i - B_i - I_i$$
Where:
*   $T_i$ = Turnaround Time
*   $B_i$ = Original Burst Time
*   $I_i$ = Time spent in Blocked queue (I/O execution)

### 2. Turnaround Time ($T_i$)
The total elapsed time from process arrival to completion.
$$T_i = C_i - A_i$$
Where:
*   $C_i$ = Completion Time
*   $A_i$ = Arrival Time

### 3. Response Time ($R_i$)
The time from process arrival until its first execution on the CPU.
$$R_i = F_i - A_i$$
Where:
*   $F_i$ = Time when the CPU first started executing the process

### 4. CPU Utilization ($U$)
The fraction of total simulator time during which the CPU was actively executing processes.
$$U = \frac{\text{Total CPU Running Time}}{\text{Total Simulation Duration}} \times 100\%$$

---

## 🛠️ How It Works

1.  **Process Input**: Add processes individually using the input panel, or load predefined presets (e.g., Starvation Scenario, Round Robin Overhead, I/O Interrupt Showcase).
2.  **Algorithm Setup**: Select the algorithm, toggle preemptive settings, and configure custom parameters such as **Time Quantum**, **Context Switch Cost**, and **Ageing Limit**.
3.  **Run Simulation**: Use control buttons to **Play / Pause**, **Step Forward (1 clock tick)**, or **Reset** the timeline. A speed slider adjusts the animation interval.
4.  **Simulate Events**: Trigger I/O on the currently executing process to see it yield the CPU, enter the blocked queue, and wait for its I/O burst before returning to the ready queue.
5.  **Export Results**: Export the completed process stats to CSV for comparison or analysis.
