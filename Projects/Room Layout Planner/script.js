document.addEventListener('DOMContentLoaded', () => {
    // Basic settings & state
    // We'll use a scale where 1 meter = 40px, so 0.5m grid = 20px
    const SCALE = 40; 
    let roomW = 5; // meters
    let roomH = 4; // meters
    
    let placedItems = JSON.parse(localStorage.getItem('roomLayoutItems')) || [];
    let selectedItemId = null;
    let highestZIndex = 10;

    // DOM Elements
    const themeToggle = document.getElementById('themeToggle');
    const widthInput = document.getElementById('roomWidth');
    const heightInput = document.getElementById('roomHeight');
    const applyBtn = document.getElementById('applyDimensionsBtn');
    const resetBtn = document.getElementById('resetLayoutBtn');
    
    const roomCanvas = document.getElementById('roomCanvas');
    const totalAreaVal = document.getElementById('totalAreaVal');
    const itemCountVal = document.getElementById('itemCountVal');

    // Theme initialization
    if (localStorage.getItem('roomTheme') === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    }

    themeToggle.addEventListener('click', () => {
        const isDark = document.body.hasAttribute('data-theme');
        if (isDark) {
            document.body.removeAttribute('data-theme');
            themeToggle.textContent = '🌙';
            localStorage.setItem('roomTheme', 'light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            themeToggle.textContent = '☀️';
            localStorage.setItem('roomTheme', 'dark');
        }
    });

    // Room Sizing
    const updateRoomSize = () => {
        roomCanvas.style.width = `${roomW * SCALE}px`;
        roomCanvas.style.height = `${roomH * SCALE}px`;
        totalAreaVal.textContent = `${(roomW * roomH).toFixed(1)} m²`;
    };

    applyBtn.addEventListener('click', () => {
        roomW = parseFloat(widthInput.value) || 5;
        roomH = parseFloat(heightInput.value) || 4;
        updateRoomSize();
        // Remove items that are out of bounds ideally, but for now just update size.
    });

    // Render placed items
    const saveState = () => {
        localStorage.setItem('roomLayoutItems', JSON.stringify(placedItems));
        itemCountVal.textContent = placedItems.length;
    };

    const clearSelection = () => {
        selectedItemId = null;
        document.querySelectorAll('.placed-item').forEach(el => el.classList.remove('selected'));
    };

    const renderItem = (item) => {
        const el = document.createElement('div');
        el.className = 'placed-item';
        el.id = `item-${item.id}`;
        
        // Size
        el.style.width = `${item.w}px`;
        el.style.height = `${item.h}px`;
        
        // Position
        el.style.left = `${item.x}px`;
        el.style.top = `${item.y}px`;
        
        // Rotation
        el.style.transform = `rotate(${item.rotation || 0}deg)`;
        el.style.zIndex = item.zIndex || 10;
        
        // Content
        el.innerHTML = `
            ${item.icon}
            <div class="label">${item.type}</div>
        `;

        // Interactivity: Selection
        el.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            clearSelection();
            selectedItemId = item.id;
            el.classList.add('selected');
            
            // Bring to front
            highestZIndex++;
            item.zIndex = highestZIndex;
            el.style.zIndex = highestZIndex;
            saveState();

            // Dragging logic
            let startX = e.clientX;
            let startY = e.clientY;
            let currentX = item.x;
            let currentY = item.y;

            const onMouseMove = (moveEvent) => {
                const dx = moveEvent.clientX - startX;
                const dy = moveEvent.clientY - startY;
                
                // Calculate new position
                let newX = currentX + dx;
                let newY = currentY + dy;

                // Snap to grid (20px)
                const SNAP = 20;
                newX = Math.round(newX / SNAP) * SNAP;
                newY = Math.round(newY / SNAP) * SNAP;

                // Boundary check
                const boundsW = roomW * SCALE;
                const boundsH = roomH * SCALE;

                // Calculate bounding box considering rotation
                // A simple approach for 90deg rotations: swap w and h if rotation is 90 or 270
                const isRotated = (item.rotation % 180 !== 0);
                const actualW = isRotated ? item.h : item.w;
                const actualH = isRotated ? item.w : item.h;
                
                // Prevent dragging completely out of bounds (approximate)
                newX = Math.max(0, Math.min(newX, boundsW - actualW));
                newY = Math.max(0, Math.min(newY, boundsH - actualH));

                el.style.left = `${newX}px`;
                el.style.top = `${newY}px`;
                
                item.x = newX;
                item.y = newY;
            };

            const onMouseUp = () => {
                saveState();
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        // Interactivity: Rotation (Double Click)
        el.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            item.rotation = ((item.rotation || 0) + 90) % 360;
            el.style.transform = `rotate(${item.rotation}deg)`;
            saveState();
        });

        roomCanvas.appendChild(el);
    };

    const renderAll = () => {
        roomCanvas.innerHTML = '';
        placedItems.forEach(renderItem);
        itemCountVal.textContent = placedItems.length;
    };

    // Deselect when clicking canvas
    roomCanvas.addEventListener('mousedown', clearSelection);

    // Keyboard delete
    document.addEventListener('keydown', (e) => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedItemId) {
            placedItems = placedItems.filter(i => i.id !== selectedItemId);
            selectedItemId = null;
            saveState();
            renderAll();
        }
    });

    // Drag and Drop from library to canvas
    const libraryItems = document.querySelectorAll('.furniture-item[draggable="true"]');
    
    libraryItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            const type = item.getAttribute('data-type');
            const w = parseInt(item.getAttribute('data-w'), 10);
            const h = parseInt(item.getAttribute('data-h'), 10);
            const icon = item.querySelector('.icon').textContent;
            
            e.dataTransfer.setData('application/json', JSON.stringify({ type, w, h, icon }));
            e.dataTransfer.effectAllowed = 'copy';
        });
    });

    roomCanvas.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        roomCanvas.classList.add('drag-over');
    });

    roomCanvas.addEventListener('dragleave', () => {
        roomCanvas.classList.remove('drag-over');
    });

    roomCanvas.addEventListener('drop', (e) => {
        e.preventDefault();
        roomCanvas.classList.remove('drag-over');

        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            
            // Get coordinates relative to canvas
            const rect = roomCanvas.getBoundingClientRect();
            let dropX = e.clientX - rect.left - (data.w / 2);
            let dropY = e.clientY - rect.top - (data.h / 2);

            // Snap drop position to grid
            const SNAP = 20;
            dropX = Math.round(dropX / SNAP) * SNAP;
            dropY = Math.round(dropY / SNAP) * SNAP;

            highestZIndex++;

            const newItem = {
                id: Date.now().toString(),
                type: data.type,
                w: data.w,
                h: data.h,
                icon: data.icon,
                x: dropX,
                y: dropY,
                rotation: 0,
                zIndex: highestZIndex
            };

            placedItems.push(newItem);
            saveState();
            renderItem(newItem);
        } catch (err) {
            console.error('Drop error:', err);
        }
    });

    // Reset
    resetBtn.addEventListener('click', () => {
        if(confirm('Are you sure you want to clear the entire room?')) {
            placedItems = [];
            saveState();
            renderAll();
        }
    });

    // Initial Setup
    updateRoomSize();
    renderAll();
});
