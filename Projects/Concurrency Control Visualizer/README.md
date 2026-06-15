# Concurrency Control Visualizer

An interactive client-side visual simulator modeling database concurrency control protocols. It contrasts Two-Phase Locking (2PL), Timestamp Ordering (TO), and Optimistic Concurrency Control (OCC), highlighting lock wait conflicts, deadlock cycles, and read/write serialization logic.

## Features

- **Interactive Schedule Constructor**: Input list of concurrent operations (e.g. `T1: R(A)`, `T2: W(A)`, `T1: W(B)`) with preloaded schedules for Deadlocks and OCC Conflicts.
- **Protocol Playground Schedulers**:
  - **Two-Phase Locking (2PL)**: Tracks Shared (S) and Exclusive (X) locks. Generates a live **SVG Wait-For Graph** to map dependency trees and flash deadlock loops in red.
  - **Timestamp Ordering (TO)**: Displays read/write timestamp records (`R-TS`, `W-TS`) for items and aborts older transactions when newer timestamps have read/written resources.
  - **Optimistic Concurrency Control (OCC)**: Divides operations into Read, Validate, and Write phases, demonstrating validation checks and aborting overlapping commits.
- **Diagnostics Event Console**: Prints scheduling decisions, locking states, timestamp checks, validation overlays, and deadlock resolutions.
- **Premium Glassmorphic Design**: Styled dark-mode workspace utilizing harmonized layout cells and responsive timelines.

## Run it

Open `index.html` in any modern web browser.

## What it shows

- **Deadlock Cycles**: How dependency loops between locks form cycles and why the engine must abort a transaction to resolve the deadlock.
- **Timestamp Ordering**: How assigning timestamps on transaction birth forces transactions to execute in serializable order.
- **OCC Optimism**: Why OCC works well under low conflict environments and how it compares to locking protocols.
