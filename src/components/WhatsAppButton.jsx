"use client";
import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/56982816844?text=Hola,%20me%20interesa%20informaci%C3%B3n%20sobre%20sus%20propiedades%20en%20Norte%20Chico"
      target="_blank"
      rel="noreferrer"
      aria-label="Chatea con nosotros en WhatsApp"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
    >
      <MessageCircle size={28} className="fill-current text-white" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out font-sans font-bold text-xs pl-0 group-hover:pl-2">
        Chatear por WhatsApp
      </span>
    </a>
  );
}
