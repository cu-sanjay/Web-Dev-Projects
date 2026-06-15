// --- Role Data & Menus ---
const sidebars = {
  admin: [
    { icon: 'ph-squares-four', label: 'Overview', active: true },
    { icon: 'ph-users-three', label: 'Vendors', active: false },
    { icon: 'ph-users', label: 'Customers', active: false },
    { icon: 'ph-gear', label: 'Platform Settings', active: false }
  ],
  vendor: [
    { icon: 'ph-squares-four', label: 'Store Dashboard', active: true },
    { icon: 'ph-package', label: 'My Products', active: false },
    { icon: 'ph-receipt', label: 'Orders', active: false },
    { icon: 'ph-wallet', label: 'Payouts', active: false }
  ],
  customer: [
    { icon: 'ph-user', label: 'My Profile', active: true },
    { icon: 'ph-shopping-bag', label: 'Order History', active: false },
    { icon: 'ph-heart', label: 'Wishlist', active: false },
    { icon: 'ph-headset', label: 'Support', active: false }
  ]
};

// --- Mock Data ---
const adminVendors = [
  { name: "TechHaven Store", cat: "Electronics", date: "Oct 15, 2026", status: "Pending" },
  { name: "Green Roots", cat: "Home & Garden", date: "Oct 14, 2026", status: "Approved" },
  { name: "FitLife Gear", cat: "Sports", date: "Oct 12, 2026", status: "Rejected" }
];

const vendorInventory = [
  { name: "Wireless Earbuds Pro", price: "$129.99", stock: 45, status: "Active" },
  { name: "Mechanical Keyboard", price: "$89.50", stock: 12, status: "Low Stock" },
  { name: "4K Monitor 27-inch", price: "$349.00", stock: 0, status: "Out of Stock" }
];

const customerOrders = [
  { id: "#ORD-8921", store: "TechHaven Store", date: "Oct 12, 2026", total: "$129.99", status: "Shipped" },
  { id: "#ORD-8854", store: "Green Roots", date: "Oct 05, 2026", total: "$45.00", status: "Delivered" },
  { id: "#ORD-8711", store: "FitLife Gear", date: "Sep 28, 2026", total: "$89.99", status: "Delivered" }
];

// --- Core Logic ---
document.addEventListener('DOMContentLoaded', () => {
  const roleBtns = document.querySelectorAll('.role-btn');
  const views = document.querySelectorAll('.role-view');
  const sidebarMenu = document.getElementById('sidebar-menu');
  const avatar = document.getElementById('user-avatar');

  // Initialize
  renderSidebar('admin');
  renderTables();

  // Role Switcher Logic
  roleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Update Buttons
      roleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const role = btn.getAttribute('data-role');
      
      // Update Avatar Colors
      if(role === 'admin') avatar.src = "https://ui-avatars.com/api/?name=Admin+User&background=0f172a&color=fff";
      if(role === 'vendor') avatar.src = "https://ui-avatars.com/api/?name=Vendor+Store&background=10b981&color=fff";
      if(role === 'customer') avatar.src = "https://ui-avatars.com/api/?name=Customer&background=3b82f6&color=fff";

      // Switch Views
      views.forEach(v => {
        v.classList.add('hidden');
        if (v.id === `${role}-view`) {
          v.classList.remove('hidden');
        }
      });

      // Update Sidebar
      renderSidebar(role);
    });
  });

  function renderSidebar(role) {
    const items = sidebars[role];
    sidebarMenu.innerHTML = items.map(item => `
      <li class="${item.active ? 'active' : ''}">
        <i class="ph ${item.icon}"></i> ${item.label}
      </li>
    `).join('');
  }

  function getStatusBadge(status) {
    let cls = '';
    if (['Approved', 'Active', 'Delivered', 'Shipped'].includes(status)) cls = 'success';
    if (['Pending', 'Low Stock'].includes(status)) cls = 'warning';
    return `<span class="badge ${cls}">${status}</span>`;
  }

  function renderTables() {
    // Admin
    const adminTbody = document.getElementById('admin-vendors-tbody');
    if(adminTbody) {
      adminTbody.innerHTML = adminVendors.map(v => `
        <tr>
          <td><strong>${v.name}</strong></td>
          <td>${v.cat}</td>
          <td>${v.date}</td>
          <td>${getStatusBadge(v.status)}</td>
        </tr>
      `).join('');
    }

    // Vendor
    const vendorTbody = document.getElementById('vendor-inventory-tbody');
    if(vendorTbody) {
      vendorTbody.innerHTML = vendorInventory.map(i => `
        <tr>
          <td><strong>${i.name}</strong></td>
          <td>${i.price}</td>
          <td>${i.stock}</td>
          <td>${getStatusBadge(i.status)}</td>
          <td><button class="btn outline-btn btn-sm">Edit</button></td>
        </tr>
      `).join('');
    }

    // Customer
    const custTbody = document.getElementById('customer-orders-tbody');
    if(custTbody) {
      custTbody.innerHTML = customerOrders.map(o => `
        <tr>
          <td><strong>${o.id}</strong></td>
          <td>${o.store}</td>
          <td>${o.date}</td>
          <td>${o.total}</td>
          <td>${getStatusBadge(o.status)}</td>
        </tr>
      `).join('');
    }
  }
});
