export const dynamic = 'force-dynamic';
export const revalidate = 0;

import HomeClient from '../HomeClient';
import { supabase } from '../../supabaseClient';

export const metadata = {
  title: 'Inmobiliaria en Huaral | Terrenos, Lotes y Casas',
  description: 'Somos la mejor inmobiliaria en Huaral. Descubre excelentes lotes y terrenos con alta plusvalía. Tu inversión segura en el Norte Chico.',
  alternates: {
    canonical: 'https://inmobiliarianortechico.pe/inmobiliaria-en-huaral',
  },
  openGraph: {
    title: 'Inmobiliaria en Huaral | Lotes y Terrenos',
    description: 'Descubre excelentes lotes y terrenos con alta plusvalía en Huaral.',
    url: 'https://inmobiliarianortechico.pe/inmobiliaria-en-huaral',
  }
};

export default async function HuaralLandingPage() {
  const { data: properties, error } = await supabase
    .from('propiedades')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error("Error fetching properties for Huaral:", error);
  }

  // Filtro simple: Propiedades que tengan "Huaral"
  const huaralProperties = (properties || []).filter(p => {
    const textToSearch = `${p.titulo} ${p.descripcion} ${p.zonificacion}`.toLowerCase();
    return textToSearch.includes('huaral') || textToSearch.includes('norte chico');
  });

  const finalProperties = huaralProperties.length > 0 ? huaralProperties : (properties || []);

  return (
    <HomeClient 
      initialProperties={finalProperties} 
      heroTitle="Tu Inmobiliaria en Huaral"
      heroSubtitle="Lotes y Terrenos para Inversión y Casa Huerta"
      heroLocation="Huaral"
    />
  );
}
