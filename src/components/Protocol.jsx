import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, Map, Wallet } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const cards = [
  { id: 1, title: "Visión Anticipada", desc: "Detectamos oportunidades antes que el mercado alcance su pico. (Early Adopters)", icon: <Search className="w-24 h-24 text-terracota animate-[spin_10s_linear_infinite]" /> },
  { id: 2, title: "Respaldo Jurídico", desc: "Operaciones 100% blindadas en registros públicos peruanos.", icon: <Map className="w-24 h-24 text-crecimiento animate-pulse" /> },
  { id: 3, title: "Retorno Patrimonial", desc: "Crecimiento sostenido impulsado por la macro-infraestructura portuaria.", icon: <Wallet className="w-24 h-24 text-asfalto animate-bounce" /> }
];

export default function Protocol() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cardElements = gsap.utils.toArray('.protocol-card');
      
      cardElements.forEach((card, i) => {
        if (i < cardElements.length - 1) {
          ScrollTrigger.create({
            trigger: cardElements[i + 1],
            start: "top 80%",
            end: "top 20%",
            scrub: true,
            animation: gsap.to(card, {
              scale: 0.9,
              opacity: 0.5,
              filter: 'blur(20px)',
              ease: "none"
            })
          });
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="protocol" className="bg-arena py-20 px-4 relative z-10">
      <div className="max-w-5xl mx-auto space-y-[40vh] pb-[20vh]">
        {cards.map((c, i) => (
          <div 
            key={c.id} 
            className="protocol-card sticky top-32 h-[60vh] w-full bg-white rounded-[3rem] shadow-2xl border border-asfalto/10 flex flex-col md:flex-row items-center justify-center p-8 md:p-16 gap-12"
          >
            <div className="flex-1 space-y-6">
              <div className="font-mono text-terracota text-xs font-bold uppercase tracking-widest">Protocolo 0{i+1}</div>
              <h3 className="font-sans font-black text-4xl text-asfalto">{c.title}</h3>
              <p className="font-mono text-asfalto/60 uppercase tracking-widest">{c.desc}</p>
            </div>
            <div className="flex-1 flex items-center justify-center bg-arena/50 h-full w-full rounded-[2rem] border border-asfalto/5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(#2C3539_1px,transparent_1px),linear-gradient(90deg,#2C3539_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                {c.icon}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
