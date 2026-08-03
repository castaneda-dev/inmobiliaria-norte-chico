// ================= SUPABASE API MODULE =================
// Cero uso de localStorage. Todo va directo a la nube.

window.api = {
    // ---------------- PROPIEDADES ----------------
    async fetchProperties() {
        if (!supabaseClient) return [];
        try {
            const { data, error } = await supabaseClient.from('propiedades').select('*').order('id', { ascending: false });
            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error("Error fetching propiedades:", e);
            return [];
        }
    },
    async saveProperty(payload, id = null) {
        if (!supabaseClient) return null;
        try {
            let res;
            if (id) {
                res = await supabaseClient.from('propiedades').update(payload).eq('id', id);
            } else {
                res = await supabaseClient.from('propiedades').insert([payload]);
            }
            if (res.error) throw res.error;
            return true;
        } catch (e) {
            console.error("Error saving propiedad:", e);
            return false;
        }
    },
    async deleteProperty(id) {
        if (!supabaseClient) return false;
        try {
            const { error } = await supabaseClient.from('propiedades').delete().eq('id', id);
            if (error) throw error;
            return true;
        } catch (e) {
            console.error("Error deleting propiedad:", e);
            return false;
        }
    },

    // ---------------- CLIENTES / LEADS (CRM) ----------------
    async fetchClients() {
        if (!supabaseClient) return [];
        try {
            const { data, error } = await supabaseClient.from('clientes').select('*').order('id', { ascending: false });
            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error("Error fetching clientes:", e);
            return [];
        }
    },
    async saveClient(payload, id = null) {
        if (!supabaseClient) return null;
        try {
            let res;
            if (id) {
                res = await supabaseClient.from('clientes').update(payload).eq('id', id);
            } else {
                res = await supabaseClient.from('clientes').insert([payload]);
            }
            if (res.error) throw res.error;
            return true;
        } catch (e) {
            console.error("Error saving cliente:", e);
            return false;
        }
    },
    async deleteClient(id) {
        if (!supabaseClient) return false;
        try {
            const { error } = await supabaseClient.from('clientes').delete().eq('id', id);
            if (error) throw error;
            return true;
        } catch (e) {
            console.error("Error deleting cliente:", e);
            return false;
        }
    },

    // ---------------- AGENTES / STAFF ----------------
    async fetchAgents() {
        if (!supabaseClient) return [];
        try {
            const { data, error } = await supabaseClient.from('agentes').select('*').order('id', { ascending: true });
            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error("Error fetching agentes:", e);
            return [];
        }
    },
    async saveAgent(payload, id = null) {
        if (!supabaseClient) return null;
        try {
            let res;
            if (id) {
                res = await supabaseClient.from('agentes').update(payload).eq('id', id);
            } else {
                res = await supabaseClient.from('agentes').insert([payload]);
            }
            if (res.error) throw res.error;
            return true;
        } catch (e) {
            console.error("Error saving agente:", e);
            return false;
        }
    },
    async deleteAgent(id) {
        if (!supabaseClient) return false;
        try {
            const { error } = await supabaseClient.from('agentes').delete().eq('id', id);
            if (error) throw error;
            return true;
        } catch (e) {
            console.error("Error deleting agente:", e);
            return false;
        }
    },

    // ---------------- INTERACCIONES ----------------
    // Asumiendo que existe una tabla 'interacciones'. Si no, omitimos o creamos el boilerplate.
    async fetchInteractions() {
        if (!supabaseClient) return [];
        try {
            const { data, error } = await supabaseClient.from('interacciones').select('*').order('id', { ascending: false });
            if (error) throw error;
            return data || [];
        } catch (e) {
            console.warn("Tabla interacciones podría no existir:", e);
            return []; // Retorna arreglo vacio si falla (ej. si no existe la tabla aun)
        }
    },
    async saveInteraction(payload) {
        if (!supabaseClient) return null;
        try {
            const { error } = await supabaseClient.from('interacciones').insert([payload]);
            if (error) throw error;
            return true;
        } catch (e) {
            console.error("Error saving interaccion:", e);
            return false;
        }
    }
};
