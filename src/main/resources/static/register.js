/* ============================================
   SHOPNEST REGISTER — register.js
   Animated canvas + full validation
   ============================================ */

/* ── CANVAS PARTICLE BACKGROUND ── */
(function initCanvas() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, particles = [];

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function randomBetween(a, b) { return a + Math.random() * (b - a); }

    function createParticle() {
        return {
            x:    randomBetween(0, W),
            y:    randomBetween(0, H),
            r:    randomBetween(1, 3.5),
            dx:   randomBetween(-0.3, 0.3),
            dy:   randomBetween(-0.5, -0.1),
            alpha: randomBetween(0.05, 0.25),
            color: Math.random() > 0.5 ? '67,196,158' : '44,83,100'
        };
    }

    function init() {
        resize();
        particles = Array.from({ length: 80 }, createParticle);
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
            ctx.fill();

            p.x += p.dx;
            p.y += p.dy;

            // Reset when off screen
            if (p.y < -10) {
                p.y = H + 10;
                p.x = randomBetween(0, W);
            }
            if (p.x < -10 || p.x > W + 10) {
                p.x = randomBetween(0, W);
                p.y = randomBetween(0, H);
            }
        });
        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    init();
    draw();
})();


/* ── FORM VALIDATION ── */
(function initForm() {
    'use strict';

    const form            = document.getElementById('registerForm');
    const usernameInput   = document.getElementById('username');
    const emailInput      = document.getElementById('email');
    const passwordInput   = document.getElementById('password');
    const confirmInput    = document.getElementById('confirmPassword');
    const termsInput      = document.getElementById('terms');
    const submitBtn       = document.getElementById('submitBtn');
    const strengthFill    = document.getElementById('strengthFill');
    const strengthLabel   = document.getElementById('strengthLabel');

    /* ── Helpers ── */
    function getGroup(input) { return input.closest('.field-group'); }

    function setValid(input) {
        const g = getGroup(input);
        g.classList.remove('invalid');
        g.classList.add('valid');
        const badge = g.querySelector('.field-badge');
        const err   = g.querySelector('.field-error');
        if (badge) badge.textContent = '✓';
        if (err)   { err.textContent = ''; err.classList.remove('show'); }
    }

    function setInvalid(input, msg) {
        const g = getGroup(input);
        g.classList.remove('valid');
        g.classList.add('invalid');
        const badge = g.querySelector('.field-badge');
        const err   = g.querySelector('.field-error');
        if (badge) badge.textContent = '✗';
        if (err)   { err.textContent = msg; err.classList.add('show'); }
    }

    function clearField(input) {
        const g = getGroup(input);
        g.classList.remove('valid', 'invalid');
        const badge = g.querySelector('.field-badge');
        const err   = g.querySelector('.field-error');
        if (badge) badge.textContent = '';
        if (err)   { err.textContent = ''; err.classList.remove('show'); }
    }

    /* ── Individual validators ── */
    function validateUsername(show = true) {
        const v = usernameInput.value.trim();
        if (!v)              { show && setInvalid(usernameInput, 'Username is required.'); return false; }
        if (v.length < 5)    { setInvalid(usernameInput, 'At least 5 characters required.'); return false; }
        if (v.length > 50)   { setInvalid(usernameInput, 'Maximum 50 characters allowed.'); return false; }
        if (!/^[a-zA-Z0-9._]+$/.test(v)) {
            setInvalid(usernameInput, 'Only letters, numbers, dots and underscores.');
            return false;
        }
        setValid(usernameInput);
        return true;
    }

    function validateEmail(show = true) {
        const v = emailInput.value.trim();
        if (!v) { show && setInvalid(emailInput, 'Email is required.'); return false; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
            setInvalid(emailInput, 'Enter a valid email address.');
            return false;
        }
        setValid(emailInput);
        return true;
    }

    function validatePassword(show = true) {
        const v = passwordInput.value;
        if (!v) { show && setInvalid(passwordInput, 'Password is required.'); return false; }
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/.test(v)) {
            setInvalid(passwordInput,
                'Min 8 chars with uppercase, lowercase, number & special char.');
            return false;
        }
        setValid(passwordInput);
        return true;
    }

    function validateConfirm(show = true) {
        const v = confirmInput.value;
        if (!v) { show && setInvalid(confirmInput, 'Please confirm your password.'); return false; }
        if (v !== passwordInput.value) {
            setInvalid(confirmInput, 'Passwords do not match.');
            return false;
        }
        setValid(confirmInput);
        return true;
    }

    function validateTerms() {
        const err = document.getElementById('termsError');
        if (!termsInput.checked) {
            err.textContent = 'Please accept the terms to continue.';
            err.classList.add('show');
            return false;
        }
        err.textContent = '';
        err.classList.remove('show');
        return true;
    }

    /* ── Password strength ── */
    function updateStrength() {
        const v = passwordInput.value;
        let score = 0;
        if (v.length >= 8)              score++;
        if (v.length >= 12)             score++;
        if (/[A-Z]/.test(v))            score++;
        if (/[a-z]/.test(v))            score++;
        if (/[0-9]/.test(v))            score++;
        if (/[@#$%^&+=!]/.test(v))      score++;

        const pct     = Math.min((score / 6) * 100, 100);
        const configs = [
            { label: '',        color: 'transparent' },
            { label: 'Weak',    color: '#e53935' },
            { label: 'Weak',    color: '#e53935' },
            { label: 'Fair',    color: '#ff9800' },
            { label: 'Good',    color: '#ffc107' },
            { label: 'Strong',  color: '#4caf50' },
            { label: 'Strong',  color: '#2e7d52' },
        ];
        const cfg = configs[score] || configs[0];

        strengthFill.style.width      = pct + '%';
        strengthFill.style.background = cfg.color;
        strengthLabel.textContent     = cfg.label;
        strengthLabel.style.color     = cfg.color;
    }

    /* ── Password toggle ── */
    window.togglePassword = function(id, btn) {
        const input = document.getElementById(id);
        const isText = input.type === 'text';
        input.type = isText ? 'password' : 'text';
        // Swap icon
        btn.innerHTML = isText
            ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                 <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                 <circle cx="12" cy="12" r="3"/>
               </svg>`
            : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                 <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                 <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                 <line x1="1" y1="1" x2="23" y2="23"/>
               </svg>`;
    };

    /* ── Real-time events ── */
    usernameInput.addEventListener('blur',  () => validateUsername(true));
    emailInput.addEventListener('blur',     () => validateEmail(true));
    passwordInput.addEventListener('blur',  () => validatePassword(true));
    confirmInput.addEventListener('blur',   () => validateConfirm(true));

    usernameInput.addEventListener('input', () => {
        if (getGroup(usernameInput).classList.contains('invalid')) validateUsername(true);
    });

    emailInput.addEventListener('input', () => {
        if (getGroup(emailInput).classList.contains('invalid')) validateEmail(true);
    });

    passwordInput.addEventListener('input', () => {
        updateStrength();
        if (getGroup(passwordInput).classList.contains('invalid')) validatePassword(true);
        if (confirmInput.value) validateConfirm(true);
    });

    confirmInput.addEventListener('input', () => {
        if (getGroup(confirmInput).classList.contains('invalid')) validateConfirm(true);
    });

    /* ── Submit ── */
    form.addEventListener('submit', function (e) {
        const u = validateUsername(true);
        const em = validateEmail(true);
        const p = validatePassword(true);
        const c = validateConfirm(true);
        const t = validateTerms();

        if (!u || !em || !p || !c || !t) {
            e.preventDefault();
            // Focus first invalid field
            [usernameInput, emailInput, passwordInput, confirmInput].find(inp =>
                getGroup(inp).classList.contains('invalid')
            )?.focus();
            return;
        }

        // Valid — show loading
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
    });

})();