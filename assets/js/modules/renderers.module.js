// ================= BUSINESS UI RENDERERS MODULE =================
// Responsabilidad: Renderizado dinámico de KPIs, gráficos SVG, tarjetas de inventario,
// tablas de clientes CRM y staff de agentes. Incluye sanitización anti-XSS.

(function() {
    let crmActiveFilter = 'todos';

    function escapeHTML(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function getOrigenBadge(origen) {
        const o = (origen || '').toLowerCase();
        if (o.includes('facebook')) return '<span class="status-badge" style="background:rgba(59,130,246,0.15);color:#3b82f6;">📘 Facebook Ads</span>';
        if (o.includes('tiktok')) return '<span class="status-badge" style="background:rgba(255,255,255,0.1);color:#fff;">🎵 TikTok Ads</span>';
        if (o.includes('norte chico') || o.includes('landing')) return '<span class="status-badge" style="background:rgba(16,185,129,0.15);color:#10b981;">🌐 Landing Web</span>';
        if (o.includes('webhook')) return '<span class="status-badge" style="background:rgba(168,85,247,0.15);color:#a855f7;">⚡ Webhook</span>';
        return '<span class="status-badge" style="background:rgba(var(--accent-rgb),0.1);color:var(--accent);">' + escapeHTML(origen || 'Manual') + '</span>';
    }

    window.RenderersModule = {
        escapeHTML,
        getOrigenBadge,

        renderDashboard() {
            const props = window.globalState.properties || [];
            const clients = window.globalState.clients || [];
            const interactions = window.globalState.interactions || [];

            // KPIs
            const activeLeads = clients.filter(c => c.estado_lead !== 'Cerrado').length;
            const landingLeads = clients.filter(c => c.origen === 'Norte Chico').length;
            const availableProps = props.filter(p => p.estado === 'Disponible').length;
            const closedDeals = clients.filter(c => c.estado_lead === 'Cerrado').length;

            const sumValues = props.reduce((acc, p) => p.estado === 'Disponible' ? acc + parseFloat(p.precio || 0) : acc, 0);
            const projection = Math.round(sumValues * 0.03);

            if (document.getElementById('kpiLeads')) document.getElementById('kpiLeads').innerText = activeLeads;
            if (document.getElementById('kpiLandingLeads')) document.getElementById('kpiLandingLeads').innerText = landingLeads;
            if (document.getElementById('kpiDispo')) document.getElementById('kpiDispo').innerText = availableProps;
            if (document.getElementById('kpiCierres')) document.getElementById('kpiCierres').innerText = closedDeals;
            if (document.getElementById('kpiComision')) document.getElementById('kpiComision').innerText = '$' + projection.toLocaleString();

            // Interacciones recientes
            const tbody = document.getElementById('interactionTableBody');
            if (tbody) {
                tbody.innerHTML = '';
                const recentInts = interactions.slice(0, 4);
                recentInts.forEach(int => {
                    const client = clients.find(c => c.id === int.id_cliente);
                    const prop = props.find(p => p.id === int.id_propiedad);
                    tbody.innerHTML += `
                        <tr>
                            <td><strong>${escapeHTML(client ? client.nombre_completo : 'Desconocido')}</strong></td>
                            <td>${escapeHTML(prop ? prop.titulo : 'Consulta General')}</td>
                            <td><span class="status-badge" style="background: rgba(var(--accent-rgb),0.1); color: var(--accent);">${escapeHTML(int.tipo_contacto)}</span></td>
                            <td>${escapeHTML(int.fecha_interaccion || '')}</td>
                            <td style="color: var(--text-muted); font-size: 13px;">${escapeHTML(int.notas || '')}</td>
                        </tr>
                    `;
                });
            }

            this.renderDonutChart(clients);
            this.renderBarChart(props);
        },

        renderDonutChart(clients) {
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
            if (!container) return;
            
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
        },

        renderBarChart(properties) {
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

            const container = document.getElementById('chartPrice');
            if (!container) return;
            
            container.innerHTML = `
                <div style="display: flex; align-items: flex-end; justify-content: center; gap: 40px; height: 160px; width: 100%; border-bottom: 2px solid var(--border); padding-bottom: 5px;">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                        <span style="font-size: 11px; font-weight: 700;">$${avgTerreno.toLocaleString()}</span>
                        <div style="width: 45px; height: ${heightTerreno}px; background: #cb9f74; border-radius: 6px 6px 0 0;"></div>
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
        },

        renderProperties() {
            const props = window.globalState.properties || [];
            const agents = window.globalState.agents || [];
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
                                ${escapeHTML(p.estado)}
                            </span>
                            <div class="card-price-tag">$${parseFloat(p.precio || 0).toLocaleString()}</div>
                        </div>
                        <div class="card-body-content">
                            <div style="font-size: 11px; color: var(--accent); font-weight: 700; text-transform: uppercase; margin-bottom: 5px;">
                                ${escapeHTML(p.tipo_activo)}
                            </div>
                            <h4 class="card-title-text">${escapeHTML(p.titulo)}</h4>
                            <p style="font-size: 13px; color: var(--text-muted); display:flex; align-items:center; gap:5px;">
                                📍 ${escapeHTML(p.ubicacion)}
                            </p>
                            <p style="font-size: 12px; color: var(--text-muted); margin-top: 10px;">
                                Agente: <strong>${escapeHTML(agent ? agent.nombre : 'Sin Asignar')}</strong>
                            </p>
                            
                            <div class="card-specs-row">
                                <span>📐 ${escapeHTML(p.area_m2)} M²</span>
                                <span style="margin-left: auto;">
                                    <button class="btn-icon-table" onclick="ModalsModule.editProperty(${parseInt(p.id)})">✏️ Editar</button>
                                    <button class="btn-icon-table" onclick="ModalsModule.deleteProperty(${parseInt(p.id)})" style="color:#ef4444;">🗑️</button>
                                </span>
                            </div>
                        </div>
                    </div>
                `;
            });
        },

        filterProperties() {
            this.renderProperties();
        },

        renderClients(filteredList) {
            const clients = filteredList || window.globalState.clients || [];
            const tbody = document.getElementById('clientsTableBody');
            if (!tbody) return;
            tbody.innerHTML = '';

            if (clients.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted);">No se encontraron leads con ese filtro.</td></tr>';
                return;
            }

            clients.forEach(c => {
                const statusClass = c.estado_lead ? c.estado_lead.toLowerCase().replace(' ', '') : '';
                const interes = c.tipo_interes || 'Consulta General';
                tbody.innerHTML += `
                    <tr>
                        <td><strong>${escapeHTML(c.nombre_completo)}</strong></td>
                        <td>${escapeHTML(c.telefono)}</td>
                        <td>${escapeHTML(c.email)}</td>
                        <td>${getOrigenBadge(c.origen)}</td>
                        <td style="font-size: 13px; color: var(--text-muted);">${escapeHTML(interes)}</td>
                        <td><span class="status-badge badge-${escapeHTML(statusClass)}">${escapeHTML(c.estado_lead)}</span></td>
                        <td>${escapeHTML(c.fecha_registro || '')}</td>
                        <td>
                            <button class="btn-icon-table" onclick="ModalsModule.deleteClient(${parseInt(c.id)})" style="color:#ef4444;" title="Eliminar Lead">🗑️ Eliminar</button>
                        </td>
                    </tr>
                `;
            });
        },

        filterCRMByStatus(status) {
            crmActiveFilter = status;
            document.querySelectorAll('[id^="crmFilter"]').forEach(btn => btn.classList.remove('btn-active'));
            const btnMap = { 'todos': 'crmFilterAll', 'Nuevo': 'crmFilterNuevo', 'En Contacto': 'crmFilterContacto', 'Negociacion': 'crmFilterNegociacion', 'Cerrado': 'crmFilterCerrado' };
            const activeBtn = document.getElementById(btnMap[status]);
            if (activeBtn) activeBtn.classList.add('btn-active');
            this.applyAllCRMFilters();
        },

        filterCRMLeads() {
            this.applyAllCRMFilters();
        },

        applyAllCRMFilters() {
            let clients = window.globalState.clients || [];
            if (crmActiveFilter !== 'todos') {
                clients = clients.filter(c => c.estado_lead === crmActiveFilter);
            }
            const searchEl = document.getElementById('crmSearch');
            if (searchEl && searchEl.value.trim()) {
                const q = searchEl.value.toLowerCase();
                clients = clients.filter(c => {
                    return (c.nombre_completo || '').toLowerCase().includes(q)
                        || (c.email || '').toLowerCase().includes(q)
                        || (c.telefono || '').toLowerCase().includes(q)
                        || (c.origen || '').toLowerCase().includes(q);
                });
            }
            this.renderClients(clients);
        },

        renderAgents() {
            const agents = window.globalState.agents || [];
            const tbody = document.getElementById('agentsTableBody');
            if (!tbody) return;
            tbody.innerHTML = '';

            agents.forEach(a => {
                tbody.innerHTML += `
                    <tr>
                        <td>#${parseInt(a.id)}</td>
                        <td><strong>${escapeHTML(a.nombre)}</strong></td>
                        <td>${escapeHTML(a.email)}</td>
                        <td>${escapeHTML(a.telefono)}</td>
                        <td><span class="status-badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">Activo</span></td>
                    </tr>
                `;
            });
        }
    };
})();
