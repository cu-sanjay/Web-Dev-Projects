# Endangered Species Hotspot Map

An interactive wildlife conservation intelligence platform that visualizes global endangered species hotspots, enables filtering by species category, displays population trends, highlights conservation efforts, and educates users about biodiversity protection through an immersive map-based experience.

## Conservation Intelligence Features

- **Interactive SVG World Map** — stylized continents with biodiversity heat zones
- **19 Endangered Species** — mammals, birds, reptiles, marine species, and more
- **Live Search & Filter** — by species name, scientific name, region, or habitat
- **Category Filters** — mammals, birds, reptiles, amphibians, marine species, insects
- **Threat Level Monitor** — Low Risk, Vulnerable, Endangered, Critically Endangered
- **Conservation Dashboard** — real-time statistics and progress tracking
- **Biodiversity Heatmap** — toggleable risk zone overlay
- **Population Trend Visualization** — historical vs. current with recovery indicators
- **Threat Analysis** — visual percentage bars for each threat factor

## Endangered Species Categories

| Category | Species |
|----------|---------|
| **Mammals** | Bengal Tiger, Snow Leopard, Giant Panda, Orangutan, Black Rhino, African Wild Dog, Mountain Gorilla, Ethiopian Wolf, Red Wolf, Golden Lion Tamarin, Koala, Tasmanian Devil, Polar Bear |
| **Birds** | California Condor, Emperor Penguin |
| **Reptiles** | Hawksbill Sea Turtle |
| **Marine** | Amazon River Dolphin, Blue Whale, Vaquita |

## Hotspot Mapping System

18 locations across 7 regions (Asia, Africa, North America, South America, Australia, Oceans, Polar) with interactive SVG markers that highlight on hover and open detailed species information cards on click.

## Threat Assessment Methodology

Each species includes 5 key threat factors with percentage ratings based on IUCN data:
- Habitat Loss, Climate Change, Poaching, Human Conflict, Pollution, and more
- Visual color-coded bars (red ≥ 80%, amber ≥ 60%, orange ≥ 40%, green < 40%)

## Population Trend Analytics

Interactive bar charts show population changes over 7 decades:
- Historical baselines from 1900–1950
- Critical decline periods
- Current recovery trends
- Color-coded: green for recovery, red for continued decline

## Advanced Features

- **Biodiversity Heatmap Mode** — visual risk zone overlay on the world map
- **Species Comparison Tool** — side-by-side comparison of any two species
- **Conservation Success Stories** — 5 recovery stories with data highlights
- **Threat Severity Ranking** — real-time threat level monitor
- **Wildlife Quiz Challenge** — randomized 10-question conservation quiz
- **Protected Area Explorer** — conservation program tracking per species
- **Region Bookmarking** — save favorite species for quick access
- **Exploration Achievement System** — 10 unlockable badges
- **Random Species Fact Generator** — 12 unique conservation facts
- **localStorage Progress Persistence** — all progress saved automatically

## Accessibility

- Full keyboard navigation (Enter/Space to select, Escape to close)
- ARIA labels on all interactive elements
- `aria-live` regions for screen reader announcements
- High contrast mode via `prefers-contrast` media query
- Reduced motion support via `prefers-reduced-motion`
- Focus-visible indicators throughout

## Responsive Design

- **Desktop** (1025px+) — full two-panel dashboard
- **Tablet** (769–1024px) — condensed stats and controls
- **Mobile** (480–768px) — stacked panels, compact UI
- **Small Mobile** (<480px) — icon-only action bar

## Local Deployment

Open `index.html` in any modern browser. No build tools, servers, or dependencies required.

## Tech Stack

- HTML (semantic, ARIA-accessible)
- CSS (custom properties, grid, glassmorphism, responsive)
- JavaScript (vanilla ES module pattern, SVG manipulation, localStorage API)
