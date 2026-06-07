# Color Catcher

A neon arcade color-matching game built with HTML5 Canvas and vanilla JavaScript.

## Features

- Horizontal catcher controlled by Arrow keys / WASD / mouse / touch.
- Cycle catcher color (Pink / Cyan / Yellow) with Spacebar or click.
- Falling colored circles with gravity physics and procedural spawning.
- AABB collision detection with color-matched scoring and wrong-catch penalties.
- Combo multiplier system (streak resets on mismatch or miss).
- Progressive difficulty: gravity and spawn rate ramp every 50 points.
- Splash particle effects on successful catches, flash overlay on misses.
- Persistent best score via `localStorage`.

## Run it

Open `index.html` in any modern browser.
