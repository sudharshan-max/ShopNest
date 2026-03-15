// ════════════════════════════════════════
// SHOPNEST — profile.js
// Cart badge + hamburger menu
// ════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    loadCartBadge();
    initHamburger();
});

// ── Dynamic cart badge count ──
function loadCartBadge() {
    fetch('/api/cart/items', { credentials: 'include' })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
            if (!data) return;
            const count = (data.cart?.products || [])
                .reduce((s, i) => s + i.quantity, 0);
            const badge = document.getElementById('cartBadge');
            if (badge && count > 0) {
                badge.textContent = count;
                badge.style.display = 'flex';
            }
        })
        .catch(() => {});
}

// ── Hamburger menu ──
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