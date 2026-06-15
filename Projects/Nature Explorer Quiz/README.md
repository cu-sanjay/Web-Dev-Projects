# Nature Explorer · Quiz Adventure

A premium gamified biome discovery terminal built with vanilla HTML, CSS, and JavaScript. Master ecological knowledge across four global biomes through a locked-progression quiz adventure with persistent save states, badge-based achievements, and cartographic map navigation.

---

## Ecological Expedition Framework

The application simulates a field research expedition where the user (Explorer) must catalog biomes by answering ecosystem-focused questions. Each biome represents a distinct ecological zone with unique biodiversity, climate factors, and conservation challenges.

### Biome Roster

| Biome | Icon | Core Focus | Question Count |
|---|---|---|---|
| Amazon Rainforest | 🌿 | Tropical ecology, deforestation drivers, indigenous peoples | 6 |
| Sahara Desert | 🏜️ | Arid adaptation, desertification, temperature extremes | 6 |
| Great Barrier Reef | 🐠 | Coral biology, bleaching causes, marine biodiversity | 6 |
| Arctic Tundra | ❄️ | Permafrost dynamics, climate sensitivity, short growing seasons | 6 |

### Progressive Unlock Lattice

- **Biome 0** (Amazon Rainforest) is unlocked on genesis — no prerequisites.
- Completing a biome with **≥75% accuracy** unlocks the next biome node on the cartographic grid.
- Failed attempts allow **unlimited retries** without losing previously-earned points or unlocking downstream nodes.
- Once unlocked, biomes remain accessible permanently — progress is never revoked.

---

## Scoring & Badge Tier Architecture

### Point System

Each question correctly answered awards **5 points**. Points are awarded once per unique question — retrying a biome does not re-award points for previously-correct answers, but newly-corrected answers on retry will add their points.

| Scenario | Points Earned |
|---|---|
| First attempt, 4/6 correct (67%) | 20 points |
| Retry, 6/6 correct (100%) | +10 points (2 new correct) |
| Retry, same 4/6 correct | 0 additional points |

### Explorer Badge Tiers

| Tier | Points Required | Title | Label Color |
|---|---|---|---|
| I | 0 | Seedling Explorer | SEEDLING |
| II | 20 | Biome Tracker | TRACKER |
| III | 40 | Eco Warrior | WARRIOR |
| IV | 60 | Conservation Champion | CHAMPION |
| V | 80 | Earth Guardian | GUARDIAN |

---

## Architectural UI Code Design

### File Structure

```
├── index.html         Main application shell
├── style.css          Ultimate dark terminal theme and layout
├── script.js          Quiz engine, state management, and cartographic renderer
├── README.md          This documentation
└── project.json       Project metadata
```

### Architecture Overview

- **Zero Dependencies**: No build tools, package managers, or server-side runtime required.
- **Client-Side Only**: All computation runs in the browser using vanilla JavaScript.
- **Data-Driven Design**: Biome question matrix, badge tiers, and progression rules are declared as immutable constants — the rendering layer reads from a single state object.
- **State Persistence**: Full serialization to `localStorage` on every submit action; state key `natureExplorerState` holds unlocked biomes, completed biomes, per-question answers, correct question tracking, and total points.
- **Responsive Split-Pane Layout**: CSS Grid layout with `vmin`-based scaling reflows from side-by-side on desktop to stacked on mobile.

### Data Flow

1. **Application Load** → `init()` reads `localStorage` → rebuilds state object → renders map grid + metrics
2. **Biome Selection** → click unlocked node → `selectBiome(idx)` → `startQuiz()` → `renderQuestion()`
3. **Quiz Interaction** → select option → `selectOption(oi)` updates `state.answers` → re-render question UI
4. **Submit Answer** → `submitAnswer()` marks question as submitted → saves to `localStorage` → shows feedback + progress dot
5. **Quiz Completion** → `calculateResult(bIdx)` → counts correct answers → adds new points → evaluates ≥75% threshold → unlocks next biome if met → renders result screen
6. **Retry** → `retryBiome()` clears submitted answers for the biome → resets to question 0 → restarts quiz
7. **Abort / Purge** → `abortExpedition()` returns to map view; `purgeAll()` calls `resetState()` + clears `localStorage` → re-renders map in genesis state

---

## Interactive Cartographic Grid

The map panel renders biome nodes in a 2×2 grid with four distinct visual states:

| State | Border | Icon | Interaction |
|---|---|---|---|
| Locked | Dim red (`rgba(255,23,68,0.15)`) | Grayscale + 🔒 overlay | None — click blocked |
| Unlocked | Green glow (`rgba(0,230,118,0.25)`) | Full color | Click to start quiz |
| Active | Cyan glow (`rgba(0,229,255,0.5)`) | Full color + hover scale | Currently selected |
| Completed | Solid green (`rgba(0,230,118,0.4)`) | Full color + ✓ badge | Click to view results |

---

## Controls & Interactions

### Keyboard Shortcuts

| Key | Action |
|---|---|
| `1` – `4` | Select answer option A – D |
| `Enter` | Submit answer / Advance to next question |
| `←` / `→` | Previous / Next question (after submitting current) |

### Footer Commands

| Button | Behavior |
|---|---|
| **Abort Active Expedition** | Returns to map view, preserves all progress and current biome state |
| **Purge Progress & Re-Seed Map Sockets** | Completely resets all localStorage data, locks all biomes except biome 0, zeroes points, returns to genesis state without page reload |

---

## Local Standalone Execution

No server, build step, or installation required:

1. Clone or download this directory
2. Open `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari)
3. The application loads instantly — zero external dependencies

### System Requirements

- Modern browser with HTML5, CSS Grid, and ES6 support
- No additional software, frameworks, or package managers
- Fully offline-capable: all logic and assets are self-contained

---

## License

Educational and research use. Built as a technical demonstration of gamified quiz mechanics, progressive unlock systems, and client-side state persistence.
