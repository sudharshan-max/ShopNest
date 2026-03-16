// ══════════════════════════════════════
// ADMIN PRODUCTS — admin-products.js
// POST /admin/products/add
// DELETE /admin/products/delete
// ══════════════════════════════════════

let delTargetId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    // Image URL preview
    el('pImgUrl').addEventListener('input', () => {
        const url = el('pImgUrl').value.trim();
        const wrap = el('imgPreview');
        const img  = el('imgPreviewImg');
        if (url) {
            img.src = url;
            img.onerror = () => { wrap.style.display = 'none'; };
            img.onload  = () => { wrap.style.display = 'block'; };
        } else {
            wrap.style.display = 'none';
        }
    });
});

// ── Load products list ──
function loadProducts() {
    const list = el('prodList');
    list.innerHTML = '<div class="loading-row"><div class="spin"></div>Loading…</div>';

    fetch('/api/products', { credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
            const products = data?.products || [];
            if (products.length === 0) {
                list.innerHTML = '<span style="font-size:12px;color:var(--textmuted)">No products found.</span>';
                return;
            }
            list.innerHTML = `<div class="prod-list">
                ${products.slice(0, 25).map((p, i) => {
                    const img = p.images?.[0]
                        ? `<img src="${esc(p.images[0])}" class="prod-img" alt=""
                               onerror="this.outerHTML='<div class=\\'prod-no-img\\'><span>🛍</span></div>'">`
                        : `<div class="prod-no-img"><span>🛍</span></div>`;
                    return `
                        <div class="prod-item" style="animation-delay:${i * .04}s">
                            ${img}
                            <div class="prod-info">
                                <div class="prod-name">${esc(p.name)}</div>
                                <div class="prod-meta">₹${fmt(p.price)} · ${p.stock} in stock</div>
                            </div>
                            <span class="prod-id">ID: ${p.product_id}</span>
                        </div>`;
                }).join('')}
            </div>`;
        })
        .catch(() => {
            list.innerHTML = '<span style="font-size:12px;color:var(--red)">Failed to load products.</span>';
        });
}

// ── Add product ──
function addProduct() {
    const name  = el('pName').value.trim();
    const desc  = el('pDesc').value.trim();
    const price = el('pPrice').value.trim();
    const stock = el('pStock').value.trim();
    const catId = el('pCatId').value.trim();
    const img   = el('pImgUrl').value.trim();

    if (!name || !desc || !price || !stock || !catId || !img) {
        showAlert('addAlert', 'err', 'Please fill in all required fields.');
        return;
    }

    const btn = el('addBtn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spin"></div> Adding…';

    fetch('/admin/products/add', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name, description: desc,
            price: parseFloat(price),
            stock: parseInt(stock),
            categoryId: parseInt(catId),
            imageUrl: img
        })
    })
    .then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t); }))
    .then(() => {
        showAlert('addAlert', 'ok', `"${name}" added successfully!`);
        clearForm();
        loadProducts();
    })
    .catch(err => showAlert('addAlert', 'err', err.message || 'Failed to add product.'))
    .finally(() => {
        btn.disabled = false;
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>Add Product`;
    });
}

function clearForm() {
    ['pName','pDesc','pPrice','pStock','pCatId','pImgUrl'].forEach(id => { el(id).value = ''; });
    el('imgPreview').style.display = 'none';
}

// ── Delete flow ──
function confirmDelete() {
    const id = el('delId').value.trim();
    if (!id) { showAlert('delAlert', 'err', 'Please enter a product ID.'); return; }
    delTargetId = parseInt(id);
    el('delModalMsg').textContent = `Delete product ID ${delTargetId}? This cannot be undone.`;
    el('delModal').classList.add('open');
}

function closeModal() {
    el('delModal').classList.remove('open');
    delTargetId = null;
}

function executeDelete() {
    if (!delTargetId) return;
    const btn = el('delConfirmBtn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spin"></div>';

	fetch(`/admin/products/delete/${delTargetId}`, {
	    method: 'DELETE',
	    credentials: 'include'
	})
    .then(r => r.ok ? r.text() : r.text().then(t => { throw new Error(t); }))
    .then(() => {
        closeModal();
        showAlert('delAlert', 'ok', `Product ID ${delTargetId} deleted.`);
        el('delId').value = '';
        loadProducts();
    })
    .catch(err => { closeModal(); showAlert('delAlert', 'err', err.message || 'Delete failed.'); })
    .finally(() => { btn.disabled = false; btn.innerHTML = 'Delete'; });
}

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); }

function showAlert(id, type, msg) {
    const a = el(id);
    a.className = `alert ${type === 'ok' ? 'a-ok' : 'a-err'} show`;
    a.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        ${type === 'ok'
            ? '<polyline points="20 6 9 17 4 12"/>'
            : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'}
    </svg>${esc(msg)}`;
    setTimeout(() => a.classList.remove('show'), 5000);
}

function fmt(n) { return Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 }); }
function esc(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function el(id) { return document.getElementById(id); }
