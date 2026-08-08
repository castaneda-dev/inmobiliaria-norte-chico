"use client";
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Navbar() {
  const navRef = useRef(null);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: 'top -50',
        end: 99999,
        toggleClass: { className: 'scrolled', targets: navRef.current },
      });
    }, navRef);
    return () => ctx.revert();
  }, []);

  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-8 py-4 flex items-center justify-between w-full 
      bg-arena text-asfalto shadow-sm
      [&.scrolled]:bg-white [&.scrolled]:shadow-md">
      <Link href="/" className="font-sans font-black tracking-tight text-xl text-asfalto hover:text-terracota transition-colors">
        NORTE CHICO
      </Link>
      {isHome && (
        <div className="flex gap-6 items-center font-sans text-sm font-bold">
          <Link href="/#proyectos" className="hover:text-terracota transition-colors">Proyectos</Link>
          <Link href="/#inteligencia" className="hover:text-terracota transition-colors">Inteligencia</Link>
          <Link href="/#asesoria" className="px-6 py-2 rounded border border-asfalto text-asfalto text-xs tracking-wider uppercase hover:bg-terracota hover:border-terracota hover:text-white transition-all shadow-sm hover:shadow-md">
            Asesoría
          </Link>
        </div>
      )}
    </nav>
  );
}
