"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../supabaseClient';
import { MapPin, Maximize, ArrowRight } from 'lucide-react';

export default function Catalog() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos');

  useEffect(() => {
    async function fetchProperties() {
      try {
        const { data, error } = await supabase.from('propiedades').select('*').order('id', { ascending: false });
        if (error) throw error;
        
        const mapped = data.map(p => {
          let imagenesList = [];
          const rawImg = p.imagen_url || p.imagen || '';
          try {
            if (rawImg && typeof rawImg === 'string' && rawImg.startsWith('[')) {
              imagenesList = JSON.parse(rawImg);
            } else if (p.imagenes && Array.isArray(p.imagenes)) {
              imagenesList = p.imagenes;
            } else if (rawImg) {
              imagenesList = [rawImg];
            }
          } catch (e) {
            if (rawImg) imagenesList = [rawImg];
          }

          if (!imagenesList.length) {
            imagenesList = ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85'];
          }
          
          return {
            ...p,
            imagenesList,
            precioFormat: typeof p.precio === 'number' ? '$' + parseFloat(p.precio).toLocaleString() : (p.precio || '$0'),
            categoria: (p.tipo_activo || '').toLowerCase() === 'terreno' ? 'terreno' : 'vivienda'
          };
        }).filter(p => p.estado !== 'Vendido');

        setProperties(mapped);
      } catch (err) {
        console.error("Error fetching properties:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProperties();
  }, []);

  const filtered = properties.filter(p => filter === 'todos' || p.categoria === filter);

  return (
    <section id="proyectos" className="py-32 px-8 lg:px-16 bg-arena text-asfalto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div>
            <h2 className="font-sans font-bold text-sm tracking-widest uppercase text-terracota mb-2">Nuestro Portafolio</h2>
            <h3 className="font-sans font-black text-4xl md:text-5xl">Catálogo de Proyectos</h3>
          </div>
          
          <div className="flex gap-4 mt-8 md:mt-0 font-mono text-xs">
            <button onClick={() => setFilter('todos')} className={`px-4 py-2 rounded-full border transition-colors ${filter === 'todos' ? 'bg-asfalto text-arena border-asfalto' : 'border-asfalto/20 hover:border-asfalto'}`}>Todos ({properties.length})</button>
            <button onClick={() => setFilter('vivienda')} className={`px-4 py-2 rounded-full border transition-colors ${filter === 'vivienda' ? 'bg-asfalto text-arena border-asfalto' : 'border-asfalto/20 hover:border-asfalto'}`}>Residencial</button>
            <button onClick={() => setFilter('terreno')} className={`px-4 py-2 rounded-full border transition-colors ${filter === 'terreno' ? 'bg-asfalto text-arena border-asfalto' : 'border-asfalto/20 hover:border-asfalto'}`}>Comercial</button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-terracota border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(p => (
              <PropertyCard key={p.id} property={p} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-20 opacity-50">
                <p className="font-sans text-xl font-bold">No hay proyectos disponibles en esta categoría.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function PropertyCard({ property }) {
  const whatsappMsg = `Hola, me interesa asegurar capital en el proyecto ID-${property.id}: ${property.titulo}. Quisiera más información sobre la plusvalía.`;

  return (
    <div className="group bg-white rounded-[2rem] overflow-hidden shadow-lg border border-asfalto/5 transition-transform duration-500 hover:-translate-y-2 flex flex-col">
      <Link href={`/proyecto/${property.id}`} className="relative h-64 overflow-hidden block">
        <img 
          src={property.imagenesList[0]} 
          alt={property.titulo} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 bg-terracota text-white px-3 py-1 rounded-full text-xs font-bold font-mono tracking-widest uppercase">
          {property.estado || 'Disponible'}
        </div>
      </Link>
      
      <div className="p-8 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4">
          <Link href={`/proyecto/${property.id}`} className="hover:text-terracota transition-colors">
            <h4 className="font-sans font-bold text-xl leading-tight line-clamp-2">{property.titulo}</h4>
          </Link>
          <span className="font-sans font-black text-xl text-terracota whitespace-nowrap ml-4">{property.precioFormat}</span>
        </div>
        
        <p className="font-mono text-sm opacity-60 line-clamp-2 mb-6">{property.descripcion || 'Terreno estratégico en el eje logístico Chancay-Huaral.'}</p>
        
        <div className="mt-auto grid grid-cols-2 gap-4 border-t border-asfalto/10 pt-6 mb-6">
          <div className="flex items-center gap-2 text-sm font-sans font-semibold">
            <Maximize size={16} className="text-terracota" />
            {property.area_m2 || property.area || 'N/A'} m²
          </div>
          <div className="flex items-center gap-2 text-sm font-sans font-semibold">
            <MapPin size={16} className="text-terracota" />
            {property.zonificacion || 'Residencial'}
          </div>
        </div>

        <div className="flex gap-3">
          <Link 
            href={`/proyecto/${property.id}`}
            className="flex-1 py-3.5 bg-asfalto text-arena rounded font-bold text-xs uppercase tracking-widest hover:bg-terracota transition-colors flex justify-center items-center gap-2"
          >
            Ver Ficha 1:1 <ArrowRight size={14} />
          </Link>
          
          <a 
            href={`https://wa.me/56982816844?text=${encodeURIComponent(whatsappMsg)}`} 
            target="_blank" 
            rel="noreferrer" 
            title="Asegurar por WhatsApp"
            className="px-4 py-3.5 bg-crecimiento text-white rounded font-bold text-xs uppercase tracking-widest hover:bg-[#0da070] transition-colors flex justify-center items-center"
            onClick={() => {
              if(typeof window !== 'undefined' && window.dataLayer) {
                window.dataLayer.push({ event: 'whatsapp_click', property_id: property.id, property_title: property.titulo });
              }
            }}
          >
            💬
          </a>
        </div>
      </div>
    </div>
  );
}
