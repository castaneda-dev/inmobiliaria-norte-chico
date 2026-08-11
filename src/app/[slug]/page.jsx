import { cache } from 'react';
import { notFound } from 'next/navigation';
import { supabase } from '../../supabaseClient';
import PropertyDetailView from '../../components/PropertyDetailView';
import { slugify, getPropertySlug } from '../../utils/slugify';

const getPropertyBySlug = cache(async (rawSlug) => {
  try {
    const slug = decodeURIComponent(rawSlug || '').trim();
    if (!slug) return null;

    // 1. Buscar por ID directo si es numérico (ej. /26)
    if (!isNaN(slug) && Number(slug) > 0) {
      const { data } = await supabase.from('propiedades').select('*').eq('id', Number(slug)).single();
      if (data) return data;
    }

    // 2. Traer todas las propiedades y buscar coincidencia por slug o título
    const { data: allProps } = await supabase.from('propiedades').select('*');
    if (allProps && allProps.length > 0) {
      // Coincidencia exacta por slug generado
      let match = allProps.find(p => getPropertySlug(p).toLowerCase() === slug.toLowerCase());
      if (match) return match;

      // Coincidencia por slug de título limpiado
      match = allProps.find(p => slugify(p.titulo).toLowerCase() === slugify(slug).toLowerCase());
      if (match) return match;

      // Coincidencia por ID en string
      match = allProps.find(p => String(p.id) === slug);
      if (match) return match;
    }

    return null;
  } catch (e) {
    console.error("Error fetching property by slug:", e);
    return null;
  }
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (property) {
    const propSlug = getPropertySlug(property);
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
        canonical: `https://inmobiliarianortechico.pe/${propSlug}`,
      },
      openGraph: {
        title: titleStr,
        description: descStr,
        url: `https://inmobiliarianortechico.pe/${propSlug}`,
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
    title: 'Propiedad | Inmobiliaria Norte Chico',
    description: 'Especificaciones e información técnica de nuestro catálogo de propiedades.',
  };
}

export default async function SlugPropertyPage({ params }) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

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

  const propSlug = getPropertySlug(property);
  const numericPrice = typeof property.precio === 'number' ? property.precio : parseFloat(String(property.precio).replace(/[^0-9.]/g, '')) || 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    'name': property.titulo,
    'description': property.descripcion || `Lote o inmueble: ${property.titulo} en ${property.ubicacion || 'Norte Chico'}`,
    'url': `https://inmobiliarianortechico.pe/${propSlug}`,
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
