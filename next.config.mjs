import path from 'path';

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
      // Headers de seguridad globales para todas las rutas
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), payment=(), usb=(), interest-cohort=()' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          {
            key: 'Content-Security-Policy',
            // CSP dinámico: incluye 'unsafe-eval' en desarrollo para Fast Refresh / React Hydration y estricto en producción
            value: process.env.NODE_ENV === 'production'
              ? "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.clarity.ms https://*.clarity.ms https://scripts.clarity.ms https://connect.facebook.net https://maps.googleapis.com https://*.google.com https://*.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://images.unsplash.com https://jlgnqiedkagkcqoakmom.supabase.co https://maps.googleapis.com https://maps.gstatic.com https://*.google.com https://c.clarity.ms https://*.clarity.ms https://c.bing.com https://*.bing.com; connect-src 'self' https://jlgnqiedkagkcqoakmom.supabase.co https://www.clarity.ms https://c.clarity.ms https://*.clarity.ms https://c.bing.com https://*.bing.com https://api.telegram.org https://maps.googleapis.com https://connect.facebook.net; frame-src 'self' https://www.google.com https://maps.google.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
              : "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.clarity.ms https://*.clarity.ms https://scripts.clarity.ms https://connect.facebook.net https://maps.googleapis.com https://*.google.com https://*.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://images.unsplash.com https://jlgnqiedkagkcqoakmom.supabase.co https://maps.googleapis.com https://maps.gstatic.com https://*.google.com https://c.clarity.ms https://*.clarity.ms https://c.bing.com https://*.bing.com; connect-src 'self' https://jlgnqiedkagkcqoakmom.supabase.co https://www.clarity.ms https://c.clarity.ms https://*.clarity.ms https://c.bing.com https://*.bing.com https://api.telegram.org https://maps.googleapis.com https://connect.facebook.net; frame-src 'self' https://www.google.com https://maps.google.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
          }
        ],
      },
      // Headers anti-caché para las rutas de administración y APIs
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
        ],
      },
      {
        source: '/(crm|admin|dashboard_admin)/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
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
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /next[\\/]dist[\\/](client[\\/]polyfills|build[\\/]polyfills)/,
          path.resolve('./src/utils/emptyPolyfill.js')
        )
      );
    }
    return config;
  },
};

export default nextConfig;
