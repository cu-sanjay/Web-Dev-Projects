# Image Gallery

A responsive, high-performance static web application featuring drag-and-drop image uploading, offline-first persistent storage using browser-native IndexedDB, real-time search, categorization, sorting, and an immersive lightbox preview with keyboard navigation.

## Run it

1. Open `index.html` directly in any modern web browser, or serve it using a local static web server.
2. If there are no images, the app will dynamically generate three unique abstract art pieces using HTML5 Canvas to populate your gallery.

## Features

- **IndexedDB Persistence**: Store images locally as Blobs. Your uploaded photos persist across browser restarts and page reloads without size constraints.
- **Drag-and-Drop & File Picker**: Upload multiple images seamlessly. Checks for size (under 10MB) and valid image mime types.
- **Dynamic Light/Dark Themes**: Toggle between a dark mode and a light mode.
- **Interactive Lightbox Preview**: Click any image to view it in full screen with smooth animations, info details (dimensions, size, date), navigation arrows, download capability, and keyboard accessibility (`Esc` to close, `ArrowLeft` / `ArrowRight` to navigate).
- **Search, Filter, & Sort**: Search images by name, filter them by categories or favorites, and sort by date, name, or size.
- **Offline First**: Runs completely in the browser without external dependencies.
