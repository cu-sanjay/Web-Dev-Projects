let target = {};
let user = { r: 0, g: 0, b: 0 };

// generate random color
function randomColor() {
  return {
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256)
  };
}

// set target color
function setTarget() {
  target = randomColor();
  document.getElementById("targetColor").style.background =
    `rgb(${target.r},${target.g},${target.b})`;
}

// update user color
function updateUserColor() {
  user.r = +document.getElementById("r").value;
  user.g = +document.getElementById("g").value;
  user.b = +document.getElementById("b").value;

  document.getElementById("userColor").style.background =
    `rgb(${user.r},${user.g},${user.b})`;
}

// color difference
function getDistance(c1, c2) {
  return Math.sqrt(
    (c1.r - c2.r) ** 2 +
    (c1.g - c2.g) ** 2 +
    (c1.b - c2.b) ** 2
  );
}

// score
function checkColor() {
  let dist = getDistance(target, user);
  let score = Math.max(0, 100 - dist / 4);

  document.getElementById("score").innerText =
    "Score: " + Math.round(score);
}

// reset game
function resetGame() {
  setTarget();
  document.getElementById("score").innerText = "";
}

// slider listeners
document.getElementById("r").oninput = updateUserColor;
document.getElementById("g").oninput = updateUserColor;
document.getElementById("b").oninput = updateUserColor;

// start game
setTarget();
updateUserColor();