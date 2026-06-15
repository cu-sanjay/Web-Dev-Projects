# API Response Formatter

A structural validation tool for JSON/XML API responses featuring a recursive collapsible DOM tree viewer, real-time parsing telemetry, and an interactive syntax node matrix.

## Architecture

### Dual Parsing Engine
- **JSON** — native `JSON.parse()` with try/catch
- **XML** — `DOMParser().parseFromString()` with parsererror detection
- Success → emerald `[ PARSER STABILIZED: LEXICAL TREE SYNTAX VALID ]`
- Failure → crimson error detail + `[ PARSER ERROR: LEXICAL_COMPILATION_FAILED ]`

### Recursive Collapsible Tree
- `buildJSONTree()` — walks parsed objects/arrays recursively; renders keys in purple (`#b388ff`), strings in green (`#33cc66`), numbers in cyan (`#00e5ff`), booleans in amber (`#ffc800`), null in dim gray
- `buildXMLTree()` — walks parsed DOM nodes recursively; renders tags in cyan, attributes in amber, text content in green
- Every parent node gets a `▶` toggle that rotates on click and hides/shows the child container via CSS `display:none`

### Controls

**Action Bar:**
| Button | Function |
|---|---|
| Beautify & Render Code Tree | Pretty-prints input, then re-parses and renders tree |
| Minify Data Payload | Compresses to single line, then re-renders |
| Expand All Active Nodes | Shows all collapsed children |
| Collapse All Active Nodes | Hides all children to root level |
| Copy Raw Code to Clipboard | Copies textarea content, flashes confirmation badge |

**Admin Footer:**
| Button | Function |
|---|---|
| Execute Async Lexical Compilation Run | Parses current input and renders tree |
| Inject Complex Nested Data Mock Template | Populates textarea with deeply nested JSON (2 users, metadata, pagination, config) |
| Flush Formatting Channels & Re-Zero Matrices | Clears input, viewport, telemetry — no page reload |

**Keyboard:** `Ctrl+Enter` / `Cmd+Enter` executes parsing.

### Telemetry Dashboard
- Input Data Type Scheme (JSON / XML)
- Absolute Byte Footprint (via `TextEncoder`)
- Total Key / Element Count (recursive traversal)
- Maximum Node Nesting Depth
- Active Compilation Badge (STANDBY / VALID / ERROR / ACTIVE)

## File Structure

```
├── index.html    Layout — format ribbon, action bar, split workspace, telemetry, admin footer
├── style.css     Dark IDE terminal, glassmorphic panels, neon syntax colors, rotating disclosure carats
├── script.js     JSON/XML parsers, recursive DOM tree builders, telemetry engine, clipboard, injector
├── README.md     This file
└── project.json  Project metadata
```

Open `index.html` in any browser.
