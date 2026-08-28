'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar({ onFilterSelect }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/' || pathname === '/inmobiliaria-en-chancay' || pathname === '/inmobiliaria-en-huaral';

  // Cerrar menÃº mÃ³vil al cambiar de ruta o presionar Escape
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const handleNavFilter = (e, filterType) => {
    if (onFilterSelect) {
      e.preventDefault();
      onFilterSelect(filterType);
      setMobileMenuOpen(false);
      const portafolio = document.getElementById('portafolio');
      if (portafolio) {
        portafolio.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <nav className="site-navbar">
        <div className="site-navbar-inner">
          {/* Logo & Marca (Alineado a la Izquierda) */}
          <Link 
            href="/" 
            className="site-logo-link" 
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', textAlign: 'left', marginRight: 'auto' }} 
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="logo-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
              <span className="logo-main" style={{ textAlign: 'left', display: 'block' }}>NORTE CHICO</span>
              <span className="logo-sub" style={{ textAlign: 'left', display: 'block' }}>GRUPO INMOBILIARIO</span>
            </div>
          </Link>

          {/* Enlaces de NavegaciÃ³n de Escritorio */}
          <div className="nav-links">
            <a 
              href="/#portafolio" 
              onClick={(e) => handleNavFilter(e, 'vivienda')}
              className="nav-item"
            >
              Casas
            </a>
            <a 
              href="/#portafolio" 
              onClick={(e) => handleNavFilter(e, 'terreno')}
              className="nav-item"
            >
              Lotes Residenciales
            </a>
            <Link href="/blog" className={`nav-item ${pathname === '/blog' || pathname === '/preguntas-frecuentes' ? 'nav-item-active' : ''}`}>
              Blog & Preguntas Frecuentes
            </Link>
            <a 
              href="#contacto" 
              className="btn-pill btn-pill-nav"
            >
              Agendar Visita
            </a>
          </div>

          {/* BotÃ³n Hamburguesa MÃ³vil (AlineaciÃ³n GeomÃ©trica Perfecta) */}
          <button 
            type="button"
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'is-active' : ''}`}
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label={mobileMenuOpen ? "Cerrar menÃº de navegaciÃ³n" : "Abrir menÃº de navegaciÃ³n"}
            aria-expanded={mobileMenuOpen}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" stroke="var(--gold-light, #cb9f74)" />
                  <line x1="6" y1="6" x2="18" y2="18" stroke="var(--gold-light, #cb9f74)" />
                </>
              ) : (
                <>
                  <line x1="3.5" y1="6" x2="20.5" y2="6" stroke="#ffffff" />
                  <line x1="3.5" y1="12" x2="20.5" y2="12" stroke="#ffffff" />
                  <line x1="3.5" y1="18" x2="20.5" y2="18" stroke="#ffffff" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Drawer / MenÃº Lateral MÃ³vil con Backdrop Blur */}
      <div 
        className={`mobile-drawer-backdrop ${mobileMenuOpen ? 'is-open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden={!mobileMenuOpen}
      >
        <div 
          className="mobile-drawer-content"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header del Drawer */}
          <div className="mobile-drawer-header">
            <div className="logo-container">
              <span className="logo-main" style={{ fontSize: '16px' }}>NORTE CHICO</span>
            </div>
            <button 
              type="button" 
              className="mobile-drawer-close"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Cerrar menÃº"
            >
              âœ•
            </button>
          </div>

          {/* Enlaces y Accesos RÃ¡pidos del Drawer */}
          <div className="mobile-drawer-nav">
            <div className="mobile-nav-group-title">Portafolio Inmobiliario</div>
            
            <Link 
              href="/" 
              className="mobile-nav-link"
              onClick={(e) => {
                if (isHome && onFilterSelect) {
                  handleNavFilter(e, 'todos');
                } else {
                  setMobileMenuOpen(false);
                }
              }}
            >
              <div>
                <span className="mobile-nav-text">Todos los Inmuebles</span>
                <span className="mobile-nav-desc">Chancay y Huaral</span>
              </div>
            </Link>

            <a 
              href="/#portafolio" 
              className="mobile-nav-link"
              onClick={(e) => handleNavFilter(e, 'vivienda')}
            >
              <div>
                <span className="mobile-nav-text">Casas & Viviendas</span>
                <span className="mobile-nav-desc">Proyectos residenciales familiares</span>
              </div>
            </a>

            <a 
              href="/#portafolio" 
              className="mobile-nav-link"
              onClick={(e) => handleNavFilter(e, 'terreno')}
            >
              <div>
                <span className="mobile-nav-text">Lotes de InversiÃ³n</span>
                <span className="mobile-nav-desc">Alta plusvalÃ­a cerca al Megapuerto</span>
              </div>
            </a>

            <div className="mobile-nav-group-title">InformaciÃ³n & AsesorÃ­a</div>

            <Link 
              href="/blog" 
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div>
                <span className="mobile-nav-text">Blog & Preguntas Frecuentes</span>
                <span className="mobile-nav-desc">ArtÃ­culos legales, plusvalÃ­a y FAQs</span>
              </div>
            </Link>
          </div>

          {/* Botón de Conversión WhatsApp + Íconos Redes Sociales */}
          <div className="mobile-drawer-footer">
            <a 
              href="https://wa.me/51904669316?text=Hola,%20quisiera%20asesoría%20sobre%20los%20lotes%20disponibles"
              target="_blank"
              rel="noreferrer"
              className="btn-pill mobile-drawer-btn-wa"
            >
              <span>💬 Hablar por WhatsApp</span>
            </a>

            {/* Redes sociales — íconos compactos bajo el botón */}
            <div style={{ borderTop: '1px solid rgba(244,239,234,0.08)', paddingTop: '12px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '10px', color: 'rgba(244,239,234,0.35)', fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0 }}>Síguenos</span>
              <a
                href="https://www.instagram.com/inmobiliarianortechico"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Instagram de Norte Chico"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(244,239,234,0.12)', color: 'rgba(244,239,234,0.5)', transition: 'all 0.2s ease', textDecoration: 'none' }}
                onMouseEnter={e => { e.currentTarget.style.color='#E1306C'; e.currentTarget.style.borderColor='#E1306C'; }}
                onMouseLeave={e => { e.currentTarget.style.color='rgba(244,239,234,0.5)'; e.currentTarget.style.borderColor='rgba(244,239,234,0.12)'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              {/* TODO: Actualizar href con URL exacta de Facebook cuando esté confirmada */}
              <a
                href="https://www.facebook.com/inmobiliarianortechico"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Facebook de Norte Chico"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(244,239,234,0.12)', color: 'rgba(244,239,234,0.5)', transition: 'all 0.2s ease', textDecoration: 'none' }}
                onMouseEnter={e => { e.currentTarget.style.color='#1877F2'; e.currentTarget.style.borderColor='#1877F2'; }}
                onMouseLeave={e => { e.currentTarget.style.color='rgba(244,239,234,0.5)'; e.currentTarget.style.borderColor='rgba(244,239,234,0.12)'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
