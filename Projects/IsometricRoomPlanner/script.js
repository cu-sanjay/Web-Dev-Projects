// Application State
let state = {
  gridSize: 10,       // Size of grid (e.g. 10x10)
  tileSize: 42,       // Pixel scale of a tile
  zoom: 1.0,          // Camera zoom multiplier
  offsetX: 0,         // Camera translation X
  offsetY: 0,         // Camera translation Y
  items: [],          // Placed items in the room
  selectedItemId: null, // ID of selected item
  isDraggingCanvas: false,
  draggedItem: null,
  dragStartX: 0,
  dragStartY: 0,
  floorStyle: 'cyan',
  wallColor: '#334155',
  theme: 'dark'
};

// Catalog Database of Furniture Pieces
const FURNITURE_DATABASE = [
  { type: 'bed', name: 'Premium Bed', w: 3, h: 2, color: '#6366f1', price: 150 },
  { type: 'couch', name: 'Comfort Sofa', w: 3, h: 1, color: '#ec4899', price: 120 },
  { type: 'desk', name: 'Work Desk', w: 2, h: 1, color: '#b45309', price: 90 },
  { type: 'chair', name: 'Office Chair', w: 1, h: 1, color: '#10b981', price: 40 },
  { type: 'table', name: 'Dining Table', w: 2, h: 2, color: '#f59e0b', price: 110 },
  { type: 'sidetable', name: 'Side Drawer', w: 1, h: 1, color: '#64748b', price: 30 },
  { type: 'wardrobe', name: 'Tall Closet', w: 2, h: 1, color: '#475569', price: 200 },
  { type: 'plant', name: 'Potted Fern', w: 1, h: 1, color: '#22c55e', price: 25 }
];

// DOM Elements
const canvas = document.getElementById('isometric-canvas');
const ctx = canvas.getContext('2d');
const furnitureCatalog = document.getElementById('furniture-catalog');
const gridSizeInput = document.getElementById('room-grid-size');
const gridSizeVal = document.getElementById('grid-size-val');
const floorStyleSelector = document.getElementById('floor-style-selector');
const wallColorSelector = document.getElementById('wall-color-selector');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeIcon = document.getElementById('theme-icon');

// Stat Elements
const statsTotalArea = document.getElementById('stats-total-area');
const statsOccupiedArea = document.getElementById('stats-occupied-area');
const statsClearanceArea = document.getElementById('stats-clearance-area');
const statsFurnitureCount = document.getElementById('stats-furniture-count');
const occupiedProgressBar = document.getElementById('occupied-progress-bar');
const statsOccupiedPct = document.getElementById('stats-occupied-pct');

// Toolbar buttons
const rotateItemBtn = document.getElementById('rotate-item-btn');
const deleteItemBtn = document.getElementById('delete-item-btn');
const zoomInBtn = document.getElementById('zoom-in-btn');
const zoomOutBtn = document.getElementById('zoom-out-btn');
const exportPlanBtn = document.getElementById('export-plan-btn');
const clearLayoutBtn = document.getElementById('clear-layout-btn');

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initializeCatalog();
  initializeUI();
  setupCanvas();
  loadStateFromLocalStorage();
  redraw();
  updateStats();
  lucide.createIcons();
});

// Render Side Library Catalog
function initializeCatalog() {
  furnitureCatalog.innerHTML = '';
  FURNITURE_DATABASE.forEach(item => {
    const card = document.createElement('div');
    card.className = 'furniture-card';
    card.innerHTML = `
      <i data-lucide="${getIconForType(item.type)}"></i>
      <span>${item.name}</span>
      <span class="size-badge">${item.w} x ${item.h} tiles</span>
    `;
    card.addEventListener('click', () => addFurnitureToRoom(item.type));
    furnitureCatalog.appendChild(card);
  });
}

function getIconForType(type) {
  switch(type) {
    case 'bed': return 'bed';
    case 'couch': return 'armchair';
    case 'desk': return 'monitor';
    case 'chair': return 'pocket';
    case 'table': return 'table';
    case 'sidetable': return 'archive';
    case 'wardrobe': return 'box';
    case 'plant': return 'flower';
    default: return 'component';
  }
}

// UI Configuration listeners
function initializeUI() {
  gridSizeInput.addEventListener('input', (e) => {
    state.gridSize = parseInt(e.target.value);
    gridSizeVal.textContent = `${state.gridSize}x${state.gridSize}`;
    saveStateToLocalStorage();
    redraw();
    updateStats();
  });

  // Floor style updates
  floorStyleSelector.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      floorStyleSelector.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      state.floorStyle = dot.getAttribute('data-style');
      saveStateToLocalStorage();
      redraw();
    });
  });

  // Wall color updates
  wallColorSelector.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      wallColorSelector.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      state.wallColor = dot.getAttribute('data-color');
      saveStateToLocalStorage();
      redraw();
    });
  });

  // Theme support
  themeToggleBtn.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    themeIcon.setAttribute('data-lucide', state.theme === 'light' ? 'sun' : 'moon');
    lucide.createIcons();
    saveStateToLocalStorage();
    redraw();
  });

  // Toolbar Click Actions
  rotateItemBtn.addEventListener('click', rotateSelected);
  deleteItemBtn.addEventListener('click', deleteSelected);
  zoomInBtn.addEventListener('click', () => { state.zoom = Math.min(state.zoom + 0.1, 1.8); redraw(); });
  zoomOutBtn.addEventListener('click', () => { state.zoom = Math.max(state.zoom - 0.1, 0.6); redraw(); });
  clearLayoutBtn.addEventListener('click', clearCanvas);
  exportPlanBtn.addEventListener('click', exportCanvasImage);

  // Keyboard shortcut listener
  window.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') rotateSelected();
    if (e.key === 'Backspace' || e.key === 'Delete') deleteSelected();
  });
}

// Canvas Sizing setup
function setupCanvas() {
  const resizeCanvas = () => {
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    // Auto center camera
    state.offsetX = canvas.width / 2;
    state.offsetY = canvas.height / 2 - 50;
    redraw();
  };
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Mouse / Touch interaction handlers
  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('mouseleave', handleMouseUp);
}

// Add Item from Side Catalog
function addFurnitureToRoom(type) {
  const dbItem = FURNITURE_DATABASE.find(i => i.type === type);
  if (!dbItem) return;

  const newItem = {
    id: 'item_' + Date.now(),
    type: dbItem.type,
    name: dbItem.name,
    w: dbItem.w,
    h: dbItem.h,
    color: dbItem.color,
    gridX: Math.floor(state.gridSize / 2) - Math.floor(dbItem.w / 2),
    gridY: Math.floor(state.gridSize / 2) - Math.floor(dbItem.h / 2),
    rotation: 0 // 0, 90, 180, 270
  };

  // Prevent placements off-screen / out of grid limits
  newItem.gridX = Math.max(0, Math.min(newItem.gridX, state.gridSize - newItem.w));
  newItem.gridY = Math.max(0, Math.min(newItem.gridY, state.gridSize - newItem.h));

  state.items.push(newItem);
  state.selectedItemId = newItem.id;
  
  saveStateToLocalStorage();
  redraw();
  updateStats();
}

// Rotate item clockwise 90deg
function rotateSelected() {
  if (!state.selectedItemId) return;
  const item = state.items.find(i => i.id === state.selectedItemId);
  if (item) {
    // Swap width and height to rotate footprint correctly
    const temp = item.w;
    item.w = item.h;
    item.h = temp;
    
    item.rotation = (item.rotation + 90) % 360;
    
    // Fit back inside bounds
    item.gridX = Math.max(0, Math.min(item.gridX, state.gridSize - item.w));
    item.gridY = Math.max(0, Math.min(item.gridY, state.gridSize - item.h));

    saveStateToLocalStorage();
    redraw();
  }
}

// Delete item
function deleteSelected() {
  if (!state.selectedItemId) return;
  state.items = state.items.filter(i => i.id !== state.selectedItemId);
  state.selectedItemId = null;
  saveStateToLocalStorage();
  redraw();
  updateStats();
}

function clearCanvas() {
  if (confirm("Are you sure you want to clear the entire room layout?")) {
    state.items = [];
    state.selectedItemId = null;
    saveStateToLocalStorage();
    redraw();
    updateStats();
  }
}

// Dragging Logic
function handleMouseDown(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Check if click hits a placed furniture element (reverse order to pick topmost)
  let clickedItem = null;
  for (let i = state.items.length - 1; i >= 0; i--) {
    const item = state.items[i];
    if (isPointInItem(mouseX, mouseY, item)) {
      clickedItem = item;
      break;
    }
  }

  if (clickedItem) {
    state.selectedItemId = clickedItem.id;
    state.draggedItem = clickedItem;
    // Calculate drag offset in grid cells
    const cellCoord = screenToGrid(mouseX, mouseY);
    state.dragStartX = cellCoord.x - clickedItem.gridX;
    state.dragStartY = cellCoord.y - clickedItem.gridY;
  } else {
    // Left-click empty space drags the overall viewport camera
    state.selectedItemId = null;
    state.isDraggingCanvas = true;
    state.dragStartX = mouseX - state.offsetX;
    state.dragStartY = mouseY - state.offsetY;
  }
  
  redraw();
}

function handleMouseMove(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  if (state.draggedItem) {
    const cellCoord = screenToGrid(mouseX, mouseY);
    let newGridX = cellCoord.x - state.dragStartX;
    let newGridY = cellCoord.y - state.dragStartY;

    // Enforce room grid bounds
    newGridX = Math.max(0, Math.min(newGridX, state.gridSize - state.draggedItem.w));
    newGridY = Math.max(0, Math.min(newGridY, state.gridSize - state.draggedItem.h));

    if (state.draggedItem.gridX !== newGridX || state.draggedItem.gridY !== newGridY) {
      state.draggedItem.gridX = newGridX;
      state.draggedItem.gridY = newGridY;
      redraw();
    }
  } else if (state.isDraggingCanvas) {
    state.offsetX = mouseX - state.dragStartX;
    state.offsetY = mouseY - state.dragStartY;
    redraw();
  }
}

function handleMouseUp() {
  state.isDraggingCanvas = false;
  if (state.draggedItem) {
    state.draggedItem = null;
    saveStateToLocalStorage();
    updateStats();
  }
}

// Isometric Projection Math
// Convert grid coordinate (x, y) to isometric screen coordinates (px, py)
function gridToScreen(gx, gy) {
  const scaledSize = state.tileSize * state.zoom;
  // Rotate 45deg and scale Y by 0.5 for 2:1 isometric ratio
  const px = (gx - gy) * scaledSize;
  const py = (gx + gy) * (scaledSize / 2);
  return { x: px + state.offsetX, y: py + state.offsetY };
}

// Convert screen coordinates (px, py) back to grid coordinates (gx, gy)
function screenToGrid(px, py) {
  const scaledSize = state.tileSize * state.zoom;
  const x = px - state.offsetX;
  const y = py - state.offsetY;
  
  const gx = (x / scaledSize + y / (scaledSize / 2)) / 2;
  const gy = (y / (scaledSize / 2) - x / scaledSize) / 2;
  
  return { x: Math.floor(gx), y: Math.floor(gy) };
}

// Hitbox collision check for canvas clicks
function isPointInItem(px, py, item) {
  // Translate grid corners to screen polygons
  const p0 = gridToScreen(item.gridX, item.gridY);
  const p1 = gridToScreen(item.gridX + item.w, item.gridY);
  const p2 = gridToScreen(item.gridX + item.w, item.gridY + item.h);
  const p3 = gridToScreen(item.gridX, item.gridY + item.h);

  // Approximate furniture height component for clicking 3D structures
  const heightOffset = 60 * state.zoom; // Assume average height
  
  // Point-in-polygon check for isometric cube footprint + height
  const polyPoints = [
    { x: p0.x, y: p0.y - heightOffset },
    { x: p1.x, y: p1.y - heightOffset },
    { x: p2.x, y: p2.y },
    { x: p3.x, y: p3.y },
    { x: p0.x, y: p0.y }
  ];

  return isPointInPolygon({ x: px, y: py }, polyPoints);
}

function isPointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    
    const intersect = ((yi > point.y) !== (yj > point.y))
        && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Render Loops
function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background grid visual helper
  drawGridFloor();
  
  // Sort items back-to-front (depth sorting by isometric Y+X value)
  const sortedItems = [...state.items].sort((a, b) => {
    return (a.gridX + a.gridY) - (b.gridX + b.gridY);
  });

  // Draw placed elements
  sortedItems.forEach(item => {
    drawFurniture(item);
  });
}

function drawGridFloor() {
  const scale = state.tileSize * state.zoom;
  
  // 1. Draw Wall Panels (drawn first as back layer)
  ctx.fillStyle = state.wallColor;
  
  // Left wall
  ctx.beginPath();
  const pLeftWall0 = gridToScreen(0, 0);
  const pLeftWall1 = gridToScreen(0, state.gridSize);
  ctx.moveTo(pLeftWall0.x, pLeftWall0.y);
  ctx.lineTo(pLeftWall1.x, pLeftWall1.y);
  ctx.lineTo(pLeftWall1.x, pLeftWall1.y - 120 * state.zoom);
  ctx.lineTo(pLeftWall0.x, pLeftWall0.y - 120 * state.zoom);
  ctx.closePath();
  ctx.fill();

  // Right wall
  ctx.beginPath();
  const pRightWall0 = gridToScreen(0, 0);
  const pRightWall1 = gridToScreen(state.gridSize, 0);
  ctx.moveTo(pRightWall0.x, pRightWall0.y);
  ctx.lineTo(pRightWall1.x, pRightWall1.y);
  ctx.lineTo(pRightWall1.x, pRightWall1.y - 120 * state.zoom);
  ctx.lineTo(pRightWall0.x, pRightWall0.y - 120 * state.zoom);
  ctx.closePath();
  ctx.fillStyle = darkenColor(state.wallColor, -20); // Darker shadow right
  ctx.fill();

  // 2. Draw Floor Plane
  ctx.beginPath();
  const f0 = gridToScreen(0, 0);
  const f1 = gridToScreen(state.gridSize, 0);
  const f2 = gridToScreen(state.gridSize, state.gridSize);
  const f3 = gridToScreen(0, state.gridSize);
  ctx.moveTo(f0.x, f0.y);
  ctx.lineTo(f1.x, f1.y);
  ctx.lineTo(f2.x, f2.y);
  ctx.lineTo(f3.x, f3.y);
  ctx.closePath();
  
  // Custom styles for floor planes
  if (state.floorStyle === 'wood') {
    ctx.fillStyle = '#b45309';
  } else if (state.floorStyle === 'slate') {
    ctx.fillStyle = '#475569';
  } else if (state.floorStyle === 'green') {
    ctx.fillStyle = '#065f46';
  } else if (state.floorStyle === 'grid') {
    ctx.fillStyle = state.theme === 'light' ? '#f8fafc' : '#1e293b';
  } else {
    // default cyan active
    ctx.fillStyle = state.theme === 'light' ? '#e0f2fe' : '#0c4a6e';
  }
  ctx.fill();
  
  // Floor grid outline
  ctx.strokeStyle = state.theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Grid lines
  for (let i = 0; i <= state.gridSize; i++) {
    // Left-to-right lines
    const startL = gridToScreen(0, i);
    const endL = gridToScreen(state.gridSize, i);
    ctx.beginPath();
    ctx.moveTo(startL.x, startL.y);
    ctx.lineTo(endL.x, endL.y);
    ctx.stroke();

    // Right-to-left lines
    const startR = gridToScreen(i, 0);
    const endR = gridToScreen(i, state.gridSize);
    ctx.beginPath();
    ctx.moveTo(startR.x, startR.y);
    ctx.lineTo(endR.x, endR.y);
    ctx.stroke();
  }
}

// Dynamic Furniture rendering box structures
function drawFurniture(item) {
  const isSelected = item.id === state.selectedItemId;
  
  // Compute screen points for bottom footprint
  const p0 = gridToScreen(item.gridX, item.gridY);
  const p1 = gridToScreen(item.gridX + item.w, item.gridY);
  const p2 = gridToScreen(item.gridX + item.w, item.gridY + item.h);
  const p3 = gridToScreen(item.gridX, item.gridY + item.h);

  // Set height multiplier based on furniture type
  let hVal = 30; // base height
  if (item.type === 'wardrobe') hVal = 95;
  if (item.type === 'bed') hVal = 25;
  if (item.type === 'desk' || item.type === 'table') hVal = 35;
  if (item.type === 'plant') hVal = 40;
  
  const height = hVal * state.zoom;

  // Selection Glow/Highlight ring on floor
  if (isSelected) {
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'var(--primary)';
    ctx.strokeStyle = 'var(--primary)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.closePath();
    ctx.stroke();
    // reset shadow
    ctx.shadowBlur = 0;
  }

  // Draw 3D Box sides (Front-Left, Front-Right, Top Face)
  const baseColor = item.color;
  const leftColor = darkenColor(baseColor, -20);
  const rightColor = darkenColor(baseColor, -40);

  // Front-Left Face (p0 to p3 extruded upwards)
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.lineTo(p3.x, p3.y - height);
  ctx.lineTo(p0.x, p0.y - height);
  ctx.closePath();
  ctx.fillStyle = leftColor;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.stroke();

  // Front-Right Face (p3 to p2 extruded upwards)
  ctx.beginPath();
  ctx.moveTo(p3.x, p3.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p2.x, p2.y - height);
  ctx.lineTo(p3.x, p3.y - height);
  ctx.closePath();
  ctx.fillStyle = rightColor;
  ctx.fill();
  ctx.stroke();

  // Top Face (p0, p1, p2, p3 shifted upwards by height)
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y - height);
  ctx.lineTo(p1.x, p1.y - height);
  ctx.lineTo(p2.x, p2.y - height);
  ctx.lineTo(p3.x, p3.y - height);
  ctx.closePath();
  ctx.fillStyle = baseColor;
  ctx.fill();
  ctx.stroke();

  // Custom Detail overlays per type
  if (item.type === 'bed') {
    // Draw Pillows
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    const pill = gridToScreen(item.gridX + 0.3, item.gridY + 0.3);
    ctx.arc(pill.x, pill.y - height, 8 * state.zoom, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.type === 'plant') {
    // Draw plant leaves circles
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    const l1 = gridToScreen(item.gridX + 0.5, item.gridY + 0.5);
    ctx.arc(l1.x, l1.y - height - 15 * state.zoom, 14 * state.zoom, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Color Utility - darken or lighten hex colors
function darkenColor(hex, percent) {
  let num = parseInt(hex.replace("#",""),16),
  amt = Math.round(2.55 * percent),
  R = (num >> 16) + amt,
  G = (num >> 8 & 0x00FF) + amt,
  B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R<255?R<0?0:R:255)*0x10000 + (G<255?G<0?0:G:255)*0x100 + (B<255?B<0?0:B:255)).toString(16).slice(1);
}

// Space footprints analytics calculators
function updateStats() {
  const tileSqFt = 9; // Let each tile represent a 3ft x 3ft area (9 sq ft)
  const totalTiles = state.gridSize * state.gridSize;
  const totalArea = totalTiles * tileSqFt;

  let occupiedTiles = 0;
  state.items.forEach(item => {
    occupiedTiles += (item.w * item.h);
  });
  
  const occupiedArea = occupiedTiles * tileSqFt;
  const clearanceArea = Math.max(0, totalArea - occupiedArea);
  const occupiedPct = Math.round((occupiedTiles / totalTiles) * 100);

  statsTotalArea.textContent = `${totalArea} sq ft`;
  statsOccupiedArea.textContent = `${occupiedArea} sq ft`;
  statsClearanceArea.textContent = `${clearanceArea} sq ft`;
  statsFurnitureCount.textContent = `${state.items.length} item(s)`;

  // Update progress bar
  occupiedProgressBar.style.width = `${occupiedPct}%`;
  statsOccupiedPct.textContent = `${occupiedPct}% Room Footprint Occupied`;
  
  // Set alert color when occupancy exceeds safe limits
  if (occupiedPct > 80) {
    occupiedProgressBar.style.backgroundColor = 'var(--danger)';
  } else {
    occupiedProgressBar.style.backgroundColor = 'var(--primary)';
  }
}

// Local Storage helpers
function saveStateToLocalStorage() {
  localStorage.setItem('isometric_planner_state', JSON.stringify({
    gridSize: state.gridSize,
    floorStyle: state.floorStyle,
    wallColor: state.wallColor,
    theme: state.theme,
    items: state.items
  }));
}

function loadStateFromLocalStorage() {
  const localData = localStorage.getItem('isometric_planner_state');
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      state.gridSize = parsed.gridSize || 10;
      state.floorStyle = parsed.floorStyle || 'cyan';
      state.wallColor = parsed.wallColor || '#334155';
      state.theme = parsed.theme || 'dark';
      state.items = parsed.items || [];
      
      // Update inputs
      gridSizeInput.value = state.gridSize;
      gridSizeVal.textContent = `${state.gridSize}x${state.gridSize}`;
      document.documentElement.setAttribute('data-theme', state.theme);
      themeIcon.setAttribute('data-lucide', state.theme === 'light' ? 'sun' : 'moon');
      
      // Activate dots
      activateDot(floorStyleSelector, state.floorStyle, 'data-style');
      activateDot(wallColorSelector, state.wallColor, 'data-color');
    } catch(e) {
      console.error("Failed to parse local storage", e);
    }
  }
}

function activateDot(selector, value, attribute) {
  selector.querySelectorAll('.color-dot').forEach(dot => {
    if (dot.getAttribute(attribute) === value) {
      selector.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
    }
  });
}

// Export Blueprint Image
function exportCanvasImage() {
  // Briefly deselect item to hide selection border for clean export
  const selectedTemp = state.selectedItemId;
  state.selectedItemId = null;
  redraw();
  
  const imgData = canvas.toDataURL("image/png");
  const link = document.createElement('a');
  link.download = `room_layout_design_${Date.now()}.png`;
  link.href = imgData;
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Restore selection
  state.selectedItemId = selectedTemp;
  redraw();
}
