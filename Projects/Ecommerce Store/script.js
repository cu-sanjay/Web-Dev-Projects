const products = [
  { id: 1, title: 'Wireless Headphones', price: 79.99, category: 'Electronics', rating: 4.5, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', fallback: 'https://placehold.co/400x400/1e293b/6366f1?text=Headphones', availability: true },
  { id: 2, title: 'Smart Watch', price: 199.99, category: 'Electronics', rating: 4.3, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', fallback: 'https://placehold.co/400x400/1e293b/6366f1?text=Watch', availability: true },
  { id: 3, title: 'Denim Jacket', price: 89.99, category: 'Apparel', rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop', fallback: 'https://placehold.co/400x400/1e293b/6366f1?text=Jacket', availability: true },
  { id: 4, title: 'Running Shoes', price: 129.99, category: 'Apparel', rating: 4.4, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', fallback: 'https://placehold.co/400x400/1e293b/6366f1?text=Shoes', availability: false },
  { id: 5, title: 'Leather Wallet', price: 49.99, category: 'Accessories', rating: 4.6, imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop', fallback: 'https://placehold.co/400x400/1e293b/6366f1?text=Wallet', availability: true },
  { id: 6, title: 'Aviator Sunglasses', price: 59.99, category: 'Accessories', rating: 4.2, imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop', fallback: 'https://placehold.co/400x400/1e293b/6366f1?text=Sunglasses', availability: true },
  { id: 7, title: 'Bluetooth Speaker', price: 149.99, category: 'Electronics', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop', fallback: 'https://placehold.co/400x400/1e293b/6366f1?text=Speaker', availability: true },
  { id: 8, title: 'Cotton T-Shirt', price: 29.99, category: 'Apparel', rating: 4.1, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', fallback: 'https://placehold.co/400x400/1e293b/6366f1?text=T-Shirt', availability: true },
  { id: 9, title: 'Canvas Backpack', price: 69.99, category: 'Accessories', rating: 4.5, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', fallback: 'https://placehold.co/400x400/1e293b/6366f1?text=Backpack', availability: true },
  { id: 10, title: 'Yoga Mat', price: 39.99, category: 'Accessories', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop', fallback: 'https://placehold.co/400x400/1e293b/6366f1?text=Yoga+Mat', availability: true },
];

const state = {
  category: 'All',
  maxPrice: 500,
  sort: 'default',
  cart: [],
};

const starsHTML = (rating) => {
  const full = Math.floor(rating);
  let s = '';
  for (let i = 0; i < full; i++) s += '★';
  for (let i = full; i < 5; i++) s += '☆';
  return s;
};

function getFilteredProducts() {
  let result = [...products];
  if (state.category !== 'All') {
    result = result.filter((p) => p.category === state.category);
  }
  result = result.filter((p) => p.price <= state.maxPrice);
  if (state.sort === 'low') result.sort((a, b) => a.price - b.price);
  else if (state.sort === 'high') result.sort((a, b) => b.price - a.price);
  else if (state.sort === 'rating') result.sort((a, b) => b.rating - a.rating);
  return result;
}

function renderProducts() {
  const grid = document.getElementById('productGrid');
  const filtered = getFilteredProducts();
  document.getElementById('productsCount').textContent = `(${filtered.length} products)`;
  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty-state">No products match your filters.</div>';
    return;
  }
  grid.innerHTML = filtered
    .map((p, i) => {
      const inCart = state.cart.some((c) => c.id === p.id);
      const stars = starsHTML(p.rating);
      return `
        <div class="product-card" data-id="${p.id}" style="animation-delay:${i * 0.05}s">
          <div class="product-card-image-wrap">
            <img class="product-card-image" src="${p.imageUrl}" alt="${p.title}" loading="lazy" onerror="this.src='${p.fallback}'">
            <div class="product-card-shimmer"></div>
          </div>
          <div class="product-card-body">
            <div class="product-card-category">${p.category}</div>
            <div class="product-card-title">${p.title}</div>
            <div class="product-card-rating">${stars} <span>${p.rating}</span></div>
            <div class="product-card-footer">
              <div class="product-card-price">$${p.price.toFixed(2)}</div>
              ${p.availability
                ? `<button class="product-card-add${inCart ? ' in-cart' : ''}" data-id="${p.id}" aria-label="Add to cart">${inCart ? '✓' : '+'}</button>`
                : `<span class="badge-out">Out of Stock</span>`}
            </div>
          </div>
        </div>`;
    })
    .join('');

  document.querySelectorAll('.product-card-add').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      addToCart(id);
    });
  });
}

function updateCartUI() {
  const count = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const badge = document.getElementById('cartCount');
  badge.textContent = count;
  badge.classList.add('pulse');
  setTimeout(() => badge.classList.remove('pulse'), 400);
  document.getElementById('cartItemsCount').textContent = count;

  const emptyEl = document.getElementById('cartEmpty');
  const itemsEl = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');

  if (state.cart.length === 0) {
    emptyEl.style.display = 'flex';
    itemsEl.innerHTML = '';
    footerEl.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  footerEl.style.display = 'block';

  itemsEl.innerHTML = state.cart
    .map((item) => {
      const p = products.find((pr) => pr.id === item.id);
      return `
        <div class="cart-item" data-id="${item.id}">
          <img class="cart-item-image" src="${p.imageUrl}" alt="${p.title}" onerror="this.src='${p.fallback}'">
          <div class="cart-item-info">
            <div class="cart-item-title">${p.title}</div>
            <div class="cart-item-price">$${(p.price * item.qty).toFixed(2)}</div>
            <div class="cart-item-controls">
              <button class="cart-item-qty-btn" data-action="dec" data-id="${item.id}">−</button>
              <span class="cart-item-qty">${item.qty}</span>
              <button class="cart-item-qty-btn" data-action="inc" data-id="${item.id}">+</button>
              <button class="cart-item-delete" data-id="${item.id}">✕</button>
            </div>
          </div>
        </div>`;
    })
    .join('');

  const subtotal = state.cart.reduce((sum, item) => {
    const p = products.find((pr) => pr.id === item.id);
    return sum + p.price * item.qty;
  }, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  document.getElementById('cartSubtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('cartTax').textContent = `$${tax.toFixed(2)}`;
  document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;

  document.querySelectorAll('.cart-item-qty-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      if (btn.dataset.action === 'inc') changeQty(id, 1);
      else changeQty(id, -1);
    });
  });

  document.querySelectorAll('.cart-item-delete').forEach((btn) => {
    btn.addEventListener('click', () => {
      removeFromCart(parseInt(btn.dataset.id));
    });
  });
}

function addToCart(id) {
  const existing = state.cart.find((c) => c.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ id, qty: 1 });
  }
  updateCartUI();
  renderProducts();
}

function changeQty(id, delta) {
  const item = state.cart.find((c) => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    state.cart = state.cart.filter((c) => c.id !== id);
  }
  updateCartUI();
  renderProducts();
}

function removeFromCart(id) {
  state.cart = state.cart.filter((c) => c.id !== id);
  updateCartUI();
  renderProducts();
}

function renderCategories() {
  const list = document.getElementById('categoryList');
  const cats = ['All', ...new Set(products.map((p) => p.category))];
  list.innerHTML = cats
    .map(
      (cat) => `
        <label class="category-option${state.category === cat ? ' active-cat' : ''}" data-category="${cat}">
          <input type="radio" name="category" value="${cat}"${state.category === cat ? ' checked' : ''}>
          <span>${cat}</span>
        </label>`
    )
    .join('');

  list.querySelectorAll('.category-option').forEach((label) => {
    label.addEventListener('click', () => {
      document.querySelectorAll('.category-option').forEach((l) => l.classList.remove('active-cat'));
      label.classList.add('active-cat');
      const input = label.querySelector('input');
      input.checked = true;
      state.category = input.value;
      renderProducts();
    });
  });
}

function formatCardNumber(val) {
  return val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
}

function formatExpiry(val) {
  let v = val.replace(/\D/g, '').slice(0, 4);
  if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
  return v;
}

function validateShipping() {
  let valid = true;
  const fields = [
    { id: 'fullName', test: (v) => v.trim().length >= 2 },
    { id: 'email', test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
    { id: 'address', test: (v) => v.trim().length >= 5 },
    { id: 'city', test: (v) => v.trim().length >= 2 },
    { id: 'zip', test: (v) => /^[0-9]{5}$/.test(v) },
  ];
  fields.forEach(({ id, test }) => {
    const input = document.getElementById(id);
    const err = input.parentElement.querySelector('.error-msg');
    if (!test(input.value)) {
      input.classList.add('error');
      err.textContent = 'Please enter a valid value.';
      valid = false;
    } else {
      input.classList.remove('error');
      err.textContent = '';
    }
  });
  return valid;
}

function validatePayment() {
  let valid = true;
  const cardRaw = document.getElementById('cardNumber').value.replace(/\s/g, '');
  const fields = [
    { id: 'cardNumber', test: () => cardRaw.length === 16 },
    { id: 'cardName', test: (v) => v.trim().length >= 2 },
    { id: 'expiry', test: (v) => /^\d{2}\/\d{2}$/.test(v) },
    { id: 'cvv', test: (v) => /^[0-9]{3,4}$/.test(v) },
  ];
  fields.forEach(({ id, test }) => {
    const input = document.getElementById(id);
    const err = input.parentElement.querySelector('.error-msg');
    if (!test(input.value)) {
      input.classList.add('error');
      err.textContent = 'Please enter a valid value.';
      valid = false;
    } else {
      input.classList.remove('error');
      err.textContent = '';
    }
  });
  return valid;
}

function openCheckout() {
  if (state.cart.length === 0) return;
  document.getElementById('checkoutOverlay').classList.add('open');
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  showStep(1);
  resetCheckoutForm();
}

function resetCheckoutForm() {
  document.getElementById('shippingForm').reset();
  document.getElementById('paymentForm').reset();
  document.querySelectorAll('.error-msg').forEach((e) => (e.textContent = ''));
  document.querySelectorAll('input.error').forEach((e) => e.classList.remove('error'));
  document.getElementById('cardDisplayNumber').textContent = '**** **** **** ****';
  document.getElementById('cardDisplayName').textContent = 'YOUR NAME';
  document.getElementById('cardDisplayExpiry').textContent = 'MM/YY';
}

function showStep(step) {
  document.querySelectorAll('.checkout-step').forEach((s) => s.classList.remove('active'));
  document.getElementById(`step${step}`).classList.add('active');
  document.querySelectorAll('.step-indicator').forEach((ind) => {
    const s = parseInt(ind.dataset.step);
    ind.classList.toggle('active', s === step);
    ind.classList.toggle('done', s < step);
  });
  document.querySelectorAll('.step-labels span').forEach((l, i) => {
    l.classList.toggle('active', i === step - 1);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  renderProducts();
  updateCartUI();

  document.getElementById('cartToggle').addEventListener('click', () => {
    document.getElementById('cartDrawer').classList.toggle('open');
    document.getElementById('cartOverlay').classList.toggle('open');
  });

  document.getElementById('cartClose').addEventListener('click', () => {
    document.getElementById('cartDrawer').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('open');
  });

  document.getElementById('cartOverlay').addEventListener('click', () => {
    document.getElementById('cartDrawer').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('open');
  });

  document.getElementById('priceSlider').addEventListener('input', (e) => {
    state.maxPrice = parseInt(e.target.value);
    document.getElementById('priceDisplay').textContent = `$${state.maxPrice}`;
    renderProducts();
  });

  document.getElementById('sortSelect').addEventListener('change', (e) => {
    state.sort = e.target.value;
    renderProducts();
  });

  document.getElementById('resetFilters').addEventListener('click', () => {
    state.category = 'All';
    state.maxPrice = 500;
    state.sort = 'default';
    document.getElementById('priceSlider').value = 500;
    document.getElementById('priceDisplay').textContent = '$500';
    document.getElementById('sortSelect').value = 'default';
    renderCategories();
    renderProducts();
  });

  document.getElementById('checkoutBtn').addEventListener('click', openCheckout);
  document.getElementById('checkoutClose').addEventListener('click', () => {
    document.getElementById('checkoutOverlay').classList.remove('open');
  });
  document.getElementById('checkoutOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      document.getElementById('checkoutOverlay').classList.remove('open');
    }
  });

  document.getElementById('shippingForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (validateShipping()) {
      showStep(2);
    }
  });

  document.getElementById('paymentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (validatePayment()) {
      showStep(3);
    }
  });

  document.getElementById('backToShipping').addEventListener('click', () => {
    showStep(1);
  });

  document.getElementById('continueShopping').addEventListener('click', () => {
    state.cart = [];
    updateCartUI();
    renderProducts();
    document.getElementById('checkoutOverlay').classList.remove('open');
  });

  document.getElementById('cardNumber').addEventListener('input', (e) => {
    e.target.value = formatCardNumber(e.target.value);
    document.getElementById('cardDisplayNumber').textContent = e.target.value || '**** **** **** ****';
  });

  document.getElementById('cardName').addEventListener('input', (e) => {
    document.getElementById('cardDisplayName').textContent = e.target.value.toUpperCase() || 'YOUR NAME';
  });

  document.getElementById('expiry').addEventListener('input', (e) => {
    e.target.value = formatExpiry(e.target.value);
    document.getElementById('cardDisplayExpiry').textContent = e.target.value || 'MM/YY';
  });

  document.getElementById('mobileFiltersToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('filters-open');
  });
});
