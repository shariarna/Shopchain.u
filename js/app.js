// ============================================================
// app.js — Main Application Logic (localStorage-based)
// ============================================================

const DB_KEY = 'shopchain_db';

// ---- Default Data ----
// ---- Site Settings (admin configurable) ----
const defaultSettings = {
  siteName: 'ShopChain',
  wallets: {
    USDT_BEP20: { address: '', network: 'BSC (BEP20)', enabled: true, autoVerify: true },
    USDT_TRC20: { address: '', network: 'TRON (TRC20)', enabled: true, autoVerify: true }
  },
  minDeposit: 10,
  minWithdraw: 10,
  withdrawTime: '1-72 hours',
  holdHours: 12,
  profitMultiplier: 1.5,
};

const defaultDB = {
  users: [
    {
      id: 'admin',
      name: 'Admin',
      email: 'admin@shopchain.com',
      password: 'admin123',
      role: 'admin',
      balance: 999999,
      createdAt: Date.now()
    }
  ],
  products: [
    { id: 'p1', name: 'iPhone 15 Pro Max', category: 'Electronics', image: '/images/products/iphone15.png', price: 150, description: 'Latest Apple flagship smartphone with titanium design and A17 Pro chip.', stock: 50, holdHours: 12, profitPercent: 50 },
    { id: 'p2', name: 'Samsung 4K Smart TV', category: 'Electronics', image: '/images/products/samsungtv.png', price: 200, description: '65-inch 4K QLED Smart TV with HDR and built-in streaming apps.', stock: 30, holdHours: 12, profitPercent: 50 },
    { id: 'p3', name: 'Nike Air Max 270', category: 'Fashion', image: '/images/products/nike270.png', price: 80, description: 'Premium running shoes with Max Air cushioning for all-day comfort.', stock: 100, holdHours: 12, profitPercent: 50 },
    { id: 'p4', name: 'MacBook Pro M3', category: 'Electronics', image: '/images/products/macbook.png', price: 300, description: 'Powerful laptop with M3 chip, 16GB RAM and stunning Liquid Retina display.', stock: 20, holdHours: 12, profitPercent: 50 },
    { id: 'p5', name: 'Sony WH-1000XM5', category: 'Electronics', image: '/images/products/sonyheadphone.png', price: 60, description: 'Industry-leading noise cancelling headphones with 30-hour battery life.', stock: 75, holdHours: 12, profitPercent: 50 },
    { id: 'p6', name: 'Adidas Ultraboost', category: 'Fashion', image: '/images/products/adidasultra.png', price: 90, description: 'High-performance running shoes with Boost midsole technology.', stock: 80, holdHours: 12, profitPercent: 50 },
    { id: 'p7', name: 'Rolex Submariner', category: 'Watches', image: '/images/products/rolex.png', price: 500, description: 'Iconic luxury dive watch with ceramic bezel and Oystersteel bracelet.', stock: 10, holdHours: 12, profitPercent: 50 },
    { id: 'p8', name: 'PlayStation 5', category: 'Gaming', image: '/images/products/ps5.png', price: 120, description: 'Next-gen gaming console with ultra-high speed SSD and DualSense controller.', stock: 40, holdHours: 12, profitPercent: 50 },
    { id: 'p9', name: 'iPad Pro 12.9"', category: 'Electronics', image: '/images/products/ipad.png', price: 180, description: 'Powerful tablet with M2 chip, ProMotion display, and all-day battery.', stock: 35, holdHours: 12, profitPercent: 50 },
    { id: 'p10', name: 'Louis Vuitton Bag', category: 'Fashion', image: '/images/products/lvbag.png', price: 250, description: 'Iconic luxury handbag crafted from premium Monogram canvas.', stock: 15, holdHours: 12, profitPercent: 50 },
    { id: 'p11', name: 'DJI Mini 4 Pro', category: 'Electronics', image: '/images/products/djidrone.png', price: 100, description: 'Compact drone with 4K/60fps video, obstacle avoidance, and 34-min flight time.', stock: 25, holdHours: 12, profitPercent: 50 },
    { id: 'p12', name: 'Gaming Chair', category: 'Furniture', image: '/images/products/gamingchair.png', price: 70, description: 'Ergonomic gaming chair with lumbar support and 4D armrests.', stock: 60, holdHours: 12, profitPercent: 50 },
    { id: 'p13', name: 'AirPods Max', category: 'Electronics', image: 'https://images.unsplash.com/photo-1628202926206-c63a34b1618f?q=80&w=400&auto=format&fit=crop', price: 110, description: 'Apple-designed dynamic driver provides high-fidelity audio.', stock: 50, holdHours: 12, profitPercent: 50 },
    { id: 'p14', name: 'RTX 4090 Graphics Card', category: 'Gaming', image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=400&auto=format&fit=crop', price: 800, description: 'NVIDIA GeForce RTX 4090, the ultimate GeForce GPU with DLSS 3.', stock: 10, holdHours: 24, profitPercent: 60 },
    { id: 'p15', name: 'Mechanical Gaming Keyboard', category: 'Gaming', image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=400&auto=format&fit=crop', price: 45, description: 'RGB backlit mechanical keyboard with tactile switches.', stock: 120, holdHours: 6, profitPercent: 40 },
    { id: 'p16', name: 'Hermes Birkin Bag', category: 'Fashion', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop', price: 1200, description: 'Ultra-luxury leather handbag with gold-plated hardware.', stock: 5, holdHours: 48, profitPercent: 75 },
    { id: 'p17', name: 'Dyson Supersonic', category: 'Electronics', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400&auto=format&fit=crop', price: 140, description: 'Fast drying hair dryer with intelligent heat control.', stock: 45, holdHours: 12, profitPercent: 50 },
    { id: 'p18', name: 'Coffee Espresso Machine', category: 'Furniture', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=400&auto=format&fit=crop', price: 160, description: '15-bar pump espresso maker with milk frothing wand.', stock: 30, holdHours: 18, profitPercent: 55 },
    { id: 'p19', name: 'iPhone 15 Pro', category: 'Electronics', image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=400&auto=format&fit=crop', price: 130, description: 'Pro camera system and titanium design.', stock: 50, holdHours: 12, profitPercent: 50 },
    { id: 'p20', name: 'Samsung Galaxy S24 Ultra', category: 'Electronics', image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=400&auto=format&fit=crop', price: 140, description: 'Galaxy AI with 200MP camera and built-in S Pen.', stock: 40, holdHours: 12, profitPercent: 50 },
    { id: 'p21', name: 'Nike Air Force 1', category: 'Fashion', image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=400&auto=format&fit=crop', price: 70, description: 'Classic streetwear sneakers with durable leather upper.', stock: 90, holdHours: 6, profitPercent: 45 },
    { id: 'p22', name: 'Rolex Daytona', category: 'Watches', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=400&auto=format&fit=crop', price: 650, description: 'Cosmograph Daytona designed for professional racing.', stock: 8, holdHours: 24, profitPercent: 65 },
    { id: 'p23', name: 'Nintendo Switch OLED', category: 'Gaming', image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=400&auto=format&fit=crop', price: 95, description: '7-inch OLED screen with vibrant colors and crisp contrast.', stock: 60, holdHours: 12, profitPercent: 48 },
    { id: 'p24', name: 'Ergonomic Office Desk', category: 'Furniture', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=400&auto=format&fit=crop', price: 120, description: 'Electric height adjustable standing desk with wood top.', stock: 25, holdHours: 12, profitPercent: 50 },
    { id: 'p25', name: 'Sony PlayStation VR2', category: 'Gaming', image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=400&auto=format&fit=crop', price: 160, description: 'Virtual reality headset for PS5 with 4K HDR visuals.', stock: 30, holdHours: 12, profitPercent: 50 },
    { id: 'p26', name: 'Apple Watch Ultra 2', category: 'Watches', image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=400&auto=format&fit=crop', price: 220, description: 'Rugged titanium adventure watch with dual-frequency GPS.', stock: 25, holdHours: 12, profitPercent: 50 },
    { id: 'p27', name: 'Canon EOS R6 Mark II', category: 'Electronics', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400&auto=format&fit=crop', price: 900, description: 'Full-frame mirrorless camera with advanced autofocus.', stock: 8, holdHours: 24, profitPercent: 70 },
    { id: 'p28', name: 'Nike Air Jordan 1', category: 'Fashion', image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=400&auto=format&fit=crop', price: 110, description: 'Iconic high-top basketball sneakers in classic colorways.', stock: 70, holdHours: 6, profitPercent: 45 },
    { id: 'p29', name: 'Secretlab Titan Gaming Chair', category: 'Furniture', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=400&auto=format&fit=crop', price: 150, description: 'Award-winning ergonomic gaming and office chair.', stock: 30, holdHours: 12, profitPercent: 50 },
    { id: 'p30', name: 'Steam Deck OLED', category: 'Gaming', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop', price: 140, description: 'Handheld gaming computer with vibrant 7.4" OLED screen.', stock: 35, holdHours: 12, profitPercent: 48 },
    { id: 'p31', name: 'Gucci Belt', category: 'Fashion', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=400&auto=format&fit=crop', price: 180, description: 'Luxury leather belt with double G buckle.', stock: 20, holdHours: 12, profitPercent: 55 },
    { id: 'p32', name: 'Bose QuietComfort Ultra', category: 'Electronics', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=400&auto=format&fit=crop', price: 130, description: 'Wireless noise-cancelling headphones with immersive spatial audio.', stock: 50, holdHours: 12, profitPercent: 50 },
    { id: 'p33', name: 'Logitech G PRO X Superlight', category: 'Gaming', image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=400&auto=format&fit=crop', price: 50, description: 'Ultra-lightweight wireless gaming mouse for esports.', stock: 100, holdHours: 6, profitPercent: 40 },
    { id: 'p34', name: 'L-Shaped Corner Gaming Desk', category: 'Furniture', image: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=400&auto=format&fit=crop', price: 180, description: 'Spacious corner computer desk with carbon fiber texture.', stock: 15, holdHours: 18, profitPercent: 55 },
  ],
  deposits: [],
  purchases: [],
  withdrawals: [],
  sessions: {},
  // ---- NEW ----
  pendingRegistrations: [],   // registration requests awaiting admin approval
  referralCodes: [
    { code: 'SHOP2024', usedBy: null, createdAt: Date.now(), isActive: true },
    { code: 'WELCOME1', usedBy: null, createdAt: Date.now(), isActive: true },
    { code: 'CHAIN999', usedBy: null, createdAt: Date.now(), isActive: true },
  ],
  siteSettings: JSON.parse(JSON.stringify(defaultSettings))
};

// ---- DB Functions ----
// Public Realtime Database REST URL (synced across all Vercel/phone sessions)
const isLocal = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' || 
                window.location.hostname.includes('loca.lt');

const REMOTE_DB_URL = isLocal 
  ? 'https://shopchain-u.vercel.app/api/db' 
  : '/api/db';

// Floating Sync Status Indicator UI
function createSyncIndicator() {
  if (document.getElementById('db-sync-indicator')) return;
  const div = document.createElement('div');
  div.id = 'db-sync-indicator';
  div.style.position = 'fixed';
  div.style.bottom = '15px';
  div.style.right = '15px';
  div.style.zIndex = '9999';
  div.style.background = 'rgba(15, 23, 42, 0.85)';
  div.style.backdropFilter = 'blur(10px)';
  div.style.border = '1px solid rgba(255, 255, 255, 0.1)';
  div.style.padding = '6px 12px';
  div.style.borderRadius = '20px';
  div.style.fontFamily = 'system-ui, sans-serif';
  div.style.fontSize = '11px';
  div.style.color = '#e2e8f0';
  div.style.display = 'flex';
  div.style.alignItems = 'center';
  div.style.gap = '8px';
  div.style.pointerEvents = 'none';
  div.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
  div.style.transition = 'opacity 0.4s, transform 0.4s';
  div.style.opacity = '0';
  div.style.transform = 'translateY(10px)';
  
  div.innerHTML = `<span id="db-sync-dot" style="width: 7px; height: 7px; border-radius: 50%; background: #94a3b8; display: inline-block; transition: background 0.3s;"></span> <span id="db-sync-text">Database connecting...</span>`;
  document.body.appendChild(div);
  
  setTimeout(() => {
    div.style.opacity = '1';
    div.style.transform = 'translateY(0)';
  }, 200);
}

function updateSyncStatus(status, message) {
  const dot = document.getElementById('db-sync-dot');
  const text = document.getElementById('db-sync-text');
  const div = document.getElementById('db-sync-indicator');
  if (!dot || !text || !div) return;
  
  if (status === 'success') {
    dot.style.background = '#10b981'; // vibrant green
    dot.style.boxShadow = '0 0 8px #10b981';
    text.textContent = message || 'Cloud DB Active';
    setTimeout(() => {
      div.style.opacity = '0.4'; // semi-transparent when stable
    }, 3000);
  } else {
    dot.style.background = '#ef4444'; // vibrant red
    dot.style.boxShadow = '0 0 8px #ef4444';
    text.textContent = message || 'Local Mode / Sync Error';
    div.style.opacity = '1';
  }
}

// Automatically create indicator on load
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', createSyncIndicator);
} else {
  createSyncIndicator();
}

function mergeArrays(localArr, remoteArr) {
  if (!localArr) return remoteArr || [];
  if (!remoteArr) return localArr || [];
  const map = new Map();
  // Store local items first
  localArr.forEach(item => map.set(item.id || item.code, item));
  // Merge and overwrite with remote items (remote cloud state takes precedence)
  remoteArr.forEach(item => {
    const key = item.id || item.code;
    if (!map.has(key)) {
      map.set(key, item);
    } else {
      const localItem = map.get(key);
      map.set(key, { ...localItem, ...item });
    }
  });
  return Array.from(map.values());
}

async function syncWithRemote() {
  if (!REMOTE_DB_URL || isSaving) return;
  try {
    const res = await fetch(REMOTE_DB_URL + '?nocache=' + Date.now());
    const remoteDB = await res.json();
    if (remoteDB && !remoteDB.error) {
      const local = JSON.parse(localStorage.getItem(DB_KEY)) || defaultDB;
      
      const merged = {
        users: mergeArrays(local.users, remoteDB.users),
        products: remoteDB.products || local.products || defaultDB.products,
        deposits: mergeArrays(local.deposits, remoteDB.deposits),
        purchases: mergeArrays(local.purchases, remoteDB.purchases),
        withdrawals: mergeArrays(local.withdrawals, remoteDB.withdrawals),
        pendingRegistrations: mergeArrays(local.pendingRegistrations, remoteDB.pendingRegistrations),
        referralCodes: mergeArrays(local.referralCodes, remoteDB.referralCodes),
        siteSettings: remoteDB.siteSettings || local.siteSettings,
        sessions: { ...remoteDB.sessions, ...local.sessions }
      };
      
      localStorage.setItem(DB_KEY, JSON.stringify(merged));
      updateSyncStatus('success', 'Cloud DB Connected');
      
      if (JSON.stringify(merged) !== JSON.stringify(remoteDB)) {
        await fetch(REMOTE_DB_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(merged)
        });
      }
    } else {
      // If remote DB is empty or has error, initialize it with local DB
      const local = JSON.parse(localStorage.getItem(DB_KEY)) || defaultDB;
      const initRes = await fetch(REMOTE_DB_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(local)
      });
      if (initRes.ok) {
        updateSyncStatus('success', 'Cloud DB Initialized');
      } else {
        updateSyncStatus('error', 'Init failed');
      }
    }
  } catch (e) {
    console.error("Sync error:", e);
    updateSyncStatus('error', 'Cloud Offline');
  }
}

// Initial Sync trigger
syncWithRemote();

// Periodically sync every 4 seconds and refresh UI dynamically if database changes
setInterval(async () => {
  const oldRaw = localStorage.getItem(DB_KEY);
  await syncWithRemote();
  const newRaw = localStorage.getItem(DB_KEY);
  
  if (oldRaw !== newRaw) {
    console.log("⚡ Realtime DB Synced!");
    if (typeof renderUsers === 'function') renderUsers();
    if (typeof renderDeposits === 'function') renderDeposits();
    if (typeof renderRegistrations === 'function') renderRegistrations();
    if (typeof renderWithdrawals === 'function') renderWithdrawals();
    if (typeof loadWallets === 'function') loadWallets();
    if (typeof renderProducts === 'function') renderProducts();
  }
}, 4000);

function getDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    localStorage.setItem(DB_KEY, JSON.stringify(defaultDB));
    return JSON.parse(JSON.stringify(defaultDB));
  }
  const db = JSON.parse(raw);
  if (!db.products || db.products.length === 0) {
    db.products = defaultDB.products;
  }
  if (db.purchases) {
    db.purchases.forEach(p => {
      if (!p.productImage && p.productEmoji) {
        const prod = defaultDB.products.find(pr => pr.id === p.productId);
        p.productImage = prod ? prod.image : '/images/products/iphone15.png';
      }
    });
  }
  if (!db.pendingRegistrations) db.pendingRegistrations = [];
  if (!db.referralCodes) db.referralCodes = defaultDB.referralCodes;
  if (!db.siteSettings) db.siteSettings = JSON.parse(JSON.stringify(defaultSettings));
  if (!db.siteSettings.wallets) db.siteSettings.wallets = JSON.parse(JSON.stringify(defaultSettings.wallets));
  if (!db.siteSettings.wallets.USDT_TRC20) {
    db.siteSettings.wallets.USDT_TRC20 = { address: '', network: 'TRON (TRC20)', enabled: true, autoVerify: true };
  }
  if (!db.siteSettings.withdrawTime) {
    db.siteSettings.withdrawTime = '1-72 hours';
  }
  return db;
}

// ---- Settings Helpers ----
function getSettings() {
  return getDB().siteSettings;
}

function saveSettings(settings) {
  const db = getDB();
  db.siteSettings = settings;
  saveDB(db);
}

function getWalletAddress(crypto) {
  const db = getDB();
  const w = db.siteSettings && db.siteSettings.wallets && db.siteSettings.wallets[crypto];
  return w ? w.address : '';
}

function getEnabledWallets() {
  const db = getDB();
  const wallets = (db.siteSettings && db.siteSettings.wallets) || {};
  return Object.entries(wallets)
    .filter(([, w]) => w.enabled && w.address)
    .map(([key, w]) => ({ key, ...w }));
}

let isSaving = false;

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  if (REMOTE_DB_URL) {
    isSaving = true;
    fetch(REMOTE_DB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(db)
    })
    .then(() => {
      isSaving = false;
    })
    .catch(err => {
      console.error(err);
      isSaving = false;
    });
  }
}

// ---- Auth Functions ----
function getCurrentUser() {
  const sessionId = localStorage.getItem('session_id');
  if (!sessionId) return null;
  const db = getDB();
  const userId = db.sessions[sessionId];
  if (!userId) return null;
  return db.users.find(u => u.id === userId) || null;
}

function login(email, password) {
  email = email.toLowerCase().trim();
  const db = getDB();
  const user = db.users.find(u => u.email === email && u.password === password);
  if (!user) return { success: false, message: 'Invalid email or password!' };

  // Check if there's a pending registration for this email
  const pending = db.pendingRegistrations.find(r => r.email === email && r.status === 'pending');
  if (pending) return { success: false, message: 'Your account is pending admin approval. Please wait.' };

  const rejected = db.pendingRegistrations.find(r => r.email === email && r.status === 'rejected');
  if (rejected && !db.users.find(u => u.email === email && u.role !== 'admin')) {
    return { success: false, message: 'Your registration was rejected by admin.' };
  }

  const sessionId = 'sess_' + Math.random().toString(36).substr(2, 16);
  db.sessions[sessionId] = user.id;
  saveDB(db);
  localStorage.setItem('session_id', sessionId);
  return { success: true, user };
}

function logout() {
  const sessionId = localStorage.getItem('session_id');
  if (sessionId) {
    const db = getDB();
    delete db.sessions[sessionId];
    saveDB(db);
  }
  localStorage.removeItem('session_id');
  window.location.href = '/login.html';
}

// ---- Referral Code Functions ----
function validateReferralCode(code) {
  const db = getDB();
  const ref = db.referralCodes.find(r => r.code.toUpperCase() === code.toUpperCase() && r.isActive);
  if (!ref) return { valid: false, message: 'Invalid or expired referral code!' };
  return { valid: true, ref };
}

function createReferralCode(code) {
  const db = getDB();
  const exists = db.referralCodes.find(r => r.code.toUpperCase() === code.toUpperCase());
  if (exists) return { success: false, message: 'This referral code already exists!' };
  db.referralCodes.push({
    code: code.toUpperCase(),
    usedBy: null,
    createdAt: Date.now(),
    isActive: true
  });
  saveDB(db);
  return { success: true };
}

function deactivateReferralCode(code) {
  const db = getDB();
  const ref = db.referralCodes.find(r => r.code === code);
  if (ref) { ref.isActive = false; saveDB(db); return true; }
  return false;
}

// ---- Registration Request Functions ----
function submitRegistration(name, email, password, referralCode) {
  email = email.toLowerCase().trim();
  const db = getDB();

  // Check referral code
  const refCheck = validateReferralCode(referralCode);
  if (!refCheck.valid) return { success: false, message: refCheck.message };

  // Check if email already exists in users
  if (db.users.find(u => u.email === email)) {
    return { success: false, message: 'An account with this email already exists!' };
  }

  // Check if already has a pending request
  const existingPending = db.pendingRegistrations.find(r => r.email === email && r.status === 'pending');
  if (existingPending) {
    return { success: false, message: 'You already have a pending registration request!' };
  }

  const regRequest = {
    id: 'reg_' + Math.random().toString(36).substr(2, 9),
    name,
    email,
    password, // stored temporarily; in production, hash this
    referralCode: referralCode.toUpperCase(),
    status: 'pending',
    createdAt: Date.now()
  };

  db.pendingRegistrations.push(regRequest);
  saveDB(db);
  return { success: true, regRequest };
}

function approveRegistration(regId) {
  const db = getDB();
  const reg = db.pendingRegistrations.find(r => r.id === regId);
  if (!reg || reg.status !== 'pending') return false;

  // Create the actual user account
  const user = {
    id: 'u_' + Math.random().toString(36).substr(2, 9),
    name: reg.name,
    email: reg.email,
    password: reg.password,
    role: 'user',
    balance: 0,
    referralCode: reg.referralCode,
    createdAt: Date.now()
  };
  db.users.push(user);

  // Mark referral code as used (mark it but keep it active for reuse if desired)
  const refCode = db.referralCodes.find(r => r.code === reg.referralCode);
  if (refCode) {
    refCode.usedCount = (refCode.usedCount || 0) + 1;
  }

  reg.status = 'approved';
  reg.approvedAt = Date.now();
  saveDB(db);
  return true;
}

function rejectRegistration(regId) {
  const db = getDB();
  const reg = db.pendingRegistrations.find(r => r.id === regId);
  if (!reg) return false;
  reg.status = 'rejected';
  reg.rejectedAt = Date.now();
  saveDB(db);
  return true;
}

// ---- Deposit Functions ----
function submitDeposit(userId, amount, crypto, txid) {
  const db = getDB();
  const deposit = {
    id: 'dep_' + Math.random().toString(36).substr(2, 9),
    userId, amount: parseFloat(amount), crypto, txid,
    status: 'pending',
    createdAt: Date.now()
  };
  db.deposits.push(deposit);
  saveDB(db);
  return deposit;
}

function approveDeposit(depositId) {
  const db = getDB();
  const deposit = db.deposits.find(d => d.id === depositId);
  if (!deposit) return false;
  deposit.status = 'approved';
  deposit.approvedAt = Date.now();
  const user = db.users.find(u => u.id === deposit.userId);
  if (user) user.balance += deposit.amount;
  saveDB(db);
  return true;
}

function rejectDeposit(depositId) {
  const db = getDB();
  const deposit = db.deposits.find(d => d.id === depositId);
  if (!deposit) return false;
  deposit.status = 'rejected';
  deposit.rejectedAt = Date.now();
  saveDB(db);
  return true;
}

// ---- Automated Blockchain Verification (BSC BEP20 / BNB) ----
async function verifyBscTx(txHash, adminAddress, targetCrypto) {
  const rpcUrl = 'https://bsc-dataseed.binance.org/';
  
  // Clean hash
  txHash = txHash.trim();
  if (!txHash.startsWith('0x')) {
    txHash = '0x' + txHash;
  }
  
  // 1. Fetch transaction details
  const resTx = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getTransactionByHash',
      params: [txHash]
    })
  });
  const dataTx = await resTx.json();
  if (dataTx.error) {
    throw new Error(dataTx.error.message || 'Error fetching transaction.');
  }
  const tx = dataTx.result;
  if (!tx) {
    throw new Error('Transaction hash not found on Binance Smart Chain. Make sure it is a BSC transaction.');
  }
  
  // 2. Fetch receipt to check status
  const resRec = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'eth_getTransactionReceipt',
      params: [txHash]
    })
  });
  const dataRec = await resRec.json();
  const receipt = dataRec.result;
  if (!receipt) {
    throw new Error('Transaction is still pending or not fully processed on the blockchain.');
  }
  if (receipt.status !== '0x1') {
    throw new Error('Transaction failed on the blockchain.');
  }

  let amount = 0;
  let parsedTo = '';

  const usdtContract = '0x55d398326f99059ff775485246999027b3197955';
  const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

  // 1. Try to find the transfer in receipt logs (covers Binance/Exchange withdrawals, routers, & direct transfers)
  let foundLog = null;
  if (receipt && receipt.logs) {
    foundLog = receipt.logs.find(log => 
      log.address.toLowerCase() === usdtContract.toLowerCase() &&
      log.topics && log.topics[0] === transferTopic &&
      log.topics[2] && ('0x' + log.topics[2].substring(26).toLowerCase() === adminAddress.toLowerCase())
    );
  }

  if (foundLog) {
    parsedTo = adminAddress;
    const rawAmount = BigInt(foundLog.data);
    amount = Number(rawAmount) / 1e18;
  } else if (targetCrypto === 'USDT_BEP20') {
    // 2. Fallback: Parse direct transaction input if logs are not present/standard
    if (!tx.to || tx.to.toLowerCase() !== usdtContract.toLowerCase()) {
      throw new Error('This transaction is not a BEP-20 USDT token transfer.');
    }
    
    const input = tx.input;
    if (!input || !input.startsWith('0xa9059cbb')) {
      throw new Error('Not a valid BEP-20 USDT transfer transaction.');
    }
    
    parsedTo = '0x' + input.substring(34, 74).toLowerCase();
    const amountHex = input.substring(74);
    const rawAmount = BigInt('0x' + amountHex);
    amount = Number(rawAmount) / 1e18;
  } else {
    throw new Error('Unsupported auto-verify cryptocurrency.');
  }

  // Compare destination address
  if (parsedTo.toLowerCase() !== adminAddress.toLowerCase()) {
    throw new Error(`Transaction recipient (${parsedTo.substring(0, 10)}...) does not match your admin deposit address.`);
  }

  if (amount <= 0) {
    throw new Error('Transaction amount must be greater than 0.');
  }

  return {
    amount,
    from: tx.from,
    to: parsedTo
  };
}

// ---- Automated TRON Blockchain Verification (TRC20 USDT) ----
async function verifyTronTx(txHash, adminAddress) {
  txHash = txHash.trim();
  adminAddress = adminAddress.trim();

  if (!txHash) throw new Error('Transaction hash is required.');
  if (!adminAddress) throw new Error('Admin TRON address is not configured.');

  const url = `https://api.trongrid.io/v1/accounts/${adminAddress}/transactions/trc20?contract_address=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t&limit=25`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data || !data.success || !data.data) {
    throw new Error('Could not query TRON network. Please try again.');
  }

  const tx = data.data.find(t => t.transaction_id.toLowerCase() === txHash.toLowerCase());
  if (!tx) {
    throw new Error('Transaction hash not found. Make sure you sent it to the correct address and the transaction is confirmed on TRON network.');
  }

  if (tx.to.toLowerCase() !== adminAddress.toLowerCase()) {
    throw new Error('Transaction recipient does not match your admin deposit address.');
  }

  if (tx.token_info.symbol !== 'USDT' || tx.token_info.address !== 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t') {
    throw new Error('Transaction token is not USDT TRC20.');
  }

  const decimals = tx.token_info.decimals || 6;
  const amount = parseFloat(tx.value) / Math.pow(10, decimals);

  if (amount <= 0) {
    throw new Error('Transaction amount must be greater than 0.');
  }

  return {
    amount,
    from: tx.from,
    to: tx.to
  };
}

// ---- Purchase Functions ----
function buyProduct(userId, productId) {
  const db = getDB();
  const user = db.users.find(u => u.id === userId);
  const product = db.products.find(p => p.id === productId);
  if (!user || !product) return { success: false, message: 'Product not found!' };
  if (user.balance < product.price) return { success: false, message: 'Insufficient balance!' };

  const existing = db.purchases.find(p => p.userId === userId && p.productId === productId && p.status === 'holding');
  if (existing) return { success: false, message: 'You are already holding this product!' };

  // Check product-specific settings, fallback to global settings or defaults
  const settings = db.siteSettings || {};
  const holdHours = typeof product.holdHours === 'number' ? product.holdHours : (settings.holdHours || 12);
  const holdMinutes = typeof product.holdMinutes === 'number' ? product.holdMinutes : 0;
  const holdSeconds = typeof product.holdSeconds === 'number' ? product.holdSeconds : 0;
  const durationMs = (holdHours * 3600 + holdMinutes * 60 + holdSeconds) * 1000;
  const profitPercent = typeof product.profitPercent === 'number' ? product.profitPercent : ((settings.profitMultiplier - 1) * 100 || 50);

  user.balance -= product.price;
  const purchase = {
    id: 'pur_' + Math.random().toString(36).substr(2, 9),
    userId, productId,
    productName: product.name,
    productImage: product.image,
    buyPrice: product.price,
    sellPrice: parseFloat((product.price * (1 + profitPercent / 100)).toFixed(2)),
    status: 'holding',
    boughtAt: Date.now(),
    canSellAt: Date.now() + durationMs
  };
  db.purchases.push(purchase);
  saveDB(db);
  return { success: true, purchase };
}

function sellProduct(purchaseId, userId) {
  const db = getDB();
  const purchase = db.purchases.find(p => p.id === purchaseId && p.userId === userId);
  if (!purchase) return { success: false, message: 'Purchase not found!' };
  if (purchase.status !== 'holding') return { success: false, message: 'This product is not eligible for sale!' };
  if (Date.now() < purchase.canSellAt) {
    const remaining = purchase.canSellAt - Date.now();
    const hrs = Math.floor(remaining / 3600000);
    const mins = Math.floor((remaining % 3600000) / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    let remStr = '';
    if (hrs > 0) remStr += `${hrs}h `;
    if (mins > 0) remStr += `${mins}m `;
    if (secs > 0) remStr += `${secs}s`;
    if (!remStr) remStr = '0s';
    return { success: false, message: `Please wait ${remStr.trim()} more before selling!` };
  }
  purchase.status = 'sold';
  purchase.soldAt = Date.now();
  const user = db.users.find(u => u.id === userId);
  if (user) user.balance += purchase.sellPrice;
  saveDB(db);
  return { success: true, profit: purchase.sellPrice - purchase.buyPrice };
}

// ---- Withdraw Functions ----
function submitWithdraw(userId, amount, walletAddress, crypto) {
  const db = getDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) return { success: false, message: 'User not found!' };
  if (user.balance < amount) return { success: false, message: 'Insufficient balance!' };

  user.balance -= amount;
  const withdrawal = {
    id: 'wtd_' + Math.random().toString(36).substr(2, 9),
    userId, userName: user.name,
    amount: parseFloat(amount), crypto, walletAddress,
    status: 'pending',
    createdAt: Date.now()
  };
  db.withdrawals.push(withdrawal);
  saveDB(db);
  return { success: true, withdrawal };
}

function approveWithdraw(withdrawalId) {
  const db = getDB();
  const w = db.withdrawals.find(w => w.id === withdrawalId);
  if (!w) return false;
  w.status = 'approved';
  w.approvedAt = Date.now();
  saveDB(db);
  return true;
}

function rejectWithdraw(withdrawalId) {
  const db = getDB();
  const w = db.withdrawals.find(w => w.id === withdrawalId);
  if (!w) return false;
  const user = db.users.find(u => u.id === w.userId);
  if (user) user.balance += w.amount;
  w.status = 'rejected';
  w.rejectedAt = Date.now();
  saveDB(db);
  return true;
}

// ---- UI Helpers ----
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type === 'error' ? 'error' : type === 'success' ? 'success' : 'info'}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function formatMoney(amount) {
  return '$' + parseFloat(amount).toFixed(2);
}

function formatDuration(h, m, s) {
  const pHours = typeof h === 'number' ? h : 0;
  const pMins = typeof m === 'number' ? m : 0;
  const pSecs = typeof s === 'number' ? s : 0;
  let durationStr = '';
  if (pHours > 0) durationStr += `${pHours}h `;
  if (pMins > 0) durationStr += `${pMins}m `;
  if (pSecs > 0) durationStr += `${pSecs}s`;
  if (!durationStr) durationStr = '0s';
  return durationStr.trim();
}

function formatDate(ts) {
  return new Date(ts).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function requireAuth(adminRequired = false) {
  const user = getCurrentUser();
  if (!user) { window.location.href = '/login.html'; return null; }
  if (adminRequired && user.role !== 'admin') { window.location.href = '/index.html'; return null; }
  return user;
}

// ---- UI Theme Utilities ----
function initTheme() {
  const currentTheme = localStorage.getItem('theme') || 'dark';
  if (currentTheme === 'light') {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
  }
}

function toggleTheme() {
  const isLight = document.body.classList.toggle('light-theme');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) btn.innerHTML = isLight ? '🌙' : '☀️';
}

// Auto-run theme initialization
initTheme();

function updateNavBar(user) {
  const navRight = document.getElementById('nav-right');
  if (!navRight) return;
  
  const isLight = document.body.classList.contains('light-theme');
  const themeBtn = `<button id="theme-toggle-btn" class="nav-btn nav-btn-ghost" style="padding: 8px 12px; font-size: 16px; border-radius: 50%; width: 38px; height: 38px; display: inline-flex; align-items: center; justify-content: center;" onclick="toggleTheme()">${isLight ? '🌙' : '☀️'}</button>`;

  if (user) {
    navRight.innerHTML = `
      ${themeBtn}
      <div class="balance-badge">💰 ${formatMoney(user.balance)}</div>
      ${user.role === 'admin' ? '<a href="/admin/index.html" class="nav-btn nav-btn-ghost">🛠️ Admin</a>' : ''}
      <a href="/dashboard.html" class="nav-btn nav-btn-ghost">👤 ${user.name}</a>
      <button onclick="logout()" class="nav-btn nav-btn-ghost">Logout</button>
    `;
  } else {
    navRight.innerHTML = `
      ${themeBtn}
      <a href="/login.html" class="nav-btn nav-btn-ghost">Login</a>
      <a href="/register.html" class="nav-btn nav-btn-primary">Register</a>
    `;
  }
}

function startCountdown(elementId, targetTs, onComplete) {
  function update() {
    const el = document.getElementById(elementId);
    if (!el) return;
    const remaining = targetTs - Date.now();
    if (remaining <= 0) {
      el.innerHTML = '<span class="timer-badge ready">✅ Ready to Sell</span>';
      if (onComplete) onComplete();
      return;
    }
    const h = Math.floor(remaining / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    el.innerHTML = `
      <div class="timer-badge running">
        ⏰
        <div class="countdown">
          <div class="countdown-block"><div class="countdown-num">${String(h).padStart(2,'0')}</div><div class="countdown-label">HRS</div></div>
          <span style="color:var(--primary)">:</span>
          <div class="countdown-block"><div class="countdown-num">${String(m).padStart(2,'0')}</div><div class="countdown-label">MIN</div></div>
          <span style="color:var(--primary)">:</span>
          <div class="countdown-block"><div class="countdown-num">${String(s).padStart(2,'0')}</div><div class="countdown-label">SEC</div></div>
        </div>
      </div>`;
    setTimeout(update, 1000);
  }
  update();
}
