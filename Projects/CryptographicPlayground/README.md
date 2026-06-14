# 🔐 Cryptographic Cipher Playground & Brute-Force Visualizer

An educational cybersecurity simulator panel showing encryption cipher algorithms and real-time brute-force cracking estimates.

---

## 🚀 Live Demo
Simply open [index.html](file:///index.html) in your browser, or host it locally using a static web server.

---

## 🌟 Key Features

1. **Interactive Cipher Sandbox**:
   - Write plaintext messages and scramble them using multiple classic and modern algorithms:
     - **Caesar Cipher**: Scrambles characters using a shifting offset slider.
     - **Vigenère Cipher**: Scrambles message inputs using a repeating keyword offset map.
     - **Diffie-Hellman Key Exchange**: Visualizes Bob and Alice exchanging public keys using color mixing metaphors. Displays private and public HSL color circles blending into the same secret key color.
     - **Simple AES State Matrix**: Breaks down 16-byte strings into a 4x4 grid, displaying SubBytes lookups, ShiftRows left-shift offsets, and MixColumns.

2. **Real-time Brute-Force Cracking Estimator**:
   - Type target words/passwords and simulate brute-force cracks.
   - Matrix rolling characters guessing frame runs dynamically.
    - Reports live calculations: password entropy bits ($H = L \log_2(R)$), combinations counts, checked key steps, keys-per-second, and time estimates to match. 
