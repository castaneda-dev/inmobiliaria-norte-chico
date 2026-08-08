"use client";
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

import 'leaflet/dist/leaflet.css';

export default function StrategicMap() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => { 
    setMounted(true);
    import('leaflet').then(L => {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    });
  }, []);

  const portCoords = [-11.5694, -77.2676];
  const lotCoords = [-11.4939, -77.2078];

  return (
    <section id="inteligencia" className="py-32 px-8 lg:px-16 bg-asfalto text-arena relative overflow-hidden">
      <div className="max-w-[90rem] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
        
        {/* Left Half: Map */}
        <div className="flex flex-col h-full justify-between">
          <div>
            <h2 className="font-sans font-bold text-sm tracking-widest uppercase text-terracota mb-2">Inteligencia Logística</h2>
            <h3 className="font-sans font-black text-3xl md:text-4xl mb-8">Ruta Vectorizada al Megapuerto</h3>
          </div>
          
          <div className="h-[450px] lg:h-[480px] w-full rounded-[2.5rem] overflow-hidden border border-terracota/30 shadow-2xl relative z-10">
            {!mounted ? (
              <div className="h-full bg-asfalto/80 w-full flex items-center justify-center font-mono text-xs">Calibrando señal satelital...</div>
            ) : (
              <MapContainer center={[-11.53, -77.24]} zoom={11.5} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; CARTO'
                />
                <Marker position={portCoords}>
                  <Popup><strong className="font-sans">Megapuerto de Chancay</strong></Popup>
                </Marker>
                <Marker position={lotCoords}>
                  <Popup><strong className="font-sans text-terracota">Proyectos Norte Chico</strong><br/>10 mins de distancia</Popup>
                </Marker>
                <Polyline positions={[portCoords, lotCoords]} pathOptions={{ color: '#D45D39', weight: 4, dashArray: '10, 10' }} />
              </MapContainer>
            )}
          </div>
        </div>

        {/* Right Half: Arquitectura de Inversión (Casas & Lotes de Inversión) */}
        <div className="flex flex-col h-full justify-between">
          <div>
            <h2 className="font-sans font-bold text-sm tracking-widest uppercase text-terracota mb-2">Portafolio Patrimonial</h2>
            <h3 className="font-sans font-black text-3xl md:text-4xl mb-8">Arquitectura de Inversión</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {/* Option 1: Casas */}
            <div className="bg-asfalto border border-arena/20 rounded-xl p-8 flex flex-col justify-between hover:border-terracota transition-all shadow-xl">
              <div>
                <div className="font-mono text-[10px] text-arena/50 uppercase tracking-widest mb-2">Vivienda Residencial</div>
                <h4 className="font-sans font-black text-2xl text-white mb-4">Casas</h4>
                <p className="font-mono text-xs opacity-70 mb-6 leading-relaxed">
                  Desarrollos de alta calidad diseñados para retiro, bienestar familiar y vivienda propia en zona de expansión.
                </p>
                <ul className="space-y-3 font-mono text-xs text-arena/80 mb-8">
                  <li className="flex items-center gap-2">✓ Diseños de Vanguardia</li>
                  <li className="flex items-center gap-2">✓ Saneamiento Registral 100%</li>
                  <li className="flex items-center gap-2">✓ Servicios Básicos Proyectados</li>
                </ul>
              </div>
              <a 
                href="#proyectos" 
                className="w-full border border-arena/30 text-arena py-3.5 rounded font-bold text-xs uppercase tracking-widest hover:bg-arena hover:text-asfalto transition-colors text-center block"
              >
                Ver Casas
              </a>
            </div>

            {/* Option 2: Lotes de Inversión */}
            <div className="bg-terracota border border-terracota rounded-xl p-8 flex flex-col justify-between shadow-2xl hover:scale-[1.02] transition-transform">
              <div>
                <div className="font-mono text-[10px] text-white/80 uppercase tracking-widest mb-2">Proyección Acelerada</div>
                <h4 className="font-sans font-black text-2xl text-white mb-4">Lotes de Inversión</h4>
                <p className="font-mono text-xs text-white/90 mb-6 leading-relaxed">
                  Terrenos estratégicos de alta plusvalía impulsados por la demanda logística directa del Megapuerto.
                </p>
                <ul className="space-y-3 font-mono text-xs text-white/95 mb-8">
                  <li className="flex items-center gap-2">✓ 120m² a +1000m²</li>
                  <li className="flex items-center gap-2">✓ Ubicación en Avenidas Clave</li>
                  <li className="flex items-center gap-2">✓ Máxima Rentabilidad 2026</li>
                </ul>
              </div>
              <a 
                href="#proyectos" 
                className="w-full bg-white text-terracota py-3.5 rounded font-black text-xs uppercase tracking-widest hover:bg-arena transition-colors text-center block shadow-lg"
              >
                Asegurar Lote
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
