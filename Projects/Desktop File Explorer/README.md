# Desktop File Explorer

A virtual file management terminal with nested JSON directory tree, sidebar navigation, breadcrumb path resolver, CRUD asset operations, metadata inspector, and cloud sync simulation. Zero dependencies.

---

## Features

### Virtual File System
Seed directory structure with nested folders and files:

```
root/
├── Desktop/
│   ├── wallpaper.png
│   └── notes.txt
├── Documents/
│   ├── resume.tex
│   ├── notes.md
│   └── Projects/
│       ├── index.html
│       ├── style.css
│       └── app.js
├── Source_Code/
│   ├── main.cpp
│   ├── utils.h
│   └── React_App/
│       ├── App.tsx
│       └── package.json
└── Root_Storage/
    ├── backup.zip
    └── config.json
```

### Directory Tree Sidebar
- Expandable hierarchical view with indentation levels
- Click folders to navigate, click files to inspect
- Active path highlighted in cyan

### Explorer Grid
- Icon grid with file type detection and emoji icons
- Double-click folders to descend, single-click files to inspect
- Delete button (✕) on each item with array splice removal
- Empty directory placeholder

### Breadcrumb Navigation
- Dynamic path trace: `root / Documents / Projects`
- Navigate Up button to pop current directory

### CRUD Operations
- **New Folder**: Prompt → append to current directory
- **New File [js/cpp]**: Prompt with name → auto-detect extension
- **Delete**: Click ✕ to splice from array

### Inspector Panel
- Selected item metadata: name, type, extension, allocation size, created date
- Folder: shows contained item count
- File: integrity validation badge

## Controls

| Action | Function |
|---|---|
| New Folder | Create empty directory in current path |
| New File | Create file with auto-detected extension |
| Up One Tier | Navigate to parent directory |
| Reconstruct Baseline | Reset to seed file system |
| Simulate Cloud Sync | Animated upload pipeline overlay |
| Purge Volume Memory | Clear and reset everything |

---

## File Structure

```
├── index.html        Layout — nav ribbon, sidebar tree, explorer grid, inspector, admin footer
├── style.css         Dark terminal — glassmorphic panels, cyan folders, amber files, crimson delete
├── script.js         Engine — nested JSON tree, breadcrumb resolver, CRUD splice ops, tree renderer
├── README.md         This file
└── project.json      Project metadata
```

Open `index.html` in any browser.
