"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import WhatsAppButton from './WhatsAppButton';
import { supabase } from '../supabaseClient';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false });

export default function PropertyDetailView({ initialProperty }) {
  const property = initialProperty;
  
  let imagenesList = [];
  if (property) {
    const rawImg = property.imagen_url || property.imagen || '';
    try {
      if (rawImg && typeof rawImg === 'string' && rawImg.startsWith('[')) {
        imagenesList = JSON.parse(rawImg);
      } else if (property.imagenes && Array.isArray(property.imagenes)) {
        imagenesList = property.imagenes;
      } else if (rawImg) {
        imagenesList = [rawImg];
      }
    } catch (e) {
      if (rawImg) imagenesList = [rawImg];
    }
  }
  if (!imagenesList.length) {
    imagenesList = ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85'];
  }

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [formData, setFormData] = useState({ nombre: '', email: '', telefono: '', prefijo: '+51', mensaje: '' });
  const [status, setStatus] = useState('idle');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    import('leaflet').then(L => {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    });
  }, []);

  const moveCarousel = (dir) => {
    setActiveImgIdx(prev => {
      let next = prev + dir;
      if (next < 0) return imagenesList.length - 1;
      if (next >= imagenesList.length) return 0;
      return next;
    });
  };

  if (!property) {
    return (
      <main style={{ backgroundColor: 'var(--bg-black)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <link rel="stylesheet" href="/assets/css/index.min.css" />
        <div style={{ textAlign: 'center' }}>
          <h1>Proyecto No Encontrado</h1>
          <Link href="/" className="btn-pill" style={{ marginTop: '20px' }}>Volver al Portafolio</Link>
        </div>
      </main>
    );
  }

  const precioFormat = typeof property.precio === 'number' ? '$' + parseFloat(property.precio).toLocaleString() : (property.precio || '$0');
  
  const whatsappMsg = `Hola, me interesa asegurar capital en el proyecto ID-${property.id}: ${property.titulo}. Quisiera más información sobre la disponibilidad y forma de pago.`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const fullPhone = `${formData.prefijo} ${formData.telefono}`;
      const { error } = await supabase.from('clientes').insert([{
        nombre_completo: formData.nombre,
        email: formData.email,
        telefono: fullPhone,
        tipo_interes: `[Consulta Proyecto ID-${property.id}: ${property.titulo}] ${formData.mensaje}`,
        estado_lead: 'Nuevo',
        origen: `Web Ficha Proyecto ID-${property.id}`
      }]);
      
      if (error) throw error;
      setStatus('success');
      setFormData({ nombre: '', email: '', telefono: '', prefijo: '+51', mensaje: '' });
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      console.error("Error saving lead:", err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Montserrat:wght@400;700;900&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="/assets/css/index.min.css" />
      <style>{`
        body { background-color: var(--bg-black); color: var(--text-white); }


        .ficha-grid-main {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          margin-bottom: 60px;
          width: 100%;
        }

        @media (min-width: 992px) {
          .ficha-grid-main {
            grid-template-columns: 1.8fr 1.2fr;
            gap: 60px;
          }
        }

        .ficha-gallery-main {
          position: relative;
          width: 100%;
          height: 50vh;
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid rgba(203, 159, 116, 0.4);
          box-shadow: 0 25px 50px rgba(0,0,0,0.8);
          background-color: var(--bg-black);
        }

        @media (min-width: 992px) {
          .ficha-gallery-main { height: 75vh; min-height: 600px; }
        }

        .ficha-gallery-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .ficha-thumbnails {
          display: flex;
          gap: 15px;
          overflow-x: auto;
          padding: 25px 0;
          scrollbar-width: none;
        }
        
        .ficha-thumbnails::-webkit-scrollbar { display: none; }

        .ficha-thumb {
          width: 120px;
          height: 90px;
          border-radius: 16px;
          overflow: hidden;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          flex-shrink: 0;
          opacity: 0.6;
          box-shadow: 0 10px 20px rgba(0,0,0,0.5);
        }

        .ficha-thumb.active {
          border-color: var(--gold-light);
          opacity: 1;
          transform: scale(1.05);
        }

        /* Glassmorphism para que luzca épico sobre el fondo */
        .ficha-details-card {
          background-color: rgba(12, 12, 12, 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 24px;
          padding: 50px;
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px rgba(0,0,0,0.5);
        }

        .specs-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          width: 100%;
        }
        
        @media (min-width: 992px) {
          .specs-grid { grid-template-columns: 1fr 1fr; gap: 60px; }
        }

        .leaflet-container { z-index: 1 !important; border-radius: 24px; }
      `}</style>
      
      {/* NAVEGACIÓN EXACTA AL INICIO */}
      <nav className="hero-initial">
        <div className="logo-container">
          <span className="logo-main">NORTE CHICO</span>
          <span className="logo-sub">GRUPO INMOBILIARIO</span>
        </div>
        <div className="nav-links">
          <Link href="/">Casas</Link>
          <Link href="/">Lotes Residenciales</Link>
          <Link href="/" style={{ color: 'var(--gold-light)' }}>← Volver al Inicio</Link>
        </div>
      </nav>

      <main style={{ 
        background: `linear-gradient(to top, rgba(8, 8, 8, 1) 0%, rgba(8, 8, 8, 0.4) 30%, rgba(8, 8, 8, 0.8) 100%), url('/PR_GLORIETA_DELUXE.webp') center/cover fixed`,
        width: '100%',
        minHeight: '100vh'
      }}>
        <section style={{ padding: '140px 5% 60px 5%', width: '100%' }}>
          
          {/* FICHA PRINCIPAL (Galería + Detalles) */}
          <div className="ficha-grid-main">
            
            {/* LADO IZQUIERDO: GALERÍA */}
            <div>
              <div className="ficha-gallery-main">
                <img src={imagenesList[activeImgIdx]} alt={property.titulo} className="ficha-gallery-img" />
                
                {/* Botón de estado flotante */}
                <div style={{ position: 'absolute', top: '20px', left: '20px', background: 'var(--gold-gradient)', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                  {property.estado || 'Disponible'}
                </div>

                {/* Flechas del Carrusel */}
                {imagenesList.length > 1 && (
                  <>
                    <button className="carousel-btn prev-btn" style={{ background: 'rgba(8,8,8,0.7)', borderColor: 'var(--gold-light)' }} onClick={() => moveCarousel(-1)}>&#10094;</button>
                    <button className="carousel-btn next-btn" style={{ background: 'rgba(8,8,8,0.7)', borderColor: 'var(--gold-light)' }} onClick={() => moveCarousel(1)}>&#10095;</button>
                  </>
                )}
              </div>

              {/* Miniaturas (Thumbnails) */}
              {imagenesList.length > 1 && (
                <div className="ficha-thumbnails">
                  {imagenesList.map((img, idx) => (
                    <div 
                      key={idx} 
                      className={`ficha-thumb ${activeImgIdx === idx ? 'active' : ''}`}
                      onClick={() => setActiveImgIdx(idx)}
                    >
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* LADO DERECHO: DETALLES DE LA PROPIEDAD */}
            <div className="ficha-details-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span className="text-gradient" style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {(property.tipo_activo || 'Terreno')}
                </span>
                <span style={{ fontSize: '12px', color: '#888', fontWeight: '700' }}>Saneado 100%</span>
              </div>

              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(36px, 4vw, 54px)', lineHeight: '1.1', marginBottom: '30px', color: 'var(--text-white)' }}>
                {property.titulo}
              </h1>

              {/* Caja de Precio Resaltado */}
              <div style={{ background: 'rgba(255,255,255,0.05)', borderLeft: '4px solid var(--gold-light)', padding: '30px', borderRadius: '16px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#AAA', fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Precio de Inversión</div>
                  <div className="text-gradient" style={{ fontSize: '42px', fontWeight: '900', lineHeight: '1' }}>{precioFormat}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#AAA', fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Ubicación</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-white)' }}>Chancay - Huaral</div>
                </div>
              </div>

              <p style={{ fontSize: '16px', color: '#DDD', lineHeight: '1.8', marginBottom: '50px', flexGrow: 1, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {property.descripcion || 'Inmueble de alta plusvalía posicionado estratégicamente en el eje logístico del Megapuerto. Excelente oportunidad de inversión o desarrollo residencial. Cuenta con todos los documentos en regla.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <a 
                  href={`https://wa.me/56982816844?text=${encodeURIComponent(whatsappMsg)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-pill" style={{ width: '100%', padding: '24px', fontSize: '15px' }}
                >
                  Hablar con un Asesor por WhatsApp
                </a>
                <a href="#contacto" className="btn-outline" style={{ textAlign: 'center', width: '100%', fontSize: '14px', padding: '20px' }}>
                  Agendar una Cita Guiada
                </a>
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '60px 0' }} />

          {/* SEGUNDA SECCIÓN: ESPECIFICACIONES Y MAPA */}
          <div className="specs-grid">
            {/* Especificaciones */}
            <div className="ficha-details-card" style={{ border: '1px solid rgba(203, 159, 116, 0.4)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: '700', marginBottom: '40px', color: 'var(--text-white)' }}>
                Especificaciones Técnicas
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', fontSize: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
                  <span style={{ color: '#CCC', fontWeight: '700', textTransform: 'uppercase', fontSize: '14px', letterSpacing: '1px' }}>Superficie Total:</span>
                  <span style={{ fontWeight: '900', color: 'var(--gold-light)' }}>{property.area_m2 || property.area || 'N/A'} m²</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
                  <span style={{ color: '#CCC', fontWeight: '700', textTransform: 'uppercase', fontSize: '14px', letterSpacing: '1px' }}>Zonificación:</span>
                  <span style={{ fontWeight: '700', color: 'white' }}>{property.zonificacion || 'Residencial'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
                  <span style={{ color: '#CCC', fontWeight: '700', textTransform: 'uppercase', fontSize: '14px', letterSpacing: '1px' }}>Estado Registral:</span>
                  <span style={{ fontWeight: '700', color: 'white' }}>Saneado en SUNARP</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '15px' }}>
                  <span style={{ color: '#CCC', fontWeight: '700', textTransform: 'uppercase', fontSize: '14px', letterSpacing: '1px' }}>Parámetros:</span>
                  <span style={{ fontWeight: '700', color: 'white' }}>{property.parametros || 'Residencial / Comercial'}</span>
                </div>
              </div>
            </div>

            {/* Mapa Logístico */}
            <div className="ficha-details-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(203, 159, 116, 0.4)' }}>
              {!mounted ? (
                <div style={{ display: 'flex', height: '100%', minHeight: '400px', alignItems: 'center', justifyContent: 'center', color: '#888' }}>Cargando mapa interactivo...</div>
              ) : (
                <div style={{ position: 'relative', height: '100%', minHeight: '400px', width: '100%' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', padding: '30px', background: 'linear-gradient(to bottom, rgba(8,8,8,0.9), transparent)', zIndex: 2, pointerEvents: 'none' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: '700', margin: 0, color: 'white' }}>Análisis Logístico</h3>
                    <p style={{ fontSize: '13px', color: 'var(--gold-light)', margin: 0, textTransform: 'uppercase', fontWeight: '900', letterSpacing: '1px' }}>Distancia Referencial a Megapuerto</p>
                  </div>
                  <MapContainer center={[-11.53, -77.24]} zoom={12} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      attribution='&copy; CARTO'
                    />
                    <Marker position={[-11.5694, -77.2676]}>
                      <Popup><strong style={{ color: '#cb9f74' }}>Plaza de Armas / Megapuerto</strong><br/>Chancay</Popup>
                    </Marker>
                    <Marker position={[-11.4939, -77.2078]}>
                      <Popup><strong>{property.titulo}</strong><br/>Ubicación Referencial</Popup>
                    </Marker>
                    <Polyline positions={[[-11.5694, -77.2676], [-11.4939, -77.2078]]} pathOptions={{ color: '#cb9f74', weight: 4, dashArray: '10, 10' }} />
                  </MapContainer>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECCIÓN DE CONTACTO IDÉNTICA AL HOME */}
        <section className="contact-module theme-light-contact" id="contacto">
          <div className="form-container">
            <h2>Consulta <span className="text-gradient">Directa</span></h2>
            <p>Agenda una cita guiada o solicita la minuta legal de la propiedad {property.titulo}.</p>
            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="form-full">
                <input required type="text" placeholder="Nombre completo *" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              </div>
              <div className="phone-input-group">
                <select value={formData.prefijo} onChange={e => setFormData({...formData, prefijo: e.target.value})}>
                  <option value="+51">🇵🇪 +51</option>
                  <option value="+56">🇨🇱 +56</option>
                  <option value="+54">🇦🇷 +54</option>
                  <option value="+57">🇨🇴 +57</option>
                  <option value="+52">🇲🇽 +52</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+34">🇪🇸 +34</option>
                </select>
                <input required type="tel" placeholder="Número de celular *" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
              </div>
              <input required type="email" placeholder="Correo electrónico *" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <div className="form-full">
                <input type="text" placeholder="Mensaje adicional (Opcional)" value={formData.mensaje} onChange={e => setFormData({...formData, mensaje: e.target.value})} />
              </div>
              <div className="form-full" style={{ textAlign: 'center', marginTop: '20px' }}>
                <button type="submit" className="btn-pill" disabled={status === 'loading'} style={{ width: '100%', maxWidth: '300px', cursor: status === 'loading' ? 'not-allowed' : 'pointer' }}>
                  {status === 'loading' ? 'ENVIANDO...' : 'SOLICITAR INFORMACIÓN'}
                </button>
                {status === 'success' && <p style={{ color: '#10B981', marginTop: '20px', fontWeight: 'bold' }}>¡Solicitud enviada con éxito! Nos pondremos en contacto muy pronto.</p>}
              </div>
            </form>
          </div>
        </section>
      </main>
      
      {/* WhatsApp flotante idéntico al Home */}
      <WhatsAppButton />
    </>
  );
}
