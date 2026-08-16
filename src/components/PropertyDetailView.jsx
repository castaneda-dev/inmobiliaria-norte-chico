"use client";
import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import WhatsAppButton from './WhatsAppButton';

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function estimateDrivingTime(distanceKm) {
  const realDistance = distanceKm * 1.3; // Factor de desvío de calles
  const timeMinutes = Math.round((realDistance / 35) * 60); // 35 km/h velocidad promedio
  return Math.max(2, timeMinutes);
}

export default function PropertyDetailView({ property: propertyProp, initialProperty }) {
  const property = propertyProp || initialProperty;
  
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
  const googleEmbedUrl = `https://maps.google.com/maps?q=${lat},${lng}&hl=es&z=13&output=embed`;
  const googleDirectUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const googleRouteMegapuerto = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=-11.5694,-77.2676`;

  // Navegación por teclado en Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') moveCarousel(-1);
      if (e.key === 'ArrowRight') moveCarousel(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, imagenesList.length]);

  // Calcular distancias y tiempos de viaje de forma dinámica
  const distMegapuerto = useMemo(() => calculateDistance(lat, lng, -11.5830, -77.2680), [lat, lng]);
  const timeMegapuerto = useMemo(() => estimateDrivingTime(distMegapuerto), [distMegapuerto]);

  const distPlazaChancay = useMemo(() => calculateDistance(lat, lng, -11.5694, -77.2676), [lat, lng]);
  const timePlazaChancay = useMemo(() => estimateDrivingTime(distPlazaChancay), [distPlazaChancay]);

  const distPlazaHuaral = useMemo(() => calculateDistance(lat, lng, -11.4956, -77.2064), [lat, lng]);
  const timePlazaHuaral = useMemo(() => estimateDrivingTime(distPlazaHuaral), [distPlazaHuaral]);

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
      const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 9);
      let formatted = numbersOnly;
      if (numbersOnly.length > 6) {
        formatted = `${numbersOnly.slice(0, 3)} ${numbersOnly.slice(3, 6)} ${numbersOnly.slice(6)}`;
      } else if (numbersOnly.length > 3) {
        formatted = `${numbersOnly.slice(0, 3)} ${numbersOnly.slice(3)}`;
      }
      setFormData(prev => ({ ...prev, celular: formatted }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formStatus === 'loading') return;

    const rawCelular = (formData.celular || '').replace(/\s/g, '');
    if (rawCelular.length !== 9) {
      showToast('El teléfono celular debe contener 9 dígitos exactos.', 'error');
      return;
    }

    setFormStatus('loading');
    try {
      const payload = {
        nombre: formData.nombre.trim().replace(/<[^>]*>?/gm, ''),
        email: formData.email.trim().replace(/<[^>]*>?/gm, ''),
        telefono: `${formData.paisCode}${rawCelular}`,
        origen: `Web Ficha Proyecto ID-${property?.id || 'General'}`,
        notas: `Interés en: ${property?.titulo || 'Propiedad'} - ${formData.mensaje ? `Mensaje: ${formData.mensaje.replace(/<[^>]*>?/gm, '')}` : 'Consulta de disponibilidad'}`
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
  const whatsappMsg = `Hola Inmobiliaria Norte Chico, me interesa información y disponibilidad de ${property.titulo}.`;

  const rawUbicacion = (property.ubicacion || 'Chancay').trim();
  const ubicacionFormateada = (rawUbicacion.toLowerCase().includes('perú') || rawUbicacion.toLowerCase().includes('peru'))
    ? rawUbicacion
    : `${rawUbicacion}, Perú`;

  return (
    <div style={{ backgroundColor: '#080808', color: '#fff', minHeight: '100vh', fontFamily: 'Montserrat, sans-serif', overflowX: 'hidden' }}>
      
      {/* NAVEGACIÓN SUPERIOR: LOGO COMO BOTÓN DE RETORNO AL INICIO */}
      <nav className="hero-initial" style={{ justifyContent: 'flex-start' }}>
        <Link href="/" className="logo-container" style={{ textDecoration: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
          <span className="logo-main" style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ← NORTE CHICO
          </span>
          <span className="logo-sub" style={{ color: 'var(--gold-light, #cb9f74)', fontSize: '10px', fontWeight: 700 }}>
            GRUPO INMOBILIARIO • VOLVER AL INICIO
          </span>
        </Link>
      </nav>

      {/* HERO PRINCIPAL ADAPTADO A CELULAR Y WEB */}
      <header className="hero hero-initial" style={{ minHeight: 'auto', padding: '130px 5% 40px', position: 'relative', overflow: 'hidden' }}>
        {/* Fondo Glorieta Deluxe decorativo para el inicio de la pagina */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <Image
            src="/PR_GLORIETA_DELUXE.webp"
            alt=""
            fill
            aria-hidden="true"
            priority
            sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(8,8,8,1) 0%, rgba(8,8,8,0.6) 50%, rgba(8,8,8,0.8) 100%)',
          }} />
        </div>
        <div className="hero-grid" style={{ gap: '30px', position: 'relative', zIndex: 1 }}>
          
          {/* INFORMACIÓN PRINCIPAL DEL INMUEBLE */}
          <div className="hero-text" style={{ textAlign: 'left' }}>
            <div className="flex flex-wrap gap-2 items-center mb-3">
              <span style={{ background: 'linear-gradient(135deg, #cb9f74, #e2b988)', color: '#000', padding: '4px 14px', borderRadius: '16px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
                {property.tipo_activo || 'Terreno'}
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(24px, 5.5vw, 52px)', fontWeight: 900, lineHeight: '1.15', marginBottom: '12px' }}>
              {property.titulo}
            </h1>
            
            <div className="sub-heading text-gradient" style={{ fontSize: 'clamp(26px, 4vw, 42px)', marginBottom: '16px', fontWeight: 900 }}>
              {precioFormat}
            </div>

            <p style={{ color: '#ccc', fontSize: '13px', lineHeight: '1.6', marginBottom: '20px', maxWidth: '580px' }}>
              {property.descripcion || 'Lote e inmueble estratégico de alta plusvalía. Excelente proyección patrimonial y residencial.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <a 
                href={`https://wa.me/56982816844?text=${encodeURIComponent(whatsappMsg)}`}
                target="_blank"
                rel="noreferrer"
                className="btn-pill w-full sm:w-auto text-center justify-center" 
                style={{ fontSize: '12px', padding: '14px 24px', background: '#25d366', color: '#fff', boxShadow: '0 4px 20px rgba(37, 211, 102, 0.35)' }}
              >
                Consultar Disponibilidad
              </a>
              <a 
                href="#contacto-ficha" 
                className="btn-outline w-full sm:w-auto text-center justify-center"
                style={{ fontSize: '12px', padding: '14px 24px' }}
              >
                Agendar Visita
              </a>
            </div>

            <p style={{ fontSize: '12px', color: '#aaa', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              Ubicación: <span style={{ color: '#fff', fontWeight: 800 }}>{ubicacionFormateada}</span>
            </p>
          </div>

          {/* GALERÍA DE FOTOS RESPONSIVA DENTRO DE HERO-VIDEO */}
          <div style={{ width: '100%' }}>
            <div className="hero-video" style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '20px', overflow: 'hidden', border: '3px solid var(--gold-dark, #957051)', boxShadow: '0 10px 30px rgba(0,0,0,0.8)', background: '#111' }}>
              <Image 
                src={imagenesList[activeImgIdx]} 
                alt={`${property.titulo} - Vista ${activeImgIdx + 1}`} 
                fill 
                priority 
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }} 
              />
              
              {/* Botón Pantalla Completa */}
              <button 
                onClick={() => setLightboxOpen(true)}
                style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '6px 12px', borderRadius: '16px', fontSize: '11px', cursor: 'pointer', backdropFilter: 'blur(8px)', zIndex: 5 }}
              >
                Pantalla Completa
              </button>

              {/* Contador */}
              <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.75)', color: '#fff', padding: '4px 10px', borderRadius: '10px', fontSize: '10px', fontWeight: 600, backdropFilter: 'blur(6px)' }}>
                Foto {activeImgIdx + 1} / {imagenesList.length}
              </div>

              {/* Flechas del Carrusel */}
              {imagenesList.length > 1 && (
                <>
                  <button className="carousel-btn prev-btn" style={{ background: 'rgba(0,0,0,0.6)', borderColor: '#cb9f74', width: '36px', height: '36px', fontSize: '16px' }} onClick={() => moveCarousel(-1)}>&#10094;</button>
                  <button className="carousel-btn next-btn" style={{ background: 'rgba(0,0,0,0.6)', borderColor: '#cb9f74', width: '36px', height: '36px', fontSize: '16px' }} onClick={() => moveCarousel(1)}>&#10095;</button>
                </>
              )}
            </div>

            {/* Miniaturas (Thumbnails) para Touch Scroll */}
            {imagenesList.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '12px 0', scrollbarWidth: 'none' }}>
                {imagenesList.map((img, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setActiveImgIdx(idx)}
                    style={{ position: 'relative', width: '75px', height: '50px', borderRadius: '10px', overflow: 'hidden', border: idx === activeImgIdx ? '2px solid #cb9f74' : '2px solid transparent', opacity: idx === activeImgIdx ? 1 : 0.55, cursor: 'pointer', transition: 'all 0.2s ease', flexShrink: 0 }}
                  >
                    <Image src={img} alt={`${property.titulo} miniatura ${idx + 1}`} fill sizes="75px" style={{ objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '15px 5% 80px 5%', width: '100%', boxSizing: 'border-box' }}>
        
        {/* MIGA DE PAN (BREADCRUMB) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#888', flexWrap: 'wrap', marginBottom: '30px' }}>
          <Link href="/" style={{ color: '#aaa', textDecoration: 'none' }}>Inicio</Link>
          <span>/</span>
          <Link href="/#portafolio" style={{ color: '#aaa', textDecoration: 'none' }}>Colección Residencial</Link>
          <span>/</span>
          <span style={{ color: 'var(--gold-light, #cb9f74)', fontWeight: 600 }}>{property.titulo}</span>
        </div>

        {/* SECCIÓN 2: ESPECIFICACIONES TÉCNICAS Y GOOGLE MAPS INTERACTIVO */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '30px' }}>
          
          {/* ESPECIFICACIONES TÉCNICAS */}
          <div style={{ background: 'rgba(18, 18, 18, 0.7)', borderRadius: '20px', padding: '24px 20px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px', color: '#fff' }}>
              Especificaciones Técnicas
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', fontSize: '13px' }}>
                <span style={{ color: '#888', fontWeight: 600 }}>Área Total:</span>
                <span style={{ fontWeight: 800, color: '#cb9f74' }}>{property.area_m2 || property.area || 'Consultar'} m²</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', fontSize: '13px' }}>
                <span style={{ color: '#888', fontWeight: 600 }}>Zonificación:</span>
                <span style={{ fontWeight: 700, color: '#fff' }}>{property.zonificacion || 'Residencial / Comercio'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', fontSize: '13px' }}>
                <span style={{ color: '#888', fontWeight: 600 }}>Estado del Proyecto:</span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>{property.estado || 'Disponible'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', fontSize: '13px' }}>
                <span style={{ color: '#888', fontWeight: 600 }}>Parámetros:</span>
                <span style={{ fontWeight: 700, color: '#fff' }}>{property.parametros || 'Estándar Municipal'}</span>
              </div>
            </div>
          </div>

          {/* MÓDULO GOOGLE MAPS PLATFORM INTERACTIVO */}
          <div style={{ background: 'rgba(18, 18, 18, 0.7)', borderRadius: '20px', padding: '20px', border: '1px solid rgba(203, 159, 116, 0.3)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Google Maps | Eje Logístico
                </h2>
                <p style={{ fontSize: '11px', color: '#cb9f74', margin: '2px 0 0 0', fontWeight: 700 }}>
                  Ubicación Estratégica: {ubicacionFormateada}
                </p>
              </div>

              {/* Botón directo a Google Maps App */}
              <a 
                href={googleDirectUrl} 
                target="_blank" 
                rel="noreferrer"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Google Maps App
              </a>
            </div>

            {/* EMBED GOOGLE MAPS IFRAME FLUIDO */}
            <div style={{ width: '100%', height: '220px', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#111' }}>
              <iframe
                title="Google Maps Ubicación del Proyecto"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                src={googleEmbedUrl}
              ></iframe>
            </div>

            {/* MÉTRICAS DEL EJE LOGÍSTICO Y RUTAS RÁPIDAS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '10px', color: '#888', fontWeight: 600 }}>Megapuerto</div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#cb9f74', marginTop: '2px' }}>
                  {distMegapuerto.toFixed(1)} km (~{timeMegapuerto} m)
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '10px', color: '#888', fontWeight: 600 }}>Plaza Chancay</div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                  {distPlazaChancay.toFixed(1)} km (~{timePlazaChancay} m)
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '10px', color: '#888', fontWeight: 600 }}>Plaza Huaral</div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                  {distPlazaHuaral.toFixed(1)} km (~{timePlazaHuaral} m)
                </div>
              </div>
            </div>

            <a 
              href={googleRouteMegapuerto}
              target="_blank"
              rel="noreferrer"
              style={{ textAlign: 'center', background: 'rgba(203, 159, 116, 0.15)', border: '1px solid #cb9f74', color: '#cb9f74', padding: '10px', borderRadius: '10px', fontSize: '11px', fontWeight: 800, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.5px' }}
            >
              Ruta al Megapuerto en Maps
            </a>

          </div>

        </div>
        {/* SECCIÓN 3: FORMULARIO DE CAPTACIÓN CENTRALIZADO */}
        <section className="contact-module fade-module" id="contacto-ficha" style={{ marginTop: '40px' }}>
          <div className="form-container">
            <h2 style={{ fontSize: 'clamp(24px, 5vw, 40px)' }}>Solicitar Información de <span className="text-gradient">este Inmueble</span></h2>
            <p style={{ fontSize: '14px' }}>Déjenos su contacto para enviarle más información de la propiedad y agendar un recorrido en {property.titulo}.</p>
            
            <form onSubmit={handleSubmit} className="form-grid">
              {/* CAMPO TRAP HONEYPOT ANTI-BOTS AUTOMATIZADOS */}
              <input 
                type="text" 
                name="confirm_address" 
                value={formData.confirm_address || ''} 
                onChange={handleInputChange} 
                style={{ display: 'none', opacity: 0, position: 'absolute', left: '-9999px' }} 
                tabIndex={-1} 
                autoComplete="off" 
              />

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
                  aria-label="Código de país"
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
                  maxLength={11} 
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
                style={{ marginTop: '10px', fontSize: '13px', padding: '16px 20px' }}
              >
                {formStatus === 'loading' ? 'ENVIANDO SOLICITUD...' : 'SOLICITAR FICHA LEGAL Y DISPONIBILIDAD'}
              </button>
            </form>
          </div>
        </section>

      </main>

      {/* LIGHTBOX MODAL PANTALLA COMPLETA */}
      {lightboxOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '15px' }}>
          <button 
            onClick={() => setLightboxOpen(false)}
            style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '24px', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ×
          </button>
          
          <div style={{ position: 'relative', width: '95vw', height: '75vh' }}>
            <Image 
              src={imagenesList[activeImgIdx]} 
              alt={`${property.titulo} en alta resolución`} 
              fill 
              style={{ objectFit: 'contain' }} 
            />
          </div>

          <div style={{ marginTop: '12px', color: '#aaa', fontSize: '12px', display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button onClick={() => moveCarousel(-1)} style={{ background: 'none', border: '1px solid #555', color: '#fff', padding: '6px 14px', borderRadius: '10px', cursor: 'pointer' }}>‹ Anterior</button>
            <span>📷 Foto {activeImgIdx + 1} de {imagenesList.length}</span>
            <button onClick={() => moveCarousel(1)} style={{ background: 'none', border: '1px solid #555', color: '#fff', padding: '6px 14px', borderRadius: '10px', cursor: 'pointer' }}>Siguiente ›</button>
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

      {/* BOTÓN WHATSAPP FLOTANTE IDÉNTICO AL DEL INICIO */}
      <WhatsAppButton propertyTitle={property.titulo} propertyId={property.id} />
    </div>
  );
}
