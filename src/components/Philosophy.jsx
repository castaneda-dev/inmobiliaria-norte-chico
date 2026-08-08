"use client";
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Philosophy() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.parallax-bg', {
        y: '20%',
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      });

      gsap.from('.reveal-word', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.text-container',
          start: 'top 75%',
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const renderWords = (text, className) => {
    return text.split(' ').map((word, i) => (
      <span key={i} className={`reveal-word inline-block mr-3 ${className}`}>{word}</span>
    ));
  };

  return (
    <section ref={containerRef} id="philosophy" className="relative py-40 px-8 lg:px-16 bg-asfalto text-arena overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
        <img 
          src="https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=2000&auto=format&fit=crop" 
          alt="Textura de concreto y ciudad" 
          className="parallax-bg w-full h-[120%] object-cover -top-[10%]"
        />
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto text-container flex flex-col gap-12">
        <h3 className="font-sans font-medium text-2xl md:text-4xl text-arena/50 leading-tight">
          {renderWords("El mercado tradicional dice:", "")}
          <br />
          {renderWords("Compra un pedazo de tierra.", "italic")}
        </h3>
        
        <h2 className="font-sans font-black text-4xl md:text-6xl lg:text-7xl leading-[1.1]">
          {renderWords("Nosotros decimos:", "")}
          <br />
          {renderWords("Compra la plusvalía del 2026.", "text-terracota")}
        </h2>
      </div>
    </section>
  );
}
