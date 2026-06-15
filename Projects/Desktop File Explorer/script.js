(function() {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const treeContainer = $('#treeContainer');
  const itemGrid = $('#itemGrid');
  const itemCount = $('#itemCount');
  const breadcrumb = $('#breadcrumb');
  const inspectorContent = $('#inspectorContent');
  const btnNewFolder = $('#btnNewFolder');
  const btnNewFile = $('#btnNewFile');
  const btnUp = $('#btnUp');
  const btnReconstruct = $('#btnReconstruct');
  const btnSync = $('#btnSync');
  const btnPurge = $('#btnPurge');

  let selectedItem = null;
  let currentPath = [];

  /* ─── FILE SYSTEM SEED ─── */
  function createSeed() {
    return {
      name: 'root', type: 'folder', created: '2026-01-01',
      children: [
        {
          name: 'Desktop', type: 'folder', created: '2026-01-01',
          children: [
            { name: 'wallpaper.png', type: 'file', ext: 'png', size: '2.4 MB', created: '2026-02-10' },
            { name: 'notes.txt', type: 'file', ext: 'txt', size: '0.8 KB', created: '2026-03-05' }
          ]
        },
        {
          name: 'Documents', type: 'folder', created: '2026-01-01',
          children: [
            { name: 'resume.tex', type: 'file', ext: 'tex', size: '4.2 KB', created: '2026-01-15' },
            { name: 'notes.md', type: 'file', ext: 'md', size: '1.8 KB', created: '2026-02-03' },
            {
              name: 'Projects', type: 'folder', created: '2026-01-20',
              children: [
                { name: 'index.html', type: 'file', ext: 'html', size: '12 KB', created: '2026-03-10' },
                { name: 'style.css', type: 'file', ext: 'css', size: '8 KB', created: '2026-03-10' },
                { name: 'app.js', type: 'file', ext: 'js', size: '15 KB', created: '2026-03-12' }
              ]
            }
          ]
        },
        {
          name: 'Source_Code', type: 'folder', created: '2026-01-05',
          children: [
            { name: 'main.cpp', type: 'file', ext: 'cpp', size: '28 KB', created: '2026-04-01' },
            { name: 'utils.h', type: 'file', ext: 'h', size: '3 KB', created: '2026-04-02' },
            {
              name: 'React_App', type: 'folder', created: '2026-04-10',
              children: [
                { name: 'App.tsx', type: 'file', ext: 'tsx', size: '6 KB', created: '2026-04-10' },
                { name: 'package.json', type: 'file', ext: 'json', size: '0.5 KB', created: '2026-04-10' }
              ]
            }
          ]
        },
        {
          name: 'Root_Storage', type: 'folder', created: '2026-01-01',
          children: [
            { name: 'backup.zip', type: 'file', ext: 'zip', size: '156 MB', created: '2026-05-01' },
            { name: 'config.json', type: 'file', ext: 'json', size: '1.2 KB', created: '2026-01-15' }
          ]
        }
      ]
    };
  }

  let fs = createSeed();

  /* ─── PATH NAVIGATION ─── */
  function getNode(path) {
    let node = fs;
    for (const idx of path) {
      if (node.children && node.children[idx]) node = node.children[idx];
      else return null;
    }
    return node;
  }

  function getCurrentNode() {
    return getNode(currentPath);
  }

  function navigateTo(path) {
    currentPath = path;
    selectedItem = null;
    renderAll();
  }

  function navigateUp() {
    if (currentPath.length === 0) return;
    currentPath.pop();
    selectedItem = null;
    renderAll();
  }

  /* ─── BREADCRUMB ─── */
  function renderBreadcrumb() {
    const parts = ['root'];
    let node = fs;
    for (const idx of currentPath) {
      if (node.children && node.children[idx]) {
        node = node.children[idx];
        parts.push(node.name);
      }
    }
    breadcrumb.textContent = parts.join(' / ');
  }

  /* ─── ITEM GRID ─── */
  function renderGrid() {
    const node = getCurrentNode();
    itemGrid.innerHTML = '';
    if (!node || !node.children || node.children.length === 0) {
      itemCount.textContent = '0 items';
      itemGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:2em 0;color:rgba(255,255,255,0.04);font-size:clamp(7px,0.8vmin,10px);letter-spacing:2px;">EMPTY DIRECTORY</div>';
      return;
    }

    itemCount.textContent = node.children.length + ' items';

    node.children.forEach((child, idx) => {
      const card = document.createElement('div');
      card.className = 'item-card' + (selectedItem === idx ? ' selected' : '');
      card.dataset.idx = idx;

      const isFolder = child.type === 'folder';
      const icon = isFolder ? '\uD83D\uDCC1' : getFileIcon(child.ext);
      const ext = isFolder ? 'folder' : (child.ext || 'file');

      card.innerHTML = `
        <span class="ic-del" data-idx="${idx}">&#x2715;</span>
        <span class="ic-icon">${icon}</span>
        <div class="ic-name">${child.name}</div>
        <div class="ic-ext">${ext.toUpperCase()}</div>
      `;

      card.addEventListener('click', function(e) {
        if (e.target.classList.contains('ic-del')) return;
        if (isFolder) {
          navigateTo([...currentPath, idx]);
        } else {
          selectedItem = idx;
          renderAll();
        }
      });

      const delBtn = card.querySelector('.ic-del');
      delBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        deleteItem(idx);
      });

      itemGrid.appendChild(card);
    });
  }

  function getFileIcon(ext) {
    const map = {
      js: '\uD83D\uDCA0', cpp: '\u2699\uFE0F', h: '\u2699\uFE0F',
      html: '\uD83C\uDF10', css: '\uD83C\uDFA8', tsx: '\u26A1',
      json: '\uD83D\uDCCB', md: '\uD83D\uDCDD', tex: '\uD83D\uDCD0',
      txt: '\uD83D\uDCC4', png: '\uD83D\uDDBC\uFE0F', zip: '\uD83D\uDCE6'
    };
    return map[ext] || '\uD83D\uDCC4';
  }

  /* ─── DELETE ITEM ─── */
  function deleteItem(idx) {
    const node = getCurrentNode();
    if (!node || !node.children) return;
    node.children.splice(idx, 1);
    if (selectedItem === idx) selectedItem = null;
    else if (selectedItem > idx) selectedItem--;
    renderAll();
  }

  /* ─── CREATE FOLDER ─── */
  function createFolder() {
    const name = prompt('Enter folder name:');
    if (!name || !name.trim()) return;
    const node = getCurrentNode();
    if (!node) return;
    if (!node.children) node.children = [];
    node.children.push({
      name: name.trim(),
      type: 'folder',
      created: new Date().toISOString().slice(0, 10),
      children: []
    });
    renderAll();
  }

  /* ─── CREATE FILE ─── */
  function createFile() {
    const name = prompt('Enter file name (e.g. script.js, main.cpp):');
    if (!name || !name.trim()) return;
    const node = getCurrentNode();
    if (!node) return;
    if (!node.children) node.children = [];
    const ext = name.includes('.') ? name.split('.').pop() : 'js';
    node.children.push({
      name: name.trim(),
      type: 'file',
      ext: ext,
      size: (Math.random() * 50 + 0.5).toFixed(1) + ' KB',
      created: new Date().toISOString().slice(0, 10)
    });
    renderAll();
  }

  /* ─── SIDEBAR TREE ─── */
  function renderTree() {
    treeContainer.innerHTML = '';
    const path = [];
    function walk(node, depth) {
      const div = document.createElement('div');
      const isActive = path.length === currentPath.length &&
        path.every((v, i) => v === currentPath[i]);
      const isFolder = node.type === 'folder';
      div.className = 'tree-item ' + (isFolder ? 'folder' : 'file') +
        ' indent-' + Math.min(depth, 3) +
        (isActive ? ' active' : '');
      div.textContent = node.name;
      div.addEventListener('click', function() {
        if (isFolder) {
          navigateTo([...path]);
        } else {
          /* find index of file in parent */
          const parent = path.length === 0 ? fs : getNode(path.slice(0, -1));
          const parentPath = path.length === 0 ? [] : path.slice(0, -1);
          if (parent && parent.children) {
            const idx = parent.children.indexOf(node);
            selectedItem = idx;
            currentPath = parentPath;
            renderAll();
          }
        }
      });
      treeContainer.appendChild(div);

      if (isFolder && node.children) {
        node.children.forEach((child, i) => {
          path.push(i);
          walk(child, depth + 1);
          path.pop();
        });
      }
    }
    walk(fs, 0);
  }

  /* ─── INSPECTOR ─── */
  function renderInspector() {
    const node = getCurrentNode();
    if (!node || !node.children || selectedItem === null || !node.children[selectedItem]) {
      inspectorContent.innerHTML = '<div class="inspector-empty">SELECT A FILE OR FOLDER<br>TO INSPECT METADATA</div>';
      return;
    }
    const item = node.children[selectedItem];
    const isFolder = item.type === 'folder';

    let html = '';
    const rows = [
      { l: 'NAME', v: item.name },
      { l: 'TYPE', v: isFolder ? 'DIRECTORY' : 'FILE' },
      { l: 'EXTENSION', v: isFolder ? '--' : (item.ext || '--').toUpperCase() },
      { l: 'ALLOC SIZE', v: item.size || '--', cls: 'gold' },
      { l: 'CREATED', v: item.created || '--', cls: 'green' }
    ];
    rows.forEach(r => {
      html += '<div class="inspector-row"><span class="il">' + r.l + '</span><span class="iv' + (r.cls ? ' ' + r.cls : '') + '">' + r.v + '</span></div>';
    });
    if (isFolder) {
      html += '<div class="inspector-badge">CONTAINS ' + (item.children ? item.children.length : 0) + ' ITEMS</div>';
    } else {
      html += '<div class="inspector-badge">FILE ASSET — INTEGRITY VALIDATED</div>';
    }
    inspectorContent.innerHTML = html;
  }

  /* ─── RENDER ALL ─── */
  function renderAll() {
    renderBreadcrumb();
    renderTree();
    renderGrid();
    renderInspector();
  }

  /* ─── RECONSTRUCT ─── */
  function reconstructBaseline() {
    fs = createSeed();
    currentPath = [];
    selectedItem = null;
    renderAll();
  }

  /* ─── SYNC ─── */
  function simulateSync() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(5,6,11,0.85);z-index:1000;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1em;';
    const msg = document.createElement('div');
    msg.style.cssText = 'color:#00e676;font-size:clamp(9px,1.2vmin,16px);letter-spacing:3px;';
    msg.textContent = '[SYNC] Cloud pipeline upload initiated...';
    const bar = document.createElement('div');
    bar.style.cssText = 'width:200px;height:2px;background:rgba(255,255,255,0.05);border-radius:1px;overflow:hidden;';
    const fill = document.createElement('div');
    fill.style.cssText = 'width:0%;height:100%;background:#00e676;transition:width 2s ease;';
    bar.appendChild(fill);
    overlay.appendChild(msg);
    overlay.appendChild(bar);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => { fill.style.width = '100%'; });
    setTimeout(() => {
      msg.textContent = '[SYNC] Upload complete — 100%';
      fill.style.background = '#00e676';
      setTimeout(() => { overlay.remove(); }, 1200);
    }, 2200);
  }

  /* ─── PURGE ─── */
  function purgeAll() {
    fs = createSeed();
    currentPath = [];
    selectedItem = null;
    renderAll();
    inspectorContent.innerHTML = '<div class="inspector-empty">SELECT A FILE OR FOLDER<br>TO INSPECT METADATA</div>';
  }

  /* ─── UI EVENTS ─── */
  btnNewFolder.addEventListener('click', createFolder);
  btnNewFile.addEventListener('click', createFile);
  btnUp.addEventListener('click', navigateUp);
  btnReconstruct.addEventListener('click', reconstructBaseline);
  btnSync.addEventListener('click', simulateSync);
  btnPurge.addEventListener('click', purgeAll);

  /* ─── INIT ─── */
  function init() {
    renderAll();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
