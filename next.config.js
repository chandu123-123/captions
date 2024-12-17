/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,  // Enables the App Router (app/ directory)
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  compiler: {
    // Remove all console logs
     removeConsole: process.env.NODE_ENV === "production"
  },
  swcMinify: true, 
  terserOptions: {
    compress: {
      drop_console: true,  // Ensure console logs are removed
    },
    output: {
      comments: false,  // Remove comments in production build
    },
  },
};

module.exports = nextConfig;
