"use client";
import React from 'react';
import Link from 'next/link';

// Ãconos SVG inline â€” sin dependencias externas
const IconInstagram = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const IconFacebook = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const IconWhatsApp = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/#portafolio', label: 'Lotes Disponibles' },
  { href: '/blog', label: 'Blog & Noticias' },
  { href: '/preguntas-frecuentes', label: 'Preguntas Frecuentes' },
  { href: '/inmobiliaria-en-chancay', label: 'Inmobiliaria en Chancay' },
  { href: '/inmobiliaria-en-huaral', label: 'Inmobiliaria en Huaral' },
];

const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/inmobiliarianortechico',
    icon: <IconInstagram />,
    color: 'hover:text-[#E1306C]',
  },
  {
    label: 'Facebook',
    // Actualizar con la URL exacta de la pÃ¡gina de Facebook cuando estÃ© disponible
    href: 'https://www.facebook.com/inmobiliarianortechico',
    icon: <IconFacebook />,
    color: 'hover:text-[#1877F2]',
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/51904669316?text=Hola%2C%20quisiera%20informaciÃ³n%20sobre%20los%20lotes%20disponibles',
    icon: <IconWhatsApp />,
    color: 'hover:text-[#25D366]',
  },
];

export default function Footer() {
  return (
    <footer id="footer" className="bg-asfalto text-arena border-t border-arena/10 pt-14 pb-8 px-6 lg:px-16 relative z-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Grid principal: 3 columnas en desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          
          {/* Columna 1: Marca y Propuesta de Valor */}
          <div className="flex flex-col gap-4">
            <div>
              <div className="font-sans font-black text-xl text-white tracking-tight leading-none">NORTE CHICO</div>
              <div className="font-sans font-light text-sm text-arena/60 tracking-widest uppercase mt-0.5">Grupo Inmobiliario</div>
            </div>
            <p className="text-xs text-arena/60 leading-relaxed max-w-xs">
              Especialistas en lotes residenciales y terrenos de inversiÃ³n en Chancay y Huaral. 
              100% saneamiento legal con inscripciÃ³n vigente en SUNARP.
            </p>
            {/* Sello SUNARP */}
            <div className="inline-flex items-center gap-2 bg-white/5 border border-arena/10 rounded-lg px-3 py-2 w-fit">
              <span className="text-terracota text-base">âœ“</span>
              <span className="text-xs text-arena/70 font-mono">InscripciÃ³n verificable en SUNARP</span>
            </div>
            {/* Horario de atenciÃ³n */}
            <div className="text-xs text-arena/50 font-mono leading-relaxed">
              <div className="text-arena/70 mb-1 font-bold">Horario de atenciÃ³n</div>
              <div>Lunes a Viernes: 9am â€“ 6pm</div>
              <div>SÃ¡bados: 9am â€“ 1pm</div>
            </div>
          </div>

          {/* Columna 2: NavegaciÃ³n RÃ¡pida */}
          <div className="flex flex-col gap-3">
            <div className="text-xs font-mono font-bold text-arena/50 uppercase tracking-widest mb-1">NavegaciÃ³n</div>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-arena/70 hover:text-terracota transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Columna 3: Redes Sociales y Contacto */}
          <div className="flex flex-col gap-4">
            <div className="text-xs font-mono font-bold text-arena/50 uppercase tracking-widest mb-1">SÃ­guenos</div>
            
            {/* Ãconos de redes sociales */}
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`Visitar ${social.label} de Norte Chico Grupo Inmobiliario`}
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full
                    bg-white/5 border border-arena/10
                    text-arena/70 ${social.color}
                    transition-all duration-300 hover:bg-white/10 hover:border-arena/30 hover:scale-105
                  `}
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Links de redes con texto */}
            <div className="flex flex-col gap-2 mt-1">
              <a
                href="https://www.instagram.com/inmobiliarianortechico"
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm text-arena/60 hover:text-[#E1306C] transition-colors duration-200 flex items-center gap-2"
              >
                <span className="text-arena/30 text-xs">@</span>
                inmobiliarianortechico
              </a>
              <a
                href="https://wa.me/51904669316"
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm text-arena/60 hover:text-[#25D366] transition-colors duration-200"
              >
                WhatsApp: +56 9 8281 6844
              </a>
              <a
                href="mailto:contacto@inmobiliarianortechico.pe"
                className="text-sm text-arena/60 hover:text-terracota transition-colors duration-200"
              >
                contacto@inmobiliarianortechico.pe
              </a>
            </div>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-arena/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-arena/40 font-mono">
            Â© 2026 Inmobiliaria Norte Chico. Todos los derechos reservados.
          </p>
          <Link
            href="/crm"
            className="text-xs text-arena/30 hover:text-terracota transition-colors duration-200 font-mono flex items-center gap-1"
          >
            ðŸ” Acceso CRM
          </Link>
        </div>
      </div>
    </footer>
  );
}
