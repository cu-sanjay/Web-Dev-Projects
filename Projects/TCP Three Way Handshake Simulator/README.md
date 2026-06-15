# TCP Three-Way Handshake Simulator

An interactive educational simulator for studying the Transmission Control Protocol (TCP) connection establishment (Three-Way Handshake) and termination (Four-Way Handshake) processes. 

## Key Features

1. **Interactive Client-Server Topology**:
   - Visualizes the Client socket and Server socket terminals side-by-side.
   - Displays real-time TCP socket states (e.g. `LISTEN`, `SYN-SENT`, `SYN-RECEIVED`, `ESTABLISHED`, `FIN-WAIT-1`, `CLOSE-WAIT`, `TIME-WAIT`).

2. **Custom Socket Configurations**:
   - Customize Initial Sequence Numbers (ISNs) for Client ($Seq = X$) and Server ($Seq = Y$).
   - Toggle simulated network parameters (latencies, transmission ports).

3. **Live TCP Header Segment Inspector**:
   - Watch packets (SYN, SYN-ACK, ACK, FIN, etc.) slide across the transmission link.
   - Hover over any active packet to freeze the animation and inspect the **TCP Segment Header**:
     - Source Port and Destination Port.
     - Sequence Number (Seq) and Acknowledgment Number (Ack).
     - TCP Flag Control Bits (SYN, ACK, FIN, RST, PSH, URG).
     - Sliding Window capacity sizes.

4. **Packet Loss & Timeout Retransmissions (RTO)**:
   - Toggle **Packet Loss Mode** to inject segment drops mid-transmission.
   - Models TCP robustness: if a packet drops, watch the sender's countdown timer count down to 0 and trigger a retransmission, resending the lost segment.

5. **Sequence & Handshake Math Quiz**:
   - Interactive training panel generating random connection handshake configurations.
   - Tests sequence and acknowledgment number calculation skills.

## Run Locally
Double-click `index.html` in any modern web browser to open. No servers, node modules, or build configurations required.
