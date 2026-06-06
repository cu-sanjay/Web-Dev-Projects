# Color Palette Generator

A minimalistic, browser-based tool that generates harmonious color palettes using color theory — no frameworks, no dependencies, just plain HTML, CSS and JavaScript.

## Features

- **7 color schemes** built on real color theory: Analogous, Complementary, Triadic, Split-Complementary, Tetradic, Monochromatic, and Random.
- **Lock swatches** — pin any color you want to keep; regenerating leaves locked colors untouched.
- **One-click copy** — click any hex code badge or the copy icon to copy it to the clipboard.
- **Configurable count** — generate palettes of 3, 4, 5 or 6 colors.
- **Export panel** — grab the palette as a HEX list, CSS custom properties (`:root` variables), or JSON.
- **Keyboard shortcut** — press `Space` to instantly generate a new palette.
- Fully responsive — stacks vertically on mobile. No build step, works offline.

## Run it

Open `index.html` in any modern browser. That's it.

Or serve it locally with Python:

```bash
python -m http.server 3000
```

Then visit `http://localhost:3000`.

## How the colors are generated

All palette math works in HSL (Hue, Saturation, Lightness):

1. A random base hue is picked.
2. Hue offsets are applied per scheme (e.g. +120° / +240° for triadic).
3. Saturation and lightness are varied slightly per swatch to add natural variation.
4. The final HSL values are converted to hex for display.

Perceived luminance (WCAG formula) is calculated for each color to decide whether the text overlay should be light or dark, ensuring the hex label is always readable.

## What it shows

- Pure color-math without any color library.
- HSL ↔ HEX conversion from scratch.
- Event delegation for efficient palette interactions.
- `<dialog>` element for an accessible export modal.
- CSS custom properties and clean responsive layout with no media-query hacks.

## Author

**Utkarsh Desale** — [@utkrsh29](https://github.com/utkrsh29)
