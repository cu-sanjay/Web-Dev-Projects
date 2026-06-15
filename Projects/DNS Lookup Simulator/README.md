# DNS Lookup Simulator

An interactive, visual simulator for learning how the Domain Name System (DNS) works. It models the hierarchical path of DNS query resolutions, cache lookup states (Browser, OS, and Local Resolver), and database zone lookups.

## Key Features

1. **Hierarchical DNS Tree Map**:
   - Visualizes query pathways among nodes:
     - **Client (Browser / OS)**: The origin of the DNS query.
     - **Local DNS Resolver (ISP)**: Queries the nameserver hierarchy on behalf of the client (Recursive) or acts as an agent retrieving referrals (Iterative).
     - **Root Nameserver (`.`)**: Directs query to TLD servers based on the suffix.
     - **TLD Nameserver (.com, .org, .net)**: Directs query to Authoritative servers based on the domain.
     - **Authoritative Nameserver (e.g., google.com)**: Holds the final resource records and returns the mapping.

2. **Recursive vs Iterative Lookups**:
   - **Recursive mode**: The client submits a query and awaits the final answer. The Local Resolver takes over and traverses the tree behind the scenes.
   - **Iterative mode**: Shows nameservers returning referrals (pointer records to TLD and Authoritative servers) back to the resolver, which steps through the tree step-by-step.

3. **DNS Database Records**:
   - Simulates nameserver zone database entries:
     - `A Record`: Maps a domain to an IPv4 address.
     - `AAAA Record`: Maps a domain to an IPv6 address.
     - `CNAME Record`: Maps a domain alias to a canonical canonical name.
     - `MX Record`: Maps a domain to its Mail Exchange server.
     - `NS Record`: Maps a zone to its authoritative nameservers.
     - `TXT Record`: Stores custom verification text.

4. **Cache & TTL (Time To Live)**:
   - Simulates caching at three layers: Browser cache, Operating System cache, and Local Resolver cache.
   - Every resolved entry is cached with a countdown TTL timer. Expired entries are automatically removed, demonstrating cache expiration.

## Setup & Implementation
- `index.html`: Dashboard containing settings, the topology tree map, live caches tables, and zone databases.
- `style.css`: Modern visual theme with glassmorphic cards, transition animations, and color-coded record fields.
- `script.js`: State engine holding preloaded zones, recursive/iterative step timeline machines, and live TTL decrementers.
