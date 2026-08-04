// ================= CAPA DE DATOS COMPARTIDA (NATIVA SUPABASE) =================
// Dependencias: api (assets/js/api.js)

async function cargarPropiedades() {
    let propiedades = [];

    try {
        const rawData = await api.fetchProperties();
        
        // Mapeo seguro de los datos crudos a la UI
        propiedades = rawData.map(p => {
            const tipo = (p.tipo_activo || '').toLowerCase();
            const esVivienda = (tipo === 'casa' || tipo === 'departamento');
            
            // Parsear fotos múltiples
            let imagenesList = [];
            const rawImg = p.imagen_url || p.imagen || '';
            try {
                if (rawImg && typeof rawImg === 'string' && rawImg.startsWith('[')) {
                    imagenesList = JSON.parse(rawImg);
                } else if (p.imagenes && Array.isArray(p.imagenes)) {
                    imagenesList = p.imagenes;
                } else if (rawImg) {
                    imagenesList = [rawImg];
                }
            } catch (e) {
                if (rawImg) imagenesList = [rawImg];
            }

            if (!imagenesList.length) {
                imagenesList = ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85'];
            }

            return {
                id: p.id,
                categoria: esVivienda ? 'vivienda' : 'terreno',
                estado: p.estado || 'Disponible',
                titulo: p.titulo,
                precio: typeof p.precio === 'number' ? '$' + parseFloat(p.precio).toLocaleString() : (p.precio || '$0'),
                imagen: imagenesList[0],
                imagenes: imagenesList,
                area: typeof p.area_m2 === 'number' ? p.area_m2 + ' m²' : (p.area_m2 || p.area || '0 m²'),
                habitaciones: p.habitaciones || '0',
                banos: p.banos || '0',
                zonificacion: p.zonificacion || 'Residencial',
                parametros: p.parametros || 'Estándar',
                descripcion: p.descripcion || 'Propiedad disponible. Contáctenos para más información.'
            };
        });

        // Filtrar vendidos para no mostrarlos al público
        return propiedades.filter(p => p.estado !== 'Vendido');
    } catch (err) {
        console.error("Error al cargar propiedades de la nube:", err);
        return [];
    }
}

let coleccion = [];

const gridContenedor = document.getElementById('grid-propiedades');
const modal = document.getElementById('property-modal');
const body = document.body;

// ================= TOAST NOTIFICATION =================
function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// ================= CONTADORES DE FILTROS =================
function actualizarContadores() {
    const total = coleccion.length;
    const viviendas = coleccion.filter(p => p.categoria === 'vivienda').length;
    const terrenos = coleccion.filter(p => p.categoria === 'terreno').length;
    
    if (document.getElementById('count-todos')) document.getElementById('count-todos').textContent = total;
    if (document.getElementById('count-vivienda')) document.getElementById('count-vivienda').textContent = viviendas;
    if (document.getElementById('count-terreno')) document.getElementById('count-terreno').textContent = terrenos;
}

// ================= RENDERIZADO DE PROPIEDADES =================
function renderizarColeccion(datos) {
    if (!gridContenedor) return;
    gridContenedor.innerHTML = '';

    if (!datos || datos.length === 0) {
        gridContenedor.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 60px 20px; width: 100%; grid-column: 1 / -1;">
                <div class="empty-icon" style="font-size: 40px; margin-bottom: 15px;">🏠</div>
                <h3 style="color: #fff; margin-bottom: 8px; font-size: 20px;">No hay inmuebles publicados actualmente</h3>
                <p style="font-size: 14px; color: var(--text-muted);">Las propiedades disponibles aparecerán automáticamente aquí.</p>
            </div>
        `;
        return;
    }

    datos.forEach(prop => {
        let specsHTML = prop.categoria === 'vivienda'
            ? `<span>📐 ${prop.area}</span> <span>🛏️ ${prop.habitaciones} Hab</span> <span>🛁 ${prop.banos} Baños</span>`
            : `<span>📐 ${prop.area}</span> <span>📍 ${prop.zonificacion}</span> <span>🏗️ ${prop.parametros}</span>`;
        
        const photoBadge = (prop.imagenes && prop.imagenes.length > 1) 
            ? `<div class="tag-photos">📷 ${prop.imagenes.length} Fotos</div>`
            : '';

        gridContenedor.innerHTML += `
            <article class="property-card" onclick="abrirModal(${prop.id})">
                <div class="property-img">
                    <div class="tag-status">${prop.estado}</div>
                    ${photoBadge}
                    <img src="${prop.imagen}" alt="${prop.titulo}" loading="lazy">
                </div>
                <div class="property-info">
                    <div class="property-price">${prop.precio}</div>
                    <h3 class="property-title">${prop.titulo}</h3>
                    <div class="property-specs">${specsHTML}</div>
                </div>
            </article>
        `;
    });
}

function filtrarPorCategoria(categoria) {
    document.querySelectorAll('.filter-controls .btn-outline').forEach(btn => btn.classList.remove('btn-active'));
    const btnActivo = document.getElementById('btn-' + categoria);
    if (btnActivo) btnActivo.classList.add('btn-active');
    
    renderizarColeccion(categoria === 'todos' ? coleccion : coleccion.filter(prop => prop.categoria === categoria));

    const portafolioSection = document.getElementById('portafolio');
    if (portafolioSection) {
        portafolioSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// ================= MODAL HD CAROUSEL & PRELLENADO DE LOTE =================
let modalCurrentImgIdx = 0;
window.currentOpenedProperty = null;

function renderModalCarousel() {
    const container = document.getElementById('modal-img');
    if (!container) return;

    const imgs = window.modalPropImages || [];
    const currentImg = imgs[modalCurrentImgIdx] || imgs[0] || '';

    container.style.backgroundImage = `url('${currentImg}')`;

    if (imgs.length > 1) {
        container.innerHTML = `
            <div class="modal-carousel-overlay">
                <button class="modal-carousel-arrow prev" onclick="moveModalCarousel(-1, event)">&#10094;</button>
                <button class="modal-carousel-arrow next" onclick="moveModalCarousel(1, event)">&#10095;</button>
                <div class="modal-carousel-dots">
                    ${imgs.map((_, idx) => `<span class="modal-dot ${idx === modalCurrentImgIdx ? 'active' : ''}"></span>`).join('')}
                </div>
                <div class="modal-photo-counter">📷 ${modalCurrentImgIdx + 1} / ${imgs.length}</div>
            </div>
        `;
    } else {
        container.innerHTML = '';
    }
}

function moveModalCarousel(dir, e) {
    if (e) e.stopPropagation();
    const imgs = window.modalPropImages || [];
    if (!imgs.length) return;

    modalCurrentImgIdx = (modalCurrentImgIdx + dir + imgs.length) % imgs.length;
    renderModalCarousel();
}

function abrirModal(id) {
    const prop = coleccion.find(p => p.id == id);
    if (!prop || !modal) return;

    window.currentOpenedProperty = prop;
    window.modalPropImages = prop.imagenes || [prop.imagen];
    modalCurrentImgIdx = 0;
    renderModalCarousel();

    document.getElementById('modal-title').innerText = prop.titulo;
    document.getElementById('modal-price').innerText = prop.precio;
    document.getElementById('modal-desc').innerText = prop.descripcion;
    
    let specsHTML = `<div><strong>Área Total</strong><br>${prop.area}</div>`;
    if (prop.categoria === 'vivienda') {
        specsHTML += `<div><strong>Habitaciones</strong><br>${prop.habitaciones}</div><div><strong>Baños</strong><br>${prop.banos}</div>`;
    } else {
        specsHTML += `<div><strong>Zonificación</strong><br>${prop.zonificacion}</div><div><strong>Parámetros</strong><br>${prop.parametros}</div>`;
    }
    
    document.getElementById('modal-specs').innerHTML = specsHTML;

    // Configurar enlace directo a WhatsApp especificando la propiedad
    const wsBtn = document.getElementById('modal-ws-btn');
    if (wsBtn) {
        const wsText = `Hola, estoy viendo en la web el inmueble: ${prop.titulo}. Me gustaría recibir información detallada y ubicación.`;
        wsBtn.href = `https://wa.me/56982816844?text=${encodeURIComponent(wsText)}`;
    }

    modal.classList.add('active');
    body.style.overflow = 'hidden';
    
    // Deep Linking: Update URL Hash
    history.pushState(null, null, '#prop-' + id);
}

function prellenarCRMPropiedad() {
    const prop = window.currentOpenedProperty;
    cerrarModal();

    const contactoSection = document.getElementById('contacto');
    const selectInteres = document.getElementById('crm-interes');
    const badgeBox = document.getElementById('crm-prop-badge');

    if (prop && selectInteres) {
        const valText = `Inmueble: ${prop.titulo}`;
        
        let optExists = Array.from(selectInteres.options).find(o => o.value === valText);
        if (!optExists) {
            const opt = document.createElement('option');
            opt.value = valText;
            opt.textContent = `📍 ${prop.titulo}`;
            selectInteres.appendChild(opt);
        }
        selectInteres.value = valText;

        if (badgeBox) {
            badgeBox.innerHTML = `📍 Solicitando atención personalizada para: <strong>${prop.titulo}</strong>`;
            badgeBox.style.display = 'block';
        }
    }

    if (contactoSection) {
        contactoSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
            const nameInput = document.getElementById('crm-nombre');
            if (nameInput) nameInput.focus();
        }, 400);
    }
}

function cerrarModal() { 
    if (modal) {
        modal.classList.remove('active'); 
        body.style.overflow = ''; 
        
        // Deep Linking: Clear URL Hash safely
        if (window.location.hash.startsWith('#prop-')) {
            history.pushState(null, null, ' ');
        }
    }
}

if (modal) {
    modal.addEventListener('click', (e) => { if (e.target === modal) cerrarModal(); });
}

// ================= CRM CONECTADO A SUPABASE =================
async function enviarCRM(origenMarca) {
    const btnSubmit = document.querySelector('#contacto form button');
    
    const nombre = document.getElementById('crm-nombre')?.value;
    const email = document.getElementById('crm-email')?.value;
    const prefijo = document.getElementById('crm-prefijo')?.value;
    const telefono = document.getElementById('crm-telefono')?.value;
    const interes = document.getElementById('crm-interes')?.value;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nombre) { showToast('⚠️ Ingrese su nombre completo.'); return; }
    if (!email || !emailRegex.test(email)) { showToast('⚠️ Ingrese un correo electrónico válido.'); return; }
    if (!telefono || telefono.length !== 9) { showToast('⚠️ Ingrese un celular válido de 9 dígitos.'); return; }
    if (!interes) { showToast('⚠️ Seleccione una opción de interés.'); return; }

    // Bloquear botón para prevenir doble submit
    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = 'Enviando...';
    }

    // Meta Ads Pixel Event
    if (typeof fbq === 'function') {
        fbq('track', 'Lead');
    }

    const payload = {
        nombre_completo: nombre,
        telefono: prefijo + ' ' + telefono,
        email: email,
        estado_lead: 'Nuevo',
        origen: origenMarca,
        tipo_interes: interes,
        fecha_registro: new Date().toISOString().split('T')[0]
    };

    // 1. Guardar en Supabase DB Cloud usando api.js (sin localStorage)
    const success = await api.saveClient(payload);

    if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = 'Solicitar Asesoría Personalizada';
    }

    if (success) {
        showToast('✅ ¡Datos recibidos! Un asesor se comunicará pronto.');

        // Redirección de WhatsApp opcional con mensaje prellenado
        let propContext = '';
        if (window.currentOpenedProperty && interes === 'Inmueble: ' + window.currentOpenedProperty.titulo) {
            propContext = `%0A%0A📌 *Propiedad de Interés:* ${encodeURIComponent(window.currentOpenedProperty.titulo)}`;
        }
        
        const wsMsg = `Hola,%20soy%20*${encodeURIComponent(nombre)}*.%20Me%20interesa%20recibir%20asesoría%20sobre:%20${encodeURIComponent(interes)}${propContext}`;
        setTimeout(() => {
            window.open(`https://wa.me/56982816844?text=${wsMsg}`, '_blank');
        }, 1000);

        // Limpiar form
        document.getElementById('crm-nombre').value = '';
        document.getElementById('crm-email').value = '';
        document.getElementById('crm-telefono').value = '';
        document.getElementById('crm-interes').value = '';
    } else {
        showToast('❌ Ocurrió un error al enviar tu solicitud. Intenta nuevamente.');
    }
}

// ================= INICIALIZACIÓN Y SUSCRIPCIONES =================
async function initApp() {
    coleccion = await cargarPropiedades();
    renderizarColeccion(coleccion);
    actualizarContadores();

    // Comprobar si hay Deep Link al cargar la página
    if (window.location.hash && window.location.hash.startsWith('#prop-')) {
        const hashId = window.location.hash.replace('#prop-', '');
        if (hashId && !isNaN(hashId)) {
            setTimeout(() => abrirModal(hashId), 500); // Dar tiempo al renderizado de imagenes
        }
    }

    // Escuchar actualizaciones en vivo desde Supabase Cloud DB
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
        try {
            supabaseClient
                .channel('public:propiedades')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'propiedades' }, async () => {
                    console.log("⚡ Actualizando catálogo en tiempo real desde Supabase Cloud...");
                    coleccion = await cargarPropiedades();
                    renderizarColeccion(coleccion);
                    actualizarContadores();
                })
                .subscribe();
        } catch (e) {
            console.error("Error al suscribirse al canal de Supabase:", e);
        }
    }
}

// Iniciar aplicación al cargar
document.addEventListener('DOMContentLoaded', initApp);

// OBSERVADOR DE INTERSECCIÓN (Animaciones)
const moduleObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        }
    });
}, { root: null, rootMargin: '0px', threshold: 0.15 });

document.querySelectorAll('.fade-module').forEach(modulo => moduleObserver.observe(modulo));

// ================= LÓGICA DEL CARRUSEL =================
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-img');
const track = document.getElementById('carouselTrack');
const dotsContainer = document.getElementById('carouselDots');

// Crear indicadores (dots) si el track existe
if (slides.length > 0 && track && dotsContainer) {
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.classList.add('carousel-dot');
        dot.setAttribute('aria-label', `Ver imagen ${index + 1} de ${slides.length}`);
        dot.setAttribute('title', `Ver imagen ${index + 1}`);
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });


    const dots = document.querySelectorAll('.carousel-dot');

    function updateDots() {
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    function goToSlide(index) {
        currentSlide = index;
        if (currentSlide >= slides.length) currentSlide = 0;
        if (currentSlide < 0) currentSlide = slides.length - 1;
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        updateDots();
    }

    function moveCarousel(direction) {
        goToSlide(currentSlide + direction);
    }

    // Autoplay cada 4 segundos
    let carouselInterval = setInterval(() => moveCarousel(1), 4000);

    // Pausar autoplay al pasar el mouse
    const carouselContainer = document.querySelector('.hero-video');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => clearInterval(carouselInterval));
        carouselContainer.addEventListener('mouseleave', () => {
            clearInterval(carouselInterval);
            carouselInterval = setInterval(() => moveCarousel(1), 4000);
        });
    }
}

// ================= LÓGICA DEL ASISTENTE VIRTUAL IA =================
let aiChatHistory = [];
let aiLeadPrompted = false;

function toggleAIChatModal() {
    const modal = document.getElementById('ai-chat-modal');
    if (modal) {
        modal.classList.toggle('active');
        if (modal.classList.contains('active')) {
            const input = document.getElementById('ai-user-input');
            if (input) setTimeout(() => input.focus(), 300);
        }
    }
}

async function sendAIChatMessage() {
    const inputEl = document.getElementById('ai-user-input');
    const msg = inputEl?.value?.trim();
    if (!msg) return;

    inputEl.value = '';

    // Append User Message
    appendAIChatBubble('user', msg);
    aiChatHistory.push({ role: 'user', content: msg });

    // Show typing indicator
    showAITyping(true);

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'chat',
                message: msg,
                history: aiChatHistory
            })
        });

        const data = await response.json();
        showAITyping(false);

        if (data && data.reply) {
            appendAIChatBubble('bot', data.reply);
            aiChatHistory.push({ role: 'assistant', content: data.reply });

            // Mostrar formulario de captura si el usuario muestra intención de compra / visita
            const lower = msg.toLowerCase();
            if (!aiLeadPrompted && (lower.includes('visita') || lower.includes('comprar') || lower.includes('agenda') || lower.includes('precio') || lower.includes('contacto'))) {
                aiLeadPrompted = true;
                const formBox = document.getElementById('ai-lead-form-box');
                if (formBox) {
                    setTimeout(() => {
                        formBox.style.display = 'block';
                        const msgsBox = document.getElementById('ai-chat-messages');
                        if (msgsBox) msgsBox.scrollTop = msgsBox.scrollHeight;
                    }, 800);
                }
            }
        } else {
            appendAIChatBubble('bot', '🏡 ¡Gracias por tu consulta! Para información detallada, déjanos tu Nombre y WhatsApp en el formulario para contactarte.');
        }
    } catch (err) {
        console.error("Error enviando mensaje al servidor IA:", err);
        showAITyping(false);
        appendAIChatBubble('bot', '🏡 ¡Ofrecemos lotes residenciales en Huaral desde $15,000 USD! Déjanos tus datos en el formulario de abajo para enviarte los planos y lista de precios.');
        const formBox = document.getElementById('ai-lead-form-box');
        if (formBox) formBox.style.display = 'block';
    }
}

function sendQuickMessage(text) {
    const inputEl = document.getElementById('ai-user-input');
    if (inputEl) {
        inputEl.value = text;
        sendAIChatMessage();
    }
    // Ocultar chips de preguntas sugeridas
    const chips = document.getElementById('ai-chips');
    if (chips) chips.style.display = 'none';
}

function appendAIChatBubble(sender, text) {
    const container = document.getElementById('ai-chat-messages');
    if (!container) return;

    const div = document.createElement('div');
    div.className = `ai-msg ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;
    
    // Convertir saltos de línea a <br> y texto en negrita simple
    const formatted = String(text)
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    div.innerHTML = `<div class="ai-bubble">${formatted}</div>`;
    container.appendChild(div);

    // Auto scroll al último mensaje
    container.scrollTop = container.scrollHeight;
}

function showAITyping(show) {
    const typing = document.getElementById('ai-typing');
    if (typing) {
        typing.style.display = show ? 'flex' : 'none';
        const msgs = document.getElementById('ai-chat-messages');
        if (msgs) msgs.scrollTop = msgs.scrollHeight;
    }
}

async function handleAILeadSubmit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    if (btn) {
        btn.disabled = true;
        btn.innerText = 'Enviando a un asesor...';
    }

    const nombre = document.getElementById('aiLeadNombre')?.value;
    const telefono = document.getElementById('aiLeadPhone')?.value;

    const resumenChat = aiChatHistory.map(m => `${m.role}: ${m.content}`).join(' | ');

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'lead',
                lead: {
                    nombre: nombre,
                    telefono: '+51 ' + telefono,
                    interes: 'Atención Vía Asistente IA',
                    resumenChat: resumenChat
                }
            })
        });

        const data = await response.json();
        if (btn) {
            btn.disabled = false;
            btn.innerText = 'RECEPCIONAR ASESORÍA GRATIS';
        }

        if (data.success) {
            document.getElementById('ai-lead-form-box').style.display = 'none';
            appendAIChatBubble('bot', `✅ ¡Muchas gracias **${nombre}**! Hemos registrado tu solicitud de atención. Un asesor oficial de Norte Chico se comunicará contigo al WhatsApp **+51 ${telefono}**.`);
            showToast('✅ ¡Solicitud recibida! Te contactaremos por WhatsApp.');

            // Opcional: abrir WhatsApp
            setTimeout(() => {
                window.open(`https://wa.me/56982816844?text=Hola,%20soy%20${encodeURIComponent(nombre)}.%20Solicité%20información%20con%20el%20Asistente%20IA`, '_blank');
            }, 1200);
        } else {
            showToast('❌ Hubo un error registrando tus datos. Inténtalo nuevamente.');
        }
    } catch (err) {
        console.error("Error registrando lead desde IA:", err);
        if (btn) {
            btn.disabled = false;
            btn.innerText = 'RECEPCIONAR ASESORÍA GRATIS';
        }
        showToast('❌ Error de conexión. Inténtalo nuevamente.');
    }
}

