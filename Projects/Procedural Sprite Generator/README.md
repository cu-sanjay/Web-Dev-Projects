# 👾 Procedural Pixel Art Sprite Generator & Animator

An interactive, web-based pixel art creator and procedural asset generator. Leverage symmetric random noise and cellular automata algorithms to spawn retro game assets (like space invaders, spaceships, swords, and shields) and animate them using a step-by-step pixel grid timeline.

---

## 🚀 Live Demo
Simply open `index.html` in your web browser, or host it locally to start generating and animating pixel sprites.

---

## 🌟 Key Features

### 1. Pixel Art Grid & Layer Editor
- **Custom Resolution**: Supports drawing on `8x8` (micro), `16x16` (standard), or `32x32` (detailed) grid canvases.
- **Symmetry Painting**: Mirror paint strokes in real-time horizontally, vertically, or both directions simultaneously for perfectly balanced designs.
- **Essential Canvas Tools**: Draw Brush, Eraser, Flood Fill, and Clear Canvas functions.

### 2. Procedural Generation Engine
- **Template Generators**: Instantly spawn recognizable retro assets:
  - 🛸 **Space Invader / Alien** (Symmetric noise + cellular boundary smoothing)
  - 🚀 **Galactic Spaceship** (Fuselage core + wings + thruster glow details)
  - ⚔️ **Sword / Melee Item** (Blade + crossguard + hilt hilt layout structure)
  - 🛡️ **Defensive Shield** (Border ring + center crest emblem layout)
- **Seeded Randomness**: Copy and paste seed codes to perfectly reproduce generated designs.
- **Cellular Automata**: Refines random noise boundaries using cellular smoothing logic (similar to Conway's Game of Life) for cleaner retro contours.

### 3. Timeline Animator & Exporter
- **Frame Management**: Add new frames, copy current frames, delete frames, and re-order animation states.
- **Animation Preview**: Watch your sprite animate in real-time with adjustable speed slider (1 to 24 Frames Per Second).
- **Export Formats**:
  - 📥 **PNG Sprite Sheet**: Downloads a compiled horizontal strip of all animation frames.
  - 💻 **CSS Keyframe Code**: Generates copy-to-clipboard CSS `@keyframes` code for instant usage in web games.

---

## 🛠️ Code Structure

- [index.html](file:///index.html): Defines the workspace layouts, tool panels, interactive grid wrappers, preview modules, and modal overlays.
- [style.css](file:///style.css): Powers a modern, glassmorphic dark and light theme system with HSL-tailored colors, smooth animations, and responsive grids.
- [script.js](file:///script.js): Implements the pixel matrix operations, flood fill, symmetry math, seeded LCG generator, cellular automata rules, and sheet builders.
- [project.json](file:///project.json): Project metadata configuration.

---

## 🎨 Presets & Customizing

- **Palette Presets**: Select from `Retro Game`, `Neon Cyber`, and `Soft Pastel` colors or use the custom HTML color picker to create unique styles.
- **Theme**: Click the header Sun/Moon icon to switch between a vibrant glassmorphic dark mode and a sleek light mode. 
