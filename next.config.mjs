import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: process.cwd(),
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
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.clarity.ms https://connect.facebook.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://images.unsplash.com https://jlgnqiedkagkcqoakmom.supabase.co https://*.tile.openstreetmap.org; connect-src 'self' https://jlgnqiedkagkcqoakmom.supabase.co https://www.clarity.ms https://api.telegram.org; frame-ancestors 'none';"
          }
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
