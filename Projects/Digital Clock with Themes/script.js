function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const dayName = days[now.getDay()];
  const day = String(now.getDate()).padStart(2, '0');
  const month = months[now.getMonth()];
  const year = now.getFullYear();

  document.getElementById("time").textContent = `${hours}:${minutes}:${seconds}`;
  document.getElementById("date").textContent = `${dayName}, ${day} ${month} ${year}`;
}

function setTheme(theme) {
  document.body.className = theme;
  localStorage.setItem("theme", theme);
}

function loadTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.body.className = savedTheme;
}

setInterval(updateClock, 1000);
updateClock();
loadTheme();
