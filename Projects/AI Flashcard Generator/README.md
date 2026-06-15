# AI Flashcard Generator

An interactive, premium client-side study dashboard that creates custom Q&A flashcard decks from loose study notes, reviews card sets using 3D flipping card mechanics, and evaluates long-term retention tracking saved persistently in browser local storage.

## Features

- **3D Flipping Card Arena**: CSS perspective-based 3D rotations triggered on card click to flip card between Front (Question/Term) and Back (Answer/Definition).
- **Client-Side Q&A Notes Parser**: Generates flashcard datasets dynamically by parsing text notes for delimiters like `Q: A`, `Term - Definition`, or raw bullet points.
- **Decks & Cards Editor**: Add, edit, or delete customized decks and cards manually, and organize them into study modules.
- **Mastery Tracker**: Rate cards as "Mastered" or "Review Needed" to re-calculate stats telemetry, progress bars, and track streaks.
- **Premium UI & Dark Mode**: Sleek glassmorphic card bodies, glowing indicator panels, and fully responsive elements.

## Run it

Open `index.html` in any modern browser.

## What it shows

- Creating 3D card flipping CSS transforms.
- Regular expression parsing mapping text logs to structures.
- Local storage lists syncing card deck updates and streaks.
- Accessible form fields supporting keyboard inputs.
