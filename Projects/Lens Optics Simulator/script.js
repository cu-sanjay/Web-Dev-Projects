/**
 * Lens Optics Simulator - Refraction Ray Tracer & Prism Spectrometer
 * Authors: Sujal
 * License: Open Source
 */

(function () {
  // --- STATE VARIABLES ---
  let mode = 'rays'; // 'rays' | 'prism' (Snell Sandbox)
  let isPlaying = true;
  let time = 0;
  let timeStep = 0.05;
  let speedMultiplier = 1.0;

  // Lens / Refraction Specs
  let activeComponent = 'convex'; // 'convex' | 'concave' | 'prism' | 'slab'
  let focalLength = 120; // f in pixels (Converging: >0, Diverging: virtual/negative)
  let apertureSize = 240; // Height of lens/prism face
  let glassIndex = 1.50; // Index of Refraction n
  let isWhiteLight = false; // Cauchy dispersion rainbow split

  // Core coordinates
  const lensX = 300; // X position of paraxial thin lens plane
  const centerY = 200; // Y position of principal axis

  // Laser light emitter node
  let lightSource = {
    x: 100,
    y: 200,
    radius: 8,
    isDragging: false
  };

  // Object Arrow (for lens image construction)
  let objectArrow = {
    x: 180,
    y: 130, // height = 200 - 130 = 70px
    radius: 8,
    isDragging: false
  };

  let sourceAngle = 0; // beam tilt degrees
  let rayCount = 12;
  let beamWidth = 80;

  const canvas = document.getElementById('sim-canvas');
  const ctx = canvas.getContext('2d');
  const consoleEl = document.getElementById('logger-console');

  // --- LOGGING ---
  function log(message, type = 'sys') {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    
    let prefix = '[SYS]';
    if (type === 'phys') prefix = '[PHYSICS]';
    if (type === 'preset') prefix = '[PRESET]';
    if (type === 'warn') prefix = '[WARN]';
    
    entry.textContent = `${prefix} ${timeStr} - ${message}`;
    consoleEl.appendChild(entry);
    consoleEl.scrollTop = consoleEl.scrollHeight;
  }

  // --- SNELL'S LAW GEOMETRIC SOLVER ---

  // Ray-segment intersection helper
  function intersectRaySegment(p, d, a, b) {
    const rpx = p.x, rpy = p.y;
    const rdx = d.x, rdy = d.y;
    const spx = a.x, spy = a.y;
    const sdx = b.x - a.x, sdy = b.y - a.y;

    const r_cross_s = rdx * sdy - rdy * sdx;
    if (Math.abs(r_cross_s) < 1e-6) return null; // Parallel

    const t = ((spx - rpx) * sdy - (spy - rpy) * sdx) / r_cross_s;
    const u = ((spx - rpx) * rdy - (spy - rpy) * rdx) / r_cross_s;

    if (t > 0 && u >= 0 && u <= 1) {
      return {
        x: rpx + t * rdx,
        y: rpy + t * rdy,
        t: t
      };
    }
    return null;
  }

  // Define active refraction geometry segments (Prism & Slab)
  function getRefractiveSegments() {
    let segments = [];
    
    if (activeComponent === 'prism') {
      // Equilateral-like triangular prism
      // Top Vertex: (300, 100), Left Base: (210, 290), Right Base: (390, 290)
      const T = { x: 300, y: 100 };
      const L = { x: 210, y: 290 };
      const R = { x: 390, y: 290 };

      // Normal calculations (outward-pointing unit vectors)
      // Seg 1 (Left face): L -> T. Normal points up-left
      // dy = -190, dx = 90. Perpendicular is (-190, -90)
      const len1 = Math.sqrt(190*190 + 90*90);
      segments.push({
        a: L, b: T,
        normal: { x: -190 / len1, y: -90 / len1 }
      });

      // Seg 2 (Right face): T -> R. Normal points up-right
      // dy = 190, dx = 90. Perpendicular is (190, -90)
      const len2 = Math.sqrt(190*190 + 90*90);
      segments.push({
        a: T, b: R,
        normal: { x: 190 / len2, y: -90 / len2 }
      });

      // Seg 3 (Base face): R -> L. Normal points down
      segments.push({
        a: R, b: L,
        normal: { x: 0, y: 1 }
      });

    } else if (activeComponent === 'slab') {
      // Parallel Glass Block Slab
      // Left: 240, Right: 360, Top: 120, Bottom: 280
      const TL = { x: 240, y: 120 };
      const TR = { x: 360, y: 120 };
      const BR = { x: 360, y: 280 };
      const BL = { x: 240, y: 280 };

      // Left face (normal left)
      segments.push({ a: TL, b: BL, normal: { x: -1, y: 0 } });
      // Right face (normal right)
      segments.push({ a: BR, b: TR, normal: { x: 1, y: 0 } });
      // Top face (normal up)
      segments.push({ a: TR, b: TL, normal: { x: 0, y: -1 } });
      // Bottom face (normal down)
      segments.push({ a: BL, b: BR, normal: { x: 0, y: 1 } });
    }

    return segments;
  }

  // Recursive refraction trace solver using vector Snell's Law
  function traceRefractionRay(start, dir, n_glass, bounceLimit = 4) {
    let p = { ...start };
    let d = { ...dir };
    let path = [ { x: p.x, y: p.y } ];
    let currentN = 1.0; // Air index

    const segments = getRefractiveSegments();

    for (let b = 0; b < bounceLimit; b++) {
      let closest = null;
      let closestT = Infinity;
      let hitIndex = -1;

      // Find closest segment intersection
      for (let i = 0; i < segments.length; i++) {
        let res = intersectRaySegment(p, d, segments[i].a, segments[i].b);
        if (res && res.t < closestT) {
          closestT = res.t;
          closest = res;
          hitIndex = i;
        }
      }

      if (!closest) {
        // Escapes to screen bounds
        let endX = p.x + d.x * 1200;
        let endY = p.y + d.y * 1200;
        path.push({ x: endX, y: endY });
        break;
      }

      path.push({ x: closest.x, y: closest.y });

      let normal = segments[hitIndex].normal;
      
      // Face normal towards incoming ray
      let dot = d.x * normal.x + d.y * normal.y;
      if (dot > 0) {
        normal = { x: -normal.x, y: -normal.y };
        dot = -dot;
      }

      // Determine indices
      let n1 = currentN;
      let n2 = (Math.abs(currentN - 1.0) < 0.05) ? n_glass : 1.0;

      let eta = n1 / n2;
      let cosTheta1 = -dot;
      let term = 1.0 - eta * eta * (1.0 - cosTheta1 * cosTheta1);

      if (term < 0) {
        // Total Internal Reflection (TIR)!
        let rx = d.x - 2 * dot * normal.x;
        let ry = d.y - 2 * dot * normal.y;
        
        // Offset starting point slightly to prevent numeric recursion lock
        p = { x: closest.x + rx * 0.01, y: closest.y + ry * 0.01 };
        d = { x: rx, y: ry };
        // currentN stays the same inside glass
      } else {
        // Refraction! Vector form of Snell's Law
        let cosTheta2 = Math.sqrt(term);
        let rx = eta * d.x + (eta * cosTheta1 - cosTheta2) * normal.x;
        let ry = eta * d.y + (eta * cosTheta1 - cosTheta2) * normal.y;

        let len = Math.sqrt(rx*rx + ry*ry);
        rx /= len;
        ry /= len;

        p = { x: closest.x + rx * 0.01, y: closest.y + ry * 0.01 };
        d = { x: rx, y: ry };
        currentN = n2; // Crossed boundary successfully
      }
    }

    return path;
  }

  // --- LENS IMAGE CONSTRUCTION (RAY OPTICS) ---
  function drawLensConjugation() {
    const do_dist = lensX - objectArrow.x;
    const ho = centerY - objectArrow.y;
    
    let f = focalLength;
    if (activeComponent === 'concave') f = -focalLength; // Diverging lens has virtual focus

    let di = 0;
    let hi = 0;
    let isVirtual = false;
    let noImage = false;

    // 1/do + 1/di = 1/f -> di = (f * do) / (do - f)
    if (Math.abs(do_dist - f) < 3) {
      noImage = true;
      di = Infinity;
      hi = Infinity;
    } else {
      di = (f * do_dist) / (do_dist - f);
      hi = -ho * (di / do_dist);
      isVirtual = di < 0;
    }

    // Coordinates of image tip
    let imgX = lensX + di; // Image is on opposite side (positive di -> lensX + di)
    let imgY = centerY - hi;

    // Update Telemetry HUD and Ledger Values
    document.getElementById('hud-do').textContent = `${do_dist.toFixed(1)}px`;
    document.getElementById('hud-di').textContent = noImage ? 'Infinity' : `${Math.abs(di).toFixed(1)}px`;
    document.getElementById('hud-mag').textContent = noImage ? 'N/A' : `${(hi / ho).toFixed(2)}x`;

    document.getElementById('led-f').textContent = `${f.toFixed(1)} px`;
    document.getElementById('led-do').textContent = `${do_dist.toFixed(1)} px`;
    document.getElementById('led-di').textContent = noImage ? 'Infinity' : `${di.toFixed(1)} px`;
    document.getElementById('led-m').textContent = noImage ? 'N/A' : `${(hi / ho).toFixed(2)}x`;
    document.getElementById('led-incident').textContent = 'N/A';
    document.getElementById('led-refracted').textContent = 'N/A';

    let badge = document.getElementById('lbl-image-type');
    if (noImage) {
      badge.textContent = "NO IMAGE (AT FOCUS)";
      badge.className = "red-glow";
    } else if (isVirtual) {
      badge.textContent = "VIRTUAL & UPRIGHT";
      badge.className = "yellow-glow";
    } else {
      badge.textContent = "REAL & INVERTED";
      badge.className = "green-glow";
    }

    // Principal paraxial ray paths
    const startPoint = { x: objectArrow.x, y: objectArrow.y };
    let rayPaths = [];

    if (activeComponent === 'convex') {
      // 1. Parallel Ray -> refracts through right Focus (lensX + f)
      rayPaths.push([
        startPoint,
        { x: lensX, y: startPoint.y },
        { x: lensX + f, y: centerY },
        { x: lensX + f + 200, y: centerY - 200 * (centerY - startPoint.y) / f }
      ]);

      // 2. Focal Ray -> goes through left Focus (lensX - f) -> refracts parallel
      // We extend ray to lens center plane
      const slope = (centerY - startPoint.y) / (startPoint.x - (lensX - f));
      const hitY = centerY - slope * (lensX - f - lensX); // Y where ray hits lens
      rayPaths.push([
        startPoint,
        { x: lensX, y: hitY },
        { x: lensX + 300, y: hitY }
      ]);

      // 3. Central Ray -> goes straight through vertex (lensX, centerY) without bending
      const vSlope = (centerY - startPoint.y) / (lensX - startPoint.x);
      rayPaths.push([
        startPoint,
        { x: lensX, y: centerY },
        { x: lensX + 300, y: centerY + vSlope * 300 }
      ]);
    } else {
      // Concave/Diverging Lens paraxial rays
      // 1. Parallel Ray -> refracts away from left virtual Focus (lensX - f_abs)
      const hitY = startPoint.y;
      const vFocusX = lensX - focalLength; // Left focus
      const slope = (hitY - centerY) / (lensX - vFocusX);
      rayPaths.push([
        startPoint,
        { x: lensX, y: hitY },
        { x: lensX + 300, y: hitY + slope * 300 }
      ]);

      // 2. Focal Ray -> travels towards right virtual Focus (lensX + f_abs) -> refracts parallel
      const rFocusX = lensX + focalLength; // Right focus
      const fSlope = (centerY - startPoint.y) / (rFocusX - startPoint.x);
      const fHitY = centerY - fSlope * (rFocusX - lensX);
      rayPaths.push([
        startPoint,
        { x: lensX, y: fHitY },
        { x: lensX + 300, y: fHitY }
      ]);

      // 3. Central Ray -> straight through vertex
      const vSlope = (centerY - startPoint.y) / (lensX - startPoint.x);
      rayPaths.push([
        startPoint,
        { x: lensX, y: centerY },
        { x: lensX + 300, y: centerY + vSlope * 300 }
      ]);
    }

    // Render principal rays
    let colors = ['#00f2fe', '#ffd700', '#ff007f']; // cyan, yellow, pink
    rayPaths.forEach((path, index) => {
      ctx.strokeStyle = colors[index % 3];
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let k = 1; k < path.length; k++) {
        ctx.lineTo(path[k].x, path[k].y);
      }
      ctx.stroke();

      // Draw virtual ray tracing extensions dashed behind lens
      if (isVirtual && !noImage) {
        ctx.strokeStyle = 'rgba(253, 0, 142, 0.4)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(imgX, imgY);
        // Trace to the intersection point at lens plane (lensX, path[1].y)
        ctx.lineTo(lensX, path[1].y);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (!isVirtual && !noImage) {
        // Draw dashed virtual ray extensions backwards if object is outside focus
        // showing where they meet in real space.
      }
    });

    // Draw real Object Arrow (green)
    drawArrow(objectArrow.x, centerY, objectArrow.x, objectArrow.y, '#39ff14', false);

    // Draw Image Arrow
    if (!noImage) {
      drawArrow(imgX, centerY, imgX, imgY, isVirtual ? '#ff8c00' : '#fd008e', isVirtual);
    }
  }

  function drawArrow(xStart, yStart, xEnd, yEnd, color, isDashed) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3.5;
    if (isDashed) ctx.setLineDash([5, 4]);

    ctx.beginPath();
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(xEnd, yEnd);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Arrowhead
    const arrowSize = 8;
    const angle = Math.atan2(yEnd - yStart, xEnd - xStart);
    ctx.beginPath();
    ctx.moveTo(xEnd, yEnd);
    ctx.lineTo(xEnd - arrowSize * Math.cos(angle - Math.PI / 6), yEnd - arrowSize * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(xEnd - arrowSize * Math.cos(angle + Math.PI / 6), yEnd - arrowSize * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  }

  // --- REFRACTION SANDBOX (Laser, Beam, Point) ---
  function drawRefractionSandbox() {
    let rays = [];
    const radAngle = (sourceAngle * Math.PI) / 180;

    // Cauchy dispersion wavelength sets
    // If white light: trace 7 spectral color rays (red to violet)
    // If monochromatic: trace single lightColor
    let wavelengthOffsets = [0.0];
    let rayColors = [lightColor];

    if (isWhiteLight && sourceType === 'laser') {
      wavelengthOffsets = [-0.015, -0.010, -0.005, 0.0, 0.005, 0.010, 0.015];
      rayColors = [
        '#ff0000', // Red
        '#ff7f00', // Orange
        '#ffff00', // Yellow
        '#00ff00', // Green
        '#0000ff', // Blue
        '#4b0082', // Indigo
        '#9400d3'  // Violet
      ];
    }

    const start = { x: lightSource.x, y: lightSource.y };

    if (sourceType === 'laser') {
      // Single laser (or spectral split bundle)
      wavelengthOffsets.forEach((offset, idx) => {
        const dir = { x: Math.cos(radAngle), y: Math.sin(radAngle) };
        const path = traceRefractionRay(start, dir, glassIndex + offset);
        rays.push({ path, color: rayColors[idx] });
      });

      // Update Snell's Law Ledger values for monochromatic laser
      if (!isWhiteLight) {
        const dir = { x: Math.cos(radAngle), y: Math.sin(radAngle) };
        const segments = getRefractiveSegments();
        let closest = null;
        let closestT = Infinity;
        let hitIdx = -1;

        for (let i = 0; i < segments.length; i++) {
          let res = intersectRaySegment(start, dir, segments[i].a, segments[i].b);
          if (res && res.t < closestT) {
            closestT = res.t;
            closest = res;
            hitIdx = i;
          }
        }

        if (closest) {
          let normal = segments[hitIdx].normal;
          let dot = dir.x * normal.x + dir.y * normal.y;
          if (dot > 0) normal = { x: -normal.x, y: -normal.y };

          let incAngle = Math.acos(-dot) * 180 / Math.PI;
          let refRatio = 1.0 / glassIndex;
          let term = 1.0 - refRatio * refRatio * (1.0 - dot * dot);

          document.getElementById('led-incident').textContent = `${incAngle.toFixed(1)}°`;
          if (term >= 0) {
            let refAngle = Math.asin(refRatio * Math.sin(incAngle * Math.PI / 180)) * 180 / Math.PI;
            document.getElementById('led-refracted').textContent = `${refAngle.toFixed(1)}°`;
          } else {
            document.getElementById('led-refracted').textContent = 'TIR (Reflected)';
          }
        } else {
          document.getElementById('led-incident').textContent = 'N/A';
          document.getElementById('led-refracted').textContent = 'N/A';
        }
      } else {
        document.getElementById('led-incident').textContent = 'Dispersion Active';
        document.getElementById('led-refracted').textContent = 'Dispersion Active';
      }

    } else if (sourceType === 'beam') {
      // Parallel Beam
      const dir = { x: Math.cos(radAngle), y: Math.sin(radAngle) };
      const nx = -Math.sin(radAngle);
      const ny = Math.cos(radAngle);

      for (let i = 0; i < rayCount; i++) {
        let offset = (i / (rayCount - 1) - 0.5) * beamWidth;
        const startPoint = {
          x: lightSource.x + nx * offset,
          y: lightSource.y + ny * offset
        };
        const path = traceRefractionRay(startPoint, dir, glassIndex);
        rays.push({ path, color: lightColor });
      }
    } else if (sourceType === 'point') {
      // Point divergent source
      const step = 60 / (rayCount - 1);
      for (let i = 0; i < rayCount; i++) {
        let angle = radAngle + ((i * step - 30) * Math.PI) / 180;
        const dir = { x: Math.cos(angle), y: Math.sin(angle) };
        const path = traceRefractionRay(start, dir, glassIndex);
        rays.push({ path, color: lightColor });
      }
    }

    // Render rays on canvas
    rays.forEach(r => {
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(r.path[0].x, r.path[0].y);
      for (let k = 1; k < r.path.length; k++) {
        ctx.lineTo(r.path[k].x, r.path[k].y);
      }
      ctx.stroke();
    });

    // Render light source node
    ctx.beginPath();
    ctx.arc(lightSource.x, lightSource.y, lightSource.radius, 0, 2*Math.PI);
    ctx.fillStyle = lightSource.isDragging ? '#ffd700' : '#00f2fe';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.fill();
    ctx.stroke();

    // Draw laser pointer barrel
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(lightSource.x, lightSource.y);
    ctx.lineTo(lightSource.x - 14 * Math.cos(radAngle), lightSource.y - 14 * Math.sin(radAngle));
    ctx.stroke();
  }

  // --- DRAW OPTICAL BOUNDARIES ---
  function drawOpticalComponent() {
    ctx.fillStyle = 'rgba(0, 242, 254, 0.06)';
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
    ctx.lineWidth = 2.5;

    if (activeComponent === 'convex' && mode === 'rays') {
      // Convex Lens shape (bi-convex overlapping circles representation)
      // Drawn centered at lensX = 300, height = apertureSize
      const halfSize = apertureSize / 2;
      const thickness = 28;
      
      ctx.beginPath();
      // Draw left boundary arc curving right
      ctx.arc(lensX - 180, centerY, 180 + thickness/2, -Math.asin(halfSize / 185), Math.asin(halfSize / 185));
      // Draw right boundary arc curving left
      ctx.arc(lensX + 180, centerY, 180 + thickness/2, Math.PI - Math.asin(halfSize / 185), Math.PI + Math.asin(halfSize / 185));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Focal Markers F
      drawPointMarker(lensX - focalLength, centerY, 'F1', '#ffd700');
      drawPointMarker(lensX + focalLength, centerY, 'F2', '#ffd700');
      
      // Center focal planes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      ctx.beginPath(); ctx.moveTo(lensX, centerY - halfSize); ctx.lineTo(lensX, centerY + halfSize); ctx.stroke();
      ctx.setLineDash([]);

    } else if (activeComponent === 'concave' && mode === 'rays') {
      // Concave Lens shape (inward curved sides)
      const halfSize = apertureSize / 2;
      const thickness = 14;
      const w = 18; // Lens side width

      ctx.beginPath();
      // Top line
      ctx.moveTo(lensX - w, centerY - halfSize);
      ctx.lineTo(lensX + w, centerY - halfSize);
      // Right curved side (inner curving left)
      ctx.arc(lensX + 160, centerY, 160 - thickness, Math.PI + Math.asin(halfSize / 140), Math.PI - Math.asin(halfSize / 140), true);
      // Bottom line
      ctx.lineTo(lensX - w, centerY + halfSize);
      // Left curved side (inner curving right)
      ctx.arc(lensX - 160, centerY, 160 - thickness, Math.asin(halfSize / 140), -Math.asin(halfSize / 140), true);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Focal Markers F (Virtual)
      drawPointMarker(lensX - focalLength, centerY, 'F1', 'rgba(255, 215, 0, 0.55)');
      drawPointMarker(lensX + focalLength, centerY, 'F2', 'rgba(255, 215, 0, 0.55)');

    } else if (activeComponent === 'prism' && mode === 'prism') {
      // Triangular glass prism
      ctx.beginPath();
      ctx.moveTo(210, 290); // Left Base
      ctx.lineTo(300, 100); // Top Vertex
      ctx.lineTo(390, 290); // Right Base
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

    } else if (activeComponent === 'slab' && mode === 'prism') {
      // Parallel Glass Slab
      ctx.beginPath();
      ctx.rect(240, 120, 120, 160);
      ctx.fill();
      ctx.stroke();
    }
  }

  function drawPointMarker(x, y, label, color) {
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2*Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.fillStyle = color;
    ctx.font = 'bold 9px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y - 8);
  }

  function drawPrincipalAxis() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.stroke();
  }

  // --- PRESETS ---
  function applyPreset(presetName) {
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
    
    const clickedBtn = document.querySelector(`.preset-btn[data-preset="${presetName}"]`);
    if (clickedBtn) clickedBtn.classList.add('active');

    log(`Activated Preset: "${presetName.replace('preset-', '').toUpperCase()}"`, 'preset');

    if (presetName === 'preset-magnifier') {
      setMode('rays');
      activeComponent = 'convex';
      sourceType = 'object';
      focalLength = 120;
      objectArrow.x = lensX - 70; // do = 70px (inside focus)
      objectArrow.y = 140; // ho = 60px
      updateUI();
      log('Convex magnifier. Object inside focus (do < f) forms a virtual, upright, magnified image.', 'phys');
      
    } else if (presetName === 'preset-projector') {
      setMode('rays');
      activeComponent = 'convex';
      sourceType = 'object';
      focalLength = 120;
      objectArrow.x = lensX - 180; // do = 180 (between F and 2F)
      objectArrow.y = 150;
      updateUI();
      log('Real image projector. Object outside focus (f < do < 2f) forms a real, inverted, magnified image.', 'phys');
      
    } else if (presetName === 'preset-concave') {
      setMode('rays');
      activeComponent = 'concave';
      sourceType = 'object';
      focalLength = 120;
      objectArrow.x = lensX - 140;
      objectArrow.y = 140;
      updateUI();
      log('Concave/Diverging Lens. Refractions diverge paraxial rays. Image is virtual, upright, and diminished.', 'phys');
      
    } else if (presetName === 'preset-prism') {
      setMode('prism');
      activeComponent = 'prism';
      sourceType = 'laser';
      isWhiteLight = true;
      document.getElementById('chk-white-light').checked = true;
      glassIndex = 1.58; // slightly higher index for dispersion separation
      sourceAngle = 22; // tilt laser
      lightSource.x = 90;
      lightSource.y = 230;
      updateUI();
      log('Prism Rainbow Dispersion. Incident white light split into spectral component bands inside glass.', 'phys');
      
    } else if (presetName === 'preset-slab') {
      setMode('prism');
      activeComponent = 'slab';
      sourceType = 'beam';
      isWhiteLight = false;
      document.getElementById('chk-white-light').checked = false;
      glassIndex = 1.52;
      sourceAngle = -20;
      lightSource.x = 100;
      lightSource.y = 170;
      rayCount = 6;
      beamWidth = 60;
      updateUI();
      log('Parallel glass slab refractions. Note parallel ray lateral displacement at exit face.', 'phys');
      
    } else if (presetName === 'preset-tir') {
      setMode('prism');
      activeComponent = 'slab';
      sourceType = 'laser';
      isWhiteLight = false;
      document.getElementById('chk-white-light').checked = false;
      glassIndex = 1.62;
      sourceAngle = 44; // angle exceeding critical angle limit
      lightSource.x = 200;
      lightSource.y = 150;
      updateUI();
      log('Total Internal Reflection (TIR) verified. Angle of incidence exceeds critical angle limit inside block.', 'phys');
    }
  }

  function setMode(newMode) {
    mode = newMode;
    document.getElementById('btn-mode-rays').classList.remove('active');
    document.getElementById('btn-mode-prism').classList.remove('active');

    if (mode === 'rays') {
      document.getElementById('btn-mode-rays').classList.add('active');
      document.getElementById('optical-component-group').classList.remove('hidden');
      document.getElementById('light-source-group').classList.remove('hidden');
      document.getElementById('sim-status-badge').textContent = "LENS RAY";
      document.getElementById('sim-status-badge').className = "status-badge live";
      document.getElementById('guide-text').innerHTML = "<b>Lens Ray Optics:</b> Drag the green object arrow. Conjugation solvers will render parallel, focal, and vertex rays to build real/virtual images.";
    } else {
      document.getElementById('btn-mode-prism').classList.add('active');
      document.getElementById('optical-component-group').classList.remove('hidden');
      document.getElementById('light-source-group').classList.remove('hidden');
      document.getElementById('sim-status-badge').textContent = "REFRACT SANDBOX";
      document.getElementById('sim-status-badge').className = "status-badge live";
      document.getElementById('guide-text').innerHTML = "<b>Refraction Sandbox:</b> Trace indices refractions. Select 'Triangular Glass Prism' and check 'Enable White Light' to dispersion rainbow spectrum.";
    }
  }

  function updateUI() {
    document.getElementById('select-component').value = activeComponent;
    document.getElementById('slider-focal-length').value = focalLength;
    document.getElementById('val-focal-length').textContent = `${focalLength} px`;

    document.getElementById('slider-index').value = glassIndex;
    document.getElementById('val-index').textContent = glassIndex.toFixed(2);

    document.getElementById('slider-aperture').value = apertureSize;
    document.getElementById('val-aperture').textContent = `${apertureSize} px`;

    document.getElementById('select-source-type').value = sourceType;
    document.getElementById('slider-source-angle').value = sourceAngle;
    document.getElementById('val-source-angle').textContent = `${sourceAngle}°`;

    document.getElementById('slider-ray-count').value = rayCount;
    document.getElementById('val-ray-count').textContent = `${rayCount} rays`;

    // Hide/show sliders depending on selected shape
    if (activeComponent === 'prism' || activeComponent === 'slab') {
      document.getElementById('group-focal-length').classList.add('hidden');
      document.getElementById('group-refractive-index').classList.remove('hidden');
      document.getElementById('group-white-light').classList.remove('hidden');
    } else {
      document.getElementById('group-focal-length').classList.remove('hidden');
      document.getElementById('group-refractive-index').classList.add('hidden');
      document.getElementById('group-white-light').classList.add('hidden');
    }
  }

  // --- DRAG INTERACTION HANDLERS ---
  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height
    };
  }

  function checkDragStart(mousePos) {
    if (mode === 'rays' && sourceType === 'object') {
      // Check Object Arrow tip
      const dx = mousePos.x - objectArrow.x;
      const dy = mousePos.y - objectArrow.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < objectArrow.radius + 5) {
        objectArrow.isDragging = true;
        canvas.style.cursor = 'grabbing';
      }
    } else {
      // Check Light Source point
      const dx = mousePos.x - lightSource.x;
      const dy = mousePos.y - lightSource.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < lightSource.radius + 5) {
        lightSource.isDragging = true;
        canvas.style.cursor = 'grabbing';
      }
    }
  }

  function registerEventListeners() {
    // Mode toggles
    document.getElementById('btn-mode-rays').addEventListener('click', () => {
      setMode('rays');
      activeComponent = 'convex';
      updateUI();
    });
    
    document.getElementById('btn-mode-prism').addEventListener('click', () => {
      setMode('prism');
      activeComponent = 'prism';
      updateUI();
    });

    // Select selectors
    document.getElementById('select-component').addEventListener('change', (e) => {
      activeComponent = e.target.value;
      if (activeComponent === 'prism' || activeComponent === 'slab') {
        setMode('prism');
      } else {
        setMode('rays');
      }
      updateUI();
      log(`Applied Boundary Geometry: ${activeComponent.toUpperCase()}`, 'phys');
    });

    document.getElementById('select-source-type').addEventListener('change', (e) => {
      sourceType = e.target.value;
      updateUI();
      log(`Equipped light emitter: ${sourceType.toUpperCase()}`, 'sys');
    });

    // Checkbox white light
    document.getElementById('chk-white-light').addEventListener('change', (e) => {
      isWhiteLight = e.target.checked;
      log(`Cauchy rainbow dispersion ${isWhiteLight ? 'ENGAGED' : 'DISENGAGED'}.`, 'sys');
    });

    // Sliders
    document.getElementById('slider-focal-length').addEventListener('input', (e) => {
      focalLength = parseFloat(e.target.value);
      updateUI();
    });

    document.getElementById('slider-index').addEventListener('input', (e) => {
      glassIndex = parseFloat(e.target.value);
      updateUI();
    });

    document.getElementById('slider-aperture').addEventListener('input', (e) => {
      apertureSize = parseFloat(e.target.value);
      updateUI();
    });

    document.getElementById('slider-source-angle').addEventListener('input', (e) => {
      sourceAngle = parseFloat(e.target.value);
      updateUI();
    });

    document.getElementById('slider-ray-count').addEventListener('input', (e) => {
      rayCount = parseInt(e.target.value);
      updateUI();
    });

    // Presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        let presetKey = e.target.getAttribute('data-preset');
        applyPreset(presetKey);
      });
    });

    // Play/Pause button
    document.getElementById('btn-play-pause').addEventListener('click', () => {
      isPlaying = !isPlaying;
      let badge = document.getElementById('sim-status-badge');
      let playIcon = document.getElementById('play-icon');
      let playText = document.getElementById('play-text');

      if (isPlaying) {
        badge.className = "status-badge live";
        badge.textContent = mode === 'rays' ? "LENS RAY" : "REFRACT SANDBOX";
        playIcon.textContent = "⏸️";
        playText.textContent = "Pause";
        log('Simulation timeline running.', 'sys');
      } else {
        badge.className = "status-badge paused";
        badge.textContent = "PAUSED";
        playIcon.textContent = "▶️";
        playText.textContent = "Play";
        log('Simulation timeline paused.', 'sys');
      }
    });

    // Reset positions button
    document.getElementById('btn-reset-positions').addEventListener('click', () => {
      objectArrow.x = 180;
      objectArrow.y = 130;
      lightSource.x = 100;
      lightSource.y = 200;
      log('Reset object and laser coordinate positions.', 'sys');
    });

    // Reset Defaults params button
    document.getElementById('btn-reset-params').addEventListener('click', () => {
      focalLength = 120;
      glassIndex = 1.50;
      apertureSize = 240;
      sourceAngle = 0;
      rayCount = 12;
      updateUI();
      log('Reset spec sliders deck.', 'sys');
    });

    // Time warp speed options
    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        speedMultiplier = parseFloat(e.target.getAttribute('data-speed'));
        log(`Time compression set to ${speedMultiplier}x`, 'sys');
      });
    });

    // Clear logs button
    document.getElementById('btn-clear-logs').addEventListener('click', () => {
      consoleEl.innerHTML = '';
      log('Optics logs console cleared.', 'sys');
    });

    // Drag and Drop canvas handlers
    canvas.addEventListener('mousedown', (e) => {
      const mousePos = getMousePos(e);
      checkDragStart(mousePos);
    });

    canvas.addEventListener('mousemove', (e) => {
      const mousePos = getMousePos(e);

      // Mouse cursor feedback
      if (!objectArrow.isDragging && !lightSource.isDragging) {
        if (mode === 'rays' && sourceType === 'object') {
          const dx = mousePos.x - objectArrow.x;
          const dy = mousePos.y - objectArrow.y;
          if (Math.sqrt(dx*dx + dy*dy) < objectArrow.radius + 3) {
            canvas.style.cursor = 'grab';
          } else {
            canvas.style.cursor = 'crosshair';
          }
        } else {
          const dx = mousePos.x - lightSource.x;
          const dy = mousePos.y - lightSource.y;
          if (Math.sqrt(dx*dx + dy*dy) < lightSource.radius + 3) {
            canvas.style.cursor = 'grab';
          } else {
            canvas.style.cursor = 'crosshair';
          }
        }
      }

      // Drag items
      if (objectArrow.isDragging) {
        // Enforce bounds (keep in front of lens)
        objectArrow.x = Math.max(10, Math.min(lensX - 15, mousePos.x));
        objectArrow.y = Math.max(20, Math.min(centerY - 5, mousePos.y)); // Keep tip above axis
      } else if (lightSource.isDragging) {
        // Enforce boundary X index
        if (activeComponent === 'tir') {
          // allow drag inside slab
          lightSource.x = Math.max(10, Math.min(canvas.width - 10, mousePos.x));
        } else {
          lightSource.x = Math.max(10, Math.min(lensX - 15, mousePos.x));
        }
        lightSource.y = Math.max(10, Math.min(canvas.height - 10, mousePos.y));
      }
    });

    window.addEventListener('mouseup', () => {
      if (objectArrow.isDragging || lightSource.isDragging) {
        objectArrow.isDragging = false;
        lightSource.isDragging = false;
        canvas.style.cursor = 'crosshair';
        log('Coordinate overrides saved.', 'sys');
      }
    });

    // Touch support for tablets
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const mousePos = {
          x: ((touch.clientX - rect.left) / rect.width) * canvas.width,
          y: ((touch.clientY - rect.top) / rect.height) * canvas.height
        };
        checkDragStart(mousePos);
      }
    });

    canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && (objectArrow.isDragging || lightSource.isDragging)) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const mousePos = {
          x: ((touch.clientX - rect.left) / rect.width) * canvas.width,
          y: ((touch.clientY - rect.top) / rect.height) * canvas.height
        };
        
        if (objectArrow.isDragging) {
          objectArrow.x = Math.max(10, Math.min(lensX - 15, mousePos.x));
          objectArrow.y = Math.max(20, Math.min(centerY - 5, mousePos.y));
        } else if (lightSource.isDragging) {
          if (activeComponent === 'tir') {
            lightSource.x = Math.max(10, Math.min(canvas.width - 10, mousePos.x));
          } else {
            lightSource.x = Math.max(10, Math.min(lensX - 15, mousePos.x));
          }
          lightSource.y = Math.max(10, Math.min(canvas.height - 10, mousePos.y));
        }
        e.preventDefault(); // prevent scroll
      }
    });

    canvas.addEventListener('touchend', () => {
      objectArrow.isDragging = false;
      lightSource.isDragging = false;
    });
  }

  // --- CORE ANIMATION LOOP ---
  function loop(now) {
    requestAnimationFrame(loop);

    // 1. Draw Viewport Background
    ctx.fillStyle = '#020308';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.03)';
    ctx.lineWidth = 1;
    const gridSpacing = 40;
    for (let x = 0; x < canvas.width; x += gridSpacing) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSpacing) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // 2. Draw base reference optics elements
    drawPrincipalAxis();
    drawOpticalComponent();

    // 3. Render active modes
    if (mode === 'rays') {
      if (sourceType === 'object') {
        drawLensConjugation();
      } else {
        // Laser or beam paraxial trace modes
        document.getElementById('hud-do').textContent = 'N/A';
        document.getElementById('hud-di').textContent = 'N/A';
        document.getElementById('hud-mag').textContent = 'N/A';
        
        document.getElementById('led-do').textContent = 'N/A';
        document.getElementById('led-di').textContent = 'N/A';
        document.getElementById('led-m').textContent = 'N/A';
        
        let badge = document.getElementById('lbl-image-type');
        badge.textContent = "PARALLEL BEAM ACTIVE";
        badge.className = "yellow-glow";

        // In paraxial laser beam through lenses, we can run simplified paraxial lens solvers:
        // We draw collimated parallel ray bundles refracting paraxially at lensX
        let rays = [];
        const radAngle = (sourceAngle * Math.PI) / 180;
        const dir = { x: Math.cos(radAngle), y: Math.sin(radAngle) };
        const nx = -Math.sin(radAngle);
        const ny = Math.cos(radAngle);

        let f = focalLength;
        if (activeComponent === 'concave') f = -focalLength;

        for (let i = 0; i < rayCount; i++) {
          let offset = (i / (rayCount - 1) - 0.5) * beamWidth;
          const startPoint = {
            x: lightSource.x + nx * offset,
            y: lightSource.y + ny * offset
          };

          // Incident ray goes to lensX plane
          const hitY = startPoint.y + (lensX - startPoint.x) * Math.tan(radAngle);
          
          if (Math.abs(hitY - centerY) <= apertureSize / 2) {
            // Refracts
            // Lens paraxial formula: parallel rays refract through Focus F_right = (lensX + f, centerY)
            // If diverging, virtual focus is on the left F_left = (lensX - |f|, centerY)
            let exitX = lensX + 300;
            let exitY = hitY;
            if (activeComponent === 'convex') {
              // converges towards F_right
              let rSlope = (centerY - hitY) / f;
              exitY = hitY + rSlope * 300;
            } else {
              // diverges away from F_left
              let rSlope = (hitY - centerY) / focalLength;
              exitY = hitY + rSlope * 300;
            }
            rays.push([startPoint, { x: lensX, y: hitY }, { x: exitX, y: exitY }]);
          } else {
            // Ray misses aperture, travels straight
            rays.push([startPoint, { x: startPoint.x + dir.x * 600, y: startPoint.y + dir.y * 600 }]);
          }
        }

        // Render beams
        rays.forEach(r => {
          ctx.strokeStyle = lightColor;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(r[0].x, r[0].y);
          for (let k = 1; k < r.length; k++) {
            ctx.lineTo(r[k].x, r[k].y);
          }
          ctx.stroke();
        });

        // Draw light source
        ctx.beginPath();
        ctx.arc(lightSource.x, lightSource.y, lightSource.radius, 0, 2*Math.PI);
        ctx.fillStyle = lightSource.isDragging ? '#ffd700' : '#00f2fe';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.fill();
        ctx.stroke();
      }
    } else {
      // Snell's Law sandbox modes (Prism & Slab)
      drawRefractionSandbox();
    }
  }

  // --- INITIALIZATION ---
  registerEventListeners();
  updateUI();
  applyPreset('preset-magnifier');

  // Trigger main animation render loop
  requestAnimationFrame(loop);
})();
