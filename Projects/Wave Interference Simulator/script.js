(function(){

var state = {
  sources: [
    { x: 260, y: 340, freq: 1.5, amp: 30, omega: 2*Math.PI*1.5, phase: 0 },
    { x: 520, y: 340, freq: 2.0, amp: 30, omega: 2*Math.PI*2.0, phase: 0 }
  ],
  time: 0,
  playing: true,
  resolution: 2,
  waveSpeed: 90,
  maxAmp: 60,
  dragging: null,
  dragOffset: { x: 0, y: 0 },
  mouseX: null,
  mouseY: null,
  cssWidth: 0,
  cssHeight: 0,
  lastTime: 0,
  fps: 0,
  frameCount: 0,
  fpsTimer: 0
};

var $ = function(s){ return document.querySelector(s); };
var $$ = function(s){ return document.querySelectorAll(s); };

var canvas = $('#simulation-canvas');
var ctx = canvas.getContext('2d');
var pointerCoords = $('#pointer-coords');
var pointerZ = $('#pointer-z');
var telemPhase = $('#telem-phase');
var telemTime = $('#telem-time');
var telemMode = $('#telem-mode');
var telemFps = $('#telem-fps');
var btnPause = $('#btn-pause');
var btnReset = $('#btn-reset');
var sliders = $$('.param-slider');
var displayEls = {};

function initDisplays(){
  $$('.param-unit').forEach(function(el){
    var key = el.getAttribute('data-display');
    if(key) displayEls[key]=el;
  });
}

function updateSourceParams(){
  state.sources.forEach(function(s,i){
    s.omega = 2 * Math.PI * s.freq;
  });
  state.maxAmp = state.sources.reduce(function(sum,s){ return sum + s.amp; }, 0) || 1;
}

function setupCanvas(){
  var rect = canvas.parentElement.getBoundingClientRect();
  var dpr = window.devicePixelRatio || 1;
  state.cssWidth = rect.width;
  state.cssHeight = rect.height;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  if(state.sources[0].x > rect.width-20) state.sources[0].x = rect.width/3;
  if(state.sources[1].x > rect.width-20) state.sources[1].x = 2*rect.width/3;
  if(state.sources[0].y > rect.height-20) state.sources[0].y = rect.height/2;
  if(state.sources[1].y > rect.height-20) state.sources[1].y = rect.height/2;
}

function getCanvasCoords(e){
  var rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function computeWaveAt(x, y){
  var z = 0;
  for(var i=0;i<state.sources.length;i++){
    var s = state.sources[i];
    if(s.amp === 0) continue;
    var dx = x - s.x;
    var dy = y - s.y;
    var r = Math.sqrt(dx*dx + dy*dy);
    var k = s.omega / state.waveSpeed;
    z += s.amp * Math.sin(k * r - s.omega * state.time + s.phase);
  }
  return z;
}

function waveToColor(z, maxZ){
  if(maxZ === 0) return [7, 10, 19];
  var t = Math.max(-1, Math.min(1, z / maxZ));
  var r, g, b;
  if(t >= 0){
    r = Math.round(7 + (59 - 7) * t);
    g = Math.round(10 + (130 - 10) * t);
    b = Math.round(19 + (246 - 19) * t);
  } else {
    var at = -t;
    r = Math.round(7 + (239 - 7) * at);
    g = Math.round(10 + (68 - 10) * at);
    b = Math.round(19 + (68 - 19) * at);
  }
  return [r, g, b];
}

function render(){
  var cssW = state.cssWidth;
  var cssH = state.cssHeight;
  var dpr = window.devicePixelRatio || 1;
  var physW = canvas.width;
  var physH = canvas.height;
  var res = state.resolution;

  if(cssW === 0 || cssH === 0) return;

  var cols = Math.ceil(cssW / res);
  var rows = Math.ceil(cssH / res);
  var maxZ = state.maxAmp;

  var imageData = ctx.createImageData(physW, physH);
  var buf = imageData.data;

  var srcs = state.sources;
  var n = srcs.length;

  for(var gy=0; gy<rows; gy++){
    for(var gx=0; gx<cols; gx++){
      var cx = gx * res + res * 0.5;
      var cy = gy * res + res * 0.5;

      var z = 0;
      for(var i=0; i<n; i++){
        var s = srcs[i];
        if(s.amp === 0) continue;
        var dx = cx - s.x;
        var dy = cy - s.y;
        var r = Math.sqrt(dx*dx + dy*dy);
        var k = s.omega / state.waveSpeed;
        z += s.amp * Math.sin(k * r - s.omega * state.time + s.phase);
      }

      var col = waveToColor(z, maxZ);

      var px0 = Math.round(gx * res * dpr);
      var py0 = Math.round(gy * res * dpr);
      var px1 = Math.min(physW, Math.round((gx + 1) * res * dpr));
      var py1 = Math.min(physH, Math.round((gy + 1) * res * dpr));

      for(var py=py0; py<py1; py++){
        var rowOff = py * physW;
        for(var px=px0; px<px1; px++){
          var idx = (rowOff + px) << 2;
          buf[idx] = col[0];
          buf[idx+1] = col[1];
          buf[idx+2] = col[2];
          buf[idx+3] = 255;
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  ctx.save();
  ctx.scale(dpr, dpr);

  var dragI = state.dragging;

  for(var i=0; i<srcs.length; i++){
    var s = srcs[i];
    if(s.amp === 0) continue;
    var isDrag = (dragI === i);
    var col = i === 0 ? '59,130,246' : '239,68,68';
    var glowR = isDrag ? 22 : 14;
    var dotR = isDrag ? 7 : 5;
    var glowA = isDrag ? '44' : '22';

    ctx.beginPath();
    ctx.arc(s.x, s.y, glowR, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(16,185,129,' + glowA + ')';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(s.x, s.y, dotR, 0, Math.PI*2);
    ctx.fillStyle = '#10b981';
    ctx.fill();
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = isDrag ? 2 : 1.5;
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = '8px ui-monospace,Consolas,monospace';
    ctx.textAlign = 'center';
    ctx.fillText(i === 0 ? 'A' : 'B', s.x, s.y + dotR + 10);
  }

  if(state.mouseX !== null){
    var mx = state.mouseX;
    var my = state.mouseY;
    var mz = computeWaveAt(mx, my);

    ctx.save();
    ctx.beginPath();
    ctx.arc(mx, my, 3, 0, Math.PI*2);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(mx - 12, my);
    ctx.lineTo(mx + 12, my);
    ctx.moveTo(mx, my - 12);
    ctx.lineTo(mx, my + 12);
    ctx.strokeStyle = 'rgba(248,250,252,0.3)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.restore();

    pointerCoords.textContent = 'X: ' + Math.round(mx) + ' Y: ' + Math.round(my);
    pointerZ.textContent = mz.toFixed(2);
  }

  ctx.restore();
}

function detectWaveMode(){
  var cx = state.cssWidth / 2;
  var cy = state.cssHeight / 2;
  var samples = 8;
  var total = 0;
  for(var i=0; i<samples; i++){
    var angle = (i / samples) * Math.PI * 2;
    var px = cx + Math.cos(angle) * 120;
    var py = cy + Math.sin(angle) * 120;
    total += Math.abs(computeWaveAt(px, py));
  }
  var avg = total / samples;
  var ratio = state.maxAmp > 0 ? avg / state.maxAmp : 0;

  if(ratio > 0.6) return 'CONSTRUCTIVE REINFORCEMENT';
  if(ratio < 0.25) return 'DESTRUCTIVE CANCELLATION';
  return 'COMPLEX SUPERPOSITION';
}

function updateTelemetry(){
  var p0 = (state.sources[0].omega * state.time) % (2 * Math.PI);
  var p1 = (state.sources[1].omega * state.time) % (2 * Math.PI);
  var delta = Math.abs(p0 - p1);
  telemPhase.textContent = delta.toFixed(2) + ' rad';
  telemTime.textContent = state.time.toFixed(1) + ' s';

  var mode = detectWaveMode();
  telemMode.textContent = mode;
  if(mode.indexOf('CONSTRUCTIVE') !== -1) telemMode.setAttribute('data-mode','CONSTRUCTIVE');
  else if(mode.indexOf('DESTRUCTIVE') !== -1) telemMode.setAttribute('data-mode','DESTRUCTIVE');
  else telemMode.setAttribute('data-mode','COMPLEX');
}

function tick(timestamp){
  if(state.lastTime === 0) state.lastTime = timestamp;
  var dt = (timestamp - state.lastTime) / 1000;
  state.lastTime = timestamp;

  if(dt > 0.1) dt = 0.016;

  state.frameCount++;
  state.fpsTimer += dt;
  if(state.fpsTimer >= 1){
    state.fps = state.frameCount;
    state.frameCount = 0;
    state.fpsTimer -= 1;
    telemFps.textContent = state.fps + ' fps';
  }

  if(state.playing){
    state.time += dt;
    updateTelemetry();
  }

  render();
  requestAnimationFrame(tick);
}

function handleMouseDown(e){
  var pos = getCanvasCoords(e);
  for(var i=0; i<state.sources.length; i++){
    var s = state.sources[i];
    if(s.amp === 0) continue;
    var dx = pos.x - s.x;
    var dy = pos.y - s.y;
    if(dx*dx + dy*dy < 400){
      state.dragging = i;
      state.dragOffset.x = dx;
      state.dragOffset.y = dy;
      canvas.style.cursor = 'grabbing';
      return;
    }
  }
  state.mouseX = pos.x;
  state.mouseY = pos.y;
}

function handleMouseMove(e){
  var pos = getCanvasCoords(e);
  state.mouseX = pos.x;
  state.mouseY = pos.y;

  if(state.dragging !== null){
    var s = state.sources[state.dragging];
    var newX = pos.x - state.dragOffset.x;
    var newY = pos.y - state.dragOffset.y;
    s.x = Math.max(10, Math.min(state.cssWidth - 10, newX));
    s.y = Math.max(10, Math.min(state.cssHeight - 10, newY));
  }
}

function handleMouseUp(){
  if(state.dragging !== null){
    state.dragging = null;
    canvas.style.cursor = 'crosshair';
  }
}

function handleMouseLeave(){
  state.mouseX = null;
  state.mouseY = null;
  if(state.dragging !== null){
    state.dragging = null;
    canvas.style.cursor = 'crosshair';
  }
}

function bindControls(){
  var srcAmp = [state.sources[0].amp, state.sources[1].amp];
  sliders.forEach(function(slider){
    slider.addEventListener('input', function(){
      var idx = parseInt(this.getAttribute('data-source'));
      var param = this.getAttribute('data-param');
      var val = parseFloat(this.value);

      if(param === 'freq'){
        state.sources[idx].freq = val;
        state.sources[idx].omega = 2 * Math.PI * val;
        var disp = displayEls['freq-' + idx];
        if(disp) disp.textContent = val.toFixed(1) + ' Hz';
      } else if(param === 'amp'){
        state.sources[idx].amp = val;
        state.maxAmp = state.sources.reduce(function(sum,s){ return sum + s.amp; }, 0) || 1;
        var disp = displayEls['amp-' + idx];
        if(disp) disp.textContent = val + ' px';
        var group = this.closest('.source-group');
        if(group){
          group.setAttribute('data-disabled', val === 0 ? 'true' : 'false');
        }
      }
    });
  });

  btnPause.addEventListener('click', function(){
    state.playing = !state.playing;
    this.textContent = state.playing ? 'PAUSE WAVE FLOW' : 'RESUME PROPAGATION';
  });

  btnReset.addEventListener('click', function(){
    state.time = 0;
    state.lastTime = 0;
    updateTelemetry();
  });
}

function handleResize(){
  setupCanvas();
}

function init(){
  initDisplays();
  updateSourceParams();
  setupCanvas();
  bindControls();

  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('mouseleave', handleMouseLeave);

  window.addEventListener('resize', handleResize);

  var bg = state.sources.map(function(s){ return s.amp === 0 ? 'true' : 'false'; });
  $$('.source-group').forEach(function(g, i){
    g.setAttribute('data-disabled', bg[i]);
  });

  requestAnimationFrame(tick);
}

init();

})();
