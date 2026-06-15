# Linux Command Playground

An interactive client-side Unix terminal emulator and sandbox containing a virtual filesystem and guided learning missions.

## Features

- **Virtual File System (VFS)**: In-memory Unix structure (`/home/user`, `/etc`, `/var/log`) mapping text contents, directories, and paths.
- **Bash Command Interpreter**: Evaluates standard Unix instructions:
  - Navigation: `cd`, `pwd`, `ls` (supports flags `-l` and `-a`).
  - File Operations: `cat`, `touch`, `mkdir`, `rm` (supports recursive `-r`).
  - Text & Redirections: `echo` with write redirections (`>` and `>>`), and `grep` pattern filtering.
  - Controls: `clear`, `help`.
- **Graphical Folder Tree Visualizer**: A live-updating sidebar displaying directory changes graphically.
- **Educational missions (6 levels)**: Interactive checklist objectives verifying Unix commands.

## File Structure

```
Linux Command Playground/
├── project.json       # Manifest metadata
├── README.md          # User manual and reference guide
├── index.html         # Shell viewport layout
├── style.css          # Immersive dark terminal styles
├── script.js          # Bash interpreter and VFS models
└── thumbnail.svg      # Branding thumbnail graphic
```

## How to Use

1. Open `index.html` in a web browser.
2. Review the mission checklist in the left panel.
3. Input bash shell commands into the glowing prompt input box on the right.
4. Verify directory changes inside the file tree visualizer on the left.
