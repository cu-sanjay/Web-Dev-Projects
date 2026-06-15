let blocks = JSON.parse(localStorage.getItem("blocks")) || [];

function addBlock() {
  const task = document.getElementById("taskInput").value.trim();
  const start = document.getElementById("startTime").value;
  const end = document.getElementById("endTime").value;
  const priority = document.getElementById("priority").value;

  if (!task || !start || !end) {
    alert("Please fill all fields!");
    return;
  }

  const block = { id: Date.now(), task, start, end, priority };
  blocks.push(block);
  localStorage.setItem("blocks", JSON.stringify(blocks));
  renderBlocks();

  document.getElementById("taskInput").value = "";
  document.getElementById("startTime").value = "";
  document.getElementById("endTime").value = "";
}

function renderBlocks() {
  const schedule = document.getElementById("schedule");
  schedule.innerHTML = "";
  blocks.forEach(block => {
    const div = document.createElement("div");
    div.className = `block ${block.priority.toLowerCase()}`;
    div.innerHTML = `<strong>${block.task}</strong><br>${block.start} - ${block.end}<br>Priority: ${block.priority}`;
    schedule.appendChild(div);
  });
}

renderBlocks();
