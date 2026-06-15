# URL Parser

A network informatics command deck using native `URL` and `URLSearchParams` APIs for URL decomposition, segmented token output, editable two-way query parameter tables, and SSL compliance telemetry.

## Features

### Native URL API Decomposition
- `new URL(urlString)` wrapped in try/catch
- Five segmented token cards: Protocol, Domain Host, Port, Pathname, Hash Fragment
- Emerald `[PARSER STABILIZED: UNIFORM RESOURCE NODE MAPPED]` on success
- Amber error detail for malformed URLs

### Query Parameter Matrix Table
- `URLSearchParams` entries rendered as editable key-value rows
- Two-way reactive binding: edit any cell or delete a row → URL object mutates instantly
- Rebuilt URL string updates concurrently in the read-only field
- Add blank rows or delete existing ones

### Telemetry Dashboard
| Metric | Source |
|---|---|
| Char Length | Input `.length` |
| Param Count | `url.searchParams.size` |
| Port Status | Custom port vs default |
| SSL Compliance | `https:` vs `http:` |
| Parsing Badge | Valid / Error / Standby |

### Presets
| Preset | URL |
|---|---|
| E-Commerce Tracking | `shop.example.com:443` with pagination and sort params |
| OAuth Redirect | `auth.provider.io` with code, state, scope, redirect_uri |
| Local Dev Server | `localhost:3000` with debug params and text anchor |

### Reconstructed URL
- Edits to query table cells rebuild the URL in real time
- "Reconstruct" button pushes the rebuilt URL back to the input textarea

## Controls

| Action | Function |
|---|---|
| Execute Decomposition Loop | Parse current URL string |
| Reconstruct Uniform Resource Vector | Push rebuilt URL back to input |
| Add New Blank Query Parameter Row | Insert empty key-value row |
| Flush Parser Channels | Clear all fields, segments, table, telemetry |

---

## File Structure

```
├── index.html    Layout — preset bar, URL intake, segment cards, query table, telemetry, admin footer
├── style.css     Dark IDE — protocol ruby, host cyan, port amber, path purple, hash emerald, responsive grid
├── script.js     Engine — new URL try/catch, URLSearchParams mapping, two-way sync, add/delete rows, presets
├── README.md     This file
└── project.json  Project metadata
```

Open `index.html` in any browser.
