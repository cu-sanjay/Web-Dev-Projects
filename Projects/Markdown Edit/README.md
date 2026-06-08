# Markdown Edit

A premium dark-theme Markdown editor with live preview, built with vanilla HTML5, CSS3, and JavaScript (ES6+).

## Features

- **Live Tokenizer Engine** — Custom RegExp-based parser built with native string methods. No external dependencies.
  - Headings (`#` → `<h1>` through `####` → `<h4>`)
  - Inline emphasis (`**bold**`, `*italic*`)
  - Unordered and ordered lists (`-` / `1.`)
  - Hyperlinks (`[text](url)`)
  - Code blocks (triple backticks → `<pre><code>`)
  - Inline code (backtick → `<code>`)
  - Blockquotes (`>`), horizontal rules (`---`), paragraphs
- **XSS Sanitization** — All raw input is HTML-entity-escaped (`& < > " '`) before parsing to neutralise `<script>`, `onerror`, etc.
- **Smart Toolbar** — Bold, Italic, Link, Code Block buttons wrap selected text with markdown syntax. Clear and Export (.md) actions included.
- **Keyboard Shortcuts** — `Ctrl+B` (bold), `Ctrl+I` (italic), `Ctrl+K` (link).
- **Auto-Save** — Draft automatically persisted to `localStorage` on every keystroke, restored on load.
- **Status Bar** — Live word count and line count.
- **Dark IDE Aesthetic** — `#05070c` background, split-pane grid layout, monospace input, styled preview with neon cyan links and amber code highlights.

## Run it

Open `index.html` in any modern browser.
