# Regex Playground

An interactive pattern informatics workspace with try/catch regex validation engines, multi-match span-based highlighting, capture group telemetry tracking, dynamic flag toggles, and complex sample data injection.

## Features

### Try/Catch Regex Evaluation
- `new RegExp(pattern, flags)` wrapped in try/catch blocks
- Emerald green badge `[REGEX STABILIZED: EXPRESSION STRUCTURE OPTIMAL]` on success
- Solar amber error detail with raw exception text (e.g. "Unterminated character class") on failure

### Multi-Match Highlighting Engine
- Spans constructed inline around matched coordinates (never breaks markup)
- Cyan glow for full-pattern matches
- Distinct purple/green/amber layers for capture groups 1/2/3
- Plain text rendered at reduced opacity between matches

### Capture Group Telemetry
- Cumulative match count from iterative `exec()` loop
- Capture group matrix aggregated across all matches
- Pattern processing speed (ms) via `performance.now()`
- Active flags display (g, i, m)

### Flag Toggles
| Flag | Action |
|---|---|
| Global [g] | Match all occurrences |
| Case-Insensitive [i] | Case-insensitive matching |
| Multi-Line [m] | Multi-line anchoring |

## Controls

| Action | Function |
|---|---|
| Execute Global Pattern Check | Re-evaluate and render |
| Inject Complex Sample Data Matrix | Load email/date sample with pre-configured regex |
| Flush Playground Channels | Reset all fields and telemetry |

---

## File Structure

```
├── index.html    Layout — pattern deck, test input, highlighted output, telemetry, admin footer
├── style.css     Dark IDE — glassmorphic panels, neon highlights, custom scrollbars
├── script.js     Engine — try/catch parser, match loop, span highlighter, inject/flush
├── README.md     This file
└── project.json  Project metadata
```

Open `index.html` in any browser.
