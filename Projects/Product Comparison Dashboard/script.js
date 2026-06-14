document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let products = JSON.parse(localStorage.getItem('nxs_products')) || [];
    let compareQueue = JSON.parse(localStorage.getItem('nxs_compare')) || [];
    let wishlist = JSON.parse(localStorage.getItem('nxs_wishlist')) || [];
    
    // Default mock data if empty
    if (products.length === 0) {
        products = [
            { id: "p1", name: "Nexus X1", brand: "NexusCorp", category: "Smartphones", price: 899.99, rating: 4.8, warranty: "2 Years", specs: ["12GB RAM", "512GB Storage", "120Hz OLED", "50MP Camera"], features: "AI Photography, HyperCharge, Water Resistant" },
            { id: "p2", name: "Aura Pro", brand: "AuraTech", category: "Smartphones", price: 749.00, rating: 4.5, warranty: "1 Year", specs: ["8GB RAM", "256GB Storage", "90Hz AMOLED", "64MP Camera"], features: "Ultra-slim, Gorilla Glass, Long Battery" },
            { id: "p3", name: "CyberBook Z", brand: "NexusCorp", category: "Laptops", price: 1499.00, rating: 4.9, warranty: "3 Years", specs: ["32GB RAM", "1TB SSD", "RTX 4070", "16-inch Mini-LED"], features: "Vapor Chamber Cooling, Mech Keyboard" }
        ];
        saveData();
    }

    // --- DOM Elements ---
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.view-section');
    const themeToggle = document.getElementById('themeToggle');
    
    const catalogGrid = document.getElementById('catalogGrid');
    const wishlistGrid = document.getElementById('wishlistGrid');
    const catalogCount = document.getElementById('catalogCount');
    const compareCount = document.getElementById('compareCount');
    
    // Filters
    const searchInput = document.getElementById('searchInput');
    const filterCategory = document.getElementById('filterCategory');
    const filterPrice = document.getElementById('filterPrice');
    const priceValDisplay = document.getElementById('priceValDisplay');
    const sortOption = document.getElementById('sortOption');

    // Modals
    const productModal = document.getElementById('productModal');
    const productForm = document.getElementById('productForm');
    const toast = document.getElementById('toast');

    // --- Initialization ---
    const savedTheme = localStorage.getItem('nxs_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('themeLabel').textContent = savedTheme === 'dark' ? 'LIGHT MODE' : 'DARK MODE';

    // --- Core Functions ---
    function saveData() {
        localStorage.setItem('nxs_products', JSON.stringify(products));
        localStorage.setItem('nxs_compare', JSON.stringify(compareQueue));
        localStorage.setItem('nxs_wishlist', JSON.stringify(wishlist));
        updateUI();
    }

    function showToast(msg) {
        toast.querySelector('.toast-msg').textContent = msg;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3000);
    }

    function generateId() { return 'nxs_' + Math.random().toString(36).substr(2, 9); }
    function formatCurrency(num) { return '$' + parseFloat(num).toFixed(2); }

    // --- Navigation ---
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(btn.dataset.target + 'View').classList.add('active');
            if(btn.dataset.target === 'compare') renderCompareTable();
        });
    });

    document.getElementById('goToCompareBtn').addEventListener('click', () => {
        document.querySelector('.nav-btn[data-target="compare"]').click();
    });

    // --- Theme Toggle ---
    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('nxs_theme', newTheme);
        document.getElementById('themeLabel').textContent = isDark ? 'DARK MODE' : 'LIGHT MODE';
    });

    // --- Form Management ---
    document.getElementById('addProductBtn').addEventListener('click', () => {
        productForm.reset();
        document.getElementById('productId').value = '';
        document.getElementById('modalTitle').textContent = 'INITIALIZE ENTRY';
        productModal.classList.remove('hidden');
    });

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => productModal.classList.add('hidden'));
    });

    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('productId').value;
        
        const specString = document.getElementById('pSpecs').value;
        const specsArray = specString.split(',').map(s => s.trim()).filter(s => s);

        const prodObj = {
            id: id || generateId(),
            name: document.getElementById('pName').value,
            brand: document.getElementById('pBrand').value,
            category: document.getElementById('pCategory').value,
            price: parseFloat(document.getElementById('pPrice').value),
            rating: parseFloat(document.getElementById('pRating').value),
            warranty: document.getElementById('pWarranty').value,
            specs: specsArray,
            features: document.getElementById('pFeatures').value
        };

        if (id) {
            const index = products.findIndex(p => p.id === id);
            if (index !== -1) products[index] = prodObj;
            showToast('Entry Updated');
        } else {
            products.push(prodObj);
            showToast('New Entry Initialized');
        }

        productModal.classList.add('hidden');
        saveData();
    });

    // --- Filtering & Rendering ---
    filterPrice.addEventListener('input', (e) => {
        priceValDisplay.textContent = e.target.value;
        updateUI();
    });
    [searchInput, filterCategory, sortOption].forEach(el => {
        el.addEventListener('input', updateUI);
    });

    function getFilteredProducts() {
        const query = searchInput.value.toLowerCase();
        const cat = filterCategory.value;
        const maxPrice = parseFloat(filterPrice.value);
        const sort = sortOption.value;

        let filtered = products.filter(p => {
            const matchQuery = p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query);
            const matchCat = cat === 'All' || p.category === cat;
            const matchPrice = p.price <= maxPrice;
            return matchQuery && matchCat && matchPrice;
        });

        if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
        else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
        else if (sort === 'rating-desc') filtered.sort((a, b) => b.rating - a.rating);
        else filtered.reverse(); // newest first assuming array push

        return filtered;
    }

    // Window global bindings for inline onclicks
    window.toggleWishlist = (id) => {
        if (wishlist.includes(id)) {
            wishlist = wishlist.filter(w => w !== id);
            showToast('Removed from Wishlist');
        } else {
            wishlist.push(id);
            showToast('Added to Wishlist');
        }
        saveData();
    };

    window.toggleCompare = (id) => {
        if (compareQueue.includes(id)) {
            compareQueue = compareQueue.filter(c => c !== id);
        } else {
            if (compareQueue.length >= 4) {
                showToast('Queue full (Max 4)');
                return;
            }
            compareQueue.push(id);
        }
        saveData();
        renderCompareTable();
    };

    window.editProduct = (id) => {
        const p = products.find(p => p.id === id);
        if(!p) return;
        document.getElementById('productId').value = p.id;
        document.getElementById('pName').value = p.name;
        document.getElementById('pBrand').value = p.brand;
        document.getElementById('pCategory').value = p.category;
        document.getElementById('pPrice').value = p.price;
        document.getElementById('pRating').value = p.rating;
        document.getElementById('pWarranty').value = p.warranty;
        document.getElementById('pSpecs').value = (p.specs || []).join(', ');
        document.getElementById('pFeatures').value = p.features;
        
        document.getElementById('modalTitle').textContent = 'MODIFY ENTRY';
        productModal.classList.remove('hidden');
    };

    window.deleteProduct = (id) => {
        if(confirm("Confirm deletion of this entity?")) {
            products = products.filter(p => p.id !== id);
            compareQueue = compareQueue.filter(c => c !== id);
            wishlist = wishlist.filter(w => w !== id);
            saveData();
            showToast('Entity Deleted');
        }
    };

    document.getElementById('clearCompareBtn').addEventListener('click', () => {
        compareQueue = [];
        saveData();
        renderCompareTable();
    });

    function createCardHTML(p) {
        const isWish = wishlist.includes(p.id);
        const isCmp = compareQueue.includes(p.id);
        
        return `
            <div class="prod-card ${isCmp ? 'in-compare' : ''}">
                <div class="pc-cat">${p.category}</div>
                <h4 class="pc-name">${p.name}</h4>
                <div class="pc-brand">${p.brand}</div>
                
                <div class="pc-metrics">
                    <div class="metric">
                        <span class="m-lbl">Value</span>
                        <span class="m-val">${formatCurrency(p.price)}</span>
                    </div>
                    <div class="metric text-right">
                        <span class="m-lbl">Rating</span>
                        <span class="m-val rate">★ ${p.rating}</span>
                    </div>
                </div>

                <div class="pc-actions">
                    <button class="cyber-btn outline flex-1" onclick="toggleCompare('${p.id}')" style="font-size:0.7rem; padding:8px">
                        ${isCmp ? '- DEQUEUE' : '+ COMPARE'}
                    </button>
                    <button class="icon-btn ${isWish ? 'active-wish' : ''}" onclick="toggleWishlist('${p.id}')" title="Wishlist">♡</button>
                    <button class="icon-btn" onclick="editProduct('${p.id}')" title="Edit">✎</button>
                    <button class="icon-btn" onclick="deleteProduct('${p.id}')" title="Delete" style="color:var(--neon-secondary); border-color:rgba(255,0,60,0.3)">✕</button>
                </div>
            </div>
        `;
    }

    function updateUI() {
        const filtered = getFilteredProducts();
        
        catalogCount.textContent = `${filtered.length} Entities`;
        compareCount.textContent = compareQueue.length;
        
        // Render Dashboard Grid
        if (filtered.length === 0) {
            catalogGrid.innerHTML = '';
            document.getElementById('emptyCatalog').classList.remove('hidden');
        } else {
            document.getElementById('emptyCatalog').classList.add('hidden');
            catalogGrid.innerHTML = filtered.map(createCardHTML).join('');
        }

        // Render Wishlist Grid
        const wishItems = products.filter(p => wishlist.includes(p.id));
        if (wishItems.length === 0) {
            wishlistGrid.innerHTML = '';
            document.getElementById('emptyWishlist').classList.remove('hidden');
        } else {
            document.getElementById('emptyWishlist').classList.add('hidden');
            wishlistGrid.innerHTML = wishItems.map(createCardHTML).join('');
        }
    }

    function renderCompareTable() {
        const wrapper = document.getElementById('compareTableWrapper');
        const emptyState = document.getElementById('emptyCompare');
        
        if (compareQueue.length === 0) {
            wrapper.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        const cmpProducts = compareQueue.map(id => products.find(p => p.id === id)).filter(Boolean);

        let tableHTML = `<table class="compare-table"><tbody>`;
        
        // Product Names
        tableHTML += `<tr><th>Product</th>`;
        cmpProducts.forEach(p => tableHTML += `<td>${p.name}</td>`);
        tableHTML += `</tr>`;
        
        // Brand
        tableHTML += `<tr><th>Brand</th>`;
        cmpProducts.forEach(p => tableHTML += `<td>${p.brand}</td>`);
        tableHTML += `</tr>`;

        // Price
        tableHTML += `<tr><th>Price</th>`;
        cmpProducts.forEach(p => tableHTML += `<td style="color:var(--neon-success); font-weight:bold">${formatCurrency(p.price)}</td>`);
        tableHTML += `</tr>`;

        // Rating
        tableHTML += `<tr><th>Rating</th>`;
        cmpProducts.forEach(p => tableHTML += `<td style="color:#ffd700">★ ${p.rating} / 5.0</td>`);
        tableHTML += `</tr>`;

        // Category
        tableHTML += `<tr><th>Category</th>`;
        cmpProducts.forEach(p => tableHTML += `<td>${p.category}</td>`);
        tableHTML += `</tr>`;

        // Warranty
        tableHTML += `<tr><th>Warranty</th>`;
        cmpProducts.forEach(p => tableHTML += `<td>${p.warranty || 'N/A'}</td>`);
        tableHTML += `</tr>`;

        // Specifications
        tableHTML += `<tr><th>Specifications</th>`;
        cmpProducts.forEach(p => {
            let specsHTML = '<ul class="spec-list">';
            (p.specs || []).forEach(s => specsHTML += `<li>${s}</li>`);
            specsHTML += '</ul>';
            tableHTML += `<td>${specsHTML}</td>`;
        });
        tableHTML += `</tr>`;

        // Features
        tableHTML += `<tr><th>Features</th>`;
        cmpProducts.forEach(p => tableHTML += `<td><p style="font-size:0.85rem; color:var(--text-muted); line-height:1.4">${p.features || 'No features listed'}</p></td>`);
        tableHTML += `</tr>`;

        // Actions
        tableHTML += `<tr><th>Actions</th>`;
        cmpProducts.forEach(p => {
            tableHTML += `<td>
                <button class="cyber-btn danger sm" onclick="toggleCompare('${p.id}')">REMOVE</button>
            </td>`;
        });
        tableHTML += `</tr>`;

        tableHTML += `</tbody></table>`;
        wrapper.innerHTML = tableHTML;
    }

    // Initial Render
    updateUI();
});
