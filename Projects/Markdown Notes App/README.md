# Markdown Notes App

A clean, modern, and client-side **Markdown Notes App** writing workspace. It allows users to write notes using Markdown syntax and instantly view the formatted output.

Featuring a split-pane layout, real-time Markdown parsing, formatting toolbar shortcuts, note categorization with tags/categories, keyword searching, interactive study analytics charts, and seamless local data persistence.

## 🚀 Key Features

*   **Clean Writing Environment**:
    *   Split-pane layout: Write markdown on the left, view live rendered HTML preview on the right.
    *   Toggle views: Split view, Editor-only (Zen Mode), or Preview-only.
    *   Formatting toolbar: Insert markdown tags with a click (Headers, Bold, Italic, Code, Link, List, Table templates).
*   **Custom Markdown Parser**:
    *   A robust, safe regex-based client-side parser converting headers (`#` to `######`), emphasis (`**`, `*`, `_`, `__`), code blocks, inline code, links, list items, blockquotes, and tables to sanitised HTML output.
*   **Organization & Search**:
    *   Categorize notes by main folder/category and attach dynamic tag arrays.
    *   Instant search filtering by note titles, body texts, or tags.
    *   Sidebar lists featuring quick deletions, new note creations, and draft tracking.
*   **Data Analytics Dashboard**:
    *   Stats overview (total notes, word counts, average reading times).
    *   Canvas-based visualisations (pie chart of notes per category, tag distribution charts).
*   **Theme Engine**: Smooth transitions between a futuristic dark glassmorphic design and a clean light mode.
*   **Data Portability**: Full JSON backup exports & local file imports. Entire database persists automatically in `localStorage`.

## ⌨️ Keyboard Shortcuts

*   `Alt + N`: Create a new note
*   `Alt + S`: Save note draft manually
*   `Alt + T`: Toggle Light / Dark Theme
*   `Alt + E`: Switch to Editor-only view (Zen Mode)
*   `Alt + P`: Switch to Preview-only view
*   `Alt + V`: Switch to Split view

## 🛠️ Technology Stack

*   **Structure**: Semantic HTML5 markup
*   **Styling**: Vanilla CSS3 (HSL themes, CSS grid/flex, glassmorphic filters, keyframe transitions)
*   **Scripting**: Vanilla JS (ES6+ array/string handlers, regex-based Markdown parsing engine, HTML5 Canvas API)

## 📦 File Structure

```
Markdown Notes App/
├── index.html       # Sidebar lists, split-pane layout structure
├── style.css        # Glassmorphic themes and markdown visual stylesheet
├── script.js        # Markdown parsing engine, CRUD, search, and canvas analytics
├── project.json     # Project configuration metadata
├── thumbnail.svg    # Visual vector icon for the dashboard index
└── README.md        # Technical usage manual
```

## 🚀 How to Run

1. Locate the folder `Projects/Markdown Notes App/`.
2. Double-click `index.html` to launch the application in any modern web browser. No local compilation, build processes, or node servers required.
