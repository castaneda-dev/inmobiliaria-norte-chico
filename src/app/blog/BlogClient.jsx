'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

  return (
    <div style={{ background: '#080808', color: '#fff', minHeight: '100vh', fontFamily: 'Montserrat, sans-serif', overflowX: 'hidden' }}>
      
      {/* NAVEGACIÓN SUPERIOR FIJA */}
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
            Catálogo de Lotes
          </Link>
          <a 
            href="#faqs-seccion" 
            style={{ color: '#aaa', textDecoration: 'none', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}
          >
            Preguntas Frecuentes
          </a>
          <a 
            href="https://wa.me/56982816844?text=Hola,%20quisiera%20asesoría%20sobre%20los%20artículos%20del%20blog" 
            target="_blank" 
            rel="noreferrer"
            className="btn-pill" 
            style={{ padding: '8px 20px', fontSize: '11px', boxShadow: 'none' }}
          >
            Asesor 1-Clic
          </a>
        </div>
      </nav>

      {/* HERO CON FONDO GLORIETA DELUXE */}
      <header className="hero hero-initial" style={{ paddingTop: '150px', paddingBottom: '70px', minHeight: '65vh', position: 'relative', overflow: 'hidden' }}>
        <Image 
          src="/PR_GLORIETA_DELUXE.webp" 
          alt="Blog Inmobiliario Norte Chico - Chancay y Huaral" 
          priority
          fetchPriority="high"
          fill
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center 40%', zIndex: 0 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,8,1) 0%, rgba(8,8,8,0.7) 50%, rgba(8,8,8,0.85) 100%)', zIndex: 1 }} />
        
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '1200px', width: '100%', margin: '0 auto', textAlign: 'center', padding: '0 5%' }}>
          
          {/* MIGA DE PAN */}
          <nav aria-label="Breadcrumb" style={{ display: 'inline-block', marginBottom: '20px' }}>
            <ol style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#888', listStyle: 'none', padding: 0, margin: 0 }}>
              <li>
                <Link href="/" style={{ color: '#aaa', textDecoration: 'none' }}>Inicio</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <span style={{ color: 'var(--gold-light, #cb9f74)', fontWeight: 600 }} aria-current="page">Blog & Centro de Guías</span>
              </li>
            </ol>
          </nav>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(203, 159, 116, 0.15)', border: '1px solid rgba(203, 159, 116, 0.35)', padding: '6px 16px', borderRadius: '30px', marginBottom: '18px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#cb9f74', display: 'inline-block' }}></span>
            <span style={{ color: '#cb9f74', fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
              Centro de Inteligencia & Guías de Inversión 2026
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(32px, 5.5vw, 56px)', fontWeight: 900, lineHeight: 1.15, marginBottom: '18px', letterSpacing: '-0.5px' }}>
            Información Técnica & <span className="text-gradient">Estrategia Inmobiliaria</span>
          </h1>

          <p style={{ color: '#ccc', fontSize: 'clamp(14px, 2vw, 17px)', maxWidth: '750px', margin: '0 auto 35px', lineHeight: 1.6 }}>
            Aprende a evaluar plusvalía, verificar saneamiento registral en SUNARP y tomar decisiones de compra inteligentes en el Eje Chancay-Huaral.
          </p>

          {/* FILTROS INTERACTIVOS */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {filterOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedFilter(opt);
                  if (opt === 'Preguntas Frecuentes') {
                    const el = document.getElementById('faqs-seccion');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`btn-outline ${selectedFilter === opt ? 'btn-active' : ''}`}
                style={{ padding: '10px 20px', fontSize: '12px' }}
              >
                {opt}
              </button>
            ))}
          </div>

        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '50px 5% 90px' }}>
        
        {/* ARTÍCULO DESTACADO (HERO EDITORIAL FEATURE) */}
        {featuredArticle && selectedFilter !== 'Preguntas Frecuentes' && (
          <section style={{ marginBottom: '60px' }}>
            <div 
              onClick={() => setActiveArticle(featuredArticle)}
              style={{
                background: 'linear-gradient(135deg, rgba(18, 18, 18, 0.9) 0%, rgba(28, 22, 18, 0.9) 100%)',
                border: '1px solid rgba(203, 159, 116, 0.35)',
                borderRadius: '24px',
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '0',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
              }}
              className="featured-article-card"
            >
              <div style={{ position: 'relative', minHeight: '320px' }}>
                <Image 
                  src={featuredArticle.image} 
                  alt={featuredArticle.title} 
                  fill 
                  style={{ objectFit: 'cover' }} 
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div style={{ position: 'absolute', top: '18px', left: '18px', background: 'rgba(8, 8, 8, 0.85)', backdropFilter: 'blur(8px)', color: '#cb9f74', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', border: '1px solid rgba(203, 159, 116, 0.3)' }}>
                  ★ Artículo Destacado
                </div>
              </div>

              <div style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', fontSize: '12px', color: '#888' }}>
                  <span style={{ color: '#cb9f74', fontWeight: 700 }}>{featuredArticle.category}</span>
                  <span>•</span>
                  <span>{featuredArticle.readTime}</span>
                  <span>•</span>
                  <span>{featuredArticle.date}</span>
                </div>

                <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 900, lineHeight: 1.25, marginBottom: '14px', color: '#fff' }}>
                  {featuredArticle.title}
                </h2>

                <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.6, marginBottom: '22px' }}>
                  {featuredArticle.excerpt}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
                  <div style={{ fontSize: '12px' }}>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{featuredArticle.author}</div>
                    <div style={{ color: '#777', fontSize: '11px' }}>{featuredArticle.authorRole}</div>
                  </div>
                  <span className="btn-pill" style={{ padding: '10px 22px', fontSize: '11px' }}>
                    Leer Análisis Completo →
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* GRILLA DE ARTÍCULOS */}
        {selectedFilter !== 'Preguntas Frecuentes' && (
          <section style={{ marginBottom: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 900 }}>
                Artículos & <span className="text-gradient">Guías Técnicas</span>
              </h2>
              <span style={{ color: '#777', fontSize: '13px' }}>
                {filteredArticles.length} publicaciones disponibles
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
              {filteredArticles.map((art) => (
                <article
                  key={art.id}
                  onClick={() => setActiveArticle(art)}
                  style={{
                    background: 'rgba(18, 18, 18, 0.55)',
                    border: '1px solid rgba(203, 159, 116, 0.15)',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease'
                  }}
                  className="property-card"
                >
                  <div style={{ position: 'relative', height: '200px', width: '100%' }}>
                    <Image 
                      src={art.image} 
                      alt={art.title} 
                      fill 
                      style={{ objectFit: 'cover' }} 
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(8, 8, 8, 0.85)', backdropFilter: 'blur(6px)', color: art.badgeColor, padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>
                      {art.category}
                    </div>
                  </div>

                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '10px', display: 'flex', gap: '8px' }}>
                      <span>{art.date}</span>
                      <span>•</span>
                      <span>{art.readTime}</span>
                    </div>

                    <h3 style={{ fontSize: '18px', fontWeight: 800, lineHeight: 1.3, marginBottom: '12px', color: '#fff' }}>
                      {art.title}
                    </h3>

                    <p style={{ color: '#aaa', fontSize: '13px', lineHeight: 1.6, marginBottom: '20px', flexGrow: 1 }}>
                      {art.excerpt}
                    </p>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#777' }}>Por {art.author}</span>
                      <span style={{ color: '#cb9f74', fontSize: '12px', fontWeight: 700 }}>Leer artículo →</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* SECCIÓN DE PREGUNTAS FRECUENTES (FAQ COMPLETA E INTEGRADA) */}
        <section id="faqs-seccion" style={{ background: 'rgba(18, 18, 18, 0.65)', border: '1px solid rgba(203, 159, 116, 0.2)', borderRadius: '24px', padding: '50px 6%' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#cb9f74', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
              <span>❓</span> Respuestas Inmediatas
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900, marginBottom: '12px' }}>
              Preguntas <span className="text-gradient">Frecuentes de Compradores</span>
            </h2>
            <p style={{ color: '#aaa', fontSize: '14px', maxWidth: '600px', margin: '0 auto 25px' }}>
              Resolvemos las consultas más recurrentes sobre titulación, ubicaciones y trámites de compra.
            </p>

            {/* CATEGORÍAS FAQ */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {faqCategories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setFaqCategory(cat)}
                  className={`btn-outline ${faqCategory === cat ? 'btn-active' : ''}`}
                  style={{ padding: '8px 16px', fontSize: '11px' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '900px', margin: '0 auto' }}>
            {filteredFaqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index} 
                  className={`faq-item ${isOpen ? 'active' : ''}`}
                  style={{
                    background: 'rgba(12, 12, 12, 0.7)',
                    border: isOpen ? '1px solid rgba(203, 159, 116, 0.45)' : '1px solid rgba(203, 159, 116, 0.12)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
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
                      padding: '20px 24px',
                      color: '#fff',
                      fontSize: '15px',
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
                        padding: '0 24px 22px',
                        background: 'rgba(8, 8, 8, 0.3)'
                      }}
                    >
                      <p style={{ color: '#bbb', fontSize: '13.5px', lineHeight: 1.7, margin: 0, borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '14px' }}>
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
        <section style={{ marginTop: '70px', background: 'linear-gradient(135deg, rgba(203, 159, 116, 0.2) 0%, rgba(18, 18, 18, 0.95) 100%)', border: '1px solid rgba(203, 159, 116, 0.4)', borderRadius: '24px', padding: '50px 30px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, marginBottom: '12px' }}>
            ¿Deseas atención personalizada para tu próxima inversión?
          </h2>
          <p style={{ color: '#ccc', fontSize: '14px', maxWidth: '600px', margin: '0 auto 30px', lineHeight: 1.6 }}>
            Nuestro equipo de ventas y asesores legales en Chancay y Huaral responderá todas tus dudas en minutos.
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a 
              href="https://wa.me/56982816844?text=Hola,%20leí%20el%20blog%20de%20Norte%20Chico%20y%20quiero%20más%20información%20de%20los%20terrenos" 
              target="_blank" 
              rel="noreferrer"
              className="btn-pill" 
              style={{ background: '#25d366', color: '#fff', fontSize: '13px', padding: '16px 32px', boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)' }}
            >
              💬 Consulta Inmediata por WhatsApp
            </a>
            <Link 
              href="/#contacto" 
              className="btn-outline" 
              style={{ fontSize: '13px', padding: '16px 32px' }}
            >
              Agendar Recorrido en Terreno
            </Link>
          </div>
        </section>

      </main>

      {/* MODAL INMERSIVO DE LECTURA DE ARTÍCULO */}
      {activeArticle && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}
          onClick={() => setActiveArticle(null)}
        >
          <div 
            style={{
              background: '#121212',
              border: '2px solid rgba(203, 159, 116, 0.4)',
              borderRadius: '24px',
              maxWidth: '850px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '40px 30px',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setActiveArticle(null)}
              style={{ position: 'absolute', top: '18px', right: '18px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '24px', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ×
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: '#cb9f74', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px' }}>
              <span>{activeArticle.category}</span>
              <span>•</span>
              <span style={{ color: '#888' }}>{activeArticle.readTime}</span>
              <span>•</span>
              <span style={{ color: '#888' }}>{activeArticle.date}</span>
            </div>

            <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 900, lineHeight: 1.25, marginBottom: '20px', color: '#fff' }}>
              {activeArticle.title}
            </h2>

            <div style={{ position: 'relative', height: '280px', width: '100%', borderRadius: '16px', overflow: 'hidden', marginBottom: '30px' }}>
              <Image src={activeArticle.image} alt={activeArticle.title} fill style={{ objectFit: 'cover' }} />
            </div>

            {/* SECCIONES DEL ARTÍCULO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '35px' }}>
              {activeArticle.content.map((sec, idx) => (
                <div key={idx}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#cb9f74', marginBottom: '8px' }}>
                    {sec.subtitle}
                  </h3>
                  <p style={{ color: '#ccc', fontSize: '14.5px', lineHeight: 1.7 }}>
                    {sec.text}
                  </p>
                </div>
              ))}
            </div>

            {/* PUNTOS CLAVE DESTACADOS */}
            <div style={{ background: 'rgba(203, 159, 116, 0.08)', border: '1px solid rgba(203, 159, 116, 0.25)', borderRadius: '16px', padding: '24px', marginBottom: '30px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>
                📌 Conclusiones Clave para Inversionistas:
              </h4>
              <ul style={{ paddingLeft: '20px', color: '#bbb', fontSize: '13.5px', lineHeight: 1.6 }}>
                {activeArticle.keyPoints.map((pt, i) => (
                  <li key={i} style={{ marginBottom: '6px' }}>{pt}</li>
                ))}
              </ul>
            </div>

            {/* AUTOR & CTA WHATSAPP */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <div style={{ fontWeight: 800, color: '#fff', fontSize: '13px' }}>Redactado por: {activeArticle.author}</div>
                <div style={{ color: '#777', fontSize: '11px' }}>{activeArticle.authorRole} • Inmobiliaria Norte Chico</div>
              </div>
              <a 
                href={`https://wa.me/56982816844?text=Hola,%20leí%20el%20artículo:%20"${encodeURIComponent(activeArticle.title)}"%20y%20deseo%20más%20información`}
                target="_blank"
                rel="noreferrer"
                className="btn-pill"
                style={{ fontSize: '12px', padding: '12px 24px', background: '#25d366', color: '#fff' }}
              >
                💬 Consultar sobre este tema
              </a>
            </div>

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ background: 'var(--bg-black)', padding: '40px 5% 40px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="logo-main" style={{ fontSize: '16px', marginBottom: '10px' }}>INMOBILIARIA NORTE CHICO | CHANCAY Y HUARAL</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '15px 0', fontSize: '12px', flexWrap: 'wrap' }}>
          <Link href="/blog" style={{ color: 'var(--gold-light, #cb9f74)', textDecoration: 'none', fontWeight: 600 }}>
            Blog & Guías de Inversión
          </Link>
          <Link href="/preguntas-frecuentes" style={{ color: '#aaa', textDecoration: 'none' }}>
            Preguntas Frecuentes
          </Link>
          <Link href="/inmobiliaria-en-chancay" style={{ color: '#aaa', textDecoration: 'none' }}>
            Inmobiliaria en Chancay
          </Link>
          <Link href="/inmobiliaria-en-huaral" style={{ color: '#aaa', textDecoration: 'none' }}>
            Inmobiliaria en Huaral
          </Link>
        </div>
        <p style={{ fontSize: '12px', color: '#a3a3a3' }}>2026 © Inmobiliaria Norte Chico. Todos los derechos reservados.</p>
      </footer>

      {/* BOTÓN WHATSAPP FLOTANTE */}
      <WhatsAppButton />
    </div>
  );
}
