const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");

const rewards = [
  "100 Coins",
  "Try Again",
  "Diamond",
  "Mystery Box",
  "Lose",
  "Jackpot"
];

const colors = [
  "#ff4d4d",
  "#4dff88",
  "#4da6ff",
  "#ffd24d",
  "#b84dff",
  "#ff7a4d"
];

const total = rewards.length;
const arc = 360 / total;

let rotation = 0;
let spinning = false;

// 🎨 DRAW WHEEL
function drawWheel() {
  const center = 200;

  for (let i = 0; i < total; i++) {
    const start = (i * 2 * Math.PI) / total;

    ctx.beginPath();
    ctx.fillStyle = colors[i];
    ctx.moveTo(center, center);
    ctx.arc(center, center, center, start, start + (2 * Math.PI) / total);
    ctx.fill();

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(start + Math.PI / total);
    ctx.textAlign = "right";
    ctx.fillStyle = "#000";
    ctx.font = "bold 14px Arial";
    ctx.fillText(rewards[i], 180, 5);
    ctx.restore();
  }
}

// 🔥 FINAL CORRECT LOGIC (THIS FIXES YOUR BUG)
function getReward(finalRotation) {

  const normalized = ((finalRotation % 360) + 360) % 360;

  // ⭐ KEY FIX: pointer is at TOP → 270° reference in canvas system
  const pointerAngle = 270;

  const relativeAngle = (pointerAngle - normalized + 360) % 360;

  const index = Math.floor(relativeAngle / arc);

  return rewards[index];
}

// 🎡 SPIN FUNCTION
function spin() {
  if (spinning) return;
  spinning = true;

  document.getElementById("result").innerText = "";

  const extraSpins = 5 * 360;

  // smooth randomness
  const randomAngle = Math.floor(Math.random() * 360);

  rotation += extraSpins + randomAngle;

  canvas.style.transition = "transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)";
  canvas.style.transform = `rotate(${rotation}deg)`;

  setTimeout(() => {
    spinning = false;

    const reward = getReward(rotation);

    document.getElementById("result").innerText =
      "🎉 You won: " + reward;
  }, 4500);
}

drawWheel();