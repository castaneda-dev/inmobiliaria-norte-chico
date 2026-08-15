export const dynamic = 'force-dynamic';
export const revalidate = 0;

import HomeClient from '../HomeClient';
import { supabase } from '../../supabaseClient';

export const metadata = {
  title: 'Inmobiliaria en Chancay | Terrenos y Lotes Cerca al Megapuerto',
  description: 'Somos la mejor inmobiliaria en Chancay. Encuentra lotes y terrenos de alta plusvalía ideales para inversión, cerca del Megapuerto de Chancay.',
  alternates: {
    canonical: 'https://inmobiliarianortechico.pe/inmobiliaria-en-chancay',
  },
  openGraph: {
    title: 'Inmobiliaria en Chancay | Lotes y Terrenos',
    description: 'Encuentra lotes y terrenos de alta plusvalía cerca del Megapuerto de Chancay.',
    url: 'https://inmobiliarianortechico.pe/inmobiliaria-en-chancay',
  }
};

export default async function ChancayLandingPage() {
  // Filtramos las propiedades que contengan Chancay en algún campo relevante
  const { data: properties, error } = await supabase
    .from('propiedades')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error("Error fetching properties for Chancay:", error);
  }

  // Filtro simple: Propiedades que tengan "Chancay" en la ubicación o descripción
  const chancayProperties = (properties || []).filter(p => {
    const textToSearch = `${p.titulo} ${p.descripcion} ${p.zonificacion}`.toLowerCase();
    return textToSearch.includes('chancay') || textToSearch.includes('norte chico');
  });

  // Si no hay propiedades exclusivas, mostramos todas (o podríamos mostrar un mensaje)
  const finalProperties = chancayProperties.length > 0 ? chancayProperties : (properties || []);

  return (
    <HomeClient 
      initialProperties={finalProperties} 
      heroTitle="Tu Inmobiliaria en Chancay"
      heroSubtitle="Lotes y Terrenos de Inversión cerca al Megapuerto"
      heroLocation="Chancay"
    />
  );
}
