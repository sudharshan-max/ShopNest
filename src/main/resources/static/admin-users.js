// ══════════════════════════════════════
// ADMIN USERS — admin-users.js
// GET /admin/user/getbyid  (body: {userId})
// PUT /admin/user/modify
// ══════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    // Role warning
    el('mRole').addEventListener('change', function () {
        el('roleWarn').style.display = this.value === 'ADMIN' ? 'block' : 'none';
    });
    // Enter key on search
    el('searchId').addEventListener('keydown', e => { if (e.key === 'Enter') searchUser(); });
});

// ── Search user ──
// NOTE: GET with @RequestBody — using fetch with body
function searchUser() {
    const id = el('searchId').value.trim();
    if (!id) { showAlert('searchAlert', 'err', 'Please enter a user ID.'); return; }

    el('userCard').style.display = 'none';
	// ✅ Fix — path variable, no body
	fetch(`/admin/user/getbyid/${id}`, {
	    method: 'GET',
	    credentials: 'include'
	})
    .then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t); }))
    .then(user => {
        // Populate card
        const name  = user.username || '—';
        const email = user.email    || '—';
        const role  = user.role     || 'CUSTOMER';
        const uid   = user.userId || user.user_id || id;

        el('ucAvatar').textContent = name.charAt(0).toUpperCase();
        el('ucName').textContent   = name;
        el('ucEmail').textContent  = email;
        el('ucId').textContent     = `ID: ${uid}`;

        const badge = el('ucRole');
        badge.textContent = role;
        badge.className   = `badge ${role === 'ADMIN' ? 'b-accent' : 'b-blue'}`;

        el('userCard').style.display = 'block';

        // Auto-fill modify form
        el('mUserId').value = uid;
    })
    .catch(err => showAlert('searchAlert', 'err', err.message || 'User not found.'));
}

// ── Modify user ──
function modifyUser() {
    const userId   = el('mUserId').value.trim();
    const username = el('mUsername').value.trim();
    const email    = el('mEmail').value.trim();
    const role     = el('mRole').value;

    if (!userId) { showAlert('modifyAlert', 'err', 'Please enter a User ID.'); return; }
    if (!username && !email && !role) {
        showAlert('modifyAlert', 'err', 'Provide at least one field to update.');
        return;
    }

    const btn = el('modifyBtn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spin"></div> Saving…';

    const body = { userId: parseInt(userId) };
    if (username) body.username = username;
    if (email)    body.email    = email;
    if (role)     body.role     = role;

    fetch('/admin/user/modify', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
    .then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t); }))
    .then(user => {
        showAlert('modifyAlert', 'ok',
            `"${user.username}" updated.${role ? ' User logged out — must sign in again.' : ''}`);
        clearModify();
    })
    .catch(err => showAlert('modifyAlert', 'err', err.message || 'Update failed.'))
    .finally(() => {
        btn.disabled = false;
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
        </svg> Save Changes`;
    });
}

function clearModify() {
    ['mUserId','mUsername','mEmail'].forEach(id => { el(id).value = ''; });
    el('mRole').value = '';
    el('roleWarn').style.display = 'none';
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
    setTimeout(() => a.classList.remove('show'), 6000);
}

function esc(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function el(id) { return document.getElementById(id); }
