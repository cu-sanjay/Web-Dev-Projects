# Space Shooter

A synthwave space shooter built with HTML5 Canvas and vanilla JavaScript.

## Features

- Multi-axis ship controls via Arrow/WASD keys, mouse, or touch drag.
- Plasma laser stream with rapid-fire throttle (Space / click / tap).
- Procedural enemy waves with basic (1 HP) and tank (2 HP) variants.
- Independent enemy firing AI with downward energy bolts.
- AABB collision detection across three array pairs (lasers vs enemies, enemy bullets vs player, enemy ships vs player).
- Shield health system with screen shake and red flash on damage.
- Parallax starfield background with 80 drifting stars.
- Progressive difficulty: wave multiplier, spawn rate, and enemy fire rate ramp every 100 points.
- Floating score popups and particle explosion effects.
- All-time best score via `localStorage`.

## Run it

Open `index.html` in any modern browser.
