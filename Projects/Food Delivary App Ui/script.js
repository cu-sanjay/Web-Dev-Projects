// Extended Mock Data
const restaurants = [
    {
        id: 1,
        name: "Paneer Palace",
        category: "North Indian",
        price: 250,
        rating: 4.5,
        time: "30 min",
        image: "https://images.unsplash.com/photo-1567184109411-b28f2703b3ab?w=500"
    },
    {
        id: 2,
        name: "Biryani House",
        category: "Mughlai",
        price: 350,
        rating: 4.8,
        time: "45 min",
        image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500"
    },
    {
        id: 3,
        name: "Pizza Point",
        category: "Italian",
        price: 450,
        rating: 4.2,
        time: "40 min",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500"
    },
    {
        id: 4,
        name: "Burger Joint",
        category: "American",
        price: 200,
        rating: 4.6,
        time: "25 min",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500"
    },
    {
        id: 5,
        name: "Sushi Zen",
        category: "Japanese",
        price: 600,
        rating: 4.9,
        time: "50 min",
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500"
    },
    {
        id: 6,
        name: "Healthy Bowl",
        category: "Salads",
        price: 300,
        rating: 4.3,
        time: "20 min",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500"
    }
];

let cart = [];
let discount = 0;
const couponCode = "WELCOME50";

// DOM Elements
const restaurantContainer = document.getElementById("restaurantContainer");
const cartSidebar = document.getElementById("cartSidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const cartItemsContainer = document.getElementById("cartItems");

// Initialize app
function init() {
    renderRestaurants(restaurants);
    loadCart();
    checkAuthStatus();
}

// Render Restaurants
function renderRestaurants(data) {
    restaurantContainer.innerHTML = "";
    
    if(data.length === 0) {
        restaurantContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">
                <span class="material-symbols-outlined" style="font-size: 3rem; margin-bottom: 10px;">search_off</span>
                <h3>No restaurants found</h3>
            </div>
        `;
        return;
    }

    data.forEach(item => {
        restaurantContainer.innerHTML += `
        <div class="card">
            <div class="card-img-wrap">
                <img src="${item.image}" alt="${item.name}">
                <div class="time-badge">
                    <span class="material-symbols-outlined">schedule</span>
                    ${item.time}
                </div>
            </div>
            <div class="card-body">
                <div class="card-header">
                    <h3>${item.name}</h3>
                    <div class="rating">
                        ${item.rating} <span class="material-symbols-outlined">star</span>
                    </div>
                </div>
                <p class="category">${item.category}</p>
                <div class="card-footer">
                    <div class="price">₹${item.price}</div>
                    <button class="add-btn" onclick="addToCart(${item.id})">Add</button>
                </div>
            </div>
        </div>
        `;
    });
}

// Search / Filter
function filterRestaurants() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const filtered = restaurants.filter(res => 
        res.name.toLowerCase().includes(query) || 
        res.category.toLowerCase().includes(query)
    );
    renderRestaurants(filtered);
}

// Cart Functionality
function toggleCart() {
    cartSidebar.classList.toggle("open");
    sidebarOverlay.classList.toggle("show");
}

function loadCart() {
    const savedCart = localStorage.getItem("cart");
    if(savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

function addToCart(id) {
    const item = restaurants.find(x => x.id === id);
    const existingItem = cart.find(x => x.id === id);

    if(existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }

    updateCartUI();
    showToast(`${item.name} added to cart`);
    
    // Animate badge
    const badge = document.getElementById("cartBadge");
    badge.style.transform = "scale(1.5)";
    setTimeout(() => badge.style.transform = "scale(1)", 200);
}

function updateQuantity(id, change) {
    const itemIndex = cart.findIndex(x => x.id === id);
    if(itemIndex > -1) {
        cart[itemIndex].quantity += change;
        if(cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        updateCartUI();
    }
}

function updateCartUI() {
    cartItemsContainer.innerHTML = "";
    let subtotal = 0;
    let totalItems = 0;

    if(cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <span class="material-symbols-outlined">shopping_bag</span>
                <p>Your cart is empty.</p>
            </div>
        `;
    } else {
        cart.forEach(item => {
            subtotal += (item.price * item.quantity);
            totalItems += item.quantity;

            cartItemsContainer.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>₹${item.price}</p>
                </div>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
            `;
        });
    }

    document.getElementById("cartBadge").textContent = totalItems;
    
    const total = subtotal - discount;
    document.getElementById("cartTotal").textContent = Math.max(0, total);
    
    if(discount > 0) {
        document.getElementById("discountRow").style.display = "flex";
        document.getElementById("discountAmount").textContent = discount;
    } else {
        document.getElementById("discountRow").style.display = "none";
    }

    localStorage.setItem("cart", JSON.stringify(cart));
}

function applyCoupon() {
    if(cart.length === 0) {
        showToast("Cart is empty");
        return;
    }

    const code = document.getElementById("couponInput").value.trim().toUpperCase();
    if(code === couponCode) {
        discount = 50;
        showToast("Coupon Applied!");
        updateCartUI();
    } else {
        showToast("Invalid Coupon");
        discount = 0;
        updateCartUI();
    }
}

// Auth & Modals
function checkAuthStatus() {
    const user = localStorage.getItem("user");
    if(user) {
        document.getElementById("userName").textContent = user;
        document.getElementById("loginBtn").style.display = "none";
        document.getElementById("profileBtn").style.display = "flex";
    } else {
        document.getElementById("loginBtn").style.display = "block";
        document.getElementById("profileBtn").style.display = "none";
    }
}

function login() {
    const username = document.getElementById("username").value.trim();
    if(!username) {
        showToast("Please enter username");
        return;
    }
    
    localStorage.setItem("user", username);
    checkAuthStatus();
    closeModal("loginModal");
    showToast(`Welcome back, ${username}!`);
}

function logout() {
    localStorage.removeItem("user");
    checkAuthStatus();
    closeModal("profileModal");
    showToast("Logged out successfully");
}

function openModal(id) {
    const modal = document.getElementById(id);
    modal.style.display = "block";
    // Trigger reflow
    void modal.offsetWidth;
    modal.classList.add("show");
}

function closeModal(id) {
    const modal = document.getElementById(id);
    modal.classList.remove("show");
    setTimeout(() => {
        modal.style.display = "none";
    }, 300);
}

function closeLogin() { closeModal("loginModal"); }
function closeProfile() { closeModal("profileModal"); }
function closeCheckout() { closeModal("checkoutModal"); }

document.getElementById("loginBtn").onclick = () => { openModal("loginModal"); };
document.getElementById("profileBtn").onclick = () => { 
    renderOrderHistory();
    openModal("profileModal"); 
};

// Checkout & Orders
function openCheckout() {
    if(cart.length === 0) {
        showToast("Your cart is empty");
        return;
    }
    const user = localStorage.getItem("user");
    if(!user) {
        showToast("Please login to checkout");
        toggleCart(); // Close sidebar
        openModal("loginModal");
        return;
    }
    
    document.getElementById("checkoutModal").querySelector('.payment-title').innerHTML = `Payment Method <br><small style="color:var(--text-muted);font-weight:normal;">Total: ₹${document.getElementById("cartTotal").textContent}</small>`;
    openModal("checkoutModal");
}

function placeOrder() {
    const address = document.getElementById("address").value.trim();
    if(!address) {
        showToast("Please enter delivery address");
        return;
    }

    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    const total = document.getElementById("cartTotal").textContent;
    
    orders.push({
        id: "ORD" + Math.floor(Math.random() * 100000),
        date: new Date().toLocaleString(),
        items: [...cart],
        total: total,
        status: "Processing"
    });

    localStorage.setItem("orders", JSON.stringify(orders));
    
    // Clear cart
    cart = [];
    discount = 0;
    document.getElementById("couponInput").value = "";
    updateCartUI();
    
    closeModal("checkoutModal");
    toggleCart(); // Close sidebar
    showToast("Order placed successfully!");
}

function renderOrderHistory() {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    const list = document.getElementById("orderHistoryList");
    
    if(orders.length === 0) {
        list.innerHTML = `<p class="no-orders" style="color:var(--text-muted);text-align:center;">No past orders.</p>`;
        return;
    }
    
    list.innerHTML = "";
    
    // Sort descending by date (simplistic approach: reverse array)
    const reversedOrders = [...orders].reverse();
    
    reversedOrders.forEach(order => {
        const itemNames = order.items.map(i => `${i.quantity}x ${i.name}`).join(", ");
        list.innerHTML += `
        <div class="order-card">
            <div class="order-card-header">
                <span>${order.id}</span>
                <span>${order.date}</span>
            </div>
            <p style="font-size:0.95rem;">${itemNames}</p>
            <div class="order-card-total">
                Total: ₹${order.total} <span style="float:right;color:var(--secondary);">${order.status}</span>
            </div>
        </div>
        `;
    });
}

// Toast
function showToast(message) {
    const toast = document.getElementById("toast");
    document.getElementById("toastMsg").innerText = message;
    
    toast.classList.add("show");
    
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// Start
init();