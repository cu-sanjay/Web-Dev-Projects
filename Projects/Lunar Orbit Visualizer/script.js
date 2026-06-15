/**
 * Lunar Orbit Visualizer
 * Physics Integrator & Librational Renderer
 */

// Universal Physical & Astronomical Constants (SI)
const G = 6.6743e-11;          // m³/kg/s²
const ME = 5.972e24;          // Earth Mass (kg)
const RE = 6371000;           // Earth Radius (meters)
const MU = G * ME;            // Gravitational parameter (m³/s²)
const MOON_A = 384400000;     // Semi-major axis of Moon's orbit (meters)
const LUNAR_MONTH = 27.32166; // Sidereal month (days)

// Simulator state variables
let progress = 0;              // Progress along the orbit path (0 to 100%)
let isPaused = false;
let timeSpeed = 4.0;           // Path progress % advanced per second
let orbitPreset = 'real';      // real | circular | eccentric | precession

// Lunar orbit configs
let eccentricity = 0.0549;     // Moon real eccentricity
let inclination = 5.14;        // Tilt relative to ecliptic (deg)
let precessionSpeed = 1.0;     // Precession multiplier
let sunAngleDeg = 180;         // Angle of incoming sunlight (180 is left-to-right)

// Visual parameters
let showApsides = true;
let showTidalGrid = true;
let highlightLibration = true;
let showRayLines = true;

// Precession angles tracking
let apsidesAngle = 0;          // Rotates slowly
let nodesAngle = Math.PI / 3;  // Longitude of ascending node

// View states
let zoomScaleOrbit = 0.45 / 1e6; // Pixels per meter
let earthRotationAngle = 0;

// Craters list for Orthographic sphere projection
const lunarCraters = [
  { name: 'Tycho', lon: -11 * Math.PI / 180, lat: -43 * Math.PI / 180, r: 4, type: 'crater' },
  { name: 'Copernicus', lon: -20 * Math.PI / 180, lat: 9 * Math.PI / 180, r: 6, type: 'crater' },
  { name: 'Kepler', lon: -38 * Math.PI / 180, lat: 8 * Math.PI / 180, r: 3.5, type: 'crater' },
  { name: 'Plato', lon: -9 * Math.PI / 180, lat: 51 * Math.PI / 180, r: 8, type: 'dark-flat' },
  { name: 'Mare Imbrium', lon: -15 * Math.PI / 180, lat: 35 * Math.PI / 180, r: 35, type: 'mare' },
  { name: 'Mare Serenitatis', lon: 18 * Math.PI / 180, lat: 27 * Math.PI / 180, r: 28, type: 'mare' },
  { name: 'Mare Tranquillitatis', lon: 31 * Math.PI / 180, lat: 8 * Math.PI / 180, r: 32, type: 'mare' },
  { name: 'Mare Crisium', lon: 59 * Math.PI / 180, lat: 18 * Math.PI / 180, r: 22, type: 'mare' },
  { name: 'Grimaldi', lon: -68 * Math.PI / 180, lat: -5 * Math.PI / 180, r: 7, type: 'dark-flat' },
  { name: 'Clavius', lon: -14 * Math.PI / 180, lat: -58 * Math.PI / 180, r: 9, type: 'crater' },
  { name: 'Langrenus', lon: 61 * Math.PI / 180, lat: -9 * Math.PI / 180, r: 6.5, type: 'crater' }
];

// Canvas Bindings
let canvasOrbit, ctxOrbit;
let canvasMoon, ctxMoon;

let rangeEcc, numEcc;
let rangeIncl, numIncl;
let rangePrec, numPrec;
let rangeSunAngle, numSunAngle;
let rangeTimeScrub, labelTimeScrub;

let chkShowApsides, chkShowTidalGrid, chkHighlightLibration, chkShowRayLines;
let btnPresetReal, btnPresetCircular, btnPresetEccentric, btnPresetPrecession;
let btnPausePlay, lblPauseIcon, lblPauseText, selectWarp, btnReset;
let consoleLogs;

// Telemetry DOSSIER DOM nodes
let telDistance, telSpeed, telObscuration, telLibLong, telLibLat, telPeriod;
let hudLunarPhase, hudLunarDistance, hudLunarSpeed;

// Logging Utility
function logToConsole(message, type = 'info') {
  if (!consoleLogs) return;
  const line = document.createElement('div');
  line.className = `log-line text-${type}`;
  line.innerHTML = `&gt; ${message}`;
  consoleLogs.appendChild(line);
  consoleLogs.scrollTop = consoleLogs.scrollHeight;
  while (consoleLogs.childNodes.length > 40) {
    consoleLogs.removeChild(consoleLogs.firstChild);
  }
}

/**
 * Solves Kepler's Equation: M = E - e*sin(E)
 * using Newton-Raphson iterations to find Eccentric Anomaly E
 */
function solveKepler(M, e) {
  let E = M;
  for (let i = 0; i < 5; i++) {
    E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  }
  return E;
}

/**
 * Computes Moon's position & velocity at path progress (0 to 100%)
 */
function getLunarKinematics() {
  // Map progress (0-100%) to Mean Anomaly M (0 to 2*PI)
  const M = (progress / 100) * 2 * Math.PI;
  
  // Solve for Eccentric Anomaly E
  const E = solveKepler(M, eccentricity);
  
  // Keplerian coordinates in local orbital plane (Earth at focus)
  const xLocal = MOON_A * (Math.cos(E) - eccentricity);
  const yLocal = MOON_A * Math.sqrt(1.0 - eccentricity * eccentricity) * Math.sin(E);
  
  // Rotate by current apsides precession angle (theta = apsidesAngle)
  const cosAps = Math.cos(apsidesAngle);
  const sinAps = Math.sin(apsidesAngle);
  const xRot = xLocal * cosAps - yLocal * sinAps;
  const yRot = xLocal * sinAps + yLocal * cosAps;
  
  const distance = Math.hypot(xRot, yRot);
  
  // Orbit Speed using Vis-Viva Equation: v = sqrt(MU * (2/r - 1/a))
  const speed = Math.sqrt(MU * (2.0 / distance - 1.0 / MOON_A));
  
  // Solve True Anomaly (nu)
  const trueAnomaly = Math.atan2(yLocal, xLocal);
  
  return {
    x: xRot,
    y: yRot,
    r: distance,
    speed: speed,
    meanAnomaly: M,
    trueAnomaly: trueAnomaly
  };
}

/**
 * Calculates Moon Phase description & obscuration
 */
function calculateMoonPhase(kin) {
  const moonAngle = Math.atan2(kin.y, kin.x); // angle of Moon from Earth
  const sunAngleRad = (sunAngleDeg * Math.PI) / 180;
  
  // Phase Angle is the difference between solar rays direction and Earth-Moon line direction
  let phaseAngle = (moonAngle - sunAngleRad) % (2 * Math.PI);
  if (phaseAngle < 0) phaseAngle += 2 * Math.PI;
  
  // Fraction illuminated: (1 + cos(phaseAngle)) / 2
  const illumination = (1 + Math.cos(phaseAngle)) / 2;
  
  let phaseName = 'New Moon';
  if (phaseAngle < 0.05 || phaseAngle > 2 * Math.PI - 0.05) {
    phaseName = 'New Moon';
  } else if (phaseAngle >= 0.05 && phaseAngle < Math.PI / 2 - 0.05) {
    phaseName = 'Waxing Crescent';
  } else if (phaseAngle >= Math.PI / 2 - 0.05 && phaseAngle < Math.PI / 2 + 0.05) {
    phaseName = 'First Quarter';
  } else if (phaseAngle >= Math.PI / 2 + 0.05 && phaseAngle < Math.PI - 0.05) {
    phaseName = 'Waxing Gibbous';
  } else if (phaseAngle >= Math.PI - 0.05 && phaseAngle < Math.PI + 0.05) {
    phaseName = 'Full Moon';
  } else if (phaseAngle >= Math.PI + 0.05 && phaseAngle < 3 * Math.PI / 2 - 0.05) {
    phaseName = 'Waning Gibbous';
  } else if (phaseAngle >= 3 * Math.PI / 2 - 0.05 && phaseAngle < 3 * Math.PI / 2 + 0.05) {
    phaseName = 'Third Quarter';
  } else {
    phaseName = 'Waning Crescent';
  }
  
  return {
    angle: phaseAngle,
    illumination: illumination,
    name: phaseName
  };
}

/**
 * Calculates libration wobbles (longitude & latitude)
 */
function calculateLibration(kin) {
  // 1. Libration in Longitude: Lead/Lag of True Anomaly vs axial rotation (axial rotation is uniform = Mean Anomaly)
  // We amplify it slightly for educational visibility on canvas (factor of 1.8)
  const libLong = (kin.meanAnomaly - kin.trueAnomaly) * (180 / Math.PI) * 1.8;
  
  // 2. Libration in Latitude: Peak tilt occurs at nodes crossing conjunctions
  // Inclination angle relative to observer's equator plane
  const libLat = inclination * Math.sin(kin.trueAnomaly - nodesAngle) * 1.5;
  
  return {
    long: libLong,
    lat: libLat
  };
}

/**
 * Updates HUD readouts
 */
function updateHUDValues(kin, phase, lib) {
  hudLunarPhase.textContent = phase.name;
  hudLunarDistance.textContent = `${(kin.r / 1000).toLocaleString(undefined, {maximumFractionDigits: 0})} km`;
  hudLunarSpeed.textContent = `${(kin.speed / 1000).toFixed(3)} km/s`;
  
  document.getElementById('phase-badge').textContent = phase.name.toUpperCase();
  
  // Dossier Panel update
  telDistance.textContent = `${(kin.r / 1000).toLocaleString(undefined, {maximumFractionDigits: 0})} km`;
  telSpeed.textContent = `${(kin.speed / 1000).toFixed(3)} km/s`;
  telObscuration.textContent = `${(phase.illumination * 100).toFixed(1)}%`;
  telLibLong.textContent = `${lib.long.toFixed(2)}°`;
  telLibLat.textContent = `${lib.lat.toFixed(2)}°`;
  
  // Period varies dynamically with mass calculations
  telPeriod.textContent = `${LUNAR_MONTH} Days`;
}

/**
 * Logging events
 */
let lastPhaseLogged = '';
let passedPerigee = false, passedApogee = false;
function triggerEventLogs(kin, phase) {
  // Phase transition logging
  if (phase.name !== lastPhaseLogged) {
    logToConsole(`Entering lunar phase: ${phase.name}.`, 'success');
    lastPhaseLogged = phase.name;
  }
  
  // Perigee/Apogee transitions
  // Perigee at progress 0/100, Apogee at progress 50
  if (progress >= 98 || progress <= 2) {
    if (!passedPerigee) {
      logToConsole('Station Alert: Moon crossing Perigee (Closest point, speed peaking).', 'warning');
      passedPerigee = true;
      passedApogee = false;
    }
  } else if (progress >= 48 && progress <= 52) {
    if (!passedApogee) {
      logToConsole('Station Alert: Moon crossing Apogee (Farthest point, speed minimum).', 'info');
      passedApogee = true;
      passedPerigee = false;
    }
  } else {
    passedPerigee = false;
    passedApogee = false;
  }
}

/**
 * Draws Orbital Trajectory view (PANE 1)
 */
function drawOrbitCanvas(kin) {
  const w = canvasOrbit.width;
  const h = canvasOrbit.height;
  ctxOrbit.clearRect(0, 0, w, h);
  
  ctxOrbit.fillStyle = '#020205';
  ctxOrbit.fillRect(0, 0, w, h);
  
  // Earth is at focus 1 (center)
  const earthX = w / 2;
  const earthY = h / 2;
  
  // A. Incoming Sunlight Rays Indicator
  if (showRayLines) {
    ctxOrbit.save();
    ctxOrbit.strokeStyle = 'rgba(255, 204, 0, 0.1)';
    ctxOrbit.lineWidth = 1;
    const sRad = (sunAngleDeg * Math.PI) / 180;
    
    // Draw 5 parallel ray vectors representing solar alignment
    for (let i = -2; i <= 2; i++) {
      const rayY = earthY + i * 40;
      ctxOrbit.beginPath();
      ctxOrbit.moveTo(0, rayY);
      ctxOrbit.lineTo(w, rayY);
      ctxOrbit.stroke();
    }
    
    // Solar ray indicator arrow in corner
    ctxOrbit.strokeStyle = '#ffcc00';
    ctxOrbit.lineWidth = 2;
    ctxOrbit.beginPath();
    ctxOrbit.moveTo(40, h - 40);
    ctxOrbit.lineTo(40 + Math.cos(sRad) * 30, h - 40 + Math.sin(sRad) * 30);
    ctxOrbit.stroke();
    
    ctxOrbit.fillStyle = '#ffcc00';
    ctxOrbit.font = '8px Share Tech Mono';
    ctxOrbit.fillText('Sun Ray Vector', 10, h - 50);
    ctxOrbit.restore();
  }
  
  // B. Draw Moon Elliptical Orbit Path Trace
  ctxOrbit.save();
  ctxOrbit.strokeStyle = 'rgba(56, 189, 248, 0.25)';
  ctxOrbit.lineWidth = 1.2;
  ctxOrbit.beginPath();
  
  // Trace orbit path in 360 increments
  for (let step = 0; step <= 360; step++) {
    const angleRad = (step * Math.PI) / 180;
    const E_step = solveKepler(angleRad, eccentricity);
    
    const xl = MOON_A * (Math.cos(E_step) - eccentricity);
    const yl = MOON_A * Math.sqrt(1.0 - eccentricity * eccentricity) * Math.sin(E_step);
    
    const cosAps = Math.cos(apsidesAngle);
    const sinAps = Math.sin(apsidesAngle);
    const xr = xl * cosAps - yl * sinAps;
    const yr = xl * sinAps + yl * cosAps;
    
    const px = earthX + xr * zoomScaleOrbit;
    const py = earthY + yr * zoomScaleOrbit;
    
    if (step === 0) ctxOrbit.moveTo(px, py);
    else ctxOrbit.lineTo(px, py);
  }
  ctxOrbit.stroke();
  ctxOrbit.restore();
  
  // C. Line of Apsides Indicator (Major Axis)
  if (showApsides) {
    ctxOrbit.save();
    ctxOrbit.strokeStyle = 'rgba(168, 85, 247, 0.4)';
    ctxOrbit.setLineDash([4, 4]);
    ctxOrbit.lineWidth = 1;
    
    // Line connects Perigee to Apogee passing through Earth Center
    const cosAps = Math.cos(apsidesAngle);
    const sinAps = Math.sin(apsidesAngle);
    
    // Perigee direction (towards apsides angle)
    const perigeeX = earthX + (MOON_A * (1.0 - eccentricity) * cosAps) * zoomScaleOrbit;
    const perigeeY = earthY + (MOON_A * (1.0 - eccentricity) * sinAps) * zoomScaleOrbit;
    
    // Apogee direction (opposite apsides angle)
    const apogeeX = earthX - (MOON_A * (1.0 + eccentricity) * cosAps) * zoomScaleOrbit;
    const apogeeY = earthY - (MOON_A * (1.0 + eccentricity) * sinAps) * zoomScaleOrbit;
    
    ctxOrbit.beginPath();
    ctxOrbit.moveTo(apogeeX, apogeeY);
    ctxOrbit.lineTo(perigeeX, perigeeY);
    ctxOrbit.stroke();
    
    ctxOrbit.fillStyle = '#a855f7';
    ctxOrbit.font = '9px Share Tech Mono';
    ctxOrbit.fillText('Perigee', perigeeX + 6, perigeeY - 4);
    ctxOrbit.fillText('Apogee', apogeeX - 45, apogeeY - 4);
    ctxOrbit.restore();
  }
  
  // D. Draw Earth
  ctxOrbit.save();
  const earthGrad = ctxOrbit.createRadialGradient(earthX - 6, earthY - 6, 4, earthX, earthY, RE * zoomScaleOrbit * 5); // scaled up for visibility
  earthGrad.addColorStop(0, '#38bdf8');
  earthGrad.addColorStop(0.6, '#1e3a8a');
  earthGrad.addColorStop(1, '#020617');
  ctxOrbit.fillStyle = earthGrad;
  
  ctxOrbit.beginPath();
  ctxOrbit.arc(earthX, earthY, RE * zoomScaleOrbit * 5, 0, 2 * Math.PI);
  ctxOrbit.fill();
  ctxOrbit.restore();
  
  // E. Draw Moon sphere along its trajectory
  const mx = earthX + kin.x * zoomScaleOrbit;
  const my = earthY + kin.y * zoomScaleOrbit;
  const moonR = 9; // scaled visual radius
  
  // Draw Moon shading matching Solar angle
  ctxOrbit.save();
  // Draw base moon sphere
  ctxOrbit.fillStyle = '#64748b';
  ctxOrbit.beginPath();
  ctxOrbit.arc(mx, my, moonR, 0, 2 * Math.PI);
  ctxOrbit.fill();
  
  // Draw shadowed side matching sun rays angle
  // Sun angle is incoming. Light falls from that angle. Shadow is on opposite side
  ctxOrbit.fillStyle = 'rgba(2, 6, 23, 0.6)';
  const sRad = (sunAngleDeg * Math.PI) / 180;
  
  ctxOrbit.beginPath();
  ctxOrbit.arc(mx, my, moonR, sRad + Math.PI / 2, sRad - Math.PI / 2, false);
  ctxOrbit.fill();
  
  ctxOrbit.restore();
}

/**
 * Projects 3D-like craters onto 2D Moon disk incorporating Libration offsets
 */
function drawMoonCrater(cx, cy, r, type, lib) {
  const moonR = 100; // visual Moon radius on Phase Canvas
  
  // Earth observer coordinates are adjusted by Libration in Longitude (long) and Latitude (lat)
  const libLongRad = (lib.long * Math.PI) / 180;
  const libLatRad = (lib.lat * Math.PI) / 180;
  
  // Crater base coordinates
  const lon = cx + libLongRad;
  const lat = cy + libLatRad;
  
  // Check if crater is on the visible hemisphere facing Earth (cos(lon)*cos(lat) > 0)
  const cosLon = Math.cos(lon);
  const cosLat = Math.cos(lat);
  
  if (cosLon > 0 && cosLat > 0) {
    // Orthographic spherical projection formulas:
    // x = R * cos(lat) * sin(lon)
    // y = R * sin(lat)
    const px = moonR * cosLat * Math.sin(lon);
    const py = -moonR * Math.sin(lat);
    
    // Scale crater size based on projection tilt (fore-shortening near limb edge)
    const stretchX = cosLon;
    const stretchY = cosLat;
    
    ctxMoon.save();
    ctxMoon.translate(canvasMoon.width / 2 + px, canvasMoon.height / 2 + py);
    
    if (type === 'mare') {
      ctxMoon.fillStyle = 'rgba(56, 85, 110, 0.4)';
      ctxMoon.beginPath();
      ctxMoon.ellipse(0, 0, r * stretchX, r * stretchY, 0, 0, 2 * Math.PI);
      ctxMoon.fill();
    } else if (type === 'dark-flat') {
      ctxMoon.fillStyle = 'rgba(30, 41, 59, 0.6)';
      ctxMoon.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctxMoon.lineWidth = 1;
      ctxMoon.beginPath();
      ctxMoon.ellipse(0, 0, r * stretchX, r * stretchY, 0, 0, 2 * Math.PI);
      ctxMoon.fill();
      ctxMoon.stroke();
    } else {
      // Crater ring
      ctxMoon.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctxMoon.lineWidth = 1.2;
      ctxMoon.fillStyle = 'rgba(255, 255, 255, 0.08)';
      
      ctxMoon.beginPath();
      ctxMoon.ellipse(0, 0, r * stretchX, r * stretchY, 0, 0, 2 * Math.PI);
      ctxMoon.fill();
      ctxMoon.stroke();
      
      // Central peak
      ctxMoon.fillStyle = '#fff';
      ctxMoon.beginPath();
      ctxMoon.arc(0, 0, 1, 0, 2 * Math.PI);
      ctxMoon.fill();
    }
    
    ctxMoon.restore();
  }
}

/**
 * Draws detailed Librational Observer Moon Face (PANE 2)
 */
function drawMoonCanvas(kin, phase, lib) {
  const w = canvasMoon.width;
  const h = canvasMoon.height;
  ctxMoon.clearRect(0, 0, w, h);
  
  // Background
  ctxMoon.fillStyle = '#010204';
  ctxMoon.fillRect(0, 0, w, h);
  
  const centerX = w / 2;
  const centerY = h / 2;
  
  // Dynamic Moon disk size: varies slightly due to distance changes (perigee vs apogee)
  // Perigee -> 108 pixels, Apogee -> 97 pixels
  const baseMoonRadius = 100;
  const currentMoonRadius = baseMoonRadius * (MOON_A / kin.r);
  
  // Earth Station Sky atmospheric bloom (faint corona glow if back-lit)
  ctxMoon.save();
  const atmosphericGlow = ctxMoon.createRadialGradient(centerX, centerY, currentMoonRadius * 0.95, centerX, centerY, currentMoonRadius * 1.3);
  atmosphericGlow.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
  atmosphericGlow.addColorStop(0.4, 'rgba(56, 189, 248, 0.03)');
  atmosphericGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctxMoon.fillStyle = atmosphericGlow;
  ctxMoon.beginPath();
  ctxMoon.arc(centerX, centerY, currentMoonRadius * 1.3, 0, 2 * Math.PI);
  ctxMoon.fill();
  ctxMoon.restore();
  
  // Clip rendering to Moon sphere surface
  ctxMoon.save();
  ctxMoon.beginPath();
  ctxMoon.arc(centerX, centerY, currentMoonRadius, 0, 2 * Math.PI);
  ctxMoon.clip();
  
  // 1. Draw solid Moon surface base
  ctxMoon.fillStyle = '#d8e2ef'; // bright lunar dust color
  ctxMoon.beginPath();
  ctxMoon.arc(centerX, centerY, currentMoonRadius, 0, 2 * Math.PI);
  ctxMoon.fill();
  
  // 2. Draw Lunar coordinate grid lines (tidal lock grid)
  if (showTidalGrid) {
    ctxMoon.save();
    ctxMoon.strokeStyle = 'rgba(30, 41, 59, 0.15)';
    ctxMoon.lineWidth = 0.8;
    
    // Draw longitudinal lines every 30 degrees adjusted by libration
    const libLongRad = (lib.long * Math.PI) / 180;
    const libLatRad = (lib.lat * Math.PI) / 180;
    
    for (let lg = -90; lg <= 90; lg += 30) {
      const lonRad = (lg * Math.PI / 180) + libLongRad;
      const cosLon = Math.cos(lonRad);
      
      if (cosLon > 0) {
        ctxMoon.beginPath();
        // Draw ellipse arc projection representing longitude lines
        ctxMoon.ellipse(centerX, centerY, currentMoonRadius * cosLon, currentMoonRadius, 0, 0, 2 * Math.PI);
        ctxMoon.stroke();
      }
    }
    
    // Draw latitudinal lines
    for (let lt = -60; lt <= 60; lt += 30) {
      const latRad = (lt * Math.PI / 180) + libLatRad;
      const sinLat = Math.sin(latRad);
      
      const cy = centerY - currentMoonRadius * sinLat;
      const rx = currentMoonRadius * Math.cos(latRad);
      
      ctxMoon.beginPath();
      ctxMoon.moveTo(centerX - rx, cy);
      ctxMoon.lineTo(centerX + rx, cy);
      ctxMoon.stroke();
    }
    
    ctxMoon.restore();
  }
  
  // 3. Draw Craters projected dynamically
  lunarCraters.forEach(c => {
    // Scale crater visual configurations matching current distance radius
    const scaleFactor = currentMoonRadius / baseMoonRadius;
    drawMoonCrater(c.lon, c.lat, c.r * scaleFactor, c.type, lib);
  });
  
  // 4. Draw Phase Shading Terminator (Overlays dark shadow onto Moon)
  // phase.angle lies between 0 and 2*PI. illumination ranges from 0 to 1
  ctxMoon.save();
  ctxMoon.fillStyle = 'rgba(2, 6, 23, 0.85)'; // shadow mask
  
  const pAngle = phase.angle;
  
  // Left shadow vs Right shadow terminator pathing
  if (pAngle > 0 && pAngle < Math.PI) {
    // Shadow sweeps from left to right (Waxing phases)
    ctxMoon.beginPath();
    // Draw dark semicircle on left
    ctxMoon.arc(centerX, centerY, currentMoonRadius + 2, Math.PI / 2, 3 * Math.PI / 2, false);
    
    // Draw transitional elliptical terminator arc
    const termWidth = currentMoonRadius * Math.cos(pAngle);
    ctxMoon.ellipse(centerX, centerY, Math.abs(termWidth) + 1, currentMoonRadius + 2, 0, 3 * Math.PI / 2, Math.PI / 2, termWidth < 0);
    ctxMoon.fill();
  } else if (pAngle >= Math.PI && pAngle < 2 * Math.PI) {
    // Shadow sweeps from right to left (Waning phases)
    ctxMoon.beginPath();
    // Draw dark semicircle on right
    ctxMoon.arc(centerX, centerY, currentMoonRadius + 2, 3 * Math.PI / 2, Math.PI / 2, false);
    
    // Draw transitional elliptical terminator arc
    const termWidth = currentMoonRadius * Math.cos(pAngle);
    ctxMoon.ellipse(centerX, centerY, Math.abs(termWidth) + 1, currentMoonRadius + 2, 0, Math.PI / 2, 3 * Math.PI / 2, termWidth >= 0);
    ctxMoon.fill();
  }
  ctxMoon.restore();
  
  // End of clip
  ctxMoon.restore();
  
  // Draw core border ring outline
  ctxMoon.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctxMoon.lineWidth = 1;
  ctxMoon.beginPath();
  ctxMoon.arc(centerX, centerY, currentMoonRadius, 0, 2 * Math.PI);
  ctxMoon.stroke();
  
  // 5. Libration vector overlay vectors
  if (highlightLibration) {
    ctxMoon.save();
    ctxMoon.strokeStyle = '#ff007f';
    ctxMoon.lineWidth = 2;
    
    // Libration displacement values
    const dx = lib.long * 3; // scale up pixels
    const dy = -lib.lat * 3;
    
    // Draw vector line from center
    ctxMoon.beginPath();
    ctxMoon.moveTo(centerX, centerY);
    ctxMoon.lineTo(centerX + dx, centerY + dy);
    ctxMoon.stroke();
    
    ctxMoon.fillStyle = '#ff007f';
    ctxMoon.beginPath();
    ctxMoon.arc(centerX + dx, centerY + dy, 4, 0, 2 * Math.PI);
    ctxMoon.fill();
    
    // Label
    ctxMoon.font = '8px Share Tech Mono';
    ctxMoon.fillText(`Libration Vector`, centerX + dx + 8, centerY + dy - 4);
    ctxMoon.restore();
  }
}

/**
 * Handle timeline scrubber input changes
 */
function handleTimeScrubberInput() {
  progress = parseFloat(rangeTimeScrub.value);
  
  // Format labels
  let txt = `Orbit: ${progress.toFixed(1)}%`;
  if (progress === 0 || progress === 100) txt += ' (Perigee)';
  else if (Math.abs(progress - 50) < 1.0) txt += ' (Apogee)';
  labelTimeScrub.textContent = txt;
}

/**
 * Preset loader setups
 */
function loadPreset(type) {
  orbitPreset = type;
  
  // Clear active button styles
  [btnPresetReal, btnPresetCircular, btnPresetEccentric, btnPresetPrecession].forEach(btn => btn.classList.remove('active'));
  
  progress = 0; // return to perigee
  rangeTimeScrub.value = progress;
  handleTimeScrubberInput();
  
  if (type === 'real') {
    btnPresetReal.classList.add('active');
    eccentricity = 0.0549;
    inclination = 5.14;
    precessionSpeed = 1.0;
    sunAngleDeg = 180;
    
    logToConsole('Preset Loaded: Real Moon orbit parameters.', 'success');
  } else if (type === 'circular') {
    btnPresetCircular.classList.add('active');
    eccentricity = 0.0;
    inclination = 0.0;
    precessionSpeed = 0.0;
    sunAngleDeg = 180;
    
    logToConsole('Preset Loaded: Ideal circular coplanar orbit setup.', 'success');
  } else if (type === 'eccentric') {
    btnPresetEccentric.classList.add('active');
    eccentricity = 0.28; // high eccentricity
    inclination = 7.5;
    precessionSpeed = 2.0;
    sunAngleDeg = 180;
    
    logToConsole('Preset Loaded: Highly elliptical orbit configuration (extreme libration swing).', 'warning');
  } else if (type === 'precession') {
    btnPresetPrecession.classList.add('active');
    eccentricity = 0.12;
    inclination = 5.14;
    precessionSpeed = 5.0; // fast precession loop
    sunAngleDeg = 180;
    
    logToConsole('Preset Loaded: Accelerated apsides precession model.', 'info');
  }
  
  syncSlidersFromVars();
  saveStateToLocalStorage();
}

/**
 * Synchronize sliders values from variables
 */
function syncSlidersFromVars() {
  rangeEcc.value = eccentricity;
  numEcc.value = eccentricity;
  
  rangeIncl.value = inclination;
  numIncl.value = inclination;
  
  rangePrec.value = precessionSpeed;
  numPrec.value = precessionSpeed;
  
  rangeSunAngle.value = sunAngleDeg;
  numSunAngle.value = sunAngleDeg;
}

/**
 * Sync number box with slider
 */
function syncInputs(numEl, rangeEl, type) {
  numEl.addEventListener('input', () => {
    let val = parseFloat(numEl.value);
    if (isNaN(val)) return;
    rangeEl.value = val;
    updateVariablesFromInputs(type, val);
  });
  rangeEl.addEventListener('input', () => {
    let val = parseFloat(rangeEl.value);
    numEl.value = val;
    updateVariablesFromInputs(type, val);
  });
}

function updateVariablesFromInputs(type, val) {
  if (type === 'ecc') eccentricity = val;
  else if (type === 'incl') inclination = val;
  else if (type === 'prec') precessionSpeed = val;
  else if (type === 'sunAngle') sunAngleDeg = val;
  
  saveStateToLocalStorage();
}

/**
 * Local storage configurations state
 */
function saveStateToLocalStorage() {
  const state = {
    eccentricity,
    inclination,
    precessionSpeed,
    sunAngleDeg,
    showApsides,
    showTidalGrid,
    highlightLibration,
    showRayLines
  };
  localStorage.setItem('lunar_config', JSON.stringify(state));
}

function loadStateFromLocalStorage() {
  try {
    const raw = localStorage.getItem('lunar_config');
    if (raw) {
      const state = JSON.parse(raw);
      eccentricity = state.eccentricity ?? 0.0549;
      inclination = state.inclination ?? 5.14;
      precessionSpeed = state.precessionSpeed ?? 1.0;
      sunAngleDeg = state.sunAngleDeg ?? 180;
      
      showApsides = state.showApsides ?? true;
      showTidalGrid = state.showTidalGrid ?? true;
      highlightLibration = state.highlightLibration ?? true;
      showRayLines = state.showRayLines ?? true;
      
      chkShowApsides.checked = showApsides;
      chkShowTidalGrid.checked = showTidalGrid;
      chkHighlightLibration.checked = highlightLibration;
      chkShowRayLines.checked = showRayLines;
      
      syncSlidersFromVars();
      logToConsole('Restored configurations from previous session.', 'info');
    }
  } catch (err) {
    // fallback
  }
}

/**
 * Reset state back to start
 */
function resetState() {
  progress = 0;
  rangeTimeScrub.value = progress;
  handleTimeScrubberInput();
  
  isPaused = false;
  btnPausePlay.classList.add('active');
  lblPauseIcon.textContent = '⏸️';
  lblPauseText.textContent = 'Pause';
  
  apsidesAngle = 0;
  nodesAngle = Math.PI / 3;
  
  loadPreset('real');
  logToConsole('Observatory clock and precessions reset.', 'warning');
}

/**
 * Tick loop cycle
 */
let lastFrameTime = performance.now();
function tick(timestamp) {
  const dt = (timestamp - lastFrameTime) / 1000;
  lastFrameTime = timestamp;
  
  if (!isPaused && dt < 0.1) {
    // Advance progress along trajectory path
    progress += timeSpeed * dt;
    if (progress > 100) {
      progress -= 100;
    }
    
    rangeTimeScrub.value = progress.toFixed(1);
    handleTimeScrubberInput();
    
    // Slow precession loop based on precession Speed
    apsidesAngle += (0.015 * precessionSpeed) * dt;
    nodesAngle += (0.008 * precessionSpeed) * dt;
  }
  
  // Calculate kinematics, phases, and libration
  const kin = getLunarKinematics();
  const phase = calculateMoonPhase(kin);
  const lib = calculateLibration(kin);
  
  // Update viewports
  drawOrbitCanvas(kin);
  drawMoonCanvas(kin, phase, lib);
  updateHUDValues(kin, phase, lib);
  triggerEventLogs(kin, phase);
  
  requestAnimationFrame(tick);
}

function resizeCanvases() {
  canvasOrbit.width = canvasOrbit.parentNode.clientWidth;
  canvasOrbit.height = canvasOrbit.parentNode.clientHeight;
  
  canvasMoon.width = canvasMoon.parentNode.clientWidth;
  canvasMoon.height = canvasMoon.parentNode.clientHeight;
}

// Bind HTML elements event listeners
document.addEventListener('DOMContentLoaded', () => {
  canvasOrbit = document.getElementById('orbit-canvas');
  ctxOrbit = canvasOrbit.getContext('2d');
  
  canvasMoon = document.getElementById('moon-canvas');
  ctxMoon = canvasMoon.getContext('2d');
  
  // Sliders binding
  rangeEcc = document.getElementById('input-eccentricity');
  numEcc = document.getElementById('num-eccentricity');
  rangeIncl = document.getElementById('input-inclination');
  numIncl = document.getElementById('num-inclination');
  rangePrec = document.getElementById('input-precession');
  numPrec = document.getElementById('num-precession');
  rangeSunAngle = document.getElementById('input-sun-angle');
  numSunAngle = document.getElementById('num-sun-angle');
  rangeTimeScrub = document.getElementById('input-time-scrub');
  labelTimeScrub = document.getElementById('label-time-scrub');
  
  chkShowApsides = document.getElementById('chk-show-apsides');
  chkShowTidalGrid = document.getElementById('chk-show-tidal-grid');
  chkHighlightLibration = document.getElementById('chk-highlight-libration');
  chkShowRayLines = document.getElementById('chk-show-ray-lines');
  
  btnPresetReal = document.getElementById('btn-preset-real');
  btnPresetCircular = document.getElementById('btn-preset-circular');
  btnPresetEccentric = document.getElementById('btn-preset-eccentric');
  btnPresetPrecession = document.getElementById('btn-preset-precession');
  
  btnPausePlay = document.getElementById('btn-pause-play');
  lblPauseIcon = document.getElementById('lbl-pause-icon');
  lblPauseText = document.getElementById('lbl-pause-text');
  selectWarp = document.getElementById('select-warp');
  btnReset = document.getElementById('btn-reset');
  consoleLogs = document.getElementById('console-logs');
  
  // Dossier binds
  telDistance = document.getElementById('tel-distance');
  telSpeed = document.getElementById('tel-speed');
  telObscuration = document.getElementById('tel-obscuration');
  telLibLong = document.getElementById('tel-lib-long');
  telLibLat = document.getElementById('tel-lib-lat');
  telPeriod = document.getElementById('tel-period');
  
  hudLunarPhase = document.getElementById('hud-lunar-phase');
  hudLunarDistance = document.getElementById('hud-lunar-distance');
  hudLunarSpeed = document.getElementById('hud-lunar-speed');
  
  // Sync inputs
  syncInputs(numEcc, rangeEcc, 'ecc');
  syncInputs(numIncl, rangeIncl, 'incl');
  syncInputs(numPrec, rangePrec, 'prec');
  syncInputs(numSunAngle, rangeSunAngle, 'sunAngle');
  
  rangeTimeScrub.addEventListener('input', handleTimeScrubberInput);
  
  // Toggles binders
  chkShowApsides.addEventListener('change', (e) => {
    showApsides = e.target.checked;
    saveStateToLocalStorage();
  });
  chkShowTidalGrid.addEventListener('change', (e) => {
    showTidalGrid = e.target.checked;
    saveStateToLocalStorage();
  });
  chkHighlightLibration.addEventListener('change', (e) => {
    highlightLibration = e.target.checked;
    saveStateToLocalStorage();
  });
  chkShowRayLines.addEventListener('change', (e) => {
    showRayLines = e.target.checked;
    saveStateToLocalStorage();
  });
  
  // Actions control
  btnPausePlay.addEventListener('click', () => {
    isPaused = !isPaused;
    if (isPaused) {
      btnPausePlay.classList.remove('active');
      lblPauseIcon.textContent = '▶️';
      lblPauseText.textContent = 'Resume';
      logToConsole('Scrubbing clock paused.', 'warning');
    } else {
      btnPausePlay.classList.add('active');
      lblPauseIcon.textContent = '⏸️';
      lblPauseText.textContent = 'Pause';
      logToConsole('Scrubbing clock playing.', 'info');
    }
  });
  
  selectWarp.addEventListener('change', () => {
    timeSpeed = parseFloat(selectWarp.value);
  });
  
  btnReset.addEventListener('click', resetState);
  
  // Presets listeners
  btnPresetReal.addEventListener('click', () => loadPreset('real'));
  btnPresetCircular.addEventListener('click', () => loadPreset('circular'));
  btnPresetEccentric.addEventListener('click', () => loadPreset('eccentric'));
  btnPresetPrecession.addEventListener('click', () => loadPreset('precession'));
  
  // Earth canvas reset
  document.getElementById('orbit-viewport').addEventListener('dblclick', () => {
    apsidesAngle = 0;
    logToConsole('Apsides precession alignment re-centered.', 'info');
  });
  
  // Resize handler
  resizeCanvases();
  window.addEventListener('resize', resizeCanvases);
  
  // Load configuration
  loadStateFromLocalStorage();
  
  // Set default preset
  loadPreset('real');
  
  // Kickstart loop tick
  requestAnimationFrame(tick);
});
