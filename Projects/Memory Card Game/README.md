# Memory Match — Card Quest

A gamified memory match card game built with vanilla HTML, CSS, and JavaScript. Flip cards, find pairs, build combos, level up, and conquer three themed realms.

## Features

- **3D card flipping** — realistic rotate-Y transitions using CSS `perspective` and `preserve-3d`.
- **Two difficulty levels** — Easy (4×4, 8 pairs) and Medium (6×4, 12 pairs).
- **Three themed realms** — Cosmos (cyan/purple), Feast (amber/red), Cyber (neon green/blue) — each with unique color palettes, particle effects, and card designs.
- **Level & XP system** — Earn XP for each match; level up every 500 XP. Ranks progress from Bronze → Silver → Gold → Platinum → Diamond.
- **Combo streak scoring** — Consecutive matches multiply your score (+25 bonus per streak level, capped at +125). Visual combo meter fills as your streak grows.
- **Floating score popups** — Match points animate upward from the card with a physics-based float effect.
- **Screen shake** — The board shakes on mismatches with card-specific red flash and shudder animation.
- **Achievement toasts** — Unlockable toast notifications for milestones (First Blood, Combo x3, Combo x5, Halfway There, Speed Demon).
- **Star rating** — Earn 1–3 stars on victory based on your move efficiency.
- **Confetti celebration** — 70-piece geometric confetti rain on game completion.
- **Staggered card deploy** — Cards animate into the grid with 3D rotation and scale bounce on each new game.
- **Personal best persistence** — Lowest move count saved per difficulty in `localStorage`.
- **Level persistence** — Player level is saved across sessions via `localStorage`.
- **Particle background** — Theme-aware canvas particle system with glow orbs that drift in the background.
- **Responsive design** — Fluid layout from 320px phones to widescreen desktops.
- **Keyboard and screen-reader friendly** — Semantic HTML with ARIA attributes.

## How to play

1. Select a **Difficulty** and **Realm** from the control bar.
2. Click any card to flip it and reveal its symbol.
3. Click a second card — if they match, they stay face-up and you earn points + XP.
4. If they don't match, both cards flip back after a brief shake.
5. Clear the entire board to win and see your star rating.

### Scoring

| Action | Points |
|--------|--------|
| Base match | 100 |
| Streak bonus (per consecutive match) | +25 (up to +125) |
| Max single match | 225 |

### Star thresholds

- ★★★ — Moves ≤ number of pairs
- ★★  — Moves ≤ pairs × 1.8
- ★   — Everything else

## Run it

Open `index.html` in any modern browser. No build tools or servers required.

## Project structure

```
Projects/Memory Card Game/
├── index.html       # Semantic markup
├── style.css        # Full gamified theme with 3D transforms
├── script.js        # Game engine, particles, achievements, scoring
├── project.json     # Repository metadata
└── README.md        # This file
```

## What it shows

- CSS 3D transforms (`transform-style: preserve-3d`, `backface-visibility: hidden`) for realistic card flips.
- Canvas-based particle system with theme-aware color palettes.
- State-machine game loop with click locking, match/mismatch resolution, and end-game conditions.
- `localStorage` persistence for best scores and player level.
- Staggered CSS animation timing via `nth-child` selectors.
- Pure CSS glassmorphism, neon glows, and gradient text effects.
- Responsive grid layout with `aspect-ratio: 1/1` to maintain square cards.

## Credits

Built by **Web Dev Projects** for the [Web-Dev-Projects](https://github.com/cu-sanjay/Web-Dev-Projects) open-source repository.
