# Subnet Calculator & Visualizer

An interactive educational playground for learning and planning IPv4 subnetting, Classless Inter-Domain Routing (CIDR), and Variable Length Subnet Masking (VLSM). 

## Core Modules & Features

1. **IP & CIDR Bit-Borrowing Visualizer**:
   - Parses any IPv4 address and subnet prefix (/0 to /32).
   - Graphically maps the 32 bits of the address, color-coding them by Network bits, Subnet bits (borrowed), and Host bits.
   - Adjusting a slider dynamically updates how bits shift in real-time.

2. **Fixed-Length Subnet Masking (FLSM) Planner**:
   - Divide a base IP range into a fixed number of equal-sized subnets.
   - Instantly calculates netmasks, host sizes, usable IP ranges, and displays the resulting subnet divisions.

3. **Variable-Length Subnet Masking (VLSM) Solver**:
   - Formulate custom network plans with subnets of varying host sizes.
   - Implements a greedy allocation heuristic: sorts subnets descending by host requirement, aligns boundaries to the nearest power-of-2 boundary, and displays the final IP allocations alongside allocation efficiency and address waste statistics.

4. **Interactive Address Treemap**:
   - Renders a multi-dimensional canvas map representing the full address pool.
   - Illustrates allocated subnets as blocks sized proportionally to their address share, making it easy to spot vacant blocks or overall efficiency.

5. **Subnetting Quiz & Practice Mode**:
   - An interactive practice card that generates random subnetting problems (e.g. matching broadcast addresses, finding hosts, identifying CIDR boundary bounds) for test prep.

## Run Locally
Double-click `index.html` in any modern web browser to launch. No servers, build tools, or packages required.
