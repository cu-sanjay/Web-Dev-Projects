# AI Project Idea Generator

An interactive, responsive developer workbench that synthesizes custom project blueprints based on tech stacks, difficulties, and industries, tracks roadmap tasks, and exports JSON blueprints.

## Core Features

- **Procedural Idea Synthesizer**: Dynamically constructs unique coding project prompts by combining selected inputs for Difficulties (Beginner, Intermediate, Advanced), Tech Stacks (Frontend, Fullstack, AI/ML, Blockchain), and Industries (Healthcare, Finance, Gaming, Social, Productivity).
- **Interactive Refiner**: Users can inject specialized AI features (e.g. real-time sync, analytics models, natural language processing) to expand the scope of any generated idea.
- **Bookmarks Manager**: Bookmark generated blueprints into a saved drawer. All bookmarks are saved in `localStorage`.
- **Requirements Roadmap Editor**: Select a saved blueprint to view checkoff checklists for tasks, custom notes fields, and tech stack parameters.
- **JSON Exporter**: Download the configured project specifications as a formatted JSON blueprint file.

## Startup instructions

Open `index.html` in any web browser.

## Tech stack

- HTML5
- CSS3 (Vanilla variables, grid columns, custom input selectors, flex alignments)
- Vanilla JavaScript (local storage sync, procedural text selectors, download URI builders)
