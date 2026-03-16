// ══════════════════════════════════════
// ADMIN ANALYTICS — admin-analytics.js
// GET /admin/business/overall
// GET /admin/business/daily?date=
// GET /admin/business/monthly?month=&year=
// GET /admin/business/yearly?year=
// ══════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    setDefaults();
    loadOverall();
});

function setDefaults() {
    const now = new Date();
    el('dailyDate').value = now.toISOString().split('T')[0];
    el('monthSel').value  = now.getMonth() + 1;
    el('monthYear').value = now.getFullYear();
    el('yearSel').value   = now.getFullYear();
}

// ── Overall (auto-loads) ──
function loadOverall() {
    fetch('/admin/business/overall', { credentials: 'include' })
        .then(r => {
            if (r.status === 401) { location.href = '/api/auth/login'; return null; }
            if (!r.ok) throw new Error();
            return r.json();
        })
        .then(data => {
            if (!data) return;
            const total = data.totalBusiness ?? data.totalRevenue ?? 0;
            const cats  = data.categorySales || {};
            const top   = Object.entries(cats).sort((a,b) => b[1]-a[1])[0];

            el('overallContent').innerHTML = `
                <div class="overall-stats">
                    <div class="os-item">
                        <span class="os-val">₹${fmt(total)}</span>
                        <span class="os-lbl">All-Time Revenue</span>
                    </div>
                    <div class="os-item">
                        <span class="os-val">${Object.keys(cats).length}</span>
                        <span class="os-lbl">Categories</span>
                    </div>
                    <div class="os-item">
                        <span class="os-val">${top ? esc(top[0]) : '—'}</span>
                        <span class="os-lbl">Top Category</span>
                    </div>
                    <div class="os-item">
                        <span class="os-val">${top ? top[1] : '—'}</span>
                        <span class="os-lbl">Units (Top)</span>
                    </div>
                </div>`;
        })
        .catch(() => {
            el('overallContent').innerHTML = '<span style="font-size:12px;color:var(--red)">Failed to load overall metrics.</span>';
        });
}

// ── Tab switching ──
function switchTab(name, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    el(`panel-${name}`).classList.add('active');
}

// ── Daily ──
function fetchDaily() {
    const date = el('dailyDate').value;
    if (!date) return;
    fetchReport(`/admin/business/daily?date=${date}`, 'dailyResult',
        `Daily — ${new Date(date).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}`);
}

// ── Monthly ──
function fetchMonthly() {
    const month = el('monthSel').value;
    const year  = el('monthYear').value;
    if (!month || !year) return;
    const months = ['','January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
    fetchReport(`/admin/business/monthly?month=${month}&year=${year}`, 'monthlyResult',
        `${months[month]} ${year}`);
}

// ── Yearly ──
function fetchYearly() {
    const year = el('yearSel').value;
    if (!year) return;
    fetchReport(`/admin/business/yearly?year=${year}`, 'yearlyResult', `Year ${year}`);
}

// ── Shared fetch + render ──
function fetchReport(url, resultId, period) {
    const box = el(resultId);
    box.style.display = 'block';
    box.innerHTML = '<div class="loading-row"><div class="spin"></div>Loading…</div>';

    fetch(url, { credentials: 'include' })
        .then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t); }))
        .then(data => renderResult(box, data, period))
        .catch(err => {
            box.innerHTML = `<span style="font-size:12px;color:var(--red)">${esc(err.message || 'Failed to load report.')}</span>`;
        });
}

function renderResult(box, data, period) {
    const rev     = data.totalRevenue ?? 0;
    const cats    = data.categorySales || {};
    const entries = Object.entries(cats).sort((a,b) => b[1]-a[1]);

    const breakHtml = entries.length > 0
        ? `<div class="break-grid">
            ${entries.map(([name,qty],i) => `
                <div class="break-item" style="animation-delay:${i*.04}s">
                    <div class="break-cat">${esc(name)}</div>
                    <div class="break-qty">${qty}</div>
                    <div class="break-unit">units sold</div>
                </div>`).join('')}
           </div>`
        : `<p class="empty-msg">No sales data for this period.</p>`;

    box.innerHTML = `
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:1rem;flex-wrap:wrap">
            <div>
                <div class="result-revenue">₹${fmt(rev)}</div>
                <div class="result-lbl">Total Revenue</div>
            </div>
            <span class="badge b-accent">${esc(period)}</span>
        </div>
        ${entries.length > 0 ? '<div class="sec-title" style="margin-bottom:.625rem">Sales by Category</div>' : ''}
        ${breakHtml}`;
}

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); }

function fmt(n) { return Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 }); }
function esc(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function el(id) { return document.getElementById(id); }
