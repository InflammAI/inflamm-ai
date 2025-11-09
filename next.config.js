/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // output: 'export', // Disabled to enable API routes
  // distDir: 'out', // Disabled to use default .next directory
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    };
    return config;
  },
  devIndicators: {
    buildActivityPort: 3001
  },
  // Disable Turbopack by using webpack
  experimental: {
    webpackBuildWorker: true
  }
}

module.exports = nextConfig;
