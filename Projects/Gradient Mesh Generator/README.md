# Gradient Mesh Generator // Blurred Fluid Design Board

Gradient Mesh Generator is an interactive visual asset workspace designed to satisfy the vector blending specifications detailed in tracking item **Issue #232**. The architecture translates linear color codes into overlapping high-radius focus spheres, forming beautiful fluid digital backgrounds completely native to client-side stylesheet configurations.

---

## Technical Capabilities & Core Specifications

### 1. Unified Dashboard Scaffolding (`style.css`)

- **Strict Real Estate Viewport Constraints:** Confines all telemetry, hex boxes, and canvas nodes inside a jitterless panel frame wrapper (`max-width: 1200px`, `height: 760px`) to prevent visual fragmentation or flexing distortion over varied high-resolution desktop monitors.
- **Jitter-Proof Monospaced Inputs:** Color codes, exported declaration parameters, clipboard indicators, and layout log files use explicit monospaced font declarations (`ui-monospace, Consolas, monospace`), preventing structural coordinate shift when hex text values mutate dynamically.
- **Component Visual Elements:**
  - `.hex-input-capsule`: Sleek text containers styled with crisp reflective borders that validate input formatting parameters in real-time.
  - `#mesh-canvas-display`: The rendering sandbox operates with hardware-accelerated layout shifts and transitions to morph backgrounds smoothly over `600ms`.

### 2. Overlapping Radial Mesh Rendering (`script.js`)

- **Dynamic Color Stream Evaluator:** Monitors input boxes utilizing precise character regex arrays (`/^#[0-9A-F]{6}$/i`). Invalid configurations trigger temporary warning states without collapsing active visualization states.
- **Multi-Layered Radial Gradient Generation:** On input confirmation, the script maps individual hex selections to independent absolute-positioned focus origins ($X_i, Y_i$) overlapping within the layout canvas grid space. The logic compiles a clean macro functional string definition:
  ```css
  background-image:
    radial-gradient(circle at 20% 20%, var(--c1) 0%, transparent 60%),
    radial-gradient(circle at 80% 20%, var(--c2) 0%, transparent 60%),
    radial-gradient(circle at 15% 85%, var(--c3) 0%, transparent 55%),
    radial-gradient(circle at 85% 80%, var(--c4) 0%, transparent 65%);
  ```
