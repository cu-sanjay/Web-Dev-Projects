const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let drawing = false;
let brushSize = document.getElementById("brushSize").value;
let color = document.getElementById("colorPicker").value;
let eraser = false;

canvas.addEventListener("mousedown", () => drawing = true);
canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mouseout", () => drawing = false);
canvas.addEventListener("mousemove", draw);

document.getElementById("brushSize").addEventListener("input", e => brushSize = e.target.value);
document.getElementById("colorPicker").addEventListener("input", e => {
  color = e.target.value;
  eraser = false;
});

function draw(e) {
  if (!drawing) return;
  ctx.fillStyle = eraser ? "#ffffff" : color;
  ctx.beginPath();
  ctx.arc(e.offsetX, e.offsetY, brushSize / 2, 0, Math.PI * 2);
  ctx.fill();
}

function setEraser() {
  eraser = true;
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function downloadCanvas() {
  const link = document.createElement("a");
  link.download = "drawing.png";
  link.href = canvas.toDataURL();
  link.click();
}
