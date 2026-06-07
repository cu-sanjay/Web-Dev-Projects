const uploadInput = document.getElementById("uploadImage");
const uploadZone = document.getElementById("uploadZone");
const chooseFileBtn = document.getElementById("chooseFileBtn");
const canvas = document.getElementById("squareCanvas");
const ctx = canvas.getContext("2d");
let currentImg = null;

// File chooser
chooseFileBtn.addEventListener("click", () => uploadInput.click());

// Drag & drop
uploadZone.addEventListener("dragover", e => {
  e.preventDefault();
  uploadZone.style.background = "rgba(255,255,255,0.1)";
});
uploadZone.addEventListener("dragleave", () => {
  uploadZone.style.background = "transparent";
});
uploadZone.addEventListener("drop", e => {
  e.preventDefault();
  uploadInput.files = e.dataTransfer.files;
  handleImage({ target: uploadInput });
});

// Handle file upload
uploadInput.addEventListener("change", handleImage);

function handleImage(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(event) {
    const img = new Image();
    img.onload = () => {
      currentImg = img;
      drawSquare(img, "blur"); // default mode
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

function drawSquare(img, mode) {
  const size = Math.max(img.width, img.height);
  canvas.width = size;
  canvas.height = size;

  // Background fill
  if (mode === "solid") {
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, size, size);
  } else if (mode === "gradient") {
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, "#eb6835");
    grad.addColorStop(1, "#6c5ce7");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  } else if (mode === "blur") {
    ctx.filter = "blur(20px)";
    ctx.drawImage(img, 0, 0, size, size);
    ctx.filter = "none";
  } else if (mode === "expand") {
    ctx.drawImage(img, 0, 0, size, size);
  }

  // Center original image
  const x = (size - img.width) / 2;
  const y = (size - img.height) / 2;
  ctx.drawImage(img, x, y);
}

// Mode buttons
document.querySelectorAll(".options button").forEach(btn => {
  btn.addEventListener("click", () => {
    if (currentImg) drawSquare(currentImg, btn.dataset.mode);
  });
});

// Download button
document.getElementById("downloadBtn").addEventListener("click", () => {
  if (!currentImg) return;
  const link = document.createElement("a");
  link.download = "square-pic.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});
