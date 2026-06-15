# Graph Algorithm Visualizer

An interactive, high-fidelity web application to construct topological graphs and visualize core graph algorithms in real-time. This visual playground makes it easy to understand traversals, shortest-path calculation trajectories, and minimum spanning tree builds.

## 🚀 Key Features

*   **Interactive Graph Constructor Canvas**:
    *   **Add Vertices (Nodes)**: Double-click anywhere on the canvas to spawn a new numbered node.
    *   **Drag & Reposition**: Click and drag nodes around the canvas to restructure layout links dynamically.
    *   **Add Edges (Links)**: Select a source node, then click a target node to connect them. Set weight values using the input popover.
    *   **Delete Nodes/Edges**: Click a node or edge and hit "Delete Elements" or use quick action triggers to clear them.
*   **Core Graph Algorithms Visualized**:
    *   **Breadth-First Search (BFS)**: Animate node exploration using a color-highlighted queue model.
    *   **Depth-First Search (DFS)**: Traverse the graph recursively using a stack-based path representation.
    *   **Dijkstra's Shortest Path**: Trace single-source shortest path pathways. Relax edges, watch distances update, and highlight the final shortest pathway.
    *   **Prim's Minimum Spanning Tree (MST)**: Grow a minimum spanning tree visually by picking the cheapest edges without forming cycles.
*   **Rich Control Dashboards & Telemetry**:
    *   Toggle between **Directed** and **Undirected** graph configurations.
    *   Live telemetry cards tracking: Vertex Count, Edge Count, Queue Frontier size, Active Min Distance, and MST Total Cost.
    *   A **Live Adjacency Matrix Drawer** that renders the mathematical representation of your graph dynamically.
*   **Synchronized Pseudocode & Step-by-Step logs**:
    *   Watch traversal algorithms run step-by-step.
    *   The **Pseudocode Panel** highlights the exact line of code executing.
    *   The **Execution Logs Console** explains updates to distances, queue insertions, and relaxation outcomes.
*   **Responsive SVG Canvas**:
    *   Interactive SVG canvas supporting zoom, pan, and centering controls.
    *   Preset Graphs: Binary Tree, Cycle Graph, Complete Graph, Cyclic Weighted, or empty canvas initializers.

## 🛠️ Technology Stack

*   **HTML5** for semantic web document structure.
*   **CSS3** for glassmorphism layout modules, dark-theme styling, and responsive layout.
*   **Vanilla JS (ES6)** for graph modeling, mouse dragging/drawing, and SVG render triggers.
*   **Google Fonts** (Outfit, Fira Code) for polished typography.
*   No external visual dependencies or heavy frameworks!

## 📂 Project Structure

```text
Graph Algorithm Visualizer/
├── index.html        # Skeleton structure, panels, and SVG canvas container
├── style.css         # Styling system, responsive grid layouts, and active status states
├── script.js         # Operations, graph builders, and algorithm queue timeline
├── project.json      # Workspace metadata and entry tags
├── README.md         # Documentation and guide
└── thumbnail.svg     # SVG representation of the playground
```

## 🎮 How to Use

1.  Open the `index.html` file in any modern web browser.
2.  Use the **Presets** dropdown to seed a weighted graph layout.
3.  **Construct manually**:
    *   *Double-click* on empty space to add a node.
    *   *Click* Node A, then *Click* Node B to create an edge. Set its weight in the prompt.
    *   *Drag* any node to move it.
4.  Select an algorithm (e.g. Dijkstra) from the panel, select a Start and Target node, and hit **Play**.
5.  Adjust the animation speed using the slider or click **Step** to analyze individual steps.
6.  Toggle the **Matrix** button to check the live adjacency matrix representation.
