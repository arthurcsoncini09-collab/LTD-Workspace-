/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: false,
    // Drivers nativos de banco ficam fora do bundle e são carregados direto do node_modules.
    serverComponentsExternalPackages: ['pg', 'better-sqlite3'],
  },
};

export default nextConfig;
