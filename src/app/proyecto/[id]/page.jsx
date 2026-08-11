import { cache } from 'react';
import { notFound } from 'next/navigation';
import { supabase } from '../../../supabaseClient';
import PropertyDetailView from '../../../components/PropertyDetailView';

const getProperty = cache(async (id) => {
  try {
    const { data } = await supabase.from('propiedades').select('*').eq('id', id).single();
    return data;
  } catch (e) {
    console.error("Error fetching property by ID:", e);
    return null;
  }
});

export async function generateMetadata({ params }) {
  const { id } = await params;
  const property = await getProperty(id);

  if (property) {
    let mainImg = property.imagen_url || property.imagen || 'https://inmobiliarianortechico.pe/PR_GLORIETA_DELUXE.webp';
    try {
      if (typeof mainImg === 'string' && mainImg.startsWith('[')) {
        const parsed = JSON.parse(mainImg);
        if (parsed.length) mainImg = parsed[0];
      }
    } catch (e) {}

    const titleStr = `${property.titulo} | Inmobiliaria Norte Chico`;
    const descStr = property.descripcion ? property.descripcion.slice(0, 160) : `Lote e inmueble en venta: ${property.titulo} en ${property.ubicacion || 'Norte Chico'}. Inmobiliaria Norte Chico.`;

    return {
      title: titleStr,
      description: descStr,
      alternates: {
        canonical: `https://inmobiliarianortechico.pe/proyecto/${id}`,
      },
      openGraph: {
        title: titleStr,
        description: descStr,
        url: `https://inmobiliarianortechico.pe/proyecto/${id}`,
        siteName: 'Inmobiliaria Norte Chico',
        images: [{ url: mainImg, alt: property.titulo }],
      },
      twitter: {
        card: 'summary_large_image',
        title: titleStr,
        description: descStr,
        images: [mainImg],
      },
    };
  }

  return {
    title: 'Proyecto | Inmobiliaria Norte Chico',
    description: 'Especificaciones e información técnica de nuestro catálogo de propiedades.',
  };
}

export default async function ProyectoPage({ params }) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    notFound();
  }

  let mainImg = property.imagen_url || property.imagen || 'https://inmobiliarianortechico.pe/PR_GLORIETA_DELUXE.webp';
  try {
    if (typeof mainImg === 'string' && mainImg.startsWith('[')) {
      const parsed = JSON.parse(mainImg);
      if (parsed.length) mainImg = parsed[0];
    }
  } catch (e) {}

  const numericPrice = typeof property.precio === 'number' ? property.precio : parseFloat(String(property.precio).replace(/[^0-9.]/g, '')) || 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    'name': property.titulo,
    'description': property.descripcion || `Lote o inmueble: ${property.titulo} en ${property.ubicacion || 'Norte Chico'}`,
    'url': `https://inmobiliarianortechico.pe/proyecto/${id}`,
    'image': mainImg,
    'datePosted': new Date().toISOString(),
    'offers': {
      '@type': 'Offer',
      'price': numericPrice,
      'priceCurrency': 'USD',
      'availability': property.estado === 'Vendido' ? 'https://schema.org/Sold' : 'https://schema.org/InStock',
      'validFrom': new Date().toISOString(),
    },
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': property.ubicacion || 'Norte Chico',
      'addressRegion': 'Lima',
      'addressCountry': 'PE',
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': property.latitud || property.lat || -11.53,
      'longitude': property.longitud || property.lng || -77.24
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PropertyDetailView property={property} />
    </>
  );
}
