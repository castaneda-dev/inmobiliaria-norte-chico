export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Se bloquean las APIs pero sin revelar nombres de rutas admin específicas
        disallow: ['/api/'],
      },
    ],
    sitemap: 'https://inmobiliarianortechico.pe/sitemap.xml',
  };
}
