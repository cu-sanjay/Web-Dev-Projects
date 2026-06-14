# Frontend Performance Analyzer

The **Frontend Performance Analyzer** is an interactive web-based educational dashboard designed to help developers evaluate, analyze, and optimize website performance metrics. Users can input specific frontend details (such as JavaScript bundle sizes, unoptimized image counts, DOM elements, and server latency) and trigger a simulated diagnostics scan to compute Core Web Vitals (LCP, FID/INP, and CLS) along with a Lighthouse-weighted overall speed score.

An **Interactive Optimization Sandbox** lets developers toggle performance optimizations in real-time, instantly adjusting the performance score and teaching them best practices (such as lazy loading, WebP conversion, HTTP/3 multiplexing, code minification, and script deferral).

## Run It

Open `index.html` directly in any modern web browser to start analyzing and optimizing!

## Features

- **Comprehensive Metric Inputs**: Form inputs representing real-world frontend payload stats (HTML nodes, JavaScript sizes, requests, blocking scripts, and server RTT).
- **Diagnostics Scanning Simulator**: Simulated progress bar illustrating the multi-step audit process (DOM parsing, JS bundling evaluation, network delay calculations).
- **Lighthouse Scoring Model**: Calculates and scores:
  - **LCP (Largest Contentful Paint)**: Loading speed.
  - **FID (First Input Delay)**: Interactivity response delay.
  - **CLS (Cumulative Layout Shift)**: Visual stability.
  - Generates a weighted overall score from 0-100.
- **Interactive Sandbox Play**: Toggle optimizations (Brotli compression, lazy loading, script deferrals) to observe immediate, visual score increases.
- **Diagnostic Audit Checks**: In-depth explanations of failed/passed checks complete with copyable code snippet fixes.
- **Report Downloader**: Download the full metrics, vitals estimation, and code suggestions as a text report file.
- **Progress Tracking & Persistence**: Automatically saves diagnostic history logs and achievement badges in `localStorage`.

## Tech Stack

- **Structure**: Semantic HTML5
- **Style**: Modern Vanilla CSS3 Grid & Flexbox
- **Logic**: ES6 JavaScript Math Engine
- **Graphics**: Speedometer & Icons using SVGs

## Credits

This project was built from scratch as part of the `Web-Dev-Projects` repository. All rights reserved. 
