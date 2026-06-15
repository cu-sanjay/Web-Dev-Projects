(function() {
  const canvas = document.getElementById('opticsCanvas');
  const ctx = canvas.getContext('2d');
  
  // Dimensions & constants (cm scale: 1px = 1.2cm approx, but using arbitrary cm)
  const width = 900, height = 500;
  canvas.width = width;
  canvas.height = height;
  
  // Optical element position X (vertical line / lens center)
  const elementX = 600;
  
  // Object (torch) initial position
  let objectX = 200;
  let objectY = 250;
  let dragging = false;
  
  // Type state
  let opticsType = 'mirror';   // 'mirror' or 'lens'
  let mirrorType = 'concave';   // 'concave' or 'convex'
  let lensType = 'converging';  // 'converging' or 'diverging'
  
  // Focal length (cm) absolute value (positive magnitude)
  const focalLengthMagnitude = 120;   // |f| = 120px ~ 120cm representation
  
  // Derived focal signed (mirror: concave -> positive, convex -> negative)
  // Lens: converging positive, diverging negative
  function getSignedFocalLength() {
    if (opticsType === 'mirror') {
      if (mirrorType === 'concave') return focalLengthMagnitude;   // +120
      else return -focalLengthMagnitude;                           // -120
    } else { // lens
      if (lensType === 'converging') return focalLengthMagnitude;  // +120
      else return -focalLengthMagnitude;                           // -120
    }
  }
  
  // Object distance from optical element (positive if object is left of element)
  function getObjectDistance() {
    let u = elementX - objectX;
    return u;   // positive means object to the left (real object)
  }
  
  // Mirror/Lens equation: 1/f = 1/u + 1/v  => v = 1/(1/f - 1/u)
  function computeImageDistance(u, f) {
    if (u === 0) return Infinity;
    const invV = (1/f) - (1/u);
    if (Math.abs(invV) < 1e-6) return Infinity;
    return 1 / invV;
  }
  
  // Get image info
  function getImageParams() {
    const u = getObjectDistance();
    const f = getSignedFocalLength();
    if (u <= 0) return { v: null, m: null, nature: 'Invalid position (right of optic)' };
    const v = computeImageDistance(u, f);
    let m = null;
    let nature = '';
    if (isFinite(v)) {
      m = - (v / u);
      if (Math.abs(m) > 100) nature = 'Extremely large / virtual?';
      else if (v > 0) nature = m > 0 ? 'Virtual, upright' : 'Real, inverted';
      else nature = 'Virtual, upright';
      if (Math.sign(v) === -1) nature = 'Virtual, upright';
      if (opticsType === 'mirror' && mirrorType === 'convex') nature = 'Virtual, upright (behind mirror)';
      if (opticsType === 'lens' && lensType === 'diverging' && v < 0) nature = 'Virtual, upright';
    } else {
      return { v: null, m: null, nature: 'At infinity / no image' };
    }
    return { v, m, nature };
  }
  
  // Draw scene, rays and draggable torch
  function draw() {
    ctx.clearRect(0, 0, width, height);
    
    // 1. Grid
    ctx.beginPath();
    ctx.strokeStyle = '#dee4ec';
    ctx.lineWidth = 0.6;
    for (let y = 50; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    for (let x = 50; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // 2. Principal axis (horizontal line)
    ctx.beginPath();
    ctx.moveTo(0, height/2);
    ctx.lineTo(width, height/2);
    ctx.strokeStyle = '#abb7cc';
    ctx.setLineDash([8, 8]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // 3. Draw optical element (mirror / lens)
    ctx.save();
    ctx.shadowBlur = 0;
    const opticalCenterY = height/2;
    if (opticsType === 'mirror') {
      // Mirror representation: curved line or vertical thick line with curvature hint
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#2c3e66';
      if (mirrorType === 'concave') {
        // concave: curved inward (to the left)
        ctx.beginPath();
        for (let y = opticalCenterY - 100; y <= opticalCenterY + 100; y+=5) {
          let dx = -0.02 * Math.pow(y - opticalCenterY, 2) / 5;
          if (y === opticalCenterY - 100) ctx.moveTo(elementX + dx, y);
          else ctx.lineTo(elementX + dx, y);
        }
        ctx.stroke();
      } else {
        // convex: curved outward
        ctx.beginPath();
        for (let y = opticalCenterY - 100; y <= opticalCenterY + 100; y+=5) {
          let dx = 0.02 * Math.pow(y - opticalCenterY, 2) / 5;
          if (y === opticalCenterY - 100) ctx.moveTo(elementX + dx, y);
          else ctx.lineTo(elementX + dx, y);
        }
        ctx.stroke();
      }
      // straight hatch
      ctx.beginPath();
      ctx.moveTo(elementX, opticalCenterY - 110);
      ctx.lineTo(elementX, opticalCenterY + 110);
      ctx.strokeStyle = '#49658c';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#2d496c';
      ctx.font = "bold 12px 'Inter'";
      ctx.fillText(mirrorType === 'concave' ? 'Concave Mirror' : 'Convex Mirror', elementX-55, opticalCenterY-15);
    } 
    else { // Lens
      ctx.beginPath();
      // draw double arc
      const lensRadius = 70;
      ctx.beginPath();
      ctx.ellipse(elementX, opticalCenterY, 24, 90, 0, 0, Math.PI*2);
      ctx.fillStyle = '#eef3fc';
      ctx.fill();
      ctx.strokeStyle = '#2c6280';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(elementX, opticalCenterY-100);
      ctx.lineTo(elementX, opticalCenterY+100);
      ctx.strokeStyle = '#a0b8d0';
      ctx.setLineDash([5, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#1f4e79';
      ctx.font = "bold 11px 'Inter'";
      ctx.fillText(lensType === 'converging' ? 'Converging Lens' : 'Diverging Lens', elementX-55, opticalCenterY-15);
    }
    
    // Draw focal points (F and 2F)
    const f = getSignedFocalLength();
    const focalX_left = elementX - Math.abs(f);
    const focalX_right = elementX + Math.abs(f);
    const twoF_left = elementX - 2*Math.abs(f);
    const twoF_right = elementX + 2*Math.abs(f);
    ctx.fillStyle = '#c2410c';
    ctx.font = "11px 'Inter'";
    ctx.beginPath();
    if(focalX_left > 0) ctx.fillText('F', focalX_left-8, opticalCenterY-6);
    if(focalX_right < width) ctx.fillText("F'", focalX_right+2, opticalCenterY-6);
    if(twoF_left > 0) ctx.fillText('2F', twoF_left-8, opticalCenterY-6);
    if(twoF_right < width) ctx.fillText("2F'", twoF_right+2, opticalCenterY-6);
    
    // Draw object (torch icon + draggable)
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(objectX, objectY, 14, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#b45309';
    ctx.font = "18px sans-serif";
    ctx.fillText("🔥", objectX-9, objectY+7);
    ctx.fillStyle = '#2c3e50';
    ctx.font = "bold 10px 'Inter'";
    ctx.fillText("Object", objectX-15, objectY-10);
    ctx.beginPath();
    ctx.moveTo(objectX, objectY);
    ctx.lineTo(elementX, objectY);
    ctx.strokeStyle = '#8ba0bc';
    ctx.setLineDash([6, 8]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw simple rays (physics representation)
    const u = getObjectDistance();
    const fSigned = getSignedFocalLength();
    const img = getImageParams();
    const vReal = img.v;
    
    // Ray from object to optical element and then toward image/focal
    ctx.beginPath();
    ctx.moveTo(objectX, objectY);
    ctx.lineTo(elementX, objectY);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    // Reflected/refracted ray direction
    if (isFinite(vReal) && vReal !== null && Math.abs(vReal) < 1000) {
      let targetX = elementX + vReal;
      if (opticsType === 'mirror') {
        // reflect: same side or virtual side
        if (vReal > 0) targetX = elementX + vReal;
        else targetX = elementX + vReal; // virtual behind mirror
      } else {
        targetX = elementX + vReal;
      }
      if (targetX > 0 && targetX < width) {
        ctx.beginPath();
        ctx.moveTo(elementX, objectY);
        ctx.lineTo(targetX, objectY);
        ctx.strokeStyle = '#f97316';
        ctx.stroke();
      }
    } else {
      // ray parallel to axis after element (indication)
      ctx.beginPath();
      ctx.moveTo(elementX, objectY);
      ctx.lineTo(elementX + (fSigned>0? 80 : -80), objectY);
      ctx.strokeStyle = '#facc15';
      ctx.stroke();
    }
    
    // draw image indicator if valid
    if (isFinite(vReal) && vReal !== null && Math.abs(vReal) < 800 && vReal !== 0 && u>0) {
      let imgX = elementX + vReal;
      let imgY = objectY;
      let magnification = img.m;
      let imgHeight = 24 * Math.min(Math.abs(magnification), 3);
      if(Math.abs(magnification) > 0.1){
        ctx.fillStyle = '#22c55e';
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.rect(imgX-8, imgY-12, 16, 24);
        ctx.fill();
        ctx.fillStyle = '#15803d';
        ctx.font = "10px 'Inter'";
        ctx.fillText("Image", imgX-12, imgY-18);
        ctx.globalAlpha = 1;
      }
    }
    
    // Draw element vertical marker
    ctx.beginPath();
    ctx.moveTo(elementX, 0);
    ctx.lineTo(elementX, height);
    ctx.strokeStyle = '#6f8faa';
    ctx.setLineDash([2, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  
  // Update live physics calculations panel
  function updateCalculations() {
    const u = getObjectDistance();
    if(u <= 0) {
      document.getElementById('objDistance').innerText = u.toFixed(1) + ' (invalid)';
      document.getElementById('imgDistance').innerText = '--';
      document.getElementById('magnification').innerText = '--';
      document.getElementById('imageNature').innerText = 'Object right of optic';
      document.getElementById('focalLen').innerText = getSignedFocalLength().toFixed(1);
      return;
    }
    const f = getSignedFocalLength();
    const v = computeImageDistance(u, f);
    let mag = null;
    let nature = '';
    if(isFinite(v) && Math.abs(v) < 5000) {
      mag = - (v / u);
      if(v > 0) nature = (mag > 0) ? 'Virtual, upright' : 'Real, inverted';
      else nature = 'Virtual, upright';
      if(opticsType === 'mirror' && mirrorType === 'convex') nature = 'Virtual, upright';
      if(opticsType === 'lens' && lensType === 'diverging' && v < 0) nature = 'Virtual, upright';
    } else {
      nature = 'No distinct image';
    }
    document.getElementById('objDistance').innerText = u.toFixed(1) + ' cm';
    document.getElementById('imgDistance').innerText = (isFinite(v) ? v.toFixed(1) : '∞') + ' cm';
    document.getElementById('magnification').innerText = (mag !== null ? mag.toFixed(2) : '--');
    document.getElementById('imageNature').innerText = nature;
    document.getElementById('focalLen').innerText = f.toFixed(1) + ' cm';
  }
  
  function redrawAll() {
    draw();
    updateCalculations();
  }
  
  // Event listeners: drag torch
  function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let mouseX = (e.clientX - rect.left) * scaleX;
    let mouseY = (e.clientY - rect.top) * scaleY;
    const dx = mouseX - objectX;
    const dy = mouseY - objectY;
    if (Math.hypot(dx, dy) < 24) {
      dragging = true;
      canvas.style.cursor = 'grabbing';
      e.preventDefault();
    }
  }
  
  function handleMouseMove(e) {
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let mouseX = (e.clientX - rect.left) * scaleX;
    let mouseY = (e.clientY - rect.top) * scaleY;
    objectX = Math.min(Math.max(mouseX, 40), elementX - 18);
    objectY = Math.min(Math.max(mouseY, 70), height - 70);
    redrawAll();
  }
  
  function handleMouseUp() {
    dragging = false;
    canvas.style.cursor = 'grab';
  }
  
  canvas.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
  canvas.style.cursor = 'grab';
  
  // UI toggles
  const mirrorRad = document.querySelector('input[value="mirror"]');
  const lensRad = document.querySelector('input[value="lens"]');
  const mirrorOptsDiv = document.getElementById('mirrorOptions');
  const lensOptsDiv = document.getElementById('lensOptions');
  const mirrorTypeSelect = document.getElementById('mirrorTypeSelect');
  const lensTypeSelect = document.getElementById('lensTypeSelect');
  
  function updateOpticsType() {
    if (mirrorRad.checked) {
      opticsType = 'mirror';
      mirrorOptsDiv.classList.remove('hidden');
      lensOptsDiv.classList.add('hidden');
      mirrorType = mirrorTypeSelect.value;
    } else {
      opticsType = 'lens';
      mirrorOptsDiv.classList.add('hidden');
      lensOptsDiv.classList.remove('hidden');
      lensType = lensTypeSelect.value;
    }
    redrawAll();
  }
  
  mirrorRad.addEventListener('change', updateOpticsType);
  lensRad.addEventListener('change', updateOpticsType);
  mirrorTypeSelect.addEventListener('change', (e) => { mirrorType = e.target.value; redrawAll(); });
  lensTypeSelect.addEventListener('change', (e) => { lensType = e.target.value; redrawAll(); });
  
  document.getElementById('resetObjectBtn').addEventListener('click', () => {
    objectX = 200;
    objectY = 250;
    redrawAll();
  });
  
  // initial draw
  updateOpticsType();
  redrawAll();
})();