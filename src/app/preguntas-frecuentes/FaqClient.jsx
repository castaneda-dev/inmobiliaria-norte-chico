'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const WhatsAppButton = dynamic(() => import('../../components/WhatsAppButton'), { 
  ssr: false,
  loading: () => null
});

export default function FaqClient({ faqItems }) {
  const [activeFaq, setActiveFaq] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  const categories = ['Todas', ...Array.from(new Set(faqItems.map(item => item.category)))];

  const filteredItems = selectedCategory === 'Todas'
    ? faqItems
    : faqItems.filter(item => item.category === selectedCategory);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div style={{ background: '#080808', color: '#fff', minHeight: '100vh', fontFamily: 'Montserrat, sans-serif', overflowX: 'hidden' }}>
      
      {/* NAVEGACIÓN SUPERIOR */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'rgba(8, 8, 8, 0.75)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(203, 159, 116, 0.12)', padding: '16px 5%', zIndex: 1000, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
          <span className="logo-main" style={{ letterSpacing: '3px', fontWeight: 900, fontSize: '18px', color: '#fff' }}>
            ← NORTE CHICO
          </span>
          <span className="logo-sub" style={{ color: '#cb9f74', letterSpacing: '2px', fontSize: '9px', fontWeight: 600 }}>
            GRUPO INMOBILIARIO • VOLVER AL INICIO
          </span>
        </Link>
        <div className="nav-links">
          <Link href="/#portafolio" style={{ color: '#fff', textDecoration: 'none', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Ver Catálogo
          </Link>
          <a 
            href="https://wa.me/56982816844?text=Hola,%20tengo%20una%20consulta%20sobre%20los%20terrenos" 
            target="_blank" 
            rel="noreferrer"
            className="btn-pill" 
            style={{ padding: '8px 20px', fontSize: '11px', boxShadow: 'none' }}
          >
            Asesoría Directa
          </a>
        </div>
      </nav>

      {/* HEADER HERO */}
      <header style={{ position: 'relative', paddingTop: '150px', paddingBottom: '50px', paddingLeft: '5%', paddingRight: '5%', textAlign: 'center', background: 'radial-gradient(ellipse at top, rgba(203, 159, 116, 0.12) 0%, rgba(8, 8, 8, 0) 70%)' }}>
        
        {/* MIGA DE PAN SEMÁNTICA */}
        <nav aria-label="Breadcrumb" style={{ maxWidth: '900px', margin: '0 auto 25px', textAlign: 'left' }}>
          <ol style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#888', listStyle: 'none', padding: 0, margin: 0 }}>
            <li>
              <Link href="/" style={{ color: '#aaa', textDecoration: 'none' }}>Inicio</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <span style={{ color: 'var(--gold-light, #cb9f74)', fontWeight: 600 }} aria-current="page">Preguntas Frecuentes</span>
            </li>
          </ol>
        </nav>

        <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, lineHeight: 1.15, marginBottom: '15px' }}>
          Preguntas <span className="text-gradient">Frecuentes</span>
        </h1>
        <p style={{ color: '#aaa', fontSize: '15px', maxWidth: '650px', margin: '0 auto 30px', lineHeight: 1.6 }}>
          Todo lo que necesitas saber antes de invertir en terrenos y lotes residenciales en Chancay y Huaral.
        </p>

        {/* CATEGORY TABS */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', maxWidth: '800px', margin: '0 auto' }}>
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`btn-outline ${selectedCategory === cat ? 'btn-active' : ''}`}
              style={{ padding: '10px 18px', fontSize: '12px' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL DE FAQS */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '10px 5% 80px' }}>
        <div className="faq-container" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredItems.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div 
                key={index} 
                className={`faq-item ${isOpen ? 'active' : ''}`}
                style={{
                  background: 'rgba(18, 18, 18, 0.55)',
                  border: isOpen ? '1px solid rgba(203, 159, 116, 0.45)' : '1px solid rgba(203, 159, 116, 0.12)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  boxShadow: isOpen ? '0 10px 30px rgba(0, 0, 0, 0.5)' : 'none'
                }}
              >
                <button 
                  className="faq-question" 
                  onClick={() => toggleFaq(index)} 
                  aria-expanded={isOpen}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    padding: '22px 24px',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontFamily: 'inherit',
                    gap: '15px'
                  }}
                >
                  <span style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#cb9f74', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>
                      {faq.category}
                    </span>
                    <span>{faq.question}</span>
                  </span>
                  <span 
                    className="faq-icon" 
                    aria-hidden="true"
                    style={{
                      color: 'var(--gold-light, #cb9f74)',
                      fontSize: '22px',
                      transform: isOpen ? 'rotate(45deg)' : 'none',
                      transition: 'transform 0.3s ease',
                      flexShrink: 0
                    }}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <div 
                    className="faq-answer"
                    style={{
                      padding: '0 24px 24px',
                      background: 'rgba(8, 8, 8, 0.3)'
                    }}
                  >
                    <p style={{ color: '#bbb', fontSize: '14px', lineHeight: 1.7, margin: 0, borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '16px' }}>
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA CARD FINAL */}
        <div style={{ marginTop: '50px', background: 'linear-gradient(135deg, rgba(203, 159, 116, 0.15) 0%, rgba(18, 18, 18, 0.9) 100%)', border: '1px solid rgba(203, 159, 116, 0.3)', borderRadius: '20px', padding: '40px 30px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '10px' }}>
            ¿Tienes alguna consulta específica?
          </h2>
          <p style={{ color: '#aaa', fontSize: '14px', maxWidth: '520px', margin: '0 auto 25px' }}>
            Nuestro equipo de asesoría legal e inmobiliaria está listo para orientarte en la selección de tu lote ideal.
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a 
              href="https://wa.me/56982816844?text=Hola,%20quiero%20hacer%20una%20consulta%20sobre%20un%20terreno" 
              target="_blank" 
              rel="noreferrer"
              className="btn-pill" 
              style={{ background: '#25d366', color: '#fff', fontSize: '12px', padding: '14px 28px', boxShadow: '0 4px 20px rgba(37, 211, 102, 0.35)' }}
            >
              💬 Consultar por WhatsApp
            </a>
            <Link 
              href="/#contacto" 
              className="btn-outline" 
              style={{ fontSize: '12px', padding: '14px 28px' }}
            >
              Agendar Recorrido
            </Link>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ background: 'var(--bg-black)', padding: '40px 5% 40px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="logo-main" style={{ fontSize: '16px', marginBottom: '10px' }}>INMOBILIARIA NORTE CHICO | CHANCAY Y HUARAL</div>
        <p style={{ fontSize: '12px', color: '#a3a3a3' }}>2026 © Inmobiliaria Norte Chico. Todos los derechos reservados.</p>
      </footer>

      {/* BOTÓN FLOTANTE */}
      <WhatsAppButton />
    </div>
  );
}
