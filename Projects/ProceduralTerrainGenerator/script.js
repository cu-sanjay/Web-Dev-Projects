// script.js - Procedural Terrain Generator and Simulator

// Simulation State
const STATE = {
  resolution: 64,
  scale: 40,
  octaves: 4,
  persistence: 0.5,
  lacunarity: 2.0,
  seed: 42,
  
  // View mode
  is3D: false, // false = 2D Flat, true = 3D Isometric
  heightScale: 60,
  rotationAngle: 45, // in degrees
  sunAngle: 135, // azimuth in degrees
  
  // Erosion properties
  erosionDrops: 1000,
  erosionStrength: 0.1,
  
  // Data arrays
  heightmap: [],
  waterMap: [], // holds track of where rivers/water erosion happened
  
  // Mouse hover stats
  hoverX: -1,
  hoverY: -1
};

// Permutation table for Perlin Noise
let p = new Uint8Array(512);

// Standard gradient vectors for 2D Perlin noise
const grad2 = [
  {x:1, y:1}, {x:-1, y:1}, {x:1, y:-1}, {x:-1, y:-1},
  {x:1, y:0}, {x:-1, y:0}, {x:0, y:1},  {x:0, y:-1}
];

// Initialize perm tables based on seed
function initNoise() {
  // Simple LCG pseudo-random generator
  let seed = STATE.seed;
  function random() {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  const permutation = Array.from({length: 256}, (_, i) => i);
  // Shuffle
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const temp = permutation[i];
    permutation[i] = permutation[j];
    permutation[j] = temp;
  }

  for (let i = 0; i < 256; i++) {
    p[i] = permutation[i];
    p[i + 256] = permutation[i];
  }
}

// 2D Perlin Noise implementation
function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(t, a, b) { return a + t * (b - a); }
function dot(g, x, y) { return g.x * x + g.y * y; }

function perlin2D(x, y) {
  let X = Math.floor(x) & 255;
  let Y = Math.floor(y) & 255;

  x -= Math.floor(x);
  y -= Math.floor(y);

  let u = fade(x);
  let v = fade(y);

  let gi00 = p[X + p[Y]] % 8;
  let gi01 = p[X + p[Y + 1]] % 8;
  let gi10 = p[X + 1 + p[Y]] % 8;
  let gi11 = p[X + 1 + p[Y + 1]] % 8;

  let n00 = dot(grad2[gi00], x, y);
  let n10 = dot(grad2[gi10], x - 1, y);
  let n01 = dot(grad2[gi01], x, y - 1);
  let n11 = dot(grad2[gi11], x - 1, y - 1);

  let nx0 = lerp(u, n00, n10);
  let nx1 = lerp(u, n01, n11);

  return lerp(v, nx0, nx1);
}

// Multi-octave Fractional Brownian Motion noise generator
function fbmNoise(x, y) {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;
  
  for (let i = 0; i < STATE.octaves; i++) {
    total += perlin2D(x * frequency, y * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= STATE.persistence;
    frequency *= STATE.lacunarity;
  }
  
  // Normalize between -1 and 1 to 0 and 1
  return (total / maxValue + 1) / 2;
}

// Generate Terrain Map Grid
function generateTerrain() {
  initNoise();
  const res = STATE.resolution;
  STATE.heightmap = Array.from({length: res}, () => new Float32Array(res));
  STATE.waterMap = Array.from({length: res}, () => new Float32Array(res));

  const freq = 1 / STATE.scale;
  for (let y = 0; y < res; y++) {
    for (let x = 0; x < res; x++) {
      // Generate elevation base
      let h = fbmNoise(x * freq, y * freq);
      
      // Shape coastlines (add distance falloff factor)
      const dx = (x / res) - 0.5;
      const dy = (y / res) - 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy) * 2; // 0 at center, 1 at boundary
      
      h = h * (1 - dist * dist * 0.45); // smoothly fade edges to water
      STATE.heightmap[y][x] = Math.max(0, Math.min(1, h));
    }
  }

  calculateAnalytics();
  render();
}

// Biome Elevation Definition Colors
function getBiomeColor(elevation) {
  if (elevation < 0.15) return { r: 13, g: 92, b: 186, name: "Deep Ocean" };
  if (elevation < 0.25) return { r: 30, g: 163, b: 216, name: "Shallow Water" };
  if (elevation < 0.30) return { r: 243, g: 229, b: 171, name: "Sand Beach" };
  if (elevation < 0.55) return { r: 74, g: 222, b: 128, name: "Green Plain" };
  if (elevation < 0.70) return { r: 21, g: 128, b: 61, name: "Deep Forest" };
  if (elevation < 0.85) return { r: 100, g: 116, b: 139, name: "Rocky Mountain" };
  return { r: 248, g: 250, b: 252, name: "Snow Peak" };
}

// --- HYDRAULIC EROSION SIMULATION LOOP ---
function simulateHydraulicErosion() {
  const res = STATE.resolution;
  const map = STATE.heightmap;
  
  // Erosion parameters
  const inertia = 0.05;      // Droplet inertia direction weighting
  const gravity = 4.0;
  const sedimentCapacityFactor = 4.0;
  const dissolveSpeed = STATE.erosionStrength;
  const depositSpeed = 0.1;
  const evaporateSpeed = 0.02;
  const maxLifetime = 30;

  for (let drop = 0; drop < STATE.erosionDrops; drop++) {
    // Select random start location (within safe borders)
    let posX = Math.random() * (res - 2) + 1;
    let posY = Math.random() * (res - 2) + 1;
    
    let dirX = 0;
    let dirY = 0;
    let vel = 0;
    let water = 1.0;
    let sediment = 0.0;

    for (let step = 0; step < maxLifetime; step++) {
      let cellX = Math.floor(posX);
      let cellY = Math.floor(posY);
      
      // Calculate fractional coordinates within cell
      let u = posX - cellX;
      let v = posY - cellY;

      // Bilinear interpolation height lookup and gradient vectors
      let h00 = map[cellY][cellX];
      let h10 = map[cellY][cellX + 1];
      let h01 = map[cellY + 1][cellX];
      let h11 = map[cellY + 1][cellX + 1];

      // Calculate terrain normal gradient direction
      let gradX = (h10 - h00) * (1 - v) + (h11 - h01) * v;
      let gradY = (h01 - h00) * (1 - u) + (h11 - h10) * u;

      // Update droplet direction incorporating inertia
      dirX = dirX * inertia - gradX * (1 - inertia);
      dirY = dirY * inertia - gradY * (1 - inertia);

      // Normalize direction vector
      let len = Math.hypot(dirX, dirY);
      if (len > 0) {
        dirX /= len;
        dirY /= len;
      }

      let newPosX = posX + dirX;
      let newPosY = posY + dirY;

      // Stop if droplet flows off grid boundaries
      if (newPosX < 0 || newPosX >= res - 1 || newPosY < 0 || newPosY >= res - 1) break;

      // Get new height
      let newCellX = Math.floor(newPosX);
      let newCellY = Math.floor(newPosY);
      let newH = map[newCellY][newCellX];

      // Height difference delta
      let hDiff = newH - h00;

      // Calculate sediment capacity
      let capacity = Math.max(-hDiff, 0.01) * vel * water * sedimentCapacityFactor;

      if (sediment > capacity) {
        // Deposit sediment
        let amount = (sediment - capacity) * depositSpeed;
        sediment -= amount;
        map[cellY][cellX] += amount * (1 - u) * (1 - v);
        map[cellY][cellX + 1] += amount * u * (1 - v);
        map[cellY + 1][cellX] += amount * (1 - u) * v;
        map[cellY + 1][cellX + 1] += amount * u * v;
      } else {
        // Dissolve / erode soil
        let amount = Math.min((capacity - sediment) * dissolveSpeed, -hDiff);
        sediment += amount;
        map[cellY][cellX] -= amount * (1 - u) * (1 - v);
        map[cellY][cellX + 1] -= amount * u * (1 - v);
        map[cellY + 1][cellX] -= amount * (1 - u) * v;
        map[cellY + 1][cellX + 1] -= amount * u * v;
      }

      // Mark river tracks for rendering highlights
      STATE.waterMap[cellY][cellX] += 0.08;

      // Accelerate velocity based on height delta
      vel = Math.sqrt(vel * vel + Math.abs(hDiff) * gravity);
      
      posX = newPosX;
      posY = newPosY;

      // Evaporation
      water *= (1 - evaporateSpeed);
    }
  }

  calculateAnalytics();
  render();
}

// --- ANALYSIS COMPUTATIONS ---
function calculateAnalytics() {
  const res = STATE.resolution;
  let totalHeight = 0;
  let maxH = 0;
  let countWater = 0;
  let countPlains = 0;
  let countMountain = 0;

  for (let y = 0; y < res; y++) {
    for (let x = 0; x < res; x++) {
      let h = STATE.heightmap[y][x];
      totalHeight += h;
      if (h > maxH) maxH = h;

      if (h < 0.25) countWater++;
      else if (h < 0.70) countPlains++;
      else countMountain++;
    }
  }

  const totalCells = res * res;
  const pWater = Math.round((countWater / totalCells) * 100);
  const pPlains = Math.round((countPlains / totalCells) * 100);
  const pMountain = Math.round((countMountain / totalCells) * 100);

  // Update DOM panels
  document.getElementById("stat-water").textContent = pWater + "%";
  document.getElementById("bar-water").style.width = pWater + "%";

  document.getElementById("stat-plains").textContent = pPlains + "%";
  document.getElementById("bar-plains").style.width = pPlains + "%";

  document.getElementById("stat-mountains").textContent = pMountain + "%";
  document.getElementById("bar-mountains").style.width = pMountain + "%";

  document.getElementById("meta-avg-height").textContent = Math.round((totalHeight / totalCells) * 100) + "m";
  document.getElementById("meta-max-height").textContent = Math.round(maxH * 100) + "m";
}

// --- CANVAS GRAPHICS RENDERING LOOPS ---
let canvas, ctx;

function render() {
  canvas = document.getElementById("terrain-canvas");
  ctx = canvas.getContext("2d");
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  ctx.fillStyle = isDark ? "#080c16" : "#f1f5f9";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (STATE.is3D) {
    renderIsometric3D();
  } else {
    renderFlat2D();
  }
}

// Render Height grid as a Flat 2D pixel layout
function renderFlat2D() {
  const res = STATE.resolution;
  const cellSize = Math.floor(Math.min(canvas.width, canvas.height) / res);
  
  // Center drawing bounds
  const startX = (canvas.width - res * cellSize) / 2;
  const startY = (canvas.height - res * cellSize) / 2;

  for (let y = 0; y < res; y++) {
    for (let x = 0; x < res; x++) {
      const h = STATE.heightmap[y][x];
      const b = getBiomeColor(h);
      
      // Determine flat shading based on lighting simulation
      let factor = 1.0;
      if (x < res - 1 && y < res - 1) {
        // Calculate basic slope lighting normal diff
        const slopeX = STATE.heightmap[y][x + 1] - h;
        const slopeY = STATE.heightmap[y + 1][x] - h;
        factor = 1.0 - (slopeX + slopeY) * 1.5;
        factor = Math.max(0.6, Math.min(1.3, factor));
      }

      ctx.fillStyle = `rgb(${Math.round(b.r * factor)}, ${Math.round(b.g * factor)}, ${Math.round(b.b * factor)})`;
      ctx.fillRect(startX + x * cellSize, startY + y * cellSize, cellSize, cellSize);

      // Render water river flow highlight overlays
      if (STATE.waterMap[y][x] > 0.05 && h >= 0.25) {
        ctx.fillStyle = `rgba(14, 165, 233, ${Math.min(0.6, STATE.waterMap[y][x])})`;
        ctx.fillRect(startX + x * cellSize, startY + y * cellSize, cellSize, cellSize);
      }
    }
  }
}

// Render Terrain as isometric rotated blocks row-by-row
function renderIsometric3D() {
  const res = STATE.resolution;
  const size = STATE.heightScale;
  const rotRad = (STATE.rotationAngle * Math.PI) / 180;
  const sunRad = (STATE.sunAngle * Math.PI) / 180;

  // Grid Cell footprint dimension size mapping
  const cellWidth = 360 / res;
  
  // Center projection offset anchors
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2 + 60;

  // Sun Light Vector
  const sunDir = {
    x: Math.cos(sunRad),
    y: Math.sin(sunRad),
    z: 0.5 // angled downward light source
  };
  const len = Math.hypot(sunDir.x, sunDir.y, sunDir.z);
  sunDir.x /= len;
  sunDir.y /= len;
  sunDir.z /= len;

  // Back-to-front rendering loop to avoid Z-index overlaps
  for (let y = 0; y < res - 1; y++) {
    for (let x = 0; x < res - 1; x++) {
      
      // Fetch 4 corner heights
      const h00 = STATE.heightmap[y][x];
      const h10 = STATE.heightmap[y][x + 1];
      const h01 = STATE.heightmap[y + 1][x];
      const h11 = STATE.heightmap[y + 1][x + 1];

      // Convert coordinates of 4 corners to isometric offsets
      const p00 = isoProject(x, y, h00, cellWidth, rotRad, size, centerX, centerY);
      const p10 = isoProject(x + 1, y, h10, cellWidth, rotRad, size, centerX, centerY);
      const p01 = isoProject(x, y + 1, h01, cellWidth, rotRad, size, centerX, centerY);
      const p11 = isoProject(x + 1, y + 1, h11, cellWidth, rotRad, size, centerX, centerY);

      // Shading: Calculate polygon normal vectors
      const dx = { x: p10.x - p00.x, y: p10.y - p00.y, z: h10 * size - h00 * size };
      const dy = { x: p01.x - p00.x, y: p01.y - p00.y, z: h01 * size - h00 * size };
      
      // Cross product normals
      const nx = dx.y * dy.z - dx.z * dy.y;
      const ny = dx.z * dy.x - dx.x * dy.z;
      const nz = dx.x * dy.y - dx.y * dy.x;
      const nLen = Math.hypot(nx, ny, nz) || 1.0;
      
      // Normalized normal vector
      const norm = { x: nx/nLen, y: ny/nLen, z: nz/nLen };

      // Diffuse Lambert shading factor
      const dot = norm.x * sunDir.x + norm.y * sunDir.y + norm.z * sunDir.z;
      let shade = Math.max(0.6, Math.min(1.4, 0.9 + dot * 0.4));

      // Get color representation based on average height
      const avgH = (h00 + h10 + h01 + h11) / 4;
      const b = getBiomeColor(avgH);

      // Render polygon cell top surface quad
      ctx.fillStyle = `rgb(${Math.round(b.r * shade)}, ${Math.round(b.g * shade)}, ${Math.round(b.b * shade)})`;
      ctx.strokeStyle = `rgba(0,0,0,0.08)`;
      ctx.lineWidth = 0.5;

      ctx.beginPath();
      ctx.moveTo(p00.x, p00.y);
      ctx.lineTo(p10.x, p10.y);
      ctx.lineTo(p11.x, p11.y);
      ctx.lineTo(p01.x, p01.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Overlap River flows inside VRAM limits
      const avgWater = (STATE.waterMap[y][x] + STATE.waterMap[y][x+1] + STATE.waterMap[y+1][x] + STATE.waterMap[y+1][x+1]) / 4;
      if (avgWater > 0.05 && avgH >= 0.25) {
        ctx.fillStyle = `rgba(14, 165, 233, ${Math.min(0.6, avgWater)})`;
        ctx.beginPath();
        ctx.moveTo(p00.x, p00.y);
        ctx.lineTo(p10.x, p10.y);
        ctx.lineTo(p11.x, p11.y);
        ctx.lineTo(p01.x, p01.y);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
}

// Map 2D indices to visual viewport coordinate locations
function isoProject(x, y, h, cellWidth, angle, size, cx, cy) {
  // Rotate layout grid coordinate inputs
  const rx = x * Math.cos(angle) - y * Math.sin(angle);
  const ry = x * Math.sin(angle) + y * Math.cos(angle);

  // Isometric projection equations
  const screenX = cx + rx * cellWidth * 1.5;
  const screenY = cy + ry * cellWidth * 0.75 - h * size;

  return { x: screenX, y: screenY };
}

// --- UI INTERACTIONS & EVENT BINDINGS ---
function syncThemeUI() {
  const activeTheme = document.documentElement.getAttribute("data-theme");
  document.querySelector(".sun-icon").classList.toggle("hidden", activeTheme === "light");
  document.querySelector(".moon-icon").classList.toggle("hidden", activeTheme === "dark");
}

document.addEventListener("DOMContentLoaded", () => {
  // Theme configuration initial
  document.documentElement.setAttribute("data-theme", "dark");
  syncThemeUI();

  // Bind sliders
  document.getElementById("slider-scale").addEventListener("input", (e) => {
    STATE.scale = parseInt(e.target.value);
    document.getElementById("val-scale").textContent = STATE.scale;
    generateTerrain();
  });

  document.getElementById("slider-octaves").addEventListener("input", (e) => {
    STATE.octaves = parseInt(e.target.value);
    document.getElementById("val-octaves").textContent = STATE.octaves;
    generateTerrain();
  });

  document.getElementById("slider-persistence").addEventListener("input", (e) => {
    STATE.persistence = parseFloat(e.target.value);
    document.getElementById("val-persistence").textContent = STATE.persistence;
    generateTerrain();
  });

  document.getElementById("slider-lacunarity").addEventListener("input", (e) => {
    STATE.lacunarity = parseFloat(e.target.value);
    document.getElementById("val-lacunarity").textContent = STATE.lacunarity;
    generateTerrain();
  });

  document.getElementById("slider-erosion-drops").addEventListener("input", (e) => {
    STATE.erosionDrops = parseInt(e.target.value);
    document.getElementById("val-erosion-drops").textContent = STATE.erosionDrops;
  });

  document.getElementById("slider-erosion-strength").addEventListener("input", (e) => {
    STATE.erosionStrength = parseFloat(e.target.value);
    document.getElementById("val-erosion-strength").textContent = STATE.erosionStrength;
  });

  document.getElementById("slider-height-scale").addEventListener("input", (e) => {
    STATE.heightScale = parseInt(e.target.value);
    document.getElementById("val-height-scale").textContent = STATE.heightScale;
    render();
  });

  document.getElementById("slider-rotation").addEventListener("input", (e) => {
    STATE.rotationAngle = parseInt(e.target.value);
    document.getElementById("val-rotation").textContent = STATE.rotationAngle;
    render();
  });

  document.getElementById("slider-sun-angle").addEventListener("input", (e) => {
    STATE.sunAngle = parseInt(e.target.value);
    document.getElementById("val-sun-angle").textContent = STATE.sunAngle;
    render();
  });

  document.getElementById("select-resolution").addEventListener("change", (e) => {
    STATE.resolution = parseInt(e.target.value);
    generateTerrain();
  });

  // Buttons triggers
  document.getElementById("btn-generate").addEventListener("click", () => {
    STATE.seed = Math.random() * 1000;
    generateTerrain();
  });

  document.getElementById("btn-erosion-step").addEventListener("click", () => {
    simulateHydraulicErosion();
  });

  // Toggles 2D/3D flat screen
  document.getElementById("view-2d").addEventListener("click", () => {
    STATE.is3D = false;
    document.getElementById("view-2d").classList.add("active");
    document.getElementById("view-3d")?.classList.remove("active");
    document.getElementById("view-iso").classList.remove("active");
    document.getElementById("iso-settings-container").style.opacity = 0.35;
    render();
  });

  document.getElementById("view-iso").addEventListener("click", () => {
    STATE.is3D = true;
    document.getElementById("view-iso").classList.add("active");
    document.getElementById("view-2d").classList.remove("active");
    document.getElementById("iso-settings-container").style.opacity = 1;
    render();
  });

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const act = document.documentElement.getAttribute("data-theme");
    const next = act === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    syncThemeUI();
    render();
  });

  // Mouse hover event detection on canvas
  const inspectCanvas = document.getElementById("terrain-canvas");
  inspectCanvas.addEventListener("mousemove", (e) => {
    if (STATE.is3D) return; // coordinates hover lookup only supported in flat mode
    
    const rect = inspectCanvas.getBoundingClientRect();
    const mX = e.clientX - rect.left;
    const mY = e.clientY - rect.top;

    const res = STATE.resolution;
    const cellSize = Math.floor(Math.min(inspectCanvas.width, inspectCanvas.height) / res);
    
    const startX = (inspectCanvas.width - res * cellSize) / 2;
    const startY = (inspectCanvas.height - res * cellSize) / 2;

    const cellX = Math.floor((mX - startX) / cellSize);
    const cellY = Math.floor((mY - startY) / cellSize);

    const tooltip = document.getElementById("coord-tooltip");
    
    if (cellX >= 0 && cellX < res && cellY >= 0 && cellY < res) {
      const h = STATE.heightmap[cellY][cellX];
      const b = getBiomeColor(h);
      
      document.getElementById("lbl-cell").textContent = `${cellX}, ${cellY}`;
      document.getElementById("lbl-elevation").textContent = Math.round(h * 100);
      document.getElementById("lbl-biome").textContent = b.name;
      
      // Update coordinates locations
      tooltip.style.left = (e.clientX - rect.left + 15) + "px";
      tooltip.style.top = (e.clientY - rect.top + 15) + "px";
      tooltip.style.opacity = 1;
    } else {
      tooltip.style.opacity = 0;
    }
  });

  inspectCanvas.addEventListener("mouseleave", () => {
    document.getElementById("coord-tooltip").style.opacity = 0;
  });

  // Set default view opacity state
  document.getElementById("iso-settings-container").style.opacity = 0.35;

  // Run initial map generator
  generateTerrain();
});
