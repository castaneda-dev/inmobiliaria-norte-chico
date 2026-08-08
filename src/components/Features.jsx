import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TrendingUp, MapPin, ShieldCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Features() {
  return (
    <section id="features" className="py-32 px-8 lg:px-16 bg-arena text-asfalto">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-sans font-bold text-sm tracking-widest uppercase mb-16 text-terracota">Indicadores de Inversión</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ROIShuffler />
          <MarketTelemetry />
          <EarlyAdopterProtocol />
        </div>
      </div>
    </section>
  );
}

function ROIShuffler() {
  const [cards, setCards] = useState([
    { id: 1, title: "Proyección Plusvalía", val: "+140%", icon: <TrendingUp size={20}/> },
    { id: 2, title: "Distancia al Puerto", val: "15 Min", icon: <MapPin size={20}/> },
    { id: 3, title: "Saneamiento Legal", val: "100%", icon: <ShieldCheck size={20}/> }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCards(prev => {
        const newCards = [...prev];
        const last = newCards.pop();
        newCards.unshift(last);
        return newCards;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm h-80 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-6 left-6 font-mono text-xs text-asfalto font-bold uppercase tracking-widest">Auditoría Financiera</div>
      <div className="relative w-full h-32 flex justify-center mt-8">
        {cards.map((c, i) => {
          return (
            <div 
              key={c.id} 
              className={`absolute w-[85%] bg-arena border border-asfalto/10 rounded-2xl p-4 flex items-center justify-between transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]`}
              style={{
                transform: `translateY(${i * 12}px) scale(${1 - i * 0.05})`,
                zIndex: 10 - i,
                opacity: 1 - i * 0.2
              }}
            >
              <div className="flex items-center gap-3 text-asfalto">
                {c.icon}
                <span className="font-sans font-bold text-xs">{c.title}</span>
              </div>
              <span className="font-mono text-crecimiento font-bold text-sm">{c.val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MarketTelemetry() {
  const msgs = [
    "Analizando viabilidad comercial...",
    "Nueva obra pública aprobada...",
    "Actualizando valor m2 en zona...",
    "Validando demanda residencial..."
  ];
  const [text, setText] = useState("");
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    let currentText = "";
    let i = 0;
    const target = msgs[msgIdx];
    
    const typeInterval = setInterval(() => {
      if (i < target.length) {
        currentText += target.charAt(i);
        setText(currentText);
        i++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setMsgIdx((prev) => (prev + 1) % msgs.length);
        }, 2000);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [msgIdx]);

  return (
    <div className="bg-asfalto text-arena rounded-[2rem] p-8 shadow-sm h-80 flex flex-col relative overflow-hidden">
      <div className="flex justify-between items-center w-full mb-8">
        <div className="font-mono text-xs text-arena/50 uppercase tracking-widest">Market Telemetry</div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-terracota animate-pulse"></div>
          <span className="font-mono text-[10px] text-terracota uppercase">Feed en vivo</span>
        </div>
      </div>
      
      <div className="mt-auto mb-4 font-mono text-sm leading-relaxed text-arena/80 h-16">
        {'> '} {text}
        <span className="inline-block w-2 h-4 ml-1 bg-terracota animate-pulse translate-y-1"></span>
      </div>
    </div>
  );
}

function EarlyAdopterProtocol() {
  const cursorRef = useRef(null);
  const containerRef = useRef(null);
  const targetLoteRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
      
      tl.set(cursorRef.current, { x: 0, y: 150, opacity: 0, scale: 1 })
        .to(cursorRef.current, { opacity: 1, duration: 0.5 })
        .to(cursorRef.current, { 
          x: 100, y: 60, 
          duration: 1.5, 
          ease: "power2.inOut" 
        })
        .to(cursorRef.current, { scale: 0.8, duration: 0.1 }) // Click down
        .to(targetLoteRef.current, { backgroundColor: '#C25934', color: '#F4EFEA', duration: 0.2 }, "<")
        .to(cursorRef.current, { scale: 1, duration: 0.1 }) // Click up
        .to(cursorRef.current, { x: 190, y: 140, duration: 1, ease: "power2.inOut", delay: 0.5 })
        .to(cursorRef.current, { opacity: 0, duration: 0.5 })
        .to(targetLoteRef.current, { backgroundColor: '#F4EFEA', color: 'rgba(44, 53, 57, 0.4)', duration: 0.1 }, "<");
        
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-white rounded-[2rem] p-8 shadow-sm h-80 relative overflow-hidden">
      <div className="font-mono text-xs text-asfalto font-bold uppercase tracking-widest mb-8">Early Adopter Protocol</div>
      
      <div className="grid grid-cols-4 gap-2 mt-4">
        {[1,2,3,4,5,6,7,8].map((d, i) => (
          <div 
            key={i} 
            ref={i === 5 ? targetLoteRef : null}
            className="w-12 h-10 rounded-lg flex items-center justify-center font-sans text-[10px] font-bold bg-arena text-asfalto/40 transition-colors"
          >
            L-{d}
          </div>
        ))}
      </div>

      <div className="absolute bottom-8 right-8 bg-arena border border-asfalto/10 px-4 py-2 rounded-full font-sans text-xs font-bold text-asfalto">
        Asegurar Capital
      </div>

      {/* SVG Cursor */}
      <svg 
        ref={cursorRef} 
        className="absolute top-0 left-0 w-6 h-6 text-asfalto drop-shadow-md z-20"
        fill="currentColor" viewBox="0 0 24 24"
      >
        <path d="M7 2l12 11.2-5.8.5 3.3 7.3-2.2.9-3.2-7.4-4.4 4.7z"/>
      </svg>
    </div>
  );
}
