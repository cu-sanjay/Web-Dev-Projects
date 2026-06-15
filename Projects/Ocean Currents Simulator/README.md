# Ocean Currents Simulator

An interactive oceanographic visualization platform that simulates major global ocean currents through animated flow systems, climate impact modeling, dynamic current controls, and educational marine science insights.

## Ocean Current Fundamentals

The application visualizes 13 major ocean currents across 4 ocean basins:

| Basin | Currents |
|-------|----------|
| **Atlantic Ocean** | Gulf Stream, North Atlantic Drift, Canary Current, Labrador Current |
| **Pacific Ocean** | Kuroshio Current, California Current, Peru Current, North Pacific Drift |
| **Indian Ocean** | Agulhas Current, West Australian Current, Monsoon Current |
| **Polar Regions** | Antarctic Circumpolar Current, Arctic Surface Currents |

## Climate Influence Mechanisms

Each current includes four climate impact categories:

- **Temperature Influence** — coastal warming/cooling effects
- **Rainfall Effects** — precipitation patterns, monsoon support, drought influence
- **Storm Formation** — hurricane/cyclone development, weather pattern changes
- **Biodiversity Impact** — fish migration, coral health, nutrient transport, marine productivity

## Current Classification System

| Type | Color | Examples |
|------|-------|----------|
| **Warm** | Orange (#f97316) | Gulf Stream, Kuroshio, Agulhas |
| **Hot** | Red (#ef4444) | Extreme warm currents |
| **Cool** | Light Blue (#38bdf8) | California, Peru, Canary |
| **Cold** | Dark Blue (#2563eb) | Labrador, Antarctic Circumpolar |

## Simulation Controls

- **Current Speed** — adjust flow velocity (0–100%)
- **Water Temperature** — set temperature parameter (-2°C to 32°C)
- **Flow Intensity** — control particle density and arrow count
- **Animation Speed** — adjust particle and arrow animation rate (1–10x)
- **Climate Toggles** — enable/disable temperature, rainfall, storm, and biodiversity effects
- **Heatmap Overlay** — visual speed intensity map

## Visualization Architecture

- **Animated Current Paths** — SVG paths with color-coded stroke widths
- **Flow Particles** — dynamic particle system with hardware-accelerated transforms
- **Directional Arrows** — animated arrowheads flowing along current paths
- **Real-time Updates** — instant response to slider and toggle changes

## Advanced Features

- Ocean basin comparison mode
- Current speed heatmap overlay
- Oceanography quiz (15 questions, randomized 10 per round)
- Simulation data export as JSON
- Interactive climate intelligence cards
- Exploration history timeline
- Random ocean fact generator
- localStorage user preferences

## Accessibility

- Full keyboard navigation
- ARIA labels on all controls
- Screen reader announcements via aria-live regions
- High contrast mode support (prefers-contrast)
- Reduced motion support (prefers-reduced-motion)
- Focus-visible indicators throughout

## Responsive Design

- **Desktop** (1025px+) — full two-panel dashboard with detailed controls
- **Tablet** (769–1024px) — condensed panels, reduced sidebar width
- **Mobile** (480–768px) — stacked panels, compact controls
- **Small Mobile** (<480px) — minimal UI with icon-only action bar

## Local Deployment

Open `index.html` in any modern browser. No build tools, servers, or dependencies required.

## Tech Stack

- HTML5 (semantic, ARIA-accessible)
- CSS3 (custom properties, CSS grid, glassmorphism, animations, responsive)
- JavaScript (vanilla ES module pattern, SVG manipulation, requestAnimationFrame, localStorage API)
