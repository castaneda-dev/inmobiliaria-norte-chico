"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../supabaseClient';

const heroImages = [
  '/PR_PLAZA_HUARAL_desktop.webp',
  '/PR_PLAZA_CHANCAY_desktop.webp',
  '/PR_ECOTRULY_PARK_desktop.webp',
  '/PR_CHANCAY_desktop.webp'
];

export default function HomeView({ initialProperties }) {
  const [properties, setProperties] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [activeHeroImgIdx, setActiveHeroImgIdx] = useState(0);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    prefijo: '+51',
    interes: ''
  });
  const [status, setStatus] = useState('idle');

  // Parse properties initially
  useEffect(() => {
    if (initialProperties) {
      const parsed = initialProperties.map(p => {
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
          imagenesList = ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85'];
        }

        const formattedPrecio = typeof p.precio === 'number' 
          ? '$' + parseFloat(p.precio).toLocaleString() 
          : (p.precio || '$0');

        return {
          id: p.id,
          categoria: esVivienda ? 'vivienda' : 'terreno',
          estado: p.estado || 'Disponible',
          titulo: p.titulo,
          precio: formattedPrecio,
          imagen: imagenesList[0],
          imagenes: imagenesList,
          area: typeof p.area_m2 === 'number' ? p.area_m2 + ' m²' : (p.area_m2 || p.area || '0 m²'),
          habitaciones: p.habitaciones || '0',
          banos: p.banos || '0',
          zonificacion: p.zonificacion || 'Residencial',
          parametros: p.parametros || 'Estándar',
          descripcion: p.descripcion || 'Propiedad disponible.'
        };
      }).filter(p => p.estado !== 'Vendido');
      
      setProperties(parsed);
    }
  }, [initialProperties]);

  // Hero carousel auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroImgIdx(prev => (prev + 1) % heroImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const moveCarousel = (dir) => {
    setActiveHeroImgIdx(prev => {
      let next = prev + dir;
      if (next < 0) return heroImages.length - 1;
      return next % heroImages.length;
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const fullPhone = `${formData.prefijo} ${formData.telefono}`;
      const { error } = await supabase.from('clientes').insert([{
        nombre: formData.nombre,
        email: formData.email,
        telefono: fullPhone,
        notas: `[Consulta Web Home] Interés principal: ${formData.interes}`,
        estado: 'Nuevo',
        origen: 'Web Home'
      }]);

      if (error) throw error;
      setStatus('success');
      setFormData({ nombre: '', email: '', telefono: '', prefijo: '+51', interes: '' });
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  // Filter metrics
  const countTodos = properties.length;
  const countVivienda = properties.filter(p => p.categoria === 'vivienda').length;
  const countTerreno = properties.filter(p => p.categoria === 'terreno').length;

  const filteredProperties = selectedCategory === 'todos' 
    ? properties 
    : properties.filter(p => p.categoria === selectedCategory);

  return (
    <>
      <link rel="stylesheet" href="/assets/css/index.min.css" />
      
      {/* NAVEGACIÓN */}
      <nav className="hero-initial">
        <div className="logo-container">
          <span className="logo-main">NORTE CHICO</span>
          <span className="logo-sub">GRUPO INMOBILIARIO</span>
        </div>
        <div className="nav-links">
          <a href="#portafolio" onClick={() => setSelectedCategory('vivienda')}>Casas</a>
          <a href="#portafolio" onClick={() => setSelectedCategory('terreno')}>Lotes Residenciales</a>
          <a href="#contacto" className="btn-pill" style={{ padding: '10px 25px', fontSize: '12px' }}>Agendar Visita</a>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero hero-initial">
        <div className="hero-grid">
          <div className="hero-text">
            <h1>Invierte en tu futuro<br />y en el de tu<br />familia</h1>
            <span className="sub-heading text-gradient">Descubre tu próximo hogar</span>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'left' }}>
              <a href="#contacto" className="btn-pill" style={{ fontSize: '13px' }}>Contactar a un asesor</a>
              <a href="#portafolio" className="btn-outline">Ver Lotes Disponibles</a>
            </div>
            <p style={{ marginTop: '20px', fontSize: '12px', color: '#888', textAlign: 'left' }}>
              *Terrenos de alta plusvalía ideales para retiro y bienestar familiar.
            </p>
          </div>

          {/* CARRUSEL DE FOTOS */}
          <div className="hero-video">
            <div className="carousel-track">
              <img 
                src={heroImages[activeHeroImgIdx]} 
                alt="Propiedad Norte Chico" 
                className="carousel-img"
              />
            </div>
            <button className="carousel-btn prev-btn" onClick={() => moveCarousel(-1)} aria-label="Imagen anterior">
              &#10094;
            </button>
            <button className="carousel-btn next-btn" onClick={() => moveCarousel(1)} aria-label="Siguiente imagen">
              &#10095;
            </button>
            <div className="carousel-dots">
              {heroImages.map((_, idx) => (
                <button
                  key={idx}
                  className={`carousel-dot ${activeHeroImgIdx === idx ? 'active' : ''}`}
                  onClick={() => setActiveHeroImgIdx(idx)}
                  aria-label={`Ir a imagen ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main>
        {/* COLECCIÓN */}
        <section className="featured-section" id="portafolio">
          <h2 className="section-title">Nuestra <span className="text-gradient">Colección Residencial</span></h2>
          
          <div className="filter-controls">
            <button 
              className={`btn-outline ${selectedCategory === 'todos' ? 'btn-active' : ''}`}
              onClick={() => setSelectedCategory('todos')}
            >
              Todos <span className="filter-count">{countTodos}</span>
            </button>
            <button 
              className={`btn-outline ${selectedCategory === 'vivienda' ? 'btn-active' : ''}`}
              onClick={() => setSelectedCategory('vivienda')}
            >
              Casas <span className="filter-count">{countVivienda}</span>
            </button>
            <button 
              className={`btn-outline ${selectedCategory === 'terreno' ? 'btn-active' : ''}`}
              onClick={() => setSelectedCategory('terreno')}
            >
              Lotes de Inversión <span className="filter-count">{countTerreno}</span>
            </button>
          </div>

          <div className="properties-grid">
            {filteredProperties.length === 0 ? (
              <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px', width: '100%', gridColumn: '1 / -1' }}>
                <div className="empty-icon" style={{ fontSize: '40px', marginBottom: '15px' }}>🏠</div>
                <h3 style={{ color: '#fff', marginBottom: '8px', fontSize: '20px' }}>No hay inmuebles publicados actualmente</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Las propiedades disponibles aparecerán automáticamente aquí.</p>
              </div>
            ) : (
              filteredProperties.map(prop => {
                const isVivienda = prop.categoria === 'vivienda';
                const specs = isVivienda ? (
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
                );

                return (
                  <Link href={`/proyecto/${prop.id}`} key={prop.id} passHref legacyBehavior>
                    <article className="property-card" style={{ cursor: 'pointer' }}>
                      <div className="property-img">
                        <div className="tag-status">{prop.estado}</div>
                        {prop.imagenes.length > 1 && (
                          <div className="tag-photos">📷 {prop.imagenes.length} Fotos</div>
                        )}
                        <img src={prop.imagen} alt={prop.titulo} loading="lazy" />
                      </div>
                      <div className="property-info">
                        <div className="property-price">{prop.precio}</div>
                        <h3 className="property-title">{prop.titulo}</h3>
                        <div className="property-specs">{specs}</div>
                      </div>
                    </article>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        {/* CONTACTO / CRM */}
        <section className="contact-module" id="contacto">
          <div className="form-container">
            <h2>Construye el futuro de <span className="text-gradient">tu Familia</span></h2>
            <p>Déjenos sus datos para organizar un recorrido por nuestros lotes en Huaral y Chancay.</p>
            
            <form onSubmit={handleFormSubmit} className="form-grid">
              <input 
                type="text" 
                placeholder="Nombre Completo" 
                required 
                value={formData.nombre}
                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                aria-label="Nombre Completo" 
              />
              <input 
                type="email" 
                placeholder="Correo Electrónico" 
                required 
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                aria-label="Correo Electrónico" 
              />
              <div className="phone-input-group">
                <select 
                  value={formData.prefijo}
                  onChange={e => setFormData({ ...formData, prefijo: e.target.value })}
                  aria-label="Prefijo telefónico de país"
                >
                  <option value="+51">🇵🇪 +51</option>
                  <option value="+56">🇨🇱 +56</option>
                  <option value="+54">🇦🇷 +54</option>
                  <option value="+57">🇨🇴 +57</option>
                  <option value="+52">🇲🇽 +52</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+34">🇪🇸 +34</option>
                </select>
                <input 
                  type="tel" 
                  placeholder="Celular (9 dígitos)" 
                  pattern="[0-9]{9}"
                  maxLength="9" 
                  required 
                  value={formData.telefono}
                  onChange={e => setFormData({ ...formData, telefono: e.target.value.replace(/[^0-9]/g, '') })}
                  aria-label="Número de celular" 
                />
              </div>
              <select 
                required 
                value={formData.interes}
                onChange={e => setFormData({ ...formData, interes: e.target.value })}
                aria-label="Tipo de inmueble o consulta"
              >
                <option value="" disabled>¿Qué estás buscando?</option>
                <option value="Casa de Campo">Lote para Mi Vivienda</option>
                <option value="Inversion Futuro">Inversión Patrimonial (Asegurar plusvalía)</option>
                <option value="Retiro">Mi Vivienda de Retiro / Jubilación tranquila</option>
              </select>
              
              <button 
                type="submit" 
                className="btn-pill form-full" 
                style={{ marginTop: '10px' }}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'ENVIANDO...' : 'CONTACTAR CON UN ASESOR'}
              </button>
              
              {status === 'success' && (
                <div className="form-full" style={{ color: '#10B981', textAlign: 'center', marginTop: '15px', fontWeight: 'bold' }}>
                  ¡Tus datos fueron enviados con éxito! Un asesor te contactará a la brevedad.
                </div>
              )}
              {status === 'error' && (
                <div className="form-full" style={{ color: '#EF4444', textAlign: 'center', marginTop: '15px', fontWeight: 'bold' }}>
                  Hubo un problema al enviar tus datos. Por favor, intenta de nuevo.
                </div>
              )}
            </form>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer style={{ background: 'var(--bg-black)', padding: '40px 5% 40px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="logo-main" style={{ fontSize: '16px', marginBottom: '10px' }}>NORTE CHICO PROPERTIES</div>
        <p style={{ fontSize: '12px', color: '#a3a3a3' }}>2026 © Norte Chico S.A.C. Todos los derechos reservados.</p>
      </footer>

      {/* WHATSAPP FLOATING BUTTON */}
      <a 
        href="https://wa.me/56982816844?text=Hola,%20me%20interesa%20información%20sobre%20sus%20propiedades"
        target="_blank" 
        rel="noreferrer"
        className="whatsapp-float" 
        id="whatsapp-btn" 
        title="Chatea con nosotros en WhatsApp"
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>

      {/* STICKY CTA PARA MÓVILES */}
      <a href="#contacto" className="mobile-sticky-cta">Contactar un Asesor</a>
    </>
  );
}
