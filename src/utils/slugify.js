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
  return cleanTitle || `propiedad-${property.id}`;
}
