# REST API Tester

An API client platform with multi-verb HTTP method selection (GET/POST/PUT/DELETE) with color-coded themes, try/catch JSON body validation, simulated async network requests via `setTimeout`, mock response generation with dynamic headers, payload byte weight calculation, and transaction telemetry.

## Features

### Multi-Verb Client Controller
| Method | Color | Body Panel |
|---|---|---|
| GET | Cyan `#00ffff` | Hidden — displays informational message |
| POST | Emerald `#33cc66` | Visible — JSON request body |
| PUT | Amber `#ffcc00` | Visible — JSON request body |
| DELETE | Crimson `#ff3b30` | Hidden — displays informational message |

Method selector switches endpoint bar border color, send button accent, and request body visibility in real time.

### JSON Body Validation
- Real-time `JSON.parse()` wrapped in try/catch on every input event
- Emerald `[JSON VALID: STRUCTURAL INTEGRITY CONFIRMED]` on success
- Amber border + raw exception text (e.g. `Unexpected token } in JSON at position 24`) on failure
- Invalid JSON blocks request execution with `[REQUEST BLOCKED: INVALID JSON BODY]`

### Simulated Async Network Engine
- Clicking Send triggers `setTimeout` with random delay (100-600ms)
- Method-appropriate mock response: 200 for GET/PUT/DELETE, 201 for POST
- Dynamic mock headers: `X-Request-Id`, `X-Powered-By: Native-JS-Engine`, `Location` for POST
- Payload weight in bytes via `TextEncoder`

### Telemetry Dashboard
| Metric | Source |
|---|---|
| Status Code | 200/201 with method label |
| Latency | Simulated round-trip in ms |
| Payload Weight | `TextEncoder` byte count of response body |
| Content Type | `application/json` |
| Routing Badge | In flight / Delivered / Blocked / Standby |

## Controls

| Action | Function |
|---|---|
| Send Stream Request | Execute async request with mock response |
| Simulate Global Connection Request | Same as Send |
| Inject Mock Success Dataset | Populate POST endpoint with user profile payload and auto-send |
| Flush Testing Terminal | Cancel pending timeout, clear all fields, reset telemetry |

---

## File Structure

```
├── index.html    Layout — endpoint bar, request body panel, response split view, telemetry, admin footer
├── style.css     Dark IDE — method-colored endpoint bar, body validator states, response split layout, responsive
├── script.js     Engine — method color switch, JSON try/catch validator, setTimeout async engine, mock generators
├── README.md     This file
└── project.json  Project metadata
```

Open `index.html` in any browser.
