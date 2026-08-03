// ================= MAIN APP & UI MODULE =================
// Dependencias: supabaseClient (global), api (assets/js/api.js)

// Estado Global en Memoria (Caché en ejecución, NO persistente)
let globalState = {
    properties: [],
    clients: [],
    agents: [],
    interactions: []
};

// ================= INICIALIZACIÓN Y CARGA DE DATOS =================
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar sesión y cargar vista inicial
    await checkSupabaseSession();
    
    // La primera vista siempre es Dashboard, así que forzamos su carga y render
    switchView('dashboard');
});

// Switch Active View Panels (Safe & Bulletproof Display Toggle)
async function switchView(viewId, element = null) {
    console.log("🔄 Cambiando a módulo:", viewId);

    // Mostrar UI de carga (opcional, podrías agregar un spinner global aquí)
    
    // 1. Obtener datos desde Supabase para la vista solicitada ANTES de cambiar visualmente
    try {
        if (viewId === 'dashboard') {
            globalState.properties = await api.fetchProperties();
            globalState.clients = await api.fetchClients();
            globalState.interactions = await api.fetchInteractions();
        } else if (viewId === 'inventario') {
            globalState.properties = await api.fetchProperties();
            globalState.agents = await api.fetchAgents();
        } else if (viewId === 'crm') {
            globalState.clients = await api.fetchClients();
        } else if (viewId === 'agentes') {
            globalState.agents = await api.fetchAgents();
        }
    } catch(err) {
        console.error("Error al cargar datos desde Supabase:", err);
    }

    // 2. Ocultar todas las secciones visualmente
    const sections = document.querySelectorAll('.view-section');
    sections.forEach(sec => {
        sec.classList.remove('active');
        sec.style.display = 'none';
    });

    // 3. Desactivar todos los botones del menú
    document.querySelectorAll('.nav-menu li a').forEach(a => a.classList.remove('active'));

    // 4. Activar y mostrar la sección deseada
    const targetView = document.getElementById('view-' + viewId);
    if (targetView) {
        targetView.classList.add('active');
        targetView.style.display = 'block';
    }

    // 5. Marcar botón activo en el menú
    const navLink = element || document.querySelector(`.nav-menu li a[onclick*="${viewId}"]`);
    if (navLink) navLink.classList.add('active');

    // 6. Actualizar título de cabecera
    const titles = {
        dashboard: 'Métricas Generales & Resumen',
        inventario: 'Inventario Unificado de Activos',
        crm: 'Gestión Integral CRM & Leads',
        agentes: 'Administración de Agentes'
    };
    const titleEl = document.getElementById('pageTitle');
    if (titleEl && titles[viewId]) titleEl.innerText = titles[viewId];

    // 7. Renderizar UI con el estado global actualizado
    try {
        if (viewId === 'dashboard') renderDashboard();
        if (viewId === 'inventario') renderProperties();
        if (viewId === 'crm') renderClients();
        if (viewId === 'agentes') renderAgents();
    } catch (e) {
        console.warn(`Error renderizando UI ${viewId}:`, e);
    }

    // 8. Cerrar sidebar móvil si aplica
    const sidebar = document.getElementById('appSidebar');
    if (sidebar) sidebar.classList.remove('active');
}

function toggleSidebarMenu() {
    document.getElementById('appSidebar').classList.toggle('active');
}

// ================= BUSINESS LOGIC RENDERING =================

function renderDashboard() {
    const props = globalState.properties || [];
    const clients = globalState.clients || [];
    const interactions = globalState.interactions || [];

    // KPIs
    const activeLeads = clients.filter(c => c.estado_lead !== 'Cerrado').length;
    const landingLeads = clients.filter(c => c.origen === 'Norte Chico').length;
    const availableProps = props.filter(p => p.estado === 'Disponible').length;
    const closedDeals = clients.filter(c => c.estado_lead === 'Cerrado').length;

    const sumValues = props.reduce((acc, p) => p.estado === 'Disponible' ? acc + parseFloat(p.precio) : acc, 0);
    const projection = Math.round(sumValues * 0.03);

    if (document.getElementById('kpiLeads')) document.getElementById('kpiLeads').innerText = activeLeads;
    if (document.getElementById('kpiLandingLeads')) document.getElementById('kpiLandingLeads').innerText = landingLeads;
    if (document.getElementById('kpiDispo')) document.getElementById('kpiDispo').innerText = availableProps;
    if (document.getElementById('kpiCierres')) document.getElementById('kpiCierres').innerText = closedDeals;
    if (document.getElementById('kpiComision')) document.getElementById('kpiComision').innerText = '$' + projection.toLocaleString();

    // Interaction List
    const tbody = document.getElementById('interactionTableBody');
    if (tbody) {
        tbody.innerHTML = '';
        const recentInts = interactions.slice(0, 4); // Suponiendo order DESC
        recentInts.forEach(int => {
            const client = clients.find(c => c.id === int.id_cliente);
            const prop = props.find(p => p.id === int.id_propiedad);
            tbody.innerHTML += `
                <tr>
                    <td><strong>${client ? client.nombre_completo : 'Desconocido'}</strong></td>
                    <td>${prop ? prop.titulo : 'Consulta General'}</td>
                    <td><span class="status-badge" style="background: rgba(var(--accent-rgb),0.1); color: var(--accent);">${int.tipo_contacto}</span></td>
                    <td>${int.fecha_interaccion || ''}</td>
                    <td style="color: var(--text-muted); font-size: 13px;">${int.notas || ''}</td>
                </tr>
            `;
        });
    }

    renderDonutChart(clients);
    renderBarChart(props);
}

function renderDonutChart(clients) {
    const statusCounts = { Nuevo: 0, Contacto: 0, Negociacion: 0, Cerrado: 0 };
    clients.forEach(c => {
        if (c.estado_lead === 'Nuevo') statusCounts.Nuevo++;
        else if (c.estado_lead === 'En Contacto') statusCounts.Contacto++;
        else if (c.estado_lead === 'Negociacion') statusCounts.Negociacion++;
        else if (c.estado_lead === 'Cerrado') statusCounts.Cerrado++;
    });

    const total = clients.length || 1;
    const pNuevo = (statusCounts.Nuevo / total) * 100;
    const pContacto = (statusCounts.Contacto / total) * 100;
    const pNegociacion = (statusCounts.Negociacion / total) * 100;
    const pCerrado = (statusCounts.Cerrado / total) * 100;
    const accentColor = '#cb9f74';

    const container = document.getElementById('chartLeads');
    if(!container) return;
    
    container.innerHTML = `
        <svg width="220" height="220" viewBox="0 0 42 42" class="donut">
            <circle class="donut-hole" cx="21" cy="21" r="15.91549430918954" fill="transparent"></circle>
            <circle class="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="rgba(255,255,255,0.05)" stroke-width="3"></circle>
            
            <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#3b82f6" stroke-width="3" stroke-dasharray="${pNuevo} ${100 - pNuevo}" stroke-dashoffset="100"></circle>
            <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#a855f7" stroke-width="3" stroke-dasharray="${pContacto} ${100 - pContacto}" stroke-dashoffset="${100 - pNuevo}"></circle>
            <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f59e0b" stroke-width="3" stroke-dasharray="${pNegociacion} ${100 - pNegociacion}" stroke-dashoffset="${100 - pNuevo - pContacto}"></circle>
            <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="${accentColor}" stroke-width="3" stroke-dasharray="${pCerrado} ${100 - pCerrado}" stroke-dashoffset="${100 - pNuevo - pContacto - pNegociacion}"></circle>
        </svg>
        <div style="position: absolute; text-align: left; right: -10px; top: 30px; font-size: 11px; display: flex; flex-direction: column; gap: 6px;">
            <div><span style="display:inline-block;width:10px;height:10px;background:#3b82f6;border-radius:50%;margin-right:8px;"></span>Nuevo: ${statusCounts.Nuevo}</div>
            <div><span style="display:inline-block;width:10px;height:10px;background:#a855f7;border-radius:50%;margin-right:8px;"></span>En Contacto: ${statusCounts.Contacto}</div>
            <div><span style="display:inline-block;width:10px;height:10px;background:#f59e0b;border-radius:50%;margin-right:8px;"></span>Negociación: ${statusCounts.Negociacion}</div>
            <div><span style="display:inline-block;width:10px;height:10px;background:${accentColor};border-radius:50%;margin-right:8px;"></span>Cerrado: ${statusCounts.Cerrado}</div>
        </div>
    `;
}

function renderBarChart(properties) {
    const sumTerrenos = properties.filter(p => p.tipo_activo === 'Terreno').reduce((acc, p) => acc + (parseFloat(p.precio) || 0), 0);
    const countTerrenos = properties.filter(p => p.tipo_activo === 'Terreno').length || 1;
    const avgTerreno = Math.round(sumTerrenos / countTerrenos);

    const sumDeptos = properties.filter(p => p.tipo_activo === 'Departamento').reduce((acc, p) => acc + (parseFloat(p.precio) || 0), 0);
    const countDeptos = properties.filter(p => p.tipo_activo === 'Departamento').length || 1;
    const avgDepto = Math.round(sumDeptos / countDeptos);

    const sumCasas = properties.filter(p => p.tipo_activo === 'Casa').reduce((acc, p) => acc + (parseFloat(p.precio) || 0), 0);
    const countCasas = properties.filter(p => p.tipo_activo === 'Casa').length || 1;
    const avgCasa = Math.round(sumCasas / countCasas);

    const maxVal = Math.max(avgTerreno, avgDepto, avgCasa) || 1;
    const heightTerreno = (avgTerreno / maxVal) * 120;
    const heightDepto = (avgDepto / maxVal) * 120;
    const heightCasa = (avgCasa / maxVal) * 120;
    const accentColor = '#cb9f74';

    const container = document.getElementById('chartPrice');
    if(!container) return;
    
    container.innerHTML = `
        <div style="display: flex; align-items: flex-end; justify-content: center; gap: 40px; height: 160px; width: 100%; border-bottom: 2px solid var(--border); padding-bottom: 5px;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                <span style="font-size: 11px; font-weight: 700;">$${avgTerreno.toLocaleString()}</span>
                <div style="width: 45px; height: ${heightTerreno}px; background: ${accentColor}; border-radius: 6px 6px 0 0;"></div>
                <span style="font-size: 10px; font-weight: 600; text-transform: uppercase;">Terrenos</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                <span style="font-size: 11px; font-weight: 700;">$${avgDepto.toLocaleString()}</span>
                <div style="width: 45px; height: ${heightDepto}px; background: #3b82f6; border-radius: 6px 6px 0 0;"></div>
                <span style="font-size: 10px; font-weight: 600; text-transform: uppercase;">Deptos</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                <span style="font-size: 11px; font-weight: 700;">$${avgCasa.toLocaleString()}</span>
                <div style="width: 45px; height: ${heightCasa}px; background: #10b981; border-radius: 6px 6px 0 0;"></div>
                <span style="font-size: 10px; font-weight: 600; text-transform: uppercase;">Casas</span>
            </div>
        </div>
    `;
}

function renderProperties() {
    const props = globalState.properties || [];
    const agents = globalState.agents || [];
    const propSearchEl = document.getElementById('propSearch');
    const query = propSearchEl ? propSearchEl.value.toLowerCase() : '';

    const grid = document.getElementById('inventoryDisplay');
    if (!grid) return;
    grid.innerHTML = '';

    const filtered = props.filter(p => {
        const title = p.titulo ? p.titulo.toLowerCase() : '';
        const loc = p.ubicacion ? p.ubicacion.toLowerCase() : '';
        return title.includes(query) || loc.includes(query);
    });

    filtered.forEach(p => {
        const agent = agents.find(a => String(a.id) === String(p.id_agente));
        const defaultImg = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80';
        
        grid.innerHTML += `
            <div class="dashboard-prop-card">
                <div class="card-img-wrap" style="background-image: url('${p.imagen_url || p.imagen || defaultImg}');">
                    <span class="brand-pill brand-gcn" style="position: absolute; top: 15px; left: 15px;">
                        GCN
                    </span>
                    <span class="status-badge badge-${(p.estado || '').toLowerCase()}" style="position: absolute; top: 15px; right: 15px; background: var(--bg-card);">
                        ${p.estado}
                    </span>
                    <div class="card-price-tag">$${parseFloat(p.precio || 0).toLocaleString()}</div>
                </div>
                <div class="card-body-content">
                    <div style="font-size: 11px; color: var(--accent); font-weight: 700; text-transform: uppercase; margin-bottom: 5px;">
                        ${p.tipo_activo}
                    </div>
                    <h4 class="card-title-text">${p.titulo}</h4>
                    <p style="font-size: 13px; color: var(--text-muted); display:flex; align-items:center; gap:5px;">
                        📍 ${p.ubicacion}
                    </p>
                    <p style="font-size: 12px; color: var(--text-muted); margin-top: 10px;">
                        Agente: <strong>${agent ? agent.nombre : 'Sin Asignar'}</strong>
                    </p>
                    
                    <div class="card-specs-row">
                        <span>📐 ${p.area_m2} M²</span>
                        <span style="margin-left: auto;">
                            <button class="btn-icon-table" onclick="editProperty(${p.id})">✏️ Editar</button>
                            <button class="btn-icon-table" onclick="deleteProperty(${p.id})" style="color:#ef4444;">🗑️</button>
                        </span>
                    </div>
                </div>
            </div>
        `;
    });
}

function filterProperties() {
    renderProperties();
}

function renderClients() {
    const clients = globalState.clients || [];
    const tbody = document.getElementById('clientsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    clients.forEach(c => {
        const statusClass = c.estado_lead ? c.estado_lead.toLowerCase().replace(' ', '') : '';
        const origen = c.origen || 'Manual';
        const interes = c.tipo_interes || 'Consulta General';
        tbody.innerHTML += `
            <tr>
                <td><strong>${c.nombre_completo}</strong></td>
                <td>${c.telefono}</td>
                <td>${c.email}</td>
                <td><span class="brand-pill brand-gcn">${origen}</span></td>
                <td style="font-size: 13px; color: var(--text-muted);">${interes}</td>
                <td><span class="status-badge badge-${statusClass}">${c.estado_lead}</span></td>
                <td>${c.fecha_registro || ''}</td>
                <td>
                    <button class="btn-icon-table" onclick="deleteClient(${c.id})" style="color:#ef4444;" title="Eliminar Lead">🗑️ Eliminar</button>
                </td>
            </tr>
        `;
    });
}

function renderAgents() {
    const agents = globalState.agents || [];
    const tbody = document.getElementById('agentsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    agents.forEach(a => {
        tbody.innerHTML += `
            <tr>
                <td>#${a.id}</td>
                <td><strong>${a.nombre}</strong></td>
                <td>${a.email}</td>
                <td>${a.telefono}</td>
                <td><span class="status-badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">Activo</span></td>
            </tr>
        `;
    });
}


// ================= MODALS & FORMS =================
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
}

async function openAddPropertyModal() {
    document.getElementById('formProperty').reset();
    document.getElementById('propId').value = '';
    document.getElementById('imagePreviewBox').style.display = 'none';
    document.getElementById('imagePreviewImg').src = '';
    await populateSelectors();
    toggleSpecFields();
    document.getElementById('propModalTitle').innerText = 'Publicar Nuevo Inmueble';
    openModal('modalProperty');
}
const openNewPropertyModal = openAddPropertyModal;

async function editProperty(id) {
    const p = globalState.properties.find(x => String(x.id) === String(id));
    if (!p) return;

    document.getElementById('propId').value = p.id;
    if (document.getElementById('propTitle')) document.getElementById('propTitle').value = p.titulo || '';
    if (document.getElementById('propType')) document.getElementById('propType').value = p.tipo_activo || 'Terreno';
    if (document.getElementById('propPrice')) document.getElementById('propPrice').value = p.precio || '';
    if (document.getElementById('propArea')) document.getElementById('propArea').value = p.area_m2 || '';
    if (document.getElementById('propLocation')) document.getElementById('propLocation').value = p.ubicacion || '';
    
    const imgVal = p.imagen_url || p.imagen || '';
    if (document.getElementById('propImage')) document.getElementById('propImage').value = imgVal;
    if (imgVal && document.getElementById('imagePreviewImg')) {
        document.getElementById('imagePreviewImg').src = imgVal;
        document.getElementById('imagePreviewBox').style.display = 'block';
    } else if (document.getElementById('imagePreviewBox')) {
        document.getElementById('imagePreviewBox').style.display = 'none';
    }

    if (document.getElementById('propDesc')) document.getElementById('propDesc').value = p.descripcion || '';
    if (document.getElementById('propHabitaciones')) document.getElementById('propHabitaciones').value = p.habitaciones || '';
    if (document.getElementById('propBanos')) document.getElementById('propBanos').value = p.banos || '';
    if (document.getElementById('propZonificacion')) document.getElementById('propZonificacion').value = p.zonificacion || '';
    if (document.getElementById('propParametros')) document.getElementById('propParametros').value = p.parametros || '';
    if (document.getElementById('propStatus')) document.getElementById('propStatus').value = p.estado || 'Disponible';

    await populateSelectors();
    if (document.getElementById('propAgent')) document.getElementById('propAgent').value = p.id_agente || '';
    toggleSpecFields();
    document.getElementById('propModalTitle').innerText = 'Editar Propiedad';
    openModal('modalProperty');
}

// ================= SUPABASE CRUD (Via API Module) =================
async function saveProperty(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    const idVal = document.getElementById('propId').value;
    const isUpdate = !!idVal;
    
    // Payload mapping
    const payload = {
        titulo: document.getElementById('propTitle')?.value || '',
        tipo_activo: document.getElementById('propType')?.value || 'Terreno',
        precio: parseFloat(document.getElementById('propPrice')?.value) || 0,
        area_m2: parseFloat(document.getElementById('propArea')?.value) || 0,
        ubicacion: document.getElementById('propLocation')?.value || '',
        imagen_url: document.getElementById('propImage')?.value || '',
        descripcion: document.getElementById('propDesc')?.value || '',
        habitaciones: document.getElementById('propHabitaciones')?.value ? parseInt(document.getElementById('propHabitaciones').value) : null,
        banos: document.getElementById('propBanos')?.value ? parseFloat(document.getElementById('propBanos').value) : null,
        zonificacion: document.getElementById('propZonificacion')?.value || null,
        parametros: document.getElementById('propParametros')?.value || null,
        estado: document.getElementById('propStatus')?.value || 'Disponible',
        id_agente: document.getElementById('propAgent')?.value ? parseInt(document.getElementById('propAgent').value) : null
    };

    const success = await api.saveProperty(payload, isUpdate ? idVal : null);
    if (submitBtn) submitBtn.disabled = false;

    if (success) {
        alert('✅ Propiedad guardada exitosamente en Supabase.');
        closeModal('modalProperty');
        switchView('inventario'); // Refresh view and data
    } else {
        alert('❌ Error al guardar la propiedad.');
    }
}

async function deleteProperty(id) {
    if (confirm('¿Está seguro de eliminar esta propiedad permanentemente de Supabase?')) {
        const success = await api.deleteProperty(id);
        if (success) {
            switchView('inventario');
        } else {
            alert('❌ Error al eliminar.');
        }
    }
}

function openAddClientModal() {
    document.getElementById('formClient').reset();
    openModal('modalClient');
}

async function saveClient(e) {
    e.preventDefault();
    const payload = {
        nombre_completo: document.getElementById('cliName').value,
        telefono: document.getElementById('cliPhone').value,
        email: document.getElementById('cliEmail').value,
        estado_lead: document.getElementById('cliStatus').value,
        origen: 'Manual Admin',
        tipo_interes: 'Registro Interno',
        fecha_registro: new Date().toISOString().split('T')[0]
    };
    
    const success = await api.saveClient(payload);
    if (success) {
        closeModal('modalClient');
        switchView('crm');
    } else {
        alert('❌ Error al guardar.');
    }
}

async function deleteClient(id) {
    if (confirm('¿Está seguro de eliminar este lead permanentemente?')) {
        const success = await api.deleteClient(id);
        if (success) switchView('crm');
    }
}

function openAddAgentModal() {
    document.getElementById('formAgent').reset();
    openModal('modalAgent');
}

async function saveAgent(e) {
    e.preventDefault();
    const payload = {
        nombre: document.getElementById('ageName').value,
        email: document.getElementById('ageEmail').value,
        telefono: document.getElementById('agePhone').value
    };
    const success = await api.saveAgent(payload);
    if (success) {
        alert('✅ Asesor registrado con éxito en Supabase.');
        closeModal('modalAgent');
        switchView('agentes');
    } else {
        alert('❌ Error al registrar asesor.');
    }
}

async function populateSelectors() {
    // Para modales y creación de interacciones
    globalState.clients = await api.fetchClients();
    globalState.properties = await api.fetchProperties();
    globalState.agents = await api.fetchAgents();

    const cliSelect = document.getElementById('intCliente');
    if (cliSelect) {
        cliSelect.innerHTML = '';
        globalState.clients.forEach(c => cliSelect.innerHTML += `<option value="${c.id}">${c.nombre_completo}</option>`);
    }

    const propSelect = document.getElementById('intPropiedad');
    if (propSelect) {
        propSelect.innerHTML = '<option value="">Consulta General (Sin activo específico)</option>';
        globalState.properties.forEach(p => propSelect.innerHTML += `<option value="${p.id}">${p.titulo}</option>`);
    }

    const agentSelect = document.getElementById('propAgent');
    if (agentSelect) {
        agentSelect.innerHTML = '';
        if (globalState.agents.length > 0) {
            globalState.agents.forEach(a => agentSelect.innerHTML += `<option value="${a.id}">${a.nombre}</option>`);
        } else {
            agentSelect.innerHTML = '<option value="">No hay asesores registrados en Supabase</option>';
        }
    }
}

async function openInteractionModal() {
    await populateSelectors();
    document.getElementById('formInteraction').reset();
    openModal('modalInteraction');
}

async function saveInteraction(e) {
    e.preventDefault();
    const propId = document.getElementById('intPropiedad').value;
    const payload = {
        id_cliente: parseInt(document.getElementById('intCliente').value),
        id_propiedad: propId ? parseInt(propId) : null,
        tipo_contacto: document.getElementById('intTipo').value,
        notas: document.getElementById('intNotas').value,
        fecha_interaccion: new Date().toISOString().split('T')[0]
    };
    const success = await api.saveInteraction(payload);
    if (success) {
        closeModal('modalInteraction');
        switchView('dashboard');
    } else {
        alert('❌ Error al guardar interacción.');
    }
}

function toggleSpecFields() {
    const type = document.getElementById('propType')?.value;
    const viv = document.getElementById('specsVivienda');
    const ter = document.getElementById('specsTerreno');
    if (!viv || !ter) return;

    if (type === 'Terreno') {
        viv.style.display = 'none';
        ter.style.display = 'block';
    } else {
        viv.style.display = 'block';
        ter.style.display = 'none';
    }
}

function previewUploadedImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width, height = img.height;
                const maxDim = 600;

                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const base64Data = canvas.toDataURL('image/jpeg', 0.75);
                document.getElementById('propImage').value = base64Data;
                document.getElementById('imagePreviewImg').src = base64Data;
                document.getElementById('imagePreviewBox').style.display = 'block';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// ================= SUPABASE AUTH HANDLERS =================
async function checkSupabaseSession() {
    if (!window.supabaseClient) return; 
    
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        openModal('modalAuth');
    } else {
        closeModal('modalAuth');
        if (document.getElementById('displayUserName')) {
            document.getElementById('displayUserName').innerText = session.user.email;
        }
    }
}

async function handleSupabaseLogin(e) {
    e.preventDefault();
    const errBox = document.getElementById('authErrorMsg');
    if (errBox) errBox.style.display = 'none';

    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;

    if (!window.supabaseClient) {
        closeModal('modalAuth');
        return;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
        if (errBox) {
            errBox.innerText = "Error: " + error.message;
            errBox.style.display = 'block';
        } else alert("Error: " + error.message);
    } else {
        closeModal('modalAuth');
        if (document.getElementById('displayUserName')) {
            document.getElementById('displayUserName').innerText = data.user.email;
        }
        switchView('dashboard'); // Recargar dashboard con permisos
    }
}

async function handleSupabaseLogout() {
    if (window.supabaseClient) {
        await supabaseClient.auth.signOut();
    }
    openModal('modalAuth');
}
