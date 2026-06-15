# Hash Generator

A cryptographic operations console with asynchronous multi-algorithm digest processing via the Web Crypto API (SHA-1, SHA-256) and a native JS MD5 implementation. Features real-time avalanche bit-mutation inspection, per-algorithm clipboard copying, adjustable processing latency, and three preset data payloads.

## Features

### Multi-Algorithm Digest Engine
| Algorithm | Bit Width | Source |
|---|---|---|
| MD5 | 128-bit | Standalone JS implementation (RFC 1321) |
| SHA-1 | 160-bit | `crypto.subtle.digest('SHA-1')` |
| SHA-256 | 256-bit | `crypto.subtle.digest('SHA-256')` |

### Asynchronous Processing Pipeline
- `TextEncoder()` converts strings to `Uint8Array` byte buffers
- `crypto.subtle.digest()` returns `ArrayBuffer` → mapped to lowercase hex via `b.toString(16).padStart(2, '0')`
- MD5 computed synchronously with a dependency-free loop, timed with latency slider
- All three algorithms computed sequentially with configurable delay

### Avalanche Bit-Mutation Inspector
- Stores previous MD5 digest and compares against current
- XOR nibble-by-nibble with per-bit counting
- Visual progress bar showing percentage of bits changed
- Telemetry displays avalanche shift percentage

### Telemetry Dashboard
| Metric | Source |
|---|---|
| Char Length | Input string `.length` |
| Message Weight | `TextEncoder` byte count |
| Hex Width | SHA-256 bit width |
| Avalanche Shift | Bit difference % vs previous |
| Integrity Badge | `DIGEST TRACKING: INTEGRITY SECURE` |

### Per-Algorithm Clipboard
- Individual COPY buttons next to each hash output
- Flashes emerald green on successful clipboard transfer

## Presets

| Preset | Content |
|---|---|
| DB Credential | PostgreSQL connection string with credentials |
| API Signature | HTTP request with HMAC-SHA256 signature header |
| System Payload | JSON service configuration with dependencies |

## Controls

| Action | Function |
|---|---|
| Execute Checksum Computations | Recompute all three hashes |
| Verify Avalanche Dispersion | Compare current vs previous digest |
| Flush Cryptographic Channels | Clear all fields and reset telemetry |

---

## File Structure

```
├── index.html    Layout — preset bar, input with latency slider, hash output rows, avalanche panel, telemetry, admin footer
├── style.css     Dark IDE — MD5 ruby, SHA-1 gold, SHA-256 emerald, avalanche bar, responsive grid
├── script.js     Engine — MD5 pure JS, crypto.subtle wrappers, hex mapping, avalanche XOR computation, copy handlers
├── README.md     This file
└── project.json  Project metadata
```

Open `index.html` in any browser.
