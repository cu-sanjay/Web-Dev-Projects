# Terminal Portfolio

A retro hacker command-line terminal interface with a Canvas Matrix digital rain backdrop, Unix-style tokenized command interpreter, typing animation sequencer, and up/down arrow history navigation. Zero dependencies.

---

## Features

### Command Interpreter
| Command | Output |
|---|---|
| `help` | Lists all available commands |
| `about` | Biographical profile (20yo, 9.8 CGPA) |
| `skills` | Technical skill matrix (React, TS, Python, Figma, DBMS) |
| `projects` | Open-source portfolio (SmartAttend, CivicArch AI, NSOC Tools) |
| `matrix` | Toggle rain intensity between LOW and HIGH |
| `clear` | Flush terminal buffer |
| `sudo` | Escalation prank response |

### Matrix Rain Canvas
- 60fps falling katakana + alphanumeric glyph streams
- Per-column velocity randomization
- Trailing fade echo shadows
- `matrix` command toggles opacity from 0.12 → 0.35

### Shell Mechanics
- Up/Down arrow cycle through command history
- Click anywhere to re-focus input prompt
- Typing animation with variable-speed character sequencer
- Blinking caret during output render

### Terminal UI
- Fake window header with close/minimize/maximize dots
- `guest@girish-madarkar-v2026: ~` title bar
- `guest@girish:~$` prompt prefix
- Cyber green (#33ff66) accent throughout

---

## File Structure

```
├── index.html        Layout — terminal container, Canvas overlay, header, output log, input line
├── style.css         Dark terminal — matrix overlay, neon green output, amber errors, cyan info
├── script.js         Engine — command parser, Matrix rain loop, typing sequencer, history stack
├── README.md         This file
└── project.json      Project metadata
```

Open `index.html` in any browser.
