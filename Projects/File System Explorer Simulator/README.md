# File System Explorer Simulator

An interactive educational simulator for exploring file system structures, path resolutions, and metadata (inodes) mapping in modern operating systems. The simulator features a dual-interface dashboard that integrates a visual GUI file explorer (like Windows Explorer / macOS Finder) with an interactive virtual CLI terminal.

## Key Features

1. **Virtual Hierarchical Directory Tree**:
   - Structured recursive node architecture starting from the root directory (`/`).
   - Supports creating, nested viewing, editing, renaming, and deleting folders and files.
   
2. **Dual Interaction Modes**:
   - **GUI Folder Grid**: Displays contents of the current folder. Drag-and-drop support, right-click context menus for actions (Rename, Delete, Info, Edit), and a clickable breadcrumbs path bar to navigate up.
   - **CLI Shell Console**: A terminal window supporting standard UNIX-like commands:
     - `ls` - List files and directories in current directory.
     - `cd [path]` - Change active directory (handles absolute paths and relative pathways like `../`).
     - `mkdir [name]` - Create a new sub-directory.
     - `touch [name]` - Create a new empty text file.
     - `rm [name]` - Remove a file or directory.
     - `cat [name]` - Output file contents in the terminal logs.
     - `pwd` - Print working directory path.
     - `echo "[text]" > [file]` - Write text contents to a file.
     - `find [query]` - Search directories globally for matching keywords.
     - `clear` - Clear console output history.
     - `help` - Show all supported command instructions.

3. **Inode Metadata Viewer**:
   - Every file and directory is tracked with simulated OS metadata:
     - Unique Inode index.
     - Size (in bytes, computed dynamically based on character counts).
     - Timestamps (Created Date & Last Modified Date).
     - Path location.
     - Octal permissions (e.g. `0755` for directories, `0644` for files).

4. **Persistence & Storage Limits**:
   - Automatically saves modifications to `localStorage`.
   - Displays a live "Virtual Disk Usage" bar indicating total bytes written, helping visualize disk boundaries.

## File System Theory
- **Inodes**: Data structures holding metadata about files/folders. The name is kept in the directory entry, pointing to the inode number.
- **Directory**: A directory is a special file containing a list of filename-to-inode mappings.
- **Path Resolution**: The OS traverses the directory structure step-by-step from left to right (root for absolute, active node for relative) to resolve targets.
