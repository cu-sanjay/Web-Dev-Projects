# Flashcard Learning App

A 3D flashcard study app built with vanilla HTML5, CSS3, and JavaScript (ES6+).

## Features

- **Hardware-Accelerated 3D Card Flipping** — CSS `perspective: 1000px`, `transform-style: preserve-3d`, and `backface-visibility: hidden` drive smooth Y-axis rotation. Flip by clicking the card, the Flip button, or pressing Space.
- **Decoupled State Matrix** — All cards stored in a `cards` array of `{ id, question, answer }`. Navigation (Previous/Next with arrow keys or buttons), progress bar, and stats are all derived from state.
- **Add / Delete Cards** — Modal form with sanitization (HTML-entity escaping) and empty-field validation. Each card row in the drawer includes a delete button.
- **Progress Tracking** — Current index, percentage bar, and card count update on every navigation.
- **Persistent Storage** — Deck saved to `localStorage('flashcard_deck')`. A 4-card Computer Science sample deck is loaded as fallback if storage is empty.
- **Slide-Out Drawer** — Lists all cards with delete controls; highlights the active card.
- **Dark Research Hub Aesthetic** — `#05070c` background, glassmorphic card faces (`backdrop-filter`), neon cyan progress bar and accent lines.

## Run it

Open `index.html` in any modern browser.
