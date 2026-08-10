import { cache } from 'react';
import { supabase } from '../../../supabaseClient';
import PropertyDetailView from '../../../components/PropertyDetailView';

const getProperty = cache(async (id) => {
  try {
    const { data } = await supabase.from('propiedades').select('*').eq('id', id).single();
    return data;
  } catch (e) {
    console.error("Error fetching property on server:", e);
    return null;
  }
});

export async function generateMetadata({ params }) {
  const { id } = await params;
  const property = await getProperty(id);

  if (property) {
    let mainImg = property.imagen_url || property.imagen || '/PR_GLORIETA_DELUXE.png';
    try {
      if (typeof mainImg === 'string' && mainImg.startsWith('[')) {
        const parsed = JSON.parse(mainImg);
        if (parsed.length) mainImg = parsed[0];
      }
    } catch (e) {}

    const titleStr = `${property.titulo} en Chancay y Huaral | Inmobiliaria Norte Chico`;
    const descStr = property.descripcion ? property.descripcion.slice(0, 160) : `Lote e inmueble en venta: ${property.titulo} en Chancay y Huaral. Inmobiliaria Norte Chico.`;

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
    description: 'Especificaciones e información técnica del lote o vivienda en Chancay y Huaral.',
  };
}

export default async function ProyectoPage({ params }) {
  const { id } = await params;
  const initialProperty = await getProperty(id);

  let jsonLd = null;
  if (initialProperty) {
    let mainImg = initialProperty.imagen_url || initialProperty.imagen || 'https://inmobiliarianortechico.pe/PR_GLORIETA_DELUXE.webp';
    try {
      if (typeof mainImg === 'string' && mainImg.startsWith('[')) {
        const parsed = JSON.parse(mainImg);
        if (parsed.length) mainImg = parsed[0];
      }
    } catch (e) {}

    const numericPrice = typeof initialProperty.precio === 'number' ? initialProperty.precio : parseFloat(String(initialProperty.precio).replace(/[^0-9.]/g, '')) || 0;

    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'RealEstateListing',
      'name': initialProperty.titulo,
      'description': initialProperty.descripcion || `Lote o inmueble en Chancay y Huaral: ${initialProperty.titulo}`,
      'url': `https://inmobiliarianortechico.pe/proyecto/${id}`,
      'image': mainImg,
      'datePosted': new Date().toISOString(),
      'offers': {
        '@type': 'Offer',
        'price': numericPrice,
        'priceCurrency': 'USD',
        'availability': initialProperty.estado === 'Vendido' ? 'https://schema.org/Sold' : 'https://schema.org/InStock',
        'validFrom': new Date().toISOString(),
      },
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Chancay, Huaral',
        'addressRegion': 'Lima',
        'addressCountry': 'PE',
      },
    };
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <PropertyDetailView initialProperty={initialProperty} />
    </>
  );
}
