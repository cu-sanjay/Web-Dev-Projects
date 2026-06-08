# Hungama // Premium Word Guessing Game

Hungama is a high-fidelity educational word-guessing game designed around the logical constraints of the classic Hangman puzzle. Featuring a custom premium dark dashboard workspace inspired by Vercel and Linear.app, this workspace project serves as a showcase for clean, client-side string tracking pipelines, virtual event delegation patterns, and vector graphics canvas rendering.

---

## Technical Capabilities & Core Specifications

### 1. Three-Column Workspace Architecture (`style.css`)

- **Strict Resolution Constraints Bounding:** Binds visual elements to an anti-shift dashboard canvas panel container locked precisely to `1200px` by `780px` to inhibit cross-resolution layout distortion.
- **Jitter-Proof Monospaced Tracking Docks:** The hidden words display slots (`.word-display`), score metrics, and streak counters utilize monospaced font hierarchies (`ui-monospace`, `Consolas`), preventing alphanumeric alignment shift when letters are revealed.
- **State Highlight Modifiers:** \* Successful Key Selection: `.correct` applies an emerald green background blend (`#10b981`) combined with a sharp radial CSS glow effect.
  - Mismatch Key Selection: `.incorrect` applies a crimson muted background mask (`#ef4444`) while configuring `pointer-events: none` and dropping visibility opacity metrics to prevent processing loop re-entry.

### 2. Algorithmic Data & String Pipelines (`script.js`)

- **Substring Parsing Validation:** Inputs registered from virtual key triggers are processed step-by-step through an internal array map. Successful matches systematically exchange underlying placeholder blank strings with target character indices.
- **Dynamic Vector Canvas Injection:** Every incorrect submission drops the internal attempts counter (`remainingAttempts = 6`), which directly targets a matching coordinate sequence array index to reveal specific gallows and character body paths inside the main SVG container.
- **Persistent Session Win-Streaks:** Syncs active score streaks directly into local browser `LocalStorage` nodes to ensure state permanence upon page reloads.

---

## Workspace Directory Layout

```text
Hungama Game/
├── index.html       # Structural Semantic Three-Column Framework Elements
├── style.css        # Typography Stability and Keypad Glow Configurations
├── script.js        # String Processing and Vector Canvas Ingestion Engine
├── project.json     # Architecture Manifest Descriptor Metadata
└── README.md        # Technical Engineering Specifications Documentation
```
