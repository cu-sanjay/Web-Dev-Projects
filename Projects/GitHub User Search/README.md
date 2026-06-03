# GitHub User Search

A premium, production-grade search dashboard to fetch, display, and cache GitHub developer profiles and recent public repositories. Built entirely on client-side static web standards.

## Run it
Open `index.html` in any modern web browser.

## Features
- **Public API Integration**: Communicates directly with the public GitHub REST API to fetch profiles and repositories in real time.
- **Dynamic Light/Dark Themes**: Workspace toggle using custom variables.
- **Search History Tags**: Saves previous successful searches in `localStorage` as clickable tags for quick access.
- **Robust Error States**: Graceful visual handling of "User Not Found" (404) and "Rate Limit Exceeded" (403) errors.
- **Interactive Metrics**: Shows avatar, bio, join dates, location coordinates, followers, following, and a grid of top 5 public repositories.
- **Responsive Layout**: Designed for mobile, tablet, and desktop dashboards.

## What I learned
- Integrating asynchronous client-side API fetches with loading states.
- Handling REST API limits and errors cleanly.
- Creating modular components without using framework scripts.
