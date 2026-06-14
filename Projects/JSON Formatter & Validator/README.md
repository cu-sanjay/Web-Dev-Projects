# JSON Formatter & Validator

A premium developer workspace utility to validate, inspect, format, query, and download JSON files. Analyze code structures with collapsible nodes, locate syntax errors by line/column offsets, and extract filtered subsets with a dot-notation query finder.

## 🚀 Key Features

- **Split-Pane Code Editor**:
  - *Left Editor*: Paste raw JSON strings. Toolbar actions to Format (2/4 spaces), Minify, Paste, Load Sample templates, and Clear all.
  - *Right Inspector*: View pretty-printed code, navigate interactive folder nodes, or query filtered paths.
- **Detailed Parsing Validator**:
  - Catches syntax errors dynamically on input or format click.
  - Translates native raw parsing reports into local alert cards pointing to the exact **Line** and **Column** offset (e.g. `Error: Expected ',' instead of '}' on line 5, column 12`).
- **Interactive Collapsible Tree View**:
  - Renders raw JSON objects recursively into a visual tree hierarchy.
  - Click toggle arrows to expand/collapse nests, showing count summaries (e.g. `[12 items]`, `{4 keys}`).
- **Path Querying (JSONPath Lite)**:
  - Query large JSON documents instantly using dot-notation path strings (e.g. `store.books.0.title`).
- **Advanced Document Metrics**:
  - Dashboard panels tracking total file byte size (KB), line counts, nested key-value sizes, list array items, and depth.

## 📂 Folder Layout

```
JSON Formatter & Validator/
├── README.md         # Detailed user manual
├── project.json      # Metadata descriptor
├── index.html        # App HTML structures
├── style.css         # Theme stylesheet and collapsible tree configurations
├── script.js         # JSON parsers, query engines, & recursive tree decoders
└── thumbnail.svg     # Project showcase graphic
```

## 🛠️ How to Use

1. Open `index.html` in any modern browser.
2. Select a preset template from the dropdown list. The document will format immediately.
3. Switch tabs on the right side to toggle between **Pretty Code View** and **Interactive Tree View**.
4. To filter data, type a query like `profile.contacts.email` in the query filter search bar and press Enter or click search.
5. Induce an error (e.g. remove a comma) to test the Validator error line reporter.
