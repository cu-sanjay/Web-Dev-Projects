# URL Shortener UI Simulator

An interactive, modern, and client-side **URL Shortener UI Simulator** workspace. It simulates the end-to-end functionality of a link shortening service entirely on the client, helping users learn how URL hash redirection works.

Featuring format validations, custom short link overrides, clipboard copying alerts, simulated click logs, and native HTML5 Canvas analytics.

## 🚀 Key Features

*   **Dashboard metrics Overview**: Real-time stats showing total links generated, total simulated clicks, top-performing shortened URLs, and recent logs.
*   **URL Shortener Engine**:
    *   Input validations checking for valid URL format headers.
    *   Generate random unique 6-character short hashes.
    *   Support custom overrides (e.g. shortening `https://google.com` to `shrt.lnk/custom`).
*   **simulated Link Redirection**: Click on any generated link inside the history table to open a simulated modal "redirecting" you to the target destination, incrementing click counters in real-time.
*   **Registry & History logs**: Clean table lists showing original/short URLs, generated timestamps, click counts, search keyword queries, and delete/clear buttons.
*   **Study Analytics Dashboard**: Direct Canvas chart rendering showing:
    *   Shortening timeline trend (number of links created).
    *   Total click comparisons per link (bar graph).
    *   Domain categorizations breakdown (pie chart).
*   **Theme Engine**: Smooth toggles between glassmorphic dark mode and clean light mode.
*   **Data IO**: Import and export your links database as JSON files. Full data persistence using `localStorage`.

## ⌨️ Keyboard Shortcuts

*   `Alt + D`: Navigate to **Dashboard**
*   `Alt + S`: Navigate to **Shorten Link**
*   `Alt + H`: Navigate to **Links History**
*   `Alt + A`: Navigate to **Analytics Panel**
*   `Alt + L`: Toggle Light / Dark Theme

## 🛠️ Technology Stack

*   **Structure**: HTML5 layout markup
*   **Styling**: Vanilla CSS3 (HSL custom properties, flex/grid systems, animated toast alerts)
*   **Scripting**: Vanilla JS (ES6+ state control, DOM renders, Clipboard API, Canvas API)

## 📦 File Structure

```
URL Shortener UI Simulator/
├── index.html       # Platform structures and routing frames
├── style.css        # Glassmorphic themes & notification visual styling
├── script.js        # Form validation, simulated clicks, and canvas charts
├── project.json     # Project configuration file
├── thumbnail.svg    # Dashboard vector preview graphic
└── README.md        # User documentation
```

## 🚀 How to Run

1. Clone or download the repository.
2. Locate the folder `Projects/URL Shortener UI Simulator/`.
3. Double-click `index.html` to launch the platform in any web browser.
