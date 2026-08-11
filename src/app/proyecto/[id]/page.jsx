import { redirect } from 'next/navigation';
import { supabase } from '../../../supabaseClient';
import { getPropertySlug } from '../../../utils/slugify';

export default async function ProyectoPage({ params }) {
  const { id } = await params;
  
  let targetSlug = null;
  try {
    const { data: property } = await supabase.from('propiedades').select('*').eq('id', id).single();
    if (property) {
      targetSlug = getPropertySlug(property);
    }
  } catch (e) {
    console.error("Error fetching property for redirect:", e);
  }

  if (targetSlug) {
    redirect(`/${targetSlug}`);
  }

  redirect('/');
}
