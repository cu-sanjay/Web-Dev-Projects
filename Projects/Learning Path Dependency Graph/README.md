# Learning Path Dependency Graph

A visual dependency graph that maps a full-stack web development learning path across 5 tiers, with prerequisite-based unlocking and persistent progress tracking — all running entirely client-side.

---

## Features

- **Interactive Dependency Graph** — SVG-based visual roadmap with connected nodes showing prerequisite relationships
- **Tiered Learning Path** — 12 topics across 5 progressive tiers from HTML/CSS to deployment
- **Prerequisite Unlocking** — Topics unlock only when all dependencies are completed
- **Progress Tracking** — Persistent localStorage state, progress bar, and completion count
- **Topic Details** — Click any node to view descriptions and prerequisite status
- **Reset Option** — Clear all progress and start fresh

---

## Learning Path Tiers

| Tier | Topics | Description |
|------|--------|-------------|
| 1 | HTML, CSS, Git Basics | Fundamentals |
| 2 | JavaScript | Core programming |
| 3 | DOM, Node.js | Frontend + backend |
| 4 | React, Express, Databases | Framework specialization |
| 5 | Full Stack, Testing, Deployment | Production readiness |

---

## Dependency Rules

- A topic is **locked** until all its prerequisites are completed
- A topic is **unlocked** when all prerequisites are met
- Click an unlocked topic → view details → click "Mark Complete"
- Completing a topic may unlock dependent topics in higher tiers

---

## Local Deployment

```bash
git clone <repository-url>
cd "Learning Path Dependency Graph"
start index.html
```

---

## Project Structure

```
Learning Path Dependency Graph/
  index.html        Application layout
  style.css         Graph, node, and animation styling
  script.js         Graph layout, state management, interaction logic
  README.md         Documentation
  project.json      Project metadata
  thumbnail.svg     Project thumbnail
```

---

## Author

**Shruti Narsulwar** — [@Shrutiii01](https://github.com/Shrutiii01)
