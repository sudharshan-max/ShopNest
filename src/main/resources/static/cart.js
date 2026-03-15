// ═══════════════════════════════════════════════
// SHOPNEST CART PAGE — cart.js
// Bugs fixed:
// 1. Qty read from DOM dynamically — not hardcoded in onclick
// 2. Increment/decrement now accurate
// 3. Stock limit enforced correctly
// ═══════════════════════════════════════════════

let cartData = [];

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initHamburger();
    loadCart();
});

// ═══════════════════════════════════════════════
// LOAD CART
// ═══════════════════════════════════════════════
function loadCart() {
    fetch('/api/cart/items', { credentials: 'include' })
        .then(res => {
            if (res.status === 401) { window.location.href = '/api/users/login'; return null; }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            if (!data) return;
            cartData = data.cart?.products || [];
            renderCart();
            updateCartBadge(getTotalItemCount());
        })
        .catch(err => {
            console.error('Cart load error:', err);
            showCartError();
        });
}

// ═══════════════════════════════════════════════
// RENDER CART
// ═══════════════════════════════════════════════
function renderCart() {
    const col         = document.getElementById('cartItemsCol');
    const countEl     = document.getElementById('cartItemsCount');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (countEl) {
        countEl.textContent = cartData.length > 0
            ? `${cartData.length} item${cartData.length !== 1 ? 's' : ''} in your cart`
            : '';
    }

    if (cartData.length === 0) {
        col.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Looks like you haven't added anything yet. Start shopping!</p>
                <a href="/api/products/home" class="empty-cart-btn">Browse Products</a>
            </div>`;
        renderSummary([]);
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }

    if (checkoutBtn) checkoutBtn.disabled = false;
    col.innerHTML = cartData.map((item, index) => buildItemCard(item, index)).join('');
    renderSummary(cartData);
}

// ═══════════════════════════════════════════════
// BUILD CART ITEM CARD
// ✅ FIX 1 & 2: onclick only passes productId + delta
//              qty is read LIVE from DOM in changeQuantity()
// ✅ FIX 3: stock stored in data-stock on the card element
// ═══════════════════════════════════════════════
function buildItemCard(item, index) {
    const imgHtml = item.image_url && item.image_url !== 'default-image-url'
        ? `<img src="${escHtml(item.image_url)}"
               alt="${escHtml(item.name)}"
               class="cart-item-img"
               onerror="this.outerHTML='<div class=\\'cart-item-no-img\\'><span>🛍</span><small>No image</small></div>'">`
        : `<div class="cart-item-no-img"><span>🛍</span><small>No image</small></div>`;

    const stock      = item.stock ?? 999999;
    const currentQty = item.quantity;
    const atMaxStock = currentQty >= stock;

    const stockWarn = atMaxStock
        ? `<span class="stock-warning">Max stock reached (${stock} available)</span>`
        : '';

    const delay = index * 0.07;

    return `
        <div class="cart-item-card"
             data-product-id="${item.product_id}"
             data-stock="${stock}"
             style="animation-delay:${delay}s">

            ${imgHtml}

            <div class="cart-item-info">
                <h3 class="cart-item-name" title="${escHtml(item.name)}">${escHtml(item.name)}</h3>
                <p class="cart-item-desc">${escHtml(item.description || '')}</p>
                <p class="cart-item-price-unit">
                    <strong>₹${formatPrice(item.price_per_unit)}</strong> per unit
                </p>

                <div class="qty-controls">

                    <!-- ✅ FIX 1: No currentQty in onclick — read from DOM live -->
                    <button class="qty-btn minus"
                            onclick="changeQuantity(${item.product_id}, -1)"
                            title="${currentQty === 1 ? 'Remove item' : 'Decrease quantity'}">
                        ${currentQty === 1 ? '🗑' : '−'}
                    </button>

                    <span class="qty-value" id="qty-${item.product_id}">${currentQty}</span>

                    <!-- ✅ FIX 2 & 3: No currentQty in onclick — disable if at stock limit -->
                    <button class="qty-btn plus"
                            onclick="changeQuantity(${item.product_id}, +1)"
                            ${atMaxStock ? 'disabled' : ''}
                            title="${atMaxStock ? 'Max stock reached' : 'Increase quantity'}">
                        +
                    </button>

                </div>
                ${stockWarn}
            </div>

            <div class="cart-item-right">
                <span class="cart-item-total" id="total-${item.product_id}">
                    ₹${formatPrice(item.total_price)}
                </span>
                <button class="remove-btn" onclick="removeItem(${item.product_id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                    </svg>
                    Remove
                </button>
            </div>

        </div>`;
}

// ═══════════════════════════════════════════════
// RENDER ORDER SUMMARY
// ═══════════════════════════════════════════════
function renderSummary(products) {
    const rowsEl      = document.getElementById('summaryRows');
    const grandEl     = document.getElementById('grandTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (products.length === 0) {
        if (rowsEl) rowsEl.innerHTML = `<p style="font-size:13px;color:var(--text-xlight);text-align:center;padding:12px 0">No items in cart</p>`;
        if (grandEl) grandEl.textContent = '₹0';
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }

    if (rowsEl) {
        rowsEl.innerHTML = products.map(item => {
            const imgEl = item.image_url && item.image_url !== 'default-image-url'
                ? `<img src="${escHtml(item.image_url)}" class="summary-row-thumb" onerror="this.style.display='none'">`
                : `<div class="summary-row-thumb" style="display:flex;align-items:center;justify-content:center;font-size:18px">🛍</div>`;
            return `
                <div class="summary-row">
                    <div class="summary-row-name">
                        ${imgEl}
                        <div>
                            <div class="summary-row-label" title="${escHtml(item.name)}">${escHtml(item.name)}</div>
                            <div class="summary-row-qty">× ${item.quantity}</div>
                        </div>
                    </div>
                    <span class="summary-row-price">₹${formatPrice(item.total_price)}</span>
                </div>`;
        }).join('');
    }

    const total = products.reduce((sum, p) => sum + p.total_price, 0);
    if (grandEl) grandEl.textContent = `₹${formatPrice(total)}`;
    if (checkoutBtn) checkoutBtn.disabled = false;
}

// ═══════════════════════════════════════════════
// CHANGE QUANTITY
// ✅ FIX 1: currentQty read LIVE from DOM span — never stale
// ✅ FIX 2: delta applied to live value — always accurate
// ✅ FIX 3: stock checked from card's data-stock attribute
// ═══════════════════════════════════════════════
function changeQuantity(productId, delta) {

    // ✅ Read current qty LIVE from the DOM — not from onclick argument
    const qtyEl      = document.getElementById(`qty-${productId}`);
    const currentQty = parseInt(qtyEl?.textContent) || 1;
    const newQty     = currentQty + delta;

    // Qty hits 0 → remove item entirely
    if (newQty <= 0) {
        removeItem(productId);
        return;
    }

    // ✅ Read stock from data attribute on the card
    const card  = document.querySelector(`.cart-item-card[data-product-id="${productId}"]`);
    const stock = parseInt(card?.dataset.stock) || 999999;

    // Block if exceeding stock
    if (newQty > stock) {
        const plusBtn = card?.querySelector('.qty-btn.plus');
        if (plusBtn) {
            plusBtn.style.background = 'var(--danger)';
            plusBtn.style.color      = 'white';
            setTimeout(() => {
                plusBtn.style.background = '';
                plusBtn.style.color      = '';
            }, 600);
        }
        return;
    }

    // Optimistic UI — instant feel
    updateItemUI(productId, newQty, stock);

    // API call
    fetch('/api/cart/update', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: productId, quantity: newQty })
    })
    .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const item = cartData.find(p => p.product_id === productId);
        if (item) {
            item.quantity    = newQty;
            item.total_price = newQty * item.price_per_unit;
        }
        renderSummary(cartData);
        updateCartBadge(getTotalItemCount());
    })
    .catch(err => {
        console.error('Update error:', err);
        updateItemUI(productId, currentQty, stock); // revert on error
    });
}

// ═══════════════════════════════════════════════
// REMOVE ITEM
// ═══════════════════════════════════════════════
function removeItem(productId) {
    const card = document.querySelector(`.cart-item-card[data-product-id="${productId}"]`);
    if (card) {
        card.style.transition = 'all 0.3s ease';
        card.style.opacity    = '0';
        card.style.transform  = 'translateX(30px)';
    }

    fetch('/api/cart/delete', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: productId })
    })
    .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        cartData = cartData.filter(p => p.product_id !== productId);
        setTimeout(() => {
            renderCart();
            updateCartBadge(getTotalItemCount());
        }, 280);
    })
    .catch(err => {
        console.error('Delete error:', err);
        if (card) { card.style.opacity = '1'; card.style.transform = ''; }
    });
}

// ═══════════════════════════════════════════════
// OPTIMISTIC UI UPDATE
// Updates DOM instantly, then API confirms
// ═══════════════════════════════════════════════
function updateItemUI(productId, newQty, stock) {
    const qtyEl   = document.getElementById(`qty-${productId}`);
    const totalEl = document.getElementById(`total-${productId}`);
    const item    = cartData.find(p => p.product_id === productId);
    const card    = document.querySelector(`.cart-item-card[data-product-id="${productId}"]`);

    // Update qty
    if (qtyEl) qtyEl.textContent = newQty;

    // Animate total
    if (totalEl && item) {
        totalEl.textContent     = `₹${formatPrice(newQty * item.price_per_unit)}`;
        totalEl.style.transform = 'scale(1.1)';
        totalEl.style.color     = 'var(--accent)';
        setTimeout(() => { totalEl.style.transform = ''; totalEl.style.color = ''; }, 250);
    }

    // Update minus button text
    const minusBtn = card?.querySelector('.qty-btn.minus');
    if (minusBtn) {
        minusBtn.textContent = newQty === 1 ? '🗑' : '−';
        minusBtn.title       = newQty === 1 ? 'Remove item' : 'Decrease quantity';
    }

    // Enable/disable plus button based on stock
    const plusBtn = card?.querySelector('.qty-btn.plus');
    if (plusBtn) {
        plusBtn.disabled = newQty >= stock;
        plusBtn.title    = newQty >= stock ? 'Max stock reached' : 'Increase quantity';
    }

    // Show/hide stock warning
    const existingWarn = card?.querySelector('.stock-warning');
    if (existingWarn) existingWarn.remove();

    if (newQty >= stock) {
        const info = card?.querySelector('.cart-item-info');
        if (info) {
            const warn       = document.createElement('span');
            warn.className   = 'stock-warning';
            warn.textContent = `Max stock reached (${stock} available)`;
            info.appendChild(warn);
        }
    }
}

// ═══════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════
function getTotalItemCount() {
    return cartData.reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartBadge(count) {
    const badge = document.getElementById('cartCount');
    if (!badge) return;
    badge.textContent     = count;
    badge.style.transform = 'scale(1.4)';
    setTimeout(() => badge.style.transform = '', 300);
}

function proceedToCheckout() {
    if (cartData.length === 0) return;
    window.location.href = '/api/checkout';
}

function showCartError() {
    const col = document.getElementById('cartItemsCol');
    if (col) col.innerHTML = `
        <div class="empty-cart">
            <div class="empty-cart-icon">😕</div>
            <h3>Something went wrong</h3>
            <p>Failed to load your cart. Please try again.</p>
            <button class="empty-cart-btn" onclick="loadCart()">Retry</button>
        </div>`;
}

function initNavbar() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar?.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
}

function initHamburger() {
    const btn  = document.getElementById('hamburger');
    const menu = document.getElementById('mobileMenu');
    if (!btn || !menu) return;
    btn.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('open');
        const spans  = btn.querySelectorAll('span');
        spans[0].style.transform = isOpen ? 'rotate(45deg) translate(5px,5px)' : '';
        spans[1].style.opacity   = isOpen ? '0' : '1';
        spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px,-5px)' : '';
    });
}

function escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatPrice(price) {
    return Number(price).toLocaleString('en-IN', {
        minimumFractionDigits: 0, maximumFractionDigits: 2
    });
}