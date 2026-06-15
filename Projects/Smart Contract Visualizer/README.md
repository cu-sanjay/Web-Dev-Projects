# Smart Contract Visualizer

An interactive, educational smart contract editor and execution simulator. It models how Solidity-like code compiles into Abstract Syntax Trees (ASTs), generates ABIs and Bytecode, and runs on a virtual EVM displaying execution stack updates and storage slots in real-time.

## Features

- **Code Editor & Templates**: Write custom contracts or select presets (Simple Storage, ERC-20 Token, Voting, Crowdfunding).
- **Interactive Visual Compiler**:
  - **AST Visualizer**: A collapsible tree map representation of the contract structures.
  - **ABI Generator**: Dynamic JSON structure listing functions, state variables, and execution parameters.
  - **Bytecode & Opcodes**: Compilation output showing virtual machine instruction opcodes (e.g. `PUSH1`, `SSTORE`, `ADD`, `REVERT`).
- **Simulated VM Deployments**: Deploy compiled contracts onto simulated Ethereum addresses (e.g. `0x5A1...1b2c`) with constructor inputs.
- **Dynamic Action Controller**: Automatically builds form fields (inputs, call/transact buttons) from the contract's ABI definition to read and write state variables.
- **EVM Execution Frame Stack & Storage**:
  - **Stack Visualizer**: Watch execution frames (values, parameters) slide onto the stack.
  - **State Variable Storage**: Displays storage keys and slots (Slot 0, Slot 1) and details storage mapping updates (e.g. balances mapping) visually.
- **EVM Transaction & Receipt Console**: Log emissions, gas consumption, returns, and execution steps.
- **Premium Glassmorphic Workspace Dashboard**: Sleek visual styling adapting to dark theme layouts.

## Run it

Open `index.html` in any modern web browser.

## What it shows

- **Compilation Life Cycle**: From text code blocks to structured AST parsing and interface definitions (ABI).
- **State Storage Mechanics**: How variables occupy specific 32-byte slots (Slot 0, 1, 2) in contract memory and maps.
- **Stack-based Execution**: Visual tracking of stack values during function execution.
- **EVM Gas Calculations**: Simulated gas accounting for contract deployment and function writes vs calls.
