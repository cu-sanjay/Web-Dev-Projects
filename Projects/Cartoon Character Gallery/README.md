# Toon-Sprout // Cartoon Character Gallery

A high-fidelity, browser-based multimedia visualization platform featuring dynamic client-side filtering, multi-dimensional metadata indexing, and smooth layout re-flow transformations. Built entirely with vanilla HTML, CSS, and JavaScript — no frameworks, build steps, or server dependencies.

---

## Client-Side Catalog Indexing & Search Engineering

The core search engine evaluates character records against a query string $q$ using a tag-based matching metric:

$$M(q, T_c) = \begin{cases} 1 & \text{if } \exists \, t \in T_c \text{ such that } t \text{ contains } q \lor q \subseteq \text{Name}_c \\ 0 & \text{otherwise} \end{cases}$$

Where $T_c$ is the tag array of character $c$, and $\text{Name}_c$ is its display name. A match occurs when any tag contains $q$ as a substring, or $q$ appears within the character's name.

Multi-select category intersection is then applied across Production Era, Media Origin, and Moral Alignment dimensions, followed by numerical range validation on Power, Agility, and Comedy attribute scores.

---

## Layout Re-Flow & Responsive Grid Mechanics

The card grid scales dynamically based on viewport width using the responsive element width equation:

$$W_{card} = \frac{W_{\text{viewport}} - (G_{gap} \cdot (N_{cols} - 1)) - 2 \cdot P_{pad}}{N_{cols}}$$

Where:
- $W_{\text{viewport}}$ — available width of the grid container
- $G_{gap}$ — the fixed gutter gap between columns (16px)
- $N_{cols}$ — dynamically computed column count (1–4 based on container width thresholds)
- $P_{pad}$ — container padding (16px)

Column count thresholds:
- `< 640px` → 1 column
- `< 860px` → 2 columns
- `< 1100px` → 3 columns
- `≥ 1100px` → 4 columns

Cards that fail filter criteria are removed from the DOM with a smooth scaling animation, while incoming cards bloom into place via the `cardBloom` keyframe animation with staggered delays.

---

## Systemic Architecture Overview

The application is organized into four functional layers:

**1. Data Layer** — A single-source-of-truth registry of 14 fully-structured character objects, each carrying ID, Name, Universe, Production Era, Media Origin, Moral Alignment, full Description, inline SVG avatar token, Stat Dictionary (Power, Agility, Comedy), multilingual Tag Collection, and Release Year.

**2. State Management** — An isolated state object tracking current search query, selected multi-select arrays for each taxonomy, slider boundary values (min/max), and active sort ordering mode.

**3. Filter & Sort Pipeline** — A multi-tier evaluation loop that:
   - Screens characters through the string matching formula $M(q, T_c)$
   - Cross-examines selected category intersections with logical AND
   - Enforces attribute range constraints (Power, Agility, Comedy)
   - Passes the result set through the selected sorter (Alphabetical, Power Index descending, or Release Year descending)

**4. Rendering & Interaction Engine** — DOM-based card generation with inline SVG avatar injection, event-delegated click handlers for the modal inspector, keyboard (Escape) and backdrop-click dismissal, and a CSV manifest exporter that serializes the current filtered subset.

---

## Interface Functional Guide

### Sidebar Controls (Left Panel)

| Control | Function |
|---|---|
| **Omnibox Search** | Real-time text filtering across character names and tags |
| **Production Era** | Multi-select: Classic, Golden, Modern |
| **Media Origin** | Multi-select: Television, Cinematic Feature, Indie Webcomic |
| **Moral Alignment** | Multi-select: Heroic, Neutral, Mischievous |
| **Power / Agility / Comedy Sliders** | Upper-bound range filters (10–100) |
| **APPLY RE-FLOW ANIMATION** | Triggers a sequenced card bloom animation cycle |
| **FLUSH SEARCH FILTERS** | Resets all filters to default state |
| **GENERATE RANDOM CHARACTER** | Opens the detail modal for a random filtered character |
| **EXPORT GALLERY MANIFEST (CSV)** | Downloads a CSV of the currently visible character set |

### Main Viewport (Right Panel)

- **Diagnostics Bar**: Live counts for total registry, visible cards, active filters, and current sort mode.
- **Card Grid**: Responsive CSS Grid layout with animated character cards. Each card displays an inline SVG avatar, name, universe, category badges, and three stat progress bars (Power, Agility, Comedy).
- **Detail Modal**: Click any card to open a rich overlay with full character backstory, expanded stats, and metadata.
- **Status Banner**: Contextual system prompts reflecting the current engine state.

---

## Local Setup

```
git clone <repository-url>
cd cartoon-character-gallery
```

Then open `index.html` in any modern web browser:

```
open index.html
```

Or serve locally with any static file server:

```
npx serve .
python -m http.server 8000
```

No build tools, package managers, or server-side runtimes are required.

---

## Technical Constraints

- **Runtime**: Entirely client-side, no external API calls
- **Dependencies**: Zero. No frameworks, libraries, or CDN resources
- **Assets**: All vector graphics are programmatically rendered inline SVGs
- **Compatibility**: Modern browsers with ES6+ support (Chrome, Firefox, Safari, Edge)

---

*Built with botanical precision. No pixels were harmed in the making of this interface.*
