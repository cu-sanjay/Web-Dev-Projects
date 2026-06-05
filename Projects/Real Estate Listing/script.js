/**
 * Real Estate Listing Logic
 * Handles property filtering, gallery rendering, and local storage favorites.
 */

const properties = [
  { id: 1, title: "Coastal Breeze Villa", price: 8500000, type: "House", city: "Visakhapatnam, Andhra Pradesh", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80", description: "Beautiful coastal villa with ocean views.", ownerName: "Ravi Kumar", ownerContact: "+91 98480 12345", canBargain: true, isLoanApproved: true },
  { id: 2, title: "Himalayan View Lodge", price: 4500000, type: "House", city: "Itanagar, Arunachal Pradesh", img: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=600&q=80", description: "Serene mountain lodge surrounded by nature.", ownerName: "Tashi Wangchu", ownerContact: "+91 94360 54321", canBargain: false, isLoanApproved: true },
  { id: 3, title: "Tea Garden Estate", price: 12000000, type: "House", city: "Guwahati, Assam", img: "https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&w=600&q=80", description: "Expansive estate overlooking rolling tea gardens.", ownerName: "Arun Das", ownerContact: "+91 94350 98765", canBargain: true, isLoanApproved: false },
  { id: 4, title: "Patliputra Heights", price: 6500000, type: "Apartment", city: "Patna, Bihar", img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80", description: "Modern apartment in the heart of historical Patna.", ownerName: "Sanjay Jha", ownerContact: "+91 99340 11223", canBargain: false, isLoanApproved: true },
  { id: 5, title: "Steel City Villa", price: 5500000, type: "House", city: "Raipur, Chhattisgarh", img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80", description: "Modern villa with state-of-the-art amenities.", ownerName: "Amit Singh", ownerContact: "+91 77120 33445", canBargain: true, isLoanApproved: true },
  { id: 6, title: "Beachfront Bliss", price: 15000000, type: "House", city: "Panaji, Goa", img: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=600&q=80", description: "Luxury villa just steps away from the Arabian Sea.", ownerName: "Carlos Souza", ownerContact: "+91 98221 66778", canBargain: false, isLoanApproved: true },
  { id: 7, title: "Heritage Haveli", price: 9500000, type: "House", city: "Ahmedabad, Gujarat", img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80", description: "Beautifully restored haveli reflecting Gujarati culture.", ownerName: "Bhavin Patel", ownerContact: "+91 98250 55443", canBargain: true, isLoanApproved: true },
  { id: 8, title: "Cyber Hub Studio", price: 7500000, type: "Apartment", city: "Gurugram, Haryana", img: "https://images.unsplash.com/photo-1460317442991-0ec239f636a7?auto=format&fit=crop&w=600&q=80", description: "Sleek studio apartment near the business district.", ownerName: "Vikram Malhotra", ownerContact: "+91 98100 22334", canBargain: false, isLoanApproved: true },
  { id: 9, title: "Snow Peak Cottage", price: 4000000, type: "House", city: "Shimla, Himachal Pradesh", img: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=600&q=80", description: "Cozy cottage with panoramic views of the Himalayas.", ownerName: "Sunil Sharma", ownerContact: "+91 94180 88776", canBargain: true, isLoanApproved: false },
  { id: 10, title: "Coal Capital Estate", price: 4800000, type: "House", city: "Ranchi, Jharkhand", img: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=600&q=80", description: "Spacious estate in a quiet residential area.", ownerName: "Manoj Mahato", ownerContact: "+91 94311 44556", canBargain: false, isLoanApproved: true },
  { id: 11, title: "Silicon Valley Penthouse", price: 18000000, type: "Apartment", city: "Bengaluru, Karnataka", img: "https://images.unsplash.com/photo-1567496898905-af4139885770?auto=format&fit=crop&w=600&q=80", description: "Luxury penthouse in India's tech capital.", ownerName: "Sandeep Rao", ownerContact: "+91 98450 77889", canBargain: false, isLoanApproved: true },
  { id: 12, title: "Backwater Retreat", price: 11000000, type: "House", city: "Kochi, Kerala", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80", description: "Tranquil home on the banks of Kerala backwaters.", ownerName: "Thomas Varghese", ownerContact: "+91 98470 99001", canBargain: true, isLoanApproved: true },
  { id: 13, title: "Lakeview Residency", price: 5200000, type: "Apartment", city: "Bhopal, Madhya Pradesh", img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=600&q=80", description: "Apartment with a stunning view of the Upper Lake.", ownerName: "Rajesh Gupta", ownerContact: "+91 94250 11223", canBargain: true, isLoanApproved: false },
  { id: 14, title: "Marine Drive Condo", price: 25000000, type: "Condo", city: "Mumbai, Maharashtra", img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80", description: "Premium condo with an iconic view of the Queen's Necklace.", ownerName: "Aditya Shah", ownerContact: "+91 98200 33445", canBargain: false, isLoanApproved: true },
  { id: 15, title: "Imphal Valley Home", price: 3500000, type: "House", city: "Imphal, Manipur", img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80", description: "Traditional home nestled in the Imphal valley.", ownerName: "Noren Singh", ownerContact: "+91 98560 55667", canBargain: true, isLoanApproved: true },
  { id: 16, title: "Pine Hill Cottage", price: 4200000, type: "House", city: "Shillong, Meghalaya", img: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=600&q=80", description: "Charming cottage in the Scotland of the East.", ownerName: "Liza Sangma", ownerContact: "+91 94361 77889", canBargain: false, isLoanApproved: true },
  { id: 17, title: "Blue Mountain House", price: 3800000, type: "House", city: "Aizawl, Mizoram", img: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=600&q=80", description: "Hilltop house with breathtaking valley views.", ownerName: "Zoramthanga", ownerContact: "+91 94363 11223", canBargain: true, isLoanApproved: false },
  { id: 18, title: "Kohima Heritage Lodge", price: 3200000, type: "House", city: "Kohima, Nagaland", img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80", description: "Lodge built with traditional Naga architecture.", ownerName: "Kevi Angami", ownerContact: "+91 94360 33445", canBargain: false, isLoanApproved: true },
  { id: 19, title: "Temple City Villa", price: 5800000, type: "House", city: "Bhubaneswar, Odisha", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80", description: "Modern villa in the peaceful city of temples.", ownerName: "Pradipta Mohanty", ownerContact: "+91 94370 55667", canBargain: true, isLoanApproved: true },
  { id: 20, title: "Green Field Farmhouse", price: 8200000, type: "House", city: "Amritsar, Punjab", img: "https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&w=600&q=80", description: "Spacious farmhouse near the holy city of Amritsar.", ownerName: "Gurpreet Singh", ownerContact: "+91 98140 77889", canBargain: false, isLoanApproved: true },
  { id: 21, title: "Pink City Palace", price: 14000000, type: "House", city: "Jaipur, Rajasthan", img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80", description: "Exquisite residence reflecting the royalty of Rajasthan.", ownerName: "Digvijay Singh", ownerContact: "+91 98290 99001", canBargain: true, isLoanApproved: true },
  { id: 22, title: "Kanchenjunga View", price: 3900000, type: "House", city: "Gangtok, Sikkim", img: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=600&q=80", description: "Home with a clear view of the world's third highest peak.", ownerName: "Karma Lepcha", ownerContact: "+91 94340 11223", canBargain: false, isLoanApproved: true },
  { id: 23, title: "Marina Coast Apartment", price: 13500000, type: "Apartment", city: "Chennai, Tamil Nadu", img: "https://images.unsplash.com/photo-1567496898905-af4139885770?auto=format&fit=crop&w=600&q=80", description: "Luxury apartment overlooking the Marina Beach.", ownerName: "Senthil Kumar", ownerContact: "+91 98400 33445", canBargain: false, isLoanApproved: true },
  { id: 24, title: "Nawabi Nizam Villa", price: 16000000, type: "House", city: "Hyderabad, Telangana", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80", description: "Grand villa in the city of pearls and biryani.", ownerName: "Syed Ahmed", ownerContact: "+91 98480 55667", canBargain: true, isLoanApproved: true },
  { id: 25, title: "Ujjayanta Residency", price: 2800000, type: "House", city: "Agartala, Tripura", img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80", description: "Peaceful home near the historical palace.", ownerName: "Biplab Deb", ownerContact: "+91 94361 99001", canBargain: true, isLoanApproved: false },
  { id: 26, title: "Awadh Heritage Home", price: 7200000, type: "House", city: "Lucknow, Uttar Pradesh", img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80", description: "Elegant home blending traditional Awadhi culture.", ownerName: "Anwar Zaidi", ownerContact: "+91 94150 11223", canBargain: false, isLoanApproved: true },
  { id: 27, title: "Doon Valley Estate", price: 6800000, type: "House", city: "Dehradun, Uttarakhand", img: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=600&q=80", description: "Estate nestled in the beautiful Doon valley.", ownerName: "Pawan Negi", ownerContact: "+91 94120 33445", canBargain: true, isLoanApproved: true },
  { id: 28, title: "Colonial Mansion", price: 12500000, type: "House", city: "Kolkata, West Bengal", img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=600&q=80", description: "Grand mansion reflecting Kolkata's rich colonial history.", ownerName: "Subrata Bose", ownerContact: "+91 98300 55667", canBargain: false, isLoanApproved: true },
  { id: 29, title: "Port Blair Shack", price: 3100000, type: "House", city: "Port Blair, Andaman and Nicobar Islands", img: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=600&q=80", description: "Cozy shack close to the pristine beaches.", ownerName: "Vijay Anand", ownerContact: "+91 94342 77889", canBargain: true, isLoanApproved: true },
  { id: 30, title: "Le Corbusier Studio", price: 6200000, type: "Apartment", city: "Chandigarh", img: "https://images.unsplash.com/photo-1460317442991-0ec239f636a7?auto=format&fit=crop&w=600&q=80", description: "Modern studio in the beautifully planned city.", ownerName: "Manpreet Kaur", ownerContact: "+91 98150 99001", canBargain: false, isLoanApproved: true },
  { id: 31, title: "Daman Seafront", price: 4100000, type: "House", city: "Daman, Dadra and Nagar Haveli and Daman and Diu", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80", description: "Home with a serene view of the Daman sea.", ownerName: "Jignesh Shah", ownerContact: "+91 98241 11223", canBargain: true, isLoanApproved: true },
  { id: 32, title: "Lutyens Bungalow", price: 30000000, type: "House", city: "New Delhi, Delhi", img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80", description: "Prestigious bungalow in the heart of the national capital.", ownerName: "Rakesh Mittal", ownerContact: "+91 98110 33445", canBargain: false, isLoanApproved: true },
  { id: 33, title: "Dal Lake Houseboat", price: 8500000, type: "House", city: "Srinagar, Jammu and Kashmir", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80", description: "Unique living experience on a luxury houseboat.", ownerName: "Ghulam Nabi", ownerContact: "+91 94190 55667", canBargain: true, isLoanApproved: true },
  { id: 34, title: "Ladakh Stone House", price: 2900000, type: "House", city: "Leh, Ladakh", img: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=600&q=80", description: "Rugged stone house in the cold desert of Ladakh.", ownerName: "Rigzin Dorjay", ownerContact: "+91 94191 77889", canBargain: false, isLoanApproved: true },
  { id: 35, title: "Coral Island Villa", price: 2500000, type: "House", city: "Kavaratti, Lakshadweep", img: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=600&q=80", description: "Villa surrounded by turquoise waters and coral reefs.", ownerName: "Abdullah Koya", ownerContact: "+91 94470 99001", canBargain: true, isLoanApproved: true },
  { id: 36, title: "French Quarter Villa", price: 9200000, type: "House", city: "Puducherry", img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80", description: "Villa reflecting the unique French heritage of Puducherry.", ownerName: "Pierre Dubois", ownerContact: "+91 94430 11223", canBargain: false, isLoanApproved: true }
];

// Initialize favorites from localStorage
let favorites = [];
try {
  favorites = JSON.parse(localStorage.getItem('property_favs')) || [];
} catch (e) {
  favorites = [];
}

let showOnlyFavs = false;

// DOM Elements
const gallery = document.getElementById('property-gallery');
const searchInput = document.getElementById('city-search');
const typeFilter = document.getElementById('type-filter');
const favToggleBtn = document.getElementById('toggle-favorites');
const resultCount = document.getElementById('result-count');

// DOM Elements for modal
const propertyDetailModal = document.getElementById('property-detail-modal');
const modalCloseBtn = document.querySelector('.modal-close-btn');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalPrice = document.getElementById('modal-price');
const modalMeta = document.getElementById('modal-meta');
const modalDescription = document.getElementById('modal-description');
const modalOwnerName = document.getElementById('modal-owner-name');
const modalOwnerContact = document.getElementById('modal-owner-contact');

function saveFavs() {
  localStorage.setItem('property_favs', JSON.stringify(favorites));
}

function toggleFavorite(id) {
  const index = favorites.indexOf(id);
  if (index === -1) {
    favorites.push(id);
  } else {
    favorites.splice(index, 1);
  }
  saveFavs();
  render();
}

function showPropertyDetails(propertyId) {
  const property = properties.find(p => p.id === propertyId);
  if (!property) return;

  modalImg.src = property.img;
  modalImg.alt = property.title;
  modalTitle.textContent = property.title;
  modalPrice.textContent = `₹${property.price.toLocaleString('en-IN')}`;
  modalMeta.textContent = `${property.type} • ${property.city}`;
  modalDescription.textContent = property.description;
  modalDescription.innerHTML += `<div class="modal-status-labels"><p><strong>Negotiable:</strong> ${property.canBargain ? 'Yes' : 'No'}</p><p><strong>Loan Approved:</strong> ${property.isLoanApproved ? 'Yes' : 'No'}</p></div>`;
  modalOwnerName.textContent = property.ownerName;
  modalOwnerContact.textContent = property.ownerContact;

  propertyDetailModal.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevent scrolling background
}

function closePropertyDetails() {
  propertyDetailModal.classList.remove('active');
  document.body.style.overflow = ''; // Restore scrolling
}


function render() {
  const query = searchInput.value.toLowerCase();
  const type = typeFilter.value;

  const filtered = properties.filter(p => {
    const matchesSearch = p.city.toLowerCase().includes(query) || p.title.toLowerCase().includes(query);
    const matchesType = type === 'all' || p.type === type;
    const matchesFav = showOnlyFavs ? favorites.includes(p.id) : true;
    return matchesSearch && matchesType && matchesFav;
  });

  gallery.innerHTML = '';

  if (filtered.length === 0) {
    gallery.innerHTML = '<p class="no-results">No properties found matching your criteria.</p>';
    resultCount.textContent = 'Showing 0 properties';
    return;
  }

  filtered.forEach(p => {
    const isFav = favorites.includes(p.id);
    const card = document.createElement('article');
    card.dataset.id = p.id; // Add data-id to the card for easy lookup
    card.className = 'property-card';
    card.innerHTML = `
      <div class="card-image">
        <span class="type-badge">${p.type}</span>
        <div class="status-badges">
          ${p.canBargain ? '<span class="status-badge bargain">Negotiable</span>' : ''}
          ${p.isLoanApproved ? '<span class="status-badge loan">Loan Approved</span>' : ''}
        </div>
        <img src="${p.img}" alt="${p.title}" loading="lazy">
      </div>
      <div class="card-content">
        <button class="fav-btn" data-id="${p.id}" aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
          ${isFav ? '❤️' : '🤍'}
        </button>
        <div class="price">₹${p.price.toLocaleString('en-IN')}</div>
        <h3>${p.title}</h3>
        <div class="meta">${p.type} • ${p.city}</div>
      </div>
    `;
    gallery.appendChild(card);
  });

  resultCount.textContent = `Showing ${filtered.length} properties ${showOnlyFavs ? 'from favorites' : ''}`;
}

// Event Listeners
searchInput.addEventListener('input', render);
typeFilter.addEventListener('change', render);

gallery.addEventListener('click', (e) => {
  const btn = e.target.closest('.fav-btn');
  if (btn) {
    toggleFavorite(parseInt(btn.dataset.id));
  }
  else {
    const card = e.target.closest('.property-card');
    if (card) {
      showPropertyDetails(parseInt(card.dataset.id));
    }
  }
});


favToggleBtn.addEventListener('click', () => {
  showOnlyFavs = !showOnlyFavs;
  favToggleBtn.textContent = showOnlyFavs ? 'Show All' : 'Show Favorites';
  favToggleBtn.classList.toggle('active');
  render();
});

modalCloseBtn.addEventListener('click', closePropertyDetails);
propertyDetailModal.addEventListener('click', (e) => {
  if (e.target === propertyDetailModal) { // Close when clicking outside modal content
    closePropertyDetails();
  }
});

// Initial Render
render();