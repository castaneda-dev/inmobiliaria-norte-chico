// ================= MODALS & FORM MANAGEMENT MODULE =================
// Responsabilidad: Controladores para ventanas modales, manipulación de imágenes HD,
// compresión canvas y envío de datos CRUD integrados con notificaciones Toast.

(function() {
    let currentPropertyImages = [];

    function escapeHTML(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    window.ModalsModule = {
        openModal(id) {
            const modal = document.getElementById(id);
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('active');
            }
        },

        closeModal(id) {
            const modal = document.getElementById(id);
            if (modal) {
                modal.classList.remove('active');
                modal.style.display = 'none';
            }
        },

        renderAdminImageGallery() {
            const previewBox = document.getElementById('imagePreviewBox');
            const galleryGrid = document.getElementById('adminGalleryGrid');
            const hiddenInput = document.getElementById('propImage');

            if (!previewBox || !galleryGrid) return;

            if (!currentPropertyImages || currentPropertyImages.length === 0) {
                previewBox.style.display = 'none';
                galleryGrid.innerHTML = '';
                if (hiddenInput) hiddenInput.value = '';
                return;
            }

            previewBox.style.display = 'block';
            galleryGrid.innerHTML = '';

            currentPropertyImages.forEach((imgUrl, idx) => {
                const item = document.createElement('div');
                item.style.cssText = 'position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; border: 1px solid var(--border); background: #000;';
                item.innerHTML = `
                    <img src="${imgUrl}" style="width:100%; height:100%; object-fit:cover; display:block;" />
                    <button type="button" onclick="ModalsModule.removeAdminImage(${idx})" style="position:absolute; top:4px; right:4px; background:rgba(239,68,68,0.85); color:#fff; border:none; width:22px; height:22px; border-radius:50%; font-size:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 5px rgba(0,0,0,0.5);">✕</button>
                `;
                galleryGrid.appendChild(item);
            });

            if (hiddenInput) {
                hiddenInput.value = currentPropertyImages.length > 1 ? JSON.stringify(currentPropertyImages) : (currentPropertyImages[0] || '');
            }
        },

        removeAdminImage(index) {
            if (index >= 0 && index < currentPropertyImages.length) {
                currentPropertyImages.splice(index, 1);
                this.renderAdminImageGallery();
            }
        },

        addExternalUrlImage() {
            const urlInput = document.getElementById('propImageUrl');
            const url = urlInput?.value?.trim();
            if (url) {
                currentPropertyImages.push(url);
                urlInput.value = '';
                this.renderAdminImageGallery();
            }
        },

        async previewUploadedImages(event) {
            const files = Array.from(event.target.files || []);
            if (!files.length) return;

            for (const file of files) {
                await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const img = new Image();
                        img.onload = function() {
                            const canvas = document.createElement('canvas');
                            let width = img.width, height = img.height;
                            const maxDim = 1200; // HD (1200px max)

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
                            ctx.imageSmoothingEnabled = true;
                            ctx.imageSmoothingQuality = 'high';
                            ctx.drawImage(img, 0, 0, width, height);

                            let base64Data = canvas.toDataURL('image/webp', 0.85);
                            if (!base64Data.startsWith('data:image/webp')) {
                                base64Data = canvas.toDataURL('image/jpeg', 0.85);
                            }
                            currentPropertyImages.push(base64Data);
                            resolve();
                        };
                        img.onerror = resolve;
                        img.src = e.target.result;
                    };
                    reader.onerror = resolve;
                    reader.readAsDataURL(file);
                });
            }

            this.renderAdminImageGallery();
            event.target.value = '';
        },

        async openAddPropertyModal() {
            document.getElementById('formProperty').reset();
            document.getElementById('propId').value = '';
            currentPropertyImages = [];
            this.renderAdminImageGallery();
            await this.populateSelectors();
            this.toggleSpecFields();
            document.getElementById('propModalTitle').innerText = 'Publicar Nuevo Inmueble';
            this.openModal('modalProperty');
        },

        async editProperty(id) {
            const p = window.globalState.properties.find(x => String(x.id) === String(id));
            if (!p) return;

            document.getElementById('propId').value = p.id;
            if (document.getElementById('propTitle')) document.getElementById('propTitle').value = p.titulo || '';
            if (document.getElementById('propType')) document.getElementById('propType').value = p.tipo_activo || 'Terreno';
            if (document.getElementById('propPrice')) document.getElementById('propPrice').value = p.precio || '';
            if (document.getElementById('propArea')) document.getElementById('propArea').value = p.area_m2 || '';
            if (document.getElementById('propLocation')) document.getElementById('propLocation').value = p.ubicacion || '';
            
            const rawImg = p.imagen_url || p.imagen || '';
            currentPropertyImages = [];

            try {
                if (rawImg && typeof rawImg === 'string' && rawImg.startsWith('[')) {
                    currentPropertyImages = JSON.parse(rawImg);
                } else if (p.imagenes && Array.isArray(p.imagenes)) {
                    currentPropertyImages = p.imagenes;
                } else if (rawImg) {
                    currentPropertyImages = [rawImg];
                }
            } catch (e) {
                if (rawImg) currentPropertyImages = [rawImg];
            }

            this.renderAdminImageGallery();

            if (document.getElementById('propDesc')) document.getElementById('propDesc').value = p.descripcion || '';
            if (document.getElementById('propHabitaciones')) document.getElementById('propHabitaciones').value = p.habitaciones || '';
            if (document.getElementById('propBanos')) document.getElementById('propBanos').value = p.banos || '';
            if (document.getElementById('propZonificacion')) document.getElementById('propZonificacion').value = p.zonificacion || '';
            if (document.getElementById('propParametros')) document.getElementById('propParametros').value = p.parametros || '';
            if (document.getElementById('propStatus')) document.getElementById('propStatus').value = p.estado || 'Disponible';

            await this.populateSelectors();
            if (document.getElementById('propAgent')) document.getElementById('propAgent').value = p.id_agente || '';
            this.toggleSpecFields();
            document.getElementById('propModalTitle').innerText = 'Editar Propiedad';
            this.openModal('modalProperty');
        },

        async saveProperty(e) {
            e.preventDefault();
            const submitBtn = e.target.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;

            const idVal = document.getElementById('propId').value;
            const isUpdate = !!idVal;
            const finalImageVal = currentPropertyImages.length > 1 ? JSON.stringify(currentPropertyImages) : (currentPropertyImages[0] || '');
            
            const payload = {
                titulo: document.getElementById('propTitle')?.value || '',
                tipo_activo: document.getElementById('propType')?.value || 'Terreno',
                precio: parseFloat(document.getElementById('propPrice')?.value) || 0,
                area_m2: parseFloat(document.getElementById('propArea')?.value) || 0,
                ubicacion: document.getElementById('propLocation')?.value || '',
                imagen_url: finalImageVal,
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
                window.invalidateCache('properties');
                if (window.Toast) Toast.success('Propiedad guardada exitosamente en Supabase.');
                this.closeModal('modalProperty');
                window.switchView('inventario');
            } else {
                if (window.Toast) Toast.error('Error al guardar la propiedad en Supabase.');
            }
        },

        async deleteProperty(id) {
            if (confirm('¿Está seguro de eliminar esta propiedad permanentemente de Supabase?')) {
                const success = await api.deleteProperty(id);
                if (success) {
                    window.invalidateCache('properties');
                    if (window.Toast) Toast.success('Propiedad eliminada correctamente.');
                    window.switchView('inventario');
                } else {
                    if (window.Toast) Toast.error('Error al eliminar la propiedad.');
                }
            }
        },

        openAddClientModal() {
            document.getElementById('formClient').reset();
            this.openModal('modalClient');
        },

        async saveClient(e) {
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
                window.invalidateCache('clients');
                if (window.Toast) Toast.success('Lead registrado con éxito.');
                this.closeModal('modalClient');
                window.switchView('crm');
            } else {
                if (window.Toast) Toast.error('Error al registrar el lead.');
            }
        },

        async deleteClient(id) {
            if (confirm('¿Está seguro de eliminar este lead permanentemente?')) {
                const success = await api.deleteClient(id);
                if (success) {
                    window.invalidateCache('clients');
                    if (window.Toast) Toast.success('Lead eliminado.');
                    window.switchView('crm');
                } else {
                    if (window.Toast) Toast.error('Error al eliminar el lead.');
                }
            }
        },

        openAddAgentModal() {
            document.getElementById('formAgent').reset();
            this.openModal('modalAgent');
        },

        async saveAgent(e) {
            e.preventDefault();
            const payload = {
                nombre: document.getElementById('ageName').value,
                email: document.getElementById('ageEmail').value,
                telefono: document.getElementById('agePhone').value
            };
            const success = await api.saveAgent(payload);
            if (success) {
                window.invalidateCache('agents');
                if (window.Toast) Toast.success('Asesor registrado con éxito en Supabase.');
                this.closeModal('modalAgent');
                window.switchView('agentes');
            } else {
                if (window.Toast) Toast.error('Error al registrar el asesor.');
            }
        },

        async populateSelectors() {
            window.globalState.clients = await window.cachedFetch('clients', () => api.fetchClients());
            window.globalState.properties = await window.cachedFetch('properties', () => api.fetchProperties());
            window.globalState.agents = await window.cachedFetch('agents', () => api.fetchAgents());

            const cliSelect = document.getElementById('intCliente');
            if (cliSelect) {
                cliSelect.innerHTML = '';
                window.globalState.clients.forEach(c => cliSelect.innerHTML += `<option value="${c.id}">${escapeHTML(c.nombre_completo)}</option>`);
            }

            const propSelect = document.getElementById('intPropiedad');
            if (propSelect) {
                propSelect.innerHTML = '<option value="">Consulta General (Sin activo específico)</option>';
                window.globalState.properties.forEach(p => propSelect.innerHTML += `<option value="${p.id}">${escapeHTML(p.titulo)}</option>`);
            }

            const agentSelect = document.getElementById('propAgent');
            if (agentSelect) {
                agentSelect.innerHTML = '';
                if (window.globalState.agents.length > 0) {
                    window.globalState.agents.forEach(a => agentSelect.innerHTML += `<option value="${a.id}">${escapeHTML(a.nombre)}</option>`);
                } else {
                    agentSelect.innerHTML = '<option value="">No hay asesores registrados en Supabase</option>';
                }
            }
        },

        async openInteractionModal() {
            await this.populateSelectors();
            document.getElementById('formInteraction').reset();
            this.openModal('modalInteraction');
        },

        async saveInteraction(e) {
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
                window.invalidateCache('interactions');
                if (window.Toast) Toast.success('Interacción guardada con éxito.');
                this.closeModal('modalInteraction');
                window.switchView('dashboard');
            } else {
                if (window.Toast) Toast.error('Error al guardar la interacción.');
            }
        },

        toggleSpecFields() {
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
    };
})();
