 const tray = document.getElementById('tray');
        const board = document.getElementById('board');
        const overlay = document.getElementById('overlay');
        const preview = document.getElementById('preview-img');
        const factBox = document.getElementById('fact');
        
        const imageURL = "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=400&q=80"; // High-quality Pink Flower
        preview.src = imageURL;

        let pieces = [];
        let placedCount = 0;

        function initGame() {
            pieces = [];
            tray.innerHTML = '';
            document.querySelectorAll('.slot').forEach(slot => slot.innerHTML = '');
            placedCount = 0;
            overlay.classList.remove('show');
            factBox.innerText = "Drag the pieces to the right spot on the board! ✨";

            // Create 9 pieces
            for (let i = 0; i < 9; i++) {
                const piece = document.createElement('div');
                piece.className = 'piece';
                piece.draggable = true;
                piece.id = `piece-${i}`;
                piece.dataset.index = i;
                
                // Set background position logic (using percentage for responsiveness)
                const x = (i % 3) * 50; // 0, 50, 100
                const y = Math.floor(i / 3) * 50;
                
                piece.style.backgroundImage = `url(${imageURL})`;
                piece.style.backgroundPosition = `${x}% ${y}%`;
                
                piece.addEventListener('dragstart', dragStart);
                piece.addEventListener('dragend', dragEnd);
                
                pieces.push(piece);
            }

            // Shuffle and add to tray
            pieces.sort(() => Math.random() - 0.5).forEach(p => tray.appendChild(p));
        }

        function showPreview(show) {
            preview.classList.toggle('visible', show);
        }

        // Drag & Drop Logic
        function dragStart(e) {
            // Use e.currentTarget to ensure we get the piece even if we click the center
            const target = e.currentTarget;
            e.dataTransfer.setData('text/plain', target.id);
            e.dataTransfer.effectAllowed = 'move';
            setTimeout(() => target.classList.add('dragging'), 0);
        }

        function dragEnd(e) {
            e.target.classList.remove('dragging');
        }

        document.querySelectorAll('.slot').forEach(slot => {
            slot.addEventListener('dragover', e => e.preventDefault());
            slot.addEventListener('drop', dropPiece);
        });

        function dropPiece(e) {
            e.preventDefault();
            const id = e.dataTransfer.getData('text/plain');
            const piece = document.getElementById(id);
            const slot = e.target.closest('.slot');

            if (slot && slot.children.length === 0) {
                // Check if piece matches slot index
                if (piece && piece.dataset.index === slot.dataset.index) {
                    slot.appendChild(piece);
                    piece.draggable = false;
                    piece.classList.add('placed');
                    
                    placedCount++;
                    
                    if (placedCount === 9) {
                        setTimeout(() => overlay.classList.add('show'), 500);
                    }
                } else {
                    // Shake animation for wrong slot
                    factBox.innerText = "Oops! That piece doesn't go there! 🌸";
                    factBox.style.color = "#e91e63";
                    slot.style.backgroundColor = '#ffebee';
                    setTimeout(() => { slot.style.backgroundColor = 'transparent'; factBox.style.color = "var(--primary)"; }, 800);
                }
            }
        }

        function resetGame() {
            initGame();
        }

        initGame();