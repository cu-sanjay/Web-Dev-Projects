# Interactive System Design Learning Hub

The **Interactive System Design Learning Hub** is a premium, responsive single-page educational application designed to help students, developers, and aspiring architects master fundamental system design concepts. Users can study 6 core software architecture topics (Load Balancers, Caching, Databases & Sharding, CDNs, Message Queues, and Microservices) using real-time interactive SVG simulators, check their skills with detailed multiple-choice quizzes, bookmark notes, download reference summaries, and track their daily learning stats.

## Run It

Open `index.html` directly in any modern web browser to start exploring and simulating systems!

## Features

- **Six Dynamic Architecture Modules**: Learn Load Balancing, Caching, Sharding, CDNs, Message Queues, and Microservice routing through a unified dashboard.
- **Interactive SVG Simulators**: Real-time interactive playground for each module:
  - *Load Balancing*: Route traffic using Round Robin, Random, or Least Connections.
  - *Caching*: Simulate hit/miss delays and watch LRU cache eviction in action.
  - *Sharding*: Input user IDs to watch how modulus database routers divide datasets.
  - *CDNs*: Distribute queries to local CDN edge servers vs querying origin databases.
  - *Queues*: Buffer producer-consumer workloads asynchronously in queues.
  - *Microservices*: Route calls to decoupled endpoints via API Gateway entry.
- **Topic Quizzes**: Complete MCQs for each module, complete with real-time feedback explanation blocks.
- **Data Persistence**: Progress tracking, bookmarked pages, daily visit streaks, and unlocked badges are saved locally to `localStorage`.
- **Note Exporter**: Save module notes as offline `.txt` summaries.
- **Dual-Theme Design**: Switch between sleek Dark and Light mode styles using responsive CSS variables.

## Tech Stack

- **Structure**: Semantic HTML5
- **Style**: Modern Vanilla CSS3 Grid & Flexbox
- **Logic**: ES6 JavaScript
- **Graphics**: Interactive Inline SVGs

## Credits

This project was built from scratch as part of the `Web-Dev-Projects` repository. All rights reserved. 
