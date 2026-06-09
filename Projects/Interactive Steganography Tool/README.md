# Interactive Steganography Tool

An advanced image security sandbox that utilizes HTML5 Canvas canvas manipulation APIs to conceal and decode text data inside regular images. The application alters the Least Significant Bit (LSB) values across pixel structural arrays, ensuring that hidden message payloads remain entirely imperceptible to human vision while preserving complete static asset integrity.

## Run it
Open `index.html` in any modern browser.

## Features
- **Least Significant Bit (LSB) Encoding:** Modifies raw RGB pixel channels to insert secret text bits cleanly without causing visible color distortion.
- **Dynamic Binary Extraction:** Decodes masked messages in real time using a custom null-byte terminator detection loop.
- **Lossless PNG Downloads:** Generates and exports pixel-perfect `.png` configurations dynamically to prevent canvas file data clipping.
- **Clean Split Dashboard:** Separate tabs for encoding and decoding workflows, optimized for immediate local browser testing.
- **Zero-Dependency Architecture:** Written entirely in vanilla HTML, CSS, and plain JavaScript, using strict 2-space indentation and semicolons.

## What I Learned
- **Canvas Image Data Manipulation:** Accessing and modifying raw byte arrays (`ImageData.data`) in real time on a canvas context.
- **Bitwise Stream Operations:** Converting raw character strings into matching binary arrays and packing them efficiently using bit-shifting masks (`& 0xFE`).
- **Data Protection Controls:** Crafting reliable marker terminators to handle binary streaming limits elegantly without causing memory overruns.