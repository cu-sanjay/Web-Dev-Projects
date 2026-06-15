# Country Flag Explorer

A sovereign-state geodata terminal with procedural Canvas flag rendering, real-time search and continent filtering, interactive country inspector cards, and global demographic metrics. Zero external assets — all flags drawn procedurally via native Canvas 2D.

---

## Features

### Country Database
10 nations across all continents with full demographic profiles:

| Country | Capital | Continent | Population |
|---|---|---|---|
| India | New Delhi | Asia | 1.43B |
| Japan | Tokyo | Asia | 123M |
| France | Paris | Europe | 68M |
| Germany | Berlin | Europe | 85M |
| Canada | Ottawa | Americas | 40M |
| Brazil | Brasília | Americas | 216M |
| Egypt | Cairo | Africa | 113M |
| South Africa | Pretoria | Africa | 60M |
| Australia | Canberra | Oceania | 27M |
| Mexico | Mexico City | Americas | 128M |

### Procedural Flag Engine
- Asset-free Canvas 2D rendering — no images, SVGs, or external packs
- Supports `rect`, `circle`, and `poly` commands in flag schema
- Flags drawn on-demand at native resolution with HiDPI support

### Search & Filtering
- Real-time text search on name, capital, and languages
- Continent dropdown filter (Asia / Europe / Americas / Africa / Oceania)
- G20 super-cluster pre-filter toggle

### Inspector Panel
- Large flag render, name, capital, continent, population, land area, density
- Color-coded density (gold for moderate, green for high)
- G20 member badge with emerald glow
- Language chip list

### Global Metrics
- Active regional continent
- Total aggregated population pool
- Average population density
- Linguistic complexity index (unique language count)

## Controls

| Action | Function |
|---|---|
| Execute Global Database Query Run | Re-apply current filters and refresh |
| Pre-Filter G20 Super-Cluster | Show only G20 member states |
| Purge & Re-Zero | Clear search, filters, and inspector |

---

## File Structure

```
├── index.html        Layout — search ribbon, card matrix, inspector, metrics, admin footer
├── style.css         Dark terminal — glassmorphic panels, neon cyan/gold/green states
├── script.js         Engine — country database, flag renderer, search/continent filter, telemetry
├── README.md         This file
└── project.json      Project metadata
```

Open `index.html` in any browser.
