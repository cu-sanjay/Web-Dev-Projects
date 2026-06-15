# Markdown Documentation Studio

An interactive client-side markdown editor and previewer designed to write documentation. It features a split-pane layout, real-time custom Markdown compile engine, live Table of Contents indexer, document statistics, multiple preview themes (GitHub Light, GitBook Dark, Solarized), and exports.

## Features

- **Real-Time Split View Compiler**: Write raw markdown in the editor and watch HTML translate instantly in the preview panel.
- **Custom Markdown Parsing Engine**: Compiles standard headers (`#` to `####`), bold/italic formatting (`**` / `*`), blockquotes (`>`), horizontal lines (`---`), standard lists, table layouts, code highlights, and images.
- **Two-Way Checklists Syncing**: Clicking checkbox items inside the HTML rendered preview updates the raw source document code (`[ ]` / `[x]`) instantly!
- **Dynamic Table of Contents (TOC)**: Sidebar scans header tags in real-time, displaying nested anchors links that scroll smoothly to the matched header in the preview.
- **Preview Canvas Themes**: Seamlessly toggle between three themes:
  - **GitHub Light**: Clean, modern white theme with grid dividers.
  - **GitBook Dark**: Dark navy theme, premium developer layout.
  - **Solarized Paper**: Classic sepia theme optimized for reading logs.
- **Document Statistics Dashboard**: Tracks word count, character count, and reads time averages in real-time.
- **Exporting Options**: Export compiled docs as `.md` text files or trigger browser native print layout sheets to save as PDF.

## Run it

Open `index.html` in any modern browser.
