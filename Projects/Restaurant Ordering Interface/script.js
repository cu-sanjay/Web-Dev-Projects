/**
 * Umami Culinary Orchestration Engine - Indian Fine Dining Edition
 */
document.addEventListener('DOMContentLoaded', () => {

  // --- MENU DATA WAREHOUSE (PREMIUM INDIAN SELECTIONS) ---
  const menuCategories = [
    { id: 'all', title: 'All Curations', subtitle: 'Artisanal Indian delicacies engineered with royal heritage.' },
    { id: 'starters', title: 'Starters', subtitle: 'Crisp textures and tempered spices to awaken your palate.' },
    { id: 'mains', title: 'Main Course', subtitle: 'Rich, slow-simmered gravies and clay-fired masterpieces.' },
    { id: 'desserts', title: 'Desserts', subtitle: 'Decadent, fragrant finales infused with silver leaf and cardamom.' }
  ];

  const menuDatabase = [
    {
      id: 101,
      category: 'starters',
      name: 'Lotus Root & Avocado Papdi Chaat',
      description: 'Crisp lotus root discs topped with tempered Haas avocado cubes, organic yogurt foam, micro-greens, and a baseline drizzle of freeze-dried wild raspberry chutney.',
      basePrice: 18.00,
      image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=600&q=80',
      isVeg: true,
      isSpicy: false,
      customizations: [
        {
          id: 'portion',
          name: 'Portion Scale',
          type: 'radio',
          options: [
            { id: 'standard', name: 'Standard Platina', priceModifier: 0 },
            { id: 'sharing', name: 'Royal Assemblage (Sharing)', priceModifier: 10.00 }
          ]
        }
      ]
    },
    {
      id: 102,
      category: 'starters',
      name: 'Bhatti Fire Smoked Paneer Tikka',
      description: 'Hand-pressed cottage cheese blocks marinated overnight in black cardamom and mustard oil infusion, char-grilled over natural charcoal embers.',
      basePrice: 22.00,
      image: 'https://images.unsplash.com/photo-1567184109411-b28f2703b3ab?auto=format&fit=crop&w=600&q=80',
      isVeg: true,
      isSpicy: true,
      customizations: [
        {
          id: 'smoke',
          name: 'Smoke Intensity',
          type: 'radio',
          options: [
            { id: 'subtle', name: 'Applewood Apple-Mellow', priceModifier: 0 },
            { id: 'heavy', name: 'Intense Dhungar Smoke', priceModifier: 1.50 }
          ]
        }
      ]
    },
    {
      id: 201,
      category: 'mains',
      name: 'Nizami Awadhi Jackfruit Biryani',
      description: 'Aromatic long-grain basmati layers infused with gold saffron filaments, tender raw jackfruit chunks, and fresh mint leaves, slow-cooked under clay-sealed dough crust walls.',
      basePrice: 34.00,
      image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80',
      isVeg: true,
      isSpicy: true,
      customizations: [
        {
          id: 'accompaniment',
          name: 'Artisanal Raita Selection',
          type: 'radio',
          options: [
            { id: 'burani', name: 'Burhani Smoked Garlic Raita', priceModifier: 0 },
            { id: 'pomegranate', name: 'Spiced Pomegranate Seed Raita', priceModifier: 2.00 }
          ]
        },
        {
          id: 'additions',
          name: 'Accompaniment Breads',
          type: 'checkbox',
          options: [
            { id: 'truffle-naan', name: 'Butter Leavened Truffle Naan', priceModifier: 5.00 },
            { id: 'laccha', name: 'Smoked Laccha Paratha', priceModifier: 4.00 }
          ]
        }
      ]
    },
    {
      id: 202,
      category: 'mains',
      name: '24-Hour Slow-Simmered Black Dal',
      description: 'Whole organic black lentils slow-churned over continuous low ash fire for 24 hours, enriched with clarifyed white butter lipids and hand-pressed vine tomato reductions.',
      basePrice: 28.00,
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
      isVeg: true,
      isSpicy: false,
      customizations: [
        {
          id: 'extra-churn',
          name: 'Garnish Accents',
          type: 'radio',
          options: [
            { id: 'regular', name: 'Fresh Ginger Juliennes', priceModifier: 0 },
            { id: 'premium', name: 'Clotted Malai Cream Float & Gold Leaf', priceModifier: 4.50 }
          ]
        }
      ]
    },
    {
      id: 301,
      category: 'desserts',
      name: 'Deconstructed Pistachio Rabri Kulfi',
      description: 'Frozen dense reduced-milk crystallization columns resting on a warm bed of organic pistachio brittle crumble, sprayed with wild rose water vapor mist.',
      basePrice: 16.00,
      image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80',
      isVeg: true,
      isSpicy: false,
      customizations: []
    }
  ];

  // --- RUNTIME APPLICATION STATE ---
  let selectedCategory = 'all';
  let vegetarianOnlyFilter = false;
  let searchToken = '';
  let activeCart = [];
  let currentCustomizingItem = null;
  let currentModalQuantity = 1;

  // --- CORE DOM SELECTORS ---
  const categoryListElement = document.getElementById('category-list');
  const menuGridElement = document.getElementById('menu-grid');
  const selectedCategoryTitle = document.getElementById('selected-category-title');
  const categorySubtitle = document.getElementById('category-subtitle');
  const searchInputElement = document.getElementById('menu-search');
  const filterVegCheckbox = document.getElementById('filter-veg-only');

  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartItemCountBadge = document.getElementById('cart-item-count');
  const summarySubtotalElement = document.getElementById('summary-subtotal');
  const summaryTaxElement = document.getElementById('summary-tax');
  const summaryDeliveryElement = document.getElementById('summary-delivery');
  const summaryTotalElement = document.getElementById('summary-total');
  const checkoutButton = document.getElementById('btn-checkout');

  // Modal UI Hooks
  const customizationModal = document.getElementById('customization-modal');
  const modalCloseButton = document.getElementById('modal-close');
  const customizationForm = document.getElementById('customization-form');
  const modalOptionsBody = document.getElementById('modal-options-body');
  const btnQtyMinus = document.getElementById('btn-qty-minus');
  const btnQtyPlus = document.getElementById('btn-qty-plus');
  const modalQtyDisplay = document.getElementById('modal-qty-display');
  const modalTotalPriceDisplay = document.getElementById('modal-total-price-display');

  /**
   * System Core Inception Routine
   */
  function init() {
    setupFrameworkEventListeners();
    renderCategoryControls();
    renderMenuDeck();
    synchronizeCartTotals();
  }

  /**
   * Wire Event Listeners to Layout Containers
   */
  function setupFrameworkEventListeners() {
    searchInputElement.addEventListener('input', (e) => {
      searchToken = e.target.value.toLowerCase();
      renderMenuDeck();
    });

    filterVegCheckbox.addEventListener('change', (e) => {
      vegetarianOnlyFilter = e.target.checked;
      renderMenuDeck();
    });

    modalCloseButton.addEventListener('click', closeCustomizationModal);
    btnQtyMinus.addEventListener('click', () => adjustModalQuantity(-1));
    btnQtyPlus.addEventListener('click', () => adjustModalQuantity(1));
    customizationForm.addEventListener('submit', handleCustomizationFormSubmit);
    customizationForm.addEventListener('change', calculateModalDynamicLivePrice);
    checkoutButton.addEventListener('click', triggerOrderPlacementCheckoutWorkflow);
  }

  /**
   * Build Sidebar Category Links
   */
  function renderCategoryControls() {
    categoryListElement.innerHTML = '';
    menuCategories.forEach(cat => {
      const li = document.createElement('li');
      const button = document.createElement('button');
      button.className = `category-btn ${cat.id === selectedCategory ? 'active' : ''}`;
      button.textContent = cat.title;
      button.dataset.catId = cat.id;

      button.addEventListener('click', () => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        selectedCategory = cat.id;
        
        selectedCategoryTitle.textContent = cat.title;
        categorySubtitle.textContent = cat.subtitle;
        
        renderMenuDeck();
      });

      li.appendChild(button);
      categoryListElement.appendChild(li);
    });
  }

  /**
   * Process and Render Menu Grid Layout Cards
   */
  function renderMenuDeck() {
    menuGridElement.innerHTML = '';

    const filteredDataset = menuDatabase.filter(item => {
      const matchesCategory = (selectedCategory === 'all' || item.category === selectedCategory);
      const matchesVeg = (!vegetarianOnlyFilter || item.isVeg);
      const matchesSearch = (item.name.toLowerCase().includes(searchToken) || 
                             item.description.toLowerCase().includes(searchToken));
      return matchesCategory && matchesVeg && matchesSearch;
    });

    if (filteredDataset.length === 0) {
      menuGridElement.innerHTML = `<div class="empty-cart"><p>No items match your culinary filters.</p></div>`;
      return;
    }

    filteredDataset.forEach(item => {
      const card = document.createElement('div');
      card.className = 'menu-card';

      let tagsHTML = '';
      if (item.isVeg) tagsHTML += `<span class="badge-tag veg">Veg</span>`;
      if (item.isSpicy) tagsHTML += `<span class="badge-tag spicy">Spicy</span>`;

      card.innerHTML = `
        <div class="card-image-wrapper">
          <img class="card-image" src="${item.image}" alt="${escapeHTML(item.name)}" loading="lazy">
          <div class="card-tags">${tagsHTML}</div>
        </div>
        <div class="card-info">
          <h4 class="card-title">${escapeHTML(item.name)}</h4>
          <p class="card-desc">${escapeHTML(item.description)}</p>
        </div>
        <div class="card-footer">
          <span class="card-price price-mono">$${item.basePrice.toFixed(2)}</span>
          <button class="btn-add-trigger" data-item-id="${item.id}">Configure</button>
        </div>
      `;

      card.querySelector('.btn-add-trigger').addEventListener('click', () => {
        openCustomizationModal(item.id);
      });

      menuGridElement.appendChild(card);
    });
  }

  /**
   * Open Modals and Compute Item Configuration Matrices
   */
  function openCustomizationModal(itemId) {
    const item = menuDatabase.find(i => i.id === itemId);
    if (!item) return;

    currentCustomizingItem = item;
    currentModalQuantity = 1;

    document.getElementById('modal-item-id').value = item.id;
    document.getElementById('modal-item-name').textContent = item.name;
    document.getElementById('modal-item-description').textContent = item.description;
    modalQtyDisplay.textContent = currentModalQuantity;

    modalOptionsBody.innerHTML = '';

    item.customizations.forEach(group => {
      const groupContainer = document.createElement('div');
      groupContainer.className = 'option-group';
      
      const groupTitle = document.createElement('h5');
      groupTitle.className = 'option-group-title';
      groupTitle.textContent = group.name;
      groupContainer.appendChild(groupTitle);

      const choicesWrapper = document.createElement('div');
      choicesWrapper.className = 'option-choices-wrap';

      group.options.forEach((opt, idx) => {
        const row = document.createElement('label');
        row.className = 'choice-row';

        const leftSide = document.createElement('div');
        leftSide.className = 'choice-label-side';

        const inputControl = document.createElement('input');
        inputControl.type = group.type;
        inputControl.name = `mod-${group.id}`;
        inputControl.value = opt.id;
        inputControl.dataset.priceMod = opt.priceModifier;
        inputControl.dataset.optName = opt.name;
        inputControl.dataset.groupName = group.name;

        if (group.type === 'radio' && idx === 0) {
          inputControl.checked = true;
        }

        const labelText = document.createElement('span');
        labelText.textContent = opt.name;

        leftSide.appendChild(inputControl);
        leftSide.appendChild(labelText);

        const rightSide = document.createElement('div');
        rightSide.className = 'choice-price-side price-mono';
        rightSide.textContent = opt.priceModifier > 0 ? `+$${opt.priceModifier.toFixed(2)}` : 'Included';

        row.appendChild(leftSide);
        row.appendChild(rightSide);
        choicesWrapper.appendChild(row);
      });

      groupContainer.appendChild(choicesWrapper);
      modalOptionsBody.appendChild(groupContainer);
    });

    calculateModalDynamicLivePrice();
    customizationModal.classList.add('open');
  }

  function closeCustomizationModal() {
    customizationModal.classList.remove('open');
    currentCustomizingItem = null;
  }

  function adjustModalQuantity(direction) {
    const projectedQty = currentModalQuantity + direction;
    if (projectedQty >= 1 && projectedQty <= 20) {
      currentModalQuantity = projectedQty;
      modalQtyDisplay.textContent = currentModalQuantity;
      calculateModalDynamicLivePrice();
    }
  }

  function calculateModalDynamicLivePrice() {
    if (!currentCustomizingItem) return;

    let aggregateSinglePrice = currentCustomizingItem.basePrice;
    const selectedInputs = modalOptionsBody.querySelectorAll('input:checked');
    selectedInputs.forEach(input => {
      aggregateSinglePrice += parseFloat(input.dataset.priceMod || 0);
    });

    modalTotalPriceDisplay.textContent = `$${(aggregateSinglePrice * currentModalQuantity).toFixed(2)}`;
  }

  function handleCustomizationFormSubmit(e) {
    e.preventDefault();
    if (!currentCustomizingItem) return;

    const selectedModifiers = [];
    const chosenInputs = modalOptionsBody.querySelectorAll('input:checked');
    let subModsPriceAccumulator = 0;

    chosenInputs.forEach(input => {
      subModsPriceAccumulator += parseFloat(input.dataset.priceMod || 0);
      selectedModifiers.push({
        groupName: input.dataset.groupName,
        optionName: input.dataset.optName
      });
    });

    const itemUnitFinalPrice = currentCustomizingItem.basePrice + subModsPriceAccumulator;
    const uniqueConfigurationSignature = JSON.stringify(selectedModifiers);

    const existingCartMatch = activeCart.find(cartEntry => 
      cartEntry.itemId === currentCustomizingItem.id && 
      cartEntry.configurationSignature === uniqueConfigurationSignature
    );

    if (existingCartMatch) {
      existingCartMatch.quantity += currentModalQuantity;
    } else {
      activeCart.push({
        cartRowId: Date.now() + Math.random().toString(36).substr(2, 5),
        itemId: currentCustomizingItem.id,
        name: currentCustomizingItem.name,
        unitPrice: itemUnitFinalPrice,
        quantity: currentModalQuantity,
        modifiers: selectedModifiers,
        configurationSignature: uniqueConfigurationSignature
      });
    }

    closeCustomizationModal();
    renderActiveCartLayout();
    synchronizeCartTotals();
  }

  function renderActiveCartLayout() {
    const existingRows = cartItemsContainer.querySelectorAll('.cart-item, .empty-cart');
    existingRows.forEach(el => el.remove());

    if (activeCart.length === 0) {
      const emptyNode = document.createElement('div');
      emptyNode.className = 'empty-cart';
      emptyNode.innerHTML = `
        <div class="empty-cart-icon">🛒</div>
        <p>Your cart is empty.</p>
        <span>Select items from the menu to customize your meal.</span>
      `;
      cartItemsContainer.appendChild(emptyNode);
      return;
    }

    activeCart.forEach(entry => {
      const itemRow = document.createElement('div');
      itemRow.className = 'cart-item';
      const modsDescription = entry.modifiers.map(m => m.optionName).join(', ');

      itemRow.innerHTML = `
        <div class="cart-item-details">
          <div class="cart-item-name">${escapeHTML(entry.name)}</div>
          ${modsDescription ? `<div class="cart-item-mods">${escapeHTML(modsDescription)}</div>` : ''}
          <div class="cart-item-price price-mono">$${(entry.unitPrice * entry.quantity).toFixed(2)}</div>
        </div>
        <div class="cart-item-actions">
          <button class="btn-remove-cart" data-row-id="${entry.cartRowId}">&times;</button>
          <div class="cart-item-qty-wrap">
            <button class="btn-cart-qty minus" data-row-id="${entry.cartRowId}">-</button>
            <span class="cart-qty-num price-mono">${entry.quantity}</span>
            <button class="btn-cart-qty plus" data-row-id="${entry.cartRowId}">+</button>
          </div>
        </div>
      `;

      itemRow.querySelector('.btn-remove-cart').addEventListener('click', () => deleteCartRow(entry.cartRowId));
      itemRow.querySelector('.btn-cart-qty.minus').addEventListener('click', () => updateCartQuantity(entry.cartRowId, -1));
      itemRow.querySelector('.btn-cart-qty.plus').addEventListener('click', () => updateCartQuantity(entry.cartRowId, 1));

      cartItemsContainer.appendChild(itemRow);
    });
  }

  function updateCartQuantity(rowId, delta) {
    const targetEntry = activeCart.find(e => e.cartRowId === rowId);
    if (!targetEntry) return;

    targetEntry.quantity += delta;
    if (targetEntry.quantity <= 0) {
      activeCart = activeCart.filter(e => e.cartRowId !== rowId);
    }
    renderActiveCartLayout();
    synchronizeCartTotals();
  }

  function deleteCartRow(rowId) {
    activeCart = activeCart.filter(e => e.cartRowId !== rowId);
    renderActiveCartLayout();
    synchronizeCartTotals();
  }

  function synchronizeCartTotals() {
    let subtotalAccumulated = 0;
    let itemCounterTotal = 0;

    activeCart.forEach(entry => {
      subtotalAccumulated += (entry.unitPrice * entry.quantity);
      itemCounterTotal += entry.quantity;
    });

    const serviceTaxCoefficient = 0.12; 
    const flatDeliveryFee = subtotalAccumulated > 0 ? 8.50 : 0.00;
    const calculatedTaxPrice = subtotalAccumulated * serviceTaxCoefficient;
    const finalInvoiceTotal = subtotalAccumulated + calculatedTaxPrice + flatDeliveryFee;

    cartItemCountBadge.textContent = `${itemCounterTotal} item${itemCounterTotal !== 1 ? 's' : ''}`;
    summarySubtotalElement.textContent = `$${subtotalAccumulated.toFixed(2)}`;
    summaryTaxElement.textContent = `$${calculatedTaxPrice.toFixed(2)}`;
    summaryDeliveryElement.textContent = flatDeliveryFee > 0 ? `$${flatDeliveryFee.toFixed(2)}` : '$0.00';
    summaryTotalElement.textContent = `$${finalInvoiceTotal.toFixed(2)}`;
    checkoutButton.disabled = (activeCart.length === 0);
  }

  function triggerOrderPlacementCheckoutWorkflow() {
    if (activeCart.length === 0) return;
    checkoutButton.textContent = 'Transmitting Order...';
    checkoutButton.disabled = true;

    setTimeout(() => {
      alert('Order Placed Successfully!\n\nYour premium Indian curation has been accepted by the royal kitchen engine. Preparation logs are now active.');
      activeCart = [];
      checkoutButton.textContent = 'Proceed to Checkout';
      renderActiveCartLayout();
      synchronizeCartTotals();
    }, 1200);
  }

  function escapeHTML(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  }

  init();
});