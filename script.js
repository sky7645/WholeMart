// script.js
'use strict';

/* =====================================
   WHOLEMART - PROFESSIONAL B2B LOGIC
   Inspired by Jumbotail-style workflow
===================================== */

/* ========= UTILITIES & VALIDATION ========= */

// Safe localStorage operations
function getSafeStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn(`Storage error reading ${key}:`, e);
    return defaultValue;
  }
}

function setSafeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`Storage error writing ${key}:`, e);
    return false;
  }
}

// Input validation utilities
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  const digits = String(phone).replace(/\D/g, '');
  return digits.length >= 10;
}

function sanitizeInput(input) {
  return String(input).trim().replace(/[<>"]/g, '');
}

/* ========= STATE MANAGEMENT ========= */

const state = {
  user: null,
  cart: getSafeStorage("cart", []),
  orders: getSafeStorage("orders", []),
  notifyNumber: localStorage.getItem('notifyNumber') || null,
  products: [],
  filteredProducts: [],
  searchTimeout: null
};

/* ========= PRODUCT DATABASE (DEMO) ========= */

state.products = [
  // Replaced product list with items from provided screenshots.
  // Images are public placeholders; they'll be cropped in CSS for uniform cards.
  {
    id: 101,
    name: "Balrampur Sulphitation White Sugar, 50Kg Bag",
    category: "Sugar",
    price: 2277.28,
    stock: 250,
    image: "7.jpeg",
    minOrderQty: 10,
  },
  {
    id: 102,
    name: "Surajmukhi Masoor Malka, 30Kg Bag",
    category: "Pulses",
    price: 2070.31,
    stock: 300,
    image: "1.jpeg",
    minOrderQty: 1,
  },
  {
    id: 103,
    name: "Best Choice Refined Palmolein Oil, 1L Pouch",
    category: "Oils",
    price: 97.83,
    stock: 120,
    image: "2.jpeg",
    minOrderQty: 10,
  },
  {
    id: 104,
    name: "Everest Meat Masala, 500g Pouch",
    category: "Spices",
    price: 82.47,
    stock: 200,
    image: "3.jpeg",
    minOrderQty: 12,
  },
  {
    id: 105,
    name: "Beauty Queen Sonam Boiled Rice, 25Kg Bag",
    category: "Grains",
    price: 1338.1,
    stock: 100,
    image: "4.jpeg",
    minOrderQty: 1,
  },
  {
    id: 106,
    name: "Dhara Mustard Oil, 1L Pouch",
    category: "Oils",
    price: 166,
    stock: 600,
    image: "5.jpeg",
    minOrderQty: 15,
  },
  {
    id: 107,
    name: "Scooter Special Mustard Oil, 1L Pouch",
    category: "Oils",
    price: 144.73,
    stock: 400,
    image: "8.jpeg",
    minOrderQty: 12,
  },
  {
    id: 108,
    name: "Puja Food Sharbati Atta, 25Kg Bag",
    category: "Flour",
    price: 835,
    stock: 55,
    image: "6.jpeg",
    minOrderQty: 1,
  },
  {
    id: 109,
    name: "Baba Special Sonam Steamed Rice, 25Kg Bag",
    category: "Grains",
    price: 1448.69,
    stock: 50,
    image: "10.jpeg",
    minOrderQty: 1,
  },
  {
    id: 110,
    name: "TATA salt, 1Kg Pack",
    category: "Grains",
    price: 25.88,
    stock: 320,
    image: "9.jpeg",
    minOrderQty: 12,
  }
  ,
  {
    id: 111,
    name: "Everest Chaat Masala, 500g Pouch",
    category: "Spices",
    price: 66.73,
    stock: 100,
    image: "11.jpeg",
    minOrderQty: 12,
  },
  {
    id: 112,
    name: "Ambe Whole Wheat Atta, 26Kg Bag",
    category: "Flour",
    price: 815,
    stock: 40,
    image: "12.jpeg",
    minOrderQty: 1,
  },
  {
    id: 113,
    name: "Narayani Ka 7 Star Steamed Rice, 26Kg Bag",
    category: "Grains",
    price: 1250,
    stock: 25,
    image: "14.jpeg",
    minOrderQty: 1,
  },
  {
    id: 114,
    name: "Dhara Refined Soyabean Oil, 1L Pouch",
    category: "Oils",
    price: 150.5,
    stock: 300,
    image: "13.jpeg",
    minOrderQty: 12,
  },
  {
    id: 115,
    name: "Himani Best Choice Refined Palmolein Oil, 15Kg Tin",
    category: "Oils",
    price: 2235,
    stock: 200,
    image: "15.jpeg",
    minOrderQty: 2,
  },
  {
    id: 116,
    name: "Veer Toor Dal, 30Kg Bag",
    category: "Pulses",
    price: 3389.64,
    stock: 50,
    image: "16.jpeg",
    minOrderQty: 1,
  },
  {
    id: 117,
    name: "Puja Food Shuddh Chakki Atta, 49Kg Bag",
    category: "Flour",
    price: 1530,
    stock: 10,
    image: "17.jpeg",
    minOrderQty: 1,
  },
  {
    id: 118,
    name: "Aalu 45kg bag",
    category: "Vegetables",
    price: 540,
    stock: 100,
    image: "18.jpeg",
    minOrderQty: 1,
  },
  {
    id: 119,
    name: "Pyaaz 45kg bag",
    category: "Vegetables",
    price: 860,
    stock: 100,
    image: "19.jpeg",
    minOrderQty: 1,
  },
  {
    id: 120,
    name: "Fresh Tamatar per kg",
    category: "Vegetables",
    price: 35,
    stock: 100,
    image: "20.jpeg",
    minOrderQty: 5,
  },
  {
    id: 121,
    name: "Cabbage 10kg bag",
    category: "Vegetables",
    price: 180,
    stock: 50,
    image: "21.jpeg",
    minOrderQty: 1,
  },
  {
    id: 122,
    name: "Fortune Refined Soyabean Oil, 15L Tin",
    category: "Oils",
    price: 2160,
    stock: 100,
    image: "22.jpeg",
    minOrderQty: 1,
  },
  {
    id: 123,
    name: "Gajar 10kg bag",
    category: "Vegetables",
    price: 350,
    stock: 50,
    image: "23.jpeg",
    minOrderQty: 1,
  },
  {
    id: 124,
    name: "Food Container Set, 25 Pieces",
    category: "Kitchen",
    price: 140,
    stock: 50,
    image: "24.jpeg",
    minOrderQty: 2,
  },
  {
    id: 125,
    name: "Food Container Set, 25 Pieces",
    category: "Kitchen",
    price: 140,
    stock: 50,
    image: "25.jpeg",
    minOrderQty: 2,
  },
  {
    id: 126,
    name: "Phenyl 5L",
    category: "Cleaning",
    price: 150,
    stock: 50,
    image: "26.jpeg",
    minOrderQty: 1,
  },
  {
    id: 127,
    name: "Ambe Refined Wheat Flour(Maida), 49Kg Bag",
    category: "Flour",
    price: 1492,
    stock: 50,
    image: "27.jpeg",
    minOrderQty: 1,
  },
  {
    id: 128,
    name: "Aashirvaad Atta, 26Kg Bag",
    category: "Flour",
    price: 930,
    stock: 50,
    image: "28.jpeg",
    minOrderQty: 1,
  }
];

state.filteredProducts = [...state.products];

/* ========= INITIALIZATION ========= */

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  renderCartCount();
  renderOrders();
  loadAuthState();
  updateHeaderAuth();
  // Ensure we do NOT auto-register the test number 7061732085
  if (localStorage.getItem('notifyNumber') === '7061732085') {
    localStorage.removeItem('notifyNumber');
    state.notifyNumber = null;
  }
  // Initialize mobile menu toggle behavior
  const menuToggle = document.getElementById('menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const nav = document.getElementById('nav-menu') || document.querySelector('.navigation');
      if (!nav) return;
      nav.classList.toggle('open');
      const ul = nav.querySelector('ul');
      if (ul) {
        const isShown = getComputedStyle(ul).display !== 'none';
        ul.style.display = isShown ? 'none' : 'flex';
      }
      const expanded = nav.classList.contains('open');
      menuToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
  }
});

/* ========= PRODUCT RENDERING ========= */

function renderProducts() {
  const productList = document.getElementById("product-list");
  if (!productList) return;
  productList.innerHTML = "";

  if (state.filteredProducts.length === 0) {
    productList.innerHTML = "<p style='text-align:center; padding: 40px;'>No products found.</p>";
    return;
  }

  state.filteredProducts.forEach(product => {
    const div = document.createElement("div");
    div.className = "product";
    const stockStatus = product.stock > 0 ? `<span style='color:#16a34a'>In Stock</span>` : `<span style='color:#dc2626'>Out of Stock</span>`;
    const isOutOfStock = product.stock <= 0 ? 'disabled' : '';

    div.innerHTML = `
      <div class="product-media"><img src="${product.image}" alt="${product.name}" loading="lazy"/></div>
      <div class="product-body">
        <div>
          <div class="product-title">${sanitizeInput(product.name)}</div>
          <div class="product-seller">Category: ${sanitizeInput(product.category)}</div>
        </div>
        <div class="price-row">
          <div class="price">₹${Number(product.price).toFixed(2)}</div>
          <div class="muted">${stockStatus}</div>
        </div>
        <div class="product-cta">
          <button class="btn add" onclick="addToCart(${product.id}, 1)" ${isOutOfStock}>Add to Cart</button>
          <button class="btn btn-primary" onclick="buyNow(${product.id})" ${isOutOfStock}>Buy Now</button>
        </div>
      </div>
    `;

    productList.appendChild(div);
  });
}

/* ========= SEARCH FUNCTION ========= */

function searchProducts() {
  clearTimeout(state.searchTimeout);
  const searchInput = document.getElementById("search");
  if (!searchInput) return;
  
  const query = sanitizeInput(searchInput.value).toLowerCase();

  // Debounce search for performance
  state.searchTimeout = setTimeout(() => {
    if (query.length === 0) {
      state.filteredProducts = [...state.products];
    } else {
      state.filteredProducts = state.products.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }
    renderProducts();
    renderSuggestions(query);
  }, 300);
}

function renderSuggestions(query) {
  const suggestionBox = document.getElementById("suggestions");
  if (!suggestionBox) return;
  suggestionBox.innerHTML = "";

  if (!query || query.length < 2) return;

  const matches = state.products
    .filter(p => p.name.toLowerCase().includes(query))
    .slice(0, 8); // Limit to 8 suggestions

  if (matches.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No results found";
    li.style.color = "#6b7280";
    suggestionBox.appendChild(li);
    return;
  }

  matches.forEach(match => {
    const li = document.createElement("li");
    li.textContent = sanitizeInput(match.name);
    li.setAttribute('role', 'option');
    li.onclick = () => {
      const searchInput = document.getElementById("search");
      if (searchInput) {
        searchInput.value = match.name;
        state.filteredProducts = [match];
        renderProducts();
        suggestionBox.innerHTML = "";
      }
    };
    suggestionBox.appendChild(li);
  });
}

/* ========= CART SYSTEM ========= */

function addToCart(productId, qtyArg = 1) {
  try {
    const product = state.products.find(p => p.id === productId);

    if (!product) {
      alert("⚠ Product not found. Please refresh and try again.");
      return;
    }
    
    if (product.stock <= 0) {
      alert("❌ This product is currently out of stock.");
      return;
    }

    const qty = Math.abs(Math.floor(qtyArg || 1));
    
    if (qty <= 0 || !Number.isInteger(qty)) {
      alert("⚠ Please enter a valid quantity.");
      return;
    }
    
    if (qty > product.stock) {
      alert(`⚠ Only ${product.stock} units available in stock.`);
      return;
    }

    const existing = state.cart.find(item => item.id === productId);
    if (existing) {
      if (existing.quantity + qty > product.stock) {
        alert(`⚠ Adding ${qty} more units would exceed available stock (${product.stock} total).`);
        return;
      }
      existing.quantity += qty;
    } else {
      state.cart.push({ ...product, quantity: qty });
    }

    saveCart();
    renderCartCount();
    alert(`✓ Added ${qty}x ${product.name} to cart.`);
  } catch (error) {
    console.error('Error adding to cart:', error);
    alert("❌ Failed to add item. Please try again.");
  }
}

function buyNow(productId) {
  try {
    const product = state.products.find(p => p.id === productId);
    if (!product) { 
      alert("⚠ Product not found"); 
      return; 
    }
    if (product.stock <= 0) { 
      alert("❌ Product out of stock"); 
      return; 
    }

    let qtyInput = prompt(`Enter quantity for '${product.name}' (min ${product.minOrderQty}):`, "1");
    if (qtyInput === null) return;
    const qty = Math.abs(Math.floor(parseInt(qtyInput, 10)));

    if (isNaN(qty) || qty < product.minOrderQty) {
      alert(`⚠ Please enter a valid quantity (minimum ${product.minOrderQty})`);
      return;
    }
    if (qty > product.stock) {
      alert(`⚠ Only ${product.stock} units available in stock.`);
      return;
    }

    const order = {
      id: Date.now(),
      items: [{ id: product.id, name: product.name, price: product.price, quantity: qty }],
      total: product.price * qty,
      date: new Date().toLocaleString(),
      status: "Confirmed (Buy Now)"
    };

    product.stock -= qty;
    state.orders.push(order);
    setSafeStorage("orders", state.orders);

    try { sendOrderNotification(order); } catch(e) { console.warn('Notification error', e); }

    saveCart();
    renderProducts();
    renderOrders();
    renderCartCount();

    alert(`✓ Order placed successfully!\nOrder ID: ${order.id}\nTotal: ₹${Number(order.total).toFixed(2)}`);
  } catch (error) {
    console.error('Buy Now error:', error);
    alert('❌ Failed to place order. Please try again.');
  }
}

function renderCartCount() {
  const count = state.cart.reduce((sum, it) => sum + (it.quantity || 0), 0);
  const el = document.getElementById("cart-count");
  if (el) el.textContent = count;
}

function openCart() {
  const modal = document.getElementById("cart-modal");
  modal.classList.add("active");
  renderCartItems();
}

function closeCart() {
  document.getElementById("cart-modal").classList.remove("active");
}

function renderCartItems() {
  const cartContainer = document.getElementById("cart-items");
  if (!cartContainer) return;
  cartContainer.innerHTML = "";

  if (!state.cart || state.cart.length === 0) {
    cartContainer.innerHTML = "<p style='text-align: center; color: #6b7280;'>Your cart is empty.</p>";
    return;
  }

  let total = 0;
  state.cart.forEach((item, index) => {
    total += item.price * item.quantity;

    const itemTotal = item.price * item.quantity;
    const div = document.createElement("div");
    div.style.padding = "10px";
    div.style.borderBottom = "1px solid #e6eef6";
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.alignItems = "center";
    div.innerHTML = `
      <div style='flex: 1;'>
        <p style='margin: 0; font-weight: 500;'>${sanitizeInput(item.name)}</p>
        <p style='margin: 4px 0; color: #6b7280; font-size: 0.9rem;'>Qty: ${item.quantity} × ₹${Number(item.price).toFixed(2)}</p>
      </div>
      <div style='text-align: right;'>
        <p style='margin: 0; font-weight: 600;'>₹${Number(itemTotal).toFixed(2)}</p>
        <button onclick="removeFromCart(${index})" style='background: #dc2626; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.85rem; margin-top: 4px;'>Remove</button>
      </div>
    `;
    cartContainer.appendChild(div);
  });

  const totalDiv = document.createElement("div");
  totalDiv.style.padding = "15px 10px";
  totalDiv.style.borderTop = "2px solid #e6eef6";
  totalDiv.style.fontWeight = "bold";
  totalDiv.style.fontSize = "1.1rem";
  totalDiv.innerHTML = `<div style='display: flex; justify-content: space-between;'><span>Total:</span><span>₹${Number(total).toFixed(2)}</span></div>`;
  cartContainer.appendChild(totalDiv);
}

function saveCart() {
  setSafeStorage("cart", state.cart);
}

function removeFromCart(index) {
  if (index >= 0 && index < state.cart.length) {
    const item = state.cart[index];
    state.cart.splice(index, 1);
    saveCart();
    renderCartCount();
    renderCartItems();
    alert(`✓ Removed ${item.name} from cart.`);
  }
}

/* ========= AUTH (CLIENT SIDE DEMO) ========= */

function loadAuthState() {
  const user = getSafeStorage('currentUser', null);
  state.user = user;
  if (!localStorage.getItem('users')) {
    setSafeStorage('users', []);
  }
}

function openAuthModal(mode = 'login'){
  const modal = document.getElementById('auth-modal');
  if (!modal) return;
  modal.classList.add('active');
  modal.style.display = 'flex';
  if (mode === 'register') showRegister(); else showLogin();
}

function closeAuthModal(){
  const modal = document.getElementById('auth-modal');
  if (!modal) return;
  modal.classList.remove('active');
  modal.style.display = 'none';
}

function showRegister(){
  const reg = document.getElementById('register-form');
  const log = document.getElementById('login-form');
  if (reg && log){ reg.style.display = 'block'; log.style.display = 'none'; document.getElementById('auth-title').textContent = 'Register'; }
}

function showLogin(){
  const reg = document.getElementById('register-form');
  const log = document.getElementById('login-form');
  if (reg && log){ reg.style.display = 'none'; log.style.display = 'block'; document.getElementById('auth-title').textContent = 'Login'; }
}

function registerUser(){
  try {
    const nameEl = document.getElementById('reg-name');
    const emailEl = document.getElementById('reg-email');
    const passEl = document.getElementById('reg-pass');
    
    const name = sanitizeInput(nameEl?.value || '');
    const email = sanitizeInput(emailEl?.value || '').toLowerCase();
    const pass = passEl?.value || '';

    if (!name || name.length < 2) {
      alert('⚠ Please enter a valid name (at least 2 characters).');
      return;
    }
    if (!isValidEmail(email)) {
      alert('⚠ Please enter a valid email address.');
      return;
    }
    if (!pass || pass.length < 6) {
      alert('⚠ Password must be at least 6 characters long.');
      return;
    }

    const users = getSafeStorage('users', []);
    if (users.find(u => u.email === email)) {
      alert('⚠ An account with this email already exists.');
      return;
    }

    const user = { id: Date.now(), name, email, pass: btoa(pass) };
    users.push(user);
    setSafeStorage('users', users);
    setSafeStorage('currentUser', { id: user.id, name: user.name, email: user.email });
    state.user = { id: user.id, name: user.name, email: user.email };
    closeAuthModal();
    updateHeaderAuth();
    alert('✓ Registration successful — you are now logged in.');
  } catch (error) {
    console.error('Registration error:', error);
    alert('❌ Registration failed. Please try again.');
  }
}

function loginUser(){
  try {
    const emailEl = document.getElementById('login-email');
    const passEl = document.getElementById('login-pass');
    
    const email = sanitizeInput(emailEl?.value || '').toLowerCase();
    const pass = passEl?.value || '';

    if (!email || !pass) {
      alert('⚠ Please enter both email and password.');
      return;
    }
    if (!isValidEmail(email)) {
      alert('⚠ Please enter a valid email address.');
      return;
    }

    const users = getSafeStorage('users', []);
    const user = users.find(u => u.email === email && u.pass === btoa(pass));
    
    if (!user) {
      alert('❌ Invalid email or password.');
      return;
    }

    setSafeStorage('currentUser', { id: user.id, name: user.name, email: user.email });
    state.user = { id: user.id, name: user.name, email: user.email };
    closeAuthModal();
    updateHeaderAuth();
    alert(`✓ Welcome back, ${user.name}!`);
  } catch (error) {
    console.error('Login error:', error);
    alert('❌ Login failed. Please try again.');
  }
}

function logoutUser(){
  localStorage.removeItem('currentUser');
  state.user = null;
  updateHeaderAuth();
  alert('You have been logged out.');
}

function updateHeaderAuth(){
  const btn = document.getElementById('auth-btn');
  if (!btn) return;
  if (state.user){
    btn.style.display = 'none';
    // insert user menu if not exists
    let menu = document.getElementById('user-menu');
    if (!menu){
      menu = document.createElement('div');
      menu.id = 'user-menu';
      menu.style.display = 'inline-flex';
      menu.style.alignItems = 'center';
      menu.style.gap = '8px';
      menu.innerHTML = `<span class="muted">Hello, ${state.user.name}</span><button class="secondary-btn" onclick="logoutUser()">Logout</button>`;
      btn.parentNode && btn.parentNode.insertBefore(menu, btn.parentNode.querySelector('.cart-button'));
    } else {
      menu.innerHTML = `<span class="muted">Hello, ${state.user.name}</span><button class="secondary-btn" onclick="logoutUser()">Logout</button>`;
      menu.style.display = 'inline-flex';
    }
  } else {
    // show auth button and hide menu
    btn.style.display = 'inline-block';
    const menu = document.getElementById('user-menu');
    if (menu) menu.style.display = 'none';
  }
}

/* ========= CHECKOUT ========= */

function checkout() {
  if (!state.cart || state.cart.length === 0) {
    alert("❌ Cart is empty");
    return;
  }

  const order = {
    id: Date.now(),
    items: [...state.cart],
    total: state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    date: new Date().toLocaleString(),
    status: "Confirmed"
  };

  state.orders.push(order);
  setSafeStorage("orders", state.orders);

  state.cart = [];
  saveCart();
  renderCartCount();
  renderOrders();
  closeCart();

  try { sendOrderNotification(order); } catch(e) { console.warn('Notification error', e); }

  alert(`✓ Order placed successfully!\nOrder ID: ${order.id}\nTotal: ₹${Number(order.total).toFixed(2)}`);
}

/* ========= ORDER HISTORY ========= */

function renderOrders() {
  const orderList = document.getElementById("order-list");
  if (!orderList) return;

  if (!state.orders || state.orders.length === 0) {
    orderList.innerHTML = "<p style='text-align: center; padding: 20px; color: #6b7280;'>No orders placed yet. Start shopping now!</p>";
    return;
  }

  orderList.innerHTML = "";

  state.orders.forEach(order => {
    const div = document.createElement("div");
    div.style.marginBottom = "20px";
    div.style.padding = "15px";
    div.style.border = "1px solid #e6eef6";
    div.style.borderRadius = "8px";
    div.innerHTML = `
      <h4 style='margin-bottom: 8px;'>Order ID: ${order.id}</h4>
      <p style='margin: 4px 0;'>📅 Date: ${order.date}</p>
      <p style='margin: 4px 0;'>📊 Status: <strong>${order.status}</strong></p>
      <p style='margin: 4px 0;'>💰 Total: <strong>₹${Number(order.total).toFixed(2)}</strong></p>
      ${order.items ? `<p style='margin: 4px 0;'>📦 Items: ${order.items.length}</p>` : ''}
    `;
    orderList.appendChild(div);
  });
}

/* ========= UTILITIES ========= */

function scrollToMarketplace() {
  document.getElementById("marketplace").scrollIntoView({
    behavior: "smooth"
  });
}

function contactAlert() {
  alert("Our support team will contact you shortly.");
}

// Notification helpers
function setNotifyNumber(number){
  try {
    if (!number) {
      alert('⚠ Please provide a phone number.');
      return;
    }
    const digits = String(number).replace(/\D/g,'');
    if (!isValidPhone(digits)) {
      alert('⚠ Please enter a valid phone number (at least 10 digits).');
      return;
    }
    localStorage.setItem('notifyNumber', digits);
    state.notifyNumber = digits;
    alert(`✓ Notifications enabled for: +91-${digits.slice(-10)}`);
  } catch (error) {
    console.error('Error setting notification number:', error);
    alert('❌ Failed to set notification number.');
  }
}

function sendOrderNotification(order){
  const num = state.notifyNumber || localStorage.getItem('notifyNumber');
  if (!num) { console.log('No notification number configured'); return; }

  const message = `Order ${order.id} confirmed. Total: ₹${order.total}. Date: ${order.date}`;

  // Attempt 1: if an SMS API endpoint is configured on window, post to it
  if (window.SMS_API_URL){
    fetch(window.SMS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: num, message, apiKey: window.SMS_API_KEY || '' })
    }).then(res => console.log('SMS API response', res)).catch(err => console.warn('SMS API error', err));
    return;
  }

  // Fallback: try to open device SMS composer (may not work on desktop)
  try {
    const smsUrl = `sms:+${num}?body=${encodeURIComponent(message)}`;
    window.open(smsUrl);
    // Also show a brief alert to confirm attempt
    setTimeout(()=>alert(`Notification attempted to ${num}.
${message}`), 300);
  } catch(e) {
    console.warn('SMS fallback failed', e);
  }
}