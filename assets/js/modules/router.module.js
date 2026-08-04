// ================= ROUTER & VIEW NAVIGATION MODULE =================
// Responsabilidad: Transiciones de vistas con UI optimista, actualización de títulos
// y control de navegación responsive en móviles.

(function() {
    window.RouterModule = {
        async switchView(viewId, element = null) {
            console.log("🔄 Cambiando a módulo:", viewId);

            // PASO 1: Cambio visual inmediato (UI optimista — 0ms latencia)
            document.querySelectorAll('.view-section').forEach(sec => {
                sec.classList.remove('active');
                sec.style.display = 'none';
            });

            document.querySelectorAll('.nav-menu li a').forEach(a => a.classList.remove('active'));

            const targetView = document.getElementById('view-' + viewId);
            if (targetView) {
                targetView.classList.add('active');
                targetView.style.display = 'block';
            }

            const navLink = element || document.querySelector(`.nav-menu li a[onclick*="${viewId}"]`);
            if (navLink) navLink.classList.add('active');

            const titles = {
                dashboard: 'Métricas Generales & Resumen',
                inventario: 'Inventario Unificado de Activos',
                crm: 'Gestión Integral CRM & Leads',
                agentes: 'Administración de Agentes'
            };
            const titleEl = document.getElementById('pageTitle');
            if (titleEl && titles[viewId]) titleEl.innerText = titles[viewId];

            // PASO 2: Fetch de datos en PARALELO (background, con caché)
            try {
                if (viewId === 'dashboard') {
                    const [props, clients, interactions] = await Promise.all([
                        window.cachedFetch('properties', () => api.fetchProperties()),
                        window.cachedFetch('clients', () => api.fetchClients()),
                        window.cachedFetch('interactions', () => api.fetchInteractions())
                    ]);
                    window.globalState.properties = props;
                    window.globalState.clients = clients;
                    window.globalState.interactions = interactions;
                } else if (viewId === 'inventario') {
                    const [props, agents] = await Promise.all([
                        window.cachedFetch('properties', () => api.fetchProperties()),
                        window.cachedFetch('agents', () => api.fetchAgents())
                    ]);
                    window.globalState.properties = props;
                    window.globalState.agents = agents;
                } else if (viewId === 'crm') {
                    window.globalState.clients = await window.cachedFetch('clients', () => api.fetchClients());
                } else if (viewId === 'agentes') {
                    window.globalState.agents = await window.cachedFetch('agents', () => api.fetchAgents());
                }
            } catch (err) {
                console.error("Error al cargar datos desde Supabase:", err);
                if (window.Toast) Toast.error("Error de red al actualizar datos desde Supabase.");
            }

            // PASO 3: Renderizar UI con datos actualizados
            try {
                if (viewId === 'dashboard' && window.RenderersModule) window.RenderersModule.renderDashboard();
                if (viewId === 'inventario' && window.RenderersModule) window.RenderersModule.renderProperties();
                if (viewId === 'crm' && window.RenderersModule) window.RenderersModule.renderClients();
                if (viewId === 'agentes' && window.RenderersModule) window.RenderersModule.renderAgents();
            } catch (e) {
                console.warn(`Error renderizando UI ${viewId}:`, e);
            }

            // PASO 4: Cerrar sidebar móvil si aplica
            this.closeSidebarMenu();
        },

        toggleSidebarMenu() {
            const sidebar = document.getElementById('appSidebar');
            const backdrop = document.getElementById('sidebarBackdrop');
            if (sidebar) sidebar.classList.toggle('active');
            if (backdrop) backdrop.classList.toggle('active');
        },

        closeSidebarMenu() {
            const sidebar = document.getElementById('appSidebar');
            const backdrop = document.getElementById('sidebarBackdrop');
            if (sidebar) sidebar.classList.remove('active');
            if (backdrop) backdrop.classList.remove('active');
        }
    };
})();
