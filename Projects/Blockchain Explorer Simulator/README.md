# Blockchain Explorer Simulator

An interactive, client-side educational simulator that models how a blockchain network handles transactions, mining (Proof of Work), block validation, tampering, and consensus synchronization. 

## Features

- **Proof of Work Miner**: Adjustable difficulty settings (1 to 4 leading hex zeroes) showing real-time nonce searches and SHA-256 calculation speeds.
- **Interactive Mempool**: Queue custom transactions (Sender, Recipient, Amount) into the local mempool, which are then packaged into the next mined block.
- **Tampering & Validation Sandbox**: Alter transaction data in historical blocks and watch the visual representation of the chain instantly break (turning red and highlighting invalid hashes) as hashes no longer match the chain link structure.
- **Chain Re-mining**: Click to re-mine a tampered block and its successors to restore cryptographic validity across the network.
- **Ledger Search Engine**: Real-time searching of blocks by block height/hash, or transactions by sender, recipient, or transaction hash.
- **P2P Sync Visualization**: Animated peer node log showing network consensus and blocks being propagated.
- **Premium Glassmorphic Dashboard**: Modern dark-mode dashboard styled with CSS variables, responsive grid layouts, custom card shadows, and interactive state indicators.

## Run it

Open `index.html` in any modern web browser.

## What it shows

- **Cryptographic Hash Linkages**: Each block holds a reference to the previous block's hash, demonstrating why historical edits render subsequent hashes invalid.
- **Proof of Work Mechanics**: How mining difficulty exponentially increases compute time (number of nonces evaluated) to solve the hashing puzzle.
- **State Persistence**: The local blockchain state is stored in `localStorage` so you can continue your simulation across refreshes.
- **Responsive Layout Design**: A modern grid-based dashboard that scales cleanly from mobile sizes to large displays.
