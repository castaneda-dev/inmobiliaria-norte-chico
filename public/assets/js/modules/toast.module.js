// ================= TOAST NOTIFICATION MODULE =================
// Responsabilidad: Presentar notificaciones flotantes (Success, Error, Info, Warning)
// aisladas del DOM principal con animaciones y auto-dismiss.

(function() {
    let container = null;

    function getOrCreateContainer() {
        if (!container) {
            container = document.getElementById('toastContainer');
        }
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    window.Toast = {
        show(message, type = 'info', duration = 3500) {
            const parent = getOrCreateContainer();
            
            const toast = document.createElement('div');
            toast.className = `toast-item toast-${type}`;
            
            const icons = {
                success: '✅',
                error: '❌',
                warning: '⚠️',
                info: 'ℹ️'
            };

            const icon = icons[type] || 'ℹ️';

            toast.innerHTML = `
                <span class="toast-icon">${icon}</span>
                <span class="toast-message">${escapeHTML(message)}</span>
                <button type="button" class="toast-close" onclick="this.parentElement.remove()">✕</button>
            `;

            parent.appendChild(toast);

            // Animación de entrada
            requestAnimationFrame(() => {
                toast.classList.add('show');
            });

            // Auto-dismiss
            if (duration > 0) {
                setTimeout(() => {
                    toast.classList.remove('show');
                    toast.addEventListener('transitionend', () => {
                        if (toast.parentElement) toast.remove();
                    });
                }, duration);
            }
        },

        success(message, duration = 3500) {
            this.show(message, 'success', duration);
        },

        error(message, duration = 4000) {
            this.show(message, 'error', duration);
        },

        warning(message, duration = 4000) {
            this.show(message, 'warning', duration);
        },

        info(message, duration = 3500) {
            this.show(message, 'info', duration);
        }
    };
})();
