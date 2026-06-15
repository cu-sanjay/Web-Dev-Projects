# Maze Generator And Solver

A graph-theoretic labyrinth engineering platform with dual-generation algorithms (Randomized DFS Backtracker, Binary Tree) and triple-pathfinding pipelines (BFS, DFS, A* with Manhattan heuristic). Real-time Canvas rendering of cell walls, frontier exploration, and emerald solution paths.

---

## Features

### Maze Generation
- **Randomized DFS Backtracker**: Perfect maze via recursive backtracking with randomized neighbor selection
- **Binary Tree**: Simple directional carve (top/left) producing mazes with a diagonal bias

### Pathfinding Algorithms
- **BFS**: Level-order wavefront exploration — guarantees shortest path in unweighted grids
- **DFS**: Stack-based deep traversal — explores single corridors before backtracking
- **A\* Cost Optimization**: `f = g + h` with Manhattan heuristic (`h = |dx| + |dy|`) — guided priority search

### Canvas Viewport
- High-contrast cell/wall grid with rendered borders
- Explored nodes rendered in crisp cyber-blue
- Solved path overlaid in glowing emerald green
- Start (S) and End (E) markers

### Controls
- Matrix density slider (15×15 to 41×41, odd-grid enforced)
- Animation speed delay (0–200ms per step)
- Generate, Solve, Purge, and Auto-Solve (generate + solve in sequence)

### Telemetry

| Metric | Description |
|---|---|
| Grid Dimensions | Canvas size in cells |
| Total Cells | Interior traversable cell count |
| Frontier Explored | Nodes visited during search |
| Solved Path Cost | Step length of solution path |
| Processing Runtime | Algorithm execution time in ms |
| Algorithm State | STANDBY / SEARCHING / SUCCESSFUL |

## Controls

| Action | Function |
|---|---|
| Generate Labyrinth Map | Carve maze using selected generator |
| Execute Pathfinding Search | Run chosen solver from S to E |
| Generate & Auto-Solve | Generate then immediately solve |
| Purge & Re-Zero Matrices | Clear all state back to blank grid |

---

## File Structure

```
├── index.html        Layout — algorithm ribbon, grid controller, Canvas viewport, telemetry, admin footer
├── style.css         Dark terminal lab — glassmorphic panels, orange/cyan/emerald neon states
├── script.js         Engine — grid matrix, DFS/binary-tree gen, BFS/DFS/A* solvers, Canvas renderer, telemetry
├── README.md         This file
└── project.json      Project metadata
```

Open `index.html` in any browser.
