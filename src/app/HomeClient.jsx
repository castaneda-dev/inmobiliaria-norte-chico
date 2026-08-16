'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPropertySlug } from '../utils/slugify';
import WhatsAppButton from '../components/WhatsAppButton';

export default function HomeClient({ 
  initialProperties,
  heroTitle = "Inmobiliaria Norte Chico",
  heroSubtitle = "",
  heroLocation = "Chancay y Huaral"
}) {
  // Parse Supabase data to our UI format
  const [coleccion, setColeccion] = useState(() => {
    const formatted = (initialProperties || []).map(p => {
      const tipo = (p.tipo_activo || '').toLowerCase();
      const esVivienda = (tipo === 'casa' || tipo === 'departamento');
      
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
          imagenesList = ['/PR_GLORIETA_DELUXE.webp'];
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
    return formatted.filter(p => p.estado !== 'Vendido');
  });

  const [filtro, setFiltro] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProp, setSelectedProp] = useState(null);


  const [modalCurrentImgIdx, setModalCurrentImgIdx] = useState(0);

  // Form states for Lead submission
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    paisCode: '+51',
    celular: '',
    interes: ''
  });
  const [formStatus, setFormStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  const [toast, setToast] = useState(null); // { message: '', type: 'success' | 'error' }

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Regla: El campo de Nombre permite un máximo de 100 caracteres.
    if (name === 'nombre' && value.length > 100) return;
    
    // Regla: El celular solo acepta números y formato automático 999 999 999 (9 dígitos max).
    if (name === 'celular') {
      const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 9);
      let formatted = numbersOnly;
      if (numbersOnly.length > 6) {
        formatted = `${numbersOnly.slice(0, 3)} ${numbersOnly.slice(3, 6)} ${numbersOnly.slice(6)}`;
      } else if (numbersOnly.length > 3) {
        formatted = `${numbersOnly.slice(0, 3)} ${numbersOnly.slice(3)}`;
      }
      setFormData(prev => ({
        ...prev,
        celular: formatted
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (formStatus === 'submitting') return;
    
    const rawCelular = (formData.celular || '').replace(/\s/g, '');
    // Regla: El campo de Teléfono solo acepta números de exactamente 9 dígitos.
    if (rawCelular.length !== 9) {
      showToast('El celular debe tener exactamente 9 dígitos.', 'error');
      return;
    }
    
    setFormStatus('submitting');
    try {
      const payload = {
        nombre: formData.nombre,
        email: formData.email,
        telefono: `${formData.paisCode}${rawCelular}`,
        origen: 'Formulario Web Landing',
        notas: formData.interes ? `Interés: ${formData.interes}` : 'Lead desde formulario de contacto'
      };

      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Intentar leer la respuesta. Si no es exitosa o no es JSON válido,
      // lanzamos un error que sea capturado en el catch.
      let data = {};
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error("Respuesta inválida del servidor");
      }

      if (res.ok && data.success) {
        setFormStatus('success');
        showToast('¡Datos enviados con éxito! Un asesor se contactará contigo.', 'success');
        setFormData({
          nombre: '',
          email: '',
          paisCode: '+51',
          celular: '',
          interes: ''
        });
      } else {
        setFormStatus('error');
        showToast(data.error || 'Hubo un error al enviar el formulario. Intenta nuevamente.', 'error');
      }
    } catch (err) {
      console.error("Form submission error:", err);
      setFormStatus('error');
      showToast('Hubo un error de red al enviar el formulario.', 'error');
    }
  };

  // Carousel Hero state
  const [heroIdx, setHeroIdx] = useState(0);
  const heroImgs = [
    'PR_PLAZA_CHANCAY_desktop.webp',
    'PR_PLAZA_HUARAL_desktop.webp',
    'PR_ECOTRULY_PARK_desktop.webp',
    'PR_CHANCAY_desktop.webp'
  ];

  const moveCarousel = (dir) => {
    setHeroIdx(prev => (prev + dir + heroImgs.length) % heroImgs.length);
  };

  const propiedadesFiltradas = filtro === 'todos' 
    ? coleccion 
    : coleccion.filter(p => p.categoria === filtro);

  const total = coleccion.length;
  const viviendas = coleccion.filter(p => p.categoria === 'vivienda').length;
  const terrenos = coleccion.filter(p => p.categoria === 'terreno').length;

  const abrirModal = (e, prop) => {
    if (e.target.closest('a')) return;
    e.stopPropagation();
    setSelectedProp(prop);
    setModalCurrentImgIdx(0);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setSelectedProp(null);
  };

  const moveModalCarousel = (dir, e) => {
    if (e) e.stopPropagation();
    if (!selectedProp || !selectedProp.imagenes) return;
    setModalCurrentImgIdx(prev => (prev + dir + selectedProp.imagenes.length) % selectedProp.imagenes.length);
  };

  const filtrarYNavegar = (e, tipoFiltro) => {
    e.preventDefault();
    setFiltro(tipoFiltro);
    const target = document.getElementById('portafolio');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ background: '#080808', color: '#fff', minHeight: '100vh', fontFamily: 'Montserrat, sans-serif' }}>
      {/* NAVEGACIÓN */}
      <nav className="hero-initial" style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'rgba(8, 8, 8, 0.65)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(203, 159, 116, 0.08)', padding: '16px 5%', zIndex: 1000 }}>
          <div className="logo-container">
              <span className="logo-main" style={{ letterSpacing: '4px', fontWeight: 900, fontSize: '18px' }}>NORTE CHICO</span>
              <span className="logo-sub" style={{ color: '#cb9f74', letterSpacing: '3px', fontSize: '9px', fontWeight: 600 }}>GRUPO INMOBILIARIO</span>
          </div>
          <div className="nav-links">
              <a href="#portafolio" onClick={(e) => filtrarYNavegar(e, 'vivienda')}>Casas</a>
              <a href="#portafolio" onClick={(e) => filtrarYNavegar(e, 'terreno')}>Lotes Residenciales</a>
              <a href="#contacto" className="btn-pill" style={{ padding: '8px 20px', fontSize: '11px', boxShadow: 'none' }}>Agendar Visita</a>
          </div>
      </nav>

      {/* HERO */}
      <header className="hero hero-initial" style={{ paddingTop: '140px', paddingBottom: '80px', minHeight: '95vh' }}>
          <Image 
              src="/PR_GLORIETA_DELUXE.webp" 
              alt="Inmobiliaria Norte Chico - Terrenos y Lotes en Chancay y Huaral" 
              priority
              fetchPriority="high"
              fill
              sizes="100vw"
              style={{ objectFit: 'cover', objectPosition: 'center', zIndex: 0 }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,8,1) 0%, rgba(8,8,8,0.5) 60%, rgba(8,8,8,0.7) 100%)', zIndex: 1 }} />
          <div className="hero-grid" style={{ zIndex: 2, position: 'relative', maxWidth: '1300px', width: '100%' }}>
              <div className="hero-text">
                  <h1>
                    {heroTitle}
                    {heroSubtitle && (
                      <>
                        <br/>
                        <span style={{ fontSize: '0.8em', fontWeight: 600, display: 'block', marginTop: '10px' }}>{heroSubtitle}</span>
                      </>
                    )}
                  </h1>
                  <span className="sub-heading text-gradient">Terrenos de Alta Plusvalía y Proyectos Residenciales</span>
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'left' }}>
                      <a href="#contacto" className="btn-pill" style={{ fontSize: '13px' }}>Contactar a un asesor</a>
                      <a href="#portafolio" className="btn-outline">Ver Lotes Disponibles</a>
                  </div>
                  <p style={{ marginTop: '20px', fontSize: '12px', color: '#888', textAlign: 'left' }}>
                      *Ubicaciones estratégicas en Chancay y Huaral, Zonas de Alta Plusvalía.
                  </p>
              </div>
              
              {/* CARRUSEL DE FOTOS */}
              <div className="hero-video" style={{ borderRadius: '16px', border: '1px solid rgba(203, 159, 116, 0.25)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
                  <div className="carousel-track" style={{ transform: `translateX(-${heroIdx * 100}%)`, display: 'flex', transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                      {heroImgs.map((img, i) => (
                          <div key={i} style={{ minWidth: '100%', height: '100%', position: 'relative' }}>
                              <Image 
                                  src={'/' + img} 
                                  alt="Inmobiliaria Norte Chico Terrenos en Chancay y Huaral" 
                                  fill 
                                  priority={i <= 1} 
                                  loading={i <= 1 ? "eager" : "lazy"}
                                  fetchPriority={i <= 1 ? "high" : "auto"}
                                  sizes="(max-width: 768px) 100vw, 50vw" 
                                  style={{ objectFit: 'cover' }} 
                                  className="carousel-img" 
                              />
                          </div>
                      ))}
                  </div>
                  <button className="carousel-btn prev-btn" onClick={() => moveCarousel(-1)} style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>&#10094;</button>
                  <button className="carousel-btn next-btn" onClick={() => moveCarousel(1)} style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>&#10095;</button>
                  <div className="carousel-dots" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                      {heroImgs.map((_, i) => (
                          <span key={i} className={`dot ${i === heroIdx ? 'active' : ''}`} onClick={() => setHeroIdx(i)}></span>
                      ))}
                  </div>
              </div>
          </div>
      </header>

      {/* PUNTO DE REFERENCIA PRINCIPAL (MAIN) */}
      <main>
          {/* LA SECCIÓN DE LOGROS / ESTADÍSTICAS HA SIDO MOVIDA AL TEXTO DEL HERO PARA AHORRAR ESPACIO */}

          {/* COLECCIÓN */}
          <section className="featured-section fade-module" id="portafolio">
            <div className="featured-container">
              <h2 className="section-title">Propiedades y Terrenos en <span className="text-gradient">{heroLocation}</span></h2>
              <div className="filter-controls">
                  <button className={`btn-outline ${filtro === 'todos' ? 'btn-active' : ''}`} onClick={() => setFiltro('todos')}>
                      Todos <span className="filter-count">{total}</span>
                  </button>
                  <button className={`btn-outline ${filtro === 'vivienda' ? 'btn-active' : ''}`} onClick={() => setFiltro('vivienda')}>
                      Casas <span className="filter-count">{viviendas}</span>
                  </button>
                  <button className={`btn-outline ${filtro === 'terreno' ? 'btn-active' : ''}`} onClick={() => setFiltro('terreno')}>
                      Lotes de Inversión <span className="filter-count">{terrenos}</span>
                  </button>
              </div>

              <div className="properties-grid">
                  {propiedadesFiltradas.length === 0 ? (
                      <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px', width: '100%', gridColumn: '1 / -1' }}>
                          <div className="empty-icon" style={{ fontSize: '40px', marginBottom: '15px' }}>🏠</div>
                          <h3 style={{ color: '#fff', marginBottom: '8px', fontSize: '20px' }}>No hay inmuebles publicados actualmente</h3>
                          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Las propiedades disponibles aparecerán automáticamente aquí.</p>
                      </div>
                  ) : (
                      propiedadesFiltradas.map(prop => (
                          <article key={prop.id} className="property-card" onClick={(e) => abrirModal(e, prop)}>
                              <div className="property-img">
                                  {prop.imagenes && prop.imagenes.length > 1 && (
                                      <div className="tag-photos">📷 {prop.imagenes.length} Fotos</div>
                                  )}
                                  <Image src={prop.imagen} alt={prop.titulo} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover' }} className="property-img-next" />
                              </div>
                              <div className="property-info">
                                  <div className="property-price">{prop.precio}</div>
                                  <h3 className="property-title">{prop.titulo}</h3>
                                  <div className="property-specs">
                                      {prop.categoria === 'vivienda' ? (
                                          <>
                                              <span>📐 {prop.area}</span>
                                              <span>🛏️ {prop.habitaciones} Hab</span>
                                              <span>🛁 {prop.banos} Baños</span>
                                          </>
                                      ) : (
                                          <>
                                              <span>📐 {prop.area}</span>
                                              <span>📍 {prop.zonificacion}</span>
                                              <span>🏗️ {prop.parametros}</span>
                                          </>
                                      )}
                                  </div>
                              </div>
                              <div style={{ padding: '0 20px 20px' }}>
                                <Link href={`/${getPropertySlug(prop)}`} prefetch={true} className="btn-outline" style={{ display: 'block', textAlign: 'center', fontSize: '12px', padding: '8px' }}>
                                  Ver Detalles Completos
                                </Link>
                              </div>
                          </article>
                      ))
                  )}
              </div>
            </div>
          </section>

          {/* CONTACTO / CRM */}
          <section className="contact-module fade-module" id="contacto">
              <div className="form-container">
                  <h2>Invierte seguro en el <span className="text-gradient">Norte Chico</span></h2>
                  <p>Déjenos sus datos para organizar un recorrido por nuestros lotes en {heroLocation}.</p>
                  
                  <form onSubmit={handleFormSubmit} className="form-grid">
                      <input 
                          type="text" 
                          name="nombre"
                          placeholder="Nombre Completo" 
                          maxLength={100}
                          value={formData.nombre}
                          onChange={handleInputChange}
                          required 
                      />
                      <input 
                          type="email" 
                          name="email"
                          placeholder="Correo Electrónico" 
                          value={formData.email}
                          onChange={handleInputChange}
                          required 
                      />
                      <div className="phone-input-group">
                          <select 
                              name="paisCode"
                              aria-label="Código de país"
                              value={formData.paisCode}
                              onChange={handleInputChange}
                              required
                          >
                              <option value="+51">🇵🇪 +51</option>
                              <option value="+56">🇨🇱 +56</option>
                              <option value="+54">🇦🇷 +54</option>
                          </select>
                          <input 
                              type="tel" 
                              name="celular"
                              placeholder="Celular (9 dígitos)" 
                              maxLength={11} 
                              value={formData.celular}
                              onChange={handleInputChange}
                              required 
                          />
                      </div>
                      <select 
                          name="interes"
                          aria-label="Tipo de inmueble o consulta"
                          value={formData.interes}
                          onChange={handleInputChange}
                          required
                      >
                          <option value="" disabled>¿Qué estás buscando?</option>
                          <option value="Casa de Campo">Lote para Mi Vivienda</option>
                          <option value="Inversion Futuro">Inversión Patrimonial</option>
                      </select>
                      <button 
                          type="submit" 
                          disabled={formStatus === 'submitting'}
                          className="btn-pill form-full" 
                          style={{ marginTop: '10px' }}
                      >
                          {formStatus === 'submitting' ? 'ENVIANDO...' : 'CONTACTAR CON UN ASESOR'}
                      </button>
                  </form>
              </div>
          </section>
      </main>

      {/* FOOTER */}
      <footer className="fade-module" style={{ background: 'var(--bg-black)', padding: '40px 5% 40px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="logo-main" style={{ fontSize: '16px', marginBottom: '10px' }}>INMOBILIARIA NORTE CHICO | CHANCAY Y HUARAL</div>
          <p style={{ fontSize: '12px', color: '#a3a3a3' }}>2026 © Inmobiliaria Norte Chico S.A.C. Todos los derechos reservados.</p>
      </footer>

      {/* WHATSAPP FLOATING BUTTON WITH CONVERSATIONAL TOOLTIP */}
      <WhatsAppButton />

      {/* MODAL HD CAROUSEL */}
      {modalOpen && selectedProp && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={cerrarModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={cerrarModal}>×</button>
                <div className="modal-img" style={{ backgroundImage: `url('${selectedProp.imagenes[modalCurrentImgIdx]}')` }}>
                  {selectedProp.imagenes.length > 1 && (
                    <div className="modal-carousel-overlay">
                        <button className="modal-carousel-arrow prev" onClick={(e) => moveModalCarousel(-1, e)}>&#10094;</button>
                        <button className="modal-carousel-arrow next" onClick={(e) => moveModalCarousel(1, e)}>&#10095;</button>
                        <div className="modal-carousel-dots">
                            {selectedProp.imagenes.map((_, idx) => (
                              <span key={idx} className={`modal-dot ${idx === modalCurrentImgIdx ? 'active' : ''}`}></span>
                            ))}
                        </div>
                        <div className="modal-photo-counter">📷 {modalCurrentImgIdx + 1} / {selectedProp.imagenes.length}</div>
                    </div>
                  )}
                </div>
                <div className="modal-body">
                    <h2>{selectedProp.titulo}</h2>
                    <div className="price">{selectedProp.precio}</div>
                    <p className="desc">{selectedProp.descripcion}</p>
                    <div className="modal-specs">
                        <div><strong>Área Total</strong><br/>{selectedProp.area}</div>
                        {selectedProp.categoria === 'vivienda' ? (
                          <>
                            <div><strong>Habitaciones</strong><br/>{selectedProp.habitaciones}</div>
                            <div><strong>Baños</strong><br/>{selectedProp.banos}</div>
                          </>
                        ) : (
                          <>
                            <div><strong>Zonificación</strong><br/>{selectedProp.zonificacion}</div>
                            <div><strong>Parámetros</strong><br/>{selectedProp.parametros}</div>
                          </>
                        )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                        <a href={`https://wa.me/56982816844?text=Hola,%20me%20interesa%20el%20inmueble:%20${selectedProp.titulo}`} target="_blank" className="btn-pill" style={{ width: '100%', textAlign: 'center', background: '#25d366', color: '#fff', boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)' }} rel="noreferrer">
                          💬 CONSULTAR POR WHATSAPP
                        </a>
                        <Link href={`/${getPropertySlug(selectedProp)}`} className="btn-outline" style={{ width: '100%', textAlign: 'center', padding: '14px 20px' }}>
                          🔍 VER DETALLES DEL INMUEBLE
                        </Link>
                    </div>
                </div>
            </div>
        </div>
      )}
      {/* Toast Notification */}
      {toast && (
        <div className="toast-container">
          <div className="toast" style={{ borderLeft: toast.type === 'success' ? '4px solid #10b981' : '4px solid #ef4444' }}>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
