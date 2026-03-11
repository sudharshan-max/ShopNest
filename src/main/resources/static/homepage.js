// ═══════════════════════════════════════════════
// SHOPNEST HOMEPAGE — homepage.js
// ═══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initHamburger();
    initSearch();
    initCategoryTabs();
    fetchProducts('');
    loadCartBadge();
});

// ═══════════════════════════════════════════════
// LOAD CART BADGE COUNT ON PAGE LOAD
// ═══════════════════════════════════════════════
function loadCartBadge() {
    fetch('/api/cart/items', { credentials: 'include' })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
            if (!data) return;
            const total = (data.cart?.products || [])
                .reduce((sum, p) => sum + p.quantity, 0);
            const badge = document.getElementById('cartCount');
            if (badge && total > 0) badge.textContent = total;
        })
        .catch(() => {});
}

// ═══════════════════════════════════════════════
// FETCH PRODUCTS FROM REST API
// ═══════════════════════════════════════════════
function fetchProducts(category) {
    const grid    = document.getElementById('productsGrid');
    const titleEl = document.getElementById('productsTitle');
    const countEl = document.getElementById('productsCount');

    if (titleEl) titleEl.textContent = category ? category : 'All Products';

    grid.innerHTML = `
        <div class="spinner-wrap">
            <div class="spinner"></div>
            <span>Loading products…</span>
        </div>`;

    const url = category
        ? `/api/products?category=${encodeURIComponent(category)}`
        : `/api/products`;

    fetch(url, { credentials: 'include' })
        .then(res => {
            if (res.status === 401) { window.location.href = '/api/users/login'; return null; }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            if (!data) return;
            const products = data.products || [];
            if (countEl) {
                countEl.textContent = products.length > 0
                    ? `${products.length} product${products.length > 1 ? 's' : ''} found`
                    : '';
            }
            renderProducts(products);
        })
        .catch(err => {
            console.error('Fetch error:', err);
            grid.innerHTML = `
                <div class="state-box">
                    <span class="state-icon">😕</span>
                    <p>Failed to load products. Please try again.</p>
                    <button class="retry-btn" onclick="fetchProducts('${category}')">Try Again</button>
                </div>`;
        });
}

// ═══════════════════════════════════════════════
// RENDER PRODUCT CARDS
// ═══════════════════════════════════════════════
function renderProducts(products) {
    const grid = document.getElementById('productsGrid');

    if (!products || products.length === 0) {
        grid.innerHTML = `
            <div class="state-box">
                <span class="state-icon">🛍</span>
                <p>No products found in this category.</p>
            </div>`;
        return;
    }

    grid.innerHTML = products.map((product, index) => {

        const imgHtml = (product.images && product.images.length > 0)
            ? `<img src="${escHtml(product.images[0])}"
                    alt="${escHtml(product.name)}"
                    class="product-img" loading="lazy"
                    onerror="this.outerHTML='<div class=\\'no-img\\'><span>🛍</span><span>No image</span></div>'">`
            : `<div class="no-img"><span>🛍</span><span>No image</span></div>`;

        const isOutOfStock = product.stock === 0;
        const stockBadge   = isOutOfStock ? `<span class="stock-badge">Out of Stock</span>` : '';
        const stockLabel   = isOutOfStock
            ? `<span class="product-stock-label out">Out of stock</span>`
            : `<span class="product-stock-label">${product.stock} in stock</span>`;

        const cartBtn = isOutOfStock
            ? `<button class="add-cart-btn" disabled title="Out of stock">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
               </button>`
            : `<button class="add-cart-btn" data-id="${product.product_id}"
                       onclick="addToCart(this, ${product.product_id}, ${product.stock})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
               </button>`;

        const delay = (index % 8) * 0.06;

        return `
            <div class="product-card" style="animation-delay:${delay}s" data-id="${product.product_id}">
                <div class="product-img-wrap">
                    ${imgHtml}
                    ${stockBadge}
                    <div class="product-overlay">
                        <button class="quick-view-btn" onclick="quickView(${product.product_id})">
                            Quick View
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name" title="${escHtml(product.name)}">${escHtml(product.name)}</h3>
                    <p class="product-desc">${escHtml(product.description || '')}</p>
                    <div class="product-footer">
                        <div>
                            <span class="product-price">₹${formatPrice(product.price)}</span>
                            ${stockLabel}
                        </div>
                        ${cartBtn}
                    </div>
                </div>
            </div>`;
    }).join('');
}

// ═══════════════════════════════════════════════
// ADD TO CART
// ✅ No username needed — JWT cookie identifies the user on backend
// ═══════════════════════════════════════════════
function addToCart(btn, productId, stock) {
    btn.disabled = true;
    const originalHTML = btn.innerHTML;

    btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
             style="width:16px;height:16px;animation:spin 0.6s linear infinite">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>`;

    // ✅ Only productId — backend gets user from JWT cookie
    fetch('/api/cart/add', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: productId })
    })
    .then(res => {
        if (res.status === 401) { window.location.href = '/api/users/login'; return null; }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res;
    })
    .then(res => {
        if (!res) return;

        btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                 style="width:16px;height:16px">
                <polyline points="20 6 9 17 4 12"/>
            </svg>`;
        btn.style.background = 'linear-gradient(135deg,#43c49e,#2e9e78)';

        const badge = document.getElementById('cartCount');
        if (badge) {
            const current = parseInt(badge.textContent) || 0;
            badge.textContent = current + 1;
            badge.style.transform = 'scale(1.5)';
            setTimeout(() => badge.style.transform = '', 300);
        }

        setTimeout(() => {
            btn.innerHTML    = originalHTML;
            btn.style.background = '';
            btn.disabled     = false;
        }, 1500);
    })
    .catch(err => {
        console.error('Add to cart error:', err);
        btn.innerHTML    = originalHTML;
        btn.style.background = '';
        btn.disabled     = false;
    });
}

// ═══════════════════════════════════════════════
// QUICK VIEW
// ═══════════════════════════════════════════════
function quickView(productId) {
    console.log('Quick view:', productId);
}

// ═══════════════════════════════════════════════
// CATEGORY TABS
// ═══════════════════════════════════════════════
function initCategoryTabs() {
    const tabs = document.querySelectorAll('.cat-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            fetchProducts(tab.dataset.category);
            document.getElementById('productsSection')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

// ═══════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════
function initSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    let debounceTimer;
    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = input.value.trim().toLowerCase();
            document.querySelectorAll('.product-card').forEach(card => {
                const name = card.querySelector('.product-name')?.textContent.toLowerCase() || '';
                const desc = card.querySelector('.product-desc')?.textContent.toLowerCase() || '';
                card.style.display = (name.includes(query) || desc.includes(query)) ? '' : 'none';
            });
        }, 250);
    });
}

// ═══════════════════════════════════════════════
// NAVBAR + HAMBURGER
// ═══════════════════════════════════════════════
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

function scrollToProducts() {
    document.getElementById('productsSection')?.scrollIntoView({ behavior: 'smooth' });
}

function scrollToCategories() {
    document.getElementById('categoriesSection')?.scrollIntoView({ behavior: 'smooth' });
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