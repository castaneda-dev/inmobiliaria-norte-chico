import { createClient } from './supabase/server';
import { slugify, getPropertySlug } from './slugify';

export async function findProperty(identifier) {
  if (!identifier) return null;
  const cleanId = decodeURIComponent(String(identifier)).trim();
  if (!cleanId) return null;

  try {
    // 1. Si el identificador es un ID estrictamente numérico
    const isNumeric = /^\d+$/.test(cleanId);
    if (isNumeric) {
      const { data, error } = await supabase
        .from('propiedades')
        .select('*')
        .eq('id', parseInt(cleanId, 10))
        .maybeSingle();

      if (!error && data) {
        return data;
      }
    }

    // 2. Traer la lista de propiedades de Supabase para comparar por slug/título
    const { data: properties, error } = await supabase
      .from('propiedades')
      .select('*');

    if (error || !properties || properties.length === 0) {
      return null;
    }

    const targetSlug = slugify(cleanId);

    // a) Coincidencia exacta por slug del título
    let match = properties.find(p => getPropertySlug(p) === targetSlug || slugify(p.titulo) === targetSlug);
    if (match) return match;

    // b) Coincidencia por ID o slug con sufijo ID
    match = properties.find(p => String(p.id) === cleanId || targetSlug.endsWith(`-${p.id}`));
    if (match) return match;

    // c) Coincidencia parcial si el slug está contenido en el título
    match = properties.find(p => {
      const pSlug = slugify(p.titulo);
      return pSlug && targetSlug && (pSlug.includes(targetSlug) || targetSlug.includes(pSlug));
    });
    if (match) return match;

    return null;
  } catch (e) {
    console.error("Error en findProperty:", e);
    return null;
  }
}
