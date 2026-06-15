# CPU Pipeline Simulator

An interactive, visual educational tool for understanding instruction execution overlapping, pipeline registers, hazard detection, and resolution strategies in modern CPUs (MIPS architecture model).

## Features

- **5-Stage CPU Pipeline Visualizer**:
  - Animates instruction progress through MIPS pipeline registers:
    - **IF (Instruction Fetch)**: Fetches instruction using the Program Counter (PC).
    - **ID (Instruction Decode)**: Parses registers and decodes instruction values.
    - **EX (Execute)**: Performs arithmetic/logic checks using the ALU.
    - **MEM (Memory Access)**: Reads/writes from data memory buffers.
    - **WB (Write Back)**: Updates registers.
- **Pipeline Hazard Detection & Resolution**:
  - **Data Hazards (RAW)**: Highlights register dependencies. Toggles a **Forwarding Unit** to bypass stalls, or inserts bubbles.
  - **Control Hazards**: Simulates branch outcomes (`BEQ`). Stalls or flushes instruction slots depending on Branch Prediction settings.
- **Textbook Space-Time Grid Diagram**:
  - Dynamically charts the progress of instructions over clock cycles in a matrix view.
- **Interactive Control Deck**:
  - Step Clock cycles forward/backward, adjust speed sliders, and reload assembly presets.
- **MIPS Assembly Code Presets**:
  - Load classic scenarios:
    - Clean Pipeline (no hazards)
    - Data Hazard (Read-After-Write dependency)
    - Load-Use Hazard (requires stall despite forwarding)
    - Control Hazard (branch flushes)
- **Live State Tables**:
  - Monitors the Register File ($R_0 \dots R_7$) and Data Memory.

## Architecture

This project is built using:
- **HTML5**: Semantic layout blocks.
- **CSS3**: Vanilla CSS styling featuring glassmorphism cards, grid alignments, neon accents, and flash animations.
- **JavaScript (ES6)**: Modular state machines tracking clock cycle stages, register values, hazard rules, and UI refreshes.
