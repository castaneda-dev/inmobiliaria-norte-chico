"use client";
import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer id="footer" className="bg-asfalto text-arena border-t border-arena/10 pt-12 pb-12 px-8 lg:px-16 relative z-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm font-mono opacity-70 gap-4">
        <div>
          <div className="font-sans font-black text-lg text-white mb-1">INMOBILIARIA NORTE CHICO</div>
          <p className="text-xs opacity-60">2026 © Inmobiliaria Norte Chico S.A.C. Todos los derechos reservados.</p>
        </div>
        <div>
          <Link href="/crm" className="text-xs text-terracota hover:underline flex items-center gap-1 font-mono">
            🔐 Acceso CRM
          </Link>
        </div>
      </div>
    </footer>
  );
}
