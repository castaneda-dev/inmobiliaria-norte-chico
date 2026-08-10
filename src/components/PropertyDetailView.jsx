"use client";
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import WhatsAppButton from './WhatsAppButton';

export default function PropertyDetailView({ initialProperty }) {
  const property = initialProperty;
  
  // Memorizar la extracción de lista de imágenes para optimización de rendimiento
  const imagenesList = useMemo(() => {
    if (!property) return ['/PR_GLORIETA_DELUXE.webp'];
    const rawImg = property.imagen_url || property.imagen || '';
    let list = [];
    try {
      if (rawImg && typeof rawImg === 'string' && rawImg.startsWith('[')) {
        list = JSON.parse(rawImg);
      } else if (property.imagenes && Array.isArray(property.imagenes)) {
        list = property.imagenes;
      } else if (rawImg) {
        list = [rawImg];
      }
    } catch (e) {
      if (rawImg) list = [rawImg];
    }
    return list.length ? list : ['/PR_GLORIETA_DELUXE.webp'];
  }, [property]);

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', email: '', celular: '', paisCode: '+51', mensaje: '' });
  const [formStatus, setFormStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [toastMessage, setToastMessage] = useState(null);

  // Coordenadas para Google Maps (por defecto Huaral / Chancay)
  const lat = property?.latitud || property?.lat || -11.53;
  const lng = property?.longitud || property?.lng || -77.24;
  const mapSearchQuery = encodeURIComponent(`${property?.titulo || 'Terrenos Chancay Huaral'} Chancay Huaral Peru`);
  const googleEmbedUrl = `https://maps.google.com/maps?q=${lat},${lng}&hl=es&z=13&output=embed`;
  const googleDirectUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const googleRouteMegapuerto = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=-11.5694,-77.2676`;

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const moveCarousel = (dir) => {
    setActiveImgIdx(prev => (prev + dir + imagenesList.length) % imagenesList.length);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'celular') {
      const numbersOnly = value.replace(/[^0-9]/g, '');
      if (numbersOnly.length > 9) return;
      setFormData(prev => ({ ...prev, celular: numbersOnly }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formStatus === 'loading') return;

    if (formData.celular.length !== 9) {
      showToast('El teléfono celular debe contener 9 dígitos exactos.', 'error');
      return;
    }

    setFormStatus('loading');
    try {
      const payload = {
        nombre: formData.nombre.trim(),
        email: formData.email.trim(),
        telefono: `${formData.paisCode}${formData.celular}`,
        origen: `Web Ficha Proyecto ID-${property?.id || 'General'}`,
        notas: `Interés en: ${property?.titulo || 'Propiedad'} - ${formData.mensaje ? `Mensaje: ${formData.mensaje}` : 'Consulta de disponibilidad'}`
      };

      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFormStatus('success');
        showToast('¡Solicitud registrada con éxito! Un asesor patrimonial te contactará.', 'success');
        setFormData({ nombre: '', email: '', celular: '', paisCode: '+51', mensaje: '' });
      } else {
        throw new Error(data.error || 'Error al enviar');
      }
    } catch (err) {
      console.error("Form error:", err);
      setFormStatus('error');
      showToast('Ocurrió un inconveniente al enviar la consulta. Intenta nuevamente.', 'error');
    }
  };

  if (!property) {
    return (
      <main style={{ backgroundColor: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Montserrat, sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>Inmueble No Encontrado</h1>
          <p style={{ color: '#888', marginBottom: '24px' }}>El proyecto solicitado no se encuentra disponible actualmente.</p>
          <Link href="/" className="btn-pill">Volver al Catálogo Principal</Link>
        </div>
      </main>
    );
  }

  const precioFormat = typeof property.precio === 'number' ? '$' + parseFloat(property.precio).toLocaleString() : (property.precio || '$0');
  const whatsappMsg = `Hola Inmobiliaria Norte Chico, me interesa información y disponibilidad del proyecto ID-${property.id}: ${property.titulo}.`;

  return (
    <div style={{ backgroundColor: '#080808', color: '#fff', minHeight: '100vh', fontFamily: 'Montserrat, sans-serif', overflowX: 'hidden' }}>
      
      {/* NAVEGACIÓN SUPERIOR */}
      <nav className="hero-initial">
        <div className="logo-container">
          <span className="logo-main">NORTE CHICO</span>
          <span className="logo-sub">GRUPO INMOBILIARIO</span>
        </div>
        <div className="nav-links">
          <Link href="/#portafolio">Lotes Residenciales</Link>
          <Link href="/#contacto" className="btn-pill" style={{ padding: '8px 20px', fontSize: '12px' }}>Agendar Visita</Link>
        </div>
      </nav>

      {/* MIGA DE PAN (BREADCRUMB) */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '100px 5% 0 5%', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#888', flexWrap: 'wrap' }}>
        <Link href="/" style={{ color: '#aaa', textDecoration: 'none' }}>Inicio</Link>
        <span>/</span>
        <Link href="/#portafolio" style={{ color: '#aaa', textDecoration: 'none' }}>Colección Residencial</Link>
        <span>/</span>
        <span style={{ color: 'var(--gold-light, #cb9f74)', fontWeight: 600 }}>{property.titulo}</span>
      </div>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px 5% 60px 5%', width: '100%', boxSizing: 'border-box' }}>
        
        {/* CABECERA PRINCIPAL CON TÍTULO Y BADGES */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
            <span style={{ background: 'linear-gradient(135deg, #cb9f74, #e2b988)', color: '#000', padding: '4px 14px', borderRadius: '16px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
              {property.tipo_activo || 'Terreno'}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#10b981', padding: '4px 14px', borderRadius: '16px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
              ✓ Saneado 100% SUNARP
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, lineHeight: '1.15', margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>
            {property.titulo}
          </h1>
          <p style={{ color: '#aaa', fontSize: '14px', margin: 0 }}>📍 Chancay - Huaral, Norte Chico, Lima, Perú</p>
        </div>

        {/* ESTRUCTURA EN DOS COLUMNAS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'start' }}>
          
          {/* COLUMNA IZQUIERDA: GALERÍA HD */}
          <div style={{ width: '100%' }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', minHeight: '320px', maxHeight: '560px', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#111', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
              
              <Image 
                src={imagenesList[activeImgIdx]} 
                alt={`${property.titulo} - Vista ${activeImgIdx + 1}`} 
                fill 
                priority 
                sizes="(max-width: 768px) 100vw, 60vw"
                style={{ objectFit: 'cover' }} 
              />
              
              {/* Botón Pantalla Completa */}
              <button 
                onClick={() => setLightboxOpen(true)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', backdropFilter: 'blur(8px)', zIndex: 5, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                🔍 Pantalla Completa HD
              </button>

              {/* Contadores e Indicadores */}
              <div style={{ position: 'absolute', bottom: '16px', left: '16px', background: 'rgba(0,0,0,0.75)', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, backdropFilter: 'blur(6px)' }}>
                📷 {activeImgIdx + 1} / {imagenesList.length}
              </div>

              {/* Flechas del Carrusel */}
              {imagenesList.length > 1 && (
                <>
                  <button className="carousel-btn prev-btn" style={{ background: 'rgba(0,0,0,0.6)', borderColor: '#cb9f74' }} onClick={() => moveCarousel(-1)}>&#10094;</button>
                  <button className="carousel-btn next-btn" style={{ background: 'rgba(0,0,0,0.6)', borderColor: '#cb9f74' }} onClick={() => moveCarousel(1)}>&#10095;</button>
                </>
              )}
            </div>

            {/* Miniaturas (Thumbnails) */}
            {imagenesList.length > 1 && (
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '16px 0', scrollbarWidth: 'thin' }}>
                {imagenesList.map((img, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setActiveImgIdx(idx)}
                    style={{ position: 'relative', width: '100px', height: '70px', borderRadius: '12px', overflow: 'hidden', border: idx === activeImgIdx ? '2px solid #cb9f74' : '2px solid transparent', opacity: idx === activeImgIdx ? 1 : 0.55, cursor: 'pointer', transition: 'all 0.2s ease', flexShrink: 0 }}
                  >
                    <Image src={img} alt={`${property.titulo} miniatura ${idx + 1}`} fill sizes="100px" style={{ objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}

            {/* BLOQUE DE SELLOS DE SEGURIDAD JURÍDICA */}
            <div style={{ marginTop: '30px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>🛡️</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Garantía Registral</div>
                  <div style={{ fontSize: '11px', color: '#888' }}>Partida e independización limpia en SUNARP</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>📜</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Transferencia Inmediata</div>
                  <div style={{ fontSize: '11px', color: '#888' }}>Sin cargas ni gravámenes pendientes</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>⚡</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Servicios Básicos</div>
                  <div style={{ fontSize: '11px', color: '#888' }}>Factibilidad técnica habilitada</div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: CAJA DE PRECIO Y ACCIONES */}
          <div style={{ width: '100%' }}>
            <div style={{ background: 'rgba(18, 18, 18, 0.85)', backdropFilter: 'blur(16px)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
              
              <div style={{ fontSize: '11px', color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                Precio Promocional de Inversión
              </div>
              <div style={{ fontSize: 'clamp(36px, 3.5vw, 48px)', fontWeight: 900, background: 'linear-gradient(135deg, #fff, #cb9f74)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '24px', lineHeight: '1' }}>
                {precioFormat}
              </div>

              <div style={{ fontSize: '14px', color: '#ccc', lineHeight: '1.7', marginBottom: '30px' }}>
                {property.descripcion || 'Inmueble residencial y de inversión ubicado estratégicamente en el corredor de alta plusvalía de Chancay y Huaral. Ideal para desarrollo familiar, casa de campo o reserva patrimonial.'}
              </div>

              {/* BOTONES DE ACCIÓN DE ALTA CONVERSIÓN */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '30px' }}>
                <a 
                  href={`https://wa.me/56982816844?text=${encodeURIComponent(whatsappMsg)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-pill" 
                  style={{ width: '100%', textAlign: 'center', padding: '18px 24px', fontSize: '14px', background: '#25d366', color: '#fff', boxShadow: '0 4px 20px rgba(37, 211, 102, 0.35)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}
                >
                  💬 Consultar Disponibilidad por WhatsApp
                </a>
                <a 
                  href="#contacto-ficha" 
                  className="btn-outline" 
                  style={{ textAlign: 'center', width: '100%', fontSize: '13px', padding: '16px 20px' }}
                >
                  📅 Agendar Recorrido Guiado
                </a>
              </div>

              {/* TARJETA DE ASESOR PATRIMONIAL DEDICADO */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ position: 'relative', width: '54px', height: '54px', borderRadius: '50%', overflow: 'hidden', background: '#cb9f74', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                  👨‍💼
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>Asesor Inmobiliario Senior</div>
                  <div style={{ fontSize: '11px', color: '#cb9f74' }}>Grupo Inmobiliario Norte Chico</div>
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>Atención inmediata en Huaral y Chancay</div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* SECCIÓN 2: ESPECIFICACIONES TÉCNICAS Y GOOGLE MAPS INTERACTIVO */}
        <div style={{ marginTop: '60px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
          
          {/* ESPECIFICACIONES TÉCNICAS */}
          <div style={{ background: 'rgba(18, 18, 18, 0.7)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: '#fff' }}>
              Especificaciones Técnicas
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '14px' }}>
                <span style={{ color: '#888', fontSize: '13px', fontWeight: 600 }}>Área Total:</span>
                <span style={{ fontWeight: 800, color: '#cb9f74' }}>{property.area_m2 || property.area || 'Consultar'} m²</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '14px' }}>
                <span style={{ color: '#888', fontSize: '13px', fontWeight: 600 }}>Zonificación:</span>
                <span style={{ fontWeight: 700, color: '#fff' }}>{property.zonificacion || 'Residencial / Comercio'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '14px' }}>
                <span style={{ color: '#888', fontSize: '13px', fontWeight: 600 }}>Estado del Proyecto:</span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>{property.estado || 'Disponible'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px' }}>
                <span style={{ color: '#888', fontSize: '13px', fontWeight: 600 }}>Parámetros de Construcción:</span>
                <span style={{ fontWeight: 700, color: '#fff' }}>{property.parametros || 'Estándar Municipal'}</span>
              </div>
            </div>
          </div>

          {/* MÓDULO GOOGLE MAPS PLATFORM INTERACTIVO */}
          <div style={{ background: 'rgba(18, 18, 18, 0.7)', borderRadius: '24px', padding: '24px', border: '1px solid rgba(203, 159, 116, 0.3)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🗺️ Google Maps | Eje Logístico
                </h2>
                <p style={{ fontSize: '12px', color: '#cb9f74', margin: '4px 0 0 0', fontWeight: 700 }}>
                  Ubicación Estratégica en Chancay - Huaral
                </p>
              </div>

              {/* Botón directo a Google Maps App */}
              <a 
                href={googleDirectUrl} 
                target="_blank" 
                rel="noreferrer"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '8px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                📍 Abrir en Google Maps
              </a>
            </div>

            {/* EMBED GOOGLE MAPS IFRAME FLUIDO */}
            <div style={{ width: '100%', height: '280px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#111' }}>
              <iframe
                title="Google Maps Ubicación del Proyecto"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={googleEmbedUrl}
              ></iframe>
            </div>

            {/* MÉTRICAS DEL EJE LOGÍSTICO Y RUTAS RÁPIDAS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '11px', color: '#888', fontWeight: 600 }}>⚓ Megapuerto Chancay</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#cb9f74', marginTop: '2px' }}>~10 mins</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '11px', color: '#888', fontWeight: 600 }}>🏙️ Plaza de Armas</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>~8 mins</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '11px', color: '#888', fontWeight: 600 }}>🌾 Valle Huaral</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>~12 mins</div>
              </div>
            </div>

            <a 
              href={googleRouteMegapuerto}
              target="_blank"
              rel="noreferrer"
              style={{ textAlign: 'center', background: 'rgba(203, 159, 116, 0.15)', border: '1px solid #cb9f74', color: '#cb9f74', padding: '12px', borderRadius: '12px', fontSize: '12px', fontWeight: 800, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.5px' }}
            >
              🚗 Ver Ruta Directa al Megapuerto en Google Maps
            </a>

          </div>

        </div>

        {/* SECCIÓN 3: FORMULARIO DE CAPTACIÓN CENTRALIZADO */}
        <section className="contact-module fade-module" id="contacto-ficha" style={{ marginTop: '60px' }}>
          <div className="form-container">
            <h2>Solicitar Información de <span className="text-gradient">este Inmueble</span></h2>
            <p>Déjenos sus datos para enviarle la ficha legal, planos y agendar un recorrido presencial en {property.titulo}.</p>
            
            <form onSubmit={handleSubmit} className="form-grid">
              <input 
                type="text" 
                name="nombre"
                placeholder="Nombre Completo *" 
                maxLength={100}
                value={formData.nombre}
                onChange={handleInputChange}
                required 
              />
              <input 
                type="email" 
                name="email"
                placeholder="Correo Electrónico *" 
                value={formData.email}
                onChange={handleInputChange}
                required 
              />
              <div className="phone-input-group">
                <select 
                  name="paisCode"
                  value={formData.paisCode}
                  onChange={handleInputChange}
                  required
                >
                  <option value="+51">🇵🇪 +51</option>
                  <option value="+56">🇨🇱 +56</option>
                  <option value="+54">🇦🇷 +54</option>
                  <option value="+1">🇺🇸 +1</option>
                </select>
                <input 
                  type="tel" 
                  name="celular"
                  placeholder="Celular (9 dígitos) *" 
                  pattern="[0-9]{9}" 
                  maxLength="9" 
                  value={formData.celular}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <input 
                type="text"
                name="mensaje"
                placeholder="Consulta adicional (Opcional)"
                value={formData.mensaje}
                onChange={handleInputChange}
              />
              <button 
                type="submit" 
                disabled={formStatus === 'loading'}
                className="btn-pill form-full" 
                style={{ marginTop: '10px' }}
              >
                {formStatus === 'loading' ? 'ENVIANDO SOLICITUD...' : 'SOLICITAR FICHA LEGAL Y DISPONIBILIDAD'}
              </button>
            </form>
          </div>
        </section>

      </main>

      {/* LIGHTBOX MODAL PANTALLA COMPLETA */}
      {lightboxOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <button 
            onClick={() => setLightboxOpen(false)}
            style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '28px', width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ×
          </button>
          
          <div style={{ position: 'relative', width: '90vw', height: '80vh' }}>
            <Image 
              src={imagenesList[activeImgIdx]} 
              alt={`${property.titulo} en alta resolución`} 
              fill 
              style={{ objectFit: 'contain' }} 
            />
          </div>

          <div style={{ marginTop: '15px', color: '#aaa', fontSize: '13px', display: 'flex', gap: '20px', alignItems: 'center' }}>
            <button onClick={() => moveCarousel(-1)} style={{ background: 'none', border: '1px solid #555', color: '#fff', padding: '6px 16px', borderRadius: '12px', cursor: 'pointer' }}>‹ Anterior</button>
            <span>📷 Foto {activeImgIdx + 1} de {imagenesList.length}</span>
            <button onClick={() => moveCarousel(1)} style={{ background: 'none', border: '1px solid #555', color: '#fff', padding: '6px 16px', borderRadius: '12px', cursor: 'pointer' }}>Siguiente ›</button>
          </div>
        </div>
      )}

      {/* NOTIFICACIONES TOAST */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast" style={{ borderLeft: toastMessage.type === 'success' ? '4px solid #10b981' : '4px solid #ef4444' }}>
            {toastMessage.msg}
          </div>
        </div>
      )}

      {/* BOTÓN WHATSAPP FLOTANTE */}
      <WhatsAppButton />
    </div>
  );
}
