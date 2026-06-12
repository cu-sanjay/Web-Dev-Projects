 let notes = JSON.parse(localStorage.getItem('taskquest_v1.notes') || '[]');
        let currentFilter = 'All';

        function addNote() {
            const title = document.getElementById('noteTitle').value.trim();
            const content = document.getElementById('noteContent').value.trim();
            const category = document.getElementById('noteCategory').value;

            if (!title || !content) {
                alert('Please provide a title and content for your revision material.');
                return;
            }

            const note = {
                id: Date.now(),
                title,
                content,
                category,
                timestamp: new Date().toISOString()
            };

            notes.unshift(note);
            saveNotes();
            
            document.getElementById('noteTitle').value = '';
            document.getElementById('noteContent').value = '';
            
            renderNotes();
        }

        function saveNotes() {
            localStorage.setItem('taskquest_v1.notes', JSON.stringify(notes));
        }

        function deleteNote(id) {
            if (!confirm('Are you sure you want to delete this revision material?')) return;
            notes = notes.filter(n => n.id !== id);
            saveNotes();
            renderNotes();
        }

        function setFilter(cat, btn) {
            currentFilter = cat;
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            renderNotes();
        }

        function renderNotes() {
            const grid = document.getElementById('notesGrid');
            const search = document.getElementById('noteSearch').value.toLowerCase();
            
            const filtered = notes.filter(n => {
                const matchesSearch = n.title.toLowerCase().includes(search) || n.content.toLowerCase().includes(search);
                const matchesFilter = currentFilter === 'All' || n.category === currentFilter;
                return matchesSearch && matchesFilter;
            });

            if (filtered.length === 0) {
                grid.innerHTML = `
                    <div class="empty-state">
                        <i class="ri-sticky-note-2-line"></i>
                        <p>No revision material found. Add formulas or summaries to start your knowledge base!</p>
                    </div>
                `;
                return;
            }

            grid.innerHTML = filtered.map(n => `
                <div class="note-card">
                    <span class="note-tag tag-${n.category.toLowerCase()}">${n.category}</span>
                    <h3 class="note-title">${n.title}</h3>
                    <p class="note-content">${n.content}</p>
                    <div class="note-actions">
                        <button class="action-btn delete" onclick="deleteNote(${n.id})" title="Delete note"><i class="ri-delete-bin-line"></i></button>
                    </div>
                </div>
            `).join('');
        }

        let revIndex = 0;
        function startRevision() {
            if (notes.length === 0) {
                alert('Add some revision notes first!');
                return;
            }
            revIndex = 0;
            document.getElementById('revisionOverlay').style.display = 'flex';
            updateRevCard();
        }

        function stopRevision() {
            document.getElementById('revisionOverlay').style.display = 'none';
        }

        function updateRevCard() {
            const n = notes[revIndex];
            document.getElementById('revTag').textContent = n.category;
            document.getElementById('revTag').className = `note-tag tag-${n.category.toLowerCase()}`;
            document.getElementById('revTitle').textContent = n.title;
            document.getElementById('revContent').textContent = n.content;
            document.getElementById('revProgress').textContent = `${revIndex + 1} / ${notes.length}`;
        }

        function nextNote() {
            revIndex = (revIndex + 1) % notes.length;
            updateRevCard();
        }

        function prevNote() {
            revIndex = (revIndex - 1 + notes.length) % notes.length;
            updateRevCard();
        }

        const savedTheme = localStorage.getItem('taskquest_v1.theme') || 'cosmic';
        document.body.setAttribute('data-theme', savedTheme);

        renderNotes();