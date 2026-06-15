# Network Port Visualizer

A transport-layer visualization command deck with a 15-port reference database, HTML5 Canvas animated client-server handshake at 60fps, firewall intercept explosions, live scrolling handshake log, socket telemetry with vulnerability indexing, and random malicious packet scan injection.

## Features

### Port Database & Range Classification
15 ports spanning Well-Known (0-1023), Registered (1024-49151), and Dynamic ranges:

| Port | Service | Transport | Security |
|---|---|---|---|
| 21 | FTP | TCP | Plaintext |
| 22 | SSH | TCP | Encrypted |
| 23 | Telnet | TCP | Plaintext |
| 25 | SMTP | TCP | Plaintext |
| 53 | DNS | UDP | Plaintext |
| 80 | HTTP | TCP | Plaintext |
| 110 | POP3 | TCP | Plaintext |
| 143 | IMAP | TCP | Plaintext |
| 443 | HTTPS | TCP | Encrypted |
| 3306 | MySQL | TCP | Plaintext |
| 5432 | PostgreSQL | TCP | Plaintext |
| 6379 | Redis | TCP | Plaintext |
| 8080 | HTTP-ALT | TCP | Plaintext |
| 8443 | HTTPS-ALT | TCP | Encrypted |
| 27017 | MongoDB | TCP | Plaintext |

### Animated Canvas Handshake (60fps)
- **Client Node** (left) and **Server Gateway** (right) drawn on HTML5 Canvas
- Tiny particle packets animate along a linear path with `requestAnimationFrame`
- Packets transition color: amber (SYN) → cyan (transit) → emerald (ACK)
- **Firewall BLOCK**: packets explode mid-path with crimson particle burst and disintegration

### Controls
| Action | Function |
|---|---|
| Port Number field + Range slider | Select target port (0-65535) |
| Transport selector | TCP / UDP |
| Firewall toggle | ALLOW / BLOCK |
| Port shortcut buttons | Quick-select 8 common ports |
| Execute Socket Connection Handshake | Animate packets across canvas + log handshake |
| Inject Random Malicious Packet Scan | Random port probe with automatic connect |
| Flush Operational Port Cache | Clear canvas, logs, telemetry, reset to defaults |

### Live Handshake Log
Scrolling console outputs `[SYN]` → `[SYN-ACK]` messages with color-coded states (cyan for active, green for success, amber for warnings, red for firewall blocks).

### Telemetry Dashboard
| Metric | Source |
|---|---|
| Port Class | Well-Known / Registered / Dynamic |
| Protocol Alias | Matched port name |
| Vulnerability Index | 78% for plaintext, 12% for encrypted, 4% when blocked |
| Encryption Status | `ENCRYPTED / SECURE` vs `PLAINTEXT / RISK` |
| Operational Badge | Secure / Risk / Active / Critical |

---

## File Structure

```
├── index.html    Layout — shortcut ribbon, port intake, canvas, log console, telemetry, admin footer
├── style.css     Dark IDE — glassmorphic panels, fw toggle (emerald/crimson), canvas frame, scrolling log
├── script.js     Engine — port database, canvas particles via requestAnimationFrame, packet/explosion physics, log
├── README.md     This file
└── project.json  Project metadata
```

Open `index.html` in any browser.
