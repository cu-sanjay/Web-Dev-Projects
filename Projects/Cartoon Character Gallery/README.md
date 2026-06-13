# Cartoon Character Gallery

A neon-themed gallery of 12 iconic cartoon characters with real-time filtering, perspective-depth card hover micro-interactions, and a detailed side drawer modal — all vanilla HTML5/CSS3/JS.

## Features

- **12 Pre-Seeded Characters** — SpongeBob, Naruto, Rick Sanchez, Bugs Bunny, Eren Yeager, Finn the Human, Tom & Jerry, Leela, Goku, Scooby-Doo, Morty Smith, Dexter.
- **Filter Chips** — "All Universes", "90s Nostalgia", "Modern Anime", "Sci-Fi Cartoons" with live card tally.
- **Live Search** — Instant text matching across names and bios via lowercase string comparison.
- **Card Hover Effects** — `translateY(-8px) scale(1.02) rotateX(2deg)` with spring-easing `cubic-bezier(0.175, 0.885, 0.32, 1.275)` and glow shadows.
- **Detail Drawer** — Modal with avatar, catchphrase in neon italic, bio, role, and universe; closes on Escape / backdrop click.
- **Not Found State** — Glowing neon placeholder when no results match.

## UI/UX

Dark terminal (`#05060b`), glassmorphic grid cards, neon cyan accents, `auto-fill` responsive grid → single column on mobile.

## Usage

Open `index.html`. Browse the gallery, use filter chips or search bar, click any card for the full bio drawer.
