"use client";
import React, { useState } from 'react';
import { createClient } from '../utils/supabase/client';
const supabase = createClient();
import { ShieldCheck, CalendarCheck, TrendingUp } from 'lucide-react';

export default function ContactForm() {
  const [formData, setFormData] = useState({ nombre: '', email: '', telefono: '', prefijo: '+51', mensaje: '' });
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'API Error');
      
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
    <section id="asesoria" className="py-32 px-8 lg:px-16 bg-asfalto text-arena relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(#F4EFEA_1px,transparent_1px),linear-gradient(90deg,#F4EFEA_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="font-sans font-bold text-sm tracking-widest uppercase text-terracota mb-4">Mesa de Negocios</h2>
          <h3 className="font-sans font-black text-4xl md:text-6xl mb-8 leading-[1.1]">Inicia tu<br/>Posicionamiento<br/>Estratégico.</h3>
          <p className="font-mono text-sm opacity-70 mb-12 max-w-md">
            Un asesor financiero de Norte Chico te contactará para presentarte el análisis de plusvalía y disponibilidad actual.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <ShieldCheck className="text-terracota w-8 h-8" />
              <div>
                <h4 className="font-sans font-bold">100% Confidencial</h4>
                <p className="font-mono text-xs opacity-50">Tus datos están protegidos.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <TrendingUp className="text-terracota w-8 h-8" />
              <div>
                <h4 className="font-sans font-bold">Data Real del Mercado</h4>
                <p className="font-mono text-xs opacity-50">Crecimiento garantizado por el Puerto.</p>
              </div>
            </div>
          </div>

          {/* Acceso directo a redes — alternativa al formulario */}
          <div className="mt-10 pt-8 border-t border-arena/10">
            <p className="font-mono text-xs text-arena/40 uppercase tracking-widest mb-4">O escríbenos directamente</p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/inmobiliarianortechico"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Escribirnos por Instagram"
                className="flex items-center gap-2 text-arena/50 hover:text-[#E1306C] transition-colors duration-200 text-xs font-mono"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
                Instagram
              </a>
              <span className="text-arena/15">|</span>
              {/* TODO: Actualizar con URL exacta de Facebook */}
              <a
                href="https://www.facebook.com/inmobiliarianortechico"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Escribirnos por Facebook"
                className="flex items-center gap-2 text-arena/50 hover:text-[#1877F2] transition-colors duration-200 text-xs font-mono"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
                Facebook
              </a>
              <span className="text-arena/15">|</span>
              <a
                href="https://wa.me/51904669316?text=Hola%2C%20quisiera%20información%20sobre%20los%20lotes%20disponibles"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Escribirnos por WhatsApp"
                className="flex items-center gap-2 text-arena/50 hover:text-[#25D366] transition-colors duration-200 text-xs font-mono"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="bg-asfalto rounded-xl p-8 md:p-12 border border-terracota/30 shadow-2xl relative">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* CAMPO TRAP HONEYPOT ANTI-BOTS AUTOMATIZADOS */}
            <input 
              type="text" 
              name="website" 
              value={formData.website || ''} 
              onChange={e => setFormData({...formData, website: e.target.value})} 
              style={{ display: 'none', opacity: 0, position: 'absolute', left: '-9999px' }} 
              tabIndex={-1} 
              autoComplete="off" 
            />

            <div>
              <label className="block font-mono text-xs uppercase tracking-widest mb-2 text-terracota font-bold">Nombre Completo</label>
              <input 
                required type="text" 
                value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})}
                className="w-full bg-asfalto/80 border border-arena/20 rounded-xl px-4 py-3.5 text-white font-sans text-sm placeholder:text-arena/40 focus:outline-none focus:border-terracota focus:ring-1 focus:ring-terracota transition-all shadow-inner"
                placeholder="Ej. Juan Pérez"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-mono text-xs uppercase tracking-widest mb-2 text-terracota font-bold">Teléfono (WhatsApp)</label>
                <div className="flex items-center gap-2">
                  <select 
                    aria-label="Código de país"
                    value={formData.prefijo} 
                    onChange={e => setFormData({...formData, prefijo: e.target.value})}
                    className="bg-asfalto/80 text-white border border-arena/20 rounded-xl px-3 py-3.5 text-xs font-mono focus:outline-none focus:border-terracota cursor-pointer shrink-0"
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
                    required type="tel" 
                    value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})}
                    className="w-full bg-asfalto/80 border border-arena/20 rounded-xl px-4 py-3.5 text-white font-mono text-sm placeholder:text-arena/40 focus:outline-none focus:border-terracota focus:ring-1 focus:ring-terracota transition-all shadow-inner"
                    placeholder="999 888 777"
                  />
                </div>
              </div>
              <div>
                <label className="block font-mono text-xs uppercase tracking-widest mb-2 text-terracota font-bold">Email</label>
                <input 
                  required type="email" 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-asfalto/80 border border-arena/20 rounded-xl px-4 py-3.5 text-white font-sans text-sm placeholder:text-arena/40 focus:outline-none focus:border-terracota focus:ring-1 focus:ring-terracota transition-all shadow-inner"
                  placeholder="juan@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-widest mb-2 text-terracota font-bold">¿Qué estás buscando?</label>
              <textarea 
                rows="3"
                value={formData.mensaje} onChange={e => setFormData({...formData, mensaje: e.target.value})}
                className="w-full bg-asfalto/80 border border-arena/20 rounded-xl p-4 text-white font-sans text-sm placeholder:text-arena/40 focus:outline-none focus:border-terracota focus:ring-1 focus:ring-terracota transition-all shadow-inner resize-none"
                placeholder="Me interesa invertir en lotes cerca del Megapuerto..."
              ></textarea>
            </div>

            <button 
              disabled={status === 'loading'}
              type="submit" 
              className="mt-4 bg-terracota text-white py-4 rounded-full font-bold text-xs uppercase tracking-widest magnetic-btn hover:bg-[#a64b2b] transition-colors disabled:opacity-50 shadow-xl shadow-terracota/20"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {status === 'loading' ? 'Procesando...' : (
                  <><CalendarCheck size={16}/> Agendar Asesoría</>
                )}
              </span>
            </button>
            
            {status === 'success' && (
              <div className="absolute top-8 right-8 bg-emerald-600 text-white px-4 py-2 rounded-xl font-mono text-xs font-bold animate-pulse shadow-lg">
                ¡Solicitud enviada con éxito!
              </div>
            )}
            {status === 'error' && (
              <div className="absolute top-8 right-8 bg-red-600 text-white px-4 py-2 rounded-xl font-mono text-xs font-bold shadow-lg">
                Hubo un error. Intenta nuevamente.
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
