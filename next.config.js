/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,  // Enables the App Router (app/ directory)
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
