/* ============================================
   SHOPNEST LOGIN — login.js
   Client-side validation + UX interactions
   ============================================ */

(function () {
    'use strict';

    /* ── DOM refs ── */
    const form          = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const usernameGroup = document.getElementById('usernameGroup');
    const passwordGroup = document.getElementById('passwordGroup');
    const usernameError = document.getElementById('usernameError');
    const passwordError = document.getElementById('passwordError');
    const submitBtn     = document.getElementById('submitBtn');
    const eyeBtn        = document.getElementById('eyeBtn');
    const formAlert     = document.getElementById('formAlert');
    const alertMsg      = document.getElementById('alertMsg');

    /* ── Eye / password toggle ── */
    eyeBtn.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';

        eyeBtn.innerHTML = isPassword
            ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                 <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                 <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                 <line x1="1" y1="1" x2="23" y2="23"/>
               </svg>`
            : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                 <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                 <circle cx="12" cy="12" r="3"/>
               </svg>`;

        passwordInput.focus();
    });

    /* ── Validation helpers ── */
    function setValid(group, errorEl, statusEl) {
        group.classList.remove('invalid');
        group.classList.add('valid');
        errorEl.textContent = '';
        errorEl.classList.remove('show');
        if (statusEl) statusEl.textContent = '✓';
    }

    function setInvalid(group, errorEl, message, statusEl) {
        group.classList.remove('valid');
        group.classList.add('invalid');
        errorEl.textContent = message;
        errorEl.classList.add('show');
        if (statusEl) statusEl.textContent = '✗';
    }

    function clearState(group, errorEl, statusEl) {
        group.classList.remove('valid', 'invalid');
        errorEl.textContent = '';
        errorEl.classList.remove('show');
        if (statusEl) statusEl.textContent = '';
    }

    /* ── Username validation ── */
    function validateUsername(showError = true) {
        const val        = usernameInput.value.trim();
        const statusEl   = usernameGroup.querySelector('.field-status');

        if (val === '') {
            if (showError) setInvalid(usernameGroup, usernameError, 'Username is required.', statusEl);
            else clearState(usernameGroup, usernameError, statusEl);
            return false;
        }

        if (val.length < 3) {
            setInvalid(usernameGroup, usernameError, 'Username must be at least 3 characters.', statusEl);
            return false;
        }

        if (val.length > 30) {
            setInvalid(usernameGroup, usernameError, 'Username must be under 30 characters.', statusEl);
            return false;
        }

        if (!/^[a-zA-Z0-9._]+$/.test(val)) {
            setInvalid(usernameGroup, usernameError, 'Only letters, numbers, dots and underscores allowed.', statusEl);
            return false;
        }

        setValid(usernameGroup, usernameError, statusEl);
        return true;
    }

    /* ── Password validation ── */
    function validatePassword(showError = true) {
        const val      = passwordInput.value;
        const statusEl = passwordGroup.querySelector('.field-status');

        if (val === '') {
            if (showError) setInvalid(passwordGroup, passwordError, 'Password is required.', statusEl);
            else clearState(passwordGroup, passwordError, statusEl);
            return false;
        }

        if (val.length < 6) {
            setInvalid(passwordGroup, passwordError, 'Password must be at least 6 characters.', statusEl);
            return false;
        }

        setValid(passwordGroup, passwordError, statusEl);
        return true;
    }

    /* ── Real-time validation (on blur) ── */
    usernameInput.addEventListener('blur',  () => validateUsername(true));
    passwordInput.addEventListener('blur',  () => validatePassword(true));

    /* ── Clear error as user types ── */
    usernameInput.addEventListener('input', () => {
        if (usernameGroup.classList.contains('invalid')) validateUsername(true);
        hideAlert();
    });

    passwordInput.addEventListener('input', () => {
        if (passwordGroup.classList.contains('invalid')) validatePassword(true);
        hideAlert();
    });

    /* ── Alert helpers ── */
    function showAlert(message) {
        alertMsg.textContent = message;
        formAlert.classList.add('show');
        formAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function hideAlert() {
        formAlert.classList.remove('show');
    }
	

    /* ── Submit handler ── */
 /*  form.addEventListener('submit', function (e) {
        e.preventDefault();

        const usernameOk = validateUsername(true);
        const passwordOk = validatePassword(true);

        if (!usernameOk || !passwordOk) {
            // Focus first invalid field
            if (!usernameOk) usernameInput.focus();
            else passwordInput.focus();
            return;
        }

        /* ── Loading state ── */
        /*submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        hideAlert();

        /*
         * TODO: Replace this simulation with your actual form submission.
         *
         * For Thymeleaf (Spring Boot):
         *   Remove e.preventDefault() and let the form submit naturally.
         *   The JS validation above will still run — it only calls
         *   e.preventDefault() when there are errors.
         *
         * For fetch/AJAX:
         *   Replace the setTimeout below with your fetch() call.
         */
        /*setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            // Simulating a failed login to show the error alert UI:
            showAlert('Invalid username or password. Please try again.');
        }, 1500);

    }); */
	
	/* ── Submit handler ── */
	form.addEventListener('submit', function (e) {

	    const usernameOk = validateUsername(true);
	    const passwordOk = validatePassword(true);

	    if (!usernameOk || !passwordOk) {
	        e.preventDefault(); // ❗ only prevent when invalid

	        if (!usernameOk) usernameInput.focus();
	        else passwordInput.focus();

	        return;
	    }

	    /* Loading state */
	    submitBtn.disabled = true;
	    submitBtn.classList.add('loading');

	    // ✅ DO NOT prevent default here
	    // Let Spring Boot handle authentication
	});
	

    /* ── Keyboard accessibility for forgot link ── */
    const forgotLink = document.querySelector('.forgot-link');
    if (forgotLink) {
        forgotLink.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                forgotLink.click();
            }
        });
    }

})();