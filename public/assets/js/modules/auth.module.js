// ================= AUTHENTICATION & SESSION MODULE =================
// Responsabilidad: Gestor de autenticación con Supabase Auth, Rate Limiting, 
// Auth Guard DOM y temporizador de inactividad de 10 minutos.

(function() {
    let loginAttempts = 0;
    const MAX_LOGIN_ATTEMPTS = 5;
    const LOCKOUT_DURATION_MS = 2 * 60 * 1000;
    let lockoutUntil = 0;

    const INACTIVITY_LIMIT_MS = 10 * 60 * 1000;
    const WARNING_BEFORE_MS = 60 * 1000;
    let inactivityTimer = null;
    let warningTimer = null;
    let warningVisible = false;
    let lastResetTime = 0;
    const RESET_DEBOUNCE_MS = 1000;

    function getSupabaseClient() {
        if (typeof window !== 'undefined' && window.supabaseClient) return window.supabaseClient;
        if (typeof supabaseClient !== 'undefined' && supabaseClient) return supabaseClient;
        return null;
    }

    function updateAuthStateUI(session) {
        const appShell = document.getElementById('appShell');
        const modalAuth = document.getElementById('modalAuth');

        if (session) {
            console.log("🔓 Sesión válida detectada para:", session.user?.email);
            if (modalAuth) {
                modalAuth.classList.remove('active');
                modalAuth.style.display = 'none';
            }
            if (appShell) {
                appShell.style.setProperty('display', 'flex', 'important');
            }
            if (document.getElementById('displayUserName')) {
                document.getElementById('displayUserName').innerText = session.user?.email || 'Admin';
            }
            AuthModule.initInactivityTimer();
        } else {
            console.log("🔒 Sin sesión válida. Mostrando modal de acceso.");
            if (appShell) {
                appShell.style.display = 'none';
            }
            if (modalAuth) {
                modalAuth.style.display = 'flex';
                modalAuth.classList.add('active');
            }
            AuthModule.clearInactivityTimer();
        }
    }

    function debouncedResetInactivity() {
        const now = Date.now();
        if (now - lastResetTime < RESET_DEBOUNCE_MS) return;
        lastResetTime = now;
        resetInactivityTimer();
    }

    function resetInactivityTimer() {
        if (warningVisible) {
            hideInactivityWarning();
        }
        clearTimeout(inactivityTimer);
        clearTimeout(warningTimer);

        warningTimer = setTimeout(() => {
            showInactivityWarning();
        }, INACTIVITY_LIMIT_MS - WARNING_BEFORE_MS);

        inactivityTimer = setTimeout(async () => {
            hideInactivityWarning();
            await forceLogoutByInactivity();
        }, INACTIVITY_LIMIT_MS);
    }

    function showInactivityWarning() {
        warningVisible = true;
        const banner = document.getElementById('inactivityWarning');
        if (banner) banner.classList.add('active');
    }

    function hideInactivityWarning() {
        warningVisible = false;
        const banner = document.getElementById('inactivityWarning');
        if (banner) banner.classList.remove('active');
    }

    async function forceLogoutByInactivity() {
        AuthModule.clearInactivityTimer();
        const client = getSupabaseClient();
        if (client) {
            await client.auth.signOut();
        }
        if (window.invalidateCache) window.invalidateCache();
        updateAuthStateUI(null);

        if (window.Toast) {
            Toast.warning('⏱️ Sesión cerrada automáticamente por 10 minutos de inactividad.');
        }
    }

    window.AuthModule = {
        updateAuthStateUI,

        async checkSupabaseSession() {
            const client = getSupabaseClient();
            if (!client) {
                updateAuthStateUI(null);
                return false;
            }
            try {
                const { data: { session } } = await client.auth.getSession();
                updateAuthStateUI(session);
                return !!session;
            } catch (err) {
                console.error('Error verificando sesión:', err);
                updateAuthStateUI(null);
                return false;
            }
        },

        async handleSupabaseLogin(e) {
            e.preventDefault();
            const errBox = document.getElementById('authErrorMsg');
            if (errBox) { errBox.style.display = 'none'; errBox.style.color = '#ef4444'; }

            if (Date.now() < lockoutUntil) {
                const secsLeft = Math.ceil((lockoutUntil - Date.now()) / 1000);
                const msg = `🔒 Demasiados intentos. Espere ${secsLeft} segundos.`;
                if (errBox) { errBox.innerText = msg; errBox.style.display = 'block'; }
                if (window.Toast) Toast.error(msg);
                return;
            }

            const email = document.getElementById('authEmail').value.trim();
            const password = document.getElementById('authPassword').value;
            const client = getSupabaseClient();

            if (!client) {
                const msg = "❌ Cliente de Supabase no inicializado.";
                if (errBox) { errBox.innerText = msg; errBox.style.display = 'block'; }
                if (window.Toast) Toast.error(msg);
                return;
            }

            const submitBtn = e.target.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = "⏳ Verificando credenciales...";
            }

            try {
                const { data, error } = await client.auth.signInWithPassword({ email, password });
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = "🔐 Iniciar Sesión en Supabase";
                }

                if (error) {
                    console.error("❌ Error de login Supabase:", error.message);
                    loginAttempts++;
                    if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
                        lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
                        loginAttempts = 0;
                        const msg = '🔒 Demasiados intentos fallidos. Bloqueado por 2 minutos.';
                        if (errBox) { errBox.innerText = msg; errBox.style.display = 'block'; }
                        if (window.Toast) Toast.error(msg);
                    } else {
                        const msg = "❌ Error: " + error.message;
                        if (errBox) { errBox.innerText = msg; errBox.style.display = 'block'; }
                        if (window.Toast) Toast.error(msg);
                    }
                } else if (data && data.session) {
                    console.log("✅ Login exitoso en Supabase:", data.user.email);
                    loginAttempts = 0;
                    lockoutUntil = 0;
                    updateAuthStateUI(data.session);
                    if (window.invalidateCache) window.invalidateCache();
                    if (window.switchView) window.switchView('dashboard');
                    if (window.Toast) Toast.success(`¡Bienvenido de nuevo, ${data.user.email}!`);
                }
            } catch (catchedErr) {
                console.error("❌ Excepción en handleSupabaseLogin:", catchedErr);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = "🔐 Iniciar Sesión en Supabase";
                }
                const msg = "❌ Error: " + catchedErr.message;
                if (errBox) { errBox.innerText = msg; errBox.style.display = 'block'; }
                if (window.Toast) Toast.error(msg);
            }
        },

        async handleSupabaseLogout() {
            this.clearInactivityTimer();
            const client = getSupabaseClient();
            if (client) {
                await client.auth.signOut();
            }
            if (window.invalidateCache) window.invalidateCache();
            updateAuthStateUI(null);
            if (window.Toast) Toast.info('Has cerrado sesión correctamente.');
        },

        initInactivityTimer() {
            const resetEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
            resetEvents.forEach(evt => document.removeEventListener(evt, debouncedResetInactivity));
            resetEvents.forEach(evt => document.addEventListener(evt, debouncedResetInactivity, { passive: true }));
            resetInactivityTimer();
        },

        clearInactivityTimer() {
            clearTimeout(inactivityTimer);
            clearTimeout(warningTimer);
            hideInactivityWarning();
            const resetEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
            resetEvents.forEach(evt => document.removeEventListener(evt, debouncedResetInactivity));
        }
    };
})();
