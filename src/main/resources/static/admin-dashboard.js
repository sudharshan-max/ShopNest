// ══════════════════════════════════════
// ADMIN DASHBOARD — admin-dashboard.js
// ══════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    loadOverall();
});

function loadOverall() {
    fetch('/admin/business/overall', { credentials: 'include' })
        .then(r => {
            if (r.status === 401) { location.href = '/api/auth/login'; return null; }
            if (!r.ok) throw new Error();
            return r.json();
        })
        .then(data => {
            if (!data) return;

            // Revenue stat
            const rev = data.totalBusiness ?? data.totalRevenue ?? 0;
            el('dRevenue').textContent = '₹' + fmt(rev);

            // Orders count (from categorySales total items)
            const cats = data.categorySales || {};
            const totalOrders = Object.values(cats).reduce((s, v) => s + v, 0);
            el('dOrders').textContent = totalOrders;
            el('dCategories').textContent = Object.keys(cats).length;

            // Category grid
            const entries = Object.entries(cats).sort((a, b) => b[1] - a[1]);
            if (entries.length === 0) {
                el('catContent').innerHTML = '<span style="font-size:13px;color:var(--textmuted)">No sales data yet.</span>';
                return;
            }

            el('catContent').innerHTML = `
                <div class="cat-grid">
                    ${entries.map(([name, qty], i) => `
                        <div class="cat-item" style="animation-delay:${i * .05}s">
                            <div class="cat-name">${esc(name)}</div>
                            <div class="cat-val">${qty}</div>
                            <div class="cat-unit">units sold</div>
                        </div>`).join('')}
                </div>`;
        })
        .catch(() => {
            el('dRevenue').textContent = '—';
            el('dOrders').textContent = '—';
            el('dCategories').textContent = '—';
            el('catContent').innerHTML = '<span style="font-size:12px;color:var(--red)">Failed to load data.</span>';
        });
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function fmt(n) { return Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 }); }
function esc(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function el(id) { return document.getElementById(id); }
