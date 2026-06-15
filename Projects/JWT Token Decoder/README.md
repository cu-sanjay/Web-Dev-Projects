# JWT Token Decoder

A cryptographic identity debugging cockpit for JWT inspection with three-segment token decomposition, base64url padding reconstruction, try/catch exception handling, live ticking expiration chronometer, claims validation, and three preset token configurations.

## Features

### Three-Segment Token Decomposition
- Splits encoded JWT over `.` delimiters into Header, Payload, Signature
- Reconstructs base64url → base64 by replacing `-` → `+`, `_` → `/`
- Padding math: `pad = (4 - len % 4) % 4` before `atob()` decode
- Flags anatomical failure if token does not contain exactly 3 segments

### Try/Catch Security Exception Handlers
- Each segment (header, payload, signature) wrapped in individual try/catch blocks
- Crimson `[ANATOMY_ERROR: MALFORMED TOKENS PAYLOAD]` badge on decode failure
- Error detail panel with specific segment failure message

### Live Ticking Expiration Chronometer
- Parses `exp` and `iat` epoch claims from payload
- `setInterval` at 1s granularity computing `Δt = exp - Date.now()/1000`
- Emerald green countdown while active, amber under 60s, crimson at expiry
- Transitions to `[TOKEN_LIFECYCLE: EXPIRED KEY EXPIRATION]` state

### Telemetry Dashboard
| Metric | Source |
|---|---|
| Algorithm | `header.alg` (HS256, RS256, etc.) |
| Validity State | ACTIVE / EXPIRED / MALFORMED |
| Countdown Timer | Live `exp - now` in h/m/s |
| Claims Weight | Total key count in payload |
| Security Badge | Valid / Warning / Anatomy Error |

### Token Presets
| Preset | Type | Behavior |
|---|---|---|
| Valid Admin Auth | HS256 | Future `exp`, admin role, 4 permissions |
| Expired Session | RS256 | Past `exp`, viewer role, 1 permission |
| Malformed | 2 segments | Anatomical failure trigger |

## Controls

| Action | Function |
|---|---|
| Execute Token Decomposition | Decode and render all segments |
| Validate Active Claim Constraints | Check `iat`/`exp` against current time |
| Flush Token Buffers | Clear all data, stop chronometer, reset |

---

## File Structure

```
├── index.html    Layout — preset bar, encoded input, segment views, telemetry, admin footer
├── style.css     Dark IDE — header ruby, payload gold, signature cobalt, crimson errors, emerald valid
├── script.js     Engine — splitter, base64url decoder with padding math, chronometer, try/catch, presets
├── README.md     This file
└── project.json  Project metadata
```

Open `index.html` in any browser.
