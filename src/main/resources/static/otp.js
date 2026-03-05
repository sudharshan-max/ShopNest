/* ============================================
   SHOPNEST OTP — otp.js
   6-box OTP input with full UX features
   ============================================ */

(function () {
    'use strict';

    const boxes      = Array.from(document.querySelectorAll('.otp-box'));
    const otpHidden  = document.getElementById('otpHidden');
    const verifyBtn  = document.getElementById('verifyBtn');
    const otpHint    = document.getElementById('otpHint');
    const jsAlert    = document.getElementById('jsAlert');
    const jsAlertMsg = document.getElementById('jsAlertMsg');
    const otpRow     = document.getElementById('otpRow');
    const otpForm    = document.getElementById('otpForm');
    const resendBtn  = document.getElementById('resendBtn');
    const countdown  = document.getElementById('countdown');
    const timerText  = document.getElementById('timerText');

	// ── Countdown timer — persists across page reloads ──
	let timerInterval = null;

	function startTimer(freshStart = false) {

	    // If fresh start (first time OTP sent), save start time
	    if (freshStart) {
	        sessionStorage.setItem('otpStartTime', Date.now().toString());
	    }

	    const startTime = parseInt(sessionStorage.getItem('otpStartTime') || Date.now());
	    const elapsed = Math.floor((Date.now() - startTime) / 1000);
	    let timerSeconds = Math.max(600 - elapsed, 0);

	    // If already expired when page loads
	    if (timerSeconds <= 0) {
	        timerText.style.display = 'none';
	        resendBtn.disabled = false;
	        return;
	    }

	    resendBtn.disabled = true;
	    timerText.style.display = 'inline';

	    // Update immediately before interval starts
	    const m = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
	    const s = String(timerSeconds % 60).padStart(2, '0');
	    countdown.textContent = `${m}:${s}`;

	    timerInterval = setInterval(() => {
	        timerSeconds--;
	        const m = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
	        const s = String(timerSeconds % 60).padStart(2, '0');
	        countdown.textContent = `${m}:${s}`;

	        if (timerSeconds <= 0) {
	            clearInterval(timerInterval);
	            timerText.style.display = 'none';
	            resendBtn.disabled = false;
	            sessionStorage.removeItem('otpStartTime'); // clear when expired
	        }
	    }, 1000);
	}

	// Start timer — uses existing time if page reloaded
	startTimer(false);


    // ── Alert helpers ──
    function showAlert(msg) {
        jsAlertMsg.textContent = msg;
        jsAlert.classList.add('show');
    }

    function hideAlert() {
        jsAlert.classList.remove('show');
    }

    // ── Hint helpers ──
    function setHint(msg, type = '') {
        otpHint.textContent = msg;
        otpHint.className = 'otp-hint' + (type ? ` ${type}-hint` : '');
    }

    // ── Get assembled OTP string ──
    function getOtpValue() {
        return boxes.map(b => b.value).join('');
    }

    // ── Update hidden field + button state ──
    function syncState() {
        const val = getOtpValue();
        otpHidden.value = val;
        const allFilled = val.length === 6;
        verifyBtn.disabled = !allFilled;

        if (allFilled) {
            setHint('All digits entered — ready to verify!', 'success');
            boxes.forEach(b => {
                b.classList.remove('error');
                b.classList.add('success');
            });
        }
    }

    // ── Key handling on each box ──
    boxes.forEach((box, i) => {

        // Only allow numeric input
        box.addEventListener('keydown', (e) => {
            const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Enter'];
            if (!allowed.includes(e.key) && !/^[0-9]$/.test(e.key)) {
                e.preventDefault();
            }
        });

        box.addEventListener('input', (e) => {
            const val = e.target.value.replace(/\D/g, '');
            box.value = val ? val[val.length - 1] : '';

            hideAlert();

            if (box.value) {
                box.classList.add('filled');
                box.classList.remove('error', 'success');
                // Auto-advance to next box
                if (i < boxes.length - 1) {
                    boxes[i + 1].focus();
                }
            } else {
                box.classList.remove('filled', 'success');
            }

            syncState();
        });

        // Backspace: clear current and go back
        box.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace') {
                if (!box.value && i > 0) {
                    boxes[i - 1].value = '';
                    boxes[i - 1].classList.remove('filled', 'success');
                    boxes[i - 1].focus();
                    syncState();
                }
            }

            // Arrow navigation
            if (e.key === 'ArrowLeft' && i > 0) {
                e.preventDefault();
                boxes[i - 1].focus();
            }
            if (e.key === 'ArrowRight' && i < boxes.length - 1) {
                e.preventDefault();
                boxes[i + 1].focus();
            }
        });

        // On focus — select existing value
        box.addEventListener('focus', () => {
            box.select();
        });
    });

    // ── Paste support — paste entire OTP at once ──
    boxes[0].addEventListener('paste', (e) => {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData)
            .getData('text')
            .replace(/\D/g, '')
            .slice(0, 6);

        if (!pasted) return;

        pasted.split('').forEach((digit, i) => {
            if (boxes[i]) {
                boxes[i].value = digit;
                boxes[i].classList.add('filled');
                boxes[i].classList.remove('error', 'success');
            }
        });

        // Focus the next empty box or last box
        const nextEmpty = boxes.find(b => !b.value);
        (nextEmpty || boxes[boxes.length - 1]).focus();

        syncState();
    });

    // Also allow paste on any box
    boxes.forEach((box, i) => {
        if (i === 0) return; // already handled above
        box.addEventListener('paste', (e) => {
            e.preventDefault();
            const pasted = (e.clipboardData || window.clipboardData)
                .getData('text')
                .replace(/\D/g, '')
                .slice(0, 6);

            if (!pasted) return;

            // Fill from current position
            pasted.split('').forEach((digit, j) => {
                if (boxes[i + j]) {
                    boxes[i + j].value = digit;
                    boxes[i + j].classList.add('filled');
                }
            });

            const nextEmpty = boxes.find(b => !b.value);
            (nextEmpty || boxes[boxes.length - 1]).focus();
            syncState();
        });
    });

    // ── Form submit ──
    otpForm.addEventListener('submit', (e) => {
        const otp = getOtpValue();

        if (otp.length < 6) {
            e.preventDefault();
            boxes.forEach(b => {
                if (!b.value) b.classList.add('error');
            });
            showAlert('Please enter all 6 digits of your OTP.');
            setHint('All 6 digits are required.', 'error');
            // Focus first empty box
            const firstEmpty = boxes.find(b => !b.value);
            if (firstEmpty) firstEmpty.focus();
            return;
        }

        // Valid — show loading state
        verifyBtn.disabled = true;
        verifyBtn.classList.add('loading');
        otpHidden.value = otp;
        // Form submits naturally to Spring Boot
    });

    // ── Auto-focus first box on page load ──
    boxes[0].focus();

})();