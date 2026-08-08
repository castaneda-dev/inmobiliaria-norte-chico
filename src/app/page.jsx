import { supabase } from '../supabaseClient';
import HomeView from '../components/HomeView';

// Force dynamic rendering to always fetch fresh properties from Supabase
export const dynamic = 'force-dynamic';

export default async function Page() {
  let initialProperties = [];

  try {
    const { data, error } = await supabase
      .from('propiedades')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    initialProperties = data || [];
  } catch (err) {
    console.error("Error fetching properties on home server component:", err);
  }

  return <HomeView initialProperties={initialProperties} />;
}
