# JSON Formatter Validator

A developer IDE-style JSON parsing terminal with try/catch syntax validation, beautification (2-space / 4-space), minification, syntax-highlighted output, recursive key-depth telemetry, and broken data injection for error testing.

---

## Features

### Validation Engine
- `JSON.parse()` with try/catch error trapping
- Regex-based position extraction (line, column, context snippet)
- Emerald `[SYNTAX VALID: ABSTRACT TREE STABILIZED]` badge on success
- Crimson error detail panel with position metadata on failure

### Beautification & Minification
| Action | Description |
|---|---|
| Beautify [2-Space] | Reformat with 2-space indentation |
| Beautify [4-Space] | Reformat with 4-space indentation |
| Minify Payload | Strip whitespace to single-line compact form |
| Copy to Clipboard | Copy current input buffer |

### Syntax Highlighting
- Keys: cyan (`#00e5ff`)
- Strings: green (`#00e676`)
- Numbers: amber (`#ffc800`)
- Booleans: purple (`#b388ff`)
- Null: crimson (`#ff1744`)
- Brackets/comma: dim white

### Telemetry Dashboard
| Metric | Source |
|---|---|
| Syntax State | VALID / ERROR |
| Byte Size | UTF-8 byte count of input |
| Key-Value Pairs | Recursive `countKeys()` traversal |
| Tree Depth | Maximum nested object depth |
| Compilation Badge | Valid/Invalid with status message |

## Controls

| Action | Function |
|---|---|
| Beautify 2/4 Space | Format JSON with indentation |
| Minify | Compact to single line |
| Copy to Clipboard | Copy raw input |
| Execute Structural Check | Validate and render output |
| Inject Broken Template | Load malformed JSON for error testing |
| Flush Channels | Reset to defaults |

---

## File Structure

```
├── index.html        Layout — toolbar, input textarea, output view, telemetry, admin footer
├── style.css         Dark IDE — glassmorphic panels, cyan keys, green strings, amber numbers, crimson errors
├── script.js         Engine — try/catch parser, beautify/minify, syntax highlighter, key-depth recursion
├── README.md         This file
└── project.json      Project metadata
```

Open `index.html` in any browser.
