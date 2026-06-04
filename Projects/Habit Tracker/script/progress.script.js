const habits = JSON.parse(localStorage.getItem("habits")) || [];
const themeBtn = document.getElementById("themeBtn");
const contribGrid = document.getElementById("contribGrid");
const tooltip = document.getElementById("contribTooltip");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function today() {
  return formatDate(new Date());
}

function completionCount(dateStr) {
  return habits.filter((h) => h.completedDates.includes(dateStr)).length;
}

function completionLevel(count, total) {
  if (total === 0 || count === 0) return 0;
  const ratio = count / total;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

function isActiveDay(dateStr) {
  return habits.length > 0 && completionCount(dateStr) > 0;
}

function calculateStreakFrom(endDate, predicate) {
  let streak = 0;
  const date = new Date(endDate);

  while (true) {
    const dateStr = formatDate(date);
    if (predicate(dateStr)) {
      streak++;
      date.setDate(date.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function calculateLongestStreak() {
  if (habits.length === 0) return 0;

  const allDates = new Set();
  habits.forEach((h) => h.completedDates.forEach((d) => allDates.add(d)));

  const sorted = [...allDates].sort();
  if (sorted.length === 0) return 0;

  let longest = 0;
  let current = 0;
  let prev = null;

  sorted.forEach((dateStr) => {
    if (!isActiveDay(dateStr)) return;

    if (!prev) {
      current = 1;
    } else {
      const prevDate = new Date(prev);
      const currDate = new Date(dateStr);
      const diff = (currDate - prevDate) / (1000 * 60 * 60 * 24);

      current = diff === 1 ? current + 1 : 1;
    }

    longest = Math.max(longest, current);
    prev = dateStr;
  });

  const todayStreak = calculateStreakFrom(new Date(), isActiveDay);
  return Math.max(longest, todayStreak);
}

function countActiveDays(months) {
  const seen = new Set();
  months.forEach((month) => {
    month.days.forEach((day) => {
      if (day.inRange && day.count > 0) seen.add(day.date);
    });
  });
  return seen.size;
}

function buildMonths() {
  const total = habits.length;
  const end = new Date();
  end.setHours(0, 0, 0, 0);

  const start = new Date(end);
  start.setDate(start.getDate() - 60);

  const months = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cursor <= endMonth) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = new Date(year, month, 1).getDay();
    const weekRows = Math.ceil((startOffset + daysInMonth) / 7);
    const days = [];

    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const cellDate = new Date(year, month, dayNum);
      cellDate.setHours(0, 0, 0, 0);
      const dateStr = formatDate(cellDate);
      const inRange = cellDate >= start && cellDate <= end;
      const count = inRange ? completionCount(dateStr) : 0;

      days.push({
        date: dateStr,
        count,
        total,
        level: inRange ? completionLevel(count, total) : 0,
        inRange,
        day: dayNum,
        dayOfWeek: cellDate.getDay(),
        weekIndex: Math.floor((startOffset + dayNum - 1) / 7)
      });
    }

    months.push({
      label: `${MONTHS[month]} ${year}`,
      daysInMonth,
      startOffset,
      weekRows,
      days
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
}

function formatTooltip(day) {
  const date = new Date(day.date + "T12:00:00");
  const label = date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  if (day.total === 0) {
    return `${label}: No habits tracked`;
  }

  if (day.count === 0) {
    return `${label}: No habits completed`;
  }

  const pct = Math.round((day.count / day.total) * 100);
  return `${label}: ${day.count} of ${day.total} habit${day.total !== 1 ? "s" : ""} (${pct}%)`;
}

function createPaddingCell() {
  const cell = document.createElement("span");
  cell.className = "contrib-cell empty-slot";
  cell.setAttribute("aria-hidden", "true");
  return cell;
}

function createCell(day) {
  const cell = document.createElement("span");
  cell.className = `contrib-cell level-${day.level}`;
  if (!day.inRange) cell.classList.add("out-of-range");

  cell.dataset.date = day.date;
  cell.dataset.day = String(day.day);
  cell.setAttribute("tabindex", day.inRange ? "0" : "-1");
  cell.setAttribute("role", "gridcell");
  cell.setAttribute(
    "aria-label",
    day.inRange ? formatTooltip(day) : "Outside range"
  );

  cell.addEventListener("mouseenter", (e) => showTooltip(e, day));
  cell.addEventListener("mousemove", (e) => moveTooltip(e));
  cell.addEventListener("mouseleave", hideTooltip);
  cell.addEventListener("focus", (e) => showTooltip(e, day));
  cell.addEventListener("blur", hideTooltip);

  return cell;
}

function buildMonthGrid(month) {
  const grid = Array.from({ length: 7 }, () => Array(month.weekRows).fill(null));

  month.days.forEach((day) => {
    grid[day.dayOfWeek][day.weekIndex] = day;
  });

  return grid;
}

function renderGrid(months) {
  contribGrid.innerHTML = "";

  months.forEach((month) => {
    const block = document.createElement("article");
    block.className = "contrib-month-block";

    const label = document.createElement("h3");
    label.className = "contrib-month-label";
    label.textContent = month.label;

    const calendar = document.createElement("div");
    calendar.className = "contrib-month-calendar";

    const weekdays = document.createElement("div");
    weekdays.className = "contrib-weekdays";
    weekdays.setAttribute("aria-hidden", "true");

    const daysGrid = document.createElement("div");
    daysGrid.className = "contrib-month-days";
    daysGrid.style.setProperty("--month-weeks", String(month.weekRows));

    const grid = buildMonthGrid(month);

    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < month.weekRows; col++) {
        const day = grid[row][col];
        daysGrid.appendChild(day ? createCell(day) : createPaddingCell());
      }
    }

    calendar.append(weekdays, daysGrid);
    block.append(label, calendar);
    contribGrid.appendChild(block);
  });
}

function showTooltip(event, day) {
  if (!day.inRange) return;
  tooltip.textContent = formatTooltip(day);
  tooltip.hidden = false;
  moveTooltip(event);
}

function moveTooltip(event) {
  tooltip.style.left = `${event.clientX + 14}px`;
  tooltip.style.top = `${event.clientY - 36}px`;
}

function hideTooltip() {
  tooltip.hidden = true;
}

function updateSummary(months) {
  const todayDate = today();
  const done = completionCount(todayDate);
  const total = habits.length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  const current = habits.length ? calculateStreakFrom(new Date(), isActiveDay) : 0;
  const longest = calculateLongestStreak();
  const activeDays = countActiveDays(months);

  document.getElementById("activeDays").textContent = activeDays;
  document.getElementById("currentStreak").textContent = current;
  document.getElementById("longestStreak").textContent = longest;
  document.getElementById("todayCount").textContent = done;
  document.getElementById("todayTotal").textContent = total;
  document.getElementById("todayPercent").textContent = `${percent}%`;
  document.getElementById("completedToday").textContent = done;
  document.getElementById("summaryCurrentStreak").textContent = current;
  document.getElementById("summaryBestStreak").textContent = longest;
}

function initTheme() {
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
}

function render() {
  const months = buildMonths();
  renderGrid(months);
  updateSummary(months);
}

initTheme();
render();
