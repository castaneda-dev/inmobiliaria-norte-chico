'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../../components/Navbar';
import MobileBottomBar from '../../components/MobileBottomBar';
import dynamic from 'next/dynamic';

const WhatsAppButton = dynamic(() => import('../../components/WhatsAppButton'), { 
  ssr: false,
  loading: () => null
});

export default function BlogClient({ articles, faqItems }) {
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const [activeArticle, setActiveArticle] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);
  const [faqCategory, setFaqCategory] = useState('Todas');

  const filterOptions = ['Todos', 'Megapuerto', 'Saneamiento SUNARP', 'Guías de Compra', 'Preguntas Frecuentes'];

  const filteredArticles = selectedFilter === 'Todos'
    ? articles
    : selectedFilter === 'Megapuerto'
    ? articles.filter(a => a.category.includes('Plusvalía') || a.category.includes('Megapuerto'))
    : selectedFilter === 'Saneamiento SUNARP'
    ? articles.filter(a => a.category.includes('SUNARP') || a.category.includes('Legal'))
    : selectedFilter === 'Guías de Compra'
    ? articles.filter(a => a.category.includes('Compra') || a.category.includes('Ventas'))
    : [];

  const faqCategories = ['Todas', ...Array.from(new Set(faqItems.map(item => item.category)))];
  const filteredFaqs = faqCategory === 'Todas'
    ? faqItems
    : faqItems.filter(item => item.category === faqCategory);

  const featuredArticle = articles.find(a => a.featured) || articles[0];
  const regularArticles = selectedFilter === 'Todos' && featuredArticle
    ? filteredArticles.filter(a => a.id !== featuredArticle.id)
    : filteredArticles;

  return (
    <div style={{ background: '#080808', color: '#fff', minHeight: '100vh', fontFamily: 'Montserrat, sans-serif', overflowX: 'hidden' }}>
      
      {/* NAVEGACIÓN UNIVERSAL CON DRAWER MÓVIL */}
      <Navbar />

      {/* CABECERA EDITORIAL COMPACTA & ELEGANTE */}
      <header className="blog-header hero-initial">
        <Image 
          src="/PR_GLORIETA_DELUXE.webp" 
          alt="Blog Inmobiliario Norte Chico - Chancay y Huaral" 
          priority
          fetchPriority="high"
          fill
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center 35%', zIndex: 0, opacity: 0.28 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,8,8,0.75) 0%, rgba(8,8,8,0.92) 70%, rgba(8,8,8,1) 100%)', zIndex: 1 }} />
        
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '1140px', width: '100%', margin: '0 auto', textAlign: 'center', padding: '0 5%' }}>
          
          {/* MIGA DE PAN */}
          <nav aria-label="Breadcrumb" style={{ display: 'inline-block', marginBottom: '12px' }}>
            <ol style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#888', listStyle: 'none', padding: 0, margin: 0 }}>
              <li>
                <Link href="/" style={{ color: '#aaa', textDecoration: 'none' }}>Inicio</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <span style={{ color: 'var(--gold-light, #cb9f74)', fontWeight: 600 }} aria-current="page">Blog & Preguntas Frecuentes</span>
              </li>
            </ol>
          </nav>

          <h1 style={{ fontSize: 'clamp(26px, 4.5vw, 42px)', fontWeight: 900, lineHeight: 1.2, marginBottom: '10px', letterSpacing: '-0.5px' }}>
            Blog & <span className="text-gradient">Preguntas Frecuentes</span>
          </h1>

          <p style={{ color: '#aaa', fontSize: 'clamp(13px, 1.8vw, 15px)', maxWidth: '680px', margin: '0 auto 22px', lineHeight: 1.5 }}>
            Guías técnicas SUNARP, análisis de plusvalía y respuestas clave para comprar seguro en Chancay y Huaral.
          </p>

          {/* FILTROS INTERACTIVOS DESLIZABLES */}
          <div className="filter-controls-scroll" style={{ marginBottom: '8px' }}>
            {filterOptions.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSelectedFilter(opt);
                  if (opt === 'Preguntas Frecuentes') {
                    const el = document.getElementById('faqs-seccion');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`filter-pill ${selectedFilter === opt ? 'is-active' : ''}`}
              >
                {opt}
              </button>
            ))}
          </div>

        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ maxWidth: '1140px', margin: '0 auto', padding: '24px 5% 80px' }}>
        
        {/* ARTÍCULO DESTACADO (FORMATO REVISTA COMPACTO) */}
        {featuredArticle && selectedFilter === 'Todos' && (
          <section style={{ marginBottom: '45px' }}>
            <div 
              onClick={() => setActiveArticle(featuredArticle)}
              className="featured-article-card"
            >
              <div className="featured-article-img">
                <Image 
                  src={featuredArticle.image} 
                  alt={featuredArticle.title} 
                  fill 
                  style={{ objectFit: 'cover' }} 
                  sizes="(max-width: 860px) 100vw, 45vw"
                />
                <div style={{ position: 'absolute', top: '14px', left: '14px', background: 'rgba(8, 8, 8, 0.88)', backdropFilter: 'blur(8px)', color: '#cb9f74', padding: '5px 12px', borderRadius: '14px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', border: '1px solid rgba(203, 159, 116, 0.3)' }}>
                  ★ Artículo Destacado
                </div>
              </div>

              <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '11px', color: '#888' }}>
                  <span style={{ color: '#cb9f74', fontWeight: 700 }}>{featuredArticle.category}</span>
                  <span>•</span>
                  <span>{featuredArticle.readTime}</span>
                  <span>•</span>
                  <span>{featuredArticle.date}</span>
                </div>

                <h2 style={{ fontSize: 'clamp(18px, 2.5vw, 24px)', fontWeight: 900, lineHeight: 1.3, marginBottom: '10px', color: '#fff' }}>
                  {featuredArticle.title}
                </h2>

                <p style={{ color: '#aaa', fontSize: '13px', lineHeight: 1.5, marginBottom: '18px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {featuredArticle.excerpt}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ fontSize: '11px' }}>
                    <span style={{ fontWeight: 700, color: '#fff' }}>{featuredArticle.author}</span>
                    <span style={{ color: '#777', marginLeft: '6px' }}>• {featuredArticle.authorRole}</span>
                  </div>
                  <span className="btn-pill" style={{ padding: '8px 18px', fontSize: '11px' }}>
                    Leer Análisis →
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* GRILLA DE ARTÍCULOS */}
        {selectedFilter !== 'Preguntas Frecuentes' && (
          <section style={{ marginBottom: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>
                {selectedFilter === 'Todos' ? 'Artículos & Guías Técnicas' : `Publicaciones: ${selectedFilter}`}
              </h2>
              <span style={{ color: '#777', fontSize: '12px' }}>
                {filteredArticles.length} {filteredArticles.length === 1 ? 'publicación' : 'publicaciones'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '22px' }}>
              {regularArticles.map((art) => (
                <article
                  key={art.id}
                  onClick={() => setActiveArticle(art)}
                  className="blog-grid-card"
                >
                  <div className="blog-grid-card-img">
                    <Image 
                      src={art.image} 
                      alt={art.title} 
                      fill 
                      style={{ objectFit: 'cover' }} 
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(8, 8, 8, 0.88)', backdropFilter: 'blur(6px)', color: art.badgeColor || '#cb9f74', padding: '4px 10px', borderRadius: '10px', fontSize: '9.5px', fontWeight: 800, textTransform: 'uppercase' }}>
                      {art.category}
                    </div>
                  </div>

                  <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <div style={{ fontSize: '10.5px', color: '#888', marginBottom: '8px', display: 'flex', gap: '6px' }}>
                      <span>{art.date}</span>
                      <span>•</span>
                      <span>{art.readTime}</span>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 800, lineHeight: 1.35, marginBottom: '10px', color: '#fff', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {art.title}
                    </h3>

                    <p style={{ color: '#999', fontSize: '12.5px', lineHeight: 1.55, marginBottom: '16px', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {art.excerpt}
                    </p>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10.5px', color: '#777' }}>Por {art.author}</span>
                      <span style={{ color: '#cb9f74', fontSize: '11px', fontWeight: 700 }}>Leer artículo →</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* SECCIÓN DE PREGUNTAS FRECUENTES (INTEGRADA & ELEGANTE) */}
        <section id="faqs-seccion" style={{ background: 'rgba(18, 18, 18, 0.65)', border: '1px solid rgba(203, 159, 116, 0.2)', borderRadius: '20px', padding: '36px 5%' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#cb9f74', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              <span>❓</span> Respuestas Inmediatas
            </div>
            <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 900, marginBottom: '10px' }}>
              Preguntas <span className="text-gradient">Frecuentes de Compradores</span>
            </h2>
            <p style={{ color: '#aaa', fontSize: '13.5px', maxWidth: '580px', margin: '0 auto 20px', lineHeight: 1.5 }}>
              Resolvemos las consultas más recurrentes sobre titulación en SUNARP, financiamiento y visitas.
            </p>

            {/* CATEGORÍAS FAQ */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {faqCategories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setFaqCategory(cat)}
                  className={`btn-outline ${faqCategory === cat ? 'btn-active' : ''}`}
                  style={{ padding: '7px 14px', fontSize: '11px' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '850px', margin: '0 auto' }}>
            {filteredFaqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index} 
                  className={`faq-item ${isOpen ? 'active' : ''}`}
                  style={{
                    background: 'rgba(12, 12, 12, 0.7)',
                    border: isOpen ? '1px solid rgba(203, 159, 116, 0.45)' : '1px solid rgba(203, 159, 116, 0.12)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <button 
                    className="faq-question" 
                    onClick={() => setActiveFaq(isOpen ? null : index)} 
                    aria-expanded={isOpen}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      padding: '16px 20px',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontFamily: 'inherit',
                      gap: '12px'
                    }}
                  >
                    <span style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span style={{ fontSize: '9.5px', color: '#cb9f74', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 800 }}>
                        {faq.category}
                      </span>
                      <span>{faq.question}</span>
                    </span>
                    <span 
                      className="faq-icon" 
                      aria-hidden="true"
                      style={{
                        color: 'var(--gold-light, #cb9f74)',
                        fontSize: '20px',
                        transform: isOpen ? 'rotate(45deg)' : 'none',
                        transition: 'transform 0.25s ease',
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
                        padding: '0 20px 18px',
                        background: 'rgba(8, 8, 8, 0.3)'
                      }}
                    >
                      <p style={{ color: '#bbb', fontSize: '13px', lineHeight: 1.65, margin: 0, borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '12px' }}>
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA INFERIOR PARA AGENDAR VISITA */}
        <section style={{ marginTop: '50px', background: 'linear-gradient(135deg, rgba(203, 159, 116, 0.18) 0%, rgba(18, 18, 18, 0.95) 100%)', border: '1px solid rgba(203, 159, 116, 0.35)', borderRadius: '20px', padding: '36px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(20px, 3.5vw, 30px)', fontWeight: 900, marginBottom: '10px' }}>
            ¿Deseas asesoría para tu próxima inversión?
          </h2>
          <p style={{ color: '#ccc', fontSize: '13.5px', maxWidth: '580px', margin: '0 auto 24px', lineHeight: 1.55 }}>
            Nuestro equipo de ventas y asesores legales en Chancay y Huaral resolverá todas tus consultas sin compromiso.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a 
              href="https://wa.me/56982816844?text=Hola,%20leí%20el%20blog%20de%20Norte%20Chico%20y%20quiero%20más%20información%20de%20los%20terrenos" 
              target="_blank" 
              rel="noreferrer"
              className="btn-pill" 
              style={{ background: '#25d366', color: '#fff', fontSize: '12px', padding: '14px 28px', boxShadow: '0 4px 18px rgba(37, 211, 102, 0.35)' }}
            >
              💬 Consulta por WhatsApp
            </a>
            <Link 
              href="/#contacto" 
              className="btn-outline" 
              style={{ fontSize: '12px', padding: '14px 28px' }}
            >
              Agendar Recorrido en Terreno
            </Link>
          </div>
        </section>

      </main>

      {/* MODAL / BOTTOM SHEET INMERSIVO DE LECTURA */}
      {activeArticle && (
        <div 
          className="blog-reader-backdrop"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}
          onClick={() => setActiveArticle(null)}
        >
          <div 
            className="blog-reader-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setActiveArticle(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '22px', width: '38px', height: '38px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
              aria-label="Cerrar artículo"
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#cb9f74', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px', paddingRight: '40px' }}>
              <span>{activeArticle.category}</span>
              <span>•</span>
              <span style={{ color: '#888' }}>{activeArticle.readTime}</span>
              <span>•</span>
              <span style={{ color: '#888' }}>{activeArticle.date}</span>
            </div>

            <h2 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 900, lineHeight: 1.25, marginBottom: '16px', color: '#fff' }}>
              {activeArticle.title}
            </h2>

            <div style={{ position: 'relative', height: '240px', width: '100%', borderRadius: '14px', overflow: 'hidden', marginBottom: '24px' }}>
              <Image src={activeArticle.image} alt={activeArticle.title} fill style={{ objectFit: 'cover' }} />
            </div>

            {/* SECCIONES DEL ARTÍCULO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
              {activeArticle.content.map((sec, idx) => (
                <div key={idx}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#cb9f74', marginBottom: '6px' }}>
                    {sec.subtitle}
                  </h3>
                  <p style={{ color: '#ccc', fontSize: '14px', lineHeight: 1.65 }}>
                    {sec.text}
                  </p>
                </div>
              ))}
            </div>

            {/* PUNTOS CLAVE DESTACADOS */}
            <div style={{ background: 'rgba(203, 159, 116, 0.08)', border: '1px solid rgba(203, 159, 116, 0.25)', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.8px' }}>
                📌 Conclusiones Clave para Inversionistas:
              </h4>
              <ul style={{ paddingLeft: '18px', color: '#bbb', fontSize: '13px', lineHeight: 1.55, margin: 0 }}>
                {activeArticle.keyPoints.map((pt, i) => (
                  <li key={i} style={{ marginBottom: '5px' }}>{pt}</li>
                ))}
              </ul>
            </div>

            {/* AUTOR & CTA WHATSAPP */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontWeight: 800, color: '#fff', fontSize: '12.5px' }}>Redactado por: {activeArticle.author}</div>
                <div style={{ color: '#777', fontSize: '11px' }}>{activeArticle.authorRole} • Inmobiliaria Norte Chico</div>
              </div>
              <a 
                href={`https://wa.me/56982816844?text=Hola,%20leí%20el%20artículo:%20"${encodeURIComponent(activeArticle.title)}"%20y%20deseo%20más%20información`}
                target="_blank"
                rel="noreferrer"
                className="btn-pill"
                style={{ fontSize: '11.5px', padding: '10px 20px', background: '#25d366', color: '#fff' }}
              >
                💬 Consultar sobre este tema
              </a>
            </div>

          </div>
        </div>
      )}

      {/* FOOTER INSTITUCIONAL */}
      <footer style={{ background: 'var(--bg-black)', padding: '40px 5% 40px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="logo-main" style={{ fontSize: '16px', marginBottom: '10px', textAlign: 'center', width: '100%', display: 'block' }}>INMOBILIARIA NORTE CHICO | CHANCAY Y HUARAL</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', margin: '15px 0', fontSize: '12px', flexWrap: 'wrap' }}>
          <Link href="/blog" style={{ color: 'var(--gold-light, #cb9f74)', textDecoration: 'none', fontWeight: 600 }}>
            Blog & Preguntas Frecuentes
          </Link>
          <span style={{ color: '#777', cursor: 'default', userSelect: 'none' }}>
            Inmobiliaria en Chancay
          </span>
          <span style={{ color: '#777', cursor: 'default', userSelect: 'none' }}>
            Inmobiliaria en Huaral
          </span>
        </div>
        <p style={{ fontSize: '12px', color: '#a3a3a3' }}>2026 © Inmobiliaria Norte Chico. Todos los derechos reservados.</p>
      </footer>

      {/* BARRA FIJA DE CONVERSIÓN INFERIOR MÓVIL */}
      <MobileBottomBar formTargetId="#faqs-seccion" />

      {/* BOTÓN WHATSAPP FLOTANTE */}
      <WhatsAppButton />
    </div>
  );
}
