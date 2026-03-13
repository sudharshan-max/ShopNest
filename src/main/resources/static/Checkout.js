// ═══════════════════════════════════════════════
// SHOPNEST CHECKOUT — checkout.js
// Full Razorpay frontend integration
// ═══════════════════════════════════════════════

let cartData    = [];
let grandTotal  = 0;
let razorpayKey = '';
let username    = '';

document.addEventListener('DOMContentLoaded', () => {
    username    = document.getElementById('userData')?.dataset.username || '';
    razorpayKey = document.getElementById('rzpData')?.dataset.key       || '';
    loadCart();
});

// ═══════════════════════════════════════════════
// STEP 1 — Load cart items from API
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

            // Empty cart → redirect back
            if (cartData.length === 0) {
                window.location.href = '/cart';
                return;
            }

            renderItems();
            renderPricing();
            enablePayButton();
        })
        .catch(err => {
            console.error('Cart load failed:', err);
            showError('Failed to load cart. Please go back and try again.');
        });
}

// ═══════════════════════════════════════════════
// RENDER ORDER ITEMS
// ═══════════════════════════════════════════════
function renderItems() {
    const list = document.getElementById('itemsList');

    list.innerHTML = cartData.map((item, i) => {
        const imgHtml = item.image_url && item.image_url !== 'default-image-url'
            ? `<img src="${esc(item.image_url)}"
                    alt="${esc(item.name)}"
                    class="order-item-img"
                    onerror="this.outerHTML='<div class=\\'order-item-no-img\\'><span>🛍</span></div>'">`
            : `<div class="order-item-no-img"><span>🛍</span></div>`;

        return `
            <div class="order-item" style="animation-delay:${i * 0.05}s">
                ${imgHtml}
                <div>
                    <div class="order-item-name" title="${esc(item.name)}">${esc(item.name)}</div>
                    <div class="order-item-meta">
                        <span>Qty: ${item.quantity}</span>
                        <span>•</span>
                        <span>₹${fmt(item.price_per_unit)} each</span>
                    </div>
                </div>
                <div class="order-item-price">₹${fmt(item.total_price)}</div>
            </div>`;
    }).join('');
}

// ═══════════════════════════════════════════════
// RENDER PRICE BREAKDOWN
// Subtotal + Shipping + Grand Total
// ═══════════════════════════════════════════════
function renderPricing() {
    const subtotal    = cartData.reduce((sum, i) => sum + i.total_price, 0);
    const shipping    = subtotal >= 499 ? 0 : 49;
    grandTotal        = subtotal + shipping;

    document.getElementById('subtotalVal').textContent = `₹${fmt(subtotal)}`;

    const shippingEl = document.getElementById('shippingVal');
    const freeNote   = document.getElementById('freeNote');

    if (shipping === 0) {
        shippingEl.textContent  = 'FREE';
        shippingEl.classList.add('free');
        if (freeNote) freeNote.style.display = 'inline';
    } else {
        shippingEl.textContent = `₹${shipping}`;
        shippingEl.classList.remove('free');
    }

    document.getElementById('totalVal').textContent = `₹${fmt(grandTotal)}`;
}

// ═══════════════════════════════════════════════
// Enable pay button after cart loads
// ═══════════════════════════════════════════════
function enablePayButton() {
    const btn = document.getElementById('payBtn');
    btn.disabled = false;
    btn.innerHTML = `
        <span id="payBtnContent">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                 style="width:18px;height:18px">
                <rect x="1" y="4" width="22" height="16" rx="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            Pay ₹${fmt(grandTotal)}
        </span>`;
}

// ═══════════════════════════════════════════════
// STEP 2 — Initiate payment
// Calls /api/payment/create → opens Razorpay popup
// ═══════════════════════════════════════════════
function initiatePayment() {
    hideError();

    const btn = document.getElementById('payBtn');
    btn.disabled = true;
    setPayBtnLoading('Creating order…');

    const cartItems = cartData.map(item => ({
        productId: item.product_id,
        quantity:  item.quantity,
        price:     item.price_per_unit
    }));

    // Call backend to create Razorpay order
    fetch('/api/payment/create', {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            totalAmount: grandTotal.toFixed(2),
            cartItems:   cartItems
        })
    })
    .then(res => {
        if (res.status === 401) { window.location.href = '/api/users/login'; return null; }
        if (!res.ok) return res.text().then(t => { throw new Error(t || `HTTP ${res.status}`); });
        return res.text();
    })
    .then(razorpayOrderId => {
        if (!razorpayOrderId) return;
        openRazorpayPopup(razorpayOrderId);
    })
    .catch(err => {
        console.error('Create order failed:', err);
        showError('Failed to create order. Please try again.');
        resetPayButton();
    });
}

// ═══════════════════════════════════════════════
// STEP 3 — Open Razorpay popup
// ═══════════════════════════════════════════════
function openRazorpayPopup(razorpayOrderId) {
    setPayBtnLoading('Opening payment…');

    const options = {
        key:         razorpayKey,
        amount:      Math.round(grandTotal * 100), // paise
        currency:    'INR',
        name:        'ShopNest',
        description: 'Order Payment',
        image:       '', // add logo URL if available
        order_id:    razorpayOrderId,

        prefill: {
            name: username
        },

        theme: {
            color: '#43c49e'
        },

        // ✅ STEP 4 — On payment success
        handler: function(razorpayResponse) {
            verifyPayment(
                razorpayResponse.razorpay_order_id,
                razorpayResponse.razorpay_payment_id,
                razorpayResponse.razorpay_signature
            );
        },

        // User closed popup without paying
        modal: {
            ondismiss: function() {
                resetPayButton();
                showError('Payment cancelled. Click "Pay" to try again.');
            }
        }
    };

    const rzp = new Razorpay(options);

    // ✅ Error handling — payment failure inside popup
    rzp.on('payment.failed', function(response) {
        console.error('Razorpay payment failed:', response.error);
        resetPayButton();
        showFailureOverlay(
            response.error.description || 'Payment failed. Please try again.'
        );
    });

    rzp.open();
}

// ═══════════════════════════════════════════════
// STEP 4 — Verify payment with backend
// Calls /api/payment/verify
// ═══════════════════════════════════════════════
function verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    setPayBtnLoading('Verifying payment…');

    fetch('/api/payment/verify', {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            razorpayOrderId:   razorpayOrderId,
            razorpayPaymentId: razorpayPaymentId,
            razorpaySignature: razorpaySignature
        })
    })
    .then(res => {
        if (!res.ok) return res.text().then(t => { throw new Error(t || `HTTP ${res.status}`); });
        return res.text();
    })
    .then(() => {
        // ✅ Payment verified — show success
        showSuccessOverlay(razorpayOrderId);
    })
    .catch(err => {
        console.error('Verification failed:', err);
        resetPayButton();
        showFailureOverlay('Payment verification failed. Contact support with Order ID: ' + razorpayOrderId);
    });
}

// ═══════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════
function setPayBtnLoading(text) {
    document.getElementById('payBtn').innerHTML = `
        <span id="payBtnContent" style="display:flex;align-items:center;gap:9px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                 style="width:18px;height:18px;animation:spin .6s linear infinite">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            ${text}
        </span>`;
}

function resetPayButton() {
    const btn    = document.getElementById('payBtn');
    btn.disabled = false;
    btn.innerHTML = `
        <span id="payBtnContent" style="display:flex;align-items:center;gap:9px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                 style="width:18px;height:18px">
                <rect x="1" y="4" width="22" height="16" rx="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            Pay ₹${fmt(grandTotal)}
        </span>`;
}

function showError(msg) {
    const box = document.getElementById('errorBox');
    const txt = document.getElementById('errorMsg');
    if (box && txt) { txt.textContent = msg; box.style.display = 'flex'; }
}

function hideError() {
    const box = document.getElementById('errorBox');
    if (box) box.style.display = 'none';
}

function showSuccessOverlay(orderId) {
    const el = document.getElementById('successOrderId');
    if (el) el.textContent = `Order ID: ${orderId}`;
    document.getElementById('successOverlay').classList.add('show');
}

function showFailureOverlay(msg) {
    const el = document.getElementById('failureMsg');
    if (el) el.textContent = msg;
    document.getElementById('failureOverlay').classList.add('show');
}

function closeFailure() {
    document.getElementById('failureOverlay').classList.remove('show');
}

// ═══════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════
function esc(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fmt(price) {
    return Number(price).toLocaleString('en-IN', {
        minimumFractionDigits: 0, maximumFractionDigits: 2
    });
}