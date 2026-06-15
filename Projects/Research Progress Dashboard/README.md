# Research Progress Dashboard

An interactive, high-fidelity research hub and citation planner built for academics, graduate students, and independent research scientists. Manage project statuses, track hypotheses checklists, catalog bibliography reference vault items, generate APA/IEEE citation templates, and document research insights inside lab journals.

## 🚀 Features

- **Project Metrics Monitor**: View research phases from initialization to writing, peer review, and final publications with custom Kanban task trackers.
- **Reference Library Vault**: Build your bibliography database. Catalog authors, journal tags, DOIs, and track reading status (*Unread*, *Reading*, *Cited*).
- **Auto Citation Engine**: Instantly build and copy correctly formatted citations in **APA**, **IEEE**, **Harvard**, and **BibTeX** format fields.
- **Hypothesis Checklists**: Write down project hypotheses, list variable properties (independent vs dependent), and tick off milestones.
- **Lab journal entries diary**: Keep chronological records of thoughts, experimental iterations, and research observations with customizable tag systems.
- **Local Database Backups**: Export everything as a JSON database or restore previous sessions seamlessly.
- **Light & Dark Curated Themes**: Premium UI themes supporting focus-centered typography and distraction-free layouts.

## 📂 Project Structure

```
Research Progress Dashboard/
├── README.md         # Full project handbook
├── project.json      # Metadata descriptor
├── index.html        # App structural elements & modals
├── style.css         # Typography, layout cards, and themes
├── script.js         # State management, citations builder, and event actions
└── thumbnail.svg     # Brand vector thumbnail
```

## 🛠️ How to Use

1. Launch `index.html` in any web browser.
2. The dashboard initializes with high-fidelity seed data (e.g. "Quantum Computing Shaders research", journal entries, bibliography logs) to test layouts immediately.
3. Manage research tasks inside the **Research Projects** tab. Choose a project from the selector dropdown to update checklists and hypotheses.
4. Go to **Literature Vault** to register a new paper, update reading indicators, and copy formatting references.
5. Log experimental discoveries inside the **Writing Journal** timeline.
6. Toggle light/dark settings or import/export database files in the **Settings** tab.
