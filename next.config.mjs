/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/index.html',
      },
    ];
  },
  reactStrictMode: true,
}
export default nextConfig;
