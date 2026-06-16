# Paging & Segmentation Visualizer

An interactive, browser-based visualizer designed to help students master **Virtual Memory Management** in Operating Systems. It animates address translation processes for both **Paging** and **Segmentation** models.

## Features

- **Double-Mode Visualizer**:
  - **Paging Mode**: Visualize logical page separations, a Translation Lookaside Buffer (TLB), Page tables with validation bits, and Physical Memory frames.
  - **Segmentation Mode**: Configure segment names, base addresses, limits (sizes), and inspect bounds checking.
- **Interactive Address Translation**:
  - Input virtual addresses (in Decimal or Binary) and watch the step-by-step translation animation.
  - **Paging Pipeline**: Separates address into Page Number ($p$) and Offset ($d$). Performs TLB lookup, Page Table lookup, triggers Page Faults if needed, and maps to the physical frame.
  - **Segmentation Pipeline**: Separates address into Segment Number ($s$) and Offset ($d$). Compares offset against limit. Visualizes calculations: $\text{Physical Address} = \text{Base} + d$.
- **Segmentation Fault Traps**:
  - Intentionally input offsets exceeding segment limits to trigger a **Segmentation Fault** access violation alert, flashing the UI in pulsing warning red.
- **TLB Hit/Miss Performance**:
  - Tracks TLB searches and computes TLB Hit Rates, highlighting the speed improvements of hardware page caching.
- **Trace Logs**:
  - Step-by-step mathematical reasoning logs output to a console.

## Architecture

This project is built using:
- **HTML5**: Semantic tags for core skeleton layouts.
- **CSS3**: Vanilla CSS variables, dark-mode styling, glowing borders, and responsive grid flex panels.
- **JavaScript (ES6)**: Modular logic for bit slicing, TLB caches, limits validations, and page table map adjustments.
