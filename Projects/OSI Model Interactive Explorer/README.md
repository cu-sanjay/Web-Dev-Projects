# OSI Model Interactive Explorer

An interactive educational dashboard designed to help students master the 7-layer Open Systems Interconnection (OSI) model. The application features detailed layer inspectors, a dynamic packet encapsulation/decapsulation visualizer, and a protocol-to-layer matching game.

## Key Features

1. **Interactive 7-Layer OSI Stack**:
   - Visual representation of the vertical network stack.
   - Dynamic, color-coded buttons map each layer (from Application down to Physical).
   - Click any layer to open the Inspector Panel.

2. **OSI Layer Inspector**:
   - Displays details for the selected layer:
     - **PDU (Protocol Data Unit)**: e.g. Data, Segment, Packet, Frame, Bits.
     - **Hardware Devices**: Firewalls, Routers, Switches, Hubs.
     - **Key Protocols**: HTTP, DNS, TCP, IP, Ethernet.
     - **Functions**: Detailed summary of responsibilities (routing, error checking, etc.).
     - **Real-world Analogy**: Easy-to-understand analogy matching that layer's role.

3. **Data Encapsulation & Decapsulation Simulator**:
   - Input custom payload messages and watch them flow through the sender and receiver stacks.
   - Visualizes header additions (encapsulation) as data moves down the stack, and header stripping (decapsulation) as data moves up at the destination.
   - Renders a live bitstream traveling across the physical medium.
   - Stepper playback controls (Play, Pause, Speed slider, Step-by-Step).

4. **Protocol Matcher Quiz Game**:
   - An interactive practice card to test knowledge by matching random networking devices and protocols to their correct layer index (1-7).
   - Immediate feedback and score tracking.

## Run Locally
Double-click `index.html` in any modern web browser to run. No servers or configurations required.
