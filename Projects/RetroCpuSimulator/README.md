# 📟 Retro CPU Bytecode Virtual Machine & Assembler Simulator

An educational, interactive 16-bit stack-machine Virtual Machine and Assembly compiler sandbox. Write low-level Assembly code, compile it into hexadecimal bytecode instructions, and watch CPU registers, flags, execution clock steps, memory RAM maps, and stack buffers execute in real-time.

---

## 🚀 Live Demo
Simply open [index.html](file:///index.html) in your browser, or host it locally using a static web server.

---

## 🌟 Key Features

1. **Interactive Assembly Compiler Editor**:
   - Write Assembly code inside the browser with syntax error reporting.
   - Load preloaded Assembly programs:
     - **Fibonacci Sequence**: Calculates terms, outputs value numbers, and renders on VRAM.
     - **Integer Multiplier**: Repeated-addition multiplication loop logic showing stack POP/PUSH.
     - **LED Screen Matrix Pattern**: Animates diagonal dots dynamically in a VRAM loop.

2. **CPU Architecture Display Panel**:
   - Live registers view: `ACC` (Accumulator), `PC` (Program Counter), and `SP` (Stack Pointer).
   - Zero `(Z)`, Carry `(C)`, and Negative `(N)` status flag LEDs.
   - Hardware Call Stack visualizer showing values pushing and popping under active SP indicator focus.

3. **RAM Memory Buffer (256 Words)**:
   - 16x16 interactive grid visualizing code memory maps.
   - Distinguishes address segments by color tags (Cyan for Code/Variables, Amber for Stack, Green for VRAM).
   - Shows real-time transient read/write flash outlines. Hovering displays memory addresses, decimal values, and decoded instruction types.

4. **LED Matrix Display Peripheral**:
   - 8x8 glowing CRT phosphor dot matrix screen mapped directly to VRAM addresses `0xF0` - `0xF7` (bitmap format).

---

## 🎮 Custom 16-Bit Instruction Set Mappings

- `NOP` (0x00) - No operation
- `PUSH val` (0x01) - Pushes immediate value to stack
- `POP` (0x02) - Pops top stack value to ACC register
- `ADD` (0x03) - Pops 2 values, pushes sum ($x + y$)
- `SUB` (0x04) - Pops 2 values, pushes difference ($x - y$)
- `LOAD addr` (0x05) - Pushes value at RAM address to stack
- `STORE addr` (0x06) - Pops value, stores to RAM address
- `HALT` (0x07) - Terminates execution clock
- `JMP addr` (0x08) - Jumps to address
- `JZ addr` (0x09) - Pops value, jumps if Zero
- `JNZ addr` (0x0A) - Pops value, jumps if NOT Zero
- `DUP` (0x0B) - Duplicates top stack value
- `MUL` (0x0C) - Pops 2 values, pushes product ($x \times y$)
- `OUT` (0x0D) - Pops value, prints text report to Console Log 
