# Markdown Live Editor

A text compilation suite with a custom regex-based Markdown-to-HTML parsing engine, live split-view preview, toolbar token injection at cursor position, Blob URL file export, document telemetry, and blueprint template injection.

## Features

### Custom Regex Markdown Parser
No external libraries — pure regex transformations:

| Markdown | HTML | Regex |
|---|---|---|
| `# Heading` | `<h1>` | `^# (.*)$` |
| `## Heading` | `<h2>` | `^## (.*)$` |
| `**bold**` | `<strong>` | `\*\*(.*?)\*\*` |
| `*italic*` | `<em>` | `\*(.*?)\*` |
| `` `code` `` | `<code>` | `` `([^`]+)` `` |
| `` ``` ``` `` | `<pre><code>` | fenced block |
| `> quote` | `<blockquote>` | `^> (.*)$` |
| `- item` | `<li>` in `<ul>` | `^[-*] (.*)$` |
| `1. item` | `<li>` in `<ol>` | `^\d+\. (.*)$` |
| `[link](url)` | `<a>` | `\[...\]\(...\)` |
| `![alt](url)` | `<img>` | `!\[...\]\(...\)` |

### Live Split-View
- Left: Raw Markdown Input Stream (`<textarea>`)
- Right: Live HTML Compiled Preview Viewport (styled with serif/sans-serif fonts, colored headings, gold bold, purple italic, green code)

### Toolbar Tokens
| Button | Inserts at Cursor |
|---|---|
| Inject Heading Shorthand | `## Heading` |
| Inject Bold Code Token | `**bold text**` |
| Inject Codeblock Marker | `` ``` // code ``` `` |

### File Export
Select from dropdown:
- **Export as .md** — raw markdown content, `text/markdown` MIME
- **Export as .html** — full HTML document with embedded styles, `text/html` MIME
- Downloads via `URL.createObjectURL(new Blob([content], {type}))` — zero network overhead

### Telemetry Dashboard
| Metric | Source |
|---|---|
| Character Length | `text.length` |
| Word Count | `split(/\s+/).length` |
| Paragraph Count | `split(/\n\s*\n/)` blocks |
| Read Time | `ceil(words / 200)` seconds |
| Compilation Badge | `PARSER STABILIZED: HTML GRAPH GENERATED` |

## Controls

| Action | Function |
|---|---|
| Execute Global Token Check | Recompile markdown to HTML |
| Inject Complex Blueprint Template | Load multi-section document with headers, lists, code blocks |
| Flush Layout Channels | Clear input, preview, telemetry |

---

## File Structure

```
├── index.html    Layout — toolbar, markdown textarea, preview viewport, telemetry, admin footer
├── style.css     Dark IDE — styled h1/h2 in cyan, strong in gold, em in purple, code in green, blockquote styling
├── script.js     Engine — ~20 regex rules, cursor injection, Blob URL download, telemetry math, blueprint
├── README.md     This file
└── project.json  Project metadata
```

Open `index.html` in any browser.
