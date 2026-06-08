# Quiz Master

A multi-category quiz application built with vanilla HTML5, CSS3, and JavaScript (ES6+).

## Features

- **Multi-Category Dashboard** — Science, Technology, and Mathematics topics presented as interactive cards with question count and high score display.
- **15s Question Timer** — Synchronized countdown clock with fluid CSS progress bar that shrinks to zero. Expired questions auto-reveal the correct answer and advance.
- **Tamper-Proof Input Locking** — The instant an option is clicked, all buttons are disabled. No double-click scoring exploits.
- **Instant Feedback** — Correct selections highlight emerald green; incorrect selections highlight crimson red with a feedback banner explaining the right answer.
- **Per-Category High Scores** — Lifetime best scores cached in `localStorage('quiz_master_highs')`. New records trigger a "⭐ New Record!" badge.
- **Summary Modal** — Full-screen overlay showing points, correct/incorrect counts, accuracy percentage, and high score.
- **Cyberpunk Exam Console** — `#05070c` background, glassmorphic cards, neon cyan timer/progress, emerald correct / crimson incorrect states, spring-easing interactions.

## Run it

Open `index.html` in any modern browser.
