import { redirect } from 'next/navigation';
import { supabase } from '../../../supabaseClient';
import { getPropertySlug } from '../../../utils/slugify';

export default async function ProyectoPage({ params }) {
  const { id } = await params;
  
  try {
    const { data: property } = await supabase.from('propiedades').select('*').eq('id', id).single();
    if (property) {
      const slug = getPropertySlug(property);
      redirect(`/${slug}`);
    }
  } catch (e) {
    console.error("Error redirecting from /proyecto/[id]:", e);
  }

  redirect('/');
}
