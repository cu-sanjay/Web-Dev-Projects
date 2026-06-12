# Color Flood Puzzle

An interactive, high-fidelity matrix pathfinding puzzle driven by a client-side recursive Flood Fill algorithm.

---

## Mathematical Graph Pathfinding Theory

### The Flood Fill Algorithm

Flood Fill is a graph traversal algorithm that determines which connected nodes in a multi-dimensional array share a common property. It is the computational equivalent of the "paint bucket" tool in raster graphics editors.

Given a starting coordinate $(x, y)$, a target color $T$, and a replacement color $R$, the algorithm:

$$\text{FloodFill}(x, y, T, R) = \begin{cases} \text{exit} & \text{if } \text{grid}[x][y] \neq T \\ \text{grid}[x][y] = R & \\ \text{FloodFill}(x+1, y, T, R) & \\ \text{FloodFill}(x-1, y, T, R) & \\ \text{FloodFill}(x, y+1, T, R) & \\ \text{FloodFill}(x, y-1, T, R) & \end{cases}$$

### Graph Representation

The $12 \times 12$ grid is modeled as a **4-connected planar graph**:

- Each cell is a node $v_{i,j}$ where $i, j \in [0, 11]$
- Edges exist between cardinal neighbors: $(i,j) \leftrightarrow (i \pm 1, j)$ and $(i,j) \leftrightarrow (i, j \pm 1)$
- Diagonal adjacency is excluded (standard 4-connectivity)
- Each node has a color property $c(v) \in \{0, 1, 2, 3, 4, 5\}$

### Iterative Implementation

The implementation uses an **iterative stack-based approach** rather than recursive function calls to avoid call-stack overflow on large connected regions:

```
stack = [(0, 0)]
visited = boolean[144]

while stack is not empty:
    (x, y) = stack.pop()
    for each cardinal neighbor (nx, ny):
        if in_bounds(nx, ny) and not visited[nx,ny] 
           and grid[nx][ny] == target:
            visited[nx,ny] = true
            grid[nx][ny] = newColor
            stack.push((nx, ny))
```

This iterative approach provides $O(n)$ time complexity where $n$ is the number of cells in the flooded region, with $O(n)$ space complexity for the stack and visited array.

---

## Flood Fill Algorithm Structural Implementation

### Algorithm Flow

1. **Capture Origin** — Read the color at grid position $(0, 0)$ as the target color $T$
2. **Early Exit** — If the selected replacement color $R$ equals $T$, abort (no change needed)
3. **Seed Stack** — Push the origin coordinate $(0, 0)$ onto an empty stack and mark it visited
4. **Traversal Loop** — While the stack is non-empty:
   - Pop the top coordinate
   - Set its cell to $R$
   - For each of the four cardinal directions, if the neighbor is within bounds, unvisited, and matches $T$, push it onto the stack and mark it visited
5. **Saturation Check** — Count cells matching the new origin color. If 100%, trigger victory; otherwise continue play

### Boundary Conditions

- **Grid Constraints**: All coordinates are clamped to $[0, 11] \times [0, 11]$. Neighbor checks validate bounds before accessing the array.
- **Color Equality Guard**: If the selected color matches the current origin color, the function returns `false` and no move is consumed.
- **Move Limit**: After each successful flood fill, the move counter increments. If 25 moves are exhausted without 100% saturation, the game ends in failure.

### Performance

The algorithm uses a pre-allocated `Uint8Array(144)` for the visited set and a JavaScript array as a stack, providing efficient memory access patterns. The 4-directional neighbor check runs in constant time per cell.

---

## File Directory Layout

```
color-flood-puzzle/
├── index.html        # Application structure with analytics panel and grid stage
├── style.css         # Dark theme, 12x12 CSS grid, color tokens, victory/fail animations
├── script.js         # Flood fill engine, state management, win/loss logic
├── README.md         # This documentation file
├── project.json      # Project metadata configuration
└── thumbnail.svg     # Application thumbnail icon
```

### Architecture

- **index.html** — Dual-column layout: Control Center (left) with move counter, saturation gauge, win-streak tracker, six color-token buttons, and reset trigger; Chromatic Grid Stage (right) with the 12x12 matrix container
- **style.css** — CSS Grid dashboard, `grid-template-columns: repeat(12, 1fr)` for the game arena, color-token swatches with hover scale and neon rings, victory emerald glow and fail crimson pulse animations, cell transition timing (`0.25s cubic-bezier(0.4, 0, 0.2, 1)`)
- **script.js** — State management (grid array, move counter, game phase, streak persistence via `localStorage`), iterative stack-based flood fill algorithm, saturation calculator, win/loss boundary checkers with visual feedback, keyboard shortcuts (1-6 for colors, R for reset)

---

## Operational Instructions

### How to Play

1. **Objective**: Flood the entire $12 \times 12$ grid with a single color in 25 moves or fewer.
2. **Starting Point**: The top-left cell $(0, 0)$ is the origin. Its color defines your current territory.
3. **Making a Move**: Click one of the six color-token buttons (or press keys 1-6). All cells connected to the origin that match the current origin color will change to the selected color, expanding your territory.
4. **Winning**: When 100% of cells match the origin color, you win. Your win streak increments and is saved to `localStorage`.
5. **Losing**: If you exhaust 25 moves without flooding the grid, the game ends. Unflooded cells fade to reveal the remaining challenge.

### Controls

| Input | Action |
|-------|--------|
| Click token button | Flood with that color |
| Keys 1–6 | Flood with color 1–6 |
| Key R | Regenerate random matrix |
| REGENERATE RANDOM MATRIX button | New game |

### Visual Feedback

- **Move counter**: Updates in real-time (`00 / 25` format)
- **Saturation gauge**: Shows percentage of grid matching origin color
- **Win streak**: Persistent counter across sessions
- **Victory**: Emerald green glow pulses on the grid border
- **Failure**: Crimson glow, unflooded cells fade to 30% opacity with grayscale

---

## Local Deployment Verification

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, or Safari)
- No build tools, frameworks, or external dependencies required

### Steps

1. Clone or download the repository:
   ```
   git clone <repository-url>
   cd color-flood-puzzle
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
   - 12x12 grid of randomized color cells
   - Six color-token buttons
   - Move counter at 00 / 25

### Testing

1. Click each color-token button and verify the flood fill expands from the top-left corner
2. Verify the move counter increments with each successful flood
3. Check the saturation percentage updates correctly
4. Complete a game and verify the victory animation and streak counter
5. Press R or click REGENERATE to start a fresh game

---

## Technical Details

- **Grid Dimensions**: $12 \times 12$ (144 cells)
- **Color Palette**: 6 colors (Orchid Pink, Coral Red, Amber Orange, Emerald Green, Electric Blue, Neon Purple)
- **Move Limit**: 25 moves per game
- **Algorithm**: Iterative stack-based flood fill (4-directional)
- **Time Complexity**: $O(n)$ per move where $n$ = flooded region size
- **Space Complexity**: $O(n)$ for visited array + stack
- **Persistence**: Win streak stored in `localStorage`
- **Theme**: Vercel, Figma, and Linear.app inspired dark dashboard
- **Typography**: `ui-monospace, Consolas, monospace` monospaced stack

### Color Reference

| Token | Hex | Name |
|-------|-----|------|
| Color 1 | `#ec4899` | Orchid Pink |
| Color 2 | `#f43f5e` | Coral Red |
| Color 3 | `#f59e0b` | Amber Orange |
| Color 4 | `#10b981` | Emerald Green |
| Color 5 | `#3b82f6` | Electric Blue |
| Color 6 | `#a855f7` | Neon Purple |
