# Memory Allocation Simulator

An interactive, visual learning tool that simulates memory management partitioning and allocation strategies in Operating Systems. It visualizes First Fit, Best Fit, Worst Fit, and Next Fit algorithms under both Fixed and Dynamic Partitioning configurations.

## Features

- **Core Partitioning Schemes**:
  - **Fixed Partitioning**: Memory is split into preset boundaries. Allocation wastes space, creating **Internal Fragmentation**.
  - **Dynamic Partitioning**: Memory blocks are created dynamically to match process sizes. Releases trigger block **coalescing** (merging adjacent free holes) to optimize space.
- **Allocation Algorithms Visualized**:
  - **First Fit**: Allocates the first free hole large enough.
  - **Best Fit**: Allocates the smallest free hole large enough, leaving minimal remnants.
  - **Worst Fit**: Allocates the largest free hole available, leaving the largest leftover holes.
  - **Next Fit**: Similar to First Fit, but begins scanning from the location of the last allocated block.
- **Dynamic Visual Memory Map**:
  - A responsive linear memory block map illustrating process layouts, free space, and internal/external fragmentations.
  - Live inspection animations tracing the block allocation search paths.
- **Starvation Queue**:
  - Waiting queue holds processes that cannot fit into current memory until space becomes available.
- **Real-Time Analytics Dashboard**:
  - Computes Total Memory Used (%), Internal Fragmentation (KB), and External Fragmentation (KB).
- **Interactive Controls**:
  - Add processes with names, sizes, and optional timers.
  - Deallocate specific blocks immediately.
  - Load preconfigured partition layouts.

## Architecture

This project is built using:
- **HTML5**: Semantic tags for layout structure.
- **CSS3**: Vanilla CSS variables, dark transition animations, progress overlays, and flexible cards.
- **JavaScript (ES6)**: Modular code logic for partition splits, coalescing, search algorithms, and queue buffers.
