# Interview Preparation Hub

Interview Preparation Hub is a browser-only, offline-capable dashboard for technical and HR interview preparation.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- LocalStorage
- Font Awesome CDN
- Google Fonts (Poppins)

## Features

- Dashboard with preparation stats and daily interview question
- HR Questions section with search, bookmark, complete, and status filter
- Technical Questions section with category/status filters, search, bookmark, and complete
- Notes manager with create, edit, delete, and search
- Resources manager with support for:
  - YouTube videos (auto-thumbnail from video ID)
  - YouTube playlists (manual title + optional custom thumbnail)
  - Articles and documentation links
- Progress tracker with category sliders, bars, and overall completion indicator
- Mock interview practice with random question generator, timer (2/5/10 min), answer capture, and history
- Settings for dark/light mode and full data reset (with confirmation modal)
- Global search across questions, notes, and resources

## LocalStorage Keys

- `notes`
- `bookmarkedQuestions`
- `completedQuestions`
- `resources`
- `progress`
- `theme`
- `dailyQuestion`
- `mockInterviewHistory`
- `streakData`

## Run

Open `index.html` directly in a browser. No backend or build tool is required.

## Project Structure

```
Interview Preparation Hub/
├── index.html
├── style.css
├── script.js
├── README.md
├── project.json
└── assets/
    ├── icons/
    └── images/
```
