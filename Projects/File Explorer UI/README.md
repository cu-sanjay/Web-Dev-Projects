# File Explorer UI

A virtual file management command deck with a hierarchical nested object directory tree, HTML5 drag-and-drop file movement between folders, double-click folder navigation with breadcrumb path, real-time search filtering, click-to-inspect metadata telemetry, and virtual storage block deployment.

## Features

### Hierarchical File System Tree
Pre-populated 5-root virtual filesystem with nested subdirectories:

```
ROOT
├── Documents/        resume.pdf, cover_letter.docx, budget_2026.xlsx, Work Projects/
├── Downloads/        node-v22.zip, docker-compose.yml, screenshot_2026.png, data.csv
├── Source_Code/      src/ (index.js, app.js, utils.js, styles/), main.cpp, CMakeLists.txt
├── Desktop/          dashboard.fig, config.json, notes.txt
└── System_Settings/  preferences.conf, network_config.yaml
```

### Navigation
- **Double-click** folder → navigate inside, breadcrumb updates
- **Navigate Up** button → parent directory
- **Sidebar** → click root or top-level folder to jump directly
- **Breadcrumb** → shows current path: `ROOT / Documents / Work Projects`

### Drag-and-Drop File Movement
- All items are `draggable`
- Drag over a folder → cyan glow border effect via `drag-over` CSS class
- Drop file → `splice` from source `children[]`, `push` into target `children[]`
- Re-renders grid instantly with zero page refresh

### Search Filter
- Real-time `input` listener on search field
- Filters `currentFolder.children` by `item.name.includes(query)`
- Dynamically hides non-matching items in the grid

### Click-to-Inspect
- Single-click any item → right inspector panel populates with:
  - File Name, Extension, Byte Size, Parent Index
  - Security Integrity Badge updates to `[ FILE INTEGRITY: NODE ACCESSED ]`

### Controls
| Action | Function |
|---|---|
| New Folder | Creates `New_Folder_N` in current directory |
| New Code File [JS] | Creates `new_file_N.js` in current directory |
| Navigate Up | Go to parent directory |
| Reconstruct Directory Matrix | Restore original tree from saved snapshot |
| Deploy Virtual Storage Block | Add random-size (10-50GB) folder |
| Purge System Virtual Memory | Reconstruct + reset all state |

---

## File Structure

```
├── index.html    Layout — nav ribbon, sidebar, items grid, inspector, admin footer
├── style.css     Dark IDE — folder cyan, files gold, code emerald, drag-over glow, responsive auto-fit grid
├── script.js     Engine — nested tree traversal, drag-and-drop listeners, search filter, navigation stack
├── README.md     This file
└── project.json  Project metadata
```

Open `index.html` in any browser.
