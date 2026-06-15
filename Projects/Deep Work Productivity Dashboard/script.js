let startTime = null;
let totalHours = parseFloat(localStorage.getItem("totalHours")) || 0;
let sessions = parseInt(localStorage.getItem("sessions")) || 0;
let distractions = parseInt(localStorage.getItem("distractions")) || 0;

const totalHoursEl = document.getElementById("totalHours");
const sessionsEl = document.getElementById("sessions");
const distractionsEl = document.getElementById("distractions");

function startSession() {
  if (startTime) {
    alert("Session already running!");
    return;
  }
  startTime = Date.now();
}

function endSession() {
  if (!startTime) {
    alert("No session running!");
    return;
  }
  const endTime = Date.now();
  const durationHours = (endTime - startTime) / (1000 * 60 * 60);
  totalHours += durationHours;
  sessions++;
  startTime = null;

  localStorage.setItem("totalHours", totalHours);
  localStorage.setItem("sessions", sessions);
  updateMetrics();
  updateChart();
}

function logDistraction() {
  distractions++;
  localStorage.setItem("distractions", distractions);
  updateMetrics();
}

function updateMetrics() {
  totalHoursEl.textContent = `Deep Work Hours: ${totalHours.toFixed(2)}`;
  sessionsEl.textContent = `Sessions Completed: ${sessions}`;
  distractionsEl.textContent = `Distractions Logged: ${distractions}`;
}

function updateChart() {
  const ctx = document.getElementById("chart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Sessions", "Hours", "Distractions"],
      datasets: [{
        label: "Productivity Metrics",
        data: [sessions, totalHours.toFixed(2), distractions],
        backgroundColor: ["#667eea", "#6bcB77", "#ff6b6b"]
      }]
    }
  });
}

updateMetrics();
updateChart();
