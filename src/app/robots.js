export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/crm/', '/dashboard_admin/', '/api/'],
      },
    ],
    sitemap: 'https://inmobiliarianortechico.pe/sitemap.xml',
  };
}
