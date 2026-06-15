# Virtual Memory Manager Simulator

An interactive, visual educational tool designed to demonstrate how virtual memory is managed in modern computer systems. The simulator visualizes the lifecycle of address translation, TLB lookups, page table lookups, and page fault replacement handling.

## Visualizing Key Concepts

1. **Address Decomposition**:
   - An 8-bit Virtual Address is split into a **Virtual Page Number (VPN)** (3 bits) and a **Page Offset** (5 bits).
   - This translates to **8 Virtual Pages** (Page 0 to Page 7) with a size of **32 bytes** each.
   
2. **Translation Lookaside Buffer (TLB)**:
   - A fast cache that stores recent VPN-to-PFN mappings to accelerate translation.
   - Demonstrates **TLB Hits** (instant mapping) and **TLB Misses** (delegating to the Page Table).
   - Configurable size (2 or 4 entries) and replacement algorithms: **LRU (Least Recently Used)**, **FIFO (First-In, First-Out)**, or **Clock (Second Chance)**.

3. **Page Table**:
   - A table mapping all 8 VPNs to **Physical Frame Numbers (PFN)**.
   - Shows status flags: **Valid** (in RAM), **Dirty** (modified in RAM and must write back to Disk upon eviction), **Referenced** (recently accessed), and **Permissions** (Read/Write).

4. **Physical Memory (RAM) & Swap Disk**:
   - Physical RAM contains **4 frames** (Frame 0 to Frame 3), meaning it can hold up to 4 pages at once (128 bytes total).
   - The Swap Disk acts as secondary storage, hosting pages that are not active in RAM.
   - A **Page Fault** triggers when a page is accessed that is not in RAM (Valid bit = 0), forcing the system to evict a victim page if RAM is full, write it back to Disk (if dirty), and load the target page.

## Replacement Policies
- **FIFO**: Evicts the page loaded into memory earliest.
- **LRU**: Evicts the page that has not been accessed for the longest time.
- **Clock (Second Chance)**: Circular list scan using the Reference Bit to give pages a second chance before eviction.
- **Optimal (OPT)**: Evicts the page that will not be used for the longest period in the future (analyzes the future address stream).

## Project Structure
- `index.html`: Layout containing configurations, execution dashboard, telemetry console, and memory grids.
- `style.css`: Modern visual theme with glassmorphic cards, transition animations, and color-coded status highlights.
- `script.js`: State management machine executing the memory access cycle, resolving replacements, and drawing the step-by-step translation flow chart.
