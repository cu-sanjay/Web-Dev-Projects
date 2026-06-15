// --- Mock Data ---
const catalog = [
  { id: 1, title: "Wireless Noise-Canceling Headphones", supplier: "AudioTech Global", price: "$45.00", moq: 50, img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400" },
  { id: 2, title: "Smart Home Security Camera", supplier: "SafeHouse Electronics", price: "$32.50", moq: 100, img: "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?auto=format&fit=crop&q=80&w=400" },
  { id: 3, title: "Ergonomic Office Chair", supplier: "FurniCorp Wholesale", price: "$85.00", moq: 20, img: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=400" },
  { id: 4, title: "USB-C Fast Charging Cables", supplier: "Connectix Inc.", price: "$2.10", moq: 500, img: "https://images.unsplash.com/photo-1520690254026-66db8f01b026?auto=format&fit=crop&q=80&w=400" }
];

const buyerOrders = [
  { po: "PO-8930", supplier: "AudioTech Global", items: 250, total: "$11,250", status: "In Transit" },
  { po: "PO-8921", supplier: "Connectix Inc.", items: 1000, total: "$2,100", status: "Delivered" }
];

const supplierOrders = [
  { id: "ORD-9912", retailer: "Tech Haven Stores", qty: 300, amount: "$13,500", status: "Pending" },
  { id: "ORD-9905", retailer: "Gadget World", qty: 150, amount: "$6,750", status: "Processing" },
  { id: "ORD-9880", retailer: "ElectroMart", qty: 500, amount: "$22,500", status: "Shipped" }
];

// --- Core Logic ---
document.addEventListener('DOMContentLoaded', () => {
  const navTabs = document.querySelectorAll('.nav-tab');
  const views = document.querySelectorAll('.tab-content');
  const roleSelect = document.getElementById('role-select');
  const supplierTabBtn = document.getElementById('supplier-tab-btn');
  const mobileSupplierTabBtn = document.getElementById('mobile-supplier-tab-btn');

  // Initialization
  renderCatalog();
  renderOrders();

  // Role Switching Logic
  roleSelect.addEventListener('change', (e) => {
    const role = e.target.value;
    
    if (role === 'supplier') {
      supplierTabBtn.style.display = 'block';
      if(mobileSupplierTabBtn) mobileSupplierTabBtn.style.display = 'block';
      document.querySelector('[data-tab="supplier"]').click();
      
      // Update Avatar
      document.getElementById('user-avatar').src = "https://ui-avatars.com/api/?name=Wholesale+Supplier&background=3b82f6&color=fff";
    } else {
      supplierTabBtn.style.display = 'none';
      if(mobileSupplierTabBtn) mobileSupplierTabBtn.style.display = 'none';
      document.querySelector('[data-tab="catalog"]').click();
      
      // Update Avatar
      document.getElementById('user-avatar').src = "https://ui-avatars.com/api/?name=Retail+Buyer&background=f97316&color=fff";
    }
  });

  // Tab Switching
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');
      
      // Update Active Classes
      navTabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll(`[data-tab="${targetId}"]`).forEach(t => t.classList.add('active'));

      // Switch Content
      views.forEach(v => {
        v.classList.add('hidden');
        if (v.id === targetId) {
          v.classList.remove('hidden');
        }
      });
    });
  });

  function getStatusBadge(status) {
    if (status === 'Delivered' || status === 'Shipped') return `<span class="badge success">${status}</span>`;
    if (status === 'Pending' || status === 'Processing') return `<span class="badge warning">${status}</span>`;
    return `<span class="badge primary">${status}</span>`;
  }

  function renderCatalog() {
    const grid = document.getElementById('product-grid');
    if(!grid) return;

    grid.innerHTML = catalog.map(p => `
      <div class="product-card">
        <img src="${p.img}" class="product-img">
        <div class="product-content">
          <div class="product-title">${p.title}</div>
          <div class="product-supplier"><i class="ph-fill ph-buildings"></i> ${p.supplier}</div>
          <div class="product-footer">
            <div>
              <span class="product-price">${p.price}</span>
              <span class="product-moq">MOQ: ${p.moq} Units</span>
            </div>
            <button class="btn outline-btn btn-sm">Add to PO</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function renderOrders() {
    // Buyer
    const bTbody = document.getElementById('buyer-orders-tbody');
    if(bTbody) {
      bTbody.innerHTML = buyerOrders.map(o => `
        <tr>
          <td><strong>${o.po}</strong></td>
          <td>${o.supplier}</td>
          <td>${o.items} Units</td>
          <td><strong>${o.total}</strong></td>
          <td>${getStatusBadge(o.status)}</td>
        </tr>
      `).join('');
    }

    // Supplier
    const sTbody = document.getElementById('supplier-orders-tbody');
    if(sTbody) {
      sTbody.innerHTML = supplierOrders.map(o => `
        <tr>
          <td><strong>${o.id}</strong></td>
          <td>${o.retailer}</td>
          <td>${o.qty}</td>
          <td><strong>${o.amount}</strong></td>
          <td>${getStatusBadge(o.status)}</td>
          <td><button class="btn outline-btn btn-sm">Review</button></td>
        </tr>
      `).join('');
    }
  }
});
