/* ============================================
   SHOPNEST — email_verification.js
   Client-side validation for email form
   ============================================ */

(function () {
    'use strict';

    const form       = document.getElementById('verifyForm');
    const emailInput = document.getElementById('email');
    const emailGroup = document.getElementById('emailGroup');
    const emailError = document.getElementById('emailError');
    const verifyBtn  = document.getElementById('verifyBtn');
    const jsAlert    = document.getElementById('jsAlert');
    const jsAlertMsg = document.getElementById('jsAlertMsg');

    /* ── Helpers ── */
    function setValid() {
        emailGroup.classList.remove('invalid');
        emailGroup.classList.add('valid');
        emailError.textContent = '';
        emailError.classList.remove('show');
        const status = emailGroup.querySelector('.field-status');
        if (status) status.textContent = '✓';
    }

    function setInvalid(message) {
        emailGroup.classList.remove('valid');
        emailGroup.classList.add('invalid');
        emailError.textContent = message;
        emailError.classList.add('show');
        const status = emailGroup.querySelector('.field-status');
        if (status) status.textContent = '✗';
    }

    function clearState() {
        emailGroup.classList.remove('valid', 'invalid');
        emailError.textContent = '';
        emailError.classList.remove('show');
        const status = emailGroup.querySelector('.field-status');
        if (status) status.textContent = '';
    }

    function showAlert(message) {
        jsAlertMsg.textContent = message;
        jsAlert.style.display = 'flex';
        jsAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function hideAlert() {
        jsAlert.style.display = 'none';
    }

    /* ── Email validation ── */
    function validateEmail(showError = true) {
        const val = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (val === '') {
            if (showError) setInvalid('Email address is required.');
            else clearState();
            return false;
        }

        if (!emailRegex.test(val)) {
            setInvalid('Please enter a valid email address.');
            return false;
        }

        setValid();
        return true;
    }

    /* ── Real-time: validate on blur ── */
    emailInput.addEventListener('blur', () => validateEmail(true));

    /* ── Clear error as user types ── */
    emailInput.addEventListener('input', () => {
        if (emailGroup.classList.contains('invalid')) validateEmail(true);
        hideAlert();
    });

    /* ── Submit ── */
    form.addEventListener('submit', function (e) {
        const isValid = validateEmail(true);

        if (!isValid) {
            e.preventDefault();
            emailInput.focus();
            return;
        }

        // Show loading state
        verifyBtn.disabled = true;
        verifyBtn.classList.add('loading');

        // Form submits naturally to Spring Boot controller
        // Loading state gives user feedback while server processes
    });

})();