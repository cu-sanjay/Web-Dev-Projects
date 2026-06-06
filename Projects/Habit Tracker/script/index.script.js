const form = document.getElementById("habitForm");
const habitName = document.getElementById("habitName");
const habitCategory = document.getElementById("habitCategory");
const habitList = document.getElementById("habitList");

const categoryPicker = document.getElementById("categoryPicker");
const categoryTrigger = document.getElementById("categoryTrigger");
const categoryMenu = document.getElementById("categoryMenu");
const categoryList = document.getElementById("categoryList");
const categoryLabel = document.getElementById("categoryLabel");
const categoryDot = document.getElementById("categoryDot");
const addCategoryToggle = document.getElementById("addCategoryToggle");
const addCategoryForm = document.getElementById("addCategoryForm");
const newCategoryName = document.getElementById("newCategoryName");
const saveCategoryBtn = document.getElementById("saveCategoryBtn");

const DEFAULT_CATEGORIES = ["Coding", "Study", "Fitness", "Reading", "Health"];

const CATEGORY_COLORS = {
  Coding: "#dc2626",
  Study: "#e11d48",
  Fitness: "#f97316",
  Reading: "#be123c",
  Health: "#fb7185",
};

let categories =
  JSON.parse(localStorage.getItem("categories")) || [...DEFAULT_CATEGORIES];
let selectedCategory = categories[0] || "other";

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const totalHabits = document.getElementById("totalHabits");
const completedToday = document.getElementById("completedToday");
const bestStreak = document.getElementById("bestStreak");
const progressPercent = document.getElementById("progressPercent");
const progressFill = document.getElementById("progressFill");
const themeBtn = document.getElementById("themeBtn");

let habits = JSON.parse(localStorage.getItem("habits")) || [];

function today() {
  return new Date().toISOString().split("T")[0];
}

function saveHabits() {
  localStorage.setItem("habits", JSON.stringify(habits));
}

function saveCategories() {
  localStorage.setItem("categories", JSON.stringify(categories));
}

function categoryColor(name) {
  if (CATEGORY_COLORS[name]) return CATEGORY_COLORS[name];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 48%)`;
}

function setSelectedCategory(name) {
  selectedCategory = name;
  habitCategory.value = name;
  categoryLabel.textContent = name;
  categoryDot.style.background = categoryColor(name);
  renderCategoryOptions();
}

function renderCategoryOptions() {
  categoryList.innerHTML = "";

  categories.forEach((name) => {
    const item = document.createElement("li");
    item.className = `category-option${name === selectedCategory ? " is-selected" : ""}`;
    item.setAttribute("role", "option");
    item.setAttribute("aria-selected", name === selectedCategory ? "true" : "false");

    const dot = document.createElement("span");
    dot.className = "category-dot";
    dot.style.background = categoryColor(name);

    const label = document.createElement("span");
    label.textContent = name;

    const check = document.createElement("span");
    check.className = "category-check";
    check.setAttribute("aria-hidden", "true");

    item.append(dot, label, check);
    item.addEventListener("click", () => {
      setSelectedCategory(name);
      closeCategoryMenu();
    });

    categoryList.appendChild(item);
  });
}

function openCategoryMenu() {
  categoryMenu.hidden = false;
  categoryTrigger.setAttribute("aria-expanded", "true");
  categoryPicker.classList.add("is-open");
}

function closeCategoryMenu() {
  categoryMenu.hidden = true;
  categoryTrigger.setAttribute("aria-expanded", "false");
  categoryPicker.classList.remove("is-open");
  addCategoryForm.hidden = true;
  addCategoryToggle.hidden = false;
  newCategoryName.value = "";
}

function toggleCategoryMenu() {
  if (categoryMenu.hidden) {
    openCategoryMenu();
  } else {
    closeCategoryMenu();
  }
}

function addCategory() {
  const name = newCategoryName.value.trim();

  if (!name) {
    newCategoryName.focus();
    return;
  }

  if (categories.some((c) => c.toLowerCase() === name.toLowerCase())) {
    setSelectedCategory(
      categories.find((c) => c.toLowerCase() === name.toLowerCase())
    );
    closeCategoryMenu();
    return;
  }

  categories.push(name);
  saveCategories();
  setSelectedCategory(name);
  closeCategoryMenu();
}

function syncCategoriesFromHabits() {
  let changed = false;

  habits.forEach((habit) => {
    if (habit.category && !categories.includes(habit.category)) {
      categories.push(habit.category);
      changed = true;
    }
  });

  if (changed) saveCategories();
}

function initCategoryPicker() {
  syncCategoriesFromHabits();
  setSelectedCategory(selectedCategory);
  renderCategoryOptions();

  categoryTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleCategoryMenu();
  });

  addCategoryToggle.addEventListener("click", () => {
    addCategoryToggle.hidden = true;
    addCategoryForm.hidden = false;
    newCategoryName.focus();
  });

  saveCategoryBtn.addEventListener("click", addCategory);

  newCategoryName.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCategory();
    }
    if (e.key === "Escape") {
      closeCategoryMenu();
    }
  });

  document.addEventListener("click", (e) => {
    if (!categoryPicker.contains(e.target)) {
      closeCategoryMenu();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCategoryMenu();
  });
}

function calculateStreak(completedDates) {
  let streak = 0;
  let date = new Date();

  while (true) {
    const dateString = date.toISOString().split("T")[0];

    if (completedDates.includes(dateString)) {
      streak++;
      date.setDate(date.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function renderHabits() {
  habitList.innerHTML = "";

  if (habits.length === 0) {
    habitList.innerHTML = `<div class="empty">No habits yet. Add your first habit and start your streak 🌱</div>`;
  }

  habits.forEach((habit) => {
    const isDoneToday = habit.completedDates.includes(today());
    const streak = calculateStreak(habit.completedDates);

    const card = document.createElement("article");
    card.className = `habit-card ${isDoneToday ? "done" : ""}`;

    card.innerHTML = `
      <div class="habit-top">
        <div>
          <h3>${escapeHtml(habit.name)}</h3>
          <span class="category" style="--cat-color: ${categoryColor(habit.category)}">${escapeHtml(habit.category)}</span>
        </div>
      </div>

      <p class="streak">🔥 Current Streak: ${streak} day${streak !== 1 ? "s" : ""}</p>

      <div class="actions">
        <button class="complete-btn" onclick="toggleComplete(${habit.id})">
          ${isDoneToday ? "Completed" : "Complete Today"}
        </button>
        <button class="delete-btn" onclick="deleteHabit(${habit.id})">Delete</button>
      </div>
    `;

    habitList.appendChild(card);
  });

  updateStats();
}

function updateStats() {
  const todayDate = today();
  const completed = habits.filter((habit) =>
    habit.completedDates.includes(todayDate)
  ).length;

  const streaks = habits.map((habit) => calculateStreak(habit.completedDates));
  const best = streaks.length ? Math.max(...streaks) : 0;
  const percent = habits.length ? Math.round((completed / habits.length) * 100) : 0;

  totalHabits.textContent = habits.length;
  completedToday.textContent = completed;
  bestStreak.textContent = best;
  progressPercent.textContent = `${percent}%`;
  progressFill.style.width = `${percent}%`;
}

function toggleComplete(id) {
  habits = habits.map((habit) => {
    if (habit.id === id) {
      const todayDate = today();

      if (habit.completedDates.includes(todayDate)) {
        habit.completedDates = habit.completedDates.filter(
          (date) => date !== todayDate
        );
      } else {
        habit.completedDates.push(todayDate);
      }
    }

    return habit;
  });

  saveHabits();
  renderHabits();
}

function deleteHabit(id) {
  habits = habits.filter((habit) => habit.id !== id);
  saveHabits();
  renderHabits();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const newHabit = {
    id: Date.now(),
    name: habitName.value.trim(),
    category: habitCategory.value,
    completedDates: []
  };

  habits.push(newHabit);
  saveHabits();

  habitName.value = "";
  renderHabits();
});

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeBtn.textContent = document.body.classList.contains("dark") ? "☀" : "☾";
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
});

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeBtn.textContent = "☀";
}

initCategoryPicker();
renderHabits();
