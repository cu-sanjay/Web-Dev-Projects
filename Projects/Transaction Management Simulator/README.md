# Transaction Management Simulator

An interactive, educational simulator modeling transaction management systems. It provides interactive sandboxes to explore ACID properties (Atomicity, Consistency, Isolation, Durability), database isolation levels (Dirty Reads, Non-repeatable Reads, Phantom Reads), locking managers (Shared vs. Exclusive locks), Write-Ahead Logging (WAL) and crash-recovery procedures (Undo/Redo protocols).

## Features

- **Multi-Transaction Dashboard**: Start and orchestrate multiple active transactions (Tx A, Tx B, Tx C) simultaneously.
- **ACID & Concurrency isolation settings**: Toggle isolation levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable) to see what anomalies (e.g. Dirty Reads, Non-repeatable Reads) can occur under different modes.
- **Live Lock Manager Viewer**: Watch row-level locking allocations:
  - **Shared Locks (S)**: Multiple read access granted.
  - **Exclusive Locks (X)**: Blocks competing operations (transacts block/wait).
- **RAM Buffer vs. Disk State Mapping**: Observe updates written to volatile RAM (Buffer) first, and see how values are decoupled from the physical Disk until a commit propagates.
- **Write-Ahead Logging (WAL) Ledger**: Watch append-only transaction logs record old and new state details for every write.
- **System Crash & WAL Recovery Simulator**:
  - Click **Crash Engine** to wipe volatile RAM.
  - Click **Recover Database** to execute the recovery protocol. Watch the engine identify the **Undo List** (uncommitted transactions to roll back) and **Redo List** (committed transactions to reapply), reconstructing the database state.
- **Premium Glassmorphic Panel Layout**: Modern dark-mode styled with HSL colors and responsive structures.

## Run it

Open `index.html` in any modern web browser.

## What it shows

- **ACID Atomicity**: Transactions complete entirely or have all changes undone during a rollback or abort.
- **EVM-style Locks**: How concurrency schedulers prevent dirty conflicts using lock wait queues.
- **Durability**: Committed logs preserved in WAL guarantee that crashed data can be safely rebuilt upon startup.
