# 🧠 Visual Turing Machine & Automata Compiler Simulator

An educational, interactive visual diagram creator and simulator for Deterministic Finite Automata (DFA), Pushdown Automata (PDA), and Turing Machines.

---

## 🚀 Live Demo
Simply open [index.html](file:///index.html) in your browser, or host it locally using a static web server.

---

## 🌟 Key Features

1. **State Node Canvas Graph Editor**:
   - Interactive drawing board: click to spawn states, drag and drop nodes to organize layouts.
   - Link nodes with transitions: drag from origin node to target node to open transition rules modal.
   - Double click a node to mark it as the **Accepting / Final state** (visualized with a double circle).

2. **DFA, PDA, and Turing Machine Interpreters**:
   - Easily switch machine models.
   - Animate state changes, transitions, and tape heads step-by-step or run with custom speeds (1Hz - 15Hz).
   - **Turing Machine**: Models tape reads/writes and sliding head frames shifting left or right.
   - **PDA**: Implements stack pop and push rules matching symbols in real-time.

3. **Batch String Tests**:
   - Input test cases to instantly evaluate acceptance rules, showing live results.

4. **Presets Included**:
   - **DFA (Even Zero Count)**: Accepts strings with an even number of zeroes.
   - **PDA (Balanced Brackets)**: Stack checking matching brackets `( )`.
   - **Turing (Binary Incrementer)**: Moves tape head right, then increments binary value right-to-left. 
