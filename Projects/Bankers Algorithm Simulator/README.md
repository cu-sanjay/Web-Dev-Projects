# Banker's Algorithm Simulator

An interactive, high-fidelity operating systems visualizer designed to simulate and analyze the **Banker's Algorithm** for deadlock avoidance and resource safety verification. Built using vanilla HTML5, CSS3, and JavaScript, the application models system state changes and helps students and developers understand how an OS prevents deadlocks during resource allocation.

---

## 💡 Operating Systems Context & Theory

In a multitasking operating system, a **deadlock** occurs when two or more processes are unable to proceed because each is waiting for the other to release a resource. 

To handle deadlocks, an OS can use:
1.  **Deadlock Prevention**: Structural policies that make it mathematically impossible for at least one of Coffman's four deadlock conditions to hold (e.g., preemption, ordering resource requests).
2.  **Deadlock Avoidance**: Dynamic resource allocation monitoring. The OS decides whether to grant a resource request based on whether the resulting system state remains **safe**. The **Banker's Algorithm** (devised by Edsger Dijkstra) is the classic method for this.

---

## 📊 Core Data Structures & Equations

For $n$ processes and $m$ resource types:

### 1. Vector & Matrix Definitions
*   **`Available`**: A 1D vector of size $m$. If `Available[j] = k`, there are $k$ instances of resource type $R_j$ available for allocation.
*   **`Max`**: A 2D matrix of size $n \times m$. If `Max[i][j] = k`, process $P_i$ may request at most $k$ instances of resource type $R_j$.
*   **`Allocation`**: A 2D matrix of size $n \times m$. If `Allocation[i][j] = k`, process $P_i$ is currently allocated $k$ instances of resource type $R_j$.
*   **`Need`**: A 2D matrix of size $n \times m$ indicating the remaining resource claim of each process.
    $$\text{Need}[i][j] = \text{Max}[i][j] - \text{Allocation}[i][j]$$

---

## ⚙️ The Safety Algorithm

Checks if the system is in a **Safe State** (i.e. whether there exists a sequence in which all processes can execute to completion without deadlock).

1.  Let **`Work`** be a vector of length $m$, initialized to `Available`.
2.  Let **`Finish`** be a boolean array of length $n$, initialized to `false` for all $i$.
3.  Find an index $i$ such that:
    *   $\text{Finish}[i] == \text{false}$
    *   $\text{Need}[i] \le \text{Work}$
4.  If such an $i$ exists:
    *   $\text{Work} = \text{Work} + \text{Allocation}[i]$
    *   $\text{Finish}[i] = \text{true}$
    *   Go back to Step 3.
5.  If $\text{Finish}[i] == \text{true}$ for all $i$, then the system is in a **Safe State**. The order in which processes complete forms a **Safe Sequence**. Otherwise, the system is **Unsafe** (and a deadlock is possible).

---

## 🔄 The Resource Request Algorithm

When a process $P_i$ makes a request vector $\text{Request}_i$:

1.  If $\text{Request}_i \le \text{Need}_i$, go to Step 2. Otherwise, raise an error: the process has exceeded its maximum claim.
2.  If $\text{Request}_i \le \text{Available}$, go to Step 3. Otherwise, $P_i$ must wait, as resources are not currently available.
3.  Pretend to allocate resources to $P_i$ by modifying the state:
    $$\text{Available} = \text{Available} - \text{Request}_i$$
    $$\text{Allocation}_i = \text{Allocation}_i + \text{Request}_i$$
    $$\text{Need}_i = \text{Need}_i - \text{Request}_i$$
4.  Run the **Safety Algorithm** on this hypothetical state.
    *   **If Safe**: The request is granted. The new state becomes permanent.
    *   **If Unsafe**: The request is rejected. Roll back to the previous state, and $P_i$ must wait.

---

## 🚀 Key Features

*   **Step-by-Step Stepper**: Interactively steps through the safety check, demonstrating how the `Work` vector gathers allocated resources and flags processes as completed.
*   **Dynamic Matrix Modifiers**: Click cell values directly inside the Allocation and Max matrices to change values in real-time, with automatic validation warnings if `Allocation > Max` or if allocated resources exceed total capacity.
*   **Interactive Allocation Requests**: Input custom requests on any active process, triggering request-checks with automated dry-runs and safe sequence checks.
*   **Custom Presets**: Load pre-configured scenarios (e.g. Standard Safe State, Direct Deadlock Unsafe State, 4 Resource Types layout) instantly.
*   **CSV Exporter**: Compile the current allocation vectors and process need statistics into a downloadable sheet.
