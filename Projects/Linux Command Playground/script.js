/**
 * Linuxtry - Linux Command Playground script.js
 * In-memory VFS models, Unix commands parser, file tree renderer, and missions progression check system.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- VFS Setup ---
  class VFS {
    constructor() {
      this.root = {
        name: '/',
        type: 'dir',
        children: {
          home: {
            name: 'home',
            type: 'dir',
            children: {
              user: {
                name: 'user',
                type: 'dir',
                children: {
                  'welcome.txt': { name: 'welcome.txt', type: 'file', content: 'Welcome to Linuxtry Terminal Sandbox!\nType "help" to see all available commands.\nComplete the missions in the left sidebar to master shell operations.' },
                  'notes.md': { name: 'notes.md', type: 'file', content: '# TODO\n- Navigate the filesystem\n- Create a directory\n- Delete this file in Mission 6' }
                }
              }
            }
          },
          var: {
            name: 'var',
            type: 'dir',
            children: {
              log: {
                name: 'log',
                type: 'dir',
                children: {
                  'syslog': { name: 'syslog', type: 'file', content: 'Jun 15 03:20:15 systemd[1]: Starting Daily Cleanup...\nJun 15 03:21:00 systemd[1]: Cleaned temp databases index records.' }
                }
              }
            }
          },
          etc: {
            name: 'etc',
            type: 'dir',
            children: {
              'hosts': { name: 'hosts', type: 'file', content: '127.0.0.1 localhost\n192.168.1.1 gateway\n10.0.0.5 database' }
            }
          }
        }
      };

      this.currentPath = '/home/user';
      this.rebuildParents(this.root, null);
    }

    rebuildParents(node, parent) {
      node.parent = parent;
      if (node.type === 'dir' && node.children) {
        Object.values(node.children).forEach(child => {
          this.rebuildParents(child, node);
        });
      }
    }

    resolveNode(pathStr) {
      let parts = [];
      let startNode = null;

      if (pathStr.startsWith('/')) {
        startNode = this.root;
        parts = pathStr.split('/').filter(Boolean);
      } else if (pathStr.startsWith('~')) {
        startNode = this.root.children.home.children.user;
        parts = pathStr.slice(1).split('/').filter(Boolean);
      } else {
        startNode = this.getNodeByPath(this.currentPath);
        parts = pathStr.split('/').filter(Boolean);
      }

      let current = startNode;
      let parent = current ? current.parent : null;

      for (let part of parts) {
        if (part === '.') {
          continue;
        }
        if (part === '..') {
          if (current.parent) {
            current = current.parent;
            parent = current.parent;
          }
          continue;
        }

        if (current.type !== 'dir' || !current.children) {
          return { error: `Not a directory: "${current.name}"` };
        }

        const nextNode = current.children[part];
        if (!nextNode) {
          return { error: `No such file or directory: "${part}"`, parentNode: current, missingName: part };
        }

        parent = current;
        current = nextNode;
      }

      return { 
        node: current, 
        name: current.name, 
        parentNode: parent, 
        absolutePath: this.getAbsolutePath(current) 
      };
    }

    getNodeByPath(pathStr) {
      if (pathStr === '/') return this.root;
      let parts = pathStr.split('/').filter(Boolean);
      let current = this.root;
      for (let p of parts) {
        if (!current.children || !current.children[p]) return null;
        current = current.children[p];
      }
      return current;
    }

    getAbsolutePath(node) {
      if (node === this.root) return '/';
      let path = '';
      let curr = node;
      while (curr && curr !== this.root) {
        path = '/' + curr.name + path;
        curr = curr.parent;
      }
      return path;
    }
  }

  // --- Guided Missions Map ---
  const missions = [
    {
      id: 1,
      title: 'List and Print',
      objective: 'List file contents and print the welcome message. Run: `cat welcome.txt` inside your home directory.',
      check: (vfs, lastCmd) => lastCmd.replace(/\s+/g, ' ') === 'cat welcome.txt' && vfs.currentPath === '/home/user'
    },
    {
      id: 2,
      title: 'Navigate Folders',
      objective: 'Navigate system logs directory. Change directory to `/var/log` using the `cd` command.',
      check: (vfs) => vfs.currentPath === '/var/log'
    },
    {
      id: 3,
      title: 'Create Directory',
      objective: 'Create a new project folder. Navigate to `/home/user` and create a directory named `projects`.',
      check: (vfs) => {
        const res = vfs.resolveNode('/home/user/projects');
        return !res.error && res.node.type === 'dir';
      }
    },
    {
      id: 4,
      title: 'File Redirection',
      objective: 'Create a text file using redirection. Write "hello linux" to a new file named `note.txt` inside `/home/user`. Hint: `echo "hello linux" > /home/user/note.txt`',
      check: (vfs) => {
        const res = vfs.resolveNode('/home/user/note.txt');
        return !res.error && res.node.type === 'file' && res.node.content.toLowerCase().includes('hello linux');
      }
    },
    {
      id: 5,
      title: 'Pattern Search',
      objective: 'Find network mappings. Search for "gateway" inside `/etc/hosts` using the `grep` command. Run: `grep gateway /etc/hosts`',
      check: (vfs, lastCmd) => {
        const normalized = lastCmd.replace(/\s+/g, ' ').toLowerCase();
        return normalized.includes('grep') && normalized.includes('gateway') && normalized.includes('/etc/hosts');
      }
    },
    {
      id: 6,
      title: 'Remove File',
      objective: 'Clean up unused files. Delete the file `notes.md` inside `/home/user` using the `rm` command.',
      check: (vfs) => {
        const res = vfs.resolveNode('/home/user/notes.md');
        return !!res.error; // true if file notes.md is missing (deleted)
      }
    }
  ];

  // --- DOM References ---
  const missionsListContainer = document.getElementById('missions-list');
  const missionTitle = document.getElementById('mission-title');
  const missionObjective = document.getElementById('mission-objective');
  const vfsTreeRoot = document.getElementById('vfs-tree-root');

  const progressFill = document.getElementById('progress-fill');
  const progressStatusText = document.getElementById('progress-status-text');

  const btnResetTerminal = document.getElementById('btn-reset-terminal');
  const terminalConsoleBuffer = document.getElementById('terminal-console-buffer');
  const terminalOutputLogs = document.getElementById('terminal-output-logs');
  const promptDirPath = document.getElementById('prompt-dir-path');
  const stdinInput = document.getElementById('terminal-stdin-input');
  const customCursor = document.getElementById('custom-cursor');

  // Create input display element dynamically for visual caret alignment
  const promptDisplayText = document.createElement('span');
  promptDisplayText.id = 'prompt-display-text';
  promptDisplayText.className = 'prompt-display-text';
  stdinInput.parentNode.insertBefore(promptDisplayText, stdinInput);

  // Focus input on click anywhere inside terminal
  terminalConsoleBuffer.addEventListener('click', () => {
    stdinInput.focus();
  });

  // --- App State ---
  let vfs = new VFS();
  let state = {
    activeMissionIndex: 0,
    completedMissions: [], // Completed mission IDs list
    cmdHistory: [],
    historyIndex: -1
  };

  // --- Terminal Command Line Custom Inputs Caret Positioning ---
  stdinInput.addEventListener('input', () => {
    const text = stdinInput.value;
    promptDisplayText.textContent = text;
    
    // Position cursor visual block right after character lengths
    const charWidth = 8.1; // estimate width in px for Fira Code monospace font size
    customCursor.style.left = `${text.length * charWidth}px`;
  });

  // Command History Navigation (Up/Down Arrow keys)
  stdinInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (state.cmdHistory.length > 0) {
        if (state.historyIndex === -1) {
          state.historyIndex = state.cmdHistory.length - 1;
        } else if (state.historyIndex > 0) {
          state.historyIndex--;
        }
        stdinInput.value = state.cmdHistory[state.historyIndex];
        triggerInputSync();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (state.historyIndex !== -1) {
        if (state.historyIndex < state.cmdHistory.length - 1) {
          state.historyIndex++;
          stdinInput.value = state.cmdHistory[state.historyIndex];
        } else {
          state.historyIndex = -1;
          stdinInput.value = '';
        }
        triggerInputSync();
      }
    } else if (e.key === 'Enter') {
      const rawInput = stdinInput.value;
      stdinInput.value = '';
      triggerInputSync();
      
      if (rawInput.trim() !== '') {
        state.cmdHistory.push(rawInput);
      }
      state.historyIndex = -1;

      executeCommand(rawInput);
    }
  });

  function triggerInputSync() {
    stdinInput.dispatchEvent(new Event('input'));
  }

  // --- Shell Interpreter Execution Engine ---
  function executeCommand(line) {
    const trimmed = line.trim();
    
    // 1. Output the typed command to console log buffer
    const promptPath = getFormattedPromptPath(vfs.currentPath);
    appendLogRow(`user@linuxbox:${promptPath}$ ${trimmed}`, 'terminal-white');

    if (!trimmed) {
      scrollToBottom();
      return;
    }

    // 2. Parse redirect checks (e.g. echo "hello" > file.txt)
    let commandLine = trimmed;
    let redirectType = null; // 'write' or 'append'
    let redirectPath = '';

    const writeRedirectIdx = trimmed.indexOf('>');
    if (writeRedirectIdx !== -1) {
      const isAppend = trimmed.charAt(writeRedirectIdx + 1) === '>';
      redirectType = isAppend ? 'append' : 'write';
      
      const splitIdx = isAppend ? writeRedirectIdx + 2 : writeRedirectIdx + 1;
      commandLine = trimmed.substring(0, writeRedirectIdx).trim();
      redirectPath = trimmed.substring(splitIdx).trim();
    }

    // Parse tokens/arguments
    // Matches arguments supporting spaces inside quotation blocks
    const tokens = commandLine.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
    const args = tokens.map(t => {
      if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
        return t.slice(1, -1);
      }
      return t;
    });

    const cmd = args[0].toLowerCase();
    const cmdArgs = args.slice(1);

    let output = '';
    let isError = false;

    try {
      switch (cmd) {
        case 'help':
          output = getHelpMessage();
          break;
        case 'clear':
          terminalOutputLogs.innerHTML = '';
          scrollToBottom();
          return;
        case 'pwd':
          output = vfs.currentPath;
          break;
        case 'pwd\n':
          output = vfs.currentPath;
          break;
        case 'ls':
          output = runLs(cmdArgs);
          break;
        case 'cd':
          runCd(cmdArgs);
          break;
        case 'cat':
          output = runCat(cmdArgs);
          break;
        case 'mkdir':
          runMkdir(cmdArgs);
          break;
        case 'touch':
          runTouch(cmdArgs);
          break;
        case 'rm':
          runRm(cmdArgs);
          break;
        case 'echo':
          output = runEcho(cmdArgs);
          break;
        case 'grep':
          output = runGrep(cmdArgs);
          break;
        default:
          output = `bash: command not found: ${cmd}`;
          isError = true;
      }

      // Handle file redirection write
      if (redirectType && !isError) {
        handleRedirection(redirectPath, output, redirectType === 'append');
        output = ''; // redirects don't print to console terminal
      }

    } catch (e) {
      output = `bash: ${e.message}`;
      isError = true;
    }

    // Print command execution results
    if (output) {
      appendLogRow(output, isError ? 'terminal-error' : '');
    }

    // Refresh components
    renderVfsTree();
    updatePromptDir();
    
    // Evaluate mission pass targets
    evaluateProgress(trimmed);

    scrollToBottom();
  }

  // --- Commands Operations Core ---
  function runLs(args) {
    let showAll = false;
    let listFormat = false;
    let path = '.';

    args.forEach(arg => {
      if (arg.startsWith('-')) {
        if (arg.includes('a')) showAll = true;
        if (arg.includes('l')) listFormat = true;
      } else {
        path = arg;
      }
    });

    const res = vfs.resolveNode(path);
    if (res.error) throw new Error(res.error);
    if (res.node.type !== 'dir') return res.node.name;

    const children = res.node.children || {};
    const keys = Object.keys(children);

    if (listFormat) {
      let result = [];
      if (showAll) {
        result.push(`drwxr-xr-x  2 user  user    4096 Jun 15 03:20 .`);
        result.push(`drwxr-xr-x  2 user  user    4096 Jun 15 03:20 ..`);
      }
      keys.forEach(k => {
        const node = children[k];
        const isDir = node.type === 'dir';
        const perm = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
        const size = isDir ? 4096 : (node.content || '').length;
        const colorClass = isDir ? 'terminal-info' : '';
        result.push(`${perm}  1 user  user  ${String(size).padStart(6)} Jun 15 03:20 ${k}`);
      });
      return result.join('\n');
    } else {
      let displayKeys = showAll ? ['.', '..', ...keys] : keys;
      return displayKeys.join('   ');
    }
  }

  function runCd(args) {
    const path = args[0] || '~';
    const res = vfs.resolveNode(path);
    if (res.error) throw new Error(res.error);
    if (res.node.type !== 'dir') throw new Error(`Not a directory: "${path}"`);
    vfs.currentPath = res.absolutePath;
  }

  function runCat(args) {
    if (args.length === 0) throw new Error('Missing file argument');
    const path = args[0];
    const res = vfs.resolveNode(path);
    if (res.error) throw new Error(res.error);
    if (res.node.type === 'dir') throw new Error(`Is a directory: "${path}"`);
    return res.node.content;
  }

  function runMkdir(args) {
    if (args.length === 0) throw new Error('Missing operand');
    const path = args[0];
    const res = vfs.resolveNode(path);
    
    // Node should NOT exist
    if (!res.error) throw new Error(`Cannot create directory: "${path}" file exists`);
    
    const parentNode = res.parentNode;
    const name = res.missingName;

    if (!parentNode || parentNode.type !== 'dir') {
      throw new Error(`Cannot create directory: parent directories do not exist`);
    }

    parentNode.children[name] = {
      name: name,
      type: 'dir',
      children: {}
    };
    
    vfs.rebuildParents(vfs.root, null);
  }

  function runTouch(args) {
    if (args.length === 0) throw new Error('Missing file operand');
    const path = args[0];
    const res = vfs.resolveNode(path);
    
    if (!res.error) {
      // If file exists, do nothing (touching simply updates timestamp)
      return;
    }

    const parentNode = res.parentNode;
    const name = res.missingName;

    if (!parentNode || parentNode.type !== 'dir') {
      throw new Error(`Cannot touch file: directories path invalid`);
    }

    parentNode.children[name] = {
      name: name,
      type: 'file',
      content: ''
    };
    
    vfs.rebuildParents(vfs.root, null);
  }

  function runRm(args) {
    let recursive = false;
    let path = '';

    args.forEach(arg => {
      if (arg === '-r' || arg === '-rf') recursive = true;
      else path = arg;
    });

    if (!path) throw new Error('Missing operand');
    const res = vfs.resolveNode(path);
    if (res.error) throw new Error(res.error);
    
    if (res.node === vfs.root) throw new Error('Permission denied: cannot delete root folder');

    if (res.node.type === 'dir' && !recursive) {
      throw new Error(`Cannot remove directory: "${path}" (Use rm -r to delete directories recursively)`);
    }

    delete res.parentNode.children[res.name];
  }

  function runEcho(args) {
    return args.join(' ');
  }

  function runGrep(args) {
    if (args.length < 2) throw new Error('Usage: grep [pattern] [filename]');
    const pattern = args[0].toLowerCase();
    const path = args[1];

    const res = vfs.resolveNode(path);
    if (res.error) throw new Error(res.error);
    if (res.node.type === 'dir') throw new Error(`Is a directory: "${path}"`);

    const lines = res.node.content.split('\n');
    const matches = lines.filter(line => line.toLowerCase().includes(pattern));

    if (matches.length === 0) return '';
    return matches.join('\n');
  }

  function handleRedirection(path, text, append) {
    const res = vfs.resolveNode(path);
    
    let targetFile = null;

    if (res.error) {
      const parentNode = res.parentNode;
      const name = res.missingName;
      if (!parentNode || parentNode.type !== 'dir') {
        throw new Error(`Directory path does not exist for redirect`);
      }
      // Create new file
      parentNode.children[name] = {
        name: name,
        type: 'file',
        content: ''
      };
      vfs.rebuildParents(vfs.root, null);
      targetFile = parentNode.children[name];
    } else {
      if (res.node.type === 'dir') {
        throw new Error(`Redirect target is a directory: "${path}"`);
      }
      targetFile = res.node;
    }

    if (append) {
      targetFile.content += (targetFile.content ? '\n' : '') + text;
    } else {
      targetFile.content = text;
    }
  }

  // Helper log builders
  function appendLogRow(text, className = '') {
    const row = document.createElement('div');
    row.className = `terminal-log-row ${className}`;
    row.textContent = text;
    terminalOutputLogs.appendChild(row);
  }

  function getFormattedPromptPath(path) {
    if (path === '/home/user') return '~';
    if (path.startsWith('/home/user')) return '~' + path.slice(10);
    return path;
  }

  function updatePromptDir() {
    promptDirPath.textContent = getFormattedPromptPath(vfs.currentPath);
  }

  function scrollToBottom() {
    terminalConsoleBuffer.scrollTop = terminalConsoleBuffer.scrollHeight;
  }

  // --- Left Sidebar VFS File Tree Explorer recursively rendering ---
  function renderVfsTree() {
    vfsTreeRoot.innerHTML = '';
    const rootEl = createTreeFolderNode(vfs.root, true);
    vfsTreeRoot.appendChild(rootEl);
  }

  function createTreeFolderNode(dirNode, isRootExpanded = false) {
    const wrapper = document.createElement('div');
    wrapper.className = 'tree-folder-node';

    const header = document.createElement('div');
    header.className = 'tree-node-title';
    
    // Root vs standard folder icons
    const iconClass = isRootExpanded ? 'fa-folder-open' : 'fa-folder';
    header.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${dirNode.name}</span>`;
    wrapper.appendChild(header);

    const childrenContainer = document.createElement('div');
    childrenContainer.className = 'tree-node-children';
    
    // Toggle expand fold logic on click
    if (!isRootExpanded) {
      childrenContainer.classList.add('hidden');
    }

    header.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = childrenContainer.classList.contains('hidden');
      if (isHidden) {
        childrenContainer.classList.remove('hidden');
        header.querySelector('i').className = 'fa-solid fa-folder-open';
      } else {
        childrenContainer.classList.add('hidden');
        header.querySelector('i').className = 'fa-solid fa-folder';
      }
    });

    const children = dirNode.children || {};
    Object.keys(children).forEach(k => {
      const child = children[k];
      if (child.type === 'dir') {
        const subFolder = createTreeFolderNode(child, false);
        childrenContainer.appendChild(subFolder);
      } else {
        const fileNode = document.createElement('div');
        fileNode.className = 'tree-file-node';
        fileNode.innerHTML = `<i class="fa-regular fa-file"></i> <span>${child.name}</span>`;
        
        fileNode.addEventListener('click', (e) => {
          e.stopPropagation();
          // Simulating double click or print contents inside terminal
          stdinInput.value = `cat ${vfs.getAbsolutePath(child)}`;
          triggerInputSync();
          stdinInput.focus();
        });

        childrenContainer.appendChild(fileNode);
      }
    });

    wrapper.appendChild(childrenContainer);
    return wrapper;
  }

  // --- Progression Missions Manager ---
  function evaluateProgress(lastCommand) {
    const activeMission = missions[state.activeMissionIndex];
    if (!activeMission) return;

    // Check pass criteria
    const passed = activeMission.check(vfs, lastCommand);
    
    if (passed && !state.completedMissions.includes(activeMission.id)) {
      state.completedMissions.push(activeMission.id);
      saveLocalProgress();

      // Output level complete log to terminal
      appendLogRow(`[OK] Mission ${activeMission.id} Completed! Unlocked next target.`, 'terminal-info');
      
      // Auto advance
      if (state.activeMissionIndex < missions.length - 1) {
        state.activeMissionIndex++;
      } else {
        // Complete game overlay
        appendLogRow('*** CONGRATULATIONS! ***\nYou have passed all terminal training tasks and completed all missions!', 'terminal-info');
      }

      renderMissionsList();
      loadActiveMissionBriefing();
    }
  }

  function loadLocalProgress() {
    try {
      const stored = localStorage.getItem('linuxtry_progress');
      if (stored) {
        state.completedMissions = JSON.parse(stored);
        
        // Find first uncompleted index
        let nextIndex = 0;
        for (let i = 0; i < missions.length; i++) {
          if (!state.completedMissions.includes(missions[i].id)) {
            nextIndex = i;
            break;
          }
        }
        state.activeMissionIndex = nextIndex;
        updateProgressGauge();
      }
    } catch (e) {
      console.error('Failed to load storage progress:', e);
    }
  }

  function saveLocalProgress() {
    try {
      localStorage.setItem('linuxtry_progress', JSON.stringify(state.completedMissions));
      updateProgressGauge();
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
  }

  function updateProgressGauge() {
    const total = missions.length;
    const count = state.completedMissions.length;
    const pct = (count / total) * 100;
    progressFill.style.width = `${pct}%`;
    progressStatusText.textContent = `${count} / ${total} Missions`;
  }

  function renderMissionsList() {
    missionsListContainer.innerHTML = '';
    
    missions.forEach((m, idx) => {
      const isPassed = state.completedMissions.includes(m.id);
      const isLocked = idx > 0 && !state.completedMissions.includes(missions[idx - 1].id);

      const card = document.createElement('div');
      card.className = `mission-item ${isPassed ? 'passed' : ''} ${isLocked ? 'locked' : ''} ${idx === state.activeMissionIndex ? 'active' : ''}`;

      let icon = '<i class="fa-regular fa-circle mission-item-icon"></i>';
      if (isPassed) icon = '<i class="fa-solid fa-circle-check mission-item-icon text-success"></i>';
      else if (isLocked) icon = '<i class="fa-solid fa-lock mission-item-icon"></i>';

      card.innerHTML = `
        <span class="mission-item-title">${m.id}. ${m.title}</span>
        ${icon}
      `;

      if (!isLocked) {
        card.addEventListener('click', () => {
          state.activeMissionIndex = idx;
          renderMissionsList();
          loadActiveMissionBriefing();
        });
      }

      missionsListContainer.appendChild(card);
    });
  }

  function loadActiveMissionBriefing() {
    const m = missions[state.activeMissionIndex];
    if (!m) return;

    missionTitle.textContent = `Mission ${m.id}: ${m.title}`;
    missionObjective.textContent = m.objective;
  }

  // Help details layout string
  function getHelpMessage() {
    return `Linuxtry Shell Command manual:
  ls [-l] [-a]   List folder items. -a shows hidden files, -l lists permissions/sizes
  cd [path]      Change working directory. Use ~ for home, .. for parent
  pwd            Print active path directory
  cat [file]     Display raw file content logs
  mkdir [name]   Generate subfolder directory
  touch [name]   Generate empty file placeholder
  rm [-r] [path] Delete file/folder. -r handles directories recursively
  echo [text]    Print input string (redirect using > or >> to write to files)
  grep [pat] [f] Filter line logs matching target pattern inside file
  clear          Wipe console buffer log outputs
  help           Display this manual reference list`;
  }

  // --- Event listeners reboot VFS ---
  btnResetTerminal.addEventListener('click', () => {
    if (confirm('Reboot terminal simulator? This resets the virtual filesystem.')) {
      vfs = new VFS();
      state.completedMissions = [];
      state.activeMissionIndex = 0;
      saveLocalProgress();

      terminalOutputLogs.innerHTML = `
        <div class="terminal-log-row text-accent">Terminal Rebooted. Virtual File System Refreshed.</div>
        <div class="terminal-log-row">Type "help" to see all available commands. Complete the missions in the left sidebar.</div>
        <div class="terminal-log-row" style="margin-bottom: 12px;"></div>
      `;

      renderVfsTree();
      updatePromptDir();
      renderMissionsList();
      loadActiveMissionBriefing();
      stdinInput.value = '';
      triggerInputSync();
      stdinInput.focus();
    }
  });

  // Start app
  loadLocalProgress();
  renderVfsTree();
  updatePromptDir();
  renderMissionsList();
  loadActiveMissionBriefing();
  triggerInputSync();
  stdinInput.focus();
});
