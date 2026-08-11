"use client";
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
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
