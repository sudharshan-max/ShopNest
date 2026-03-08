// ═══════════════════════════════════════════════
// SHOPNEST HOMEPAGE — homepage.js
// Fetches products from /api/products
// Category click → re-fetches with ?category=X
// ═══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initHamburger();
    initSearch();
    initCategoryTabs();

    // Load ALL products on page load
    fetchProducts('');
});

// ═══════════════════════════════════════════════
// FETCH PRODUCTS FROM REST API
// ═══════════════════════════════════════════════
function fetchProducts(category) {
    const grid        = document.getElementById('productsGrid');
    const titleEl     = document.getElementById('productsTitle');
    const countEl     = document.getElementById('productsCount');

    // Update section title
    if (titleEl) {
        titleEl.textContent = category ? category : 'All Products';
    }

    // Show spinner while loading
    grid.innerHTML = `
        <div class="spinner-wrap">
            <div class="spinner"></div>
            <span>Loading products…</span>
        </div>`;

    // Build URL — empty category = fetch all
    const url = category
        ? `/api/products?category=${encodeURIComponent(category)}`
        : `/api/products`;

    fetch(url, { credentials: 'include' })
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            const products = data.products || [];

            // Update count
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
                    <button class="retry-btn" onclick="fetchProducts('${category}')">
                        Try Again
                    </button>
                </div>`;
        });
}

// ═══════════════════════════════════════════════
// RENDER PRODUCT CARDS
// ═══════════════════════════════════════════════
function renderProducts(products) {
    const grid = document.getElementById('productsGrid');

    // Empty state
    if (!products || products.length === 0) {
        grid.innerHTML = `
            <div class="state-box">
                <span class="state-icon">🛍</span>
                <p>No products found in this category.</p>
            </div>`;
        return;
    }

    // Build cards
    grid.innerHTML = products.map((product, index) => {

        // First image or empty
        const imgHtml = (product.images && product.images.length > 0)
            ? `<img
                src="${escHtml(product.images[0])}"
                alt="${escHtml(product.name)}"
                class="product-img"
                loading="lazy"
                onerror="this.outerHTML='<div class=\\'no-img\\'><span>🛍</span><span>No image</span></div>'">`
            : `<div class="no-img"><span>🛍</span><span>No image</span></div>`;

        // Stock
        const isOutOfStock = product.stock === 0;

        const stockBadge = isOutOfStock
            ? `<span class="stock-badge">Out of Stock</span>`
            : '';

        const stockLabel = isOutOfStock
            ? `<span class="product-stock-label out">Out of stock</span>`
            : `<span class="product-stock-label">${product.stock} in stock</span>`;

        // Cart button
        const cartBtn = isOutOfStock
            ? `<button class="add-cart-btn" disabled title="Out of stock">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
               </button>`
            : `<button class="add-cart-btn" data-id="${product.product_id}" onclick="addToCart(this, ${product.product_id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
               </button>`;

        // Stagger animation delay
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
                    <h3 class="product-name" title="${escHtml(product.name)}">
                        ${escHtml(product.name)}
                    </h3>
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
// ═══════════════════════════════════════════════
function addToCart(btn, productId) {
    // Visual feedback on button
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:17px;height:17px"><polyline points="20 6 9 17 4 12"/></svg>`;
    btn.style.background = 'linear-gradient(135deg,#43c49e,#2e9e78)';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = '';
        btn.disabled = false;
    }, 1500);

    // Update cart badge count
    const badge = document.getElementById('cartCount');
    if (badge) {
        const current = parseInt(badge.textContent) || 0;
        badge.textContent = current + 1;
        badge.style.transform = 'scale(1.5)';
        setTimeout(() => badge.style.transform = '', 300);
    }
}

// ═══════════════════════════════════════════════
// QUICK VIEW (placeholder — hook up later)
// ═══════════════════════════════════════════════
function quickView(productId) {
    console.log('Quick view:', productId);
    // TODO: open product detail modal
}

// ═══════════════════════════════════════════════
// CATEGORY TABS
// ═══════════════════════════════════════════════
function initCategoryTabs() {
    const tabs = document.querySelectorAll('.cat-tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active state
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Fetch products for selected category
            const category = tab.dataset.category; // '' = all
            fetchProducts(category);

            // Scroll to products section
            const productsSection = document.getElementById('productsSection');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ═══════════════════════════════════════════════
// SEARCH — filters rendered cards by name
// ═══════════════════════════════════════════════
function initSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;

    let debounceTimer;

    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = input.value.trim().toLowerCase();
            const cards = document.querySelectorAll('.product-card');

            cards.forEach(card => {
                const name = card.querySelector('.product-name')?.textContent.toLowerCase() || '';
                const desc = card.querySelector('.product-desc')?.textContent.toLowerCase() || '';
                const match = name.includes(query) || desc.includes(query);
                card.style.display = match ? '' : 'none';
            });
        }, 250);
    });
}

// ═══════════════════════════════════════════════
// NAVBAR SCROLL EFFECT
// ═══════════════════════════════════════════════
function initNavbar() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar?.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
}

// ═══════════════════════════════════════════════
// HAMBURGER MENU
// ═══════════════════════════════════════════════
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

// ═══════════════════════════════════════════════
// SCROLL HELPERS
// ═══════════════════════════════════════════════
function scrollToProducts() {
    document.getElementById('productsSection')
        ?.scrollIntoView({ behavior: 'smooth' });
}

function scrollToCategories() {
    document.getElementById('categoriesSection')
        ?.scrollIntoView({ behavior: 'smooth' });
}

// ═══════════════════════════════════════════════
// UTILITY — escape HTML to prevent XSS
// ═══════════════════════════════════════════════
function escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;');
}

function formatPrice(price) {
    return Number(price).toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}
