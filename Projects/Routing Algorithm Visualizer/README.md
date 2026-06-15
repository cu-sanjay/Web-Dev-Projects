# Routing Algorithm Visualizer

An interactive educational simulator designed to visualize and compare fundamental computer network routing algorithms. The tool provides a dynamic canvas workspace where users can build custom network topologies and watch packet transmission paths compile in real-time.

## Key Visual Modules

1. **Interactive Node Canvas Workstation**:
   - **Add Node**: Click the "Add Router Node" toggle and click anywhere on the canvas to place a new router.
   - **Reposition Nodes**: Click and drag any router node to dynamically move it; connecting edge links follow.
   - **Draw Links**: Click a node, then click another node to draw a bidirectional connection.
   - **Edit Link Cost**: Click on any edge line link to prompt and modify its transmission metric cost.
   
2. **Supported Routing Protocols**:
   - **Dijkstra's Link-State Algorithm (SPF)**: Computes paths based on cumulative link costs (edge weights). The visualizer highlights queue nodes and relaxed edges step-by-step.
   - **Bellman-Ford Distance-Vector Algorithm**: Computes paths iteratively using neighboring distance vectors. Models convergence and routing table exchanges.
   - **Flooding (Data-Link Broadcasting)**: Broadcasts incoming packet copies out of all neighboring interfaces except the source. Highlights loop boundaries and traffic overhead.

3. **Comparative Analytics Deck**:
   - Compares the protocols side-by-side using four metrics:
     - **Hop Count**: Total links traversed.
     - **Total Cost**: Sum of link weights along the path.
     - **Packet Overhead**: Number of duplicate packet instances generated.
     - **Simulated Latency**: Total delay calculated.

4. **Dynamic Routing Table Inspector**:
   - Click any router node on the canvas to display its current local routing table (`Destination | Next Hop | Cost`).

## Theoretical Foundations
- **Link-State vs Distance-Vector**: Dijkstra requires global knowledge of topology (each router builds a complete map). Bellman-Ford exchanges routing vectors locally with immediate neighbors, converging iteratively.
- **Flooding**: Simplest routing method. Packets contain unique sequence IDs and hop limits (TTL) to prevent infinite loops in cycles.
- **Split Horizon & Poison Reverse**: Mitigations for routing loops in distance-vector routing protocols.
