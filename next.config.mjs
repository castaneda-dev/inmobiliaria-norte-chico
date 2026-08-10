/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/crm',
        permanent: true,
      },
      {
        source: '/admin.html',
        destination: '/crm',
        permanent: true,
      },
      {
        source: '/dashboard_admin',
        destination: '/crm',
        permanent: true,
      },
      {
        source: '/dashboard_admin.html',
        destination: '/crm',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'jlgnqiedkagkcqoakmom.supabase.co',
      },
    ],
  },
};

export default nextConfig;
