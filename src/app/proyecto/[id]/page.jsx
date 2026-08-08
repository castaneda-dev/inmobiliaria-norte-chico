import { supabase } from '../../../supabaseClient';
import PropertyDetailView from '../../../components/PropertyDetailView';

export async function generateMetadata({ params }) {
  const { id } = params;
  try {
    const { data: property } = await supabase.from('propiedades').select('*').eq('id', id).single();
    if (property) {
      let mainImg = property.imagen_url || property.imagen || '/PR_GLORIETA_DELUXE.png';
      try {
        if (typeof mainImg === 'string' && mainImg.startsWith('[')) {
          const parsed = JSON.parse(mainImg);
          if (parsed.length) mainImg = parsed[0];
        }
      } catch (e) {}

      return {
        title: `${property.titulo} | Inmobiliaria Norte Chico`,
        description: property.descripcion || `Conoce las especificaciones de ${property.titulo} en Chancay-Huaral.`,
        openGraph: {
          title: `${property.titulo} | Inmobiliaria Norte Chico`,
          description: property.descripcion || `Conoce las especificaciones de ${property.titulo} en Chancay-Huaral.`,
          images: [{ url: mainImg }],
        },
      };
    }
  } catch (e) {
    console.error("Error generating metadata for property:", e);
  }

  return {
    title: 'Proyecto | Inmobiliaria Norte Chico',
    description: 'Especificaciones e información técnica del lote o vivienda.',
  };
}

export default async function ProyectoPage({ params }) {
  const { id } = params;
  let initialProperty = null;

  try {
    const { data } = await supabase.from('propiedades').select('*').eq('id', id).single();
    initialProperty = data;
  } catch (e) {
    console.error("Error fetching property on server:", e);
  }

  return <PropertyDetailView initialProperty={initialProperty} />;
}
