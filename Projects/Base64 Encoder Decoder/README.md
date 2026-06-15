# Base64 Encoder/Decoder

A binary transmission cockpit with dual-track plain text and file-based base64 encode/decode engines, `FileReader` API drag-and-drop file ingestion, try/catch integrity validation with padding analysis, real-time telemetry, and copy/download actions.

## Features

### Dual-Track Conversion Engine
| Mode | Input | Output |
|---|---|---|
| Plain Text | Textarea with live binding | Base64 string |
| File Asset | Drag-and-drop dropzone + `FileReader` | Data URL stream |

### Try/Catch Integrity Validation
- `btoa()` / `atob()` wrapped in robust try/catch blocks
- Emerald green `INTEGRITY: BASE64 STREAM VALID` badge on success
- Solar amber `SERIALIZATION ERR: INVALID CHARACTER ALIGNMENT` on base64 violations
- Error detail panel with raw exception text

### Real-Time Telemetry
| Metric | Computation |
|---|---|
| Operation State | ENCODED / DECODED / ERROR |
| Data Length | Byte count of output buffer |
| Expansion Size | `L = 4 · ceil(B/3)` ratio as percentage |
| Padding Chars | Trailing `=` count |

### Workspace Controls
| Action | Function |
|---|---|
| Encode Direction | Plain text → Base64 |
| Decode Direction | Base64 → plain text |
| Copy to Clipboard | Copy output buffer |
| Download as Asset File | Save output as `.b64` or `.txt` |
| Purge Data Buffers | Full reset without page reload |

---

## File Structure

```
├── index.html    Layout — mode ribbon, direction bar, input panel, dropzone, output panel, telemetry, admin footer
├── style.css     Dark IDE — glassmorphic panels, neon states, drag-over glow, responsive grid
├── script.js     Engine — btoa/atob wrappers, FileReader adapters, telemetry math, clipboard/download
├── README.md     This file
└── project.json  Project metadata
```

Open `index.html` in any browser.
