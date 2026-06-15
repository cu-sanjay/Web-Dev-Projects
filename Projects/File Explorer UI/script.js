(function() {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  /* ─── FILE SYSTEM TREE ─── */
  let fsTree = {
    name: 'ROOT',
    type: 'folder',
    children: [
      {
        name: 'Documents',
        type: 'folder',
        children: [
          { name: 'resume.pdf', type: 'file', ext: 'pdf', size: 12840 },
          { name: 'cover_letter.docx', type: 'file', ext: 'docx', size: 24576 },
          { name: 'budget_2026.xlsx', type: 'file', ext: 'xlsx', size: 48600 },
          { name: 'Work Projects', type: 'folder', children: [
            { name: 'proposal.md', type: 'file', ext: 'md', size: 3200 },
            { name: 'architecture.drawio', type: 'file', ext: 'drawio', size: 8400 }
          ]}
        ]
      },
      {
        name: 'Downloads',
        type: 'folder',
        children: [
          { name: 'node-v22.zip', type: 'file', ext: 'zip', size: 52428800 },
          { name: 'docker-compose.yml', type: 'file', ext: 'yml', size: 1800 },
          { name: 'screenshot_2026.png', type: 'file', ext: 'png', size: 2457600 },
          { name: 'data.csv', type: 'file', ext: 'csv', size: 10240 }
        ]
      },
      {
        name: 'Source_Code',
        type: 'folder',
        children: [
          { name: 'src', type: 'folder', children: [
            { name: 'index.js', type: 'code', ext: 'js', size: 2400 },
            { name: 'app.js', type: 'code', ext: 'js', size: 8500 },
            { name: 'utils.js', type: 'code', ext: 'js', size: 3200 },
            { name: 'styles', type: 'folder', children: [
              { name: 'main.css', type: 'code', ext: 'css', size: 4200 },
              { name: 'theme.css', type: 'code', ext: 'css', size: 1800 }
            ]}
          ]},
          { name: 'main.cpp', type: 'code', ext: 'cpp', size: 15600 },
          { name: 'CMakeLists.txt', type: 'file', ext: 'txt', size: 800 },
          { name: 'README.md', type: 'file', ext: 'md', size: 5400 }
        ]
      },
      {
        name: 'Desktop',
        type: 'folder',
        children: [
          { name: 'dashboard.fig', type: 'file', ext: 'fig', size: 36000 },
          { name: 'config.json', type: 'code', ext: 'json', size: 1200 },
          { name: 'notes.txt', type: 'file', ext: 'txt', size: 600 }
        ]
      },
      {
        name: 'System_Settings',
        type: 'folder',
        children: [
          { name: 'preferences.conf', type: 'file', ext: 'conf', size: 3400 },
          { name: 'network_config.yaml', type: 'file', ext: 'yaml', size: 2800 }
        ]
      }
    ]
  };

  /* ─── STATE ─── */
  let currentFolder = fsTree;
  let currentPath = [fsTree];
  let selectedItem = null;
  let dragItem = null;

  /* ─── DOM REFS ─── */
  const itemsGrid = $('#itemsGrid');
  const sidebarTree = $('#sidebarTree');
  const breadcrumb = $('#breadcrumb');
  const searchInput = $('#searchInput');
  const itemCount = $('#itemCount');
  const insName = $('#insName');
  const insExt = $('#insExt');
  const insSize = $('#insSize');
  const insParent = $('#insParent');
  const tBadge = $('#tBadge');
  const btnNewFolder = $('#btnNewFolder');
  const btnNewFile = $('#btnNewFile');
  const btnUp = $('#btnUp');
  const btnReconstruct = $('#btnReconstruct');
  const btnDeploy = $('#btnDeploy');
  const btnFlush = $('#btnFlush');

  /* ─── RENDER ─── */
  function render() {
    renderGrid();
    renderSidebar();
    renderBreadcrumb();
  }

  function renderGrid() {
    const query = searchInput.value.toLowerCase();
    const items = currentFolder.children || [];
    const filtered = query ? items.filter(item => item.name.toLowerCase().includes(query)) : items;

    itemsGrid.innerHTML = '';
    itemCount.textContent = filtered.length + ' item' + (filtered.length !== 1 ? 's' : '');

    filtered.forEach(item => {
      const el = document.createElement('div');
      el.className = 'item ' + item.type;
      el.draggable = item.type !== 'folder' || true;
      el.dataset.name = item.name;

      const icon = getIcon(item);
      const sizeStr = item.size ? formatSize(item.size) : '';

      el.innerHTML =
        '<div class="item-icon">' + icon + '</div>' +
        '<div class="item-name">' + escapeHTML(item.name) + '</div>' +
        (sizeStr ? '<div class="item-size">' + sizeStr + '</div>' : '');

      /* click → select + inspect */
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        $$('.item').forEach(c => c.classList.remove('selected'));
        el.classList.add('selected');
        selectedItem = item;
        inspectItem(item);
      });

      /* double-click → navigate into folder */
      el.addEventListener('dblclick', () => {
        if (item.type === 'folder') {
          navigateInto(item);
        }
      });

      /* drag events */
      el.addEventListener('dragstart', (e) => {
        dragItem = { node: item, parent: currentFolder };
        e.dataTransfer.setData('text/plain', item.name);
        e.dataTransfer.effectAllowed = 'move';
      });

      el.addEventListener('dragover', (e) => {
        if (item.type === 'folder') {
          e.preventDefault();
          el.classList.add('drag-over');
        }
      });

      el.addEventListener('dragleave', () => {
        el.classList.remove('drag-over');
      });

      el.addEventListener('drop', (e) => {
        e.preventDefault();
        el.classList.remove('drag-over');
        if (dragItem && item.type === 'folder' && dragItem.node !== item) {
          moveItem(dragItem.node, dragItem.parent, item);
        }
        dragItem = null;
      });

      itemsGrid.appendChild(el);
    });

    if (filtered.length === 0) {
      itemsGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:2em;color:rgba(255,255,255,0.04);font-size:clamp(6px,0.65vmin,9px)">NO ITEMS FOUND</div>';
    }
  }

  function renderSidebar() {
    sidebarTree.innerHTML = '';
    /* root */
    const rootItem = document.createElement('div');
    rootItem.className = 'sidebar-item' + (currentFolder === fsTree ? ' active' : '');
    rootItem.innerHTML = '<span class="icon">◈</span> ROOT';
    rootItem.addEventListener('click', () => { currentFolder = fsTree; currentPath = [fsTree]; render(); });
    sidebarTree.appendChild(rootItem);

    /* top-level folders */
    (fsTree.children || []).forEach(child => {
      if (child.type === 'folder') {
        const el = document.createElement('div');
        el.className = 'sidebar-item' + (currentFolder === child ? ' active' : '');
        el.style.paddingLeft = '1.2em';
        el.innerHTML = '<span class="icon">▶</span> ' + escapeHTML(child.name);
        el.addEventListener('click', () => { currentFolder = child; currentPath = [fsTree, child]; render(); });
        sidebarTree.appendChild(el);
      }
    });
  }

  function renderBreadcrumb() {
    const names = currentPath.map(n => n.name);
    breadcrumb.textContent = names.join(' / ');
  }

  /* ─── NAVIGATION ─── */
  function navigateInto(folder) {
    currentFolder = folder;
    currentPath.push(folder);
    selectedItem = null;
    clearInspector();
    render();
  }

  function navigateUp() {
    if (currentPath.length <= 1) return;
    currentPath.pop();
    currentFolder = currentPath[currentPath.length - 1];
    selectedItem = null;
    clearInspector();
    render();
  }

  /* ─── INSPECT ─── */
  function inspectItem(item) {
    insName.textContent = item.name;
    const ext = item.ext || (item.type === 'folder' ? 'DIR' : '');
    insExt.textContent = ext.toUpperCase();
    insSize.textContent = item.size ? formatSize(item.size) : '--';
    insParent.textContent = currentFolder.name;
    tBadge.className = 'tele-badge active';
    tBadge.textContent = '[ FILE INTEGRITY: NODE ACCESSED ]';
  }

  function clearInspector() {
    insName.textContent = '--';
    insExt.textContent = '--';
    insSize.textContent = '--';
    insParent.textContent = '--';
    tBadge.className = 'tele-badge standby';
    tBadge.textContent = 'STANDBY';
  }

  /* ─── MOVE ITEM (DRAG & DROP) ─── */
  function moveItem(node, fromParent, toFolder) {
    const idx = (fromParent.children || []).indexOf(node);
    if (idx >= 0) fromParent.children.splice(idx, 1);
    if (!toFolder.children) toFolder.children = [];
    toFolder.children.push(node);
    /* if current folder was the source, re-render */
    if (currentFolder === fromParent || currentFolder === toFolder) {
      render();
    } else {
      renderGrid();
      renderBreadcrumb();
    }
    tBadge.className = 'tele-badge secure';
    tBadge.textContent = '[ FILE MOVED: ' + node.name + ' → ' + toFolder.name + ' ]';
  }

  /* ─── NEW FOLDER ─── */
  function createFolder() {
    if (!currentFolder.children) currentFolder.children = [];
    const name = 'New_Folder_' + (currentFolder.children.filter(c => c.type === 'folder').length + 1);
    currentFolder.children.push({ name: name, type: 'folder', children: [] });
    render();
  }

  /* ─── NEW FILE ─── */
  function createFile() {
    if (!currentFolder.children) currentFolder.children = [];
    const n = currentFolder.children.filter(c => c.type === 'code').length + 1;
    currentFolder.children.push({ name: 'new_file_' + n + '.js', type: 'code', ext: 'js', size: 120 });
    render();
  }

  /* ─── RECONSTRUCT ─── */
  function reconstructBaseline() {
    /* rebuild fsTree from original structure */
    fsTree = JSON.parse(JSON.stringify(originalTree));
    currentFolder = fsTree;
    currentPath = [fsTree];
    selectedItem = null;
    clearInspector();
    searchInput.value = '';
    render();
    tBadge.className = 'tele-badge secure';
    tBadge.textContent = '[ DIRECTORY MATRIX: BASELINE RESTORED ]';
  }

  /* ─── DEPLOY STORAGE ─── */
  function deployStorage() {
    if (!currentFolder.children) currentFolder.children = [];
    const gb = Math.floor(Math.random() * 50) + 10;
    currentFolder.children.push({
      name: 'storage_block_' + gb + 'GB',
      type: 'folder',
      children: []
    });
    render();
    tBadge.className = 'tele-badge secure';
    tBadge.textContent = '[ STORAGE EXPANSION: ' + gb + 'GB BLOCK DEPLOYED ]';
  }

  /* ─── FLUSH ─── */
  function flushAll() {
    reconstructBaseline();
    tBadge.className = 'tele-badge standby';
    tBadge.textContent = 'STANDBY';
  }

  /* ─── HELPERS ─── */
  function getIcon(item) {
    if (item.type === 'folder') return '📁';
    const ext = item.ext || '';
    if (['js','ts','jsx','tsx','css','html','json','xml','yaml','yml','conf','md','txt'].includes(ext)) return '📄';
    if (['png','jpg','jpeg','gif','svg','webp','ico','fig','drawio'].includes(ext)) return '🖼';
    if (['zip','tar','gz','rar','7z'].includes(ext)) return '📦';
    if (['pdf','docx','xlsx','pptx'].includes(ext)) return '📋';
    if (['cpp','c','h','hpp','java','py','rb','go','rs'].includes(ext)) return '⚙';
    return '📄';
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function escapeHTML(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ─── SAVE ORIGINAL TREE ─── */
  const originalTree = JSON.parse(JSON.stringify(fsTree));

  /* ─── EVENTS ─── */
  btnNewFolder.addEventListener('click', createFolder);
  btnNewFile.addEventListener('click', createFile);
  btnUp.addEventListener('click', navigateUp);
  btnReconstruct.addEventListener('click', reconstructBaseline);
  btnDeploy.addEventListener('click', deployStorage);
  btnFlush.addEventListener('click', flushAll);
  searchInput.addEventListener('input', renderGrid);

  /* prevent body drop interference */
  document.addEventListener('dragover', e => e.preventDefault());
  document.addEventListener('drop', e => e.preventDefault());

  /* ─── INIT ─── */
  function init() {
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
