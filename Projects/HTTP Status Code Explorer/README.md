# HTTP Status Code Explorer

A protocol diagnostics desk with a comprehensive 17-code HTTP status database, real-time array filter engines, class-based grouping via `floor(code/100)`, click-to-inspect inspector panel, raw HTTP payload copying, and network analytics telemetry.

## Features

### HTTP Status Database
17 RFC status codes across all 5 classes:

| Class | Codes | Color |
|---|---|---|
| 1xx Informational | 100, 101 | Cyan `#00ffff` |
| 2xx Success | 200, 201, 204 | Emerald `#33cc66` |
| 3xx Redirection | 301, 302, 304 | Purple `#af52de` |
| 4xx Client Error | 400, 401, 403, 404, 405, 429 | Amber `#ffcc00` |
| 5xx Server Error | 500, 502, 503 | Crimson `#ff3b30` |

### Search & Filter

| Control | Behavior |
|---|---|
| Search field | Filters by code number, phrase text, or description |
| Class buttons | `all` or `floor(code/100)` range group |
| Combined | Search + class filter stack together |

### Protocol Inspector Slate
- Click any card → renders full metadata: code, phrase, description, common headers, raw HTTP payload
- "Copy Raw Payload" button clips wire text to clipboard with emerald flash confirmation

### Telemetry Dashboard
| Metric | Source |
|---|---|
| Active Filter | Current class selection |
| Filtered Count | Array `.length` after filter |
| Cache-Control | Any header contains `cache-control` |
| Connection Type | Any header contains `keep-alive`/`persistent` |
| Protocol Badge | N nodes active / synced / standby |

### Admin Controls
| Action | Function |
|---|---|
| Execute Protocol Registry Sync | Re-render full registry, reset selection |
| Isolate Restful Error Clusters | Filter to 4xx + 5xx only |
| Flush Selection Filters | Clear all filters, selection, inspector |

---

## File Structure

```
├── index.html    Layout — search + filter toolbar, cards grid, inspector panel, telemetry, admin footer
├── style.css     Dark IDE — class-colored cards (cyan/emerald/purple/amber/crimson), inspector raw block, responsive grid
├── script.js     Engine — status database, array filter, class grouping, click-to-inspect, copy raw, telemetry
├── README.md     This file
└── project.json  Project metadata
```

Open `index.html` in any browser.
