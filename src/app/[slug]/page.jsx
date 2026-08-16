export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { cache } from 'react';
import { notFound } from 'next/navigation';
import PropertyDetailView from '../../components/PropertyDetailView';
import { getPropertySlug } from '../../utils/slugify';
import { findProperty } from '../../utils/propertyResolver';

const getPropertyCached = cache(async (slug) => {
  return await findProperty(slug);
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const property = await getPropertyCached(slug);

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
  const property = await getPropertyCached(slug);

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

  const jsonLdListing = {
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

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Inicio',
        'item': 'https://inmobiliarianortechico.pe/'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Colección Residencial',
        'item': 'https://inmobiliarianortechico.pe/#portafolio'
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': property.titulo,
        'item': `https://inmobiliarianortechico.pe/${propSlug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLdListing, jsonLdBreadcrumb]) }}
      />
      <PropertyDetailView property={property} />
    </>
  );
}
