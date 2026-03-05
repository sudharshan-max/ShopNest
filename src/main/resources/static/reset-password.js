/* ============================================
   SHOPNEST RESET PASSWORD — reset_password.js
   ============================================ */

(function () {
    'use strict';

    const passwordInput = document.getElementById('newPassword');
    const confirmInput  = document.getElementById('confirmPassword');
    const passwordGroup = document.getElementById('passwordGroup');
    const confirmGroup  = document.getElementById('confirmGroup');
    const passwordError = document.getElementById('passwordError');
    const confirmError  = document.getElementById('confirmError');
    const resetBtn      = document.getElementById('resetBtn');
    const resetForm     = document.getElementById('resetForm');
    const jsAlert       = document.getElementById('jsAlert');
    const jsAlertMsg    = document.getElementById('jsAlertMsg');
    const matchBadge    = document.getElementById('matchBadge');
    const strengthLabel = document.getElementById('strengthLabel');
    const eyeBtn1       = document.getElementById('eyeBtn1');
    const eyeBtn2       = document.getElementById('eyeBtn2');

    const segs = [
        document.getElementById('seg1'),
        document.getElementById('seg2'),
        document.getElementById('seg3'),
        document.getElementById('seg4'),
    ];

    const requirements = {
        'req-length':  v => v.length >= 8,
        'req-upper':   v => /[A-Z]/.test(v),
        'req-lower':   v => /[a-z]/.test(v),
        'req-number':  v => /[0-9]/.test(v),
        'req-special': v => /[@#$%^&+=!]/.test(v),
    };

    // ── Alert helpers ──
    function showAlert(msg) {
        jsAlertMsg.textContent = msg;
        jsAlert.classList.add('show');
    }
    function hideAlert() { jsAlert.classList.remove('show'); }

    // ── Field state helpers ──
    function setValid(group, errorEl) {
        group.classList.remove('invalid');
        group.classList.add('valid');
        errorEl.textContent = '';
        errorEl.classList.remove('show');
    }

    function setInvalid(group, errorEl, msg) {
        group.classList.remove('valid');
        group.classList.add('invalid');
        errorEl.textContent = msg;
        errorEl.classList.add('show');
    }

    function clearState(group, errorEl) {
        group.classList.remove('valid', 'invalid');
        errorEl.textContent = '';
        errorEl.classList.remove('show');
    }

    // ── Eye toggle ──
    function setupEye(btn, input) {
        btn.addEventListener('click', () => {
            const isPass = input.type === 'password';
            input.type = isPass ? 'text' : 'password';
            btn.innerHTML = isPass
                ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                     <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                     <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                     <line x1="1" y1="1" x2="23" y2="23"/>
                   </svg>`
                : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                     <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                     <circle cx="12" cy="12" r="3"/>
                   </svg>`;
            input.focus();
        });
    }

    setupEye(eyeBtn1, passwordInput);
    setupEye(eyeBtn2, confirmInput);

    // ── Requirements checklist ──
    function updateRequirements(val) {
        let metCount = 0;
        Object.entries(requirements).forEach(([id, test]) => {
            const el = document.getElementById(id);
            const met = test(val);
            el.classList.toggle('met', met);
            if (met) metCount++;
        });
        return metCount;
    }

    // ── Strength meter ──
    const strengthConfig = [
        { label: '',        color: 'transparent',     segs: 0 },
        { label: 'Weak',    color: '#e53935',          segs: 1 },
        { label: 'Weak',    color: '#e53935',          segs: 1 },
        { label: 'Fair',    color: '#f59e0b',          segs: 2 },
        { label: 'Good',    color: '#3b82f6',          segs: 3 },
        { label: 'Strong',  color: '#2e7d52',          segs: 4 },
    ];

    function updateStrength(val) {
        const metCount = updateRequirements(val);
        const score = Math.min(metCount, 5);
        const cfg = strengthConfig[score] || strengthConfig[0];

        segs.forEach((seg, i) => {
            seg.style.background = i < cfg.segs ? cfg.color : 'var(--border)';
        });

        strengthLabel.textContent = cfg.label;
        strengthLabel.style.color = cfg.color;
    }

    // ── Password validation ──
    function validatePassword(showError = true) {
        const v = passwordInput.value;
        if (!v) {
            if (showError) setInvalid(passwordGroup, passwordError, 'Password is required.');
            else clearState(passwordGroup, passwordError);
            return false;
        }
        const allMet = Object.values(requirements).every(test => test(v));
        if (!allMet) {
            if (showError) setInvalid(passwordGroup, passwordError, 'Password does not meet all requirements.');
            return false;
        }
        setValid(passwordGroup, passwordError);
        return true;
    }

    // ── Confirm password validation ──
    function validateConfirm(showError = true) {
        const v = confirmInput.value;
        if (!v) {
            if (showError) setInvalid(confirmGroup, confirmError, 'Please confirm your password.');
            else clearState(confirmGroup, confirmError);
            matchBadge.textContent = '';
            matchBadge.classList.remove('show');
            return false;
        }
        if (v !== passwordInput.value) {
            setInvalid(confirmGroup, confirmError, 'Passwords do not match.');
            matchBadge.textContent = '✗';
            matchBadge.style.color = 'var(--danger)';
            matchBadge.classList.add('show');
            return false;
        }
        setValid(confirmGroup, confirmError);
        matchBadge.textContent = '✓';
        matchBadge.style.color = 'var(--success)';
        matchBadge.classList.add('show');
        return true;
    }

    // ── Real-time events ──
    passwordInput.addEventListener('input', () => {
        const v = passwordInput.value;
        updateStrength(v);
        hideAlert();
        if (v) validatePassword(true);
        else clearState(passwordGroup, passwordError);
        // Re-validate confirm if already typed
        if (confirmInput.value) validateConfirm(true);
    });

    passwordInput.addEventListener('blur', () => validatePassword(true));

    confirmInput.addEventListener('input', () => {
        hideAlert();
        if (confirmInput.value) validateConfirm(true);
        else {
            clearState(confirmGroup, confirmError);
            matchBadge.classList.remove('show');
        }
    });

    confirmInput.addEventListener('blur', () => validateConfirm(true));

    // ── Form submit ──
    resetForm.addEventListener('submit', (e) => {
        const pOk = validatePassword(true);
        const cOk = validateConfirm(true);

        if (!pOk || !cOk) {
            e.preventDefault();
            if (!pOk) passwordInput.focus();
            else confirmInput.focus();
            showAlert('Please fix the errors above before submitting.');
            return;
        }

        // Valid — show loading
        resetBtn.disabled = true;
        resetBtn.classList.add('loading');
        // Form submits naturally to Spring Boot
    });

})();