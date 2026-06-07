const openBtn = document.getElementById("openBtn");
const flap = document.querySelector(".flap");
const letter = document.getElementById("letter");
const music = document.getElementById("music");
const shareBtn = document.getElementById("shareBtn");

openBtn.addEventListener("click", () => {
  flap.style.transform = "rotateX(-120deg)";
  setTimeout(() => {
    letter.style.display = "block";
    music.play();
  }, 1000);
});

shareBtn.addEventListener("click", () => {
  const url = `${window.location.origin}${window.location.pathname}?name=Bestie&msg=You+are+amazing!`;
  navigator.clipboard.writeText(url);
  alert("Shareable link copied to clipboard!");
});

// Optional: parse URL params for custom message
const params = new URLSearchParams(window.location.search);
if (params.has("name")) {
  document.getElementById("friendName").textContent = `Dear ${params.get("name")},`;
}
if (params.has("msg")) {
  document.getElementById("message").textContent = params.get("msg");
}

const sticker = document.getElementById("sticker");

function changeSticker(fileName) {
  sticker.src = `assets/stickers/${fileName}`;
}

// Example usage:
changeSticker("heart.png");

