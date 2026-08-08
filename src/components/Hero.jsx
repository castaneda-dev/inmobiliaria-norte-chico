import React from 'react';
import { TrendingUp, MapPin, ShieldCheck } from 'lucide-react';
import heroBg from '../../PR_GLORIETA_DELUXE.png';

export default function Hero() {
  return (
    <section className="relative w-full flex items-center pt-24 lg:pt-32 pb-16 lg:pb-24 bg-arena overflow-hidden">
      <div className="w-full max-w-[90rem] mx-auto px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Column - Authority Copy */}
        <div className="flex flex-col justify-center text-asfalto">
          <h1 className="flex flex-col gap-2">
            <span className="font-sans font-black text-4xl md:text-5xl lg:text-[4rem] tracking-tight leading-[1.1]">
              Invierte en tu futuro
            </span>
            <span className="font-sans font-black text-4xl md:text-5xl lg:text-[4rem] text-terracota leading-[1.1]">
              y el de tu familia.
            </span>
          </h1>
          <p className="font-sans text-lg font-medium mt-6 text-asfalto/80 max-w-xl leading-relaxed">
            Descubre tu próximo hogar con terrenos de alta plusvalía en Huaral y Chancay. Ideales para el retiro y bienestar familiar.
          </p>
          
          <div className="flex gap-6 mt-10">
            <a href="#proyectos" className="bg-terracota text-white px-8 py-4 rounded font-bold text-sm uppercase tracking-wide hover:bg-[#b04626] transition-colors shadow-md">
              Ver Catálogo de Proyectos
            </a>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-8 border-t border-asfalto/10">
            <div className="flex flex-col gap-2">
              <ShieldCheck className="text-crecimiento" size={32}/>
              <span className="font-sans font-bold text-asfalto">100% Saneado</span>
              <span className="font-sans text-xs text-asfalto/70">Inscrito en SUNARP</span>
            </div>
            <div className="flex flex-col gap-2">
              <TrendingUp className="text-crecimiento" size={32}/>
              <span className="font-sans font-bold text-asfalto">+140% Retorno</span>
              <span className="font-sans text-xs text-asfalto/70">Proyección Plusvalía 2026</span>
            </div>
            <div className="flex flex-col gap-2">
              <MapPin className="text-crecimiento" size={32}/>
              <span className="font-sans font-bold text-asfalto">10 Minutos</span>
              <span className="font-sans text-xs text-asfalto/70">Del Megapuerto Chancay</span>
            </div>
          </div>
        </div>

        {/* Right Column - Corporate Image */}
        <div className="relative h-[400px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
          <img 
            src={heroBg.src || heroBg} 
            alt="Vista aérea de proyectos" 
            className="w-full h-full object-cover"
          />
        </div>

      </div>
    </section>
  );
}
