'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar({ onFilterSelect }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/' || pathname === '/inmobiliaria-en-chancay' || pathname === '/inmobiliaria-en-huaral';

  // Cerrar menú móvil al cambiar de ruta o presionar Escape
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

          {/* Enlaces de Navegación de Escritorio */}
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
            <Link href="/blog" className={`nav-item ${pathname === '/blog' ? 'nav-item-active' : ''}`}>
              Blog & Guías
            </Link>
            <Link href="/preguntas-frecuentes" className={`nav-item ${pathname === '/preguntas-frecuentes' ? 'nav-item-active' : ''}`}>
              Preguntas Frecuentes
            </Link>
            <a 
              href="#contacto" 
              className="btn-pill btn-pill-nav"
            >
              Agendar Visita
            </a>
          </div>

          {/* Botón Hamburguesa Móvil (Alineación Geométrica Perfecta) */}
          <button 
            type="button"
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'is-active' : ''}`}
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label={mobileMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
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

      {/* Drawer / Menú Lateral Móvil con Backdrop Blur */}
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
              <span className="logo-sub" style={{ fontSize: '9px' }}>EXPERIENCIA DIGITAL</span>
            </div>
            <button 
              type="button" 
              className="mobile-drawer-close"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Cerrar menú"
            >
              ✕
            </button>
          </div>

          {/* Enlaces y Accesos Rápidos del Drawer */}
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
              <span className="mobile-nav-icon">📍</span>
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
              <span className="mobile-nav-icon">🏡</span>
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
              <span className="mobile-nav-icon">📐</span>
              <div>
                <span className="mobile-nav-text">Lotes de Inversión</span>
                <span className="mobile-nav-desc">Alta plusvalía cerca al Megapuerto</span>
              </div>
            </a>

            <div className="mobile-nav-group-title">Ciudades & Proyectos</div>

            <Link 
              href="/inmobiliaria-en-chancay" 
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="mobile-nav-icon">🚢</span>
              <div>
                <span className="mobile-nav-text">Inmobiliaria en Chancay</span>
                <span className="mobile-nav-desc">Eje logístico Megapuerto</span>
              </div>
            </Link>

            <Link 
              href="/inmobiliaria-en-huaral" 
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="mobile-nav-icon">🌳</span>
              <div>
                <span className="mobile-nav-text">Inmobiliaria en Huaral</span>
                <span className="mobile-nav-desc">Retiro y casas de campo</span>
              </div>
            </Link>

            <div className="mobile-nav-group-title">Información & Asesoría</div>

            <Link 
              href="/blog" 
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="mobile-nav-icon">📖</span>
              <div>
                <span className="mobile-nav-text">Blog & Guías SUNARP</span>
                <span className="mobile-nav-desc">Artículos legales y análisis de mercado</span>
              </div>
            </Link>

            <Link 
              href="/preguntas-frecuentes" 
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="mobile-nav-icon">❓</span>
              <div>
                <span className="mobile-nav-text">Preguntas Frecuentes</span>
                <span className="mobile-nav-desc">Respuestas sobre títulos, pagos y visitas</span>
              </div>
            </Link>
          </div>

          {/* Tarjeta de Confianza SUNARP y Botones de Conversión */}
          <div className="mobile-drawer-footer">
            <div className="mobile-drawer-trust-badge">
              <span className="trust-badge-dot"></span>
              <span>Propiedades 100% Saneadas e Inscritas en SUNARP</span>
            </div>

            <a 
              href="https://wa.me/56982816844?text=Hola,%20quisiera%20asesoría%20sobre%20los%20lotes%20disponibles"
              target="_blank"
              rel="noreferrer"
              className="btn-pill mobile-drawer-btn-wa"
            >
              <span>💬 Hablar por WhatsApp</span>
            </a>

            <a 
              href="tel:+56982816844"
              className="btn-outline mobile-drawer-btn-call"
            >
              <span>📞 Llamar a un Asesor</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
