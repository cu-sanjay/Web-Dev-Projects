/**
 * Solar Eclipse Simulator & Sandbox
 * Core Physics Engine & Dual Canvas Visualizer
 */

// Simulation and Physics Variables
let timeScrub = -80;           // Minutes relative to conjunction center (T-Minus)
let timeSpeed = 1.0;           // Scrubber speed in minutes per second
let isPaused = false;
let eclipsePreset = 'total';  // total | annular | partial | miss

// Lunar Orbital Configs (SI and Visual Scaled values)
let moonDistance = 363300;     // km (Perigee: ~356,000, Apogee: ~406,000)
let orbitalInclination = 5.14; // Degrees (inclination plane)
let nodeAlignmentOffset = 0.0; // Degrees deviation from perfect crossing node
let observerLatitude = 0;     // km offset from central path of totality (-150 to +150)

// Visual parameters
let showRays = true;
let highlightCones = true;
let showMoonOrbit = true;
let enableCoronalFlare = true;

// DOM Elements
let canvasOrbit, ctxOrbit;
let canvasSky, ctxSky;

let rangeMoonDist, numMoonDist;
let rangeInclination, numInclination;
let rangeNodeAlign, numNodeAlign;
let rangeViewerLat, numViewerLat;
let rangeTimeScrub, labelTimeScrub;

let chkShowRays, chkHighlightCones, chkShowMoonOrbit, chkCoronalFlare;
let btnPresetTotal, btnPresetAnnular, btnPresetPartial, btnPresetMiss;
let btnPausePlay, lblPauseIcon, lblPauseText, selectWarp, btnReset;
let consoleLogs;

// Telemetry DOSSIER DOM nodes
let telShadowType, telMoonDiam, telSunDiam, telObscuration, telTotalityDuration, telAmbientLux;
let hudEclipsePhase, hudSkyLight, hudObserverZone;

// Earth, Moon, Sun Visual radii for Orbit Canvas
const R_EARTH = 35;
const R_MOON_ORBIT = 12;
const R_SUN_ORBIT = 60;

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
 * Calculates intersection area of two overlapping circles (Sun and Moon disks)
 * to compute solar obscuration percentage.
 */
function getCircleIntersectionArea(r1, r2, d) {
  if (d >= r1 + r2) return 0; // No overlap
  if (d <= Math.abs(r1 - r2)) {
    // One circle is completely inside the other
    return Math.PI * Math.min(r1, r2) * Math.min(r1, r2);
  }
  
  // Area of overlap formula
  const r1Sq = r1 * r1;
  const r2Sq = r2 * r2;
  const dSq = d * d;
  
  const alpha = Math.acos((r1Sq + dSq - r2Sq) / (2 * r1 * d));
  const beta = Math.acos((r2Sq + dSq - r1Sq) / (2 * r2 * d));
  
  const area1 = r1Sq * alpha - r1Sq * Math.sin(2 * alpha) / 2;
  const area2 = r2Sq * beta - r2Sq * Math.sin(2 * beta) / 2;
  
  return area1 + area2;
}

/**
 * Calculations for Sky View diameters and offsets
 */
function getSkyViewGeometry() {
  const sunRadius = 75; // constant base pixels
  
  // Moon angular diameter varies inversely with distance
  // Base moon radius at average distance (384,400km) is 75px
  // Apogee (406,000km) -> ~71px
  // Perigee (356,000km) -> ~81px
  const refDistance = 384400;
  const moonRadius = sunRadius * (refDistance / moonDistance);
  
  // Calculate Moon X position from conjunction timeline scrubber
  // Center is at 0 minutes
  const mx = (timeScrub / 120) * 280; 
  
  // Calculate Moon Y vertical offset based on inclination, node align, and observer lat
  // Inclination and node align determine the geometric height of the shadow path.
  // 1 degree inclination = ~35 pixels vertical shift.
  const shadowYOffset = (nodeAlignmentOffset * 15) + (orbitalInclination * 24);
  
  // Latitudinal observer offset shifts the Moon vertically in the sky view
  // 1 km latitude shift = ~0.65 pixel vertical offset in Sky view
  const observerYOffset = observerLatitude * 0.65;
  
  const my = shadowYOffset + observerYOffset;
  
  // Distance between Sun center (0,0) and Moon center (mx, my)
  const d = Math.hypot(mx, my);
  
  // Obscuration %
  const sunArea = Math.PI * sunRadius * sunRadius;
  const overlapArea = getCircleIntersectionArea(sunRadius, moonRadius, d);
  const obscuration = Math.min(1.0, overlapArea / sunArea);
  
  return {
    sunRadius,
    moonRadius,
    mx,
    my,
    d,
    obscuration
  };
}

/**
 * Calculates current Eclipse Phase and Observer Zone for HUD
 */
function updateAlertStates(geo) {
  const { d, sunRadius, moonRadius, obscuration } = geo;
  
  // 1. Eclipse Phase
  let phase = 'Out of Alignment';
  if (d < sunRadius + moonRadius) {
    if (d > Math.abs(sunRadius - moonRadius)) {
      phase = 'Partial Phase';
    } else {
      phase = moonRadius >= sunRadius ? 'Totality Phase' : 'Annularity Phase';
    }
  } else {
    phase = Math.abs(nodeAlignmentOffset) > 7.0 || Math.abs(orbitalInclination) > 6.0 ? 'New Moon (No Eclipse)' : 'Outside Conjunction';
  }
  
  hudEclipsePhase.textContent = phase;
  
  // 2. Observer Zone and Lux levels
  let zone = 'Outside Shadow';
  let luxPercent = 100;
  
  if (d < sunRadius + moonRadius) {
    if (d <= Math.abs(sunRadius - moonRadius)) {
      if (moonRadius >= sunRadius) {
        // Observer in Umbra
        // If observer is offset too far, they might be in penumbra even if eclipse is total globally
        const edgeDist = Math.abs(observerLatitude);
        const umbraRadiusKm = Math.max(0, (moonRadius - sunRadius) * 2.0); // scaled representation
        if (edgeDist < umbraRadiusKm) {
          zone = 'Path of Totality (Umbra)';
          luxPercent = 0.05; // 0.05% light (dark twilight)
        } else {
          zone = 'Penumbra (Partial Zone)';
          luxPercent = (1.0 - obscuration) * 100;
        }
      } else {
        // Observer in Antumbra (Annular)
        const edgeDist = Math.abs(observerLatitude);
        const antumbraRadiusKm = (sunRadius - moonRadius) * 2.5;
        if (edgeDist < antumbraRadiusKm) {
          zone = 'Path of Annularity (Antumbra)';
          luxPercent = (1.0 - obscuration) * 100;
        } else {
          zone = 'Penumbra (Partial Zone)';
          luxPercent = (1.0 - obscuration) * 100;
        }
      }
    } else {
      zone = 'Penumbra (Partial Zone)';
      luxPercent = (1.0 - obscuration) * 100;
    }
  }
  
  hudObserverZone.textContent = zone;
  hudSkyLight.textContent = `${luxPercent.toFixed(2)}%`;
  
  // Set telemetry fields
  telShadowType.textContent = zone;
  telObscuration.textContent = `${(obscuration * 100).toFixed(1)}%`;
  telAmbientLux.textContent = `${(luxPercent * 10).toFixed(1)} Lux`;
  
  // Moon and Sun angular sizes
  // Sun matches ~32 arcminutes
  // Moon ranges from 29.4 to 33.5 arcminutes
  const moonArcmin = 29.4 + ((406000 - moonDistance) / 50000) * 4.1;
  telMoonDiam.textContent = `${moonArcmin.toFixed(2)}'`;
  telSunDiam.textContent = `32.00'`;
  
  // Totality duration (scaled formula)
  if (moonRadius > sunRadius && Math.abs(nodeAlignmentOffset) < 5.0) {
    const baseDuration = (moonRadius - sunRadius) * 12; // up to 450s
    const alignPenalty = Math.max(0, 1 - (Math.abs(nodeAlignmentOffset) / 5.0));
    const duration = baseDuration * alignPenalty;
    telTotalityDuration.textContent = `${Math.round(duration)} seconds`;
  } else {
    telTotalityDuration.textContent = '0 seconds (No Totality)';
  }

  // Display floating totality warning badge
  const totalityBadge = document.getElementById('totality-badge');
  if (zone.includes('Totality') && phase === 'Totality Phase') {
    totalityBadge.classList.remove('hidden');
  } else {
    totalityBadge.classList.add('hidden');
  }
}

/**
 * Dynamic event logger
 */
let loggedC1 = false, loggedC2 = false, loggedC3 = false, loggedC4 = false;
function triggerEventLogs(geo) {
  const { d, sunRadius, moonRadius } = geo;
  
  // First contact
  if (d < sunRadius + moonRadius && !loggedC1) {
    logToConsole('First Contact (C1) confirmed: Partial eclipse has begun.', 'warning');
    loggedC1 = true;
  }
  
  // Totality start
  if (d <= Math.abs(sunRadius - moonRadius) && !loggedC2) {
    if (moonRadius >= sunRadius) {
      logToConsole('Second Contact (C2): Totality begins! Solar corona is visible.', 'success');
    } else {
      logToConsole('Second Contact (C2): Annularity begins! Ring of fire is visible.', 'success');
    }
    loggedC2 = true;
  }
  
  // Totality end
  if (d > Math.abs(sunRadius - moonRadius) && loggedC2 && !loggedC3) {
    logToConsole('Third Contact (C3): Totality/Annularity ends. Diamond ring flare visible.', 'warning');
    loggedC3 = true;
  }
  
  // Fourth contact
  if (d >= sunRadius + moonRadius && loggedC1 && !loggedC4) {
    logToConsole('Fourth Contact (C4): Eclipse ends. Sun photosphere restored.', 'info');
    loggedC4 = true;
  }
  
  // Reset logs when scrubber is rewound
  if (timeScrub < -100) {
    loggedC1 = false;
    loggedC2 = false;
    loggedC3 = false;
    loggedC4 = false;
  }
}

/**
 * Draws Orbital Mechanics Visualizer (PANE 1)
 */
function drawOrbitCanvas() {
  const w = canvasOrbit.width;
  const h = canvasOrbit.height;
  ctxOrbit.clearRect(0, 0, w, h);
  
  // Dark Space BG
  ctxOrbit.fillStyle = '#020205';
  ctxOrbit.fillRect(0, 0, w, h);
  
  // Visual positions (Scaled to fit nicely)
  // Sun is far left, off-screen. We represent it as parallel yellow light rays or a massive arc
  const sunX = -200;
  const sunY = h / 2;
  const sunR = 150;
  
  // Earth is center right
  const earthX = w - 120;
  const earthY = h / 2;
  const earthR = R_EARTH;
  
  // Moon orbital path
  const orbitRadius = 140;
  
  if (showMoonOrbit) {
    ctxOrbit.save();
    ctxOrbit.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctxOrbit.lineWidth = 1;
    ctxOrbit.beginPath();
    ctxOrbit.arc(earthX, earthY, orbitRadius, 0, 2 * Math.PI);
    ctxOrbit.stroke();
    
    // Node crossing axis indicator
    ctxOrbit.strokeStyle = 'rgba(255, 0, 127, 0.15)';
    ctxOrbit.setLineDash([4, 4]);
    ctxOrbit.beginPath();
    ctxOrbit.moveTo(earthX - 170, earthY);
    ctxOrbit.lineTo(earthX + 170, earthY);
    ctxOrbit.stroke();
    ctxOrbit.restore();
  }
  
  // Calculate Moon coordinates relative to Earth
  // At timeScrub = 0, Moon is directly between Sun and Earth (X = earthX - orbitRadius)
  // Scrubber ranges from -120 to +120 mins. We map this to orbital angle.
  const scrubAngle = (timeScrub / 120) * (Math.PI / 4); // +/- 45 degrees
  const moonAngle = Math.PI - scrubAngle; // centered on the left
  
  const moonX = earthX + orbitRadius * Math.cos(moonAngle);
  
  // Vertical Moon position incorporating inclination & node offset
  const tiltYOffset = (nodeAlignmentOffset * 4.5) + (orbitalInclination * 7);
  const moonY = earthY + orbitRadius * Math.sin(moonAngle) + tiltYOffset;
  const moonR = R_MOON_ORBIT;
  
  // Draw Sun Light rays and Shadow cones
  if (showRays) {
    ctxOrbit.save();
    // Trace outer boundary rays (Penumbra) and inner crossed boundary rays (Umbra)
    // Sun upper edge (sunX, sunY - sunR), Sun lower edge (sunX, sunY + sunR)
    // Moon upper edge (moonX, moonY - moonR), Moon lower edge (moonX, moonY + moonR)
    
    // Penumbra Cone lines: Sun upper to Moon lower, Sun lower to Moon upper
    const penumbra1_m = (moonY + moonR - (sunY - sunR)) / (moonX - sunX);
    const penumbra1_y_at_earth = (sunY - sunR) + penumbra1_m * (earthX - sunX);
    
    const penumbra2_m = (moonY - moonR - (sunY + sunR)) / (moonX - sunX);
    const penumbra2_y_at_earth = (sunY + sunR) + penumbra2_m * (earthX - sunX);
    
    // Umbra Cone lines: Sun upper to Moon upper, Sun lower to Moon lower
    const umbra1_m = (moonY - moonR - (sunY - sunR)) / (moonX - sunX);
    const umbra1_y_at_earth = (sunY - sunR) + umbra1_m * (earthX - sunX);
    
    const umbra2_m = (moonY + moonR - (sunY + sunR)) / (moonX - sunX);
    const umbra2_y_at_earth = (sunY + sunR) + umbra2_m * (earthX - sunX);
    
    if (highlightCones) {
      // Shading Penumbra (lighter grey)
      ctxOrbit.fillStyle = 'rgba(56, 189, 248, 0.08)';
      ctxOrbit.beginPath();
      ctxOrbit.moveTo(moonX, moonY - moonR);
      ctxOrbit.lineTo(moonX, moonY + moonR);
      ctxOrbit.lineTo(earthX, penumbra1_y_at_earth);
      ctxOrbit.lineTo(earthX, penumbra2_y_at_earth);
      ctxOrbit.closePath();
      ctxOrbit.fill();
      
      // Shading Umbra (darker blue/black)
      ctxOrbit.fillStyle = 'rgba(2, 6, 23, 0.7)';
      ctxOrbit.beginPath();
      ctxOrbit.moveTo(moonX, moonY - moonR);
      ctxOrbit.lineTo(moonX, moonY + moonR);
      ctxOrbit.lineTo(earthX, umbra2_y_at_earth);
      ctxOrbit.lineTo(earthX, umbra1_y_at_earth);
      ctxOrbit.closePath();
      ctxOrbit.fill();
    }
    
    // Draw Ray lines
    ctxOrbit.strokeStyle = 'rgba(255, 204, 0, 0.25)';
    ctxOrbit.lineWidth = 1;
    // Penumbra boundary lines
    ctxOrbit.beginPath();
    ctxOrbit.moveTo(sunX + 150, sunY - sunR);
    ctxOrbit.lineTo(earthX + 20, penumbra1_y_at_earth);
    ctxOrbit.moveTo(sunX + 150, sunY + sunR);
    ctxOrbit.lineTo(earthX + 20, penumbra2_y_at_earth);
    ctxOrbit.stroke();
    
    // Umbra boundary lines
    ctxOrbit.strokeStyle = 'rgba(255, 0, 127, 0.25)';
    ctxOrbit.beginPath();
    ctxOrbit.moveTo(sunX + 150, sunY - sunR);
    ctxOrbit.lineTo(earthX + 20, umbra1_y_at_earth);
    ctxOrbit.moveTo(sunX + 150, sunY + sunR);
    ctxOrbit.lineTo(earthX + 20, umbra2_y_at_earth);
    ctxOrbit.stroke();
    
    ctxOrbit.restore();
  }
  
  // Draw Sun representation on the left boundary
  const sunGrad = ctxOrbit.createRadialGradient(sunX, sunY, sunR * 0.5, sunX, sunY, sunR);
  sunGrad.addColorStop(0, '#ffffff');
  sunGrad.addColorStop(0.3, '#ffea70');
  sunGrad.addColorStop(0.8, '#ff9900');
  sunGrad.addColorStop(1, 'rgba(255, 153, 0, 0)');
  ctxOrbit.fillStyle = sunGrad;
  ctxOrbit.beginPath();
  ctxOrbit.arc(sunX, sunY, sunR, 0, 2 * Math.PI);
  ctxOrbit.fill();
  
  // Draw Earth
  const earthGrad = ctxOrbit.createRadialGradient(earthX - 10, earthY - 10, 5, earthX, earthY, earthR);
  earthGrad.addColorStop(0, '#38bdf8'); // ocean blue daylight edge
  earthGrad.addColorStop(0.7, '#1e3a8a');
  earthGrad.addColorStop(1, '#020617'); // dark side
  ctxOrbit.fillStyle = earthGrad;
  ctxOrbit.beginPath();
  ctxOrbit.arc(earthX, earthY, earthR, 0, 2 * Math.PI);
  ctxOrbit.fill();
  
  // Earth outline
  ctxOrbit.strokeStyle = 'rgba(56, 189, 248, 0.3)';
  ctxOrbit.lineWidth = 1;
  ctxOrbit.stroke();
  
  // Draw Moon body
  ctxOrbit.fillStyle = '#64748b';
  ctxOrbit.beginPath();
  ctxOrbit.arc(moonX, moonY, moonR, 0, 2 * Math.PI);
  ctxOrbit.fill();
  
  ctxOrbit.strokeStyle = '#94a3b8';
  ctxOrbit.lineWidth = 0.8;
  ctxOrbit.stroke();
  
  // Observer location indicator line/dot on Earth
  ctxOrbit.save();
  ctxOrbit.fillStyle = '#ff007f';
  ctxOrbit.shadowBlur = 6;
  ctxOrbit.shadowColor = '#ff007f';
  // Observer is located on the facing subsolar boundary. Offset represents latitude shift.
  const obsY = earthY + (observerLatitude * 0.15); // scaled visual representation
  ctxOrbit.beginPath();
  ctxOrbit.arc(earthX - earthR + 1.5, obsY, 3, 0, 2 * Math.PI);
  ctxOrbit.fill();
  ctxOrbit.restore();
}

// Particle system for animating Solar Corona flares during Totality
let coronaParticles = [];
function updateCoronaParticles(centerX, centerY, radius) {
  if (coronaParticles.length === 0) {
    for (let i = 0; i < 90; i++) {
      const angle = (i * 4 * Math.PI) / 180;
      coronaParticles.push({
        angle: angle,
        length: radius + 20 + Math.random() * 45,
        speed: 0.1 + Math.random() * 0.2,
        wisp: Math.random() * 4
      });
    }
  }
  
  coronaParticles.forEach(p => {
    // Oscillate flares lengths
    p.length += Math.sin(performance.now() * 0.003 * p.speed + p.angle) * 0.25;
  });
}

/**
 * Draws Sky Viewer Visualizer (PANE 2)
 */
function drawSkyCanvas(geo) {
  const w = canvasSky.width;
  const h = canvasSky.height;
  ctxSky.clearRect(0, 0, w, h);
  
  const { sunRadius, moonRadius, mx, my, d, obscuration } = geo;
  
  const centerX = w / 2;
  const centerY = h / 2;
  
  // 1. Dynamic sky background colors based on obscuration
  // Lux ranges from 1.0 (bright sky blue) to 0.0005 (totality night slate)
  const lux = 1.0 - obscuration;
  
  let skyColor = '#0f172a';
  if (lux > 0.01) {
    const t = lux;
    // Interpolate Cyan/Blue sky to deep indigo
    const r = Math.floor(10 * t + 2 * (1-t));
    const g = Math.floor(80 * t + 3 * (1-t));
    const b = Math.floor(180 * t + 10 * (1-t));
    skyColor = `rgb(${r}, ${g}, ${b})`;
  } else {
    // Totality twilight horizon/space look
    skyColor = '#020205';
  }
  ctxSky.fillStyle = skyColor;
  ctxSky.fillRect(0, 0, w, h);
  
  // If extremely dark, draw background stars in sky
  if (lux < 0.08) {
    const starOpacity = (0.08 - lux) / 0.08;
    ctxSky.fillStyle = `rgba(255, 255, 255, ${starOpacity * 0.4})`;
    for (let s = 0; s < 25; s++) {
      const sx = (s * 313 + 57) % w;
      const sy = (s * 197 + 29) % h;
      ctxSky.fillRect(sx, sy, 1.2, 1.2);
    }
  }
  
  // 2. Draw Solar Corona (only if totality obscuration is near 100%)
  if (obscuration > 0.99 && moonRadius >= sunRadius) {
    const totalityStrength = (obscuration - 0.99) / 0.01;
    ctxSky.save();
    
    // Draw wispy animated corona flares using path
    updateCoronaParticles(centerX, centerY, sunRadius);
    
    ctxSky.shadowBlur = 12;
    ctxSky.shadowColor = 'rgba(255, 255, 255, 0.8)';
    
    // Glow core under the moon
    const coronaGlow = ctxSky.createRadialGradient(centerX, centerY, sunRadius - 5, centerX, centerY, sunRadius + 50);
    coronaGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    coronaGlow.addColorStop(0.2, 'rgba(235, 245, 255, 0.7)');
    coronaGlow.addColorStop(0.6, 'rgba(180, 220, 255, 0.25)');
    coronaGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctxSky.fillStyle = coronaGlow;
    ctxSky.beginPath();
    ctxSky.arc(centerX, centerY, sunRadius + 60, 0, 2 * Math.PI);
    ctxSky.fill();
    
    // Dynamic particles lines
    if (enableCoronalFlare) {
      ctxSky.strokeStyle = `rgba(255, 255, 255, ${totalityStrength * 0.6})`;
      ctxSky.lineWidth = 1.5;
      coronaParticles.forEach(p => {
        const dx = Math.cos(p.angle);
        const dy = Math.sin(p.angle);
        
        ctxSky.beginPath();
        ctxSky.moveTo(centerX + dx * sunRadius, centerY + dy * sunRadius);
        ctxSky.lineTo(centerX + dx * p.length, centerY + dy * p.length);
        ctxSky.stroke();
      });
    }
    
    ctxSky.restore();
  }
  
  // 3. Draw Sun Sphere
  const sunGrad = ctxSky.createRadialGradient(centerX, centerY, sunRadius * 0.6, centerX, centerY, sunRadius);
  sunGrad.addColorStop(0, '#ffffff');
  sunGrad.addColorStop(0.2, '#fff4b8');
  sunGrad.addColorStop(0.8, '#ff9c00');
  sunGrad.addColorStop(1, '#ff3c00');
  ctxSky.fillStyle = sunGrad;
  ctxSky.beginPath();
  ctxSky.arc(centerX, centerY, sunRadius, 0, 2 * Math.PI);
  ctxSky.fill();
  
  // 4. Draw Transiting Moon Disk
  const mxPx = centerX + mx;
  const myPx = centerY + my;
  
  ctxSky.save();
  ctxSky.fillStyle = '#020204'; // dark moon silhouette
  ctxSky.beginPath();
  ctxSky.arc(mxPx, myPx, moonRadius, 0, 2 * Math.PI);
  ctxSky.fill();
  
  // Moon atmospheric edge highlight ring
  ctxSky.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctxSky.lineWidth = 1;
  ctxSky.beginPath();
  ctxSky.arc(mxPx, myPx, moonRadius, 0, 2 * Math.PI);
  ctxSky.stroke();
  ctxSky.restore();
  
  // 5. Draw Annular Ring of Fire (if annular and centered)
  if (d <= Math.abs(sunRadius - moonRadius) && moonRadius < sunRadius) {
    // Draw glowing golden inner edge ring
    ctxSky.save();
    ctxSky.strokeStyle = '#ffcc00';
    ctxSky.shadowBlur = 10;
    ctxSky.shadowColor = '#ff9900';
    ctxSky.lineWidth = sunRadius - moonRadius;
    ctxSky.beginPath();
    ctxSky.arc(centerX, centerY, (sunRadius + moonRadius) / 2, 0, 2 * Math.PI);
    ctxSky.stroke();
    ctxSky.restore();
  }
  
  // 6. Draw Baily's Beads & Diamond Ring Effect (just at boundaries C2/C3)
  // Happens when center-to-center distance d is extremely close to edge-touch boundary |Rm - Rs|
  const diffRadius = Math.abs(sunRadius - moonRadius);
  if (d > diffRadius && d < diffRadius + 8 && moonRadius >= sunRadius) {
    const transitionStrength = 1.0 - ((d - diffRadius) / 8); // 0.0 to 1.0
    
    // Find contact edge point on the Moon limb along center axis
    const axisDX = mx / d;
    const axisDY = my / d;
    
    // Point on Moon limb closest/farthest to Sun center
    // Contact point is at Moon Center pointing back to Sun center
    const contactX = mxPx - axisDX * moonRadius;
    const contactY = myPx - axisDY * moonRadius;
    
    ctxSky.save();
    
    // A. Baily's Beads: Draw multiple small glowing points
    ctxSky.fillStyle = '#fff9d6';
    ctxSky.shadowColor = '#ffcc00';
    ctxSky.shadowBlur = 8;
    for (let b = -3; b <= 3; b++) {
      const angleOffset = b * 0.08;
      const bx = mxPx - Math.cos(Math.atan2(my, mx) + angleOffset) * moonRadius;
      const by = myPx - Math.sin(Math.atan2(my, mx) + angleOffset) * moonRadius;
      ctxSky.beginPath();
      ctxSky.arc(bx, by, 1.5 + Math.random() * 2.5, 0, 2 * Math.PI);
      ctxSky.fill();
    }
    
    // B. Diamond Ring: Draw one giant single flash flare at the main contact point
    const flashGrad = ctxSky.createRadialGradient(contactX, contactY, 1, contactX, contactY, 40);
    flashGrad.addColorStop(0, '#ffffff');
    flashGrad.addColorStop(0.2, '#ffea88');
    flashGrad.addColorStop(0.6, 'rgba(255, 204, 0, 0.25)');
    flashGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctxSky.fillStyle = flashGrad;
    
    ctxSky.beginPath();
    ctxSky.arc(contactX, contactY, 40, 0, 2 * Math.PI);
    ctxSky.fill();
    
    // Draw starburst flare spikes
    ctxSky.strokeStyle = '#ffffff';
    ctxSky.lineWidth = 1.5;
    ctxSky.beginPath();
    ctxSky.moveTo(contactX - 35 * transitionStrength, contactY);
    ctxSky.lineTo(contactX + 35 * transitionStrength, contactY);
    ctxSky.moveTo(contactX, contactY - 35 * transitionStrength);
    ctxSky.lineTo(contactX, contactY + 35 * transitionStrength);
    ctxSky.stroke();
    
    ctxSky.restore();
  }
}

/**
 * Handle timeline scrubber slider changes
 */
function handleTimeScrubberInput() {
  timeScrub = parseInt(rangeTimeScrub.value);
  
  // Format timeline text
  let txt = `T-Minus ${Math.abs(timeScrub)} mins`;
  if (timeScrub === 0) txt = 'Conjunction Midpoint (T-0)';
  else if (timeScrub > 0) txt = `T-Plus ${timeScrub} mins`;
  labelTimeScrub.textContent = txt;
}

/**
 * Loads selected presets configurations
 */
function loadPreset(type) {
  eclipsePreset = type;
  
  // Clear active button indicators
  [btnPresetTotal, btnPresetAnnular, btnPresetPartial, btnPresetMiss].forEach(btn => btn.classList.remove('active'));
  
  timeScrub = -85; // start before conjunction
  rangeTimeScrub.value = timeScrub;
  handleTimeScrubberInput();
  
  if (type === 'total') {
    btnPresetTotal.classList.add('active');
    moonDistance = 356800; // closer moon (larger angular size)
    orbitalInclination = 0.0; // perfect coplanar
    nodeAlignmentOffset = 0.0; // perfect nodes
    observerLatitude = 0; // directly on path
    
    logToConsole('Preset Loaded: Total Solar Eclipse configuration.', 'success');
  } else if (type === 'annular') {
    btnPresetAnnular.classList.add('active');
    moonDistance = 405500; // apogee (smaller moon)
    orbitalInclination = 0.0;
    nodeAlignmentOffset = 0.0;
    observerLatitude = 0;
    
    logToConsole('Preset Loaded: Annular Solar Eclipse configuration.', 'success');
  } else if (type === 'partial') {
    btnPresetPartial.classList.add('active');
    moonDistance = 378000;
    orbitalInclination = 1.45; // slightly tilted orbit
    nodeAlignmentOffset = 0.0;
    observerLatitude = 45; // observer off central axis
    
    logToConsole('Preset Loaded: Partial Solar Eclipse configuration.', 'warning');
  } else if (type === 'miss') {
    btnPresetMiss.classList.add('active');
    moonDistance = 384000;
    orbitalInclination = 5.14; // real inclination (shadow passes below Earth)
    nodeAlignmentOffset = 4.2;
    observerLatitude = 0;
    
    logToConsole('Preset Loaded: Non-Aligning New Moon (No Eclipse).', 'info');
  }
  
  // Sync sliders GUI
  syncSlidersFromVars();
  saveStateToLocalStorage();
}

/**
 * Synchronize UI Sliders to match variables values
 */
function syncSlidersFromVars() {
  rangeMoonDist.value = moonDistance;
  numMoonDist.value = moonDistance;
  
  rangeInclination.value = orbitalInclination;
  numInclination.value = orbitalInclination;
  
  rangeNodeAlign.value = nodeAlignmentOffset;
  numNodeAlign.value = nodeAlignmentOffset;
  
  rangeViewerLat.value = observerLatitude;
  numViewerLat.value = observerLatitude;
}

/**
 * Custom timeline dragging logic inside the Orbit Viewport
 */
let isDraggingMoon = false;
function handleOrbitMouseDown(e) {
  if (e.button !== 0) return;
  const rect = canvasOrbit.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  // Center is Earth
  const earthX = canvasOrbit.width - 120;
  const earthY = canvasOrbit.height / 2;
  const orbitRadius = 140;
  
  // Compute Moon current position
  const scrubAngle = (timeScrub / 120) * (Math.PI / 4);
  const moonAngle = Math.PI - scrubAngle;
  const tiltYOffset = (nodeAlignmentOffset * 4.5) + (orbitalInclination * 7);
  
  const moonX = earthX + orbitRadius * Math.cos(moonAngle);
  const moonY = earthY + orbitRadius * Math.sin(moonAngle) + tiltYOffset;
  
  // Verify click is close to Moon representation
  if (Math.hypot(mouseX - moonX, mouseY - moonY) < 18) {
    isDraggingMoon = true;
    isPaused = true; // suspend animation while scrubbing
    btnPausePlay.classList.remove('active');
    lblPauseIcon.textContent = '▶️';
    lblPauseText.textContent = 'Resume';
  }
}

function handleOrbitMouseMove(e) {
  if (!isDraggingMoon) return;
  const rect = canvasOrbit.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  
  const earthX = canvasOrbit.width - 120;
  
  // Convert horizontal mouse coordinate back to timeline scrub minutes
  // At earthX - orbitRadius (conjunction center), time is 0.
  const orbitRadius = 140;
  const dx = mouseX - earthX;
  
  // Solve for angle: dx = orbitRadius * cos(angle)
  const angle = Math.acos(Math.max(-1, Math.min(1, dx / orbitRadius)));
  const scrubAngle = Math.PI - angle;
  
  // Map back to timeScrub: scrubAngle = (timeScrub / 120) * (PI / 4)
  timeScrub = Math.round((scrubAngle * 120) / (Math.PI / 4));
  timeScrub = Math.max(-120, Math.min(120, timeScrub));
  
  rangeTimeScrub.value = timeScrub;
  handleTimeScrubberInput();
}

function handleOrbitMouseUp() {
  isDraggingMoon = false;
}

/**
 * Sync numeric input boxes with slider values
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
  if (type === 'moonDist') moonDistance = val;
  else if (type === 'inclination') orbitalInclination = val;
  else if (type === 'nodeAlign') nodeAlignmentOffset = val;
  else if (type === 'viewerLat') observerLatitude = val;
  
  saveStateToLocalStorage();
}

/**
 * Local storage persistence
 */
function saveStateToLocalStorage() {
  const state = {
    moonDistance,
    orbitalInclination,
    nodeAlignmentOffset,
    observerLatitude,
    showRays,
    highlightCones,
    showMoonOrbit,
    enableCoronalFlare
  };
  localStorage.setItem('eclipse_config', JSON.stringify(state));
}

function loadStateFromLocalStorage() {
  try {
    const raw = localStorage.getItem('eclipse_config');
    if (raw) {
      const state = JSON.parse(raw);
      moonDistance = state.moonDistance ?? 363300;
      orbitalInclination = state.orbitalInclination ?? 5.14;
      nodeAlignmentOffset = state.nodeAlignmentOffset ?? 0.0;
      observerLatitude = state.observerLatitude ?? 0;
      
      showRays = state.showRays ?? true;
      highlightCones = state.highlightCones ?? true;
      showMoonOrbit = state.showMoonOrbit ?? true;
      enableCoronalFlare = state.enableCoronalFlare ?? true;
      
      chkShowRays.checked = showRays;
      chkHighlightCones.checked = highlightCones;
      chkShowMoonOrbit.checked = showMoonOrbit;
      chkCoronalFlare.checked = enableCoronalFlare;
      
      syncSlidersFromVars();
      logToConsole('Restored configurations from previous session.', 'info');
    }
  } catch (err) {
    // fallback
  }
}

/**
 * Reset everything
 */
function resetState() {
  timeScrub = -85;
  rangeTimeScrub.value = timeScrub;
  handleTimeScrubberInput();
  
  isPaused = false;
  btnPausePlay.classList.add('active');
  lblPauseIcon.textContent = '⏸️';
  lblPauseText.textContent = 'Pause';
  
  loadPreset('total');
  logToConsole('Simulator timeline reset back to starting point.', 'warning');
}

/**
 * Loop Tick
 */
let lastFrameTime = performance.now();
function tick(timestamp) {
  const dt = (timestamp - lastFrameTime) / 1000;
  lastFrameTime = timestamp;
  
  if (!isPaused && dt < 0.1) {
    // Advance conjunction timeline progress
    timeScrub += timeSpeed * dt;
    if (timeScrub > 120) {
      // Loop timeline back
      timeScrub = -120;
    }
    
    rangeTimeScrub.value = Math.round(timeScrub);
    handleTimeScrubberInput();
  }
  
  // Calculate overlap geometry and update viewports
  const geo = getSkyViewGeometry();
  updateAlertStates(geo);
  triggerEventLogs(geo);
  
  drawOrbitCanvas();
  drawSkyCanvas(geo);
  
  requestAnimationFrame(tick);
}

function resizeCanvases() {
  canvasOrbit.width = canvasOrbit.parentNode.clientWidth;
  canvasOrbit.height = canvasOrbit.parentNode.clientHeight;
  
  canvasSky.width = canvasSky.parentNode.clientWidth;
  canvasSky.height = canvasSky.parentNode.clientHeight;
}

// Bind HTML Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  canvasOrbit = document.getElementById('orbit-canvas');
  ctxOrbit = canvasOrbit.getContext('2d');
  
  canvasSky = document.getElementById('sky-canvas');
  ctxSky = canvasSky.getContext('2d');
  
  // Sliders binding
  rangeMoonDist = document.getElementById('input-moon-distance');
  numMoonDist = document.getElementById('num-moon-distance');
  
  rangeInclination = document.getElementById('input-inclination');
  numInclination = document.getElementById('num-inclination');
  
  rangeNodeAlign = document.getElementById('input-node-align');
  numNodeAlign = document.getElementById('num-node-align');
  
  rangeViewerLat = document.getElementById('input-viewer-lat');
  numViewerLat = document.getElementById('num-viewer-lat');
  
  rangeTimeScrub = document.getElementById('input-time-scrub');
  labelTimeScrub = document.getElementById('label-time-scrub');
  
  chkShowRays = document.getElementById('chk-show-rays');
  chkHighlightCones = document.getElementById('chk-highlight-cones');
  chkShowMoonOrbit = document.getElementById('chk-show-moon-orbit');
  chkCoronalFlare = document.getElementById('chk-enable-coronal-flare');
  
  btnPresetTotal = document.getElementById('btn-preset-total');
  btnPresetAnnular = document.getElementById('btn-preset-annular');
  btnPresetPartial = document.getElementById('btn-preset-partial');
  btnPresetMiss = document.getElementById('btn-preset-miss');
  
  btnPausePlay = document.getElementById('btn-pause-play');
  lblPauseIcon = document.getElementById('lbl-pause-icon');
  lblPauseText = document.getElementById('lbl-pause-text');
  selectWarp = document.getElementById('select-warp');
  btnReset = document.getElementById('btn-reset');
  consoleLogs = document.getElementById('console-logs');
  
  // Dossier outputs
  telShadowType = document.getElementById('tel-shadow-type');
  telMoonDiam = document.getElementById('tel-moon-diam');
  telSunDiam = document.getElementById('tel-sun-diam');
  telObscuration = document.getElementById('tel-obscuration');
  telTotalityDuration = document.getElementById('tel-totality-duration');
  telAmbientLux = document.getElementById('tel-ambient-lux');
  
  hudEclipsePhase = document.getElementById('hud-eclipse-phase');
  hudSkyLight = document.getElementById('hud-sky-light');
  hudObserverZone = document.getElementById('hud-observer-zone');
  
  // Sync sliders
  syncInputs(numMoonDist, rangeMoonDist, 'moonDist');
  syncInputs(numInclination, rangeInclination, 'inclination');
  syncInputs(numNodeAlign, rangeNodeAlign, 'nodeAlign');
  syncInputs(numViewerLat, rangeViewerLat, 'viewerLat');
  
  // Timeline scrubber
  rangeTimeScrub.addEventListener('input', handleTimeScrubberInput);
  
  // Toggles listeners
  chkShowRays.addEventListener('change', (e) => {
    showRays = e.target.checked;
    saveStateToLocalStorage();
  });
  chkHighlightCones.addEventListener('change', (e) => {
    highlightCones = e.target.checked;
    saveStateToLocalStorage();
  });
  chkShowMoonOrbit.addEventListener('change', (e) => {
    showMoonOrbit = e.target.checked;
    saveStateToLocalStorage();
  });
  chkCoronalFlare.addEventListener('change', (e) => {
    enableCoronalFlare = e.target.checked;
    saveStateToLocalStorage();
  });
  
  // Conjunction control

  btnPausePlay.addEventListener('click', () => {
    isPaused = !isPaused;
    if (isPaused) {
      btnPausePlay.classList.remove('active');
      lblPauseIcon.textContent = '▶️';
      lblPauseText.textContent = 'Resume';
      logToConsole('Scrubbing animation paused.', 'warning');
    } else {
      btnPausePlay.classList.add('active');
      lblPauseIcon.textContent = '⏸️';
      lblPauseText.textContent = 'Pause';
      logToConsole('Scrubbing animation playing.', 'info');
    }
  });
  
  selectWarp.addEventListener('change', () => {
    timeSpeed = parseFloat(selectWarp.value);
  });
  
  btnReset.addEventListener('click', resetState);
  
  // Presets clickers
  btnPresetTotal.addEventListener('click', () => loadPreset('total'));
  btnPresetAnnular.addEventListener('click', () => loadPreset('annular'));
  btnPresetPartial.addEventListener('click', () => loadPreset('partial'));
  btnPresetMiss.addEventListener('click', () => loadPreset('miss'));
  
  // Custom canvas dragging in Orbit view
  canvasOrbit.addEventListener('mousedown', handleOrbitMouseDown);
  canvasOrbit.addEventListener('mousemove', handleOrbitMouseMove);
  canvasOrbit.addEventListener('mouseup', handleOrbitMouseUp);
  canvasOrbit.addEventListener('mouseleave', handleOrbitMouseUp);
  
  // Resize handler
  resizeCanvases();
  window.addEventListener('resize', resizeCanvases);
  
  // Init state
  loadStateFromLocalStorage();
  
  // Set default preset LEO/total
  loadPreset('total');

  
  // Kickstart animation tick
  requestAnimationFrame(tick);
});
