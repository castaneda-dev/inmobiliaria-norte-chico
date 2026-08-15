export const dynamic = 'force-dynamic';
export const revalidate = 0;

import HomeClient from './HomeClient';
import { createClient } from '../utils/supabase/server';

// Revalidación bajo demanda mediante Server Actions en lugar de revalidación periódica

export default async function HomePage() {
  const supabase = createClient();
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
