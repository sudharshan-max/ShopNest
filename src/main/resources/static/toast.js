/* ============================================================
   SHOPNEST — PREMIUM TOAST NOTIFICATION SYSTEM
   toast.js — Production-grade, fully accessible
   ============================================================ */

(function () {
    'use strict';

    const DURATION = 4000; // ms before auto-dismiss

    const CONFIG = {
        success: {
            icon: '✦',
            title: 'Success',
        },
        error: {
            icon: '✕',
            title: 'Something went wrong',
        },
        info: {
            icon: 'i',
            title: 'Heads up',
        },
        warning: {
            icon: '!',
            title: 'Warning',
        },
    };

    function getContainer() {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            container.setAttribute('aria-live', 'polite');
            container.setAttribute('aria-atomic', 'false');
            container.setAttribute('role', 'region');
            container.setAttribute('aria-label', 'Notifications');
            document.body.appendChild(container);
        }
        return container;
    }

    function removeToast(toast) {
        if (toast.dataset.removing) return;
        toast.dataset.removing = 'true';
        toast.classList.add('removing');
        toast.addEventListener('animationend', () => {
            toast.remove();
        }, { once: true });
    }

    window.showToast = function (message, type = 'success', options = {}) {
        const cfg     = CONFIG[type] || CONFIG.info;
        const title   = options.title   || cfg.title;
        const icon    = options.icon    || cfg.icon;
        const duration = options.duration ?? DURATION;

        const container = getContainer();

        const toast = document.createElement('div');
        toast.className = `sn-toast toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

        toast.innerHTML = `
            <div class="toast-icon-wrap" aria-hidden="true">${icon}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Dismiss notification">✕</button>
            <div class="toast-progress-wrap" aria-hidden="true">
                <div class="toast-progress-bar" style="animation-duration: ${duration}ms"></div>
            </div>
        `;

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            removeToast(toast);
        });

        // Pause progress on hover
        toast.addEventListener('mouseenter', () => {
            const bar = toast.querySelector('.toast-progress-bar');
            if (bar) bar.style.animationPlayState = 'paused';
            clearTimeout(toast._timer);
        });

        toast.addEventListener('mouseleave', () => {
            const bar = toast.querySelector('.toast-progress-bar');
            if (bar) bar.style.animationPlayState = 'running';
            toast._timer = setTimeout(() => removeToast(toast), 800);
        });

        container.appendChild(toast);

        // Auto dismiss
        toast._timer = setTimeout(() => removeToast(toast), duration);

        return toast;
    };

    // ── Read Thymeleaf flash attributes on DOM ready ──
    document.addEventListener('DOMContentLoaded', function () {
        const el = document.getElementById('toastData');
        if (!el) return;

        const success = el.dataset.success;
        const error   = el.dataset.error;
        const info    = el.dataset.info;
        const warning = el.dataset.warning;

        // Stagger multiple toasts
        if (success) setTimeout(() => showToast(success, 'success', { title: 'All done!' }), 100);
        if (error)   setTimeout(() => showToast(error,   'error',   { title: 'Oops!' }), 200);
        if (info)    setTimeout(() => showToast(info,    'info'), 300);
        if (warning) setTimeout(() => showToast(warning, 'warning'), 400);
    });

})();