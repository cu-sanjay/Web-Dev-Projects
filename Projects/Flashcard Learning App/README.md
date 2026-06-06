# Flashcard Learning App

A highly interactive and modern web-based **Flashcard Learning Platform** designed to help users create, organize, revise, and memorize concept cards across multiple subjects. 

Featuring realistic 3D flipping effects, multiple study modes (Quiz and Timed Practice), custom category builders, keyboard navigation controls, gamified achievements, and study performance progress charts.

## 🚀 Key Features

*   **centralized Study Dashboard**: Overview of revision stats (cards studied, mastery percentage, streak counter, and current milestone badges).
*   **Flashcard Creator (CRUD)**: Create cards with custom questions/answers, edit content, assign categories, delete cards, and toggle mastery labels.
*   **Category Management System**: Create custom learning topics (e.g. JavaScript, History, Science) with personalized accent color categories.
*   **Realistic 3D Flashcard Flip**: Modern CSS 3D perspective animations that simulate natural flipping card interactions.
*   **Interactive Study Modes**:
    *   *Shuffle/Practice Mode*: Browse deck next/previous, shuffle order, and mark cards as "Mastered".
    *   *Quiz Mode*: Self-grade your answers as "Got it right" or "Need study" to record diagnostic stats.
    *   *Timed Revision*: Challenge yourself with count-down review limits.
*   **Keyboard Navigation Binds**: Smooth keyboard accessibility to slide decks and reveal answers quickly.
*   **Gamified Rewards**: Unlocked achievement badges based on learning milestones (e.g., studying 10 cards, achieving 100% mastery, logging streaks).
*   **Native Progress Charts**: Clean visualizations rendered on HTML5 Canvas representing mastery rate, category card counts, and revision session logs.
*   **Data IO**: Import and export your flashcards deck as JSON files. Full data persistence using `localStorage`.

## ⌨️ Keyboard Shortcuts

*   `Alt + D`: Switch to **Dashboard**
*   `Alt + R`: Switch to **Review Cards**
*   `Space` / `Alt + F`: **Flip Card** (Reveal front/back)
*   `ArrowRight` / `Alt + N`: **Next Card**
*   `ArrowLeft` / `Alt + P`: **Previous Card**
*   `Alt + M`: Mark current card as **Mastered**
*   `Alt + L`: Toggle Light / Dark Theme

## 🛠️ Technology Stack

*   **Structure**: Semantic HTML5 markup
*   **Styling**: Vanilla CSS3 (3D Transform Perspective, HSL vars, flex/grid systems)
*   **Scripting**: Vanilla JS (ES6+ state control, Web Audio API ticking, Canvas API analytics rendering, Key event listeners)

## 📦 File Structure

```
Flashcard Learning App/
├── index.html       # Platform structures and study frames
├── style.css        # Glassmorphic dashboard styles & 3D flip effects
├── script.js        # Study modes state, key binds & canvas graphs
├── project.json     # Project configuration file
├── thumbnail.svg    # Dashboard icon preview vector graphic
└── README.md        # User documentation
```

## 🚀 How to Run

1. Clone or download the repository.
2. Locate the folder `Projects/Flashcard Learning App/`.
3. Double-click `index.html` to launch the platform in any web browser.
