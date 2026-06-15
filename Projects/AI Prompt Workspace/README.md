# AI Prompt Workspace

A prompt engineering workstation with a 6-prompt database, category filtering and search, favorite starring with `localStorage` persistence, regex variable placeholder extraction (`{{var}}`), live compiled preview with inline variable editing, token estimation (`ceil(chars/3.8)`) with model suitability badges, and complex template injection.

## Features

### Prompt Database
6 production-level seed prompts with `localStorage` persistence:

| Prompt | Category | Variables |
|---|---|---|
| Web Code Generator | Development | `language`, `functionality`, `framework`, `css_approach` |
| Figma Layout Generator | UI/UX | `app_name`, `platform`, `component_list`, `color_scheme`, `typography_style` |
| API Architecture Blueprint | Architecture | `protocol`, `service_name`, `auth_method`, `feature_list`, `rate_limit`, `cache_strategy` |
| Data Pipeline Orchestrator | Data Science | `source`, `transform_tool`, `destination`, `validation_method`, `scheduler`, `frequency` |
| React Component Builder | Development | `component_name`, `hooks`, `states`, `api_endpoint`, `styling_solution`, `testing_tool` |
| System Migration Strategy | Architecture | `source_system`, `target_system`, `downtime`, `data_volume`, `rollback_strategy`, `validation_steps` |

### Search & Filter
- Text search matches against title, text, and tags
- Category dropdown: All / Development / Architecture / UI-UX / Data Science
- Results count updates dynamically

### Star Favorites
- Click the ★ on any card to toggle favorite
- Starred total tracked in telemetry
- Favorites persist across page loads via `localStorage`

### Variable Placeholder Engine
- Regex `/\{\{(\w+)\}\}/g` extracts all bracketed variables from selected prompt
- Inline text fields rendered for each variable in the inspector
- Typing into fields updates a live **Compiled Preview** box in real time
- Variables replaced via `text.replace(new RegExp('{{' + key + '}}', 'g'), value)`

### Token Counting & Model Suitability
- Token estimation: `Math.ceil(chars / 3.8)`
- Character and word counts displayed
- Model suitability badges:
  - ≤1000 tokens → `CONCISE — HIGH PERFORMANCE` (emerald)
  - 1000-4000 tokens → `STANDARD CONTEXT MODEL SUITABLE` (purple)
  - >4000 tokens → `LONG-CONTEXT BUFFER REQUIRED` (amber)

### Controls
| Action | Function |
|---|---|
| New Prompt Card | Add prompt with default variable template |
| Execute Token Volume Analysis | Sum tokens across all prompts |
| Inject Complex Optimization Template | Add multi-stage pipeline prompt with 10 variables |
| Flush Prompt Cache | Reset to defaults, clear selections, zero telemetry |

---

## File Structure

```
├── index.html    Layout — search + filter toolbar, cards grid, inspector with variables, telemetry, admin footer
├── style.css     Dark IDE — purple accent, gold stars, token badges, responsive auto-fit grid
├── script.js     Engine — prompt database, localStorage sync, regex variable extractor, compiled preview, token counter
├── README.md     This file
└── project.json  Project metadata
```

Open `index.html` in any browser.
