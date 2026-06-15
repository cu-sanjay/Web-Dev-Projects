# Team Collaboration Board

An interactive team workspace containing project dashboards, Kanban task boards (Backlog, In Progress, In Review, Done), dynamic member registries with initials avatars, task checklists, and global progress trackers.

## Core Features

- **Kanban Task Boards**: Organize task items across 4 columns:
  * Backlog -> In Progress -> In Review -> Done.
  * Interactively shift cards using arrows to instantly update column indicators.
- **Member Directory Registry**: Create and manage a custom database of team members.
  * Autogenerates unique avatar color icons from user names.
  * Dropdown menus allow quick task assignments.
- **Task Inspector Drawer**: Click any task card to expand details:
  * Modify description, due date, priority (Low, Medium, High), and assignees.
  * Track checklists sub-tasks (e.g. Code refactoring, QA tests) which update card progress bars in real time.
- **Project Progress Indicators**: Top-level progress gauge calculating the global percentage of completed tasks relative to total items.
- **Filters & Searches**: Real-time filters to restrict boards rendering based on priority, text search matches, or assigned members.

## Run it

Open `index.html` in any modern web browser.

## Technical Details

- **HTML5 & CSS3**: Glassmorphic dark theme dashboard templates, range slider trackings, grid lanes, and rounded badges.
- **Vanilla JavaScript**: State-driven array rendering, filter queries matching, and sync mechanisms committing JSON models in `localStorage`.
- **Storage**: Persists boards data locally in client `localStorage`.
