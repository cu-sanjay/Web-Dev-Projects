# Nature Explorer Map

An interactive world ecosystem exploration platform. Discover forests, deserts, mountains, oceans, wetlands, grasslands, and polar regions through an immersive map-based interface.

## Interactive Map Features

- **SVG World Map** — stylized continent outlines with latitude/longitude grid
- **Clickable Ecosystem Markers** — 18 locations across all major ecosystems
- **Hover Effects** — marker labels and glow animations
- **Zoom Controls** — smooth zoom in/out with keyboard support
- **Day/Night Theme** — toggle between dark and light modes
- **Search & Filter** — live filtering by ecosystem type and location name

## Ecosystem Categories

| Ecosystem | Locations |
|-----------|-----------|
| Forests | Amazon Rainforest, Congo Rainforest, Black Forest, Daintree Rainforest |
| Deserts | Sahara Desert, Arabian Desert, Gobi Desert, Atacama Desert |
| Mountains | Himalayas, Andes, Rocky Mountains, Alps |
| Oceans | Pacific Ocean, Atlantic Ocean, Indian Ocean, Arctic Ocean |
| Wetlands | Pantanal, Everglades |
| Polar Regions | Antarctica, Arctic Circle Region |

## Exploration Mechanics

1. **Click a marker** on the world map to discover a location
2. **View the information card** with hero image, stats, wildlife, facts, and environmental importance
3. **Track progress** in the statistics dashboard (locations, ecosystems, continents, completion %)
4. **Monitor activity** in the exploration feed
5. **Earn achievements** as you explore (first discovery, ecosystem mastery, continent explorer, etc.)
6. **Bookmark locations** for quick reference
7. **Compare ecosystems** side by side
8. **Test your knowledge** with the ecosystem quiz challenge
9. **View biodiversity rankings** of all locations
10. **Review your history** in the exploration timeline

## Data Structure

Each location in the ecosystem database contains:
- `id`, `name`, `ecosystem` type, `continent`
- `lat`/`lng` map coordinates
- `area`, `climate`, `biodiversity` score (0–100)
- `wildlife` array of representative species
- `facts` array of scientific facts
- `importance` description of ecological significance

## Advanced Features

- Ecosystem discovery achievements (10 unlockable badges)
- Location bookmarking with visual indicators
- Exploration history timeline
- Continent coverage tracker
- Biodiversity rankings
- Ecosystem comparison mode
- Day/night map theme toggle
- Random nature fact generator
- Ecosystem quiz challenge (10 questions per round)
- localStorage progress persistence

## Accessibility

- Keyboard navigation (Enter/Space to select markers)
- ARIA labels on interactive elements
- Focus indicators with `:focus-visible`
- High contrast mode support (`prefers-contrast`)
- Reduced motion support (`prefers-reduced-motion`)
- Semantic HTML structure
- Screen reader announcements via `aria-live` regions

## Responsive Design

- **Desktop** (1025px+) — side-by-side panel layout
- **Tablet** (769–1024px) — condensed panels, 2-column stats
- **Mobile** (480–768px) — stacked panels, compact controls
- **Small Mobile** (<480px) — minimal UI with icon-only action bar

## Local Deployment

Open `index.html` in any modern browser. No build tools, dependencies, or server required.

## Tech Stack

- **HTML** — semantic markup with ARIA accessibility
- **CSS** — CSS Grid, glassmorphism, custom properties, responsive design
- **JavaScript** — vanilla JS, SVG manipulation, localStorage API
