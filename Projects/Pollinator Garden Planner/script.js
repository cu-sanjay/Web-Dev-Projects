const garden = document.getElementById("garden");
const calendarList = document.getElementById("calendarList");

document.querySelectorAll(".plant").forEach(plant => {
  plant.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", JSON.stringify({
      name: plant.dataset.name,
      season: plant.dataset.season
    }));
  });
});

garden.addEventListener("dragover", e => {
  e.preventDefault();
});

garden.addEventListener("drop", e => {
  e.preventDefault();
  const data = JSON.parse(e.dataTransfer.getData("text/plain"));
  const newPlant = document.createElement("div");
  newPlant.className = "plant";
  newPlant.textContent = `${data.name}`;
  garden.appendChild(newPlant);

  const li = document.createElement("li");
  li.textContent = `${data.name} blooms in ${data.season}`;
  calendarList.appendChild(li);
});
