import HomeClient from './HomeClient';
import { supabase } from '../supabaseClient';

// Revalidación bajo demanda mediante Server Actions en lugar de revalidación periódica

export default async function HomePage() {
  const { data: properties, error } = await supabase
    .from('propiedades')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error("Error fetching properties:", error);
  }

  return (
    <HomeClient initialProperties={properties || []} />
  );
}
