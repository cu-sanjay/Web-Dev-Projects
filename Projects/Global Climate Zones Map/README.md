# Global Climate Zones Map

An interactive climate science platform that visualizes Earth's major climate zones, provides educational insights into environmental conditions, supports dynamic overlay exploration, and helps users understand global climate patterns through immersive geographic visualization.

## Climate Zone Classification

The application covers five major climate zones:

- **Tropical** — Hot and humid year-round with abundant rainfall. Includes Amazon Basin, Congo Basin, Indonesia, and Southeast Asia.
- **Desert** — Extreme temperatures with minimal precipitation. Includes Sahara, Arabian Desert, Gobi Desert, and Australian Outback.
- **Temperate** — Four distinct seasons with moderate rainfall. Includes Europe, Eastern USA, China, and New Zealand.
- **Polar** — Extreme cold with permanent ice sheets. Includes Antarctica, Greenland, and Arctic Circle.
- **Mountain** — Altitude-driven climate zones with rapid weather changes. Includes Himalayas, Andes, Alps, and Rocky Mountains.

## Interactive Map Features

- **SVG World Map** — Simplified continent outlines with 20 clickable climate regions
- **Zone Filtering** — Filter the map to show only selected climate zones
- **Region Selection** — Click any region to view detailed climate intelligence
- **Dynamic Toolbar** — Shows active zone, region, temperature, and category information
- **Visual Legend** — Color-coded legend matching climate zone colors

## Climate Overlay System

Toggle between five data visualization layers:

1. **Temperature** — Horizontal gradient bands showing global heat distribution with equator line
2. **Rainfall** — Blue/yellow regions indicating precipitation intensity
3. **Vegetation** — Green/brown zones showing forest density and land cover
4. **Population** — Red circles representing human settlement density
5. **Biodiversity** — Purple regions indicating species richness and ecosystem diversity

## Educational Learning Features

- **Region Detail Modal** — Comprehensive climate data including temperature, rainfall, humidity, growing season, vegetation, wildlife, and environmental importance
- **Climate Facts** — 3-5 unique facts per region with historical and scientific context
- **Random Fact Generator** — Press 'R' or click the fact button for curated climate science facts
- **Quiz System** — Test your knowledge with 15 multiple-choice climate questions
- **Feed Log** — Real-time activity feed tracking exploration progress

## Data Structure

- 20 climate regions across 5 zones
- Each region stores: name, zone, continent, coordinates, temperature, rainfall, humidity, growing season, vegetation, wildlife, importance, and 4-5 facts
- Overlay datasets: 8 temperature zones, 11 rainfall zones, 13 vegetation zones, 12 population centers, 10 biodiversity zones
- 15 quiz questions with detailed educational answers
- 20 general climate facts

## Advanced Features

- **Seasonal Visualization Mode** — Toggle to simulate seasonal effects on climate data
- **Region Comparison Tool** — Compare any two regions side-by-side across 7 metrics
- **Climate Change Scenario Simulator** — Explore 5 scenarios from pre-industrial to +3°C warming
- **Bookmark System** — Save and manage favorite regions (press 'B')
- **Export as JSON** — Download exploration progress and data
- **Achievement System** — 13 achievements tracking exploration, quizzes, bookmarks, and more
- **LocalStorage Persistence** — All progress saved automatically

## Accessibility Features

- Keyboard navigation with ARIA labels and roles
- Screen reader compatible with semantic HTML
- High contrast mode support (`prefers-contrast: high`)
- Reduced motion support (`prefers-reduced-motion: reduce`)
- Focus-visible indicators for keyboard users
- Escape key to close all modals
- 'R' key for random climate facts

## Local Deployment Guide

1. Ensure all six files are in the same directory:
   - `index.html`
   - `style.css`
   - `script.js`
   - `thumbnail.svg`
   - `project.json`
   - `README.md`
2. Open `index.html` in any modern web browser
3. No build tools, servers, or dependencies required

## Browser Support

Chrome, Firefox, Safari, Edge — all modern browsers supported.

## Author

- **Girish Madarkar** / Girish0902
