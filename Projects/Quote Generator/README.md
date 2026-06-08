# Quote Generator

A premium dark-theme quote generator built with vanilla HTML5, CSS3, and JavaScript (ES6+).

## Features

- **Async API Pipeline** — Fetches random quotes from [quotable.io](https://github.com/lukePeavey/quotable). Falls back to a curated 10-quote local array if the API is unreachable or rate-limited.
- **Copy to Clipboard** — Formats the quote as `"Quote" — Author` and copies via `navigator.clipboard.writeText()`. Shows a "Copied! ✨" toast notification.
- **Share to X/Twitter** — Opens `twitter.com/intent/tweet` with the quote pre-filled in a new tab.
- **Bookmark Toggle** — Heart icon saves/removes the current quote from a favorites array. Active state shown with red accent.
- **Bookmarks Sidebar** — Slide-out panel listing all saved quotes with author and × delete button. Bookmark count badge in the topbar.
- **localStorage Persistence** — Bookmarks array saved to `localStorage('quote_gen_bookmarks')` on every change, restored on boot.
- **Dark Editorial Aesthetic** — `#05060c` background, serif typography (Georgia), large decorative quotation mark with cyan tint, glassmorphic card, neon cyan category badge.

## Run it

Open `index.html` in any modern browser.
