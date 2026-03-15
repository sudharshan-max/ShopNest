// ═══════════════════════════════════════════════
// SHOPNEST ORDERS — orders.js
// Fetch orders, group by order_id, render cards
// Dynamic cart count, JWT auth, error handling
// ═══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
    loadCartBadge();
    initHamburger();
});

// ═══════════════════════════════════════════════
// HAMBURGER — id="hamburgerBtn" / id="mobileNav"
// ═══════════════════════════════════════════════
function initHamburger() {
    const btn  = document.getElementById('hamburgerBtn');
    const menu = document.getElementById('mobileNav');
    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
        const open = menu.classList.toggle('open');
        const [s1, s2, s3] = btn.querySelectorAll('span');
        s1.style.transform = open ? 'rotate(45deg) translate(5px, 5px)' : '';
        s2.style.opacity   = open ? '0' : '1';
        s3.style.transform = open ? 'rotate(-45deg) translate(5px, -5px)' : '';
    });
}

// ═══════════════════════════════════════════════
// LOAD ORDERS — fetch from /api/orders
// ═══════════════════════════════════════════════
function loadOrders() {
    showState('loading');

    fetch('/api/orders', { credentials: 'include' })
        .then(res => {
            // JWT expired / not logged in → redirect to login
            if (res.status === 401) {
                window.location.href = '/api/users/login';
                return null;
            }
            if (!res.ok) throw new Error(`Server error: HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            if (!data) return;

            const products = data.products || [];

            if (products.length === 0) {
                showState('empty');
                return;
            }

            // Group flat product list by order_id
            const grouped = groupByOrderId(products);

            renderStats(grouped, products);
            renderOrders(grouped);
            showState('orders');
        })
        .catch(err => {
            console.error('Orders fetch failed:', err);
            showError(err.message || 'Failed to load orders. Please try again.');
            showState('error');
        });
}

// ═══════════════════════════════════════════════
// GROUP products by order_id
// Returns: Map { orderId → [items...] }
// ═══════════════════════════════════════════════
function groupByOrderId(products) {
    const map = new Map();
    for (const item of products) {
        const id = item.order_id;
        if (!map.has(id)) map.set(id, []);
        map.get(id).push(item);
    }
    return map;
}

// ═══════════════════════════════════════════════
// RENDER STATS BAR
// ═══════════════════════════════════════════════
function renderStats(grouped, products) {
    const totalOrders = grouped.size;
    const totalItems  = products.reduce((s, i) => s + i.quantity, 0);
    const totalSpent  = products.reduce((s, i) => s + i.total_price, 0);

    document.getElementById('totalOrdersCount').textContent = totalOrders;
    document.getElementById('totalItemsCount').textContent  = totalItems;
    document.getElementById('totalSpentAmount').textContent = `₹${fmt(totalSpent)}`;

    const statsBar = document.getElementById('statsBar');
    statsBar.style.display = 'flex';
    statsBar.style.animation = 'fadeUp .4s .05s ease both';
}

// ═══════════════════════════════════════════════
// RENDER ORDER CARDS
// Each unique order_id = one card, items inside
// ═══════════════════════════════════════════════
function renderOrders(grouped) {
    const list = document.getElementById('ordersList');
    list.innerHTML = '';

    let delay = 0;
    for (const [orderId, items] of grouped) {
        const orderTotal = items.reduce((s, i) => s + i.total_price, 0);
        const itemCount  = items.reduce((s, i) => s + i.quantity, 0);

        const card = document.createElement('div');
        card.className = 'order-card';
        card.style.animationDelay = `${delay}s`;

        card.innerHTML = `
            <!-- Order header -->
            <div class="order-card-header">
                <div class="order-id-group">
                    <span class="order-id-label">Order ID</span>
                    <span class="order-id">${esc(orderId)}</span>
                </div>
                <div class="order-header-right">
                    <span class="status-badge success">
                        <span class="status-dot"></span>
                        Confirmed
                    </span>
                </div>
            </div>

            <!-- Items list -->
            <div class="order-items-list">
                ${items.map(item => renderItem(item)).join('')}
            </div>

            <!-- Footer: total + item count -->
            <div class="order-card-footer">
                <span class="order-items-count">
                    ${itemCount} item${itemCount > 1 ? 's' : ''}
                </span>
                <div class="order-total-section">
                    <span class="order-total-label">Order Total</span>
                    <span class="order-total-amount">₹${fmt(orderTotal)}</span>
                </div>
            </div>`;

        list.appendChild(card);
        delay += 0.06;
    }
}

// ═══════════════════════════════════════════════
// RENDER SINGLE ITEM ROW
// ═══════════════════════════════════════════════
function renderItem(item) {
    const imgHtml = item.image_url && item.image_url !== 'null' && item.image_url !== 'default-image-url'
        ? `<img src="${esc(item.image_url)}"
                alt="${esc(item.name)}"
                class="item-img"
                onerror="this.outerHTML='<div class=\\'item-no-img\\'><span>🛍</span></div>'">`
        : `<div class="item-no-img"><span>🛍</span></div>`;

    return `
        <div class="order-item">
            ${imgHtml}
            <div>
                <div class="item-name" title="${esc(item.name)}">${esc(item.name)}</div>
                <div class="item-meta">
                    <span>Qty: ${item.quantity}</span>
                    <span>•</span>
                    <span>₹${fmt(item.price_per_unit)} each</span>
                </div>
            </div>
            <div class="item-price">
                <span class="item-total">₹${fmt(item.total_price)}</span>
                <span class="item-per-unit">per unit: ₹${fmt(item.price_per_unit)}</span>
            </div>
        </div>`;
}

// ═══════════════════════════════════════════════
// CART BADGE — dynamic count
// ═══════════════════════════════════════════════
function loadCartBadge() {
    fetch('/api/cart/items', { credentials: 'include' })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
            if (!data) return;
            const count = (data.cart?.products || []).reduce((s, i) => s + i.quantity, 0);
            const badge = document.getElementById('cartBadge');
            if (badge && count > 0) {
                badge.textContent = count;
                badge.style.display = 'flex';
            }
        })
        .catch(() => {}); // silent fail — badge is non-critical
}

// ═══════════════════════════════════════════════
// STATE MANAGEMENT
// ═══════════════════════════════════════════════
function showState(state) {
    document.getElementById('loadingState').style.display = state === 'loading' ? 'flex'  : 'none';
    document.getElementById('errorState').style.display   = state === 'error'   ? 'block' : 'none';
    document.getElementById('emptyState').style.display   = state === 'empty'   ? 'block' : 'none';
    document.getElementById('ordersList').style.display   = state === 'orders'  ? 'flex'  : 'none';

    if (state === 'loading') {
        document.getElementById('loadingState').style.flexDirection = 'column';
    }
    if (state === 'orders') {
        document.getElementById('ordersList').style.flexDirection = 'column';
    }
}

function showError(msg) {
    const el = document.getElementById('errorMsg');
    if (el) el.textContent = msg;
}

// ═══════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════
function esc(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmt(price) {
    return Number(price).toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}