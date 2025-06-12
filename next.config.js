/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Cross-platform compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Allow images from any source during development
  images: {
    unoptimized: true,
  },
  // Static export configuration for Firebase
  output: process.env.EXPORT_MODE === 'static' ? 'export' : undefined,
  // Ensure proper host binding
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '0.0.0.0:3000'],
    },
  },
}

module.exports = nextConfig