# AI Research Notes Organizer

An interactive, responsive client-side research notebook that structures note entries, links academic reference URLs, and simulates AI summarization and auto-tagging.

## Core Features

- **Folder Tag Tree**: Organize notes into separate study notebooks/folders (e.g. Computer Science, Biotechnology, Economics).
- **Academic Source Linker**: Link notes directly to reference credentials (URLs, title summaries).
- **Client-Side AI Assistant**:
  * Auto-Generated Summary: Extracts top sentences of note content to produce structural summaries.
  * Keyword Tagger: Suggests taxonomy keywords by analyzing top recurring nouns and concepts in the text body.
  * Related Notes Connector: Renders links to other research papers sharing similar categories or keywords.
- **Global Searching & Filters**: Instantly filters notes lists using tags, folders, or search queries.
- **LocalStorage State Sync**: Keeps notes lists, active categories, and folders persistent across browser sessions.

## Startup instructions

Open `index.html` in any web browser.

## Tech stack

- HTML5
- CSS3 (Vanilla design tokens, flex/grid template layouts, hover transition effects)
- Vanilla JavaScript (Regex heuristics model, array mappings, local storage sync)
