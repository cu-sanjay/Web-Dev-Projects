# Regex Builder Studio

A visual block-based regular expression builder, live matching evaluator, replacement scanner, interactive explainer, and multi-language compiler.

## Features

- **Visual Block Builder**: Construct regular expression patterns visually using block buttons for common patterns (e.g. word characters, digits, custom ranges, optional anchors, groupings).
- **Interactive Match Highlights**: Renders highlighted matches on the fly in the test playground panel, identifying capture groups and character ranges.
- **Code Generators**: Compiles working code snippets in **JavaScript**, **Python**, **Go**, and **PHP**.
- **Regex Explainer**: Breaks down the active pattern into a human-readable list explaining what each subsegment evaluates.
- **Presets & Reference Cheatsheets**: Quick presets for popular requirements (email, phone, URL, dates) and an inline reference cheat sheet mapping standard regex tokens.

## File Structure

```
Regex Builder Studio/
├── project.json       # Workspace manifest metadata
├── README.md          # User manual and reference guide
├── index.html         # Panel layout structure
├── style.css          # Glassmorphic developer stylesheet
├── script.js          # App compiler logic and highlighter engines
└── thumbnail.svg      # Workspace branding graphic
```

## How to Use

1. **Load Presets**: Select a preset from the sidebar dropdown to see a pre-built regex and matching text.
2. **Visual Builder (Left)**: Click "+ Digit", "+ Word", "+ Range" to insert sub-patterns. Set multipliers (quantifiers) like "Once or more" or "Optional".
3. **Data Test (Right)**: Input test string text into the playground to see matching results instantly highlighted.
4. **Code Generator (Sidebar)**: Toggle tabs to copy snippet code for JavaScript, Python, Go, and PHP.
