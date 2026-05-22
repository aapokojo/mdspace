/** @type {import('next').NextConfig} */
const nextConfig = {
  // serverComponentsExternalPackages was moved from experimental to root in Next.js 15+
  serverExternalPackages: ['better-sqlite3'],
  
  // Keep webpack config for when using webpack (npm run build --webpack)
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
  
  // Add empty turbopack config to silence the warning
  // Turbopack is the default in Next.js 16+
  turbopack: {},
};

module.exports = nextConfig;
