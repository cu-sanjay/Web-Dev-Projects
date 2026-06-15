let goals = JSON.parse(localStorage.getItem("goals")) || [];

function addGoal() {
  const goal = document.getElementById("goalInput").value.trim();
  const milestones = parseInt(document.getElementById("milestonesInput").value);

  if (!goal || !milestones || milestones <= 0) {
    alert("Please enter a valid goal and milestones count!");
    return;
  }

  const newGoal = { id: Date.now(), goal, milestones, completed: 0 };
  goals.push(newGoal);
  localStorage.setItem("goals", JSON.stringify(goals));
  renderGoals();
  updateChart();

  document.getElementById("goalInput").value = "";
  document.getElementById("milestonesInput").value = "";
}

function completeMilestone(id) {
  const goal = goals.find(g => g.id === id);
  if (goal && goal.completed < goal.milestones) {
    goal.completed++;
    localStorage.setItem("goals", JSON.stringify(goals));
    renderGoals();
    updateChart();
  }
}

function renderGoals() {
  const list = document.getElementById("goalsList");
  list.innerHTML = "";
  goals.forEach(goal => {
    const card = document.createElement("div");
    card.className = "goal-card";
    const progressPercent = (goal.completed / goal.milestones) * 100;
    card.innerHTML = `
      <strong>${goal.goal}</strong><br>
      Milestones: ${goal.completed}/${goal.milestones}
      <div class="progress"><div class="progress-bar" style="width:${progressPercent}%"></div></div>
      <button onclick="completeMilestone(${goal.id})">✅ Complete Milestone</button>
    `;
    list.appendChild(card);
  });
}

function updateChart() {
  const ctx = document.getElementById("progressChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: goals.map(g => g.goal),
      datasets: [{
        label: "Progress",
        data: goals.map(g => (g.completed / g.milestones) * 100),
        backgroundColor: "#667eea"
      }]
    }
  });
}

renderGoals();
updateChart();
