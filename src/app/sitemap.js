import { supabase } from '../supabaseClient';

export default async function sitemap() {
  const baseUrl = 'https://inmobiliarianortechico.pe';

  let propertyRoutes = [];
  try {
    const { data: properties } = await supabase
      .from('propiedades')
      .select('id');
    
    if (properties && properties.length > 0) {
      propertyRoutes = properties.map((prop) => ({
        url: `${baseUrl}/proyecto/${prop.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (e) {
    console.error('Error al generar sitemap para propiedades:', e);
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...propertyRoutes,
  ];
}
