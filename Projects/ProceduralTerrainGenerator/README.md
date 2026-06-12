# ⛰️ Procedural Terrain Generator & Landscape Sandbox

An interactive terrain elevation map generator using procedural Perlin noise calculations, hydraulic erosion physics, dynamic altitude biomes, and rotating isometric pseudo-3D projections.

---

## 🚀 Live Demo
Simply open [index.html](file:///index.html) in your browser, or host it locally using a static web server.

---

## 🌟 Key Features

1. **Procedural Noise Math (fBm)**:
   - Adjust Noise Frequency, Octaves (details richness), Persistence (roughness mapping), and Lacunarity parameters in real-time.
   - Seed-based LCG random table generation ensures repeatable landscape layouts.

2. **Hydraulic Erosion Physics**:
   - Simulates rainfall drops falling down slopes to dissolve and wear away soil, forming natural riverbed networks and valleys.
   - Adjust droplet counts and erosion rates dynamically.

3. **Dynamic Biomes Gradients**:
   - Maps heightmap heights to distinct elevation categories (Deep Ocean, Shallow Water, Sand Beach, Plain Grass, Deep Forest, Rocky Mountain, Snow Peak).

4. **Rotating 3D Isometric Viewport**:
   - Projects 2D grid coordinates into an isometric 3D block canvas.
   - Dynamic controls for daylight azimuth (computes Lambertian diffuse lighting normals and casts realistic shadows), landscape rotation, and vertical height scale extrusion.

5. **Analytical Analytics Dashboard**:
   - Computes percentages for water levels, plains, mountains, average height, and maximum peaks.
   - Flat 2D inspector tooltip reports height coordinates and biome titles on cursor hovering.
