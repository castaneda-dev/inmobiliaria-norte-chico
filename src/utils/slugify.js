export function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function getPropertySlug(property) {
  if (!property) return '';
  const cleanTitle = slugify(property.titulo);
  const tipo = slugify(property.tipo_activo || 'inmueble');
  const ubicacion = slugify(property.ubicacion || property.zonificacion || '');
  
  let parts = [tipo, ubicacion, cleanTitle, property.id].filter(Boolean);
  return parts.join('-').replace(/--+/g, '-').replace(/^-|-$/g, '');
}
