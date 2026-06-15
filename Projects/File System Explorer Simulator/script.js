/**
 * File System Explorer Simulator - OS virtual file system engine
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- Constants & Config ---
  const DISK_SIZE_LIMIT = 65536; // 64 KB
  
  // --- In-Memory File System State ---
  let fileSystem = {};
  let currentFolderId = "root";
  let selectedNodeId = null;
  
  // Navigation History Stack
  let historyBack = [];
  let historyForward = [];
  
  // Track expanded tree folders by ID
  let expandedFolders = new Set(["root"]);

  // Unique Inode Allocation Counter
  let lastInodeIndex = 100;
  let nodeCounter = 0;

  // --- UI Elements ---
  const btnResetFs = document.getElementById("btn-reset-fs");
  const treeContainer = document.getElementById("tree-container");
  const globalSearch = document.getElementById("global-search");
  const diskBytesLabel = document.getElementById("disk-bytes-label");
  const diskProgressFill = document.getElementById("disk-progress-fill");

  const btnNavBack = document.getElementById("btn-nav-back");
  const btnNavForward = document.getElementById("btn-nav-forward");
  const breadcrumbsBar = document.getElementById("breadcrumbs-bar");

  const btnNewFolder = document.getElementById("btn-new-folder");
  const btnNewFile = document.getElementById("btn-new-file");
  const btnRenameNode = document.getElementById("btn-rename-node");
  const btnDeleteNode = document.getElementById("btn-delete-node");

  const explorerGrid = document.getElementById("explorer-grid");
  const metadataDetails = document.getElementById("metadata-details");

  const terminalBodyLog = document.getElementById("terminal-body-log");
  const terminalInput = document.getElementById("terminal-input");
  const btnClearTerminal = document.getElementById("btn-clear-terminal");
  const cliPromptLabel = document.getElementById("cli-prompt-label");

  // Modal Editor
  const editorModal = document.getElementById("editor-modal");
  const editorFileTitle = document.getElementById("editor-file-title");
  const editorTextArea = document.getElementById("editor-text-area");
  const editorSizeLabel = document.getElementById("editor-size-label");
  const btnModalCancel = document.getElementById("btn-modal-cancel");
  const btnModalSave = document.getElementById("btn-modal-save");
  const btnModalClose = document.getElementById("btn-modal-close");

  let editingFileNode = null;

  // --- Default File System Template ---
  const DEFAULT_FS = {
    "root": {
      id: "root",
      name: "root",
      type: "folder",
      parentId: null,
      children: ["node-1", "node-2", "node-3", "node-4"],
      inode: 2,
      created: "2026-06-15T07:00:00.000Z",
      modified: "2026-06-15T07:00:00.000Z",
      permissions: "0755"
    },
    "node-1": {
      id: "node-1",
      name: "home",
      type: "folder",
      parentId: "root",
      children: ["node-5"],
      inode: 12,
      created: "2026-06-15T07:01:00.000Z",
      modified: "2026-06-15T07:01:00.000Z",
      permissions: "0755"
    },
    "node-2": {
      id: "node-2",
      name: "bin",
      type: "folder",
      parentId: "root",
      children: ["node-6", "node-7", "node-8"],
      inode: 13,
      created: "2026-06-15T07:02:00.000Z",
      modified: "2026-06-15T07:02:00.000Z",
      permissions: "0755"
    },
    "node-3": {
      id: "node-3",
      name: "etc",
      type: "folder",
      parentId: "root",
      children: ["node-9"],
      inode: 14,
      created: "2026-06-15T07:02:12.000Z",
      modified: "2026-06-15T07:02:12.000Z",
      permissions: "0755"
    },
    "node-4": {
      id: "node-4",
      name: "var",
      type: "folder",
      parentId: "root",
      children: ["node-10"],
      inode: 15,
      created: "2026-06-15T07:02:30.000Z",
      modified: "2026-06-15T07:02:30.000Z",
      permissions: "0755"
    },
    "node-5": {
      id: "node-5",
      name: "guest",
      type: "folder",
      parentId: "node-1",
      children: ["node-11", "node-12"],
      inode: 25,
      created: "2026-06-15T07:03:00.000Z",
      modified: "2026-06-15T07:03:00.000Z",
      permissions: "0700"
    },
    "node-6": {
      id: "node-6",
      name: "ls",
      type: "file",
      parentId: "node-2",
      content: "[Binary LS Command Executable Data]",
      inode: 26,
      created: "2026-06-15T07:04:00.000Z",
      modified: "2026-06-15T07:04:00.000Z",
      permissions: "0775"
    },
    "node-7": {
      id: "node-7",
      name: "sh",
      type: "file",
      parentId: "node-2",
      content: "[Binary Shell Executable Command Processor]",
      inode: 27,
      created: "2026-06-15T07:04:15.000Z",
      modified: "2026-06-15T07:04:15.000Z",
      permissions: "0775"
    },
    "node-8": {
      id: "node-8",
      name: "mkdir",
      type: "file",
      parentId: "node-2",
      content: "[Binary MKDIR Folder Construction Utility]",
      inode: 28,
      created: "2026-06-15T07:04:30.000Z",
      modified: "2026-06-15T07:04:30.000Z",
      permissions: "0775"
    },
    "node-9": {
      id: "node-9",
      name: "config.json",
      type: "file",
      parentId: "node-3",
      content: '{\n  "version": "1.0.0",\n  "maxDiskSize": 65536,\n  "owner": "guest",\n  "system": "VirtualFS-v1"\n}',
      inode: 29,
      created: "2026-06-15T07:05:00.000Z",
      modified: "2026-06-15T07:05:00.000Z",
      permissions: "0644"
    },
    "node-10": {
      id: "node-10",
      name: "log",
      type: "folder",
      parentId: "node-4",
      children: ["node-13"],
      inode: 30,
      created: "2026-06-15T07:05:30.000Z",
      modified: "2026-06-15T07:05:30.000Z",
      permissions: "0755"
    },
    "node-11": {
      id: "node-11",
      name: "Welcome.txt",
      type: "file",
      parentId: "node-5",
      content: "Welcome to the File System Explorer Simulator!\n\nThis application simulates hierarchical storage tree resolutions, inodes metadata blocks, and shell execution scripting.\n\nUse GUI operations (toolbar add/rename/delete, double-click cards to navigate folders or edit files) or type commands in the UNIX CLI terminal on the right.",
      inode: 31,
      created: "2026-06-15T07:06:00.000Z",
      modified: "2026-06-15T07:06:00.000Z",
      permissions: "0644"
    },
    "node-12": {
      id: "node-12",
      name: "notes.txt",
      type: "file",
      parentId: "node-5",
      content: "OS Virtual File System (VFS) details:\n\n- Inode numbers are allocated sequentially.\n- File sizes are dynamic (1 character = 1 byte).\n- Folders are special directories cataloging child structures.",
      inode: 32,
      created: "2026-06-15T07:07:00.000Z",
      modified: "2026-06-15T07:07:00.000Z",
      permissions: "0644"
    },
    "node-13": {
      id: "node-13",
      name: "sys.log",
      type: "file",
      parentId: "node-10",
      content: "VFS Initial Boot Sequence completed successfully.\nLoaded standard environment template.\nMounting /dev/sda1 -> /root.\nStatic resources linked.",
      inode: 33,
      created: "2026-06-15T07:07:30.000Z",
      modified: "2026-06-15T07:08:12.000Z",
      permissions: "0640"
    }
  };

  // --- Initialize File System ---
  function initFileSystem() {
    const cached = localStorage.getItem("virtual_filesystem_state");
    if (cached) {
      try {
        fileSystem = JSON.parse(cached);
        // Clean missing properties
        ensureRootExists();
      } catch (e) {
        fileSystem = JSON.parse(JSON.stringify(DEFAULT_FS));
      }
    } else {
      fileSystem = JSON.parse(JSON.stringify(DEFAULT_FS));
    }

    // Allocate counters
    nodeCounter = Object.keys(fileSystem).length;
    let maxInode = 33;
    Object.values(fileSystem).forEach(node => {
      if (node.inode > maxInode) maxInode = node.inode;
    });
    lastInodeIndex = maxInode;

    currentFolderId = "root";
    selectedNodeId = null;
    historyBack = [];
    historyForward = [];
    expandedFolders = new Set(["root"]);

    renderAll();
    updateNavigationButtons();
    updateCliPrompt();
  }

  function ensureRootExists() {
    if (!fileSystem["root"]) {
      fileSystem = JSON.parse(JSON.stringify(DEFAULT_FS));
    }
  }

  function saveToLocalStorage() {
    localStorage.setItem("virtual_filesystem_state", JSON.stringify(fileSystem));
  }

  // --- Size & Usage Calculator ---
  function calculateSystemSize() {
    let totalBytes = 0;
    Object.values(fileSystem).forEach(node => {
      if (node.type === "file") {
        totalBytes += (node.content || "").length;
      }
    });
    return totalBytes;
  }

  function updateDiskUsageBar() {
    const totalBytes = calculateSystemSize();
    const percent = Math.min((totalBytes / DISK_SIZE_LIMIT) * 100, 100);
    
    diskBytesLabel.textContent = `${totalBytes.toLocaleString()} / ${(DISK_SIZE_LIMIT / 1024)} KB`;
    diskProgressFill.style.width = `${percent}%`;

    if (percent > 90) {
      diskProgressFill.style.backgroundColor = "var(--color-danger)";
    } else if (percent > 65) {
      diskProgressFill.style.backgroundColor = "var(--color-file-txt)";
    } else {
      diskProgressFill.style.backgroundColor = "";
    }
  }

  // --- Inode Generator Helper ---
  function allocateNewInode() {
    lastInodeIndex++;
    return lastInodeIndex;
  }

  function generateUniqueId() {
    nodeCounter++;
    return `node-${Date.now()}-${nodeCounter}`;
  }

  // --- CRUD Operation Routines ---
  function createDirectory(name, parentId = currentFolderId) {
    // Validation
    if (!isValidFilename(name)) return { error: "Invalid folder name characters." };
    if (checkDuplicateName(name, parentId)) return { error: "A directory or file with this name already exists." };

    const newId = generateUniqueId();
    const newDirNode = {
      id: newId,
      name: name,
      type: "folder",
      parentId: parentId,
      children: [],
      inode: allocateNewInode(),
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      permissions: "0755"
    };

    fileSystem[newId] = newDirNode;
    fileSystem[parentId].children.push(newId);
    fileSystem[parentId].modified = new Date().toISOString();

    saveToLocalStorage();
    renderAll();
    return { node: newDirNode };
  }

  function createFile(name, content = "", parentId = currentFolderId) {
    // Validation
    if (!isValidFilename(name)) return { error: "Invalid file name characters." };
    if (checkDuplicateName(name, parentId)) return { error: "A file or directory with this name already exists." };
    
    // Disk Space Check
    const spaceNeeded = content.length;
    if (calculateSystemSize() + spaceNeeded > DISK_SIZE_LIMIT) {
      return { error: "Virtual storage disk is full! Evict or shrink file sizes first." };
    }

    const newId = generateUniqueId();
    const newFileNode = {
      id: newId,
      name: name,
      type: "file",
      parentId: parentId,
      content: content,
      inode: allocateNewInode(),
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      permissions: "0644"
    };

    fileSystem[newId] = newFileNode;
    fileSystem[parentId].children.push(newId);
    fileSystem[parentId].modified = new Date().toISOString();

    saveToLocalStorage();
    renderAll();
    return { node: newFileNode };
  }

  function deleteNode(nodeId) {
    if (nodeId === "root") return { error: "Cannot delete the root directory." };
    const node = fileSystem[nodeId];
    if (!node) return { error: "Target node not found." };

    // If folder, recursively delete child nodes
    if (node.type === "folder") {
      deleteFolderRecursive(nodeId);
    } else {
      delete fileSystem[nodeId];
    }

    // Remove reference from parent children list
    const parent = fileSystem[node.parentId];
    if (parent) {
      parent.children = parent.children.filter(id => id !== nodeId);
      parent.modified = new Date().toISOString();
    }

    // Clear current folder pointer if active deleted
    if (currentFolderId === nodeId) {
      currentFolderId = "root";
      historyBack = [];
      historyForward = [];
    }

    if (selectedNodeId === nodeId) {
      selectedNodeId = null;
    }

    saveToLocalStorage();
    renderAll();
    updateNavigationButtons();
    return { success: true };
  }

  function deleteFolderRecursive(folderId) {
    const node = fileSystem[folderId];
    if (!node) return;

    if (node.children) {
      node.children.forEach(childId => {
        const child = fileSystem[childId];
        if (child) {
          if (child.type === "folder") {
            deleteFolderRecursive(childId);
          } else {
            delete fileSystem[childId];
          }
        }
      });
    }

    expandedFolders.delete(folderId);
    delete fileSystem[folderId];
  }

  function renameNode(nodeId, newName) {
    if (nodeId === "root") return { error: "Cannot rename root directory." };
    if (!isValidFilename(newName)) return { error: "Invalid name characters." };
    
    const node = fileSystem[nodeId];
    if (!node) return { error: "Target node not found." };

    if (checkDuplicateName(newName, node.parentId, nodeId)) {
      return { error: "A directory or file with this name already exists." };
    }

    node.name = newName;
    node.modified = new Date().toISOString();

    saveToLocalStorage();
    renderAll();
    return { node: node };
  }

  function writeFileContent(nodeId, newContent) {
    const node = fileSystem[nodeId];
    if (!node || node.type !== "file") return { error: "Target file not found." };

    const originalLength = (node.content || "").length;
    const sizeDiff = newContent.length - originalLength;

    if (calculateSystemSize() + sizeDiff > DISK_SIZE_LIMIT) {
      return { error: "Disk Full! Cannot save modifications." };
    }

    node.content = newContent;
    node.modified = new Date().toISOString();

    saveToLocalStorage();
    renderAll();
    return { node: node };
  }

  // --- Path Resolver & Helper Functions ---
  function getAbsolutePath(nodeId) {
    if (nodeId === "root") return "/";
    
    const pathParts = [];
    let curr = fileSystem[nodeId];
    while (curr && curr.parentId !== null) {
      pathParts.unshift(curr.name);
      curr = fileSystem[curr.parentId];
    }
    return "/" + pathParts.join("/");
  }

  // Parses a string path (e.g. '/usr/bin' or '../log') and resolves to its VFS node
  function resolvePath(pathStr, relativeNodeId = currentFolderId) {
    if (!pathStr || pathStr.trim() === "") return fileSystem[relativeNodeId];

    let currentNode = fileSystem[relativeNodeId];
    pathStr = pathStr.trim();

    // Handle absolute path resolution start
    if (pathStr.startsWith("/")) {
      currentNode = fileSystem["root"];
      pathStr = pathStr.substring(1);
    }

    if (pathStr === "") return currentNode;

    const tokens = pathStr.split("/");
    for (let token of tokens) {
      if (token === "" || token === ".") continue;
      
      if (token === "..") {
        if (currentNode.parentId !== null) {
          currentNode = fileSystem[currentNode.parentId];
        }
      } else {
        // Search child node
        const childId = currentNode.children.find(cid => {
          const childNode = fileSystem[cid];
          return childNode && childNode.name === token;
        });

        if (childId) {
          currentNode = fileSystem[childId];
        } else {
          return null; // Path breaks
        }
      }
    }

    return currentNode;
  }

  function checkDuplicateName(name, parentId, excludeId = null) {
    const parent = fileSystem[parentId];
    if (!parent || !parent.children) return false;
    
    return parent.children.some(cid => {
      if (excludeId && cid === excludeId) return false;
      const child = fileSystem[cid];
      return child && child.name.toLowerCase() === name.toLowerCase();
    });
  }

  function isValidFilename(name) {
    if (!name || name.trim() === "") return false;
    if (name.length > 64) return false;
    // Disallow path characters, slash, backslash or invalid characters
    return !/[\\/:*?"<>|]/.test(name);
  }

  // --- UI Renderers ---
  function renderAll() {
    renderDirectoryTree();
    renderExplorerGrid();
    renderBreadcrumbs();
    renderMetadataDetails();
    updateDiskUsageBar();
  }

  // 1. Recursive Tree Sidebar Renderer
  function renderDirectoryTree() {
    treeContainer.innerHTML = "";
    
    function createTreeNodeElement(nodeId, depth = 0) {
      const node = fileSystem[nodeId];
      if (!node || node.type !== "folder") return null;

      const itemDiv = document.createElement("div");
      itemDiv.className = "tree-node-item";

      const rowDiv = document.createElement("div");
      rowDiv.className = "tree-row";
      if (nodeId === currentFolderId) {
        rowDiv.classList.add("active-folder");
      }
      rowDiv.style.paddingLeft = `${depth * 14 + 8}px`;

      // Arrow indicator for children toggle
      const arrowSpan = document.createElement("span");
      arrowSpan.className = "tree-arrow-toggle";
      
      const hasFolders = node.children.some(cid => fileSystem[cid] && fileSystem[cid].type === "folder");
      if (hasFolders) {
        const isCollapsed = !expandedFolders.has(nodeId);
        if (isCollapsed) {
          arrowSpan.classList.add("collapsed");
        }
        arrowSpan.innerHTML = "&#9662;"; // down arrow
      } else {
        arrowSpan.classList.add("leaf-node");
        arrowSpan.innerHTML = "&#8226;";
      }
      rowDiv.appendChild(arrowSpan);

      // Icon
      const iconSpan = document.createElement("span");
      iconSpan.className = "tree-icon icon-folder";
      iconSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`;
      rowDiv.appendChild(iconSpan);

      // Label
      const labelSpan = document.createElement("span");
      labelSpan.className = "tree-label";
      labelSpan.textContent = nodeId === "root" ? "/" : node.name;
      rowDiv.appendChild(labelSpan);

      itemDiv.appendChild(rowDiv);

      // Children list
      const childrenDiv = document.createElement("div");
      childrenDiv.className = "tree-children";
      if (!expandedFolders.has(nodeId)) {
        childrenDiv.classList.add("collapsed");
      }

      // Event click logic
      rowDiv.addEventListener("click", (e) => {
        // Toggle collapse/expand on arrow click
        if (e.target.classList.contains("tree-arrow-toggle")) {
          e.stopPropagation();
          toggleFolderCollapse(nodeId);
          return;
        }

        navigateToFolder(nodeId);
      });

      // Populate folders recursively
      node.children.forEach(childId => {
        const childNode = fileSystem[childId];
        if (childNode && childNode.type === "folder") {
          const childElement = createTreeNodeElement(childId, depth + 1);
          if (childElement) childrenDiv.appendChild(childElement);
        }
      });

      itemDiv.appendChild(childrenDiv);
      return itemDiv;
    }

    const treeRoot = createTreeNodeElement("root");
    if (treeRoot) treeContainer.appendChild(treeRoot);
  }

  function toggleFolderCollapse(folderId) {
    if (expandedFolders.has(folderId)) {
      expandedFolders.delete(folderId);
    } else {
      expandedFolders.add(folderId);
    }
    renderDirectoryTree();
  }

  // 2. Folder grid content workspace list
  function renderExplorerGrid() {
    explorerGrid.innerHTML = "";
    const currentFolder = fileSystem[currentFolderId];
    if (!currentFolder) return;

    let itemsToDisplay = currentFolder.children;

    // Handle global search override
    const searchVal = globalSearch.value.trim().toLowerCase();
    if (searchVal !== "") {
      itemsToDisplay = Object.keys(fileSystem).filter(id => {
        if (id === "root") return false;
        const node = fileSystem[id];
        return node && node.name.toLowerCase().includes(searchVal);
      });
    }

    if (itemsToDisplay.length === 0) {
      const emptyMsg = document.createElement("p");
      emptyMsg.className = "select-hint";
      emptyMsg.textContent = searchVal !== "" ? "No matching files or folders found." : "This directory is empty.";
      explorerGrid.appendChild(emptyMsg);
      return;
    }

    itemsToDisplay.forEach(nodeId => {
      const node = fileSystem[nodeId];
      if (!node) return;

      const itemDiv = document.createElement("div");
      itemDiv.className = "explorer-grid-item";
      if (selectedNodeId === nodeId) {
        itemDiv.classList.add("selected-item");
      }
      itemDiv.dataset.id = nodeId;

      const iconWrapper = document.createElement("div");
      iconWrapper.className = "explorer-grid-icon-wrapper";

      // Icon type picker
      if (node.type === "folder") {
        iconWrapper.classList.add("icon-folder");
        iconWrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`;
      } else {
        const ext = getFileExtension(node.name);
        if (ext === "txt") {
          iconWrapper.classList.add("icon-file-txt");
          iconWrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
        } else if (["js", "json", "html", "css", "py", "c", "cpp"].includes(ext)) {
          iconWrapper.classList.add("icon-file-code");
          iconWrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><polyline points="8 17 11 14 8 11"></polyline><line x1="12" y1="17" x2="16" y2="17"></line></svg>`;
        } else if (["png", "jpg", "jpeg", "gif", "svg"].includes(ext)) {
          iconWrapper.classList.add("icon-file-img");
          iconWrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><circle cx="9" cy="13" r="1.5"></circle><polygon points="19 21 12 14 8 18"></polygon></svg>`;
        } else {
          iconWrapper.classList.add("icon-file-unknown");
          iconWrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`;
        }
      }
      itemDiv.appendChild(iconWrapper);

      const nameSpan = document.createElement("span");
      nameSpan.className = "explorer-item-name";
      nameSpan.textContent = node.name;
      itemDiv.appendChild(nameSpan);

      // Click: selection
      itemDiv.addEventListener("click", (e) => {
        e.stopPropagation();
        selectGridItem(nodeId);
      });

      // Double-click: open file editor or navigate folder
      itemDiv.addEventListener("dblclick", () => {
        if (node.type === "folder") {
          navigateToFolder(nodeId);
        } else {
          openFileEditor(nodeId);
        }
      });

      explorerGrid.appendChild(itemDiv);
    });
  }

  function getFileExtension(filename) {
    if (!filename || !filename.includes(".")) return "";
    return filename.split(".").pop().toLowerCase();
  }

  function selectGridItem(nodeId) {
    selectedNodeId = nodeId;
    renderExplorerGrid();
    renderMetadataDetails();
    
    // Enable/Disable action toolbar buttons
    btnRenameNode.removeAttribute("disabled");
    btnDeleteNode.removeAttribute("disabled");
  }

  function clearGridSelection() {
    selectedNodeId = null;
    renderExplorerGrid();
    renderMetadataDetails();
    
    btnRenameNode.setAttribute("disabled", "true");
    btnDeleteNode.setAttribute("disabled", "true");
  }

  // 3. Navigation Breadcrumbs Bar
  function renderBreadcrumbs() {
    breadcrumbsBar.innerHTML = "";
    
    // Build array of parent folder nodes
    const crumbNodes = [];
    let curr = fileSystem[currentFolderId];
    while (curr) {
      crumbNodes.unshift(curr);
      curr = curr.parentId ? fileSystem[curr.parentId] : null;
    }

    crumbNodes.forEach((node, index) => {
      const span = document.createElement("span");
      span.className = "breadcrumb-crumb";
      span.textContent = node.id === "root" ? "root" : node.name;
      
      if (index === crumbNodes.length - 1) {
        span.classList.add("active-crumb");
      } else {
        span.addEventListener("click", () => {
          navigateToFolder(node.id);
        });
      }
      breadcrumbsBar.appendChild(span);

      if (index < crumbNodes.length - 1) {
        const separator = document.createElement("span");
        separator.className = "breadcrumb-separator";
        separator.textContent = "/";
        breadcrumbsBar.appendChild(separator);
      }
    });
  }

  // 4. Inode Metadata Card
  function renderMetadataDetails() {
    const activeNodeId = selectedNodeId || currentFolderId;
    const node = fileSystem[activeNodeId];
    
    if (!node) {
      metadataDetails.innerHTML = `<p class="select-hint">Select a file or folder to view its OS metadata descriptors.</p>`;
      return;
    }

    const absPath = getAbsolutePath(node.id);
    const byteSize = node.type === "file" ? (node.content || "").length : calculateFolderSizeRecursive(node.id);

    metadataDetails.innerHTML = `
      <div class="detail-row">
        <span class="detail-label">Name:</span>
        <span class="detail-value detail-value-highlight">${node.name}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Type:</span>
        <span class="detail-value">${node.type.toUpperCase()}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Inode Index:</span>
        <span class="detail-value">${node.inode}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Size:</span>
        <span class="detail-value">${byteSize} bytes</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Absolute Path:</span>
        <span class="detail-value" title="${absPath}">${absPath}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Permissions:</span>
        <span class="detail-value">${node.permissions}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Created:</span>
        <span class="detail-value">${formatDate(node.created)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Last Modified:</span>
        <span class="detail-value">${formatDate(node.modified)}</span>
      </div>
    `;
  }

  function calculateFolderSizeRecursive(folderId) {
    let size = 0;
    const node = fileSystem[folderId];
    if (!node || !node.children) return 0;

    node.children.forEach(cid => {
      const child = fileSystem[cid];
      if (child) {
        if (child.type === "file") {
          size += (child.content || "").length;
        } else {
          size += calculateFolderSizeRecursive(cid);
        }
      }
    });
    return size;
  }

  function formatDate(isoStr) {
    if (!isoStr) return "--";
    const d = new Date(isoStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " " + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  // --- Folder Traversals Navigation ---
  function navigateToFolder(folderId) {
    if (folderId === currentFolderId) return;
    
    // Clear selections in old folder
    clearGridSelection();
    
    // Push history
    historyBack.push(currentFolderId);
    historyForward = []; // Clear forward stack
    
    currentFolderId = folderId;
    
    // Auto-expand this folder in tree sidebar
    expandedFolders.add(folderId);

    renderAll();
    updateNavigationButtons();
    updateCliPrompt();
  }

  function updateNavigationButtons() {
    btnNavBack.disabled = historyBack.length === 0;
    btnNavForward.disabled = historyForward.length === 0;
  }

  function updateCliPrompt() {
    const path = getAbsolutePath(currentFolderId);
    cliPromptLabel.textContent = `vfs:${path}$`;
  }

  // --- Modal File Editor Controls ---
  function openFileEditor(fileId) {
    const node = fileSystem[fileId];
    if (!node || node.type !== "file") return;

    editingFileNode = node;
    editorFileTitle.textContent = `Editing ${node.name}`;
    editorTextArea.value = node.content || "";
    
    // Update dynamically as user edits size labels
    updateEditorSizeLabel();
    
    editorModal.classList.remove("hidden");
    editorTextArea.focus();
  }

  function closeFileEditor() {
    editorModal.classList.add("hidden");
    editingFileNode = null;
  }

  function updateEditorSizeLabel() {
    const size = editorTextArea.value.length;
    editorSizeLabel.textContent = `${size} bytes`;
    if (calculateSystemSize() - (editingFileNode ? (editingFileNode.content || "").length : 0) + size > DISK_SIZE_LIMIT) {
      editorSizeLabel.style.color = "var(--color-danger)";
    } else {
      editorSizeLabel.style.color = "";
    }
  }

  editorTextArea.addEventListener("input", updateEditorSizeLabel);

  btnModalCancel.addEventListener("click", closeFileEditor);
  btnModalClose.addEventListener("click", closeFileEditor);

  btnModalSave.addEventListener("click", () => {
    if (!editingFileNode) return;
    const content = editorTextArea.value;
    const res = writeFileContent(editingFileNode.id, content);
    if (res.error) {
      alert(res.error);
    } else {
      closeFileEditor();
    }
  });

  // --- Toolbar & Context Button Handlers ---
  btnNewFolder.addEventListener("click", () => {
    const folderName = prompt("Enter new folder name:");
    if (folderName === null) return;
    
    const res = createDirectory(folderName.trim());
    if (res.error) {
      alert(res.error);
    }
  });

  btnNewFile.addEventListener("click", () => {
    const fileName = prompt("Enter new file name (e.g. document.txt):");
    if (fileName === null) return;

    const res = createFile(fileName.trim(), "");
    if (res.error) {
      alert(res.error);
    } else {
      // Open editor immediately for new files
      openFileEditor(res.node.id);
    }
  });

  btnRenameNode.addEventListener("click", () => {
    if (!selectedNodeId) return;
    const node = fileSystem[selectedNodeId];
    if (!node) return;

    const newName = prompt(`Enter new name for ${node.name}:`, node.name);
    if (newName === null) return;

    const res = renameNode(selectedNodeId, newName.trim());
    if (res.error) {
      alert(res.error);
    } else {
      clearGridSelection();
    }
  });

  btnDeleteNode.addEventListener("click", () => {
    if (!selectedNodeId) return;
    const node = fileSystem[selectedNodeId];
    if (!node) return;

    const confirmDel = confirm(`Are you sure you want to delete ${node.name} and all its nested subfolders?`);
    if (!confirmDel) return;

    const res = deleteNode(selectedNodeId);
    if (res.error) {
      alert(res.error);
    } else {
      clearGridSelection();
    }
  });

  // Navigation Click Actions
  btnNavBack.addEventListener("click", () => {
    if (historyBack.length === 0) return;
    clearGridSelection();
    historyForward.push(currentFolderId);
    currentFolderId = historyBack.pop();
    renderAll();
    updateNavigationButtons();
    updateCliPrompt();
  });

  btnNavForward.addEventListener("click", () => {
    if (historyForward.length === 0) return;
    clearGridSelection();
    historyBack.push(currentFolderId);
    currentFolderId = historyForward.pop();
    renderAll();
    updateNavigationButtons();
    updateCliPrompt();
  });

  globalSearch.addEventListener("input", () => {
    clearGridSelection();
    renderExplorerGrid();
  });

  btnResetFs.addEventListener("click", () => {
    const confirmReset = confirm("Are you sure you want to wipe local changes and reset filesystem to default templates?");
    if (confirmReset) {
      localStorage.removeItem("virtual_filesystem_state");
      initFileSystem();
    }
  });

  // Clear explorer grid selection when clicking empty space
  explorerGrid.addEventListener("click", (e) => {
    if (e.target === explorerGrid) {
      clearGridSelection();
    }
  });

  // --- Virtual CLI Terminal Processor ---
  terminalInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const commandLine = terminalInput.value.trim();
      terminalInput.value = "";
      if (commandLine === "") return;

      executeTerminalCommand(commandLine);
    }
  });

  btnClearTerminal.addEventListener("click", () => {
    terminalBodyLog.innerHTML = "";
  });

  function executeTerminalCommand(cmdLine) {
    // Write prompt echo
    writeTerminalRow(`${getAbsolutePath(currentFolderId)}$ ${cmdLine}`, "cli-command-echo");

    // Tokenize command line supporting quotes
    const args = parseCommandLineTokens(cmdLine);
    const mainCommand = args[0].toLowerCase();

    switch (mainCommand) {
      case "help":
        writeTerminalRow(
          `Supported UNIX Commands:\n` +
          `  ls                 - List contents of current directory.\n` +
          `  cd [path]          - Change working directory.\n` +
          `  pwd                - Print current absolute folder path.\n` +
          `  mkdir [name]       - Create a new folder directory.\n` +
          `  touch [name]       - Create a new empty text file.\n` +
          `  rm [name]          - Remove target file or directory.\n` +
          `  cat [name]         - View text content of a file.\n` +
          `  echo "[text]" > [file] - Write contents to file (overwrites).\n` +
          `  find [query]       - Search files globally.\n` +
          `  clear              - Wipe terminal screen log.\n` +
          `  help               - Display this instruction deck.`
        );
        break;

      case "ls":
        let targetFolderNode = fileSystem[currentFolderId];
        if (args.length > 1) {
          const res = resolvePath(args[1]);
          if (!res) {
            writeTerminalRow(`ls: ${args[1]}: No such file or directory`, "error-output");
            break;
          }
          if (res.type === "file") {
            writeTerminalRow(res.name);
            break;
          }
          targetFolderNode = res;
        }

        if (targetFolderNode.children.length === 0) {
          writeTerminalRow("");
          break;
        }

        const lsDetails = targetFolderNode.children.map(cid => {
          const node = fileSystem[cid];
          return node.type === "folder" ? `${node.name}/` : node.name;
        });
        writeTerminalRow(lsDetails.join("   "), "success-output");
        break;

      case "cd":
        if (args.length < 2) {
          // Go to root
          navigateToFolder("root");
          writeTerminalRow("");
          break;
        }
        const targetNode = resolvePath(args[1]);
        if (!targetNode) {
          writeTerminalRow(`cd: ${args[1]}: No such file or directory`, "error-output");
        } else if (targetNode.type !== "folder") {
          writeTerminalRow(`cd: ${args[1]}: Not a directory`, "error-output");
        } else {
          navigateToFolder(targetNode.id);
          writeTerminalRow("");
        }
        break;

      case "pwd":
        writeTerminalRow(getAbsolutePath(currentFolderId));
        break;

      case "mkdir":
        if (args.length < 2) {
          writeTerminalRow("mkdir: missing operand", "error-output");
          break;
        }
        const dirRes = createDirectory(args[1]);
        if (dirRes.error) {
          writeTerminalRow(`mkdir: ${dirRes.error}`, "error-output");
        } else {
          writeTerminalRow(`Created directory '${args[1]}'`, "system-output");
        }
        break;

      case "touch":
        if (args.length < 2) {
          writeTerminalRow("touch: missing file operand", "error-output");
          break;
        }
        const fileRes = createFile(args[1], "");
        if (fileRes.error) {
          writeTerminalRow(`touch: ${fileRes.error}`, "error-output");
        } else {
          writeTerminalRow(`Created empty file '${args[1]}'`, "system-output");
        }
        break;

      case "rm":
        if (args.length < 2) {
          writeTerminalRow("rm: missing operand", "error-output");
          break;
        }
        const targetDelNode = resolvePath(args[1]);
        if (!targetDelNode) {
          writeTerminalRow(`rm: ${args[1]}: No such file or directory`, "error-output");
        } else {
          const delRes = deleteNode(targetDelNode.id);
          if (delRes.error) {
            writeTerminalRow(`rm: ${delRes.error}`, "error-output");
          } else {
            writeTerminalRow(`Removed '${args[1]}'`, "system-output");
          }
        }
        break;

      case "cat":
        if (args.length < 2) {
          writeTerminalRow("cat: missing file operand", "error-output");
          break;
        }
        const targetCatNode = resolvePath(args[1]);
        if (!targetCatNode) {
          writeTerminalRow(`cat: ${args[1]}: No such file or directory`, "error-output");
        } else if (targetCatNode.type !== "file") {
          writeTerminalRow(`cat: ${args[1]}: Is a directory`, "error-output");
        } else {
          writeTerminalRow(targetCatNode.content || "[Empty File Content]");
        }
        break;

      case "echo":
        handleEchoCommand(args);
        break;

      case "find":
        if (args.length < 2) {
          writeTerminalRow("find: missing search query", "error-output");
          break;
        }
        const query = args[1].toLowerCase();
        const results = Object.keys(fileSystem).filter(id => {
          if (id === "root") return false;
          return fileSystem[id].name.toLowerCase().includes(query);
        });

        if (results.length === 0) {
          writeTerminalRow(`No matches found for query '${args[1]}'`);
        } else {
          const matchedPaths = results.map(id => getAbsolutePath(id));
          writeTerminalRow(matchedPaths.join("\n"), "success-output");
        }
        break;

      case "clear":
        terminalBodyLog.innerHTML = "";
        break;

      default:
        writeTerminalRow(`sh: command not found: ${mainCommand}. Type 'help' for instructions.`, "error-output");
    }
  }

  function handleEchoCommand(args) {
    // Formats supported:
    // echo "some text" > file.txt
    // echo some text
    if (args.length < 2) {
      writeTerminalRow("");
      return;
    }

    // Check redirection
    const redirectIndex = args.indexOf(">");
    const appendIndex = args.indexOf(">>");

    if (redirectIndex === -1 && appendIndex === -1) {
      // Just print text to screen
      writeTerminalRow(args.slice(1).join(" "));
      return;
    }

    const modeIndex = redirectIndex !== -1 ? redirectIndex : appendIndex;
    const isAppend = appendIndex !== -1;

    if (modeIndex === args.length - 1) {
      writeTerminalRow("sh: syntax error near unexpected token 'newline'", "error-output");
      return;
    }

    const textToEcho = args.slice(1, modeIndex).join(" ").replace(/^["']|["']$/g, '');
    const filename = args[modeIndex + 1];

    // Find if file already exists
    const resolvedFile = resolvePath(filename);
    if (resolvedFile) {
      if (resolvedFile.type === "folder") {
        writeTerminalRow(`sh: ${filename}: Is a directory`, "error-output");
        return;
      }

      // Modify existing file
      const newContent = isAppend ? (resolvedFile.content + textToEcho) : textToEcho;
      const res = writeFileContent(resolvedFile.id, newContent);
      if (res.error) {
        writeTerminalRow(`sh: ${res.error}`, "error-output");
      } else {
        writeTerminalRow(`Modified '${filename}'`, "system-output");
      }
    } else {
      // Create new file with content
      const parentNode = fileSystem[currentFolderId];
      const res = createFile(filename, textToEcho, parentNode.id);
      if (res.error) {
        writeTerminalRow(`sh: ${res.error}`, "error-output");
      } else {
        writeTerminalRow(`Written into new file '${filename}'`, "system-output");
      }
    }
  }

  function writeTerminalRow(text, typeClass = "system-output") {
    const el = document.createElement("div");
    el.className = `cli-row ${typeClass}`;
    el.textContent = text;
    terminalBodyLog.appendChild(el);
    terminalBodyLog.scrollTop = terminalBodyLog.scrollHeight;
  }

  function parseCommandLineTokens(cmdLine) {
    const result = [];
    let currentToken = "";
    let inQuotes = false;
    let quoteChar = "";

    for (let i = 0; i < cmdLine.length; i++) {
      const char = cmdLine[i];
      if (inQuotes) {
        if (char === quoteChar) {
          inQuotes = false;
          // Include quotes in output to let echo handle striping
          currentToken += char;
        } else {
          currentToken += char;
        }
      } else {
        if (char === ' ' || char === '\t') {
          if (currentToken !== "") {
            result.push(currentToken);
            currentToken = "";
          }
        } else if (char === '"' || char === "'") {
          inQuotes = true;
          quoteChar = char;
          currentToken += char;
        } else if (char === '>' && cmdLine[i + 1] === '>') {
          if (currentToken !== "") {
            result.push(currentToken);
            currentToken = "";
          }
          result.push(">>");
          i++; // skip next char
        } else if (char === '>') {
          if (currentToken !== "") {
            result.push(currentToken);
            currentToken = "";
          }
          result.push(">");
        } else {
          currentToken += char;
        }
      }
    }

    if (currentToken !== "") {
      result.push(currentToken);
    }
    return result;
  }

  // --- Initial Kickstart ---
  initFileSystem();
});
