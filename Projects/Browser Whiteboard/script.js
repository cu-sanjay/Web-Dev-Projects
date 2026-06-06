const canvas = document.getElementById('drawing-board');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('color-picker');
const brushSize = document.getElementById('brush-size');
const sizeLabel = document.getElementById('size-label');
const clearBtn = document.getElementById('clear-btn');
const downloadBtn = document.getElementById('download-btn');
const bgColor = document.getElementById('bg-color');

let isDrawing = false;

function resizeCanvas() {
  const container = canvas.parentElement;
  canvas.width = container.clientWidth;
  canvas.height = 600; 
  ctx.fillStyle = bgColor.value;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function startPosition(e) {
  isDrawing = true;
  draw(e);
}

function endPosition() {
  isDrawing = false;
  ctx.beginPath(); 
}

function draw(e) {
  if (!isDrawing) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  ctx.lineWidth = brushSize.value;
  ctx.lineCap = 'round';
  ctx.strokeStyle = colorPicker.value;

  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}

canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseleave', endPosition); 

brushSize.addEventListener('input', (e) => {
  sizeLabel.textContent = e.target.value;
});

clearBtn.addEventListener('click', () => {
  ctx.fillStyle = bgColor.value;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
});

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'my-masterpiece.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

bgColor.addEventListener('change', () => {
  // Fill the board with the new background color
  ctx.fillStyle = bgColor.value;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Auto-switch brush color so it doesn't blend into the background
  if (bgColor.value === '#ffffff' && colorPicker.value === '#ffffff') {
    colorPicker.value = '#000000';
  } else if (bgColor.value === '#1a1a1a' && colorPicker.value === '#000000') {
    colorPicker.value = '#ffffff';
  }
});