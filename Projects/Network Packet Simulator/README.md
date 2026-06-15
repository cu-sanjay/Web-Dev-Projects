# Network Packet Simulator

An interactive educational tool designed to simulate and visualize the flow of data packets through the network stack, demonstrating data encapsulation/decapsulation and node-to-node network transmission.

## Educational Concepts Modeled

### 1. The 5-Layer Protocol Stack
The simulator follows the TCP/IP network model:
- **Application Layer (Layer 5)**: Processes client-side user payloads. Supported protocols:
  - **HTTP**: Simulates text GET/POST headers.
  - **DNS**: Simulates domain name query lookups.
  - **Ping (ICMP)**: Simulates echo payload messages.
- **Transport Layer (Layer 4)**: Adds communication reliability. Adds **TCP** (connection-oriented, uses ports, sequence numbers, checksums) or **UDP** (connectionless, lightweight).
- **Network Layer (Layer 3)**: Manages node-to-node routing. Adds **IPv4** headers containing Source & Destination IP addresses, Time-to-Live (TTL), and protocol identifiers.
- **Data Link Layer (Layer 2)**: Manages local physical links. Adds **Ethernet II** frame structures containing Source & Destination MAC physical addresses and Type indicators.
- **Physical Layer (Layer 1)**: Converts frames into serialize binary bits (`0`s and `1`s) transmitted as raw clock pulses.

### 2. Encapsulation & Decapsulation
- **Encapsulation (Sender - Client)**: Data moves down the stack. Each layer appends its header as a wrapper.
- **Decapsulation (Receiver - Server)**: Data moves up the stack. Each layer parses and strips its matching header to deliver the raw payload.

### 3. Intermediate Hop Processing
- **L2 Switch**: Inspects only Layer 2. Reads the MAC address header to forward frames to the correct local port.
- **L3 Router**: Inspects Layer 3.
  - Decapsulates the Layer 2 Ethernet frame.
  - Inspects the Layer 3 IP header to perform a routing table lookup.
  - Decrements the **TTL (Time to Live)** by 1 (checks if expired).
  - Re-encapsulates the IP packet in a new Ethernet frame (updating the Source MAC to the router's interface MAC and the Destination MAC to the next hop or server MAC).
  - Forwards the packet.

## Simulation Controls
- **Topology Animation Map**: Visually tracks the physical movement of the packet block between nodes: Client &rarr; Switch &rarr; Router &rarr; Server.
- **Interactive Steps**:
  - **Encapsulate**: Watch headers wrap layer-by-layer.
  - **Transmit Hops**: Step the packet node-to-node.
  - **Decapsulate**: Watch headers unpack at the server.
- **Header Inspector**: Click the active packet at any time to inspect its nested protocol headers.
