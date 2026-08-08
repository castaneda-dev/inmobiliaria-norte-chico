// ================= MAIN APP ORCHESTRATOR =================
// Responsabilidad: Orquestar módulos (Toast, AuthModule, RouterModule, RenderersModule, ModalsModule)
// y mantener el estado global y caché temporal en memoria.

// ================= GLOBAL STATE =================
window.globalState = {
    properties: [],
    clients: [],
    agents: [],
    interactions: []
};

// ================= DATA CACHE (TTL 30s) =================
const DATA_CACHE_TTL = 30 * 1000;
window.dataCache = {
    properties:   { data: null, timestamp: 0 },
    clients:      { data: null, timestamp: 0 },
    agents:       { data: null, timestamp: 0 },
    interactions: { data: null, timestamp: 0 }
};

window.getCached = function(key) {
    const entry = window.dataCache[key];
    if (entry && entry.data && (Date.now() - entry.timestamp) < DATA_CACHE_TTL) {
        return entry.data;
    }
    return null;
};

window.setCache = function(key, data) {
    window.dataCache[key] = { data, timestamp: Date.now() };
};

window.invalidateCache = function(key) {
    if (key) {
        if (window.dataCache[key]) window.dataCache[key].timestamp = 0;
    } else {
        Object.keys(window.dataCache).forEach(k => window.dataCache[k].timestamp = 0);
    }
};

window.cachedFetch = async function(key, fetchFn) {
    const cached = window.getCached(key);
    if (cached) return cached;
    const data = await fetchFn();
    window.setCache(key, data);
    return data;
};

// Helper seguro para obtener el cliente Supabase
window.getSupabaseClient = function() {
    if (typeof window !== 'undefined' && window.supabaseClient) return window.supabaseClient;
    if (typeof supabaseClient !== 'undefined' && supabaseClient) return supabaseClient;
    return null;
};

// ================= PROXIES GLOBAL PARA EVENTOS INLINE DOM =================
window.escapeHTML = (str) => window.RenderersModule?.escapeHTML(str) || str;
window.switchView = (viewId, element) => window.RouterModule?.switchView(viewId, element);
window.toggleSidebarMenu = () => window.RouterModule?.toggleSidebarMenu();
window.renderDashboard = () => window.RenderersModule?.renderDashboard();
window.renderProperties = () => window.RenderersModule?.renderProperties();
window.filterProperties = () => window.RenderersModule?.filterProperties();
window.filterCRMByStatus = (status) => window.RenderersModule?.filterCRMByStatus(status);
window.filterCRMLeads = () => window.RenderersModule?.filterCRMLeads();
window.renderClients = (list) => window.RenderersModule?.renderClients(list);
window.renderAgents = () => window.RenderersModule?.renderAgents();

window.openModal = (id) => window.ModalsModule?.openModal(id);
window.closeModal = (id) => window.ModalsModule?.closeModal(id);
window.openAddPropertyModal = () => window.ModalsModule?.openAddPropertyModal();
window.openNewPropertyModal = window.openAddPropertyModal;
window.editProperty = (id) => window.ModalsModule?.editProperty(id);
window.saveProperty = (e) => window.ModalsModule?.saveProperty(e);
window.deleteProperty = (id) => window.ModalsModule?.deleteProperty(id);
window.openAddClientModal = () => window.ModalsModule?.openAddClientModal();
window.saveClient = (e) => window.ModalsModule?.saveClient(e);
window.deleteClient = (id) => window.ModalsModule?.deleteClient(id);
window.openAddAgentModal = () => window.ModalsModule?.openAddAgentModal();
window.saveAgent = (e) => window.ModalsModule?.saveAgent(e);
window.openInteractionModal = () => window.ModalsModule?.openInteractionModal();
window.saveInteraction = (e) => window.ModalsModule?.saveInteraction(e);
window.previewUploadedImages = (e) => window.ModalsModule?.previewUploadedImages(e);
window.previewUploadedImage = window.previewUploadedImages;
window.addExternalUrlImage = () => window.ModalsModule?.addExternalUrlImage();
window.removeAdminImage = (idx) => window.ModalsModule?.removeAdminImage(idx);
window.toggleSpecFields = () => window.ModalsModule?.toggleSpecFields();

window.checkSupabaseSession = () => window.AuthModule?.checkSupabaseSession();
window.handleSupabaseLogin = (e) => window.AuthModule?.handleSupabaseLogin(e);
window.handleSupabaseLogout = () => window.AuthModule?.handleSupabaseLogout();
window.updateAuthStateUI = (session) => window.AuthModule?.updateAuthStateUI(session);
window.initInactivityTimer = () => window.AuthModule?.initInactivityTimer();
window.clearInactivityTimer = () => window.AuthModule?.clearInactivityTimer();

// ================= INICIALIZACIÓN PRINCIPAL =================
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar sesión inicial de Supabase Auth
    if (window.AuthModule) {
        const authenticated = await window.AuthModule.checkSupabaseSession();
        if (authenticated && window.RouterModule) {
            window.RouterModule.switchView('dashboard');
        }
    }

    // 2. Escuchar cambios de estado Auth en tiempo real
    const client = window.getSupabaseClient();
    if (client) {
        client.auth.onAuthStateChange((event, session) => {
            console.log("🔐 Evento de autenticación Supabase:", event);
            if (event === 'SIGNED_IN' && session) {
                if (window.AuthModule) window.AuthModule.updateAuthStateUI(session);
                if (window.RouterModule) window.RouterModule.switchView('dashboard');
            } else if (event === 'SIGNED_OUT') {
                if (window.AuthModule) window.AuthModule.updateAuthStateUI(null);
            }
        });
    }
});
